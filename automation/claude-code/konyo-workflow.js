export const meta = {
  name: 'konyo-workflow',
  description: 'KONYO WORKFLOW — ONE body. RUNS AT MAX BY DEFAULT: Opus everywhere, a 3-architect judge panel, a diverse-lens skeptic panel as THE gate, a loop-until-dry completeness critic, and the third eye (Grok — a different model family) ON. Pass {quality:"standard"} — and only that exact word — to opt DOWN to the cost-scaled ladder (Haiku/Sonnet build, Fable gates every merge, escalate on rework). Pass {thirdEye:false} to run without an independent reviewer. Every safeguard (agent ceiling, blockers, bail, render gate, LAW17, LAW19, workspace lock, skeptic floor) runs at BOTH qualities — the flag only buys model tier, panel size and extra phases.',
  whenToUse: 'ANY multi-step task you want orchestrated — it is MAX unless you say otherwise, because being wrong usually costs more than tokens. It TRIAGES itself first, so a serial diagnosis is sent back to be done directly instead of spawning a fleet, and the ceiling + budget floor still bound every run. Opt down with {quality:"standard"} for routine, low-cost-of-wrong, easily reversible work (~10-15x cheaper). Pass {task, quality, thirdEye, apply, maxRounds, dryRounds, budgetFloor, force, skeptics, maxAgents, isolate}. `grok:false` still works as the old name for thirdEye:false.',
  phases: [
    { title: 'Preflight',   detail: 'workspace lock — refuse to start if another run is already editing this tree' },
    { title: 'Triage',      detail: 'right-size the run BEFORE spending: shape · parallelism · cost-of-wrong', model: 'opus' },
    { title: 'Architect',   detail: 'decide the plan — 3 Opus architects (risk / correctness / simplest lenses) + an Opus judge by default; ONE architect at quality:"standard". One owner per file either way.', model: 'opus' },
    { title: 'Third-eye',   detail: 'seat 1 of 4 — Grok (a DIFFERENT model family) reviews the chosen plan before a builder spends anything; seats 2-4 sit on the skeptic panel, the render gate and the pre-ship verdict' },
    { title: 'Build+Gate',  detail: 'Opus builds each item (Haiku/Sonnet at quality:"standard"); one owner per file, gated immediately, no barrier' },
    { title: 'Adversarial gate', detail: 'THE DEFAULT PATH — diverse-lens Opus skeptics ARE the gate (floor 2, one seat is the third eye); majority-refute kills the change', model: 'opus' },
    { title: 'Rework',      detail: 'failed items escalate one tier up and re-gate, version-per-round' },
    { title: 'Merge',       detail: '(isolate mode only) applies each worktree patch to the REAL repo, one at a time, git apply --check first', model: 'opus' },
    { title: 'Completeness',detail: 'THE DEFAULT PATH — an Opus critic hunts for work nobody did; loops until N dry rounds (skipped at quality:"standard")', model: 'opus' },
    { title: 'Render gate', detail: 'drives the REAL UI — hit-testable controls + SCREENSHOT-BACKED geometry (non-zero boxes, no clipping/overflow, text vs background, no overlap); failure BLOCKS the ship' },
    { title: 'Fat version bar', detail: 'LAW17 — >=3 user-visible outcomes in one theme OR one structural bug with root cause+verify+prevention; a thin ship BLOCKS' },
    { title: 'Reachability',   detail: 'LAW19 — every symbol the change added has a caller AND a writer; added tests proven to have RUN; failure BLOCKS', model: 'opus' },
    { title: 'Synthesize',  detail: 'Opus integrates all passing work into ONE final report' },
  ],
}

// ---------- inputs ----------
// args may arrive as a real object OR as a JSON-encoded string (the harness sometimes
// stringifies it, which silently dropped apply/maxRounds before). Normalize to an object.
// A sibling entry point (konyo-workflow-max) may drive this same body without an `args` binding of
// its own, so fall back to globalThis.__KONYO_ARGS. The string/JSON normalisation below is unchanged.
let A = (typeof args !== 'undefined' ? args : null) || globalThis.__KONYO_ARGS || null
if (typeof A === 'string') { try { A = JSON.parse(A) } catch { A = { task: A } } }
/* ── THE QUALITY KNOB (2026-08-04 — THE MERGE) ───────────────────────────────────────────────────
   konyo-workflow.js and konyo-workflow-max.js were TWO copies of one workflow. Safeguards v13-v17
   were hand-applied to both and had ALREADY DRIFTED: the base stored trimmed items in a local
   `trimmedFromPlan` while max stored them in `globalThis.__trimmed`; the base returned a
   `rework:{rounds,maxRounds,stopped_because}` block max lacked; max returned `completeness`,
   `merge`, `infeasible` and `quality` blocks the base lacked. Every future safeguard was one more
   chance to fix one file and forget the other. So: ONE body, and the quality is a flag.

   THE LAW THAT MAKES THE FLAG SAFE: `MAXQ` may only choose (a) a model tier, (b) an effort level,
   (c) a panel/loop SIZE, or (d) whether an EXTRA PHASE runs. It may NEVER decide whether a
   SAFEGUARD runs. No blocker(), no bail(), no ceiling check, no lock, no gate may live inside
   `if (MAXQ)`. Every max-only phase pushes into the SAME BLOCKERS ledger, the same SPAWN_ERRORS
   array, and exits through the same bail(). */
/* v18 — MAX IS THE DEFAULT. Konyo, 2026-08-04: "i want the MAX version to be the defaulted one
   always as main.. the cost-scaling is optional and only if asked for manually." A bare invocation
   therefore buys the full adversarial path; the cheap ladder is an explicit opt-in and nothing else.
   FAIL SAFE TOWARD QUALITY: only the exact string 'standard' downgrades. A typo ('MAXX', 'standrd',
   'cheap', 'fast') resolves to MAX — the failure mode of a misread flag must be an expensive run,
   never a quiet one that the caller believes was maxed. And the fallback is SAID OUT LOUD below:
   a quality you did not ask for is exactly the kind of fact that reads as consent when it is silent. */
const QUALITY_ASKED = (A && typeof A.quality === 'string') ? A.quality.trim().toLowerCase() : null
const QUALITY = (QUALITY_ASKED === 'standard' || globalThis.__KONYO_QUALITY === 'standard') ? 'standard' : 'max'
const QUALITY_TYPO = !!(QUALITY_ASKED && QUALITY_ASKED !== 'standard' && QUALITY_ASKED !== 'max')
const MAXQ    = QUALITY === 'max'
const TASK      = typeof A === 'string' ? A : (A && A.task) || ''
const APPLY     = !!(A && A.apply)                 // false = dry-run (propose diffs, write nothing). true = agents edit files.
// Quality-dependent DEFAULTS preserve each original script's default exactly; an explicit caller arg
// always wins over both.
const MAXROUNDS = (A && A.maxRounds) || (MAXQ ? 2 : 3)
const DRYROUNDS = (A && A.dryRounds) || 1          // consumed only by the max-only completeness loop
const FLOOR     = (A && A.budgetFloor) || (MAXQ ? 120_000 : 60_000)  // stop opening new rounds under this many tokens remaining
/* v18 — THE THIRD EYE IS A FIRST-CLASS FLAG, ON BY DEFAULT, AND IT MEANS A DIFFERENT MODEL FAMILY.
   Konyo, 2026-08-04: "grok should be turned on for now until i say turn it off... the whole point
   for the third eye is a different LLM AI with a different point of view." Claude reviewing Claude
   is not a third eye, it is the same eye twice — model diversity is the ONLY thing this phase buys,
   so a Claude stand-in may never quietly fill a Grok seat.
     thirdEye: true   (DEFAULT) — the real thing: Grok, a different family, via the CLI
     thirdEye: false            — off. `grok:false` still works; it is the old name for this flag.
     thirdEye: 'claude'         — explicit DEGRADED mode: a Claude adversary, LABELLED as a
                                  same-family stand-in. Opt-in only, never a fallback. */
const TE_ASKED  = (A && A.thirdEye !== undefined) ? A.thirdEye
                : (A && A.grok !== undefined)     ? A.grok
                : true
const THIRD_EYE = TE_ASKED === false ? 'off' : (TE_ASKED === 'claude' ? 'claude' : 'grok')
const USE_GROK  = THIRD_EYE !== 'off'   // legacy name kept so no existing call site changes meaning
const FORCE     = !!(A && A.force)                 // run the fleet even if triage says do it directly
const SKEPTICS_OVERRIDE = (A && typeof A.skeptics === 'number') ? A.skeptics : null
const MAX_AGENTS = (A && A.maxAgents) || 24
/* ── THE WORKSPACE LOCK (ported from max, 2026-08-03) ────────────────────────────────────────────
   A lock only ONE of the two workflows respects is not a lock. The collision that prompted this was
   max-vs-max on site/index.html, but a cost-scaled run editing the same tree as a max run loses work
   exactly as thoroughly, and this workflow is the one people reach for casually. Same protocol, same
   lock directory, so the two actually exclude each other.
   TTL rather than a promise to release: a killed run never reaches its release, and a lock that
   outlives its holder locks the human out of their own repo. Escape hatch {ignoreLock:true}. */
const IGNORE_LOCK  = !!(A && A.ignoreLock)
const LOCK_TTL_MIN = (A && A.lockTtlMinutes) || 180
/* ── v9 — SANDBOX ISOLATION WITH A REAL MERGE (ported whole from max) ────────────────────────────
   `isolation:'worktree'` alone does NOT give you isolation: it hands each agent an isolated COPY
   and auto-cleans it, and nothing merges a CHANGED copy back. Switched on naively in apply mode,
   every edit lands in a throwaway directory, never reaches the repo, and the run reports success —
   a silent no-op dressed as a green ship. So isolation here is isolate → PATCH → merge: each
   builder returns the complete unified diff, and ONE merge agent applies them to the real repo one
   at a time with `git apply --check` first.
   ARG-GATED, NOT QUALITY-GATED. This is a capability, not a rigour level: a standard run that asks
   for {isolate:true} gets the worktree builders AND the merge phase that carries their work back.
   Gating the merge on quality would mean a standard isolate run silently discarded every change. */
const ISOLATE = !!(A && A.isolate) && APPLY

// ── THE CEILING (2026-08-01, ported from max after it blew a 34-cap into 119 agents / 4.1 hours) ──
// This workflow's only bound was a SENTENCE IN A PROMPT — "Produce AT MOST N items" — which asks the
// model rather than binding anything, and bounds items rather than agents. Rework rounds and skeptic
// panels multiply per item, so the item count was never the number that mattered.
// COUNT THE SPAWNS. Check at the moment of spending, which is the only place a ceiling can hold.
let SPENT = 0
let CEILING_HIT = false
function spawn(prompt, opts, reserved) {
  // RESERVED spawns may use the last agents (parity with konyo-workflow-max.js). A capped run that
  // cannot afford its own lock RELEASE or its own synthesis spends everything and reports NOTHING —
  // and worse, leaves the tree locked until the TTL expires, locking Konyo out for 180 minutes.
  const cap = reserved ? MAX_AGENTS : Math.max(1, MAX_AGENTS - 2)
  if (SPENT >= cap) {
    if (!CEILING_HIT) {
      CEILING_HIT = true
      log(`⛔ CEILING: ${SPENT}/${MAX_AGENTS} agents spent (2 held back for the report + lock release) — refusing every further spawn.`)
    }
    return Promise.resolve(null)
  }
  SPENT++
  // v13 — a dying agent must not kill the run; see konyo-workflow-max.js for the full account.
  // agent() can THROW (the token ceiling does, by contract), and most call sites await spawn()
  // with no catch of their own, so one rejection unwound the entire script.
  return agent(String(prompt || '') + PACE + PROOF, opts).catch(err => {
    SPAWN_ERRORS.push(String((err && err.message) || err).slice(0, 200))
    log(`⚠ AGENT FAILED (${SPAWN_ERRORS.length} so far): ${String((err && err.message) || err).slice(0, 140)}`)
    return null
  })
}

// v13 — THE BLOCKER LEDGER. A gate written `if (gate && gate.failed)` does NOT block when the gate
// is null (never ran / ceiling refused it / agent died) — every branch is skipped and the run
// reports success. A gate that did not run is not a gate that passed.
const BLOCKERS = []
const SPAWN_ERRORS = []
function blocker(what, why) {
  BLOCKERS.push({ what, why })
  log(`⛔ BLOCKER — ${what}: ${why}`)
}
// v13 — EVERY EXIT CARRIES A VERDICT. The smoke test that validated this very patch exited through
// the "no plan" early return and came back with NO verdict and NO shippable field at all, because
// those fields existed only on the single happy-path return at the bottom of the script. A caller
// checking result.shippable got `undefined`. Undefined is falsy, so it happened not to read as a
// green light — but "accidentally not wrong" is not a safeguard, and it is the same shape as the
// bug this patch exists to kill: a fact that is true in the payload and absent from the summary.
// Defaults first, so a caller can override the verdict for a deliberate, non-failing exit.
// THE SIBLING CONTRACT. A thin entry point (konyo-workflow-max) may execute this body without being
// able to read its `return` value directly, so every exit also publishes the payload here. One line,
// costs nothing, and it means the two entry points can never drift into two implementations again.
const emit = (o) => { globalThis.__KONYO_RESULT = o; return o }
function bail(o) {
  return emit(Object.assign({
    quality: QUALITY,
    blockers: BLOCKERS,
    agent_errors: SPAWN_ERRORS,
    ceiling: { cap: MAX_AGENTS, spent: SPENT, hit: CEILING_HIT },
    verdict: 'ABORTED — the run exited before completing; see error/refused',
    shippable: false,
  }, o))
}

if (!TASK) { log('No task given. Pass a task string or {task:"..."} as args.'); return bail({ error: 'no task' }) }

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

// v16 — THE PROXY BAN, attached to EVERY agent prompt beside PACE. Three separate bugs in one day
// were the same mistake wearing different clothes: checking a cheap stand-in for a fact instead of
// the fact. (1) `naturalWidth > 0` and "the path resolves" were accepted as proof an IMAGE was
// correct — art/mephisto_graphic.png contains a soulstone and survived months of green gates.
// (2) `git rev-parse origin/main` was read as "what GitHub has" — it is a CACHED ref and answers
// "what I last fetched", so a commit that WAS pushed was reported as unpushed. (3) A gate that
// returned null was read as a gate that passed. Each proxy was true and each conclusion was false.
// This is cheap to state and expensive to keep re-learning, so every agent carries it.
const PROOF = '\n\nVERIFY THE THING, NOT A PROXY FOR IT. Before you assert something is true, ask what '
  + 'you actually measured. Named traps, all of which have produced a WRONG confident answer in this '
  + 'project: an IMAGE is only correct if you OPENED it and saw what it depicts (naturalWidth>0, a '
  + 'resolving path, a filename, a hash and a file size are NOT evidence of content); REMOTE git state '
  + 'requires `git fetch` first or `git ls-remote` (`git rev-parse origin/...` is a cached ref and '
  + 'answers what you last saw); a test proves nothing until you have seen it FAIL on a deliberately '
  + 'broken version; a NULL/absent result is never a passing result; and "the file changed" is not '
  + '"the running system changed" when anything caches. If you could not verify the thing itself, say '
  + 'so in your result — an explicit "not established" is worth more than a confident proxy.'


/* ── v18 — THE THIRD EYE: FOUR SEATS, A TRANSPORT THAT ACTUALLY WORKS, AND IT FAILS LOUD ─────────
   THE BUG THIS REPLACES. Until today the third eye was a single agent told to call
   `mcp__grok-mcp__chat` and to "return grok unavailable" if it could not. That MCP transport is
   DEAD — measured 2026-08-04, it answers INVALID_ARGUMENT / "Incorrect API key provided", because
   the XAI_API_KEY in ~/Grok-MCP/.env is rejected by console.x.ai. Nothing read the "unavailable"
   string, so a third eye that never spoke read as a clean pass. That is the v16 defect class
   (a null that reads as success) living inside the safeguard machinery itself.
   THE TRANSPORT THAT WORKS: the Grok CLI at ~/.grok/bin/grok (0.2.118) authenticates on its own
   session, independent of that key. Measured working the same day, twice: a plain prompt, and an
   agentic read of a repo (`--cwd`) that ran `git log` and answered correctly. It is ALSO multimodal
   — asked what art/mephisto_graphic.png depicts, with no hint of what it should be, it answered
   "a polished, deep-blue teardrop gemstone", independently confirming the mislabelled boss art.
   That is why seat 4 exists.
   ⚠ `timeout` is NOT installed on this Mac, so every call is bounded by the Bash tool's own timeout
   parameter. Never write `timeout 120 grok ...` — it fails with command-not-found and the seat then
   reports unreachable for the wrong reason.
   THE RULE THAT MAKES IT WORTH HAVING: a Claude agent may NEVER fill a Grok seat. If the transport
   is down the seat is reported EMPTY — panel 3 becomes 2, named in the payload — because a panel
   that looks diverse while being an echo is worse than a panel that is honestly short. */
const GROK_CLI = '/Users/konyo/.grok/bin/grok'
const THIRD_EYE_SEATS = []            // every consult attempted, reached or not — the ledger IS the report
const THIRD_EYE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['reached', 'transport', 'verdict', 'concerns', 'reason'],
  properties: {
    reached:   { type: 'boolean', description: 'true ONLY if a non-Claude model actually answered' },
    transport: { type: 'string', enum: ['cli', 'mcp', 'claude-standin', 'none'] },
    verdict:   { type: 'string', enum: ['no concerns', 'concerns', 'refuted', 'unreachable'] },
    concerns:  { type: 'array', items: { type: 'string' }, description: 'verbatim points it raised; [] if none' },
    severity:  { type: 'string', enum: ['none', 'minor', 'major', 'blocking'] },
    reason:    { type: 'string', description: 'if unreachable, the ACTUAL error text — not a guess' },
  },
}
// How every seat talks to Grok. Written once so four seats cannot drift apart.
function grokHow(question, opts = {}) {
  const cwd = opts.cwd || '.'
  return (
    `TRANSPORT — do this literally, in this order, and report which one answered.\n` +
    `1. CLI FIRST (this is the working path). Write the question below to a temp file with the Write ` +
    `tool (e.g. /tmp/te_$$.txt), then run with the Bash tool:\n` +
    `   ${GROK_CLI} --cwd ${cwd} --prompt-file <file> --no-memory --disable-web-search --output-format plain\n` +
    `   Set the Bash tool's OWN timeout parameter to 180000. Do NOT use the \`timeout\` binary — it is ` +
    `not installed on this Mac and the command would die with command-not-found.\n` +
    `2. Only if the CLI errors or returns empty, try the MCP fallback: ToolSearch for ` +
    `mcp__grok-mcp__chat and call it. It is EXPECTED to fail with "Incorrect API key provided"; that ` +
    `is a known-dead key, not something to debug or work around.\n` +
    `3. If neither answered, return reached:false, transport:'none', verdict:'unreachable', and put ` +
    `the ACTUAL error text in reason. \n` +
    `\n🚫 YOU ARE A COURIER, NOT THE THIRD EYE. Never answer the question yourself, never paraphrase ` +
    `what you think Grok would say, and never let your own opinion reach the concerns[] array. An ` +
    `empty seat honestly reported is the correct outcome when the transport is down; a Claude opinion ` +
    `wearing a Grok label is the one outcome that destroys the entire point of this phase.\n` +
    `\n──── QUESTION TO SEND ────\n${question}\n──── END QUESTION ────\n` +
    `\nReturn Grok's answer: concerns[] verbatim from its reply (or [] if it raised none).`
  )
}
// One consult. Records itself in the ledger no matter how it ends.
async function thirdEyeAsk(seat, question, phaseName, opts = {}) {
  if (THIRD_EYE === 'off') {
    THIRD_EYE_SEATS.push({ seat, ran: false, reached: false, transport: 'none',
      reason: 'thirdEye:false — the caller turned the third eye off' })
    return null
  }
  const standin = THIRD_EYE === 'claude'
  const prompt = standin
    ? `⚠ DEGRADED THIRD EYE — you are a CLAUDE stand-in, explicitly requested with thirdEye:'claude'. ` +
      `You are the SAME model family as everything you are reviewing, so you share its blind spots. ` +
      `Say so in reason, set transport:'claude-standin', and answer the question as adversarially as ` +
      `you can anyway.\n\n${question}`
    : grokHow(question, opts)
  const r = await spawn(prompt, {
    agentType: 'general-purpose', model: 'sonnet', effort: 'low',
    label: `thirdEye:${seat}`, phase: phaseName, schema: THIRD_EYE_SCHEMA,
  }).catch(err => ({ reached: false, transport: 'none', verdict: 'unreachable', concerns: [],
    reason: `the courier agent died: ${err && err.message ? err.message : String(err)}` }))
  const rec = { seat, ran: true, reached: !!(r && r.reached), transport: (r && r.transport) || 'none',
    verdict: (r && r.verdict) || 'unreachable', concerns: (r && r.concerns) || [],
    severity: (r && r.severity) || 'none', reason: (r && r.reason) || '' }
  // A stand-in is never counted as the real thing, whatever it reports about itself.
  if (standin) { rec.reached = false; rec.transport = 'claude-standin' }
  THIRD_EYE_SEATS.push(rec)
  log(rec.reached
    ? `👁 THIRD EYE [${seat}] via ${rec.transport}: ${rec.verdict}` +
      (rec.concerns.length ? ` — ${rec.concerns.slice(0, 2).join(' | ').slice(0, 220)}` : '')
    : `👁 THIRD EYE [${seat}] DID NOT SPEAK (${rec.transport}) — ${String(rec.reason).slice(0, 180)}`)
  return rec
}

const LADDER = ['haiku', 'sonnet', 'opus']               // the cost-scaling ladder
const bump = (tier) => LADDER[Math.min(LADDER.indexOf(tier) + 1, LADDER.length - 1)] || 'sonnet'
// THE MODEL-TIER KNOB, in ONE place. Standard keeps the cost-scaling ladder exactly as it was; max
// forces Opus everywhere, which is what konyo-workflow-max.js did by hardcoding 'opus' at every call
// site. Note bump('opus') === 'opus', so at max the escalation ladder is a harmless no-op and needs
// no branch of its own — the rework round still happens, it just cannot escalate further.
const tierFor = (t) => MAXQ ? 'opus' : (t || 'sonnet')
const effortFor = (tier) => MAXQ ? 'high' : tier === 'opus' ? 'high' : tier === 'sonnet' ? 'medium' : 'low'
const budgetOK = () => !budget.total || budget.remaining() > FLOOR
const mode = APPLY ? 'APPLY (agents edit files)' : 'DRY-RUN (agents propose diffs, nothing written)'

// ---------- schemas ----------
// TRIAGE — one cheap call that decides how much machinery this task actually deserves, BEFORE any
// of it is bought. Written after a run that spent ~106 agents and 2.5 hours producing one planning
// document, while the same night's hardest work — finding why CI had been red for 30 versions —
// was solved by one process reading logs. Fan-out does not make a root cause appear faster; it
// produces N opinions about it that still have to be checked one at a time.
const LOCK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['acquired', 'key'],
  properties: {
    acquired:      { type: 'boolean', description: 'true = this run now owns the tree' },
    key:           { type: 'string',  description: 'the working tree this lock covers' },
    token:         { type: 'string',  description: 'unique id written into our lock file; needed to release it' },
    purged_stale:  { type: 'number',  description: 'how many expired locks were cleaned up' },
    holder_token:  { type: 'string',  description: 'if not acquired: the token of the live lock' },
    holder_since:  { type: 'string',  description: 'if not acquired: when the holder took it' },
    holder_expires:{ type: 'string',  description: 'if not acquired: when the holder lock expires on its own' },
    holder_task:   { type: 'string',  description: 'if not acquired: the holder task snippet' },
  },
}

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
          risk:        { type: 'string', enum: ['low', 'medium', 'high'], description: 'blast radius if done wrong (the max architect panel tags this; optional at standard)' },
        },
      },
    },
  },
}
// The max architect panel merges 3 candidate plans; the judge must say WHY its merge beats them,
// or "the best plan" is an assertion nobody can check.
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
// LAW17 — THE FAT VERSION BAR, as one constant so the architect panel, the judge and the bar itself
// state the same law in the same words.
const FAT_LAW =
  `FAT VERSION LAW (LAW17): ONE version integer must package real work — (A) >=3 user-visible ` +
  `outcomes in one theme, OR (B) one structural bug with root cause + verification + prevention. ` +
  `A plan whose entire content is one toast / one label / one i18n key / one CSS one-liner / docs ` +
  `fluff does not clear the bar; expand the plan until it does, or state plainly that the work is ` +
  `below a version stamp. Never micro-stamp one version per one-liner. This is NOT a licence to ` +
  `inflate the fleet: the triage agent cap stands — fold MORE OUTCOMES into the SAME items, do not ` +
  `spawn more items.`
const BUILD_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file', 'summary', 'changes', 'self_check', 'files_touched'],
  properties: {
    file:       { type: 'string' },
    summary:    { type: 'string' },
    changes:    { type: 'string', description: 'unified diff (dry-run) or description of edits applied' },
    self_check: { type: 'string', description: 'what you verified before handing off' },
    /* v8 — one owner per file was instructed everywhere and verified nowhere. The gate checks the
       declaration against git now; see the MAX shipper for the full reasoning. */
    files_touched: { type: 'array', items: { type: 'string' }, maxItems: 40,
                     description: 'EVERY file you created, edited or deleted — relative paths. Do not omit files.' },
    /* v9 — the carrier for isolated builds. Empty in shared-tree mode, where the edit is already in
       the repo. In isolate mode this IS the work: the worktree may be cleaned up the moment the
       agent returns, so a patch that only exists on disk is a patch that can evaporate. */
    patch: { type: 'string', description: 'ISOLATE MODE ONLY: the complete unified diff of your change (git diff output), applyable with `git apply` from the repo root. Empty string when not in isolate mode.' },
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
  const tier = tierFor(item.tier)          // standard: the plan's own tier. max: Opus, always.
  const rw = reworkNote
    ? `\n\n${MAXQ ? 'SKEPTICS REFUTED' : 'FABLE GATE REJECTED'} THE LAST ATTEMPT — address ALL of this: ${reworkNote}`
    : ''
  const act = !APPLY
    ? `Do NOT write anything. Return the change as a unified diff in "changes".`
    : ISOLATE
      ? `You are running in your OWN GIT WORKTREE — an isolated copy of the repo. Edit ${item.file} ` +
        `here as normal, then produce the patch that carries your work back:\n` +
        `  git add -A && git diff --cached\n` +
        `Return that COMPLETE unified diff in "patch". This is not bookkeeping — your worktree may ` +
        `be discarded the moment you return, so a change that exists only on your disk is a change ` +
        `that is LOST. Do NOT commit, push, or touch the main repo. Touch NO file but ${item.file}.`
      : `Make the edit directly to ${item.file}. Touch NO other file — you are the sole owner of this one.`
  return spawn(
    `${MAXQ ? 'MAX-QUALITY' : 'KONYO WORKFLOW'} build agent (tier=${tier}). Task context: ${TASK}\n` +
    `You own exactly ONE file: ${item.file}${item.kind ? ` (kind=${item.kind})` : ''}.\n` +
    `Instruction: ${item.instruction}\n${act}${rw}\n` +
    `Be rigorous: trace the exact failure you are fixing, handle edge cases, match surrounding style, ` +
    `and in self_check state what you verified (compile/syntax/logic-trace). Return the structured result.` + CRAFT_RULES,
    Object.assign(
      { model: tier, effort: effortFor(tier), label: `${reworkNote ? 'rework' : 'build'}:${tier}:${item.file}`,
        phase: reworkNote ? 'Rework' : 'Build+Gate', schema: BUILD_SCHEMA },
      ISOLATE ? { isolation: 'worktree' } : {})
  ).then(b => ({ item, build: b })).catch(() => ({ item, build: null }))
}

function gateAgent(built) {
  if (!built || !built.build) return Promise.resolve({ ...built, gate: { verdict: 'rework', severity: 'blocking', reason: 'build agent produced no output' } })
  return spawn(
    `FABLE MERGE GATE. Task: ${TASK}\nFile: ${built.item.file}\n` +
    `Proposed change summary: ${built.build.summary}\nChanges:\n${built.build.changes}\n` +
    `Judge ONLY this file's change: correctness, and whether it satisfies the instruction ` +
    `"${built.item.instruction}". verdict=pass only if merge-ready.\n` +
    `OWNERSHIP — CHECK IT, DO NOT ASSUME IT. This builder owned exactly ONE file: ${built.item.file}. ` +
    `It declared it touched: ${JSON.stringify((built.build && built.build.files_touched) || [])}. ` +
    `Run \`git status --porcelain\` and compare. verdict=rework if it created, edited or deleted ` +
    `anything outside its brief, or if the declaration does not match git. Other agents share this ` +
    `tree, so ignore changes that clearly belong to another item — judge only whether THIS builder ` +
    `went outside ${built.item.file}. "Scope creep" used to be judged from the diff the builder ` +
    `chose to show you; now it is judged from what the repo actually says.`,
    { model: 'fable', effort: 'medium', label: `gate:${built.item.file}`, phase: 'Build+Gate', schema: GATE_SCHEMA }
  ).then(g => ({ ...built, gate: g })).catch(() => ({ ...built, gate: { verdict: 'rework', severity: 'major', reason: 'gate errored' } }))
}

/* ── THE SKEPTIC PANEL — ONE IMPLEMENTATION, BOTH QUALITIES ──────────────────────────────────────
   Before the merge the same idea existed TWICE: this script spawned N anonymous "SKEPTIC i of N"
   agents as a third pipeline stage, and max ran a diverse-LENS panel as the gate itself. Two copies
   of one vote tally is exactly how the v14 threshold bug survived in one file after being fixed in
   the other. So the lenses, the panel and the ARITHMETIC live here once; the flag only chooses how
   many lenses are bought and whether the panel IS the gate (max) or rides behind Fable (standard). */
const LENSES = [
  'CORRECTNESS — does it actually work? walk the logic, hit edge cases, off-by-ones, nulls, races. Assume it is broken and try to prove it.',
  'SAFETY & SCOPE — did it touch anything it should NOT? any regression, broken invariant, security/secret leak, or scope-creep beyond the instruction?',
  'REPRODUCE — trace the SPECIFIC failure this change claims to fix; confirm the change truly addresses that failure and not just its symptom.',
]

// v4 — TRIAGE'S NUMBER IS AUTHORITATIVE (it asked for 1 and max bought 3, every time).
// v12 — an EXPLICIT {skeptics:N} outranks triage.
// v17 — THE FLOOR: a heuristic may size the panel DOWN, never to nothing.
function activeLenses() {
  const want = SKEPTICS_OVERRIDE !== null
    ? SKEPTICS_OVERRIDE
    : (globalThis.__triage && typeof globalThis.__triage.skeptics === 'number')
      ? globalThis.__triage.skeptics
      // No triage number at all: max is an adversarial-gate workflow by definition, so its default
      // is the full panel. Standard's schema says "0 unless cost_of_wrong is high" — its review is
      // the Fable gate on every merge — so its default stays 0.
      : (MAXQ ? LENSES.length : 0)
  const floored = Math.max(0, Math.min(LENSES.length, want))
  /* v17 — NEVER AN EMPTY PANEL ON A RUN THAT WRITES FILES. 2026-08-04: triage returned skeptics:0
     for a run that WAS shipping code. Defensible reasoning, wrong authority — zero lenses means
     every built change passes unreviewed. A MAX run floors at 1 always (the adversarial gate is
     what MAX IS, and an empty panel would make the gate structurally incapable of refusing). A
     standard run floors at 1 whenever it is APPLYing, which is when being unreviewed can cost
     something. An EXPLICIT {skeptics:0} from a human is still honoured — that is a person knowingly
     opting out — and is RECORDED so the report cannot imply a gate that never sat. */
  /* v18 — THE MAX FLOOR IS 2, NOT 1, AND THE REASON IS ARITHMETIC. Measured on the first real v18
     run (D2R console queue, 2026-08-04): triage read eight already-diagnosed fixes as
     `cost_of_wrong: low` and asked for ZERO skeptics — on a run that re-extracts binary game art
     and restructures a column. The v17 floor caught it, but flooring to ONE leaves a gate that is
     technically able to refuse and practically toothless:
       · a 1-seat panel is one opinion, and `refutedN * 2 > cast` means that single voice decides
         alone — no corroboration, which is the whole point of a panel;
       · the third eye only takes a seat when the panel has >= 2 (so a dead transport can never
         empty a floor panel), so a 1-seat floor silently costs MAX its MODEL DIVERSITY too —
         the one thing a same-family panel cannot buy at any size.
     At 2 seats a refusal needs 2 votes, and one of those seats is Grok. That is the smallest panel
     that is still a panel. Standard keeps the 1-seat floor: its gate is Fable on every merge, and
     its whole point is to be cheap.
     An EXPLICIT {skeptics:N} from a human ALWAYS wins, including 0 and 1 — a person knowingly
     opting out is not a heuristic under-buying, and it is RECORDED either way. */
  const FLOOR_N = MAXQ ? Math.min(2, LENSES.length) : 1
  if (SKEPTICS_OVERRIDE === null && floored < FLOOR_N && (MAXQ || APPLY)) {
    if (!globalThis.__skepticFloored) {
      globalThis.__skepticFloored = true
      log(`⚠ SKEPTIC FLOOR: triage asked for ${floored} skeptic(s) on a run that ` +
          (MAXQ ? 'is MAX quality' : 'WRITES FILES') + ` — a change does not ship unreviewed. Using ${FLOOR_N}.` +
          (MAXQ && FLOOR_N === 2 ? ' (2 is the MAX floor: a refusal needs corroboration, and the third eye needs a seat.)' : ''))
    }
    return LENSES.slice(0, FLOOR_N)
  }
  if (floored === 0 && SKEPTICS_OVERRIDE !== null) globalThis.__skepticsOptedOut = true
  return LENSES.slice(0, floored)
}

/* v14 — THE VOTE TALLY, AND THERE IS EXACTLY ONE OF IT.
   · Votes are counted as votes CAST, never votes BOUGHT. spawn() returns null on a ceiling refusal
     WITHOUT throwing, so neither .catch nor SPAWN_ERRORS fires — measuring a threshold against the
     panel SIZE let an item pass "skeptic-approved" having faced nobody.
   · ZERO votes cast is REWORK, never a pass. Unreviewed is not approved.
   · STRICT MAJORITY of the cast votes: 3 cast needs 2, 2 cast needs 2, 1 cast needs 1. The old
     `refutedN >= 2` measured against a hardcoded 3 meant a legitimate 1-skeptic panel could NEVER
     reach 2, so the flagship gate could not refuse anything while the payload still advertised it. */
function tallyVotes(votes, panel, file) {
  const v = votes.filter(Boolean)
  const cast = v.length
  if (cast === 0) {
    log(`SKEPTIC PANEL PRODUCED NO VOTES for ${file} (refused or died) — not approved.`)
    return { verdict: 'rework', refutedN: 0, votes: 0, panel,
      reasons: ['the skeptic panel produced no votes (refused or died) — unreviewed is not approved'] }
  }
  if (cast < panel) log(`⚠ THIN SKEPTIC PANEL on ${file}: ${cast}/${panel} vote(s) cast.`)
  const kills = v.filter(x => x.refuted)
  const refutedN = kills.length
  return { verdict: refutedN * 2 > cast ? 'rework' : 'pass', refutedN, votes: cast, panel,
    reasons: kills.map(x => (x && x.reason) || 'no reason given') }
}

// One skeptic per lens, in parallel. A skeptic that DIES must not count as APPROVAL: skeptics are
// only bought when being wrong is expensive, which is exactly when an unverified change must not
// pass by default.
function runSkeptics(built, phaseName) {
  const lenses = activeLenses()
  if (!lenses.length) {
    return Promise.resolve({ verdict: 'pass', refutedN: 0, votes: 0, panel: 0,
      reasons: ['no skeptics were bought for this run'] })
  }
  /* v18 — SEAT 2, AND THE STRONGEST OF THE FOUR. Konyo's own instinct: put the third eye on the
     panel. Three Claude skeptics wear three different LENSES but carry the same PRIORS, and a
     strict-majority vote is precisely the mechanism that correlated blind spots defeat — if the
     failure mode is one Claude cannot see, three of them cannot see it either, and the panel votes
     3-0 to ship a bug. Model diversity is stronger than lens diversity, so the LAST seat is served
     by Grok reading the real diff.
     Only when the panel has >= 2 seats: at a 1-seat floor, handing the only vote to a transport that
     might be down would turn "Grok is unreachable" into "nothing reviewed this", and tallyVotes
     correctly treats zero votes as REWORK. Better a Claude floor seat than an empty panel.
     An unreachable Grok casts NO vote — it never silently becomes a Claude opinion. tallyVotes
     counts votes CAST, so the panel honestly reads 2/3 and logs itself THIN. */
  const grokSeat = (THIRD_EYE === 'grok' && lenses.length >= 2) ? lenses.length - 1 : -1
  return parallel(lenses.map((lens, i) => i === grokSeat ? () => thirdEyeAsk(
    `skeptic:${built.item.file}`,
    `You are one seat on an adversarial review panel, and you are here because you are a DIFFERENT ` +
    `model from the one that wrote this change and from the other reviewers. Your job is to find what ` +
    `they cannot.\n\nTASK: ${TASK}\nFILE: ${built.item.file}\n` +
    `INSTRUCTION IT WAS MEANT TO SATISFY: ${built.item.instruction}\n` +
    `WHAT IT CLAIMS TO HAVE DONE: ${built.build && built.build.summary}\n` +
    `THE ACTUAL CHANGE:\n${built.build && built.build.changes}\n` +
    `ITS OWN SELF-CHECK: ${built.build && built.build.self_check}\n\n` +
    `Try HARD to REFUTE it: the input that breaks it, the case it silently mishandles, the claim it ` +
    `cannot back. You may read the files in this directory to check for yourself — do not take the ` +
    `summary's word for what the code does. Judge the CHANGE, not the description of it.\n` +
    `Answer refuted/not, with a concrete reason. If you are not convinced it is correct AND safe AND ` +
    `complete, refute it — being agreeable here has no value.`,
    phaseName, { cwd: '.' })
    .then(rec => {
      if (!rec || !rec.reached) return null      // an empty seat, honestly empty — never a Claude vote
      const refuted = rec.verdict === 'refuted' ||
        (rec.concerns.length > 0 && (rec.severity === 'major' || rec.severity === 'blocking'))
      return { refuted, severity: rec.severity || (refuted ? 'major' : 'none'),
        reason: `[third eye / ${rec.transport}] ${(rec.concerns[0] || rec.reason || 'no concern raised')}` }
    }) : () => spawn(
    `ADVERSARIAL SKEPTIC ${i + 1} of ${lenses.length} — lens: ${lens}\nTask: ${TASK}\nFile: ${built.item.file}\n` +
    `Instruction it was meant to satisfy: ${built.item.instruction}\n` +
    `WHAT IT CLAIMS: ${built.build && built.build.summary}\n` +
    `Proposed change:\n${built.build && built.build.changes}\n` +
    `Builder's self-check: ${built.build && built.build.self_check}\n` +
    `Through YOUR lens only, try HARD to REFUTE this change — find the input that breaks it, the case ` +
    `it silently mishandles, or the claim it cannot back. Default to refuted=true if you are not ` +
    `convinced it is correct AND safe AND complete.\n` +
    `OWNERSHIP — CHECK IT, DO NOT ASSUME IT. This builder owned exactly ONE file: ${built.item.file}. ` +
    `It declared it touched: ${JSON.stringify((built.build && built.build.files_touched) || [])}. ` +
    `Run \`git status --porcelain\` (and \`git diff --name-only\`) and compare. REFUTE as a BLOCKER if ` +
    `any file outside its brief was created, edited or deleted, or if the declaration does not match ` +
    `what git shows. Other agents share this tree, so ignore changes that clearly belong to another ` +
    `item — judge only whether THIS builder went outside ${built.item.file}.\n` +
    `Also refute micro-version inflation: one toast / one label / one i18n key / one CSS one-liner ` +
    `claiming a full version stamp is a BLOCKER under LAW17, not a nit.`,
    { model: 'opus', effort: 'high', phase: phaseName, label: `skeptic${i + 1}:${built.item.file}`,
      schema: SKEPTIC_SCHEMA }
  ).catch(() => ({ refuted: true, severity: 'major', reason: 'skeptic errored — an unverified change is refuted by default' }))
  )).then(votes => tallyVotes(votes, lenses.length, built.item.file))
}

// MAX's gate: the panel IS the gate. Nothing else stands between a build and a pass.
function adversarialGate(built) {
  if (!built || !built.build) {
    return Promise.resolve({ ...built, gate: { verdict: 'rework', severity: 'blocking',
      reason: 'build agent produced no output', reasons: ['build produced no output'] } })
  }
  return runSkeptics(built, 'Adversarial gate').then(t => ({ ...built, gate: {
    verdict: t.verdict, severity: t.verdict === 'rework' ? 'major' : 'none',
    reason: t.reasons.join(' | ') || 'no skeptic refuted it',
    refutedN: t.refutedN, votes: t.votes, panel: t.panel, reasons: t.reasons } }))
}

// STANDARD's third stage: Fable has already passed it; the skeptics then try to refute it.
function skepticStage(gated) {
  if (MAXQ) return gated                       // at max the panel already ran AS the gate
  if (!gated || !gated.gate || gated.gate.verdict !== 'pass') return gated
  if (!activeLenses().length) return gated
  return runSkeptics(gated, 'Build+Gate').then(t => {
    if (t.verdict === 'pass') return gated
    log(`SKEPTICS KILLED ${gated.item.file}: ${String(t.reasons[0] || 'no reason given').slice(0, 140)}`)
    return { ...gated, gate: { verdict: 'rework', severity: 'major',
      reason: t.votes === 0 ? t.reasons[0] : `majority of skeptics refuted it: ${t.reasons[0] || 'no reason given'}`,
      refutedN: t.refutedN, votes: t.votes, panel: t.panel, reasons: t.reasons } }
  })
}

// THE GATE, CHOSEN ONCE. Not a ternary scattered through the pipeline.
const gateFor = MAXQ ? adversarialGate : gateAgent

/* ONE build+gate+rework body, used by the main Build phase AND by the max completeness loop. Before
   the merge these were two loops in two files with two sets of blocker wiring; a rework round added
   to one was a rework round missing from the other. `reworkStop` and `round` are module-level so the
   summary can report WHICH exit the loop took — a bound that is enforced and never REPORTED reads
   identically whether the loop went clean or was cut off with items still failing. */
let round = 1
let reworkStop = 'clean'
async function buildAndGate(itemsIn, label) {
  let res = await pipeline(
    itemsIn,
    it => buildAgent(it),
    built => gateFor(built),
    gated => skepticStage(gated)
  )
  res = res.filter(Boolean)
  let r = 1
  while (r < MAXROUNDS && budgetOK()) {
    const failing = res.filter(x => x.gate && x.gate.verdict === 'rework')
    if (!failing.length) break
    r++
    // v18.2 — PLAIN, NOT TEMPLATED. `phase(`Rework r${r}`)` opened a group named 'Rework r1'
    // while this round's builders carry `phase:'Rework'` (line ~489) — so the box the phase
    // opened was always EMPTY and the builders landed in a second box beside it. A templated
    // title can also never match a meta entry, which must be a static literal. The round is
    // already visible in the version label and in every agent's own label.
    phase('Rework')
    log(`${label}: round ${r} — ${failing.length} item(s) failed the gate → escalating up the ladder`)
    const redone = await pipeline(
      failing,
      x => { const esc = { ...x.item, tier: bump(x.item.tier) }
             return buildAgent(esc, (x.gate.reasons || [x.gate.reason]).filter(Boolean).join(' | ')).then(b => ({ ...b, item: esc })) },
      built => gateFor(built),
      gated => skepticStage(gated)
    )
    const byFile = new Map(res.map(x => [x.item.file, x]))
    for (const x of redone.filter(Boolean)) byFile.set(x.item.file, x)
    res = [...byFile.values()]
  }
  if (r > round) round = r
  if (res.some(x => x.gate && x.gate.verdict === 'rework')) {
    reworkStop = !budgetOK() ? 'budget-floor' : 'round-cap'
    log(`⚠ REWORK STOPPED (${reworkStop}) with item(s) still failing after ${r}/${MAXROUNDS} round(s).`)
  }
  return res
}

// ================= RUN =================
// These globals outlive a single run inside one engine process, so a stale value from a previous
// run would be reported as this run's. Reset them before anything reads them.
globalThis.__infeasible = null
globalThis.__skepticFloored = false
globalThis.__skepticsOptedOut = false
log(`KONYO WORKFLOW [${QUALITY.toUpperCase()}] · ${mode} · budget floor ${Math.round(FLOOR/1000)}k · ` +
    `max ${MAXROUNDS} rework round(s)` + (MAXQ ? ` · ${DRYROUNDS} dry completeness round(s)` : '') +
    (ISOLATE ? ' · ISOLATE+MERGE' : '') +
    ` · third eye ${THIRD_EYE === 'off' ? 'OFF' : THIRD_EYE === 'claude' ? 'CLAUDE STAND-IN (degraded)' : 'ON (grok)'}`)
// v18 — a flag we did not understand must never be a silent downgrade.
if (QUALITY_TYPO) log(`⚠ quality:"${QUALITY_ASKED}" is not a quality this workflow knows. ` +
    `Ran at MAX. The only value that buys the cheap ladder is exactly "standard".`)
if (MAXQ && !A?.quality) log('   (max is the default — pass {quality:"standard"} for the cost-scaled run)')

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

// 0) PREFLIGHT — take the workspace lock BEFORE spending anything. Same lock dir as max, so the two
// workflows genuinely exclude each other. Sonnet: this is `date`, `mkdir` and a JSON file.
phase('Preflight')
let lock = null
if (APPLY) {
  const taskSnip = TASK.slice(0, 120).replace(/\s+/g, ' ')
  lock = await spawn(
    `WORKSPACE LOCK — acquire. Pure mechanics, no judgement. Use Bash only.\n\n` +
    `1. LOCKDIR="$HOME/.claude/workflows/.locks"; mkdir -p "$LOCKDIR".\n` +
    `2. KEY = absolute path of the current working directory (\`pwd -P\`). Slugify for a filename: ` +
    `replace every "/" with "-" and strip a leading "-". LOCKFILE="$LOCKDIR/<slug>.json".\n` +
    `3. PURGE FIRST. NOW=$(date -u +%s) — INTEGER EPOCH SECONDS. For every *.json in "$LOCKDIR", read ` +
    `its "expires_epoch" and delete the file if it is numerically less than $NOW, using ` +
    `[ "$EXP" -lt "$NOW" ] — an INTEGER test. Do NOT compare ISO strings with [ a \\< b ]: that is ` +
    `invalid under zsh, the test silently fails, and a dead lock then survives forever and locks the ` +
    `human out of their own repo. Count deletions -> purged_stale. Malformed/unparseable counts as ` +
    `stale — delete it too; unreadable must never mean "held".\n` +
    `4. If "$LOCKFILE" still exists after the purge, another LIVE run owns this tree. Do NOT touch or ` +
    `overwrite it. Return acquired:false with its token/started_at/expires_at/task as holder_token / ` +
    `holder_since / holder_expires / holder_task.\n` +
    `5. Otherwise WRITE "$LOCKFILE" with exactly these keys, then return acquired:true:\n` +
    `   token         = a unique id you generate (e.g. "$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM")\n` +
    `   started_at    = now, ISO-8601 UTC (human-readable only)\n` +
    `   expires_at    = now + ${LOCK_TTL_MIN} minutes, ISO-8601 UTC (human-readable only)\n` +
    `   expires_epoch = $(( $(date -u +%s) + ${LOCK_TTL_MIN} * 60 ))  <- INTEGER, the field step 3\n` +
    `                   compares. MUST be present and numeric or the lock is unpurgeable.\n` +
    `   cwd           = the pwd from step 2\n` +
    `   task          = ${JSON.stringify(taskSnip)}\n` +
    `Return the token you wrote. Do not create, edit or delete anything outside "$LOCKDIR".`,
    { model: 'sonnet', effort: 'low', phase: 'Preflight', label: 'lock:acquire', schema: LOCK_SCHEMA },
    true                              // reserved: the lock is taken before anything else spends
  ).catch(() => null)

  if (lock && lock.acquired === false && !IGNORE_LOCK) {
    log(`⛔ WORKSPACE LOCKED — another run is already editing this tree.`)
    log(`   tree     : ${lock.key}`)
    log(`   held by  : ${lock.holder_token || '(unknown)'} since ${lock.holder_since || '(unknown)'}`)
    log(`   its task : ${lock.holder_task || '(not recorded)'}`)
    log(`   expires  : ${lock.holder_expires || '(unknown)'} (locks self-expire after ${LOCK_TTL_MIN}m)`)
    log(`   Refusing to start. Two fleets editing one tree silently overwrite each other.`)
    log(`   Wait for it, stop it, or re-run with {ignoreLock:true} if you KNOW the holder is dead.`)
    // v13 defect #4 — every exit routes through bail(), or it carries no verdict and no shippable.
    return bail({
      refused: 'workspace locked by another run',
      lock,
      fix: 'wait for the holder to finish, TaskStop it, or pass {ignoreLock:true} if it is dead',
      verdict: 'NOT RUN — refused at preflight; another run holds this tree',
    })
  }
  if (lock && lock.acquired === false && IGNORE_LOCK) {
    log(`⚠ WORKSPACE LOCKED but {ignoreLock:true} was passed — proceeding over ${lock.holder_token || '(unknown)'}. ` +
        `If that run is alive, one of you will lose work.`)
  }
  if (lock && lock.acquired) {
    log(`🔒 Workspace lock taken on ${lock.key} (expires in ${LOCK_TTL_MIN}m).` +
        (lock.purged_stale ? ` Purged ${lock.purged_stale} stale lock(s).` : ''))
  }
  if (!lock) log(`⚠ Preflight lock could not be established — proceeding UNLOCKED.`)
} else {
  log('Preflight: dry-run writes nothing, so no workspace lock is needed.')
}

// Best-effort release; the TTL is the real guarantee.
async function releaseLock() {
  if (!lock || !lock.acquired || !lock.token) return null
  return spawn(
    `WORKSPACE LOCK — release. Bash only, no judgement.\n` +
    `LOCKDIR="$HOME/.claude/workflows/.locks"\n` +
    `Find the file in "$LOCKDIR" whose "token" field is exactly ${JSON.stringify(lock.token)} ` +
    `(e.g. \`grep -l\`). Delete ONLY that file — the token match is what proves it is still OUR lock ` +
    `and not a later run's that reused the same path. If no file carries that token, it was already ` +
    `released or expired: change nothing and say so.\n` +
    `Return {acquired:false, key:"released"} if you deleted it, else {acquired:false, key:"not-ours"}. ` +
    `Touch nothing outside "$LOCKDIR".`,
    { model: 'sonnet', effort: 'low', phase: 'Synthesize', label: 'lock:release', schema: LOCK_SCHEMA },
    true                              // reserved: a ceiling that eats the release locks the tree for the whole TTL
  ).catch(() => null)
}

phase('Triage')
if (!APPLY && wantsAFile(TASK)) {
  log('⚠ TRIAGE REFUSED: this is a DRY-RUN (apply:false) but the task asks agents to WRITE A FILE.')
  log('  Nothing can satisfy that, so every item would fail its gate and rework would multiply.')
  log('  Re-run with apply:true, or ask for the content in the RESULT instead of on disk.')
  return bail({ refused: 'dry-run with a file-shaped deliverable', fix: 'apply:true, or drop the file deliverable' })
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
  /* v17 — THE SAME SKEPTIC FLOOR AS MAX. Konyo: "both of them need to be treated exactly the same!"
     This script's schema says "0 unless cost_of_wrong is high", so a 0 here is by DESIGN — its
     review is the Fable gate on every merge, not a panel. The floor is still worth having for the
     same reason it is in MAX: on 2026-08-04 triage chose 0 for a run that WAS shipping code, and a
     heuristic must not be able to remove the last independent look at a change. Triage may size the
     panel DOWN; it may not size it to nothing. An explicit human {skeptics:0} is still honoured —
     that is a person knowingly opting out — and is recorded so the report cannot imply a gate that
     never sat. Cost note: this buys at most one extra agent per item on APPLY runs. */
  /* v18 — ONE FLOOR, ONE AUTHORITY, AND THE RAW ASK SURVIVES.
     There were TWO floors: this site (which flattened any 0 to 1) and activeLenses() (the real,
     quality-aware floor). Two implementations of one rule is precisely the drift this merge exists
     to end — and on the FIRST REAL v18 run they disagreed OUT LOUD: the logs said "using 1" and
     "TRIAGE BOUGHT 1 SKEPTIC(S)" while the panel that actually sat was 2.
     Worse, this site OVERWROTE triage.skeptics with its own floored value, destroying the raw ask,
     so nothing downstream could tell "triage wanted 0 and was floored" from "triage wanted 1".
     activeLenses() is now the ONLY floor. This site records what triage ASKED for, and announces
     what will ACTUALLY sit. */
  const skAsked = triage.skeptics
  const sk = SKEPTICS_OVERRIDE != null ? SKEPTICS_OVERRIDE : skAsked
  if (sk === 0 && SKEPTICS_OVERRIDE != null) globalThis.__skepticsOptedOut = true
  log(`TRIAGE \u2192 ${triage.tier.toUpperCase()} \u00b7 ${triage.shape} \u00b7 ${triage.parallelism} \u00b7 cost-of-wrong ${triage.cost_of_wrong}`)
  if (triage.work_list_known === false) log('  (work-list unknown \u2014 scout first, then fan out over what is found)')
  if (triage.tier === 'direct' && !FORCE) {
    log('\u26d4 TRIAGE SAYS DO THIS DIRECTLY \u2014 spawning nothing.')
    log(`  ${triage.why}`)
    log('  If you disagree, re-run with force:true.')
    await releaseLock()          // never hold the tree on a path that does no work
    return bail({ refused: 'triage says direct', triage, advice: 'do it in the main loop; a fleet would be slower and dearer here', verdict: 'NOT RUN \u2014 triage judged this cheaper in the main loop; nothing was attempted' })
  }
  globalThis.__triage = { ...triage, skeptics: sk, skeptics_asked: skAsked }
  // Ask the single authority what will really sit, so the number announced is the number that
  // reviews the code. activeLenses() emits its own floor warning, once.
  const skEff = activeLenses().length
  log(`  \u2248${triage.est_agents} agents, ${skEff} skeptic(s) per item` +
      (skEff !== sk ? ` (triage asked for ${skAsked})` : '') + ` \u2014 ${triage.why}`)
}

// 1) ARCHITECT — one Opus architect at standard, a 3-angle panel + judge at max.
// BOTH branches assign the SAME `plan`, BOTH bail() when no plan comes back, and BOTH fall through
// into the SAME one-owner-per-file dedupe and the SAME trim. The panel is an EXTRA PHASE, not a
// different pipeline.
// v18.2 — ONE TITLE FOR ONE STEP. This used to open 'Architect panel' at max and 'Architect'
// at standard, so meta had to declare BOTH — and whichever one the run did not take sat in
// the progress tree forever as a phase that never happened. Since max is now the DEFAULT,
// that dead row appeared on almost every run. It is one step either way: decide the plan.
// The quality only changes how many candidates are bought, which the detail string says.
phase('Architect')
let plan = null
if (MAXQ) {
  const ANGLES = [
    'RISK-FIRST: order items by blast radius; isolate the highest-risk change and make it the most defensively specified.',
    'CORRECTNESS-FIRST: decompose so each item has a single, testable, unambiguous fix; no item bundles two concerns.',
    'SIMPLEST-ROBUST: the smallest set of one-owner-per-file changes that fully solves it with no scope creep.',
  ]
  const candidatePlans = (await parallel(ANGLES.map((angle, i) => () =>
    spawn(
      `ARCHITECT (${angle}) for a MAX-QUALITY fix run. Decompose this task into independent work items, ` +
      `ONE OWNER PER FILE (no file appears twice). Read the repo to ground paths. Tag each item's risk, ` +
      `and give each a tier (it will be built by Opus regardless — tier is recorded for the report).\n` +
      (globalThis.__triage && globalThis.__triage.est_agents
        ? `\nTRIAGE SIZED THIS RUN at about ${globalThis.__triage.est_agents} agents. Produce AT MOST ` +
          `${Math.max(1, Math.min(24, globalThis.__triage.est_agents))} items.\n` : '') +
      `\n${FAT_LAW}\n\nTASK: ${TASK}`,
      { model: 'opus', effort: 'high', label: `architect:${i + 1}`, phase: 'Architect', schema: PLAN_SCHEMA }
    ).catch(() => null)
  ))).filter(Boolean)
  if (!candidatePlans.length) { log('No architect produced a plan.'); return bail({ error: 'no plan' }) }
  plan = await spawn(
    `JUDGE + MERGE. You are given ${candidatePlans.length} candidate decomposition plans for the same task. ` +
    `Produce the single BEST one-owner-per-file plan: take the sharpest decomposition, graft the best items ` +
    `from the others, drop redundancy, ensure NO file is owned twice, and every item is a self-contained fix. ` +
    `Explain why in "why".\n\n` +
    `${FAT_LAW}\nThe merged plan must clear this bar; if the candidates together are still thin, say so in ` +
    `"why" rather than stamping a version on a one-liner.\n\n` +
    `TASK: ${TASK}\n\nCANDIDATES:\n${candidatePlans.map((p, i) => `--- Plan ${i + 1} (${p.version_label}) ---\n` +
      (p.items || []).map(it => `- [${it.risk || '?'}] ${it.file}: ${it.instruction}`).join('\n')).join('\n\n')}`,
    { model: 'opus', effort: 'high', label: 'architect:judge', phase: 'Architect', schema: JUDGE_SCHEMA }
  )
  if (plan === null) { log('CEILING: no budget for the judge.'); return bail({ error: 'ceiling' }) }
} else {
plan = await spawn(
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
if (plan === null) { log('CEILING: no budget for the plan.'); return bail({ error: 'ceiling' }) }
}
if (!plan || !plan.items) { log('Architect produced no plan.'); return bail({ error: 'no plan' }) }

// one-owner-per-file guarantee
const seen = new Set()
let items = plan.items.filter(it => { const k = it.file; if (seen.has(k)) return false; seen.add(k); return it })
// Triage's number is a CEILING, not a suggestion — an architect that returns 23 items for a job
// triaged at 6 is how a planning doc turns into a hundred agents. Trim, and say so out loud.
// Saying it out loud in the LOG is not saying it in the SUMMARY: a trimmed plan used to return
// ceiling.complete=true, so a run that dropped planned work read as a run that finished it.
const trimmedFromPlan = []
if (globalThis.__triage && globalThis.__triage.est_agents) {
  const cap = Math.max(1, Math.min(24, globalThis.__triage.est_agents))
  if (items.length > cap) {
    log(`TRIAGE CAP: architect returned ${items.length} items, triage sized this at ${cap} — trimming to ${cap}.`)
    for (const dropped of items.slice(cap)) trimmedFromPlan.push(dropped.file)
    items = items.slice(0, cap)
  }
}
/* THE AGENT-COUNT CEILING, ENFORCED AT THE PLAN (max only — ported from konyo-workflow-max.js).
   Each max item costs 1 Opus builder + its skeptic panel, so the fleet size is knowable BEFORE it is
   bought, and trimming here is honest in a way that dying halfway through the build is not. It feeds
   the SAME trimmedFromPlan array as the triage cap above, so the same PARTIAL verdict covers both.
   NOT applied at standard on purpose: standard's per-item cost is different (it buys a Fable gate
   too) and this second trim would silently shrink plans that run fine today. Standard is still
   bounded — by spawn()'s runtime counter, which is the REAL ceiling, is unconditional, and forces an
   UNVERIFIED verdict when it bites. This is a sizing heuristic, not the safeguard. */
if (MAXQ) {
  const RESERVE = 2                                   // synthesis + one spare
  const perItem = 1 + activeLenses().length
  const roomForItems = Math.max(1, Math.floor((MAX_AGENTS - SPENT - RESERVE) / Math.max(1, perItem)))
  if (items.length > roomForItems) {
    log(`CEILING: plan had ${items.length} items; ${roomForItems} fit under the ${MAX_AGENTS}-agent cap — the rest are REPORTED, not silently dropped.`)
    for (const dropped of items.slice(roomForItems)) trimmedFromPlan.push(dropped.file)
    items = items.slice(0, roomForItems)
  }
}
log(`Plan "${plan.version_label}": ${items.length} items — ` +
    `${items.filter(i=>i.tier==='haiku').length} haiku / ${items.filter(i=>i.tier==='sonnet').length} sonnet / ${items.filter(i=>i.tier==='opus').length} opus` +
    (MAXQ ? ' (all built by Opus at quality=max)' : ''))

/* ── v11 — FEASIBILITY, ANNOUNCED BEFORE THE MONEY IS SPENT (max only) ───────────────────────────
   The ceiling is honest but it is a TRIPWIRE: it tells you the run was truncated only once it has
   already truncated it, three quarters of the way in. The arithmetic that predicts it is available
   the moment the plan exists. This does NOT refuse — a truncated run is often exactly what the human
   wants. It refuses to let the truncation be a SURPRISE. */
if (MAXQ) {
  const skeptN   = activeLenses().length
  const GATES    = 5                       // completeness critic + render + fat bar + reachability + merge
  const RESERVE2 = 2                       // synthesis + one spare, mirrors spawn()'s reserve
  const worst    = SPENT + items.length * (1 + skeptN) * MAXROUNDS + GATES + RESERVE2
  log(`FEASIBILITY → ${items.length} item(s) x (1 build + ${skeptN} skeptic(s)) x up to ${MAXROUNDS} round(s) ` +
      `+ ${GATES} gates + ${RESERVE2} reserved ≈ ${worst} agents worst-case, against a ceiling of ${MAX_AGENTS}.`)
  if (worst > MAX_AGENTS) {
    log(`⚠ THIS PLAN CANNOT FULLY FINISH inside the ceiling. It will do the most valuable work first ` +
        `and report what it could not reach — it will NOT quietly claim completeness.`)
    log(`  To let it finish, re-run with {maxAgents:${worst}}. To keep the ceiling, expect a partial run.`)
    globalThis.__infeasible = { worst, cap: MAX_AGENTS, items: items.length, skeptics: skeptN }
  }
}

/* 2) THIRD-EYE SEAT 1 — THE PLAN, AFTER THE JUDGE HAS PICKED IT.
   Cheapest leverage in the run: one call, before a single builder spends anything, against the plan
   that was actually chosen (at max the judge has already collapsed three architect candidates into
   one, so this reviews the winner rather than the shortlist). A wrong plan wastes the whole fleet. */
if (USE_GROK) {
  phase('Third-eye')
  await thirdEyeAsk('plan',
    `You are the independent second opinion on an implementation plan. You are a DIFFERENT model from ` +
    `the one that wrote it — that is exactly why you were asked.\n\nTASK: ${TASK}\n\nPLAN:\n` +
    items.map(i => `- [${i.tier}] ${i.file}: ${i.instruction}`).join('\n') +
    `\n\nWhat is wrong with this plan? Look for: the wrong problem being solved, a step that cannot ` +
    `work as described, a missing step whose absence only shows up later, and any assumption that has ` +
    `not been checked. Reply with your top 3 concerns, or say plainly that you have none — an empty ` +
    `answer to be agreeable is worthless here.`,
    'Third-eye')
}

// 3) BUILD + GATE (pipeline, no barrier — each item gates the moment its build lands)
// Skeptics ride along ONLY when triage judged the cost of being wrong high. On the run that found
// two real counting bugs in a time-tracker they earned their keep; on a CSS fix they are pure spend.
// An EXPLICIT {skeptics:N} must survive a dead triage agent: SKEPTICS_OVERRIDE is only folded into
// __triage inside `if (triage)`, so when triage returned null the user's own request evaporated and
// the run bought no adversarial gate at all — silently.
const SKEPTICS = activeLenses().length
const SKEPTICS_SOURCE = SKEPTICS_OVERRIDE != null ? 'explicit'
  : ((globalThis.__triage && typeof globalThis.__triage.skeptics === 'number') ? 'triage' : 'default')
phase('Build+Gate')
if (SKEPTICS > 0) log(`${SKEPTICS} skeptic(s) will try to REFUTE each ${MAXQ ? 'built change (they ARE the gate)' : 'passing item'} (source: ${SKEPTICS_SOURCE}).`)
else log(`No skeptics this run (source: ${SKEPTICS_SOURCE}) — NOTHING will try to refute a passing item.`)
/* v12, RESTORED IN THE MERGE — SAY THE DOWNGRADE OUT LOUD. The merged file reported the skeptic
   count and its source, which is the same FACT, but not the same WARNING: a MAX run whose triage
   quietly bought 1 seat instead of 3 is still charged at MAX rates, and on 2026-08-03 Konyo found
   out only by reading triage.skeptics in the final JSON — "you paid max-workflow prices for a
   single-skeptic gate". A number in a log line is not a flag. Announce it while there is still
   time to kill the run and re-run it properly. */
{
  const _tri = globalThis.__triage
  // v18 — the RAW ask, not the post-floor number. Reporting the floored value made the warning say
  // "TRIAGE BOUGHT 1, NOT 3" when triage had actually asked for 0 and the floor had seated 2 —
  // three different numbers, and the log named the only one that was true of nothing.
  const _sk = _tri && typeof _tri.skeptics_asked === 'number' ? _tri.skeptics_asked
            : (_tri && typeof _tri.skeptics === 'number' ? _tri.skeptics : null)
  /* The override branch must swallow the whole case, not just the case where the numbers differ:
     a human who asked for {skeptics:1} chose it, and warning them that "triage bought 1, not 3" is
     crying wolf at their own decision. Only an UNASKED-FOR reduction is worth a warning. */
  if (SKEPTICS_OVERRIDE !== null) {
    if (_sk !== null && _sk !== SKEPTICS_OVERRIDE) log(`SKEPTICS → ${SKEPTICS_OVERRIDE} by explicit override (triage wanted ${_sk}).`)
  } else if (MAXQ && _sk !== null && _sk < LENSES.length) {
    log(`⚠ TRIAGE ASKED FOR ${_sk} SKEPTIC(S), NOT ${LENSES.length} — this is a MAX run at MAX prices ` +
        `with a reduced adversarial gate. The floor seated ${SKEPTICS}.`)
    log(`  Its reason: ${_tri.why || '(none given)'}`)
    log(`  If being wrong here is expensive, stop and re-run with {skeptics:${LENSES.length}}.`)
  }
}
let results = await buildAndGate(items, 'Build')

// 4) REWORK — the loop now lives INSIDE buildAndGate(), so the completeness critic's builds get the
// same rework rounds, the same blocker wiring and the same reporting as the first pass. `round` and
// `reworkStop` are set there.

// ────────────────────────────────────────────────────────────────────────────────────────────────
// 4.5) THE MERGE — the half `isolation:'worktree'` does not give you
// ────────────────────────────────────────────────────────────────────────────────────────────────
// Isolation without a merge is a silent no-op: every builder edits a throwaway copy, the run goes
// green, and the repo never changes. ONE agent applies patches SEQUENTIALLY to the live repo, with
// `git apply --check` first, so a conflict is REPORTED rather than forced.
// Gated on ISOLATE (an arg), NOT on quality: a standard {isolate:true} run that skipped this would
// discard every change it made and report success — which is the exact defect this stage exists for.
let merge = null
if (ISOLATE) {
  phase('Merge')
  const passing = results.filter(r => r && r.build && r.gate && r.gate.verdict === 'pass' && r.build.patch)
  const noPatch = results.filter(r => r && r.build && r.gate && r.gate.verdict === 'pass' && !r.build.patch)
  if (noPatch.length) {
    log(`⛔ MERGE: ${noPatch.length} passing item(s) returned NO PATCH — their work is in a discarded worktree and is LOST:`)
    noPatch.forEach(r => log(`   · ${r.item.file}`))
    // v14 — these items still count as `passed`. Lost work that reads as shipped work is the whole
    // defect class; the log alone never reached the summary.
    blocker('MERGE: WORK LOST — NO PATCH RETURNED',
      `${noPatch.length} passing item(s) produced no patch: ${noPatch.map(r => r.item.file).join(', ')}`)
  }
  if (!passing.length) {
    log(`MERGE: nothing to apply.`)
  } else {
    const bundle = passing.map((r, i) =>
      `--- PATCH ${i + 1} · owner: ${r.item.file} ---\n${r.build.patch}`).join('\n\n')
    merge = await spawn(
      `MERGE AGENT (Opus). You are in the REAL repository — not a worktree. ${passing.length} isolated ` +
      `builders each edited their own copy and returned a patch. Apply them to this repo.\n\n` +
      `FOR EACH patch, IN ORDER:\n` +
      `1. Write it to a temp file.\n` +
      `2. \`git apply --check <file>\` FIRST. If that fails, do NOT apply it — record the failure with ` +
      `git's exact error and move to the next patch. A forced or hand-reconstructed merge is worse ` +
      `than a reported conflict: it is a silent corruption of a file nobody is watching.\n` +
      `3. If the check passes, \`git apply <file>\` and confirm with \`git status --porcelain\`.\n` +
      `4. Never commit, never push, never \`git checkout\`/\`reset\` anything — you are applying work, ` +
      `not managing history, and a reset here destroys other agents' output.\n\n` +
      `Report applied[] and failed[] honestly. A patch you did not apply MUST appear in failed[] — ` +
      `this is the only record that work existed, and a silent drop means a builder's change is gone ` +
      `with the worktree that held it.\n\nPATCHES:\n${bundle}`,
      { model: 'opus', effort: 'high', phase: 'Merge', schema: {
          type: 'object', additionalProperties: false,
          required: ['applied', 'failed', 'notes'],
          properties: {
            applied: { type: 'array', maxItems: 60, items: { type: 'string' }, description: 'file per successfully applied patch' },
            failed:  { type: 'array', maxItems: 60, items: { type: 'string' }, description: 'file + git\'s exact reason, one line each' },
            notes:   { type: 'string' },
          },
        } }
    ).catch(() => null)
    if (merge && (merge.failed || []).length) {
      log(`⛔ MERGE: ${(merge.applied || []).length} applied, ${merge.failed.length} FAILED — those changes are NOT in the repo:`)
      merge.failed.slice(0, 8).forEach(x => log(`   · ${x}`))
      blocker('MERGE FAILED — CHANGES NOT IN THE REPO',
        `${merge.failed.length} patch(es) did not apply: ${merge.failed.slice(0, 3).join('; ')}`)
    } else if (merge) {
      log(`✅ Merge: ${(merge.applied || []).length}/${passing.length} patches applied to the real repo.`)
    } else {
      log(`⛔ MERGE AGENT DIED — ${passing.length} patch(es) were NOT applied. The repo is unchanged.`)
      blocker('MERGE AGENT DID NOT RUN',
        `${passing.length} patch(es) were never applied — the repo is unchanged while the results say passed`)
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// 4.7) THE COMPLETENESS CRITIC — max only, and NOT the same thing as the rework loop above
// ────────────────────────────────────────────────────────────────────────────────────────────────
// Rework asks "did the item I planned come out right?". This asks "what did I never plan at all?" —
// an untouched file that also needs the fix, an edge case no item covered, a follow-on the changes
// now require. It loops until DRYROUNDS consecutive rounds find nothing NEW.
// These four bindings are declared UNCONDITIONALLY, because the verdict and the returned payload
// read them at both qualities; only the LOOP is gated.
let dry = 0, critRound = 0
// v14 — THE LOOP HAS THREE NON-DRY EXITS AND ONLY ONE OF THEM USED TO BE VISIBLE. The round cap and
// budgetOK() going false both left ceiling.complete true and verdict 'OK' — a loop that stopped
// early read exactly like a loop that went dry. critStop records WHICH exit was taken.
let critStop = null
// Gaps the critic raised on a file an earlier item already owned. They were filtered out and the
// round was then counted DRY — a critic shouting "that file is STILL broken" recorded as "nothing
// missing". They no longer make a round dry, and they are carried into the summary.
const unbuiltGaps = []
/* v17 — ADAPTIVE, NOT A FIXED 3. A run ended `spent 20 / cap 24, hit:false` with FOUR agents unspent
   while completeness reported `rounds:3, wentDry:false, stoppedBecause:"hard 3-round cap"` and named
   four real gaps on the way out. The binding limit was that number, not the budget.
   CONVERGENCE (why this cannot spin): a round that surfaces no NEW file counts as DRY instead of
   continuing forever on gaps already owned. CRIT_MAX is an absurd backstop far above any real run. */
const CRIT_MAX = 12
if (MAXQ) {
  phase('Completeness')
  while (dry < DRYROUNDS && critRound < CRIT_MAX && budgetOK()) {
    // the critic can always find one more thing, and each gap costs a builder plus its skeptics —
    // so the loop asks the REAL counter, not an estimate of it
    if (SPENT >= Math.max(1, MAX_AGENTS - 2)) { log(`CEILING: stopping the completeness loop at ${SPENT}/${MAX_AGENTS} (2 held for the report).`); critStop = 'ceiling'; break }
    critRound++
    const done = results.filter(r => r && r.item && r.gate && r.gate.verdict === 'pass')
    const crit = await spawn(
      `COMPLETENESS CRITIC (Opus). Task: ${TASK}\nChanges made so far (passed the skeptic panel):\n` +
      done.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
      `\nWhat is MISSING to fully and correctly satisfy the task? Look for: an untouched file that also needs the fix, ` +
      `an edge case no item covered, a claim not yet verified, a follow-on the changes now require. ` +
      `If nothing material is missing, done=true with empty missing[]. Only list REAL, actionable gaps (one owner per file).`,
      { model: 'opus', effort: 'medium', phase: 'Completeness', schema: CRITIC_SCHEMA }
    // v14 — this used to be `.catch(() => ({ done:true, missing:[] }))`: a critic FAILURE converted
    // into "nothing is missing", which incremented `dry` and declared the run complete.
    ).catch(() => null)
    if (!crit) {
      critStop = SPENT >= MAX_AGENTS ? 'ceiling'
        : 'the completeness critic returned nothing (ceiling refused it or the agent died)'
      log(`Completeness: stopping — ${critStop}.`)
      break
    }
    const missing = crit.missing || []
    const fresh = missing.filter(m => !seen.has(m.file))
    const filteredOut = missing.filter(m => seen.has(m.file))
    if (filteredOut.length) {
      log(`⚠ Completeness: ${filteredOut.length} gap(s) named a file an earlier item already owned — NOT rebuilt:`)
      filteredOut.slice(0, 8).forEach(m => log(`   · ${m.file}: ${m.instruction}`))
      filteredOut.forEach(m => unbuiltGaps.push(`${m.file}: ${m.instruction}`))
    }
    // A round only counts as DRY when the critic itself found nothing. Gaps that were merely
    // FILTERED are unbuilt work, not silence.
    if ((crit.done || !missing.length) && !filteredOut.length) {
      dry++; log(`Completeness: dry round ${dry}/${DRYROUNDS}`); continue
    }
    if (!fresh.length) { dry++; log(`Completeness: no NEW files to own — dry round ${dry}/${DRYROUNDS}.`); continue }
    dry = 0
    fresh.forEach(m => seen.add(m.file))
    log(`Completeness: critic found ${fresh.length} gap(s) — building`)
    const more = await buildAndGate(
      fresh.map((m, i) => ({ id: `crit${critRound}-${i}`, file: m.file, kind: 'code', tier: 'opus', instruction: m.instruction })),
      'Completeness')
    results = results.concat(more)
  }
  // v14 — name the exit. Without this, "stopped at the cap with gaps outstanding" and "went dry"
  // were the same silent outcome.
  if (dry < DRYROUNDS && !critStop) {
    critStop = !budgetOK() ? 'budget floor reached'
      : critRound >= CRIT_MAX ? `hard ${CRIT_MAX}-round backstop`
      : 'unknown'
  }
  if (critStop) log(`Completeness: NEVER WENT DRY (${dry}/${DRYROUNDS} dry rounds) — stopped because: ${critStop}`)
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
// v13 wired blocker() only into the DID-NOT-RUN branches; a gate that RAN AND FAILED printed
// "SHIP BLOCKER" and then blocked nothing, so verdict computed 'OK' over a refused ship.
if (reach && (reach.dead || []).length) {
  log(`⛔ REACHABILITY FAILED — ${(reach.dead || []).length} dead seam(s). This is a SHIP BLOCKER.`)
  ;(reach.dead || []).slice(0, 8).forEach(d => log(`   · ${d}`))
  blocker('LAW19 REACHABILITY FAILED',
    `${(reach.dead || []).length} dead seam(s): ${(reach.dead || []).slice(0, 3).join('; ')}`)
} else if (reach && reach.tests_added && !reach.tests_proven_run) {
  log(`⛔ REACHABILITY FAILED — tests were added and NOT proven to run. SHIP BLOCKER.`)
  blocker('LAW19 REACHABILITY FAILED', 'tests were added and were not proven to run')
} else if (!reach) {
  blocker('LAW19 REACHABILITY DID NOT RUN',
    'no symbol added by this run was traced to a caller and a writer')
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
    // ── VISUAL LAYER (Konyo, 2026-08-02: "isnt part of the konyo workflow max to verify it through
    // dom queries..? add it as a render to the workflow! i want the system perfected.")
    // IDENTICAL to konyo-workflow-max.js by Konyo's standing rule — same logic in both, never just
    // the max version. DOM queries are necessary and NOT sufficient: a panel can satisfy every
    // selector assertion and still be visually broken (zero-height container, white-on-white text,
    // overlapping siblings, a chart with every bar at 0px, content shoved off-screen).
    // HARD-WON, THIS SESSION: page.screenshot() WAITS ON FONT LOADING. A route handler that
    // route.abort()s non-API requests makes fonts never resolve, so the capture hangs for the entire
    // timeout and writes no file at all. Fulfil unwanted requests with an empty 200 instead of
    // aborting, and pass animations:'disabled' — infinite CSS animations stall a fullPage capture
    // exactly the same way. This comment exists so nobody has to re-learn it.
    `VISUAL LAYER — DOM QUERIES ARE NOT ENOUGH, and this is NOT optional when a UI changed. Take an ` +
    `ACTUAL SCREENSHOT and assert on RENDERED GEOMETRY: (a) every key element's boundingBox() has ` +
    `width>0 AND height>0; (b) no text is clipped (scrollWidth <= clientWidth+1); (c) nothing ` +
    `overflows the viewport horizontally (scrollingElement.scrollWidth <= innerWidth+1); (d) computed ` +
    `text colour differs from its own resolved background (catches white-on-white); (e) no two ` +
    `sibling panels overlap (rect intersection area === 0). This ADDS to the hit-testing above — it ` +
    /* v15 — THE GATE MUST LOOK AT THE PICTURE, NOT JUST MEASURE IT.
       Konyo, 2026-08-04: "why do i need eye on it? as part of the workflow system isnt it verified
       and checked visually from a user-experience side also?" He was right, and the hole was real:
       every assertion above is STRUCTURAL, and all of them pass on a perfectly rendered picture of
       the WRONG THING. `naturalWidth > 0` proves a file LOADED, not that it shows what its name
       claims. Real case: art/mephisto_graphic.png contains his SOULSTONE and diablo_graphic.png
       contains a BOOK. Both survived months of green gates, three separate "fixes", and a
       measurement pass that confirmed the correct FILENAME was being served.
       Cheap proxies were tried and PROVEN INSUFFICIENT — do not substitute them for looking:
       md5 against the whole art corpus found zero duplicates; file size flags Mephisto (10KB vs
       Andariel 160KB) but misses Diablo (46KB, and it is a book). Only LOOKING works, and agents
       are multimodal, so looking is a few seconds of work. */
    `5b. LOOK AT THE PICTURES — THIS IS NOT OPTIONAL WHEN ART, ICONS OR THUMBNAILS CHANGED, and it `
    + `is the one check no geometry assertion can stand in for. For every image surface this change `
    + `touches or claims: OPEN IT (Read the asset file directly, or crop it out of the screenshot you `
    + `just captured) and say IN WORDS what the picture actually DEPICTS. Then compare that against `
    + `what the UI CLAIMS it is — the filename, the alt text, the label beside it, the hover card. A `
    + `thumbnail labelled with a BOSS that depicts an ITEM is a BLOCKER, not a note; so is a tab logo `
    + `showing the wrong concept, or a gem/rune icon that is not that gem. Report each as `
    + `"<surface>: claims X, depicts Y" in failures[] when they disagree. RECORD EVERY IMAGE YOU `
    + `OPENED in images[] as {surface, path, claims, depicts, matches} — matches:false is a BLOCKER. `
    + `If you opened NONE you MUST set images_na_reason (e.g. "this change touches no image surface"); `
    + `an empty images[] with NO reason FAILS THE GATE, because "nobody looked" must never read the `
    + `same as "nothing was wrong". NEVER infer this from a path resolving, a hash, a file size, or a `
    + `non-zero naturalWidth — every one of those has already passed over a wrong picture in this `
    + `project. If you did not open the image, say so plainly rather than implying you checked it.\n` +
    `does not replace it. SAVE THE SCREENSHOT TO A FILE and report every absolute path in ` +
    `screenshots[]; a gate whose evidence nobody can open is a gate you have to take on faith. ` +
    `SCREENSHOT TRAP: page.screenshot() WAITS ON FONTS — a route handler that route.abort()s ` +
    `non-API requests means fonts never resolve, the capture hangs for the full timeout and produces ` +
    `nothing. Fulfil with route.fulfill({status:200, body:''}) instead of aborting, and pass ` +
    `{ animations: 'disabled' }. A capture that times out is a FAILURE, never "visual checks skipped". ` +
    `Never bind a port the user's own app uses; kill anything you start.`,
    { effort: 'medium', phase: 'Render gate', schema: {
        type: 'object', additionalProperties: false,
        // 'notes' is REQUIRED because the synthesizer prompt below reads renderGate.notes — a field
        // the reader depends on but the schema does not demand is the same bug in another costume.
        required: ['available', 'ran', 'passed', 'failures', 'notes', 'screenshots', 'visual'],
        properties: {
          available: { type: 'boolean' },
          ran:       { type: 'string' },
          passed:    { type: 'boolean' },
          failures:  { type: 'array', items: { type: 'string' } },
          notes:     { type: 'string', description: 'what a human should eyeball that no test covers' },
          images: { type: 'array', description: 'v15 — EVERY image surface you actually OPENED, one entry each. Empty is only acceptable alongside images_na_reason.', items: { type: 'object', properties: {
            surface: { type: 'string', description: 'where it appears in the UI, e.g. "F-Uniques Best runs thumbnail"' },
            path:    { type: 'string', description: 'the asset file or screenshot crop you opened' },
            claims:  { type: 'string', description: 'what the UI says it is — filename, alt text, adjacent label, hover card' },
            depicts: { type: 'string', description: 'what the picture ACTUALLY shows, in your own words, having looked at it' },
            matches: { type: 'boolean', description: 'false = the picture is of the wrong thing = BLOCKER' },
          } } },
          images_na_reason: { type: 'string', description: 'v15 — REQUIRED IF AND ONLY IF images is empty: why no image needed opening (e.g. "this change touches no image surface"). Absent + empty images = the gate is treated as NOT DONE and blocks.' },
          screenshots: { type: 'array', items: { type: 'string' }, description: 'ABSOLUTE paths of screenshots this gate actually captured — a human must be able to open them. Empty means nothing was seen.' },
          visual:      { type: 'array', items: { type: 'string' }, description: 'geometry assertions actually run (boundingBox / clipping / horizontal overflow / text-vs-background contrast / sibling overlap), one line each with the measured numbers' },
        } } }
  ).catch(() => null)
  if (renderGate && renderGate.available && !renderGate.passed) {
    // `.failures` is guarded: a truncated agent return used to throw a TypeError at top level here,
    // AFTER the entire run had finished, destroying the report it was about to write.
    log(`⛔ RENDER GATE FAILED — ${(renderGate.failures || []).length} failure(s). SHIP BLOCKER.`)
    ;(renderGate.failures || []).slice(0, 6).forEach(f => log(`   · ${f}`))
    blocker('RENDER GATE FAILED',
      `${(renderGate.failures || []).length} failure(s): ${(renderGate.failures || []).slice(0, 3).join('; ')}`)
  } else if (renderGate && !renderGate.available) {
    log('⚠ RENDER GATE: no UI verification in this project — nothing was seen painted.')
  } else if (!renderGate) {
    blocker('RENDER GATE DID NOT RUN', 'nothing in this run was seen painted')
  }
  /* v15 — FAIL CLOSED ON "NOBODY LOOKED". Konyo: "make no image was opened fail closed rather than
     just be reported". Telling an agent to look is an instruction; this is the enforcement. A gate
     that inspected no images AND gave no reason has not done the one job that geometry cannot do,
     and the whole point of v15 is that a wrong picture passes every structural assertion. Silence
     is the failure mode being closed: `images: []` with no `images_na_reason` used to read exactly
     like "there were no images to check". An honest "this change touches no image surface" costs
     one sentence and passes; nothing costs a blocker. */
  if (renderGate && renderGate.available) {
    var _imgs = Array.isArray(renderGate.images) ? renderGate.images : []
    var _wrong = _imgs.filter(function (i) { return i && i.matches === false })
    if (_wrong.length) {
      blocker('IMAGE SHOWS THE WRONG THING', _wrong.slice(0, 3).map(function (i) {
        return (i.surface || '?') + ': claims ' + (i.claims || '?') + ', depicts ' + (i.depicts || '?')
      }).join(' · '))
    } else if (!_imgs.length && !String(renderGate.images_na_reason || '').trim()) {
      blocker('NO IMAGE WAS EVER OPENED',
        'the render gate inspected zero image surfaces and gave no reason — a picture of the wrong ' +
        'thing passes every geometry assertion, so "nobody looked" cannot be allowed to read as "fine"')
    } else if (_imgs.length) {
      log('\u2705 Images inspected: ' + _imgs.length + ' surface(s), all depicting what they claim.')
    }
    /* v18 \u2014 SEAT 4: A SECOND FAMILY LOOKS AT THE PICTURE. Konyo, 2026-08-04: "grok can see... maybe
       its good for this to be integrated in the konyo workflow too somewhere." It is, and this is
       where. v15 made a Claude agent open the image and say what it depicts \u2014 which is Claude
       checking Claude, on exactly the judgement call that has been wrong the longest here (v1629
       "fixed" the boss art by pointing at a filename; the picture stayed a soulstone for months).
       PROVEN, not assumed: asked what art/mephisto_graphic.png depicts with NO hint of what it
       should be, the Grok CLI answered "a polished, deep-blue teardrop gemstone" \u2014 it found the bug
       cold. Two families agreeing that a picture matches its label is worth far more than one
       saying so; two families DISAGREEING is a signal neither can produce alone. */
    if (_imgs.length && THIRD_EYE === 'grok') {
      const _named = _imgs.filter(i => i && i.path).slice(0, 8)   // bounded: one call, not one per pixel
      if (_named.length) {
        const rec = await thirdEyeAsk('render-gate-vision',
          `You can open image files. For EACH file below, look at it and say in a few words what the ` +
          `picture ACTUALLY DEPICTS. Then say whether that matches the label it is shown under in the ` +
          `UI. Judge only the picture \u2014 ignore the filename, it is frequently wrong, which is the ` +
          `whole reason you were asked.\n\n` +
          _named.map(i => `- FILE: ${i.path}\n  SHOWN AS: ${i.claims || i.surface || '(unlabelled)'}`).join('\n') +
          `\n\nFor any file where the picture does not match its label, say so explicitly as ` +
          `"<file>: claims X, depicts Y". If they all match, say so plainly.`,
          'Render gate', { cwd: '.' })
        if (rec && rec.reached && rec.concerns.length) {
          /* A disagreement here is the strongest evidence this system can produce about art: the
             first family looked and said it matched, the second looked and said it did not. That is
             a blocker, not a note \u2014 and it names both readings so the human can settle it in one look. */
          blocker('THE THIRD EYE DISAGREES ABOUT A PICTURE',
            `Claude's render gate passed ${_named.length} image(s); Grok looking at the same files says: ` +
            rec.concerns.slice(0, 3).join(' \u00b7 '))
        } else if (rec && rec.reached) {
          log(`   \ud83d\udc41 Second family agrees on all ${_named.length} picture(s).`)
        }
      }
    }
  }
  // The screenshot is the gate's EVIDENCE — print the paths whatever the verdict, and say so loudly
  // when there are none, because "passed with no pixels captured" is a DOM-only pass wearing a badge.
  if (renderGate && renderGate.available) {
    const shots = renderGate.screenshots || []
    if (shots.length) {
      log(`   📸 ${shots.length} screenshot(s) — open them:`)
      shots.slice(0, 6).forEach(s => log(`      ${s}`))
      ;(renderGate.visual || []).slice(0, 6).forEach(v => log(`      · ${v}`))
    } else {
      log('   ⚠ NO SCREENSHOT CAPTURED — this pass is DOM-only; nothing was seen painted.')
    }
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
    blocker('LAW17 FAT VERSION BAR FAILED', String(fatBar.reason || 'no reason given'))
  } else if (fatBar && !fatBar.applicable) {
    // The prompt REQUIRES na_evidence and calls N/A-without-evidence a fail; this branch used to
    // print "treat as a fail" and then treat it as a pass.
    log('⚠ LAW17 N/A (no version stamp this run) — ' + (fatBar.na_evidence || 'NO EVIDENCE GIVEN — treat as a fail.'))
    if (!fatBar.na_evidence) blocker('LAW17 N/A WITHOUT EVIDENCE',
      'the bar declared itself not applicable and named nothing it inspected')
  } else if (fatBar) {
    log(`✅ Fat version bar passed (${fatBar.kind}, ${(fatBar.outcomes || []).length} user-visible outcome(s)).`)
  } else {
    blocker('LAW17 FAT VERSION BAR DID NOT RUN',
      'the version stamp was never checked for substance')
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
    `\n  SCREENSHOTS (${(renderGate.screenshots||[]).length}): ` + ((renderGate.screenshots||[]).join(', ') || 'NONE — nothing was captured, so this was a DOM-only pass') +
    ((renderGate.visual||[]).length ? `\n  VISUAL GEOMETRY:\n` + renderGate.visual.map(v => '  - ' + v).join('\n') : '\n  VISUAL GEOMETRY: none reported') +
    `\nIf screenshots is empty the headline must NOT claim the UI was seen — DOM queries alone cannot see a painted page. ` +
    `\nIf the render gate FAILED, the headline must say the ship is BLOCKED and why — do not report success over a broken screen. ` +
    `If it was unavailable, the headline must say nothing was seen painted.` : '\nRENDER GATE: not run (dry-run).') +
  (fatBar ? `\nFAT VERSION BAR (LAW17): applicable=${fatBar.applicable} passes=${fatBar.passes} kind=${fatBar.kind}` +
    ((fatBar.outcomes || []).length ? `\n  OUTCOMES:\n` + fatBar.outcomes.map(o => '  - ' + o).join('\n') : '') +
    (fatBar.reason ? `\n  reason: ${fatBar.reason}` : '') +
    `\nIf the fat version bar FAILED, the headline must say the ship is BLOCKED as a thin version and name what would make it fat.` : '\nFAT VERSION BAR: not run (dry-run).') +
  // THE RUN'S OWN HONESTY, handed to the only agent that writes the line a human actually reads.
  // Without this the synthesizer saw passed/failed/render/fat and nothing else, so its headline
  // could announce a clean ship while blockers[] was non-empty.
  `\n\n── THIS RUN'S OWN INTEGRITY (you MUST reflect this in the headline) ──\n` +
  `BLOCKERS (${BLOCKERS.length}): ` + (BLOCKERS.length ? '\n' + BLOCKERS.map(b => `  - ${b.what}: ${b.why}`).join('\n') : 'none') + `\n` +
  `AGENTS THAT DIED (${SPAWN_ERRORS.length}): ` + (SPAWN_ERRORS.length ? SPAWN_ERRORS.slice(0, 5).join(' | ') : 'none') + `\n` +
  `AGENT CEILING: ${SPENT}/${MAX_AGENTS} spent, hit=${CEILING_HIT}\n` +
  `TRIMMED FROM THE PLAN (${trimmedFromPlan.length}): ` + (trimmedFromPlan.length ? trimmedFromPlan.slice(0, 8).join(', ') : 'none') + `\n` +
  `REWORK: ${round}/${MAXROUNDS} round(s), stopped_because=${reworkStop}\n` +
  `SKEPTICS: ${SKEPTICS} per item (source: ${SKEPTICS_SOURCE})\n` +
  `QUALITY: ${QUALITY}\n` +
  `COMPLETENESS: ` + (MAXQ
    ? `${critRound} round(s), ${dry}/${DRYROUNDS} dry, wentDry=${dry >= DRYROUNDS}, stoppedBecause=${critStop || '(went dry)'}`
    : 'NOT RUN (quality=standard buys no completeness critic — do not describe the work as exhaustively swept)') + `\n` +
  `GAPS RAISED BUT NEVER BUILT (${unbuiltGaps.length}): ` + (unbuiltGaps.slice(0, 5).join(' | ') || 'none') + `\n` +
  `INFEASIBILITY: ${globalThis.__infeasible ? JSON.stringify(globalThis.__infeasible).slice(0, 400) : '(none flagged)'}\n` +
  `MERGE: ` + (merge ? `${(merge.applied || []).length} applied, ${(merge.failed || []).length} failed`
    : ISOLATE ? 'isolate mode was on but no merge result came back' : 'not run (no {isolate:true})') + `\n` +
  `RULES, not suggestions: a NON-EMPTY blockers list forces the headline to LEAD with "BLOCKED" and ` +
  `name the blocker. A HIT CEILING forces "UNVERIFIED". A NON-EMPTY trimmed list forces "PARTIAL" and ` +
  `the headline must say planned work was dropped. A dead agent means planned work silently did not ` +
  `happen — say so. You may NEVER report success over a blocker, and you may never describe work that ` +
  `was trimmed, refused or never gated as done.\n` +
  `\nWrite the single final report: headline is the ONE-line ping Konyo reads.`,
  { model: 'opus', effort: 'high', phase: 'Synthesize', schema: FINAL_SCHEMA },
  true                                // reserved: a run that cannot afford its own report reports nothing
)
// A missing synthesis is not a quiet detail: passed/failed are then raw counts nobody reviewed.
if (!final) blocker('SYNTHESIS DID NOT RUN',
  'the final report agent returned nothing — passed/failed counts are raw and unreviewed')

/* v18 — SEAT 3: THE PRE-SHIP CHALLENGE. Everything above this line was produced by one model family
   grading its own homework: the builder wrote it, Claude skeptics reviewed it, a Claude synthesizer
   described it. This is the last moment before `shippable` is stamped, and the only question worth
   asking is the one a self-graded run cannot ask itself — "what would make this claim false?"
   It CAN block, deliberately. A gate that observes and cannot refuse is decorative, and this repo has
   already shipped one of those (the 3-skeptic gate that ran on a 1-skeptic panel and could never
   reach its own threshold). It is instructed to reserve `blocking` for a concrete, demonstrable
   defect — an opinion about style is a note, not a veto. */
if (USE_GROK && APPLY) {
  const _shipClaim =
    `VERDICT ABOUT TO BE STAMPED: ${BLOCKERS.length ? 'BLOCKED' : 'shippable'}\n` +
    `TASK: ${TASK}\n` +
    `WHAT IT SAYS IT DID: ${(final && final.headline) || '(no headline)'}\n` +
    `SHIPPED: ${JSON.stringify((final && final.shipped) || []).slice(0, 1200)}\n` +
    `EVIDENCE THE RUN IS RELYING ON — items passed: ${passed.length}, failed: ${failed.length}; ` +
    `skeptic panel: ${SKEPTICS} seat(s); render gate: ${renderGate ? (renderGate.passed ? 'passed' : 'FAILED') : 'not run'}` +
    `${renderGate && (renderGate.screenshots || []).length ? ` with ${renderGate.screenshots.length} screenshot(s)` : ' with NO screenshots'}; ` +
    `agents that died: ${SPAWN_ERRORS.length}; blockers already raised: ${BLOCKERS.length}` +
    `${BLOCKERS.length ? ' — ' + BLOCKERS.map(b => b.what).join(', ') : ''}.`
  const rec = await thirdEyeAsk('pre-ship',
    `A run is about to declare itself finished. You are the last check, and you are a DIFFERENT model ` +
    `from everyone who produced the work and everyone who reviewed it — every claim below has so far ` +
    `only been graded by the family that wrote it.\n\n${_shipClaim}\n\n` +
    `WHAT WOULD MAKE THIS CLAIM FALSE? Look for: a claim with no evidence behind it, evidence that ` +
    `does not actually support the claim it is attached to, work described as done that the numbers ` +
    `do not account for, and a gate reported as passing that never really ran. You may read files in ` +
    `this directory to check.\n` +
    `Set severity:'blocking' ONLY for a concrete defect you can point at — a style opinion is a note. ` +
    `If it holds up, say so plainly; agreeing to be agreeable is worth nothing here.`,
    'Synthesize', { cwd: '.' })
  if (rec && rec.reached && rec.severity === 'blocking') {
    blocker('THE THIRD EYE REFUSED THIS SHIP',
      `pre-ship challenge (${rec.transport}): ${rec.concerns.slice(0, 2).join(' · ') || rec.reason}`)
  }
}

/* v18 — AND IF IT NEVER SPOKE, SAY SO WHERE THE VERDICT IS READ. A third eye that was requested and
   could not be reached is a DEGRADED run, not a clean one. It does not block by itself — the work may
   be perfectly good — but the summary may never let silence read as approval. */
const TE_ASKED_FOR = THIRD_EYE !== 'off'
const TE_SPOKE = THIRD_EYE_SEATS.filter(s => s.reached)
const TE_SILENT = THIRD_EYE_SEATS.filter(s => s.ran && !s.reached)
if (TE_ASKED_FOR && THIRD_EYE_SEATS.length) {
  log(TE_SPOKE.length
    ? `👁 THIRD EYE: ${TE_SPOKE.length}/${THIRD_EYE_SEATS.length} seat(s) answered (${[...new Set(TE_SPOKE.map(s => s.transport))].join(', ')}).`
    : `⚠ THIRD EYE NEVER SPOKE — ${THIRD_EYE_SEATS.length} seat(s) requested, 0 answered. This run had ` +
      `NO independent model reviewing it: ${(TE_SILENT[0] && TE_SILENT[0].reason) || 'no reason recorded'}`)
}

const released = await releaseLock()
const didRelease = !!(released && released.key === 'released')
if (lock && lock.acquired) {
  log(didRelease ? '🔓 Workspace lock released.'
                 : `⚠ Workspace lock NOT released (${(released && released.key) || 'release agent failed'}) — ` +
                   `it self-expires after ${LOCK_TTL_MIN}m.`)
}

// THE RETURN IS A UNION OF BOTH ORIGINALS, NOT A CHOICE BETWEEN THEM. Every field either script
// used to return is carried here at BOTH qualities. A field a standard run does not earn is
// returned with an explicit `ran:false` + reason — NEVER a bare null a reader can mistake for a pass.
return emit({
  version: plan.version_label,
  mode,
  /* v18 — ONE SHAPE ON BOTH EXIT PATHS. Caught by the completeness critic of the very run that
     built this merge: bail() returned `quality: QUALITY` (the machine token 'max'|'standard') while
     the SUCCESS path returned `quality:` as a PROSE SENTENCE, with the machine value buried in
     knobs.quality. So `result.quality === 'max'` — the exact check this merge told callers to use to
     prove a max run was really bought — was FALSE on every successful run and TRUE only when the run
     ABORTED. A field that answers correctly only on failure is the null-reads-as-pass defect wearing
     a different hat. The token is now the field; the prose is a separate label. */
  quality: QUALITY,
  quality_label: MAXQ
    ? `MAX (Opus everywhere · 3-architect judge panel · ${SKEPTICS}-skeptic adversarial gate · loop-until-dry)`
    : `STANDARD (cost-scaled ladder · single Opus architect · Fable merge gate${SKEPTICS ? ` · ${SKEPTICS}-skeptic panel` : ' · no skeptics'})`,
  knobs: {
    quality: QUALITY,
    maxRounds: MAXROUNDS,
    dryRounds: DRYROUNDS,
    floor: FLOOR,
    tierPolicy: MAXQ ? 'opus everywhere' : 'cost-scaled ladder (haiku→sonnet→opus, escalate on rework)',
    judgePanel: MAXQ ? '3 architects + judge' : 'single architect',
    gateKind: MAXQ ? 'adversarial skeptic panel (the panel IS the gate)' : 'fable merge gate + skeptic panel behind it',
    isolate: ISOLATE,
    skeptics: { used: SKEPTICS, of: LENSES.length, source: SKEPTICS_SOURCE },
  },
  lock: lock ? { acquired: !!lock.acquired, key: lock.key, released: didRelease } : null,
  triage: globalThis.__triage || null,   // what this run was sized at, and why — visible after the fact
  rounds: round,
  rework: { rounds: round, maxRounds: MAXROUNDS, stopped_because: reworkStop },
  skeptics: { used: SKEPTICS, of: LENSES.length, source: SKEPTICS_SOURCE,
              opted_out: !!globalThis.__skepticsOptedOut, floored: !!globalThis.__skepticFloored },
  completeness: MAXQ
    ? { ran: true, rounds: critRound, dry, required: DRYROUNDS, wentDry: dry >= DRYROUNDS,
        stoppedBecause: critStop, unbuiltGaps }
    : { ran: false, reason: 'quality=standard — the completeness critic is a max-only phase and was never bought' },
  infeasible: globalThis.__infeasible || null,
  tokens_spent: budget.total ? budget.spent() : null,
  ceiling: { cap: MAX_AGENTS, spent: SPENT, hit: CEILING_HIT, hitDuringCompleteness: CEILING_HIT,
             trimmedFromPlan, complete: !CEILING_HIT && !trimmedFromPlan.length },
  // v13 — the one field that answers "is this safe to have shipped". Every fact below was already
  // in the payload before; none of it reached the summary, so a capped run with skipped gates read
  // as a clean one.
  blockers: BLOCKERS,
  agent_errors: SPAWN_ERRORS,
  // THE VERDICT LADDER IS THE UNION OF BOTH FILES' LADDERS: every blocking condition either script
  // could raise still forces a non-OK verdict here. The completeness clause is MAXQ-guarded because a
  // standard run must not be marked unshippable for a loop it never bought — but `completeness.ran`
  // above says so out loud, so it cannot be mistaken for a loop that ran and went dry.
  verdict: BLOCKERS.length ? 'BLOCKED — see blockers[]'
    : CEILING_HIT ? 'UNVERIFIED — the agent ceiling stopped the run early'
    : (MAXQ && (dry < DRYROUNDS || unbuiltGaps.length)) ? 'UNVERIFIED — the completeness critic never went dry (' + (critStop || 'gaps raised but never built') + ')'
    : trimmedFromPlan.length ? 'PARTIAL — ' + trimmedFromPlan.length + ' item(s) were trimmed from the plan to fit the ceiling'
    : failed.length ? 'INCOMPLETE — ' + failed.length + ' item(s) never passed the gate'
    : SPAWN_ERRORS.length ? 'DEGRADED — some agents died; their work is missing, not failed'
    : 'OK',
  shippable: !BLOCKERS.length && !CEILING_HIT && !trimmedFromPlan.length && !failed.length
    && !SPAWN_ERRORS.length && (!MAXQ || (dry >= DRYROUNDS && !unbuiltGaps.length)),
  passed: passed.length,
  failed: failed.length,
  render_gate: renderGate,
  merge: merge || { ran: false, reason: ISOLATE
    ? 'isolate mode was on but the merge phase produced no result — see blockers[]'
    : 'no {isolate:true}: builders edited the shared tree directly, so there was nothing to merge' },
  fat_version: fatBar,
  /* v18 — THE THIRD EYE IS REPORTED WHETHER OR NOT IT SPOKE. The old phase returned nothing at all,
     so "Grok raised no concerns" and "Grok was never reachable" were the same silence. Both are
     answered here, per seat, with the transport that carried it and the real error if none did. */
  thirdEye: {
    requested: THIRD_EYE,                       // 'grok' | 'claude' | 'off'
    seats: THIRD_EYE_SEATS,
    reached: TE_SPOKE.length,
    of: THIRD_EYE_SEATS.length,
    transports: [...new Set(TE_SPOKE.map(s => s.transport))],
    degraded: TE_ASKED_FOR && THIRD_EYE_SEATS.length > 0 && TE_SPOKE.length === 0,
    note: !TE_ASKED_FOR ? 'thirdEye:false — no independent model was asked to review this run'
      : THIRD_EYE === 'claude' ? 'thirdEye:"claude" — a SAME-FAMILY stand-in reviewed this run; it is not an independent eye'
      : TE_SPOKE.length ? 'an independent model (different family) reviewed this run'
      : 'the third eye was requested and NEVER ANSWERED — nothing outside Claude reviewed this run',
  },
  final,
})
