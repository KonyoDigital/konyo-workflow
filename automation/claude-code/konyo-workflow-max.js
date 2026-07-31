export const meta = {
  name: 'konyo-workflow-max',
  description: 'KONYO WORKFLOW — MAX QUALITY. Opus everywhere · 3-architect judge panel · one-owner-per-file Opus build · 3-skeptic diverse-lens adversarial gate (majority-refute kills a change) · loop-until-dry completeness critic · Opus synthesis. ~10-15x the cost of the cost-scaled workflow — use ONLY for high-stakes / correctness-critical work.',
  whenToUse: 'When being WRONG costs more than tokens: trading-system code (Kai), security audits, production ships you can\'t easily roll back. For routine work use the cost-scaled konyo-workflow instead. Pass {task, apply, maxRounds, dryRounds, budgetFloor, grok}.',
  phases: [
    { title: 'Architect panel', detail: '3 Opus architects (risk / correctness / simplest lenses) + Opus judge → one plan', model: 'opus' },
    { title: 'Third-eye',       detail: 'optional Grok consult on the winning plan' },
    { title: 'Build',           detail: 'Opus builds each item, one owner per file', model: 'opus' },
    { title: 'Adversarial gate',detail: '3 Opus skeptics per change (correctness / safety / reproduce); majority-refute → rework', model: 'opus' },
    { title: 'Rework',          detail: 'refuted items rebuilt with the skeptics\' reasons + re-gated', model: 'opus' },
    { title: 'Completeness',    detail: 'Opus critic hunts for missed work; loop until N dry rounds', model: 'opus' },
    { title: 'Synthesize',      detail: 'Opus integrates all passing work into ONE final report', model: 'opus' },
  ],
}

// ---------- inputs (args may be an object OR a JSON string — normalize) ----------
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch { A = { task: A } } }
const TASK      = typeof A === 'string' ? A : (A && A.task) || ''
const APPLY     = !!(A && A.apply)                    // false = dry-run (propose diffs only)
const MAXROUNDS = (A && A.maxRounds) || 3             // rework rounds for a refuted item
const DRYROUNDS = (A && A.dryRounds) || 2             // consecutive "nothing new" critic rounds to stop
const FLOOR     = (A && A.budgetFloor) || 120_000     // higher floor — max stages are expensive
const USE_GROK  = !(A && A.grok === false)

if (!TASK) { log('No task. Pass {task:"..."} as args.'); return { error: 'no task' } }

const budgetOK = () => !budget.total || budget.remaining() > FLOOR
const mode = APPLY ? 'APPLY (agents edit files)' : 'DRY-RUN (propose diffs, nothing written)'
const LENSES = [
  'CORRECTNESS — does it actually work? walk the logic, hit edge cases, off-by-ones, nulls, races. Assume it is broken and try to prove it.',
  'SAFETY & SCOPE — did it touch anything it should NOT? any regression, broken invariant, security/secret leak, or scope-creep beyond the instruction?',
  'REPRODUCE — trace the SPECIFIC failure this change claims to fix; confirm the change truly addresses that failure and not just its symptom.',
]

// ---------- schemas ----------
const PLAN_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['version_label', 'summary', 'items'],
  properties: {
    version_label: { type: 'string' },
    summary:       { type: 'string' },
    items: {
      type: 'array', minItems: 1, maxItems: 30,
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'file', 'instruction'],
        properties: {
          id:          { type: 'string' },
          file:        { type: 'string', description: 'the ONE file this item owns' },
          instruction: { type: 'string', description: 'self-contained spec for the owner' },
          risk:        { type: 'string', enum: ['low', 'medium', 'high'], description: 'blast radius if done wrong' },
        },
      },
    },
  },
}
const JUDGE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['version_label', 'summary', 'items', 'why'],
  properties: {
    version_label: { type: 'string' },
    summary:       { type: 'string' },
    why:           { type: 'string', description: 'why this merged plan beats the 3 candidates' },
    items: PLAN_SCHEMA.properties.items,
  },
}
const BUILD_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file', 'summary', 'changes', 'self_check'],
  properties: {
    file:       { type: 'string' },
    summary:    { type: 'string' },
    changes:    { type: 'string', description: 'unified diff (dry-run) or description of edits applied' },
    self_check: { type: 'string', description: 'what you verified (compiled? traced the fix?)' },
  },
}
const SKEPTIC_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['refuted', 'severity', 'reason'],
  properties: {
    refuted:  { type: 'boolean', description: 'true if this change is wrong/unsafe/incomplete through your lens' },
    severity: { type: 'string', enum: ['none', 'minor', 'major', 'blocking'] },
    reason:   { type: 'string' },
  },
}
const CRITIC_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['done', 'missing'],
  properties: {
    done:    { type: 'boolean', description: 'true if nothing material is missing' },
    missing: {
      type: 'array', maxItems: 12,
      items: {
        type: 'object', additionalProperties: false,
        required: ['file', 'instruction'],
        properties: { file: { type: 'string' }, instruction: { type: 'string' } },
      },
    },
  },
}
const FINAL_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['version_label', 'headline', 'shipped', 'follow_ups'],
  properties: {
    version_label: { type: 'string' },
    headline:      { type: 'string' },
    shipped:       { type: 'array', items: { type: 'string' } },
    follow_ups:    { type: 'array', items: { type: 'string' } },
  },
}

// ---------- agents ----------
function buildAgent(item, reworkNote) {
  const act = APPLY
    ? `Make the edit directly to ${item.file}. Touch NO other file — you own this one.`
    : `Do NOT write anything. Return the change as a unified diff in "changes".`
  const rw = reworkNote ? `\n\nSKEPTICS REFUTED THE LAST ATTEMPT — address ALL of this: ${reworkNote}` : ''
  return agent(
    `MAX-QUALITY build agent (Opus). Task context: ${TASK}\n` +
    `You own exactly ONE file: ${item.file}. Instruction: ${item.instruction}\n${act}${rw}\n` +
    `Be rigorous: trace the exact failure you are fixing, handle edge cases, match surrounding style, ` +
    `and in self_check state what you verified (compile/syntax/logic-trace). Return the structured result.`,
    { model: 'opus', effort: 'high', label: `build:${item.file}`, phase: 'Build', schema: BUILD_SCHEMA }
  ).then(b => ({ item, build: b })).catch(() => ({ item, build: null }))
}

// 3 independent skeptics, one per lens, run in parallel. Majority-refute (>=2) kills the change.
function adversarialGate(built) {
  if (!built || !built.build) {
    return Promise.resolve({ ...built, gate: { verdict: 'rework', reasons: ['build produced no output'] } })
  }
  return parallel(LENSES.map((lens, i) => () =>
    agent(
      `ADVERSARIAL SKEPTIC — lens: ${lens}\nTask: ${TASK}\nFile: ${built.item.file}\n` +
      `Instruction it was meant to satisfy: ${built.item.instruction}\n` +
      `Proposed change:\n${built.build.changes}\nBuilder's self-check: ${built.build.self_check}\n` +
      `Through YOUR lens only, try to REFUTE this change. Default to refuted=true if you are not convinced it is correct AND safe AND complete.`,
      { model: 'opus', effort: 'high', label: `skeptic:${i + 1}:${built.item.file}`, phase: 'Adversarial gate', schema: SKEPTIC_SCHEMA }
    ).catch(() => ({ refuted: true, severity: 'major', reason: 'skeptic errored' }))
  )).then(votes => {
    const v = votes.filter(Boolean)
    const refutedN = v.filter(x => x.refuted).length
    const verdict = refutedN >= 2 ? 'rework' : 'pass'
    const reasons = v.filter(x => x.refuted).map(x => x.reason)
    return { ...built, gate: { verdict, refutedN, reasons } }
  })
}

async function buildAndGate(items, phaseLabel) {
  // pipeline: each item builds then immediately faces its 3-skeptic panel (no barrier)
  let results = await pipeline(items, it => buildAgent(it), built => adversarialGate(built))
  results = results.filter(Boolean)
  // rework loop for refuted items
  let round = 1
  while (round < MAXROUNDS && budgetOK()) {
    const failing = results.filter(r => r.gate && r.gate.verdict === 'rework')
    if (!failing.length) break
    round++
    log(`${phaseLabel}: round ${round} — ${failing.length} change(s) refuted by the skeptic panel; rebuilding`)
    const redone = await pipeline(
      failing,
      r => buildAgent(r.item, (r.gate.reasons || []).join(' | ')),
      built => adversarialGate(built)
    )
    const byFile = new Map(results.map(r => [r.item.file, r]))
    for (const r of redone.filter(Boolean)) byFile.set(r.item.file, r)
    results = [...byFile.values()]
  }
  return results
}

// HARD RULE (learned on a real run): a DRY-RUN must never be given a FILE-SHAPED deliverable.
// apply:false means agents may write NOTHING. If the task also demands files, no agent can satisfy
// its brief, every item fails its gate, and each failure escalates with three fresh skeptics — the
// agent counter climbs instead of falling. It cost ~106 agents and 2h30m once. One line stops it.
if (!APPLY && /\b(write|create|save|author|produce)\b[^.]{0,40}\b(file|document|\.md|report to disk)\b/i.test(TASK)) {
  log('⚠ REFUSED: DRY-RUN (apply:false) with a file-shaped deliverable — nothing could satisfy it.');
  log('  Re-run with apply:true, or ask for the content in the RESULT instead of on disk.');
  return { refused: 'dry-run with a file-shaped deliverable', fix: 'apply:true, or drop the file deliverable' }
}

// ================= RUN =================
log(`KONYO WORKFLOW — MAX · ${mode} · ${DRYROUNDS} dry-rounds · floor ${Math.round(FLOOR / 1000)}k`)

// 1) ARCHITECT PANEL — 3 diverse lenses in parallel, then an Opus judge merges the best plan.
phase('Architect panel')
const ANGLES = [
  'RISK-FIRST: order items by blast radius; isolate the highest-risk change and make it the most defensively specified.',
  'CORRECTNESS-FIRST: decompose so each item has a single, testable, unambiguous fix; no item bundles two concerns.',
  'SIMPLEST-ROBUST: the smallest set of one-owner-per-file changes that fully solves it with no scope creep.',
]
const candidatePlans = (await parallel(ANGLES.map((angle, i) => () =>
  agent(
    `ARCHITECT (${angle}) for a MAX-QUALITY fix run. Decompose this task into independent work items, ` +
    `ONE OWNER PER FILE (no file appears twice). Read the repo to ground paths. Tag each item's risk.\n\nTASK: ${TASK}`,
    { model: 'opus', effort: 'high', label: `architect:${i + 1}`, phase: 'Architect panel', schema: PLAN_SCHEMA }
  ).catch(() => null)
))).filter(Boolean)

if (!candidatePlans.length) { log('No architect produced a plan.'); return { error: 'no plan' } }

const plan = await agent(
  `JUDGE + MERGE. You are given ${candidatePlans.length} candidate decomposition plans for the same task. ` +
  `Produce the single BEST one-owner-per-file plan: take the sharpest decomposition, graft the best items from the others, ` +
  `drop redundancy, ensure NO file is owned twice, and every item is a self-contained fix. Explain why in "why".\n\n` +
  `TASK: ${TASK}\n\nCANDIDATES:\n${candidatePlans.map((p, i) => `--- Plan ${i + 1} (${p.version_label}) ---\n` +
    p.items.map(it => `- [${it.risk || '?'}] ${it.file}: ${it.instruction}`).join('\n')).join('\n\n')}`,
  { model: 'opus', effort: 'high', phase: 'Architect panel', schema: JUDGE_SCHEMA }
)
if (!plan || !plan.items) { log('Judge produced no plan.'); return { error: 'no plan' } }

// one owner per file
const seen = new Set()
let items = plan.items.filter(it => { if (seen.has(it.file)) return false; seen.add(it.file); return true })
log(`Winning plan "${plan.version_label}": ${items.length} items — ${plan.why || ''}`)

// 2) THIRD-EYE
if (USE_GROK) {
  phase('Third-eye')
  const eye = await agent(
    `Use the Grok MCP tool (find it via ToolSearch, e.g. mcp__grok-mcp__chat) for an independent second opinion ` +
    `on this MAX-QUALITY plan for "${TASK}":\n` + items.map(i => `- ${i.file}: ${i.instruction}`).join('\n') +
    `\nReturn Grok's top concerns or "no concerns"; "grok unavailable" if it can't be reached.`,
    { agentType: 'general-purpose', model: 'sonnet', effort: 'low', label: 'grok:third-eye', phase: 'Third-eye' }
  ).catch(() => null)
  if (eye) log(`Third-eye: ${String(eye).slice(0, 400)}`)
}

// 3+4+5) BUILD → ADVERSARIAL GATE → REWORK
phase('Build')
let results = await buildAndGate(items, 'Build')

// 6) COMPLETENESS CRITIC — loop until DRYROUNDS consecutive "nothing missing"
phase('Completeness')
let dry = 0, critRound = 0
while (dry < DRYROUNDS && critRound < 6 && budgetOK()) {
  critRound++
  const passed = results.filter(r => r.gate && r.gate.verdict === 'pass')
  const crit = await agent(
    `COMPLETENESS CRITIC (Opus). Task: ${TASK}\nChanges made so far (passed the skeptic panel):\n` +
    passed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
    `\nWhat is MISSING to fully and correctly satisfy the task? Look for: an untouched file that also needs the fix, ` +
    `an edge case no item covered, a claim not yet verified, a follow-on the changes now require. ` +
    `If nothing material is missing, done=true with empty missing[]. Only list REAL, actionable gaps (one owner per file).`,
    { model: 'opus', effort: 'high', phase: 'Completeness', schema: CRITIC_SCHEMA }
  ).catch(() => ({ done: true, missing: [] }))
  const fresh = (crit.missing || []).filter(m => !seen.has(m.file))
  if (crit.done || !fresh.length) { dry++; log(`Completeness: dry round ${dry}/${DRYROUNDS}`); continue }
  dry = 0
  fresh.forEach(m => seen.add(m.file))
  log(`Completeness: critic found ${fresh.length} gap(s) — building`)
  const more = await buildAndGate(fresh.map((m, i) => ({ id: `crit${critRound}-${i}`, file: m.file, instruction: m.instruction })), 'Completeness')
  results = results.concat(more)
}

// 7) SYNTHESIZE
phase('Synthesize')
const passed = results.filter(r => r.gate && r.gate.verdict === 'pass')
const failed = results.filter(r => !r.gate || r.gate.verdict !== 'pass')
const final = await agent(
  `SYNTHESIZER (Opus), MAX-QUALITY run, mode=${mode}. Task: ${TASK}\nVersion: ${plan.version_label}.\n` +
  `PASSED the 3-skeptic panel (${passed.length}):\n` + passed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
  `\nSTILL FAILING (${failed.length}):\n` + failed.map(r => `- ${r.item.file}: ${(r.gate && r.gate.reasons || []).join('; ')}`).join('\n') +
  `\nWrite the single final report. headline = the ONE-line ping for Konyo.`,
  { model: 'opus', effort: 'high', phase: 'Synthesize', schema: FINAL_SCHEMA }
)

return {
  version: plan.version_label,
  mode,
  quality: 'MAX (Opus everywhere · 3-architect judge panel · 3-skeptic adversarial gate · loop-until-dry)',
  tokens_spent: budget.total ? budget.spent() : null,
  passed: passed.length,
  failed: failed.length,
  final,
}
