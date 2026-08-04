export const meta = {
  name: 'konyo-workflow-max',
  description: 'KONYO WORKFLOW — MAX QUALITY. Opus everywhere · 3-architect judge panel · one-owner-per-file Opus build · 3-skeptic diverse-lens adversarial gate (majority-refute kills a change) · loop-until-dry completeness critic · Opus synthesis. ~10-15x the cost of the cost-scaled workflow — use ONLY for high-stakes / correctness-critical work.',
  whenToUse: 'When being WRONG costs more than tokens: trading-system code (Kai), security audits, production ships you can\'t easily roll back. For routine work use the cost-scaled konyo-workflow instead. It TRIAGES ITSELF FIRST and hard-caps the fleet, so a max run cannot quietly become an all-night one. Pass {task, apply, maxRounds, dryRounds, budgetFloor, grok, force, maxAgents}.',
  phases: [
    { title: 'Preflight',       detail: 'workspace lock — refuse to start if another run is already editing this tree' },
    { title: 'Triage',          detail: 'right-size the run BEFORE spending a single Opus agent; hard-caps the fleet', model: 'opus' },
    { title: 'Architect panel', detail: '3 Opus architects (risk / correctness / simplest lenses) + Opus judge → one plan', model: 'opus' },
    { title: 'Third-eye',       detail: 'optional Grok consult on the winning plan' },
    { title: 'Build',           detail: 'Opus builds each item, one owner per file', model: 'opus' },
    { title: 'Adversarial gate',detail: '3 Opus skeptics per change (correctness / safety / reproduce); majority-refute → rework', model: 'opus' },
    { title: 'Rework',          detail: 'refuted items rebuilt with the skeptics\' reasons + re-gated', model: 'opus' },
    { title: 'Merge',          detail: 'isolate mode only — applies each worktree patch to the REAL repo, one at a time, git apply --check first', model: 'opus' },
    { title: 'Completeness',    detail: 'Opus critic hunts for missed work; loop until N dry rounds', model: 'opus' },
    { title: 'Render gate',    detail: 'drives the REAL UI — hit-testable controls + SCREENSHOT-BACKED geometry (non-zero boxes, no clipping/overflow, text vs background, no overlap); failure BLOCKS the ship', model: 'opus' },
    { title: 'Fat version bar', detail: 'LAW17 — >=3 user-visible outcomes in one theme OR one structural bug with root cause+verify+prevention; a thin ship BLOCKS', model: 'opus' },
    { title: 'Reachability',   detail: 'LAW19 — every symbol the change added has a caller AND a writer; added tests proven to have RUN; failure BLOCKS', model: 'opus' },
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
/* ── v10 — THE WORKSPACE LOCK ────────────────────────────────────────────────────────────────────
   2026-08-03. A correctness run was mid-flight over a single-file static site when Konyo asked for
   a design pass on the SAME file. Two fleets, one 963-line file, both with a builder that reads the
   whole thing and writes it back: whichever finished second would have silently erased the other's
   work, and the report would have been green either way. It was caught only because a human
   happened to notice — "fix this so it doesnt happen again."

   Nothing in this workflow knew another instance existed. So: a lock, keyed on the working tree,
   taken in Preflight BEFORE a single Opus agent is bought. A second run in the same tree refuses
   immediately and names the run that holds it, instead of discovering the collision in the diff.

   TTL, not a promise to release. A killed run (TaskStop, a crash, a closed laptop) never reaches its
   release, and a lock that outlives its holder is worse than no lock — it locks the human out of
   their own repo. So every lock carries an expiry and the acquirer purges dead ones first. Release
   is best-effort on the way out; the TTL is what actually guarantees the tree comes back.

   Escape hatch: {ignoreLock:true} for the case where the holder is genuinely dead but not yet
   expired, and the human knows it. Deliberately NOT folded into force:true — force means "overrule
   triage's judgement", which is a different and much cheaper mistake than "overwrite another
   fleet's work". */
const IGNORE_LOCK  = !!(A && A.ignoreLock)
const LOCK_TTL_MIN = (A && A.lockTtlMinutes) || 180
// v12 — triage may buy fewer skeptics than MAX implies (see activeLenses). That is usually right,
// but on a run the human explicitly invoked as MAX it is a surprise they pay Opus prices for. This
// is the explicit override, and the downgrade is now announced rather than silent.
const SKEPTICS_OVERRIDE = (A && typeof A.skeptics === 'number') ? A.skeptics : null
/* ── v9 — SANDBOX ISOLATION WITH A REAL MERGE ────────────────────────────────────────────────────
   The fleet has been capped at ~14 agents for one reason: they all edit files in ONE shared
   working tree, and this project already lost 25,000 lines to a single bad edit in a 38k-line file.
   The cap was fear, paid for in tokens on every run.

   `isolation:'worktree'` alone does NOT fix that — it hands each agent an isolated COPY and
   auto-cleans it, and nothing merges a CHANGED copy back. Switched on naively in apply mode, every
   edit lands in a throwaway directory, never reaches the repo, and the run reports success: a
   silent no-op dressed as a green ship.

   So isolation here is isolate → PATCH → merge. Each builder works in its own worktree and returns
   the complete unified diff it produced; a single merge agent then applies those patches to the
   real repo ONE AT A TIME with `git apply --check` first. Nothing depends on a worktree surviving
   (the patch is carried in the result), no two writers ever touch the tree at once, and a conflict
   surfaces as a reported failure instead of being forced through.

   OPT-IN, deliberately. A merge stage that goes wrong loses work, so it does not turn itself on:
   pass {isolate:true}. Without it the behaviour is exactly what it was. */
const ISOLATE = !!(A && A.isolate) && APPLY

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
// (BLOCKERS / SPAWN_ERRORS are declared just below spawn(); spawn only ever RUNS after that point.)
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
  // v13 — A DYING AGENT MUST NOT KILL THE RUN. This was a bare `return agent(...)`. agent() resolves
  // to null on a terminal API error, but it can still THROW — the token ceiling throws by contract,
  // and a subagent killed mid-flight rejects. Most call sites `await spawn(...)` directly with no
  // catch of their own, so one rejection unwound the whole script and three hours of completed
  // phases reported nothing. Some sites had grown their own `.catch(() => null)`; that is exactly
  // the kind of protection that must live in ONE place, because the site that forgets it is the
  // site that takes the run down. Callers already treat null as "this one produced nothing".
  return agent(String(prompt || '') + PACE, opts).catch(err => {
    SPAWN_ERRORS.push(String((err && err.message) || err).slice(0, 200))
    log(`⚠ AGENT FAILED (${SPAWN_ERRORS.length} so far): ${String((err && err.message) || err).slice(0, 140)}`)
    return null
  })
}

// v13 — THE BLOCKER LEDGER. Three phases in this script are documented as SHIP BLOCKERS (render
// gate, LAW17 fat bar, LAW19 reachability), and every one of them was written as
// `if (gate && gate.failed) { log('⛔ BLOCKER') }`. That reads correctly and behaves wrongly: when
// the gate is NULL — it never ran, the ceiling refused it, or the agent died — the condition is
// false, every `else if` is skipped, NOTHING is logged, and the run reports success. On 2026-08-04
// a run shipped v1634 with render_gate:null, merge:null and fat_version:null while reporting
// "7 passed, 0 failed". A gate that did not run is not a gate that passed; it is an UNVERIFIED
// ship, and the difference has to survive all the way into the returned object.
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
function bail(o) {
  return Object.assign({
    blockers: BLOCKERS,
    agent_errors: SPAWN_ERRORS,
    ceiling: { cap: MAX_AGENTS, spent: SPENT, hit: CEILING_HIT },
    verdict: 'ABORTED — the run exited before completing; see error/refused',
    shippable: false,
  }, o)
}

if (!TASK) { log('No task. Pass {task:"..."} as args.'); return bail({ error: 'no task' }) }

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
  required: ['file', 'summary', 'changes', 'self_check', 'files_touched'],
  properties: {
    file:       { type: 'string' },
    summary:    { type: 'string' },
    changes:    { type: 'string', description: 'unified diff (dry-run) or description of edits applied' },
    self_check: { type: 'string', description: 'what you verified (compiled? traced the fix?)' },
    /* v8 — ONE OWNER PER FILE WAS INSTRUCTED EVERYWHERE AND VERIFIED NOWHERE. Every build prompt
       says "Touch NO other file"; nothing ever checked. A rule enforced by asking nicely is a
       convention, not an invariant — and the failure it guards against is the expensive kind: this
       project once lost 25,000 lines to a single bad edit in one 38k-line file, and the reason the
       fleet is capped at ~14 agents is fear of exactly that, not any real ceiling.
       The builder must now DECLARE what it wrote, and the skeptic panel checks the declaration
       against `git status --porcelain` — which costs no extra agent, because the skeptics already
       run and already have tools. */
    files_touched: { type: 'array', items: { type: 'string' }, maxItems: 40,
                     description: 'EVERY file you created, edited or deleted — relative paths. If you only wrote the one file you own, that is a single-element list. Do not omit files.' },
    /* v9 — the carrier for isolated builds. Empty in shared-tree mode, where the edit is already
       in the repo. In isolate mode this IS the work: the worktree may be cleaned up the moment the
       agent returns, so a patch that only exists on disk is a patch that can evaporate. */
    patch: { type: 'string', description: 'ISOLATE MODE ONLY: the complete unified diff of your change (git diff output), applyable with `git apply` from the repo root. Empty string when not in isolate mode.' },
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
// LAW17 — THE FAT VERSION BAR. Both .rhai shippers block a thin ship and this one did not, so a
// user picking Claude Code could stamp a version integer on one toast. Same law, same threshold,
// this file's idiom. Carried by the architects, the judge, the skeptic panel and its own gate.
const FAT_LAW =
  `FAT VERSION LAW (LAW17): ONE version integer must package real work — (A) >=3 user-visible ` +
  `outcomes in one theme, OR (B) one structural bug with root cause + verification + prevention. ` +
  `A plan whose entire content is one toast / one label / one i18n key / one CSS one-liner / docs ` +
  `fluff does not clear the bar; expand the plan until it does, or state plainly that the work is ` +
  `below a version stamp. Never micro-stamp one version per one-liner. This is NOT a licence to ` +
  `inflate the fleet: the triage agent cap stands — fold MORE OUTCOMES into the SAME items, do not ` +
  `spawn more items.`
const FAT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['applicable', 'passes', 'kind', 'outcomes', 'reason'],
  properties: {
    applicable:  { type: 'boolean' },
    passes:      { type: 'boolean' },
    kind:        { type: 'string', description: 'outcomes | structural-bug | thin' },
    outcomes:    { type: 'array', items: { type: 'string' }, description: 'one user-visible outcome per entry, each tied to a changed file' },
    reason:      { type: 'string' },
    na_evidence: { type: 'string' },
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

/* v7 — REWORK GOT ITS OWN GROUP BACK. meta.phases has declared 'Rework' since the panel was
   written, and nothing was ever assigned to it: the rebuild agents inherited phase 'Build', so the
   progress display promised a group that could never fill. Pre-existing (identical in HEAD), and
   exactly the orphaned-route class LAW19 now blocks — found while adding LAW19, which is the point
   of having it. A rebuild is a genuinely different thing to watch than a first build. */
function buildAgent(item, reworkNote) {
  const act = !APPLY
    ? `Do NOT write anything. Return the change as a unified diff in "changes".`
    : ISOLATE
      ? `You are running in your OWN GIT WORKTREE — an isolated copy of the repo. Edit ${item.file} ` +
        `here as normal, then produce the patch that carries your work back:\n` +
        `  git add -A && git diff --cached\n` +
        `Return that COMPLETE unified diff in "patch". This is not bookkeeping — your worktree may ` +
        `be discarded the moment you return, so a change that exists only on your disk is a change ` +
        `that is LOST. Do NOT commit, push, or touch the main repo. Touch NO file but ${item.file}.`
      : `Make the edit directly to ${item.file}. Touch NO other file — you own this one.`
  const rw = reworkNote ? `\n\nSKEPTICS REFUTED THE LAST ATTEMPT — address ALL of this: ${reworkNote}` : ''
  return spawn(
    `MAX-QUALITY build agent (Opus). Task context: ${TASK}\n` +
    `You own exactly ONE file: ${item.file}. Instruction: ${item.instruction}\n${act}${rw}\n` +
    `Be rigorous: trace the exact failure you are fixing, handle edge cases, match surrounding style, ` +
    `and in self_check state what you verified (compile/syntax/logic-trace). Return the structured result.` + CRAFT_RULES,
    Object.assign(
      { model: 'opus', effort: 'high', label: `${reworkNote ? 'rework' : 'build'}:${item.file}`,
        phase: reworkNote ? 'Rework' : 'Build', schema: BUILD_SCHEMA },
      ISOLATE ? { isolation: 'worktree' } : {})
  ).then(b => ({ item, build: b || null })).catch(() => ({ item, build: null }))
}

// 3 independent skeptics, one per lens, run in parallel. Majority-refute (>=2) kills the change.
// v4 — TRIAGE ASKED FOR 1 SKEPTIC AND THIS BOUGHT 3, EVERY TIME. The Predicter audit's triage said
// skeptics:1 with a clear reason ("nothing is applied or deployed here, the human ships") and the
// gate ignored it and ran the full lens panel — 3x the cost of what was asked for, on every item.
// A triage whose decision is overridden is a triage that is only ever theatre.
function activeLenses() {
  // v12 — an EXPLICIT {skeptics:N} outranks triage. v4 made triage's number authoritative, which was
  // right when the alternative was ignoring it entirely; but it left the human no way to say "I know
  // what this is, buy the full panel" short of editing this file.
  const want = SKEPTICS_OVERRIDE !== null
    ? SKEPTICS_OVERRIDE
    : (globalThis.__triage && typeof globalThis.__triage.skeptics === 'number')
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
      `Through YOUR lens only, try to REFUTE this change. Default to refuted=true if you are not convinced it is correct AND safe AND complete.\n` +
      `OWNERSHIP — CHECK IT, DO NOT ASSUME IT. This builder owned exactly ONE file: ${built.item.file}. ` +
      `It declared it touched: ${JSON.stringify((built.build && built.build.files_touched) || [])}. ` +
      `Run \`git status --porcelain\` (and \`git diff --name-only\` for tracked edits) in the repo and ` +
      `compare. REFUTE as a BLOCKER if any file outside its brief was created, edited or deleted, or if ` +
      `the declaration does not match what git shows — a builder that quietly edits a neighbour's file is ` +
      `how a parallel fleet corrupts a shared tree, and it is the single reason this run has to stay small. ` +
      `Other agents are working in the same tree, so ignore changes that clearly belong to another item; ` +
      `judge only whether THIS builder went outside ${built.item.file}.\n` +
      `Also refute micro-version inflation: if the shipped package is only one toast / one label / one i18n key / one CSS one-liner claiming a full version stamp, that is a BLOCKER under LAW17 (fat version bar), not a nit.`,
      { model: 'opus', effort: 'high', label: `skeptic:${i + 1}:${built.item.file}`, phase: 'Adversarial gate', schema: SKEPTIC_SCHEMA }
    ).catch(() => ({ refuted: true, severity: 'major', reason: 'skeptic errored' }))
  )).then(votes => {
    // v14 — MAJORITY OF THE VOTES ACTUALLY CAST, not of the constant 2. `refutedN >= 2` measured
    // against a hardcoded panel of 3, but activeLenses() can legitimately return 1 (triage's own
    // number, or {skeptics:1} — a real 1-skeptic MAX run happened 2026-08-03). On such a run a single
    // skeptic could NEVER reach 2, so the flagship gate was structurally incapable of refusing
    // anything and every item auto-passed while the payload still advertised an adversarial gate.
    // Strict majority preserves today's behaviour for a full panel: 3 cast needs 2, 2 cast needs 2,
    // 1 cast needs 1. And ZERO votes is REWORK, not pass — spawn() returns null on a ceiling refusal
    // WITHOUT throwing, so .catch never fires and SPAWN_ERRORS stays empty; an empty panel used to
    // read as unanimous approval. Unreviewed is not approved.
    const v = votes.filter(Boolean)
    const cast = v.length
    const reasons = v.filter(x => x.refuted).map(x => x.reason)
    if (cast === 0) {
      return { ...built, gate: { verdict: 'rework', refutedN: 0, votes: 0, panel: lenses.length,
        reasons: ['adversarial gate produced NO votes — the panel was refused or died; unreviewed is not approved'] } }
    }
    if (cast < lenses.length) {
      log(`⚠ Adversarial gate on ${built.item.file}: only ${cast}/${lenses.length} skeptic(s) voted — thin panel.`)
    }
    const refutedN = v.filter(x => x.refuted).length
    const verdict = refutedN * 2 > cast ? 'rework' : 'pass'
    return { ...built, gate: { verdict, refutedN, votes: cast, panel: lenses.length, reasons } }
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
  return bail({ refused: 'dry-run with a file-shaped deliverable', fix: 'apply:true, or drop the file deliverable' })
}

// ================= RUN =================
log(`KONYO WORKFLOW — MAX · ${mode} · ${DRYROUNDS} dry-rounds · floor ${Math.round(FLOOR / 1000)}k`)

// 0) PREFLIGHT — take the workspace lock BEFORE spending anything. See the v10 note above.
// Sonnet, not Opus: this is `date`, `mkdir` and a JSON file. There is no judgement in it, and a
// lock that costs an Opus agent is a lock people will be tempted to switch off.
phase('Preflight')
let lock = null
if (APPLY) {
  const taskSnip = TASK.slice(0, 120).replace(/\s+/g, ' ')
  lock = await spawn(
    `WORKSPACE LOCK — acquire. Pure mechanics, no judgement. Use Bash only.\n\n` +
    `1. LOCKDIR="$HOME/.claude/workflows/.locks"; mkdir -p "$LOCKDIR".\n` +
    `2. KEY = the absolute path of the current working directory (\`pwd -P\`). Slugify it for a ` +
    `filename: replace every "/" with "-" and strip a leading "-". LOCKFILE="$LOCKDIR/<slug>.json".\n` +
    `3. PURGE FIRST. NOW=$(date -u +%s) — INTEGER EPOCH SECONDS. For every *.json in "$LOCKDIR", read ` +
    `its "expires_epoch" and delete the file if it is numerically less than $NOW. Compare with ` +
    `[ "$EXP" -lt "$NOW" ] — an INTEGER test. Do NOT compare the ISO strings with [ a \\< b ]: that ` +
    `is invalid under zsh (it errors with "condition expected: <"), the test then silently fails, and ` +
    `a dead lock survives forever and locks the human out of their own repo. This was caught in ` +
    `testing; do not reintroduce it. Count deletions -> purged_stale. A malformed or unparseable lock ` +
    `file counts as stale — delete it too; unreadable must never mean "held".\n` +
    `4. If "$LOCKFILE" still exists after the purge, another LIVE run owns this tree. Do NOT touch ` +
    `it, do NOT overwrite it. Return acquired:false with its token/started_at/expires_at/task fields ` +
    `as holder_token / holder_since / holder_expires / holder_task.\n` +
    `5. Otherwise WRITE "$LOCKFILE" with exactly these keys, then return acquired:true:\n` +
    `   token         = a unique id you generate (e.g. "$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM")\n` +
    `   started_at    = now, ISO-8601 UTC (human-readable only)\n` +
    `   expires_at    = now + ${LOCK_TTL_MIN} minutes, ISO-8601 UTC (human-readable only)\n` +
    `   expires_epoch = $(( $(date -u +%s) + ${LOCK_TTL_MIN} * 60 ))  <- INTEGER, this is the field\n` +
    `                   step 3 compares. It MUST be present and numeric or the lock is unpurgeable.\n` +
    `   cwd           = the pwd from step 2\n` +
    `   task          = ${JSON.stringify(taskSnip)}\n` +
    `Return the token you wrote. Do not create, edit or delete anything outside "$LOCKDIR".`,
    { model: 'sonnet', effort: 'low', phase: 'Preflight', label: 'lock:acquire', schema: LOCK_SCHEMA }
  , true).catch(() => null)

  if (lock && lock.acquired === false && !IGNORE_LOCK) {
    log(`⛔ WORKSPACE LOCKED — another run is already editing this tree.`)
    log(`   tree     : ${lock.key}`)
    log(`   held by  : ${lock.holder_token || '(unknown)'} since ${lock.holder_since || '(unknown)'}`)
    log(`   its task : ${lock.holder_task || '(not recorded)'}`)
    log(`   expires  : ${lock.holder_expires || '(unknown)'} (locks self-expire after ${LOCK_TTL_MIN}m)`)
    log(`   Refusing to start. Two fleets editing one tree silently overwrite each other.`)
    log(`   Wait for it, stop it, or re-run with {ignoreLock:true} if you KNOW the holder is dead.`)
    // v14 — this was a RAW return: no verdict, no shippable, no blockers. v13's defect #4 surviving
    // in the one exit nobody re-read. Route it through bail() like every other exit.
    return bail({
      refused: 'workspace locked by another run',
      lock,
      fix: 'wait for the holder to finish, TaskStop it, or pass {ignoreLock:true} if it is dead',
      verdict: 'NOT RUN — refused at preflight; another run holds this tree',
    })
  }
  if (lock && lock.acquired === false && IGNORE_LOCK) {
    log(`⚠ WORKSPACE LOCKED but {ignoreLock:true} was passed — proceeding over the lock held by ` +
        `${lock.holder_token || '(unknown)'}. If that run is actually alive, one of you will lose work.`)
  }
  if (lock && lock.acquired) {
    log(`🔒 Workspace lock taken on ${lock.key} (expires in ${LOCK_TTL_MIN}m).` +
        (lock.purged_stale ? ` Purged ${lock.purged_stale} stale lock(s).` : ''))
  }
  if (!lock) log(`⚠ Preflight lock could not be established — proceeding UNLOCKED. If another run is ` +
                 `editing this tree, this run can overwrite it.`)
} else {
  log('Preflight: dry-run writes nothing, so no workspace lock is needed.')
}

// Best-effort release. The TTL is the real guarantee — this just hands the tree back early.
async function releaseLock() {
  if (!lock || !lock.acquired || !lock.token) return null
  // Find the file by TOKEN, not by re-deriving the path slug. The acquirer built that slug from its
  // own `pwd`; re-deriving it here would silently fail to match if the two ever disagreed, and a
  // release that misses leaves the tree locked until the TTL. The token is the thing we actually own.
  return spawn(
    `WORKSPACE LOCK — release. Bash only, no judgement.\n` +
    `LOCKDIR="$HOME/.claude/workflows/.locks"\n` +
    `Find the file in "$LOCKDIR" whose "token" field is exactly ${JSON.stringify(lock.token)} ` +
    `(e.g. \`grep -l\` for that token). Delete ONLY that file — matching the token is what proves it ` +
    `is still OUR lock and not a later run's that reused the same path. If no file carries that ` +
    `token, it was already released or expired: change nothing and say so.\n` +
    `Return {acquired:false, key:"released"} if you deleted it, or {acquired:false, key:"not-ours"} ` +
    `if you did not. Touch nothing outside "$LOCKDIR".`,
    { model: 'sonnet', effort: 'low', phase: 'Synthesize', label: 'lock:release', schema: LOCK_SCHEMA }
  , true).catch(() => null)
}

// 1) ARCHITECT PANEL — 3 diverse lenses in parallel, then an Opus judge merges the best plan.
phase('Triage')
if (!APPLY && wantsAFile(TASK)) {
  log('⚠ TRIAGE REFUSED: this is a DRY-RUN (apply:false) but the task asks agents to WRITE A FILE.')
  log('  Nothing can satisfy that, so every item would fail its gate and rework would multiply.')
  log('  Re-run with apply:true, or ask for the content in the RESULT instead of on disk.')
  return bail({ refused: 'dry-run with a file-shaped deliverable', fix: 'apply:true, or drop the file deliverable' })
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
    await releaseLock()          // v10 — never hold the tree on a path that does no work
    return bail({ refused: 'triage says direct', triage, advice: 'do it in the main loop; a fleet would be slower and dearer here', verdict: 'NOT RUN — triage judged this cheaper in the main loop; nothing was attempted' })
  }
  globalThis.__triage = { ...triage, skeptics: sk }
  // v12 — SAY THE DOWNGRADE OUT LOUD. A MAX run whose triage quietly buys 1 skeptic instead of 3 is
  // still charged at MAX rates, and the human only finds out by reading triage.skeptics in the final
  // JSON. On 2026-08-03 that is exactly what happened, and it was reported as "you paid max-workflow
  // prices for a single-skeptic gate". Announce it while there is still time to re-run.
  if (SKEPTICS_OVERRIDE !== null) {
    log(`SKEPTICS → ${SKEPTICS_OVERRIDE} by explicit override (triage wanted ${sk}).`)
  } else if (typeof sk === 'number' && sk < LENSES.length) {
    log(`⚠ TRIAGE BOUGHT ${sk} SKEPTIC(S), NOT ${LENSES.length} — this is a MAX run at MAX prices with a ` +
        `reduced adversarial gate.`)
    log(`  Its reason: ${triage.why}`)
    log(`  If being wrong here is expensive, stop and re-run with {skeptics:${LENSES.length}}.`)
  }
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
    `ONE OWNER PER FILE (no file appears twice). Read the repo to ground paths. Tag each item's risk.\n\n` +
    `${FAT_LAW}\n\nTASK: ${TASK}`,
    { model: 'opus', effort: 'high', label: `architect:${i + 1}`, phase: 'Architect panel', schema: PLAN_SCHEMA }
  ).catch(() => null)
))).filter(Boolean)

if (!candidatePlans.length) { log('No architect produced a plan.'); return bail({ error: 'no plan' }) }

const plan = await spawn(
  `JUDGE + MERGE. You are given ${candidatePlans.length} candidate decomposition plans for the same task. ` +
  `Produce the single BEST one-owner-per-file plan: take the sharpest decomposition, graft the best items from the others, ` +
  `drop redundancy, ensure NO file is owned twice, and every item is a self-contained fix. Explain why in "why".\n\n` +
  `${FAT_LAW}\nThe merged plan must clear this bar; if the candidates together are still thin, say so in "why" ` +
  `rather than stamping a version on a one-liner.\n\n` +
  `TASK: ${TASK}\n\nCANDIDATES:\n${candidatePlans.map((p, i) => `--- Plan ${i + 1} (${p.version_label}) ---\n` +
    (p.items || []).map(it => `- [${it.risk || '?'}] ${it.file}: ${it.instruction}`).join('\n')).join('\n\n')}`,
  { model: 'opus', effort: 'high', phase: 'Architect panel', schema: JUDGE_SCHEMA }
)
if (!plan || !plan.items) { log(plan === null ? 'CEILING: no budget for the judge.' : 'Judge produced no plan.'); return bail({ error: 'no plan' }) }

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

/* ── v11 — FEASIBILITY, ANNOUNCED BEFORE THE MONEY IS SPENT ──────────────────────────────────────
   The ceiling (v3) is honest but it is a TRIPWIRE: it tells you the run was truncated only once it
   has already truncated it, three quarters of the way in. On 2026-08-03 a 14-agent cap met a plan
   whose completeness loop needed more, and the run reported complete:false after spending 13 — the
   arithmetic that predicted that was available the moment the plan existed.
   So do the multiplication here, out loud. This does NOT refuse: a truncated run is often exactly
   what the human wants. It just refuses to let the truncation be a surprise. */
{
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
let merge = null

// ────────────────────────────────────────────────────────────────────────────────────────────────
// 5.5) THE MERGE — the half `isolation:'worktree'` does not give you
// ────────────────────────────────────────────────────────────────────────────────────────────────
// Isolation without a merge is a silent no-op: every builder edits a throwaway copy, the run goes
// green, and the repo never changes. This is the stage that makes the isolation real.
//
// ONE agent, applying patches SEQUENTIALLY to the live repo. That is the whole point — the tree
// only ever has one writer, which is the property the shared-tree fleet never had and the reason it
// was capped. `git apply --check` runs first on every patch, so a conflict is REPORTED rather than
// forced, and a patch that will not apply leaves the repo untouched instead of half-written.
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

// 6) COMPLETENESS CRITIC — loop until DRYROUNDS consecutive "nothing missing"
phase('Completeness')
let dry = 0, critRound = 0
// v14 — THE LOOP HAS THREE NON-DRY EXITS AND ONLY ONE OF THEM USED TO BE VISIBLE. The hard 3-round
// cap and budgetOK() going false both left ceiling.complete true and verdict 'OK' — a loop that
// stopped early read exactly like a loop that went dry. critStop records WHICH exit was taken.
// NOTE: if DRYROUNDS >= 3 the loop can never satisfy its own dry condition (the 3-round cap always
// bites first) — that is now REPORTED as 'hard 3-round cap' rather than silently read as complete.
let critStop = null
// Gaps the critic raised on a file already owned by an earlier item. They were filtered out and the
// round was then counted DRY — i.e. a critic shouting "that file is STILL broken" was recorded as
// "nothing missing". They no longer make a round dry, and they are carried into the summary.
const unbuiltGaps = []
while (dry < DRYROUNDS && critRound < 3 && budgetOK()) {   // v5 — 6 rounds was hours of tail for diminishing finds
  // the critic can always find one more thing, and each gap costs a builder plus its skeptics —
  // so the loop asks the REAL counter, not an estimate of it
  if (SPENT >= MAX_AGENTS) { log(`CEILING: stopping the completeness loop at ${SPENT}/${MAX_AGENTS}.`); critStop = 'ceiling'; break }
  critRound++
  const passed = results.filter(r => r && r.item && r.gate && r.gate.verdict === 'pass')
  const crit = await spawn(
    `COMPLETENESS CRITIC (Opus). Task: ${TASK}\nChanges made so far (passed the skeptic panel):\n` +
    passed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n') +
    `\nWhat is MISSING to fully and correctly satisfy the task? Look for: an untouched file that also needs the fix, ` +
    `an edge case no item covered, a claim not yet verified, a follow-on the changes now require. ` +
    `If nothing material is missing, done=true with empty missing[]. Only list REAL, actionable gaps (one owner per file).`,
    { model: 'opus', effort: 'medium', phase: 'Completeness', schema: CRITIC_SCHEMA }   // v5 — it hunts GAPS, not proofs
  // v14 — this used to be `.catch(() => ({ done:true, missing:[] }))`: a critic FAILURE converted
  // into "nothing is missing", which then incremented `dry` and declared the run complete. It was
  // unreachable (spawn swallows rejections) but it was aimed straight at the completeness verdict.
  ).catch(() => null)
  if (!crit) {
    // v14 — the old log blamed the ceiling for EVERY null, including an agent that simply died.
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
  // A round only counts as DRY when the critic itself found nothing. Gaps that were merely FILTERED
  // are unbuilt work, not silence.
  if ((crit.done || !missing.length) && !filteredOut.length) {
    dry++; log(`Completeness: dry round ${dry}/${DRYROUNDS}`); continue
  }
  if (!fresh.length) { log(`Completeness: no NEW files to own this round.`); continue }
  dry = 0
  fresh.forEach(m => seen.add(m.file))
  log(`Completeness: critic found ${fresh.length} gap(s) — building`)
  const more = await buildAndGate(fresh.map((m, i) => ({ id: `crit${critRound}-${i}`, file: m.file, instruction: m.instruction })), 'Completeness')
  results = results.concat(more)
}
// v14 — name the exit. Without this, "stopped at the 3-round cap with gaps outstanding" and "went
// dry" were the same silent outcome. critRound is bounded by the cap, so this cannot spin.
if (dry < DRYROUNDS && !critStop) {
  critStop = !budgetOK() ? 'budget floor reached'
    : critRound >= 3 ? 'hard 3-round cap'
    : 'unknown'
}
if (critStop) log(`Completeness: NEVER WENT DRY (${dry}/${DRYROUNDS} dry rounds) — stopped because: ${critStop}`)

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
    // ── VISUAL LAYER (Konyo, 2026-08-02: "isnt part of the konyo workflow max to verify it through
    // dom queries..? add it as a render to the workflow! i want the system perfected.")
    // DOM queries are necessary and NOT sufficient. A panel can satisfy every selector assertion and
    // still be visually broken: zero-height container, white-on-white text, overlapping siblings, a
    // chart with every bar at 0px, content shoved off-screen. So the gate has to LOOK, not just ask.
    // HARD-WON, THIS SESSION: page.screenshot() WAITS ON FONT LOADING. A route handler that
    // route.abort()s non-API requests makes fonts never resolve, so the capture hangs for the entire
    // timeout and writes no file at all. Fulfil unwanted requests with an empty 200 instead of
    // aborting, and pass animations:'disabled' — infinite CSS animations stall a fullPage capture
    // exactly the same way. This comment exists so nobody has to re-learn it.
    `5. VISUAL LAYER — DOM QUERIES ARE NOT ENOUGH, and this step is NOT optional when a UI changed. ` +
    `Take an ACTUAL SCREENSHOT and assert on RENDERED GEOMETRY: (a) every key element's ` +
    `boundingBox() has width>0 AND height>0; (b) no text is clipped (scrollWidth <= clientWidth+1); ` +
    `(c) nothing overflows the viewport horizontally (scrollingElement.scrollWidth <= innerWidth+1); ` +
    `(d) computed text colour differs from its own resolved background (catches white-on-white); ` +
    `(e) no two sibling panels overlap (rect intersection area === 0). This ADDS to the hit-testing ` +
    `above — it does not replace it.\n` +
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
    `6. SAVE THE SCREENSHOT TO A FILE and report every absolute path in screenshots[]. A gate whose ` +
    `evidence nobody can open is a gate you have to take on faith.\n` +
    `7. SCREENSHOT TRAP — page.screenshot() WAITS ON FONTS. A route handler that route.abort()s ` +
    `non-API requests means fonts NEVER resolve: the capture hangs for the full timeout and produces ` +
    `nothing. Fulfil with route.fulfill({status:200, body:''}) instead of aborting, and pass ` +
    `{ animations: 'disabled' } (infinite CSS animations stall a fullPage capture the same way). If ` +
    `a capture times out, report it as a FAILURE — never as "visual checks skipped".\n` +
    `NEVER start a long-lived server on a port the user's own app uses; kill anything you start.\n` +
    `Report failures as failures. A green report you did not actually run is the worst outcome here.`,
    { model: 'opus', effort: 'high', phase: 'Render gate', schema: {
        type: 'object', additionalProperties: false,
        required: ['available', 'ran', 'passed', 'failures', 'notes', 'screenshots', 'visual'],
        properties: {
          available: { type: 'boolean', description: 'does the project have UI verification tooling at all' },
          ran:       { type: 'string',  description: 'the exact command run, or why none was' },
          passed:    { type: 'boolean', description: 'false if ANY check failed or none could run' },
          failures:  { type: 'array', items: { type: 'string' }, description: 'one line per real failure' },
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
        },
      } }
  ).catch(() => null)
  if (renderGate && renderGate.available && !renderGate.passed) {
    // v14 — `failures` is schema-required, but a truncated/non-compliant agent return made this
    // an unguarded .length: a TypeError at top level AFTER the whole run, destroying the report.
    const rgf = renderGate.failures || []
    log(`⛔ RENDER GATE FAILED — ${rgf.length} failure(s). This is a SHIP BLOCKER.`)
    rgf.slice(0, 8).forEach(f => log(`   · ${f}`))
    // v14 — v13 wired blocker() only into the DID-NOT-RUN branch. A gate that ran and REFUSED the
    // ship still computed verdict 'OK' / shippable true. A refusal is the strongest blocker there is.
    blocker('RENDER GATE FAILED', `${rgf.length} failure(s): ${rgf.slice(0, 3).join('; ')}`)
  } else if (renderGate && !renderGate.available) {
    log(`⚠ RENDER GATE: the project has no UI verification. Nothing here has been seen painted.`)
  } else if (renderGate) {
    log(`✅ Render gate passed (${renderGate.ran}).`)
  } else {
    // v13 — the silent hole. null here means the ceiling refused the spawn or the agent died, and
    // the old chain fell straight through to "ship it".
    blocker('RENDER GATE DID NOT RUN',
      SPENT >= MAX_AGENTS - 2
        ? `the ${MAX_AGENTS}-agent ceiling was already spent, so nothing was ever seen painted`
        : 'the gate agent returned nothing (died or was skipped) — nothing was seen painted')
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
      log(`   ⚠ NO SCREENSHOT CAPTURED — this pass is DOM-only; nothing was seen painted.`)
    }
  }
}

// 6.6) THE FAT VERSION BAR — LAW17
// ────────────────────────────────────────────────────────────────────────────────────────────────
// Both .rhai shippers have blocked a thin ship for a while; this one did not, so the same work
// could ship as a version through Claude Code and be refused through Grok. One standard: a version
// integer has to package real work. MAX depth = the judge must ENUMERATE what it counted, each
// outcome tied to a changed file — an unenumerated "yes it's fat" is exactly the assertion this
// gate exists to refuse.
let fatBar = null
if (APPLY) {
  phase('Fat version bar')
  const gatePassed = results.filter(r => r && r.item && r.gate && r.gate.verdict === 'pass')
  fatBar = await spawn(
    `FAT VERSION BAR (Opus). Task: ${TASK}\nVersion stamp being claimed: ${plan.version_label}\n\n` +
    `LAW17 FAT VERSION BAR: ONE version integer must package real work — (A) >=3 user-visible ` +
    `outcomes in one theme, OR (B) one structural bug with root cause + verification + prevention. ` +
    `A ship whose entire content is one toast / one label / one i18n key / one CSS one-liner / docs ` +
    `fluff alone is a BLOCKER, not a ship.\n\n` +
    `WHAT ACTUALLY SHIPPED (only changes that PASSED the skeptic panel count):\n` +
    (gatePassed.length
      ? gatePassed.map(r => `- ${r.item.file}: ${r.build && r.build.summary}`).join('\n')
      : '(nothing passed the gate)') + `\n\n` +
    `YOUR JOB, and it is not a vibe check:\n` +
    `1. ENUMERATE every user-visible outcome you are counting, ONE PER LINE in outcomes[], and TIE ` +
    `EACH ONE to a changed file from the list above (e.g. "src/foo.ts — the export button now ` +
    `reports the row count"). An unenumerated "yes it's fat" is a FAIL.\n` +
    `2. Count only outcomes a USER CAN SEE. Files touched, refactors, comments, tests and docs are ` +
    `not outcomes. NEVER inflate a count to clear the bar — three real outcomes beat five padded ones, ` +
    `and a padded count is itself the failure.\n` +
    `3. State explicitly in "kind" which limb was satisfied: "outcomes" for (A), "structural-bug" for ` +
    `(B), "thin" if neither. For (B) the root cause, the verification and the prevention must ALL be ` +
    `named in "reason" — a bug fix with no prevention has not cleared limb B.\n` +
    `4. Read the changed files if you need to; do not take a builder's summary as proof of a visible outcome.\n` +
    `5. applicable:false ONLY if this run produces no version stamp at all, and it REQUIRES ` +
    `na_evidence naming what you inspected to conclude that. N/A without evidence is a FAIL.\n` +
    `If it is thin, say thin. Blocking a one-liner is the cheapest thing this gate ever does.`,
    { model: 'opus', effort: 'high', phase: 'Fat version bar', schema: FAT_SCHEMA }
  ).catch(() => null)
  if (fatBar && fatBar.applicable && !fatBar.passes) {
    log(`⛔ LAW17 FAT VERSION BAR FAILED — ${fatBar.reason}. This is a SHIP BLOCKER.`)
    ;(fatBar.outcomes || []).slice(0, 8).forEach(o => log(`   · ${o}`))
    blocker('LAW17 FAT VERSION BAR FAILED', fatBar.reason)   // v14 — a refused thin ship must reach the summary
  } else if (fatBar && !fatBar.applicable) {
    log(`⚠ LAW17 N/A — no version stamp in this run. Evidence: ${fatBar.na_evidence || '(none given — that is itself a fail)'}`)
    // v14 — the prompt says "N/A without evidence is a FAIL"; the code only logged it. Now they agree.
    if (!fatBar.na_evidence) {
      blocker('LAW17 N/A WITHOUT EVIDENCE',
        'the bar declared itself not applicable and named nothing it inspected')
    }
  } else if (fatBar) {
    log(`✅ Fat version bar passed (${(fatBar.outcomes || []).length} outcomes).`)
    ;(fatBar.outcomes || []).slice(0, 8).forEach(o => log(`   · ${o}`))
  } else {
    blocker('LAW17 FAT VERSION BAR DID NOT RUN',
      'the version stamp was never checked for substance — a thin ship could not have been caught')
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// 6.7) THE REACHABILITY GATE — LAW19 (added after two dead features shipped in one night)
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
  const rd = reach.dead || []
  log(`⛔ REACHABILITY FAILED — ${rd.length} dead seam(s). This is a SHIP BLOCKER.`)
  rd.slice(0, 8).forEach(d => log(`   · ${d}`))
  blocker('LAW19 REACHABILITY FAILED', `${rd.length} dead seam(s): ${rd.slice(0, 3).join('; ')}`)
} else if (reach && reach.tests_added && !reach.tests_proven_run) {
  log(`⛔ REACHABILITY FAILED — tests were added and NOT proven to run. SHIP BLOCKER.`)
  blocker('LAW19 REACHABILITY FAILED', 'tests were added and were not proven to run')
} else if (!reach) {
  blocker('LAW19 REACHABILITY DID NOT RUN',
    'no symbol added by this run was traced to a caller and a writer — a dead feature could not have been caught')
} else if (reach) {
  log(`✅ Reachability: ${reach.checked} symbol(s) traced to a caller and a writer.`)
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
    ((renderGate.failures || []).length ? `\n  FAILURES:\n` + (renderGate.failures || []).map(f => '  - ' + f).join('\n') : '') +
    (renderGate.notes ? `\n  eyeball: ${renderGate.notes}` : '') +
    `\n  SCREENSHOTS (${(renderGate.screenshots||[]).length}): ` + ((renderGate.screenshots||[]).join(', ') || 'NONE — nothing was captured, so this was a DOM-only pass') +
    ((renderGate.visual||[]).length ? `\n  VISUAL GEOMETRY:\n` + renderGate.visual.map(v => '  - ' + v).join('\n') : '\n  VISUAL GEOMETRY: none reported') +
    `\nIf screenshots is empty the headline must NOT claim the UI was seen — DOM queries alone cannot see a painted page. ` +
    `\nIf the render gate FAILED, the headline must say the ship is BLOCKED and why — do not report success over a broken screen. ` +
    `If it was unavailable, the headline must say nothing was seen painted.` : '\nRENDER GATE: not run (dry-run).') +
  (fatBar ? `\nFAT VERSION BAR: applicable=${fatBar.applicable} passes=${fatBar.passes} kind=${fatBar.kind}` +
    ((fatBar.outcomes && fatBar.outcomes.length) ? `\n  outcomes:\n` + fatBar.outcomes.map(o => '  - ' + o).join('\n') : '\n  outcomes: (none enumerated)') +
    (fatBar.reason ? `\n  reason: ${fatBar.reason}` : '') +
    (fatBar.na_evidence ? `\n  na_evidence: ${fatBar.na_evidence}` : '') +
    `\nIf the fat version bar FAILED, the headline must say the ship is BLOCKED as a THIN VERSION under LAW17, ` +
    `and must name what would make it fat (which additional user-visible outcomes, or which structural bug ` +
    `with root cause + verification + prevention).` : '\nFAT VERSION BAR: not run (dry-run).') +
  // v14 — THE SUMMARY A HUMAN ACTUALLY READS NEVER SAW THE BLOCKERS. This agent was handed
  // passed/failed/render/fat and nothing else — not BLOCKERS, not the agent errors, not the ceiling,
  // not the trimmed items, not the completeness record. So `headline`, the ONE line Konyo reads,
  // could announce a clean ship while blockers[] was non-empty. Everything below is already in scope.
  `\n\n══ RUN INTEGRITY — THIS OUTRANKS EVERYTHING ABOVE ══\n` +
  `SHIP BLOCKERS (${BLOCKERS.length}):\n` +
  (BLOCKERS.length ? BLOCKERS.map(b => `  - ${b.what}: ${b.why}`).join('\n') : '  (none)') +
  `\nAGENT ERRORS (${SPAWN_ERRORS.length}): ` + (SPAWN_ERRORS.slice(0, 5).join(' | ') || '(none)') +
  `\nAGENT CEILING: ${SPENT}/${MAX_AGENTS} spent; hit=${CEILING_HIT}` +
  `\nTRIMMED FROM PLAN (${(globalThis.__trimmed || []).length}): ` + ((globalThis.__trimmed || []).join(', ') || '(none)') +
  `\nINFEASIBILITY: ${globalThis.__infeasible ? JSON.stringify(globalThis.__infeasible).slice(0, 400) : '(none flagged)'}` +
  `\nCOMPLETENESS: ${critRound} round(s), ${dry}/${DRYROUNDS} dry, wentDry=${dry >= DRYROUNDS}` +
  `, stoppedBecause=${critStop || '(went dry)'}` +
  `\nGAPS RAISED BUT NEVER BUILT (${unbuiltGaps.length}): ` + (unbuiltGaps.slice(0, 5).join(' | ') || '(none)') +
  `\nRULES FOR THE HEADLINE, NOT SUGGESTIONS:\n` +
  `  · If ANY blocker is listed above, the headline MUST LEAD with "BLOCKED" and name the blocker. ` +
  `You may NEVER claim a clean ship over a non-empty blockers list, however good the passed count looks.\n` +
  `  · If the ceiling was hit, or items were trimmed, or completeness never went dry, or gaps were ` +
  `raised and never built, the headline MUST LEAD with "UNVERIFIED" or "PARTIAL" and say which.\n` +
  `  · If agents died, say so — their planned work silently did not happen; that is missing, not passed.\n` +
  `  · Only a run with no blockers, no ceiling hit, no trims, no dead agents and a dry completeness ` +
  `critic may be described as clean.\n` +
  `\nWrite the single final report. headline = the ONE-line ping for Konyo.`,
  { model: 'opus', effort: 'high', phase: 'Synthesize', schema: FINAL_SCHEMA }
, true)
// v14 — a dead synthesizer used to return final:null with verdict 'OK'. BLOCKERS is read when the
// return literal below evaluates, so pushing here lands in the returned object.
if (!final) blocker('SYNTHESIS DID NOT RUN',
  'the final report agent returned nothing — passed/failed counts are raw and unreviewed')

// v10 — hand the tree back before reporting. If this never runs (killed run, crash), the TTL does it.
const released = await releaseLock()
const didRelease = !!(released && released.key === 'released')
if (lock && lock.acquired) {
  log(didRelease ? '🔓 Workspace lock released.'
                 : `⚠ Workspace lock NOT released (${(released && released.key) || 'release agent failed'}) — ` +
                   `it self-expires after ${LOCK_TTL_MIN}m.`)
}

return {
  version: plan.version_label,
  mode,
  quality: `MAX (Opus everywhere · 3-architect judge panel · ${activeLenses().length}-skeptic adversarial gate · loop-until-dry)`,
  tokens_spent: budget.total ? budget.spent() : null,
  passed: passed.length,
  failed: failed.length,
  // v12 — the size of the gate the run ACTUALLY bought, next to what MAX implies. A report that says
  // "3-skeptic adversarial gate" over a 1-skeptic run is the report lying about its own rigour.
  skeptics: {
    used: activeLenses().length,
    of: LENSES.length,
    source: SKEPTICS_OVERRIDE !== null ? 'explicit override'
      : (globalThis.__triage && typeof globalThis.__triage.skeptics === 'number') ? 'triage' : 'default',
  },
  // v11 — if the plan never fit the ceiling, that was known before building. Say so here too.
  infeasible: globalThis.__infeasible || null,
  lock: lock ? { acquired: !!lock.acquired, key: lock.key, released: didRelease } : null,
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
  // v14 — the loop's OWN account of itself. `ceiling.complete` only ever saw the ceiling exit; the
  // 3-round cap and the budget floor both stopped the critic early and still read as complete.
  completeness: {
    rounds: critRound,
    dry,
    required: DRYROUNDS,
    wentDry: dry >= DRYROUNDS,
    stoppedBecause: critStop,
    unbuiltGaps,
  },
  // v13 — THE VERDICT, AND IT IS NOT A VIBE. Everything above is data a reader has to assemble
  // themselves; this is the one field that answers "is this safe to have shipped". A run that hit
  // its ceiling mid-completeness, or skipped a blocking gate, or lost agents to errors, is
  // UNVERIFIED — not passed. On 2026-08-04 a run returned passed:7 failed:0 while render_gate,
  // merge and fat_version were all null and the completeness loop had been cut off by the cap;
  // every one of those facts was present in the payload and none of them reached the summary.
  blockers: BLOCKERS,
  agent_errors: SPAWN_ERRORS,
  verdict: BLOCKERS.length ? 'BLOCKED — see blockers[]'
    : CEILING_HIT ? 'UNVERIFIED — the agent ceiling stopped the run before the completeness critic went dry'
    // v14 — the completeness loop has three non-dry exits and only the ceiling one used to show here.
    : (dry < DRYROUNDS || unbuiltGaps.length) ? 'UNVERIFIED — the completeness critic never went dry (' + (critStop || 'gaps raised but never built') + ')'
    : (globalThis.__trimmed || []).length ? 'PARTIAL — items were trimmed from the plan to fit the ceiling'
    // v14 — `failed` was computed and reported as a count and read by NOTHING: passed:1 failed:6
    // returned verdict 'OK', shippable true. An item that never cleared the panel is not shipped.
    : failed.length ? 'INCOMPLETE — ' + failed.length + ' item(s) never passed the skeptic panel'
    : SPAWN_ERRORS.length ? 'DEGRADED — some agents died; their work is missing, not failed'
    : 'OK',
  // A dead agent means planned work silently did not happen — that is missing work, not a
  // transient blip, so it costs the shippable flag too. Erring toward telling him.
  shippable: !BLOCKERS.length && !CEILING_HIT && !(globalThis.__trimmed || []).length && !SPAWN_ERRORS.length
    && !failed.length && dry >= DRYROUNDS && !unbuiltGaps.length,
  triage: globalThis.__triage || null,
  render_gate: renderGate,
  merge: merge,
  fat_version: fatBar,
  final,
}
