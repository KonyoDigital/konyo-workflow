export const meta = {
  name: 'konyo-workflow',
  description: 'KONYO WORKFLOW, cost-scaled: Opus architects, Haiku/Sonnet build one-owner-per-file, Fable gates every merge, failed items escalate up the ladder, Opus synthesizes ONE final report.',
  whenToUse: 'ANY multi-step task you want orchestrated. It TRIAGES itself first — serial diagnosis is sent back to be done directly instead of spawning a fleet, and skeptics are only bought when being wrong is expensive. Pass {task, apply, maxRounds, budgetFloor, grok, force, skeptics}.',
  phases: [
    { title: 'Triage',      detail: 'right-size the run BEFORE spending: shape · parallelism · cost-of-wrong', model: 'opus' },
    { title: 'Architect',   detail: 'Opus decomposes the task into one-owner-per-file work items + tier',   model: 'opus' },
    { title: 'Third-eye',   detail: 'optional Grok consult on the plan' },
    { title: 'Build+Gate',  detail: 'Haiku/Sonnet build each item; Fable gates it immediately (no barrier)' },
    { title: 'Rework',      detail: 'failed items escalate one tier up and re-gate, version-per-round' },
    { title: 'Render gate', detail: 'if the project can drive its own UI, run it — a failure BLOCKS the ship' },
    { title: 'Fat version bar', detail: 'LAW17 — >=3 user-visible outcomes in one theme OR one structural bug with root cause+verify+prevention; a thin ship BLOCKS' },
    { title: 'Reachability',   detail: 'LAW19 — every symbol the change added has a caller AND a writer; added tests proven to have RUN; failure BLOCKS', model: 'opus' },
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
const FORCE     = !!(A && A.force)                 // run the fleet even if triage says do it directly
const SKEPTICS_OVERRIDE = (A && typeof A.skeptics === 'number') ? A.skeptics : null
const MAX_AGENTS = (A && A.maxAgents) || 24

// ── THE CEILING (2026-08-01, ported from max after it blew a 34-cap into 119 agents / 4.1 hours) ──
// This workflow's only bound was a SENTENCE IN A PROMPT — "Produce AT MOST N items" — which asks the
// model rather than binding anything, and bounds items rather than agents. Rework rounds and skeptic
// panels multiply per item, so the item count was never the number that mattered.
// COUNT THE SPAWNS. Check at the moment of spending, which is the only place a ceiling can hold.
let SPENT = 0
let CEILING_HIT = false
function spawn(prompt, opts) {
  if (SPENT >= MAX_AGENTS) {
    if (!CEILING_HIT) {
      CEILING_HIT = true
      log(`⛔ CEILING: ${SPENT}/${MAX_AGENTS} agents spent — refusing every further spawn.`)
    }
    return Promise.resolve(null)
  }
  SPENT++
  return agent(String(prompt || '') + PACE, opts)
}

if (!TASK) { log('No task given. Pass a task string or {task:"..."} as args.'); return { error: 'no task' } }

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

const LADDER = ['haiku', 'sonnet', 'opus']               // the cost-scaling ladder
const bump = (tier) => LADDER[Math.min(LADDER.indexOf(tier) + 1, LADDER.length - 1)] || 'sonnet'
const effortFor = (tier) => tier === 'opus' ? 'high' : tier === 'sonnet' ? 'medium' : 'low'
const budgetOK = () => !budget.total || budget.remaining() > FLOOR
const mode = APPLY ? 'APPLY (agents edit files)' : 'DRY-RUN (agents propose diffs, nothing written)'

// ---------- schemas ----------
// TRIAGE — one cheap call that decides how much machinery this task actually deserves, BEFORE any
// of it is bought. Written after a run that spent ~106 agents and 2.5 hours producing one planning
// document, while the same night's hardest work — finding why CI had been red for 30 versions —
// was solved by one process reading logs. Fan-out does not make a root cause appear faster; it
// produces N opinions about it that still have to be checked one at a time.
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
/* ── v7 — THE FOUR CRAFT RULES ────────────────────────────────────────────────────────────────
   These cost nothing (they are words in a prompt, not an agent) and each one is a ship this
   project has already paid for. They live in one constant so both shippers say the same thing.

   NON-VACUOUS PROOF — a run once "proved" nothing was lost by measuring a quantity that was
   already zero. Nothing can be lost from zero. A proof has to move a real number.
   CLASS SWEEP — the same defect shipped three times in two days because each fix was applied to
   the site in front of the builder and not to the one that mattered next.
   STALE CLAIM — three separate incidents in one session where a comment, a doc or a line of UI
   copy still described behaviour the code had abandoned. A wrong explanation outlives wrong code,
   because nothing ever contradicts a comment.
   SURFACE AGREEMENT — two screens of the same app disagreed about the same fact for fourteen
   versions. The bug was not that one was wrong; it is that nothing compared them.            */
const CRAFT_RULES =
  `\n\nFOUR RULES, each one a ship this project has already paid for:\n` +
  `1. PROVE IT NON-VACUOUSLY. A proof measuring a quantity that was ALREADY zero or empty proves ` +
  `nothing. State what you measured, before and after, with real numbers. Restating the code is ` +
  `not a proof.\n` +
  `2. SWEEP THE CLASS. When you fix a bug, grep for the SAME SHAPE across the repo and fix every ` +
  `instance — or list the ones you deliberately left, and why. Fixing only the site in front of ` +
  `you is how one bug ships three times.\n` +
  `3. KILL THE STALE CLAIM. If you change behaviour, grep for PROSE describing the old behaviour ` +
  `(comments, docstrings, UI copy, README) and correct it in the same change.\n` +
  `4. MAKE THE SURFACES AGREE. If the fact you changed appears in more than one place, update ` +
  `every one and say they now agree. Two screens with different answers is worse than one wrong ` +
  `answer, because nothing catches it unless something compares them.`

function buildAgent(item, reworkNote) {
  const tier = item.tier
  const rw = reworkNote ? `\n\nFABLE GATE REJECTED THE LAST ATTEMPT — fix this: ${reworkNote}` : ''
  const act = APPLY
    ? `Make the edit directly to ${item.file}. Touch NO other file — you are the sole owner of this one.`
    : `Do NOT write anything. Return the change as a unified diff in "changes".`
  return spawn(
    `KONYO WORKFLOW build agent (tier=${tier}). Task context: ${TASK}\n` +
    `You own exactly ONE file: ${item.file} (kind=${item.kind}).\n` +
    `Instruction: ${item.instruction}\n${act}${rw}\n` +
    `Match surrounding code style. Return the structured result.` + CRAFT_RULES,
    { model: tier, effort: effortFor(tier), label: `build:${tier}:${item.file}`, phase: 'Build+Gate', schema: BUILD_SCHEMA }
  ).then(b => ({ item, build: b })).catch(() => ({ item, build: null }))
}

function gateAgent(built) {
  if (!built || !built.build) return Promise.resolve({ ...built, gate: { verdict: 'rework', severity: 'blocking', reason: 'build agent produced no output' } })
  return spawn(
    `FABLE MERGE GATE. Task: ${TASK}\nFile: ${built.item.file}\n` +
    `Proposed change summary: ${built.build.summary}\nChanges:\n${built.build.changes}\n` +
    `Judge ONLY this file's change: correctness, scope-creep (did it touch anything it shouldn't?), ` +
    `does it satisfy the instruction "${built.item.instruction}". verdict=pass only if merge-ready.`,
    { model: 'fable', effort: 'medium', label: `gate:${built.item.file}`, phase: 'Build+Gate', schema: GATE_SCHEMA }
  ).then(g => ({ ...built, gate: g })).catch(() => ({ ...built, gate: { verdict: 'rework', severity: 'major', reason: 'gate errored' } }))
}

// ================= RUN =================
log(`KONYO WORKFLOW · ${mode} · budget floor ${Math.round(FLOOR/1000)}k · max ${MAXROUNDS} rounds`)

// 0) TRIAGE — decide the size of the run before buying any of it.
//
// HARD RULE, learned the expensive way: a DRY-RUN must never be given a FILE-SHAPED deliverable.
// A run was once launched with apply:false while every agent was told to write draft files and a
// final document. No agent could produce its deliverable, so every item failed its gate, and every
// failure escalated with three fresh skeptics — the agent counter climbed 97 → 101 → 108 instead of
// falling. The contradiction is detectable here in one line, so it is caught here instead of being
// paid for over two and a half hours.
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

phase('Triage')
if (!APPLY && wantsAFile(TASK)) {
  log('⚠ TRIAGE REFUSED: this is a DRY-RUN (apply:false) but the task asks agents to WRITE A FILE.')
  log('  Nothing can satisfy that, so every item would fail its gate and rework would multiply.')
  log('  Re-run with apply:true, or ask for the content in the RESULT instead of on disk.')
  return { refused: 'dry-run with a file-shaped deliverable', fix: 'apply:true, or drop the file deliverable' }
}

const triage = await spawn(
  `You are TRIAGE for the KONYO WORKFLOW. Decide how much machinery this task deserves — the point ` +
  `is to NOT spend a fleet on work that one process does better.\n\n` +
  `Rules of thumb, from real runs:\n` +
  `- Finding ONE root cause (a red test, a bug, "why is X broken") is SERIAL. Instrument, measure, fix. ` +
  `Fan-out gives N opinions that must each be checked — it is slower AND dearer. tier=direct.\n` +
  `- A sweep with a KNOWN list (audit 100 files, migrate 40 call sites) is genuinely parallel. tier=standard.\n` +
  `- Writing a document is serial thinking plus ONE adversarial read. tier=light. Never one skeptic per section.\n` +
  `- Skeptics are bought ONLY when being wrong is expensive: data loss, money, security, or arithmetic ` +
  `that could silently lie. Cosmetics and docs get none.\n` +
  `- If the work-list is not known yet, say work_list_known:false — scout with 1-2 agents first, then fan out.\n\n` +
  `Be honest and stingy. Recommending "direct" is a SUCCESS, not a failure.\n\nTASK: ${TASK}`,
  { model: 'opus', effort: 'medium', phase: 'Triage', label: 'triage', schema: TRIAGE_SCHEMA }
).catch(() => null)

if (triage) {
  const sk = SKEPTICS_OVERRIDE != null ? SKEPTICS_OVERRIDE : triage.skeptics
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

// 1) ARCHITECT (Opus, once)
phase('Architect')
const plan = await spawn(
  `You are the ARCHITECT for the KONYO WORKFLOW. Decompose this task into independent work items, ` +
  `ONE OWNER PER FILE (no two items may name the same file). For each item pick the cheapest capable tier: ` +
  `bulk/mechanical→haiku, real implementation→sonnet, cross-cutting/architectural→opus. ` +
  `Read the repo as needed to ground file paths.\n` +
  (globalThis.__triage
    ? `\nTRIAGE SIZED THIS RUN: ${globalThis.__triage.tier} · ${globalThis.__triage.shape} · about ` +
      `${globalThis.__triage.est_agents} agents. Produce AT MOST ${Math.max(1, Math.min(24, globalThis.__triage.est_agents))} items. ` +
      `Fewer, larger items beat many thin ones — every extra item costs a build AND its gate.\n`
    : '') +
  `\nFAT VERSION LAW (LAW17): ONE version integer must package real work — (A) >=3 user-visible ` +
  `outcomes in one theme, OR (B) one structural bug with root cause + verification + prevention. ` +
  `A plan whose entire content is one toast / one label / one i18n key / one CSS one-liner / docs ` +
  `fluff does NOT clear the bar: fold in the rest of the theme's outcomes, or say plainly in ` +
  `version_label/why that this is below a version stamp. Maximize outcomes INSIDE the one version; ` +
  `never micro-stamp a version per one-liner. This is NOT a licence to inflate the fleet — more ` +
  `outcomes per item, not more items.\n` +
  `\nTASK: ${TASK}`,
  { model: 'opus', effort: 'high', phase: 'Architect', schema: PLAN_SCHEMA }
)
if (plan === null) { log('CEILING: no budget for the plan.'); return { error: 'ceiling', ceiling: { cap: MAX_AGENTS, spent: SPENT, hit: CEILING_HIT } } }
if (!plan || !plan.items) { log('Architect produced no plan.'); return { error: 'no plan' } }

// one-owner-per-file guarantee
const seen = new Set()
let items = plan.items.filter(it => { const k = it.file; if (seen.has(k)) return false; seen.add(k); return it })
// Triage's number is a CEILING, not a suggestion — an architect that returns 23 items for a job
// triaged at 6 is how a planning doc turns into a hundred agents. Trim, and say so out loud.
if (globalThis.__triage && globalThis.__triage.est_agents) {
  const cap = Math.max(1, Math.min(24, globalThis.__triage.est_agents))
  if (items.length > cap) {
    log(`TRIAGE CAP: architect returned ${items.length} items, triage sized this at ${cap} — trimming to ${cap}.`)
    items = items.slice(0, cap)
  }
}
log(`Plan "${plan.version_label}": ${items.length} items — ` +
    `${items.filter(i=>i.tier==='haiku').length} haiku / ${items.filter(i=>i.tier==='sonnet').length} sonnet / ${items.filter(i=>i.tier==='opus').length} opus`)

// 2) THIRD-EYE (optional Grok consult on the plan)
if (USE_GROK) {
  phase('Third-eye')
  const eye = await spawn(
    `Use the Grok MCP tool (search ToolSearch for a grok chat/web tool, e.g. mcp__grok-mcp__chat) to get a ` +
    `SECOND OPINION on this implementation plan for the task "${TASK}". Plan items:\n` +
    items.map(i => `- [${i.tier}] ${i.file}: ${i.instruction}`).join('\n') +
    `\nReturn Grok's top 3 concerns or "no concerns". If Grok is unavailable, return "grok unavailable".`,
    { agentType: 'general-purpose', model: 'sonnet', effort: 'low', label: 'grok:third-eye', phase: 'Third-eye' }
  ).catch(() => null)
  if (eye) log(`Third-eye: ${String(eye).slice(0, 300)}`)
}

// 3) BUILD + GATE (pipeline, no barrier — each item gates the moment its build lands)
// Skeptics ride along ONLY when triage judged the cost of being wrong high. On the run that found
// two real counting bugs in a time-tracker they earned their keep; on a CSS fix they are pure spend.
const SKEPTICS = (globalThis.__triage && globalThis.__triage.skeptics) || 0
phase('Build+Gate')
if (SKEPTICS > 0) log(`Cost-of-wrong is high → ${SKEPTICS} skeptic(s) will try to REFUTE each passing item.`)
let results = await pipeline(
  items,
  it => buildAgent(it),
  built => gateAgent(built),
  gated => {
    if (SKEPTICS < 1 || !gated || !gated.gate || gated.gate.verdict !== 'pass') return gated
    return parallel(Array.from({ length: SKEPTICS }, (_, i) => () => spawn(
      `You are SKEPTIC ${i + 1} of ${SKEPTICS}. Try HARD to REFUTE this change — find the input that ` +
      `breaks it, the case it silently mishandles, or the claim it cannot back. Default to refuted:true ` +
      `if you are unsure.\n\nFILE: ${gated.item.file}\nWHAT IT CLAIMS: ${gated.build && gated.build.summary}\n` +
      `SELF-CHECK IT OFFERS: ${gated.build && gated.build.self_check}`,
      { model: 'opus', effort: 'high', phase: 'Build+Gate', label: `skeptic${i + 1}:${gated.item.file}`,
        schema: { type: 'object', additionalProperties: false, required: ['refuted', 'why'],
          properties: { refuted: { type: 'boolean' }, why: { type: 'string' } } } }
    ).catch(() => ({ refuted: false, why: 'skeptic errored' })))
    ).then(votes => {
      const kills = votes.filter(Boolean).filter(v => v.refuted)
      if (kills.length > SKEPTICS / 2) {
        log(`SKEPTICS KILLED ${gated.item.file}: ${kills[0].why.slice(0, 140)}`)
        return { ...gated, gate: { verdict: 'rework', severity: 'major', reason: `majority of skeptics refuted it: ${kills[0].why}` } }
      }
      return gated
    })
  }
)
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

// ────────────────────────────────────────────────────────────────────────────────────────────────
// 5.7) THE REACHABILITY GATE — LAW19 (added after two dead features shipped in one night)
// ────────────────────────────────────────────────────────────────────────────────────────────────
// The render gate proves the UI PAINTS. This proves the code you just added is REACHED.
//
// Twice in one session a change was declared, read, cleared, and described in its own commit
// message as a working feature — while NOTHING ever called it and NOTHING ever wrote it. A redo
// button whose slot no undo ever filled. A faster poll that re-read a flag no scheduler ever
// re-armed. Both passed every gate that existed: they parsed, they were reviewed, the tests were
// green. A seam with no tap is invisible to all of them, because there is nothing wrong with the
// code — there is just no path to it.
//
// The same shape hides dead TESTS, which is why one gate covers both: three tests were appended to
// a suite below its `unittest.main()`, the suite reported OK, and the count was 82 before and 82
// after. A test that never runs is an unreachable seam that also lies about coverage.
//
// This is a BLOCKER, not a note. A feature that does nothing is worse than a missing feature: the
// commit message says it exists, so nobody looks again.
phase('Reachability')
const reach = await spawn(
  `REACHABILITY GATE (Opus). The build phase has finished. Task: ${TASK}\n\n` +
  `YOUR JOB: prove that what was just added is actually REACHED at runtime. Not that it parses — ` +
  `that something calls it, something writes it, and any test added actually ran.\n` +
  `1. From the changed files, list every SYMBOL the change introduced: functions, exported names, ` +
  `handlers, state slots, config keys, routes, CSS classes referenced by code.\n` +
  `2. For each, find its CALLER and its WRITER. A slot that is read and cleared but never written ` +
  `is dead. A handler defined but wired to no element is dead. A route with no requester is dead. ` +
  `A guard on a name that is declared NOWHERE is permanently false — grep the whole repo for a ` +
  `declaration before concluding a name is missing, because a name can be declared far from its use.\n` +
  `3. PREFER EXECUTION TO GREP. Run the thing if you can: call the function, drive the path, print ` +
  `the before/after. Grep alone cannot tell a live cross-file reference from a dead one.\n` +
  `4. IF TESTS WERE ADDED: prove they RAN. Show the suite's test COUNT before and after, or name ` +
  `the new tests in verbose output. "The suite is green" is not evidence that your tests are in it.\n` +
  `5. Report only seams you actually verified as dead, with the evidence. A false positive here ` +
  `sends someone deleting live code, so if you cannot prove it is dead, do not list it.\n` +
  `Do NOT fix anything. Report.`,
  { model: 'opus', effort: 'high', phase: 'Reachability', schema: {
      type: 'object', additionalProperties: false,
      required: ['checked', 'dead', 'tests_added', 'tests_proven_run', 'notes'],
      properties: {
        checked:          { type: 'number', description: 'symbols traced to a caller AND a writer' },
        dead:             { type: 'array', maxItems: 20, items: { type: 'string' },
                            description: 'one line each: symbol, file, and the evidence it is unreachable' },
        tests_added:      { type: 'boolean' },
        tests_proven_run: { type: 'boolean', description: 'false if tests were added and not proven to run' },
        notes:            { type: 'string' },
      },
    } }
).catch(() => null)
if (reach && (reach.dead || []).length) {
  log(`⛔ REACHABILITY FAILED — ${reach.dead.length} dead seam(s). This is a SHIP BLOCKER.`)
  reach.dead.slice(0, 8).forEach(d => log(`   · ${d}`))
} else if (reach && reach.tests_added && !reach.tests_proven_run) {
  log(`⛔ REACHABILITY FAILED — tests were added and NOT proven to run. SHIP BLOCKER.`)
} else if (reach) {
  log(`✅ Reachability: ${reach.checked} symbol(s) traced to a caller and a writer.`)
}

// 5) SYNTHESIZE (Opus, once) — ONE final ping
// ── THE RENDER GATE (v-render, 2026-08-02) ───────────────────────────────────────────────────────
// A parser cannot see a painted page. Konyo's predicter shipped a MutationObserver loop that froze
// the entire app past a fully green gate — parity, modules, i18n all passing. If the project has a
// way to drive its own UI, use it, and treat a failure as a ship blocker.
let renderGate = null
if (APPLY) {
  phase('Render gate')
  renderGate = await spawn(
    `RENDER GATE. Task: ${TASK}\n` +
    `0. CI FIRST — CHECK BEFORE YOU SPAWN ANYTHING. If the project runs its UI checks in CI (a ` +
    `.github/workflows/*.yml that drives a browser), THAT is the gate: read the verdict ` +
    `(\`gh run list --workflow="<name>" -L 3\`, \`gh run view <id> --log-failed\`) instead of ` +
    `launching a browser here. A fleet of agents each starting chromium is how Konyo's laptop got ` +
    `saturated once already. Only fall through to a local run if there is NO CI gate at all.\n` +
    `Otherwise: find the project's own UI verification (npm script test:render/e2e/test, playwright/cypress ` +
    `config, spec dir, or a documented browser verify floor) and RUN it. Report the true result — ` +
    `never edit a test to make it pass, never invent a green result, never install a framework ` +
    `unasked. If none exists, set available=false and list what is missing. Minimum checks when ` +
    `tooling does exist: boots without console errors; every visible control is hit-testable after ` +
    `being scrolled into view; no unfilled {placeholder} or raw i18n key renders as text; the page ` +
    `still responds after ~1s idle (an infinite loop reads as unresponsive, not as an error). ` +
    `Never bind a port the user's own app uses; kill anything you start.`,
    { effort: 'medium', phase: 'Render gate', schema: {
        type: 'object', additionalProperties: false,
        required: ['available', 'ran', 'passed', 'failures'],
        properties: {
          available: { type: 'boolean' },
          ran:       { type: 'string' },
          passed:    { type: 'boolean' },
          failures:  { type: 'array', items: { type: 'string' } },
          notes:     { type: 'string', description: 'what a human should eyeball that no test covers' },
        } } }
  ).catch(() => null)
  if (renderGate && renderGate.available && !renderGate.passed) {
    log(`⛔ RENDER GATE FAILED — ${renderGate.failures.length} failure(s). SHIP BLOCKER.`)
    renderGate.failures.slice(0, 6).forEach(f => log(`   · ${f}`))
  } else if (renderGate && !renderGate.available) {
    log('⚠ RENDER GATE: no UI verification in this project — nothing was seen painted.')
  }
}

// ── THE FAT VERSION BAR (LAW17) ──────────────────────────────────────────────────────────────────
// A version integer is a promise that something real landed. A "ship" whose whole content is one
// toast is a version stamp spent on nothing. Both Grok shippers enforce this; so does this one.
// Dry runs are covered by the FAT VERSION LAW paragraph in the architect prompt — there are no
// build results to judge here, so the bar only runs under APPLY.
let fatBar = null
if (APPLY) {
  phase('Fat version bar')
  const fatPassed = results.filter(r => r.gate && r.gate.verdict === 'pass')
  fatBar = await spawn(
    `FAT VERSION BAR. Task: ${TASK}\n` +
    `LAW17 FAT VERSION BAR: ONE version integer must package real work — (A) >=3 user-visible ` +
    `outcomes in one theme, OR (B) one structural bug with root cause + verification + prevention. ` +
    `A ship whose entire content is one toast / one label / one i18n key / one CSS one-liner / ` +
    `docs fluff alone is a BLOCKER, not a ship.\n` +
    `Version: ${plan.version_label}\n` +
    `WHAT PASSED THE GATE (${fatPassed.length}):\n` +
    fatPassed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') + `\n` +
    `Count only outcomes a USER can see, not files touched — three edits to one label is ONE ` +
    `outcome. Never inflate a count to clear the bar. If this does not clear it, say so plainly: ` +
    `passes=false, kind='thin', and name in reason what would have to be folded in to make it fat.\n` +
    `applicable=false is permitted ONLY for a run that produces no version stamp at all (pure ` +
    `diagnosis / dry analysis) and REQUIRES na_evidence naming what was inspected. ` +
    `N/A without evidence is a FAIL.`,
    { effort: 'medium', phase: 'Fat version bar', schema: {
        type: 'object', additionalProperties: false,
        required: ['applicable', 'passes', 'kind', 'outcomes', 'reason'],
        properties: {
          applicable:  { type: 'boolean' },
          passes:      { type: 'boolean' },
          kind:        { type: 'string', description: 'outcomes | structural-bug | thin' },
          outcomes:    { type: 'array', items: { type: 'string' } },
          reason:      { type: 'string' },
          na_evidence: { type: 'string' },
        } } }
  ).catch(() => null)
  if (fatBar && fatBar.applicable && !fatBar.passes) {
    log('⛔ LAW17 FAT VERSION BAR FAILED — ' + fatBar.reason + ' SHIP BLOCKER.')
  } else if (fatBar && !fatBar.applicable) {
    log('⚠ LAW17 N/A (no version stamp this run) — ' + (fatBar.na_evidence || 'NO EVIDENCE GIVEN — treat as a fail.'))
  } else if (fatBar) {
    log(`✅ Fat version bar passed (${fatBar.kind}, ${(fatBar.outcomes || []).length} user-visible outcome(s)).`)
  }
}

phase('Synthesize')
const passed = results.filter(r => r.gate && r.gate.verdict === 'pass')
const failed = results.filter(r => !r.gate || r.gate.verdict !== 'pass')
const final = await spawn(
  `You are the SYNTHESIZER for the KONYO WORKFLOW, mode=${mode}. Task: ${TASK}\n` +
  `Version: ${plan.version_label} (after ${round} round(s)).\n` +
  `PASSED gate (${passed.length}):\n` + passed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
  `\nSTILL FAILING (${failed.length}):\n` + failed.map(r => `- ${r.item.file}: ${r.gate && r.gate.reason}`).join('\n') +
  (renderGate ? `\nRENDER GATE: available=${renderGate.available} ran=${renderGate.ran} passed=${renderGate.passed}` +
    ((renderGate.failures || []).length ? `\n  FAILURES:\n` + renderGate.failures.map(f => '  - ' + f).join('\n') : '') +
    (renderGate.notes ? `\n  eyeball: ${renderGate.notes}` : '') +
    `\nIf the render gate FAILED, the headline must say the ship is BLOCKED and why — do not report success over a broken screen. ` +
    `If it was unavailable, the headline must say nothing was seen painted.` : '\nRENDER GATE: not run (dry-run).') +
  (fatBar ? `\nFAT VERSION BAR (LAW17): applicable=${fatBar.applicable} passes=${fatBar.passes} kind=${fatBar.kind}` +
    ((fatBar.outcomes || []).length ? `\n  OUTCOMES:\n` + fatBar.outcomes.map(o => '  - ' + o).join('\n') : '') +
    (fatBar.reason ? `\n  reason: ${fatBar.reason}` : '') +
    `\nIf the fat version bar FAILED, the headline must say the ship is BLOCKED as a thin version and name what would make it fat.` : '\nFAT VERSION BAR: not run (dry-run).') +
  `\nWrite the single final report: headline is the ONE-line ping Konyo reads.`,
  { model: 'opus', effort: 'high', phase: 'Synthesize', schema: FINAL_SCHEMA }
)

return {
  version: plan.version_label,
  mode,
  triage: globalThis.__triage || null,   // what this run was sized at, and why — visible after the fact
  rounds: round,
  tokens_spent: budget.total ? budget.spent() : null,
  ceiling: { cap: MAX_AGENTS, spent: SPENT, hit: CEILING_HIT, complete: !CEILING_HIT },
  passed: passed.length,
  failed: failed.length,
  render_gate: renderGate,
  fat_version: fatBar,
  final,
}
