export const meta = {
  name: 'konyo-workflow',
  description: 'KONYO WORKFLOW, cost-scaled: Opus architects, Haiku/Sonnet build one-owner-per-file, Fable gates every merge, failed items escalate up the ladder, Opus synthesizes ONE final report.',
  whenToUse: 'Big-arc feature/refactor work where you want the cheapest capable model on each job and a Fable quality gate on everything. Pass the task as args (string) or {task, apply, maxRounds, budgetFloor, grok}.',
  phases: [
    { title: 'Architect',   detail: 'Opus decomposes the task into one-owner-per-file work items + tier',   model: 'opus' },
    { title: 'Third-eye',   detail: 'optional Grok consult on the plan' },
    { title: 'Build+Gate',  detail: 'Haiku/Sonnet build each item; Fable gates it immediately (no barrier)' },
    { title: 'Rework',      detail: 'failed items escalate one tier up and re-gate, version-per-round' },
    { title: 'Synthesize',  detail: 'Opus integrates all passing work into ONE final report' },
  ],
}

// ---------- inputs ----------
// args may arrive as a real object OR as a JSON-encoded string (the harness sometimes
// stringifies it, which silently dropped apply/maxRounds before). Normalize to an object.
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch { A = { task: A } } }
const TASK      = typeof A === 'string' ? A : (A && A.task) || ''
const APPLY     = !!(A && A.apply)                 // false = dry-run (propose diffs, write nothing). true = agents edit files.
const MAXROUNDS = (A && A.maxRounds) || 3
const FLOOR     = (A && A.budgetFloor) || 60_000   // stop opening new rounds under this many tokens remaining
const USE_GROK  = !(A && A.grok === false)

if (!TASK) { log('No task given. Pass a task string or {task:"..."} as args.'); return { error: 'no task' } }

const LADDER = ['haiku', 'sonnet', 'opus']               // the cost-scaling ladder
const bump = (tier) => LADDER[Math.min(LADDER.indexOf(tier) + 1, LADDER.length - 1)] || 'sonnet'
const effortFor = (tier) => tier === 'opus' ? 'high' : tier === 'sonnet' ? 'medium' : 'low'
const budgetOK = () => !budget.total || budget.remaining() > FLOOR
const mode = APPLY ? 'APPLY (agents edit files)' : 'DRY-RUN (agents propose diffs, nothing written)'

// ---------- schemas ----------
const PLAN_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['version_label', 'summary', 'items'],
  properties: {
    version_label: { type: 'string', description: 'short version/round label, e.g. "v-auth-refactor-r1"' },
    summary:       { type: 'string' },
    items: {
      type: 'array', minItems: 1, maxItems: 24,
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'file', 'kind', 'tier', 'instruction'],
        properties: {
          id:          { type: 'string' },
          file:        { type: 'string', description: 'the ONE file this item owns (relative path)' },
          kind:        { type: 'string', enum: ['bulk', 'code', 'design'] },
          tier:        { type: 'string', enum: ['haiku', 'sonnet', 'opus'], description: 'cheapest model that can do it: bulk→haiku, code→sonnet, design/cross-cutting→opus' },
          instruction: { type: 'string', description: 'self-contained spec for the owner agent' },
        },
      },
    },
  },
}
const BUILD_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file', 'summary', 'changes', 'self_check'],
  properties: {
    file:       { type: 'string' },
    summary:    { type: 'string' },
    changes:    { type: 'string', description: 'unified diff (dry-run) or description of edits applied' },
    self_check: { type: 'string', description: 'what you verified before handing off' },
  },
}
const GATE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'severity', 'reason'],
  properties: {
    verdict:  { type: 'string', enum: ['pass', 'rework'] },
    severity: { type: 'string', enum: ['none', 'minor', 'major', 'blocking'] },
    reason:   { type: 'string' },
  },
}
const FINAL_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['version_label', 'headline', 'shipped', 'follow_ups'],
  properties: {
    version_label: { type: 'string' },
    headline:      { type: 'string', description: 'the ONE-line final ping' },
    shipped:       { type: 'array', items: { type: 'string' } },
    follow_ups:    { type: 'array', items: { type: 'string' } },
  },
}

// ---------- agents ----------
function buildAgent(item, reworkNote) {
  const tier = item.tier
  const rw = reworkNote ? `\n\nFABLE GATE REJECTED THE LAST ATTEMPT — fix this: ${reworkNote}` : ''
  const act = APPLY
    ? `Make the edit directly to ${item.file}. Touch NO other file — you are the sole owner of this one.`
    : `Do NOT write anything. Return the change as a unified diff in "changes".`
  return agent(
    `KONYO WORKFLOW build agent (tier=${tier}). Task context: ${TASK}\n` +
    `You own exactly ONE file: ${item.file} (kind=${item.kind}).\n` +
    `Instruction: ${item.instruction}\n${act}${rw}\n` +
    `Match surrounding code style. Return the structured result.`,
    { model: tier, effort: effortFor(tier), label: `build:${tier}:${item.file}`, phase: 'Build+Gate', schema: BUILD_SCHEMA }
  ).then(b => ({ item, build: b })).catch(() => ({ item, build: null }))
}

function gateAgent(built) {
  if (!built || !built.build) return Promise.resolve({ ...built, gate: { verdict: 'rework', severity: 'blocking', reason: 'build agent produced no output' } })
  return agent(
    `FABLE MERGE GATE. Task: ${TASK}\nFile: ${built.item.file}\n` +
    `Proposed change summary: ${built.build.summary}\nChanges:\n${built.build.changes}\n` +
    `Judge ONLY this file's change: correctness, scope-creep (did it touch anything it shouldn't?), ` +
    `does it satisfy the instruction "${built.item.instruction}". verdict=pass only if merge-ready.`,
    { model: 'fable', effort: 'medium', label: `gate:${built.item.file}`, phase: 'Build+Gate', schema: GATE_SCHEMA }
  ).then(g => ({ ...built, gate: g })).catch(() => ({ ...built, gate: { verdict: 'rework', severity: 'major', reason: 'gate errored' } }))
}

// ================= RUN =================
log(`KONYO WORKFLOW · ${mode} · budget floor ${Math.round(FLOOR/1000)}k · max ${MAXROUNDS} rounds`)

// 1) ARCHITECT (Opus, once)
phase('Architect')
const plan = await agent(
  `You are the ARCHITECT for the KONYO WORKFLOW. Decompose this task into independent work items, ` +
  `ONE OWNER PER FILE (no two items may name the same file). For each item pick the cheapest capable tier: ` +
  `bulk/mechanical→haiku, real implementation→sonnet, cross-cutting/architectural→opus. ` +
  `Read the repo as needed to ground file paths.\n\nTASK: ${TASK}`,
  { model: 'opus', effort: 'high', phase: 'Architect', schema: PLAN_SCHEMA }
)
if (!plan || !plan.items) { log('Architect produced no plan.'); return { error: 'no plan' } }

// one-owner-per-file guarantee
const seen = new Set()
let items = plan.items.filter(it => { const k = it.file; if (seen.has(k)) return false; seen.add(k); return it })
log(`Plan "${plan.version_label}": ${items.length} items — ` +
    `${items.filter(i=>i.tier==='haiku').length} haiku / ${items.filter(i=>i.tier==='sonnet').length} sonnet / ${items.filter(i=>i.tier==='opus').length} opus`)

// 2) THIRD-EYE (optional Grok consult on the plan)
if (USE_GROK) {
  phase('Third-eye')
  const eye = await agent(
    `Use the Grok MCP tool (search ToolSearch for a grok chat/web tool, e.g. mcp__grok-mcp__chat) to get a ` +
    `SECOND OPINION on this implementation plan for the task "${TASK}". Plan items:\n` +
    items.map(i => `- [${i.tier}] ${i.file}: ${i.instruction}`).join('\n') +
    `\nReturn Grok's top 3 concerns or "no concerns". If Grok is unavailable, return "grok unavailable".`,
    { agentType: 'general-purpose', model: 'sonnet', effort: 'low', label: 'grok:third-eye', phase: 'Third-eye' }
  ).catch(() => null)
  if (eye) log(`Third-eye: ${String(eye).slice(0, 300)}`)
}

// 3) BUILD + GATE (pipeline, no barrier — each item gates the moment its build lands)
phase('Build+Gate')
let results = await pipeline(items, it => buildAgent(it), built => gateAgent(built))
results = results.filter(Boolean)

// 4) REWORK loop — escalate failures one tier up, re-gate. version-per-round, budget-aware.
let round = 1
while (round < MAXROUNDS && budgetOK()) {
  const failing = results.filter(r => r.gate && r.gate.verdict === 'rework')
  if (!failing.length) break
  round++
  phase(`Rework r${round}`)
  log(`Round ${round}: ${failing.length} item(s) failed the gate → escalating up the ladder`)
  const redone = await pipeline(
    failing,
    r => { const esc = { ...r.item, tier: bump(r.item.tier) }; return buildAgent(esc, r.gate.reason).then(b => ({ ...b, item: esc })) },
    built => gateAgent(built)
  )
  // splice reworked results back in by file
  const byFile = new Map(results.map(r => [r.item.file, r]))
  for (const r of redone.filter(Boolean)) byFile.set(r.item.file, r)
  results = [...byFile.values()]
}

// 5) SYNTHESIZE (Opus, once) — ONE final ping
phase('Synthesize')
const passed = results.filter(r => r.gate && r.gate.verdict === 'pass')
const failed = results.filter(r => !r.gate || r.gate.verdict !== 'pass')
const final = await agent(
  `You are the SYNTHESIZER for the KONYO WORKFLOW, mode=${mode}. Task: ${TASK}\n` +
  `Version: ${plan.version_label} (after ${round} round(s)).\n` +
  `PASSED gate (${passed.length}):\n` + passed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
  `\nSTILL FAILING (${failed.length}):\n` + failed.map(r => `- ${r.item.file}: ${r.gate && r.gate.reason}`).join('\n') +
  `\nWrite the single final report: headline is the ONE-line ping Konyo reads.`,
  { model: 'opus', effort: 'high', phase: 'Synthesize', schema: FINAL_SCHEMA }
)

return {
  version: plan.version_label,
  mode,
  rounds: round,
  tokens_spent: budget.total ? budget.spent() : null,
  passed: passed.length,
  failed: failed.length,
  final,
}
