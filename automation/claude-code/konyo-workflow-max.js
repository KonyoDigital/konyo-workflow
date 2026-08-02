export const meta = {
  name: 'konyo-workflow-max',
  description: 'KONYO WORKFLOW — MAX QUALITY. Opus everywhere · 3-architect judge panel · one-owner-per-file Opus build · 3-skeptic diverse-lens adversarial gate (majority-refute kills a change) · loop-until-dry completeness critic · Opus synthesis. ~10-15x the cost of the cost-scaled workflow — use ONLY for high-stakes / correctness-critical work.',
  whenToUse: 'When being WRONG costs more than tokens: trading-system code (Kai), security audits, production ships you can\'t easily roll back. For routine work use the cost-scaled konyo-workflow instead. It TRIAGES ITSELF FIRST and hard-caps the fleet, so a max run cannot quietly become an all-night one. Pass {task, apply, maxRounds, dryRounds, budgetFloor, grok, force, maxAgents}.',
  phases: [
    { title: 'Triage',          detail: 'right-size the run BEFORE spending a single Opus agent; hard-caps the fleet', model: 'opus' },
    { title: 'Architect panel', detail: '3 Opus architects (risk / correctness / simplest lenses) + Opus judge → one plan', model: 'opus' },
    { title: 'Third-eye',       detail: 'optional Grok consult on the winning plan' },
    { title: 'Build',           detail: 'Opus builds each item, one owner per file', model: 'opus' },
    { title: 'Adversarial gate',detail: '3 Opus skeptics per change (correctness / safety / reproduce); majority-refute → rework', model: 'opus' },
    { title: 'Rework',          detail: 'refuted items rebuilt with the skeptics\' reasons + re-gated', model: 'opus' },
    { title: 'Completeness',    detail: 'Opus critic hunts for missed work; loop until N dry rounds', model: 'opus' },
    { title: 'Render gate',    detail: 'drives the REAL UI — hit-testable controls, no raw placeholders, page still responds; failure BLOCKS the ship', model: 'opus' },
    { title: 'Synthesize',      detail: 'Opus integrates all passing work into ONE final report', model: 'opus' },
  ],
}

// ---------- inputs (args may be an object OR a JSON string — normalize) ----------
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch { A = { task: A } } }
const TASK      = typeof A === 'string' ? A : (A && A.task) || ''
const APPLY     = !!(A && A.apply)                    // false = dry-run (propose diffs only)
const MAXROUNDS = (A && A.maxRounds) || 2   // v3 — a third rework round has never once rescued an item the second did not             // rework rounds for a refuted item
const DRYROUNDS = (A && A.dryRounds) || 1   // v3 — one clean critic round is the signal; the second was a tax             // consecutive "nothing new" critic rounds to stop
const FLOOR     = (A && A.budgetFloor) || 120_000     // higher floor — max stages are expensive
const USE_GROK  = !(A && A.grok === false)
const FORCE     = !!(A && A.force)                    // run the panel even if triage says do it directly
// v2 (Konyo, 2026-08-01: "with triage updated so its not randomly going all night"). A CEILING, not a
// suggestion: max previously had no upper bound at all — the completeness critic could keep finding
// work and the loop kept buying Opus agents to do it. This is the number the run may never exceed,
// whatever triage or the critic wants.
const MAX_AGENTS = (A && A.maxAgents) || 24

// ── v3 — THE CEILING THAT ACTUALLY BINDS ────────────────────────────────────────────────────────
// v2 estimated the spend as `6 + items * (1 + skeptics)` and checked it only BETWEEN completeness
// rounds. It was wrong twice over: rework re-spawns a builder AND its whole skeptic panel per round
// (so an item costs up to MAXROUNDS x 4, not 4), and nothing checked DURING a build at all. Konyo
// capped a run at 34 and it spent 119 agents over 4.1 hours — "cant have this going 4 hour for
// nothing spending so much."
//
// So: stop estimating. COUNT. Every spawn goes through spawn() and the cap is checked at the moment
// of spending, which is the only place a ceiling can honestly hold.
let SPENT = 0
let CEILING_HIT = false
function spawn(prompt, opts, reserved) {
  // v4 — RESERVED spawns may use the last agents. A capped run that cannot afford its own synthesis
  // spends everything and reports NOTHING, which is the worst of both: the Predicter audit burned
  // all 24 and returned final:null, so 23 agents of findings existed only in the journal.
  const cap = reserved ? MAX_AGENTS : Math.max(1, MAX_AGENTS - 2)
  if (SPENT >= cap) {
    if (!CEILING_HIT) {
      CEILING_HIT = true
      log(`⛔ CEILING: ${SPENT}/${MAX_AGENTS} agents spent (2 held back for the report) — refusing further work. ` +
          `What is already done is reported; what is not is listed as unfinished.`)
    }
    return Promise.resolve(null)      // callers already treat null as "this one produced nothing"
  }
  SPENT++
  if (SPENT === Math.floor(MAX_AGENTS * 0.75)) log(`CEILING: ${SPENT}/${MAX_AGENTS} agents spent (75%).`)
  return agent(String(prompt || '') + PACE, opts)
}

if (!TASK) { log('No task. Pass {task:"..."} as args.'); return { error: 'no task' } }

const budgetOK = () => !budget.total || budget.remaining() > FLOOR
const mode = APPLY ? 'APPLY (agents edit files)' : 'DRY-RUN (propose diffs, nothing written)'
// v5 (Konyo: "so it doesnt get stuck hours by default too") — THE PACE CLAUSE.
// v4 bounded how MANY agents run; nothing bounded how long each one takes, and that is where the
// hours actually went: an Opus agent told to be exhaustive on a 38k-line file will happily spend
// forty tool calls on it. Agents honour an explicit budget when given one, so every prompt carries
// the same sentence — attached inside spawn(), so no call site can forget it.
const PACE = '\n\nWORK BRISKLY — this run is budgeted. Prefer targeted grep/sed over reading whole '
  + 'files; stop at the FIRST solid answer rather than the exhaustive one; aim for roughly 12-18 tool '
  + 'calls. A good answer now beats a perfect one in twenty minutes. If you genuinely cannot settle a '
  + 'point inside that budget, SAY SO in your result instead of spending more — an honest "not '
  + 'established" is worth more than a slow guess.'

const LENSES = [
  'CORRECTNESS — does it actually work? walk the logic, hit edge cases, off-by-ones, nulls, races. Assume it is broken and try to prove it.',
  'SAFETY & SCOPE — did it touch anything it should NOT? any regression, broken invariant, security/secret leak, or scope-creep beyond the instruction?',
  'REPRODUCE — trace the SPECIFIC failure this change claims to fix; confirm the change truly addresses that failure and not just its symptom.',
]

const TRIAGE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['shape', 'parallelism', 'cost_of_wrong', 'tier', 'est_agents', 'skeptics', 'why'],
  properties: {
    shape: { type: 'string', enum: ['diagnosis', 'build', 'audit', 'document', 'migration', 'chore'],
      description: 'diagnosis = find ONE root cause (serial). build = implement across files. audit/migration = sweep many places. document = write prose. chore = mechanical.' },
    parallelism: { type: 'string', enum: ['serial', 'parallel'],
      description: 'serial = the work is one thread of reasoning, or the work-list is not known yet. parallel = there is already a list of independent items.' },
    cost_of_wrong: { type: 'string', enum: ['low', 'medium', 'high'],
      description: 'high = data loss, money, security, arithmetic that could silently lie, anything touching live user data. low = cosmetics, docs, tests.' },
    tier: { type: 'string', enum: ['direct', 'light', 'standard', 'max'],
      description: 'direct = tell the caller to just do it, spawn nothing. light = 1-3 agents. standard = one agent per item + gate. max = plus 3 skeptics per item.' },
    est_agents: { type: 'integer', minimum: 0, maximum: 200 },
    skeptics: { type: 'integer', minimum: 0, maximum: 3, description: '0 unless cost_of_wrong is high' },
    work_list_known: { type: 'boolean', description: 'false = scout first with 1-2 agents, THEN fan out over what they found' },
    why: { type: 'string', description: 'one sentence Konyo can read' },
  },
}

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
  return spawn(
    `MAX-QUALITY build agent (Opus). Task context: ${TASK}\n` +
    `You own exactly ONE file: ${item.file}. Instruction: ${item.instruction}\n${act}${rw}\n` +
    `Be rigorous: trace the exact failure you are fixing, handle edge cases, match surrounding style, ` +
    `and in self_check state what you verified (compile/syntax/logic-trace). Return the structured result.`,
    { model: 'opus', effort: 'high', label: `build:${item.file}`, phase: 'Build', schema: BUILD_SCHEMA }
  ).then(b => ({ item, build: b || null })).catch(() => ({ item, build: null }))
}

// 3 independent skeptics, one per lens, run in parallel. Majority-refute (>=2) kills the change.
// v4 — TRIAGE ASKED FOR 1 SKEPTIC AND THIS BOUGHT 3, EVERY TIME. The Predicter audit's triage said
// skeptics:1 with a clear reason ("nothing is applied or deployed here, the human ships") and the
// gate ignored it and ran the full lens panel — 3x the cost of what was asked for, on every item.
// A triage whose decision is overridden is a triage that is only ever theatre.
function activeLenses() {
  const want = (globalThis.__triage && typeof globalThis.__triage.skeptics === 'number')
    ? globalThis.__triage.skeptics : LENSES.length
  return LENSES.slice(0, Math.max(0, Math.min(LENSES.length, want)))
}

function adversarialGate(built) {
  if (!built || !built.build) {
    return Promise.resolve({ ...built, gate: { verdict: 'rework', reasons: ['build produced no output'] } })
  }
  const lenses = activeLenses()
  if (!lenses.length) return Promise.resolve({ ...built, gate: { verdict: 'pass', reasons: ['triage bought no skeptics'] } })
  return parallel(lenses.map((lens, i) => () =>
    spawn(
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
// 2026-08-01 — THE GUARD FIRED ON A NEGATION. Konyo's Predicter audit said "Do NOT edit, create or
// delete any file" — a careful dry-run instruction — and the regex matched "create ... file" and
// refused the whole run. A guard that punishes people for being explicit trains them to be vague.
// So: strip the NEGATED clauses first, then look for a genuine file-shaped demand in what is left.
function wantsAFile(task) {
  const t = String(task || "")
    // drop everything from a negation up to the end of that clause
    .replace(/\b(do not|don't|never|no need to|without)\b[^.;\n]*/gi, " ")
  // [^.] could never cross a period, so ".md" — the most literal file-shaped ask there is — was
  // unmatchable in the original guard. Same line, minus that blind spot.
  return /\b(write|create|save|author|produce)\b[^\n]{0,60}?\b(file|document|\.md|report to disk)\b/i.test(t)
}

// apply:false means agents may write NOTHING. If the task also demands files, no agent can satisfy
// its brief, every item fails its gate, and each failure escalates with three fresh skeptics — the
// agent counter climbs instead of falling. It cost ~106 agents and 2h30m once. One line stops it.
if (!APPLY && wantsAFile(TASK)) {
  log('⚠ REFUSED: DRY-RUN (apply:false) with a file-shaped deliverable — nothing could satisfy it.');
  log('  Re-run with apply:true, or ask for the content in the RESULT instead of on disk.');
  return { refused: 'dry-run with a file-shaped deliverable', fix: 'apply:true, or drop the file deliverable' }
}

// ================= RUN =================
log(`KONYO WORKFLOW — MAX · ${mode} · ${DRYROUNDS} dry-rounds · floor ${Math.round(FLOOR / 1000)}k`)

// 1) ARCHITECT PANEL — 3 diverse lenses in parallel, then an Opus judge merges the best plan.
phase('Triage')
if (!APPLY && wantsAFile(TASK)) {
  log('⚠ TRIAGE REFUSED: this is a DRY-RUN (apply:false) but the task asks agents to WRITE A FILE.')
  log('  Nothing can satisfy that, so every item would fail its gate and rework would multiply.')
  log('  Re-run with apply:true, or ask for the content in the RESULT instead of on disk.')
  return { refused: 'dry-run with a file-shaped deliverable', fix: 'apply:true, or drop the file deliverable' }
}

const triage = await spawn(
  `You are TRIAGE for the KONYO WORKFLOW — MAX. Decide how much machinery this task deserves — the point ` +
  `is to NOT spend a fleet on work that one process does better.\n\n` +
  `Rules of thumb, from real runs:\n` +
  `- Finding ONE root cause (a red test, a bug, "why is X broken") is SERIAL. Instrument, measure, fix. ` +
  `Fan-out gives N opinions that must each be checked — it is slower AND dearer. tier=direct.\n` +
  `- A sweep with a KNOWN list (audit 100 files, migrate 40 call sites) is genuinely parallel. tier=standard. Reserve tier=max for work where being wrong is expensive.\n` +
  `- Writing a document is serial thinking plus ONE adversarial read. tier=light. Never one skeptic per section.\n` +
  `- Skeptics are bought ONLY when being wrong is expensive: data loss, money, security, or arithmetic ` +
  `that could silently lie. Cosmetics and docs get none.\n` +
  `- If the work-list is not known yet, say work_list_known:false — scout with 1-2 agents first, then fan out.\n\n` +
  `Be honest and stingy. Recommending "direct" is a SUCCESS, not a failure.\n\nTASK: ${TASK}`,
  { model: 'opus', effort: 'medium', phase: 'Triage', label: 'triage', schema: TRIAGE_SCHEMA }
).catch(() => null)

if (triage) {
  const sk = triage.skeptics
  log(`TRIAGE → ${triage.tier.toUpperCase()} · ${triage.shape} · ${triage.parallelism} · cost-of-wrong ${triage.cost_of_wrong}`)
  log(`  ≈${triage.est_agents} agents, ${sk} skeptic(s) per item — ${triage.why}`)
  if (triage.work_list_known === false) log('  (work-list unknown — scout first, then fan out over what is found)')
  if (triage.tier === 'direct' && !FORCE) {
    log('⛔ TRIAGE SAYS DO THIS DIRECTLY — spawning nothing.')
    log(`  ${triage.why}`)
    log('  If you disagree, re-run with force:true.')
    return { refused: 'triage says direct', triage, advice: 'do it in the main loop; a fleet would be slower and dearer here' }
  }
  globalThis.__triage = { ...triage, skeptics: sk }
}

// THE CEILING. Whatever triage asked for, this run may not exceed MAX_AGENTS — the completeness
// critic loops until dry, and "until dry" with no bound is exactly how a max run becomes an
// all-night one. Announced, so the number is never a surprise in the morning.
globalThis.__maxAgents = MAX_AGENTS
globalThis.__spent = 0
log(`CEILING → this run may spend at most ${MAX_AGENTS} agents, whatever triage or the critic wants.`)

phase('Architect panel')
const ANGLES = [
  'RISK-FIRST: order items by blast radius; isolate the highest-risk change and make it the most defensively specified.',
  'CORRECTNESS-FIRST: decompose so each item has a single, testable, unambiguous fix; no item bundles two concerns.',
  'SIMPLEST-ROBUST: the smallest set of one-owner-per-file changes that fully solves it with no scope creep.',
]
const candidatePlans = (await parallel(ANGLES.map((angle, i) => () =>
  spawn(
    `ARCHITECT (${angle}) for a MAX-QUALITY fix run. Decompose this task into independent work items, ` +
    `ONE OWNER PER FILE (no file appears twice). Read the repo to ground paths. Tag each item's risk.\n\nTASK: ${TASK}`,
    { model: 'opus', effort: 'high', label: `architect:${i + 1}`, phase: 'Architect panel', schema: PLAN_SCHEMA }
  ).catch(() => null)
))).filter(Boolean)

if (!candidatePlans.length) { log('No architect produced a plan.'); return { error: 'no plan' } }

const plan = await spawn(
  `JUDGE + MERGE. You are given ${candidatePlans.length} candidate decomposition plans for the same task. ` +
  `Produce the single BEST one-owner-per-file plan: take the sharpest decomposition, graft the best items from the others, ` +
  `drop redundancy, ensure NO file is owned twice, and every item is a self-contained fix. Explain why in "why".\n\n` +
  `TASK: ${TASK}\n\nCANDIDATES:\n${candidatePlans.map((p, i) => `--- Plan ${i + 1} (${p.version_label}) ---\n` +
    p.items.map(it => `- [${it.risk || '?'}] ${it.file}: ${it.instruction}`).join('\n')).join('\n\n')}`,
  { model: 'opus', effort: 'high', phase: 'Architect panel', schema: JUDGE_SCHEMA }
)
if (!plan || !plan.items) { log(plan === null ? 'CEILING: no budget for the judge.' : 'Judge produced no plan.'); return { error: 'no plan', ceiling: { cap: MAX_AGENTS, spent: SPENT, hit: CEILING_HIT } } }

// one owner per file
const seen = new Set()
let items = plan.items.filter(it => { if (seen.has(it.file)) return false; seen.add(it.file); return true })

// THE CEILING, ENFORCED. A number that does not bind is decoration. Each item costs 1 builder +
// SKEPTICS skeptics, so the fleet size is knowable BEFORE it is bought — and trimming here, at the
// plan, is honest in a way that dying halfway through the build is not.
// v4 — SIZE ON THE TYPICAL COST, NOT THE WORST CASE. v3 sized every item at MAXROUNDS x (1+3
// lenses) = 8 agents, so a 24-cap fit TWO lanes and trimmed 19 of 22 files off a 30-module audit,
// then returned final:null. That is not a ceiling, it is a muzzle. Most items pass first time and
// buy no rework at all — and the runtime counter in spawn() is the REAL bound, so the planner does
// not need to double-protect. Size on one builder + the skeptics triage actually asked for, and
// keep RESERVE back so the run can always afford to REPORT what it did.
const RESERVE = 2                                   // synthesis + one spare
const perItem = 1 + activeLenses().length
const roomForItems = Math.max(1, Math.floor((MAX_AGENTS - SPENT - RESERVE) / Math.max(1, perItem)))
if (items.length > roomForItems) {
  log(`CEILING: plan had ${items.length} items; ${roomForItems} fit under the ${MAX_AGENTS}-agent cap — the rest are REPORTED, not silently dropped.`)
  globalThis.__trimmed = items.slice(roomForItems).map(i => i.file)
  items = items.slice(0, roomForItems)
}
log(`Winning plan "${plan.version_label}": ${items.length} items — ${plan.why || ''}`)

// 2) THIRD-EYE
if (USE_GROK) {
  phase('Third-eye')
  const eye = await spawn(
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
while (dry < DRYROUNDS && critRound < 3 && budgetOK()) {   // v5 — 6 rounds was hours of tail for diminishing finds
  // the critic can always find one more thing, and each gap costs a builder plus its skeptics —
  // so the loop asks the REAL counter, not an estimate of it
  if (SPENT >= MAX_AGENTS) { log(`CEILING: stopping the completeness loop at ${SPENT}/${MAX_AGENTS}.`); break }
  critRound++
  const passed = results.filter(r => r && r.item && r.gate && r.gate.verdict === 'pass')
  const crit = await spawn(
    `COMPLETENESS CRITIC (Opus). Task: ${TASK}\nChanges made so far (passed the skeptic panel):\n` +
    passed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
    `\nWhat is MISSING to fully and correctly satisfy the task? Look for: an untouched file that also needs the fix, ` +
    `an edge case no item covered, a claim not yet verified, a follow-on the changes now require. ` +
    `If nothing material is missing, done=true with empty missing[]. Only list REAL, actionable gaps (one owner per file).`,
    { model: 'opus', effort: 'medium', phase: 'Completeness', schema: CRITIC_SCHEMA }   // v5 — it hunts GAPS, not proofs
  ).catch(() => ({ done: true, missing: [] }))
  if (!crit) { log('CEILING: no budget left for the completeness critic — stopping.'); break }
  const fresh = (crit.missing || []).filter(m => !seen.has(m.file))
  if (crit.done || !fresh.length) { dry++; log(`Completeness: dry round ${dry}/${DRYROUNDS}`); continue }
  dry = 0
  fresh.forEach(m => seen.add(m.file))
  log(`Completeness: critic found ${fresh.length} gap(s) — building`)
  const more = await buildAndGate(fresh.map((m, i) => ({ id: `crit${critRound}-${i}`, file: m.file, instruction: m.instruction })), 'Completeness')
  results = results.concat(more)
}

// 6.5) THE RENDER GATE — v6 (Konyo, 2026-08-02: "why is the no rendered-UI check?")
// ────────────────────────────────────────────────────────────────────────────────────────────────
// Because there wasn't one. A 20-version UI arc passed triage, three architects, one-owner builds,
// a 3-skeptic panel and a completeness critic — and shipped an infinite MutationObserver loop that
// FROZE THE WHOLE APP, live, for two versions. Every gate the project had was green: parity,
// modules parsing, i18n complete. None of them can see a painted page.
//
// So: if the project has a way to drive its own UI, this run MUST use it, and a failure here is a
// ship-blocker, not a note. This is the phase that would have caught it.
let renderGate = null
if (APPLY) {
  phase('Render gate')
  renderGate = await spawn(
    `RENDER GATE (Opus). The build phase has finished. Task: ${TASK}\n\n` +
    `YOUR JOB: prove the UI still WORKS WHEN PAINTED — not that it parses.\n` +
    `0. CI FIRST — CHECK BEFORE YOU SPAWN ANYTHING. If the project runs its UI checks in CI (a ` +
    `.github/workflows/*.yml that drives a browser), that is the gate. Do NOT launch a browser on ` +
    `the user's machine: read the verdict instead (\`gh run list --workflow="<name>" -L 3\`, ` +
    `\`gh run view <id> --log-failed\`). A fleet of agents each starting chromium is how a laptop ` +
    `gets saturated, and Konyo has already had that happen once. Only fall through to running it ` +
    `locally if there is NO CI gate at all.\n` +
    `1. Otherwise find the project's own UI verification: an npm script (test:render / e2e / test), a ` +
    `playwright/cypress config, a spec dir, or a documented "browser verify floor". USE IT. Run it.\n` +
    `2. If one exists, run it and report the true result. Do NOT edit a test to make it pass; if a ` +
    `test is genuinely wrong, say so and explain why in notes.\n` +
    `3. If NONE exists, say so plainly (available:false) and list the specific checks that are ` +
    `missing — do not invent a passing result, and do not install a framework unasked.\n` +
    `4. Whatever tooling exists, check at minimum: does the app boot without console errors; is ` +
    `every visible control actually hit-testable (elementFromPoint, after scrolling it into view); ` +
    `does any unfilled {placeholder} or raw i18n key render as text; does the page still respond ` +
    `after ~1s of idle (an infinite observer/timer loop shows up as an unresponsive page, NOT as an ` +
    `error); does a second open of a modal keep its controls.\n` +
    `NEVER start a long-lived server on a port the user's own app uses; kill anything you start.\n` +
    `Report failures as failures. A green report you did not actually run is the worst outcome here.`,
    { model: 'opus', effort: 'high', phase: 'Render gate', schema: {
        type: 'object', additionalProperties: false,
        required: ['available', 'ran', 'passed', 'failures', 'notes'],
        properties: {
          available: { type: 'boolean', description: 'does the project have UI verification tooling at all' },
          ran:       { type: 'string',  description: 'the exact command run, or why none was' },
          passed:    { type: 'boolean', description: 'false if ANY check failed or none could run' },
          failures:  { type: 'array', items: { type: 'string' }, description: 'one line per real failure' },
          notes:     { type: 'string', description: 'what a human should eyeball that no test covers' },
        },
      } }
  ).catch(() => null)
  if (renderGate && renderGate.available && !renderGate.passed) {
    log(`⛔ RENDER GATE FAILED — ${renderGate.failures.length} failure(s). This is a SHIP BLOCKER.`)
    renderGate.failures.slice(0, 8).forEach(f => log(`   · ${f}`))
  } else if (renderGate && !renderGate.available) {
    log(`⚠ RENDER GATE: the project has no UI verification. Nothing here has been seen painted.`)
  } else if (renderGate) {
    log(`✅ Render gate passed (${renderGate.ran}).`)
  }
}

// 7) SYNTHESIZE
phase('Synthesize')
results = results.filter(Boolean).filter(r => r && r.item)   // v5 — a ceiling-refused item is not a failure to report on
const passed = results.filter(r => r.gate && r.gate.verdict === 'pass')
const failed = results.filter(r => !r.gate || r.gate.verdict !== 'pass')
const final = await spawn(
  `SYNTHESIZER (Opus), MAX-QUALITY run, mode=${mode}. Task: ${TASK}\nVersion: ${plan.version_label}.\n` +
  `PASSED the 3-skeptic panel (${passed.length}):\n` + passed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
  `\nSTILL FAILING (${failed.length}):\n` + failed.map(r => `- ${r.item.file}: ${(r.gate && r.gate.reasons || []).join('; ')}`).join('\n') +
  (renderGate ? `\nRENDER GATE: available=${renderGate.available} ran=${renderGate.ran} passed=${renderGate.passed}` +
    (renderGate.failures.length ? `\n  FAILURES:\n` + renderGate.failures.map(f => '  - ' + f).join('\n') : '') +
    (renderGate.notes ? `\n  eyeball: ${renderGate.notes}` : '') +
    `\nIf the render gate FAILED, the headline must say the ship is BLOCKED and why — do not report success over a broken screen. ` +
    `If it was unavailable, the headline must say nothing was seen painted.` : '\nRENDER GATE: not run (dry-run).') +
  `\nWrite the single final report. headline = the ONE-line ping for Konyo.`,
  { model: 'opus', effort: 'high', phase: 'Synthesize', schema: FINAL_SCHEMA }
, true)

return {
  version: plan.version_label,
  mode,
  quality: 'MAX (Opus everywhere · 3-architect judge panel · 3-skeptic adversarial gate · loop-until-dry)',
  tokens_spent: budget.total ? budget.spent() : null,
  passed: passed.length,
  failed: failed.length,
  // ★ a capped run must never READ as a complete one. If the ceiling trimmed the plan or stopped the
  // completeness loop, that is the first thing the report says — the alternative is a green summary
  // over work nobody did.
  ceiling: {
    cap: MAX_AGENTS,
    spent: SPENT,
    hitDuringCompleteness: CEILING_HIT,
    trimmedFromPlan: globalThis.__trimmed || [],
    complete: !CEILING_HIT && !(globalThis.__trimmed || []).length,
  },
  triage: globalThis.__triage || null,
  render_gate: renderGate,
  final,
}
