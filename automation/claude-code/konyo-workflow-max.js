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
    { title: 'Merge',          detail: 'isolate mode only — applies each worktree patch to the REAL repo, one at a time, git apply --check first', model: 'opus' },
    { title: 'Completeness',    detail: 'Opus critic hunts for missed work; loop until N dry rounds', model: 'opus' },
    { title: 'Render gate',    detail: 'drives the REAL UI — hit-testable controls, no raw placeholders, page still responds; failure BLOCKS the ship', model: 'opus' },
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
    `ONE OWNER PER FILE (no file appears twice). Read the repo to ground paths. Tag each item's risk.\n\n` +
    `${FAT_LAW}\n\nTASK: ${TASK}`,
    { model: 'opus', effort: 'high', label: `architect:${i + 1}`, phase: 'Architect panel', schema: PLAN_SCHEMA }
  ).catch(() => null)
))).filter(Boolean)

if (!candidatePlans.length) { log('No architect produced a plan.'); return { error: 'no plan' } }

const plan = await spawn(
  `JUDGE + MERGE. You are given ${candidatePlans.length} candidate decomposition plans for the same task. ` +
  `Produce the single BEST one-owner-per-file plan: take the sharpest decomposition, graft the best items from the others, ` +
  `drop redundancy, ensure NO file is owned twice, and every item is a self-contained fix. Explain why in "why".\n\n` +
  `${FAT_LAW}\nThe merged plan must clear this bar; if the candidates together are still thin, say so in "why" ` +
  `rather than stamping a version on a one-liner.\n\n` +
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
      log(`⛔ MERGE: ${merge.applied.length} applied, ${merge.failed.length} FAILED — those changes are NOT in the repo:`)
      merge.failed.slice(0, 8).forEach(x => log(`   · ${x}`))
    } else if (merge) {
      log(`✅ Merge: ${merge.applied.length}/${passing.length} patches applied to the real repo.`)
    } else {
      log(`⛔ MERGE AGENT DIED — ${passing.length} patch(es) were NOT applied. The repo is unchanged.`)
    }
  }
}

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
  } else if (fatBar && !fatBar.applicable) {
    log(`⚠ LAW17 N/A — no version stamp in this run. Evidence: ${fatBar.na_evidence || '(none given — that is itself a fail)'}`)
  } else if (fatBar) {
    log(`✅ Fat version bar passed (${(fatBar.outcomes || []).length} outcomes).`)
    ;(fatBar.outcomes || []).slice(0, 8).forEach(o => log(`   · ${o}`))
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
  log(`⛔ REACHABILITY FAILED — ${reach.dead.length} dead seam(s). This is a SHIP BLOCKER.`)
  reach.dead.slice(0, 8).forEach(d => log(`   · ${d}`))
} else if (reach && reach.tests_added && !reach.tests_proven_run) {
  log(`⛔ REACHABILITY FAILED — tests were added and NOT proven to run. SHIP BLOCKER.`)
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
    (renderGate.failures.length ? `\n  FAILURES:\n` + renderGate.failures.map(f => '  - ' + f).join('\n') : '') +
    (renderGate.notes ? `\n  eyeball: ${renderGate.notes}` : '') +
    `\nIf the render gate FAILED, the headline must say the ship is BLOCKED and why — do not report success over a broken screen. ` +
    `If it was unavailable, the headline must say nothing was seen painted.` : '\nRENDER GATE: not run (dry-run).') +
  (fatBar ? `\nFAT VERSION BAR: applicable=${fatBar.applicable} passes=${fatBar.passes} kind=${fatBar.kind}` +
    ((fatBar.outcomes && fatBar.outcomes.length) ? `\n  outcomes:\n` + fatBar.outcomes.map(o => '  - ' + o).join('\n') : '\n  outcomes: (none enumerated)') +
    (fatBar.reason ? `\n  reason: ${fatBar.reason}` : '') +
    (fatBar.na_evidence ? `\n  na_evidence: ${fatBar.na_evidence}` : '') +
    `\nIf the fat version bar FAILED, the headline must say the ship is BLOCKED as a THIN VERSION under LAW17, ` +
    `and must name what would make it fat (which additional user-visible outcomes, or which structural bug ` +
    `with root cause + verification + prevention).` : '\nFAT VERSION BAR: not run (dry-run).') +
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
  merge: merge,
  fat_version: fatBar,
  final,
}
