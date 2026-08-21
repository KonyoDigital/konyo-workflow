export const meta = {
  name: 'konyo-workflow',
  description: 'KONYO WORKFLOW — ONE door. You set stakes (reversible | costly | irreversible); the engine derives the cost shape. Unstated = costly. Every ship gate always runs — skeptic panel, render+vision, LAW17, LAW19, lock, ceiling. {stakes:"reversible"} is the cheap ladder. {stakes:"irreversible"} buys the judge panel, Opus everywhere and the completeness critic. items[] skips the architect (a plan, not a door). There is no max/lean/tiny door. Pass {thirdEye:false} to drop the independent reviewer. A stakes flag buys model tier, panel size and extra phases, NEVER a gate. The render gate is a LOOP — narrow AND wide, each failure handed to a fixer, and the FINAL pass is what blocks. v40: an INCOMPLETE run can no longer read as a complete one — a trimmed plan raises a blocker, the verdict string itself carries what was never swept, and top-level complete/not_swept/planned_items say so.',
  whenToUse: 'ANY multi-step task you want orchestrated. It TRIAGES itself first, so a serial diagnosis is sent back to be done directly instead of spawning a fleet. Pass {stakes:"reversible"} when cheap to be wrong (copy edits, contained CSS, mechanical rename). Pass {stakes:"irreversible"} for money, security, trading, migrations, live ships. Omit stakes for the default costly shape. items:[{file,instruction}] skips the architect at any stakes. v38: stakes is the public dial; quality remains the internal shape. v30 meter routing still applies to the derived shape. `grok:false` still works as the old name for thirdEye:false. v40 dials: {strictScope:true} REFUSES a plan that does not fit the cap instead of dropping its tail; {grokTimeoutSeconds:N} sets the third eye\'s budget (default 420 — 180 was killing live, mid-review Grok seats).',
  phases: [
    { title: 'Preflight',   detail: 'workspace lock — refuse to start if another run is already editing this tree' },
    { title: 'Triage',      detail: 'right-size the run BEFORE spending: shape · parallelism · cost-of-wrong. SKIPPED at quality:"tiny" — the caller supplied the work list', model: 'opus' },
    { title: 'Architect',   detail: 'NOT OPENED at quality:"tiny" (the caller supplied the plan). ONE Opus architect by default (lean/standard); 3 Opus architects (risk / correctness / simplest lenses) + an Opus judge at quality:"max". One owner per file either way.', model: 'opus' },
    { title: 'Third-eye',   detail: 'NOT OPENED at quality:"tiny" (no plan to review; seats 2-4 still sit). seat 1 of 4 — Grok (a DIFFERENT model family) reviews the chosen plan before a builder spends anything; seats 2-4 sit on the skeptic panel, the render gate and the pre-ship verdict' },
    { title: 'Build+Gate',  detail: 'each item built at its architect-assigned tier, sonnet floor (default lean); Opus everywhere at quality:"max", Haiku/Sonnet at quality:"standard". One owner per file, gated immediately, no barrier' },
    { title: 'Adversarial gate', detail: 'THE DEFAULT PATH — diverse-lens Opus skeptics ARE the gate (floor 2, one seat is the third eye); majority-refute kills the change', model: 'opus' },
    { title: 'Rework',      detail: 'failed items escalate one tier up and re-gate, version-per-round' },
    { title: 'Merge',       detail: 'NOT OPENED unless {isolate:true}. (isolate mode only) applies each worktree patch to the REAL repo, one at a time, git apply --check first', model: 'opus' },
    { title: 'Completeness',detail: 'NOT OPENED at tiny/lean/standard. quality:"max" ONLY — an Opus critic hunts for work nobody did; loops until N dry rounds. NOT bought at the lean default or at standard, and the report says so rather than implying the sweep happened', model: 'opus' },
    { title: 'Render gate', detail: 'v26 — a LOOP, not a verdict: drives the REAL UI at a NARROW and a WIDE viewport (a defect that exists at one width is invisible to a single render), asserts SCREENSHOT-BACKED geometry + looks at every picture, then hands any failure to a fixer and renders AGAIN — up to RENDERLOOP passes (tiny 2 / lean 3 / max 4). The final pass is what blocks, so the loop buys attempts, never a pass' },
    { title: 'Fat version bar', detail: 'LAW17 — >=3 user-visible outcomes in one theme OR one structural bug with root cause+verify+prevention; a thin ship BLOCKS' },
    { title: 'Reachability',   detail: 'LAW19 — every symbol the change added has a caller AND a writer; added tests proven to have RUN; failure BLOCKS', model: 'opus' },
    { title: 'Ship',       detail: 'v23 — the ONLY thing that pushes. Opens ONLY when every gate passed and the verdict is shippable; pushes, never commits, never --no-verify/--force, and proves the remote actually moved. A refusal is reported with its reason.', model: 'opus' },
    { title: 'Synthesize',  detail: 'NOT OPENED at quality:"tiny" (tiny writes its own report in-script). Opus integrates all passing work into ONE final report' },
    /* v40 — DECLARED, BECAUSE IT WAS ALREADY BEING USED. phase_parity_check.mjs has been failing on
       this since the carve phase was added: `phase('Carve')` runs, meta.phases never mentioned it,
       so its agents appeared in a progress group the caller was never told about. Found while
       regression-testing an unrelated fix; it is the engine's own house rule (a thing that happens
       and is not declared) and it was living in the declaration OF the phases. */
    { title: 'Carve',       detail: 'v31 — LAST agent of the arc, after every round is finished: graduates a cluster of repeated failures into a durable skill. Only runs when a territory crossed the carve floor' },
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
   'cheap', 'quik') resolves to MAX — the failure mode of a misread flag must be an expensive run,
   never a quiet one that the caller believes was maxed. And the fallback is SAID OUT LOUD below:
   a quality you did not ask for is exactly the kind of fact that reads as consent when it is silent. */
/* ══ v38 — STAKES IS THE PUBLIC DIAL; QUALITY IS THE INTERNAL NAME ═══════════════════════════════
   Konyo 2026-08-15: "i dont want a max/lean/tiny". The human names what being wrong COSTS — the one
   question triage cannot answer for itself, because a contained CSS fix and a contained CSS fix on
   the live console during market hours are the same diff. The engine derives the internal shape
   (standard|lean|max) so every existing gate keeps keying off QUALITY and nothing downstream moves.

   THIS WAS AN UNJOINED END FOR A WHILE, AND IT FAILED IN THE UNSAFE DIRECTION. The door was
   rewritten to send `stakes`; the engine read only `A.quality`; nothing errored. `stakes` fell on
   the floor, QUALITY_ASKED came back null, and the run resolved to the LEAN DEFAULT — so the flag
   whose entire purpose is "this is the expensive one, buy the judge panel" silently bought the
   cheap shape while the caller believed otherwise. Measured on the shipped engine:
     before   stakes:"irreversible"  ->  v30 METER: maxItems=8 (quality=lean)
     after    stakes:"irreversible"  ->  v30 METER: maxItems=6 (quality=max)

   RESOLVED FROM TWO INDEPENDENT FIXES (2026-08-15), keeping the better half of each:
     · STAKES WINS over an explicit quality. Konyo's call: stakes is the public dial, quality is
       plumbing, and a caller who names both means the one they typed at the door.
     · The leading `--` IS STRIPPED, so `stakes:'--irreversible'` — what a door forwarding
       $ARGUMENTS naturally produces — does not read as an unknown word and quietly become a typo
       case. That path is exactly how a dial gets mangled in transit.
     · An unrecognised stakes word resolves to MAX and is SHOUTED, same direction as a quality typo
       and for the same reason: a caller who believes they bought the careful shape must never
       quietly get the cheap one. ════════════════════════════════════════════════════════════════ */
const STAKES_FLAG = (A && typeof A.stakes === 'string')
  ? A.stakes.trim().toLowerCase().replace(/^--/, '')
  : ''
const QUALITY_FROM_STAKES = { reversible: 'standard', irreversible: 'max', costly: 'lean' }
const STAKES_KNOWN = ['reversible', 'irreversible', 'costly']
const STAKES_TYPO = !!(STAKES_FLAG && !STAKES_KNOWN.includes(STAKES_FLAG))
const QUALITY_FLAG = (A && typeof A.quality === 'string') ? A.quality.trim().toLowerCase()
                    : (typeof globalThis.__KONYO_QUALITY === 'string' ? globalThis.__KONYO_QUALITY : null)
const QUALITY_ASKED = STAKES_FLAG
  ? (QUALITY_FROM_STAKES[STAKES_FLAG] || 'max')
  : QUALITY_FLAG
/* v19.2 — IT IS CALLED LEAN, BECAUSE IT IS NOT FAST. Two real runs, measured: max took 53.7min and
   1.42M tokens; this path took ~46min and ~540k. That is ~15% quicker and ~62% cheaper — so the name
   "fast" promised the number it is worst at and hid the one it is excellent at. Konyo, watching it:
   "nothing here is fast though.. just maybe token optimized.. maybe it should be called something
   else". He is right, and the reason is structural: wall-clock is set by the single owner walking the
   biggest file, which no flag can shorten, while tokens scale with agent count and tier — exactly
   what this path cuts. `fast` still resolves, silently, so no saved invocation breaks. */
const QUALITY_ALIAS = { fast: 'lean' }
const KNOWN_QUALITIES = ['max', 'lean', 'standard', 'tiny']
const QUALITY_RESOLVED = QUALITY_ALIAS[QUALITY_ASKED] || QUALITY_ASKED
/* v20 — LEAN IS NOW THE DEFAULT. Konyo, 2026-08-04, having watched a max run open on the D2R
   console queue: "by default make it LEAN". This REVERSES the v18 default (max) — and it reverses
   only the DEFAULT, deliberately nothing else.

   Why this is safe to flip and was always the better default: MAXQ is `max || lean`, so EVERY
   max-only gate already applies to lean. Lean does not buy fewer safeguards; it buys one architect
   instead of a judge panel, one rework round, no completeness critic, and low-risk items built at
   the tier their own architect asked for. Measured across two real runs: max 53.7min / 1.42M tokens
   vs lean ~46min / ~540k — ~15% quicker and ~62% cheaper for the same gates.

   TWO DISTINCT CASES, AND THEY MUST NOT COLLAPSE (they did until now — both fell to 'max'):
     · NOTHING ASKED  -> LEAN. The new default. A bare invocation is the cheap-but-fully-gated path.
     · ASKED AND UNRECOGNISED ('MAXX', 'standrd', 'cheap') -> still MAX, still shouted.
   The v18 safeguard is INTACT AND UNWEAKENED: a flag we failed to parse still fails EXPENSIVE,
   because the danger there is a caller who believes they bought max and quietly did not. That
   danger does not exist for a bare call — a caller who passed no flag is claiming nothing. */
const QUALITY_DEFAULT = 'lean'
const QUALITY = KNOWN_QUALITIES.includes(QUALITY_RESOLVED) ? QUALITY_RESOLVED
              : (QUALITY_ASKED ? 'max' : QUALITY_DEFAULT)
const QUALITY_TYPO = !!(QUALITY_ASKED && !KNOWN_QUALITIES.includes(QUALITY_RESOLVED))
const QUALITY_DEFAULTED = !QUALITY_ASKED
/* v19 — LEAN IS MAX WITH ITS EYES OPEN ABOUT TIER, NOT MAX WITH FEWER GATES.
   Measured on the first real max run (D2R console queue, 2026-08-04): the ceremony everyone assumes
   is the overhead — lock, triage, three architects — took 3.5 minutes of a 36-minute run. Cutting it
   would buy nothing. The time is in BUILDERS and SKEPTICS, and the critical path is whichever agent
   owns the biggest file.
   What max actually wastes is INFORMATION IT ALREADY HAS: the architect tags every item with a
   `risk`, and then tierFor() overrides all of it to Opus-everywhere, so a `#hd-forge-chips` grid
   fix and a CASC binary re-extraction are built identically.
   So `lean` keeps EVERY gate max has — the 3-architect panel, the skeptic panel AS the gate, the
   completeness critic, the render gate, LAW17, LAW19, feasibility — and changes exactly one thing:
   a `risk:'low'` item is built at the tier its architect asked for instead of at Opus. Anything
   medium or high risk, and anything with no risk tag at all, still gets Opus. A low-risk item that
   FAILS its gate escalates on rework like any other, so the cheap tier is a first attempt, never a
   final answer. Nothing about the review changes — the skeptics reading the diff are Opus either way. */
/* v22 — TINY: A HOP BUDGET, NOT AN AGENT BUDGET. Konyo, after a 66-minute run shipped three small
   UI edits: "how do we get to an optimization of that exact amount of time... maximum 15 Minutes".
   MEASURED WHY IT WAS SLOW, and it is not agent count: wall clock ≈ SERIAL HOPS × time per hop. The
   default chain is 11 phases deep (Preflight→Triage→Architect→Third-eye→Build→Adversarial→Rework→
   Render→LAW17→LAW19→Synthesize) and each hop is a full agent round-trip of 3-8 minutes. 11 × ~4min
   ≈ 45min before parallelism can help — and it cannot help, because the phases are CHAINED.
   So tiny is designed backwards from 15 minutes = FOUR serial hops:
     1 lock  ·  2 build (one agent per FILE, parallel)  ·  3 ALL GATES FAN OUT  ·  4 stamp+push.
   The trick is hop 3. The render gate, LAW17 and LAW19 are three separate serial phases today, but
   they all read the SAME finished diff and have no dependency on each other — queueing them is pure
   waste. Fanned out, ~16 minutes becomes ~5 and nothing is given up.
   WHAT IS CUT IS PLANNING, NOT VERIFICATION: triage, the architect, and the synthesis agent. For a
   tiny task the plan is already in the brief, which is why tiny REFUSES a brief that lacks an
   explicit work list (see TINY_REFUSAL) rather than degrading into a slow run.
   WHAT SURVIVES IS EVERY GATE THAT CAUGHT A REAL BUG THIS SESSION: the adversarial reader (caught a
   rarity remap painting basic items gold), LAW19 reachability (caught a dead function that a "fix"
   had been applied inside), the measured render proof (caught an item that was never shipped at
   all), the workspace lock, and the four-stamp/push discipline. TINYQ is inside MAXQ precisely so
   the skeptic FLOOR and the gates apply unchanged — tiny buys fewer HOPS, never fewer gates. */
const TINYQ   = QUALITY === 'tiny'
const MAXQ    = QUALITY === 'max' || QUALITY === 'lean' || TINYQ  // every max-only GATE applies to lean and tiny too
const LEANQ   = QUALITY === 'lean'
/* v22 — ONE NAME FOR "max and nothing else". `MAXQ` means max-OR-lean-OR-tiny (every gate), so
   every site meaning MAX ONLY had to spell out `MAXONLY` — and adding tiny silently made
   all 8 of those sites wrong at once, because tiny is inside MAXQ and is not LEANQ. That is the
   v20 defect exactly: a concept with no name, re-derived at each call site, drifting the moment a
   quality is added. Named once here; adding a fifth quality now touches ONE line. */
const MAXONLY = MAXQ && !LEANQ && !TINYQ
const TASK_RAW  = typeof A === 'string' ? A : (A && A.task) || ''
const TASK      = String(TASK_RAW).replace(/\s*--(reversible|irreversible|costly)\b/gi, '').trim()
const APPLY     = !!(A && A.apply)                 // false = dry-run (propose diffs, write nothing). true = agents edit files.
// Quality-dependent DEFAULTS preserve each original script's default exactly; an explicit caller arg
// always wins over both.
/* v19 — LEAN BUYS ONE ATTEMPT, NOT TWO. Rework is the single biggest multiplier on wall-clock:
   every item can be built, gated, and built again. At lean the first failure is REPORTED instead of
   retried, which is honest (failed items already force an INCOMPLETE verdict) and halves the worst
   case. Max keeps its second attempt. */
// v22 — tiny keeps ONE rework round. Rework is per-item inside the build pipeline, not a global
// barrier, so a single retry costs one item's hop and not the run's — and a tiny task that fails its
// gate with no retry would spend the whole 15 minutes to report nothing.
const MAXROUNDS = (A && A.maxRounds) || (TINYQ ? 1 : LEANQ ? 1 : MAXQ ? 2 : 3)
const DRYROUNDS = (A && A.dryRounds) || 1          // consumed only by the max-only completeness loop
const FLOOR     = (A && A.budgetFloor) || (MAXQ ? 120_000 : 60_000)  // stop opening new rounds under this many tokens remaining
/* ══ v26 · THE RENDER GATE BECOMES A LOOP ═══════════════════════════════════════════════════════
   Konyo, 2026-08-06, after the Blender-MCP post Musk reposted: "lets fix the workflow to loop like
   blender at the end before the ship gate."
   That post's thesis is one line — the success condition moves from "the command executed" to "the
   result looks like what was described" — and the mechanism is a LOOP: build, render, look, correct,
   render again. We already had the looking (v15 images[], v18 Grok's second pair of eyes). What we
   had was a VERDICT, not a loop: one render, and any failure became a ship blocker for a human to
   fix later. So a defect the gate could plainly see still cost a whole round trip.
   Now the gate renders, and if it fails, a fixer agent gets the failures AND the screenshots and
   corrects them, and it renders AGAIN — up to RENDERLOOP passes. What does NOT change: the final
   pass is still the one the blocker wiring reads, so a loop that ends dirty still blocks. The loop
   buys attempts, never a pass.
   RENDERLOOP is the number of RENDERS, so fixes = RENDERLOOP-1. Tiny gets 2 (one correction) because
   tiny is a wall-clock budget and each pass is a full agent round-trip; max gets 4. */
const RENDERLOOP = (A && A.renderLoop) || (TINYQ ? 2 : MAXQ ? 4 : 3)
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
/* ══ v30 · METER ROUTING (port of Grok shipper, 2026-08-07) ═════════════════════════════════════
   Measured: quality:max + a "ship 30 versions / whole-console arc" brief → 2h+, agent ceiling,
   render CEILING, PARTIAL ship, and concurrent fleets thrashing VERSION. Max is the expensive path
   for a SMALL high-stakes list — not a volume throttle. Item caps by quality keep the fleet honest:
   tiny 4 (already refused above), max 6, lean 8, standard 10. Caller may raise with {maxItems:N}
   up to 24. Volume-arc heuristic is non-blocking but LOUD. Thrash/tip craft rides on FAT_LAW. */
let MAX_ITEMS_CAP = 8
if (TINYQ) MAX_ITEMS_CAP = 4
else if (LEANQ) MAX_ITEMS_CAP = 8
else if (QUALITY === 'standard') MAX_ITEMS_CAP = 10
else if (MAXONLY) MAX_ITEMS_CAP = 6
if (A && typeof A.maxItems === 'number') MAX_ITEMS_CAP = A.maxItems
if (A && typeof A.max_items === 'number') MAX_ITEMS_CAP = A.max_items
MAX_ITEMS_CAP = Math.max(1, Math.min(24, MAX_ITEMS_CAP | 0))
const _taskLc = String(TASK || '').toLowerCase()
const LOOKS_LIKE_VOLUME_ARC = (
  /\b30 version/.test(_taskLc) || /\b30 real/.test(_taskLc) || /\b100 version/.test(_taskLc) ||
  _taskLc.includes('whole-console versions') || _taskLc.includes('whole console versions') ||
  _taskLc.includes('arc d of') || _taskLc.includes('ship them all') || _taskLc.includes('finish them all') ||
  /\b(ship|do|finish)\s+(the\s+)?(whole|entire)\s+(arc|console|product)\b/.test(_taskLc) ||
  /\b\d{2,}\s+(versions?|stamps?)\b/.test(_taskLc)
)
/* v18.3 — THE FIXED COSTS OF FINISHING, IN ONE PLACE. Every run pays for its closing gates and its
   report whatever the plan looks like, so both the plan trim and the feasibility line must subtract
   the SAME numbers. They used to keep separate copies (2 vs 5+2), which is how a plan got waved
   through the trim and then declared infeasible twelve lines later. */
const GATE_COST    = 5    // completeness critic + render gate + fat version bar + reachability + merge
const RESERVE_COST = 2    // synthesis + one spare, mirroring spawn()'s reserve
/* v40 §D1b — OPT-IN: refuse a partial sweep rather than silently choosing which items die.
   Default false, so nothing about an existing call changes. See the §D1b block at the plan. */
const STRICT_SCOPE = !!(A && A.strictScope)
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
/* v39 — LOG EACH PROVEN PASS. Opt-in finish/revival loop. Not the door, not a ship.
   After an item PASSES its gate, commit+push THAT FILE ONLY via automation/log-pass.sh.
   Default off. Requires apply:true. Builders still never push; the orchestrator logs. */
const LOG_PASS = !!(A && (A.logPass || A.log_pass))

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

/* ══ v31 — CAPTURE PER ROUND, CARVE PER ARC ══════════════════════════════════════════════════════
   Konyo: "capture per round, carve per arc ... this could really start locking down everything".

   WHAT WAS ALREADY HERE, AND WHAT WAS NOT. A failed gate's reasons ARE handed back to the same
   item's next attempt (see the rework builder below) — so an item learns from its own failure. But
   that string is joined, used once and dropped, which leaves three holes:
     1. ITEM A's failure never reaches ITEM B. In practice sibling items fail the SAME way, because
        they share a brief and a codebase. Measured 2026-08-10: the chronicle-template run scored
        its detector FP=30/31 and the round-2 rebuild had to REDISCOVER, from scratch, that the
        CONTROL SET was mislabelled and the detector had been right. Two rounds paid for one lesson.
     2. Nothing survives the ROUND in a structured form — only a sentence, only for one file.
     3. Nothing survives the RUN at all, so an arc's lessons cannot be carved afterwards.

   THE SPLIT, AND WHY IT IS A SPLIT. CAPTURE is cheap, per-round and automatic. CARVING is not:
   carving PRUNES shared files that agents load, so doing it mid-run rewrites the rules underneath
   running agents, and carving from one round is carving from a sample of one — which is how you get
   a rule that is over-fitted to a single bad afternoon. The carving skill's own floor is THREE scars
   in one territory, precisely because two is a coincidence. So this layer PROPOSES and never writes.

   ⚠ THE SAFETY LAW, and it is the one that matters: A SCAR NARROWS ATTENTION, IT NEVER SUPPRESSES A
   GATE. Nothing here may skip a check, lower a bar, or mark a thing already-judged. It only tells
   the next agent what has already been tried and failed, so it does not spend a round re-deriving
   it. A scar that could silence a gate would be a cache of a verdict, and this repo has already
   been bitten by a cached verdict (a resumed run replaying a stale refusal in 3ms). ══════════════ */
const SCARS = []
function recordScar(o) {
  // Evidence travels WITH the rule or the rule is an opinion. A scar with no reason is not recorded.
  if (!o || !o.reason) return
  SCARS.push({ round: o.round || 1, file: o.file || '', stage: o.stage || 'gate',
               severity: o.severity || '', reason: String(o.reason).slice(0, 600) })
}
/* The territory key. Deliberately CRUDE — lowercased significant words, stopwords dropped. A
   cleverer clusterer would silently merge distinct failures, and a false cluster is worse than no
   cluster because it manufactures the third scar that authorises a carve. */
function scarTerritory(reason) {
  const stop = new Set(['the','a','an','and','or','but','is','was','it','its','this','that','of','to',
                        'in','on','for','with','not','no','be','been','has','have','had','at','as',
                        'by','from','so','if','then','than','which','what','when','they','their'])
  return String(reason || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 3 && !stop.has(w)).slice(0, 6).sort().join('-')
}
/* CARVE CANDIDATES — proposed at ARC END, never applied. Three is the floor, from the carving
   skill: two scars that look related are usually one scar written twice. */
function carveCandidates(minN = 3) {
  const by = new Map()
  for (const s of SCARS) {
    const k = scarTerritory(s.reason)
    if (!k) continue
    if (!by.has(k)) by.set(k, [])
    by.get(k).push(s)
  }
  return [...by.entries()].filter(([, v]) => v.length >= minN)
    .map(([k, v]) => ({ territory: k, n: v.length,
                        files: [...new Set(v.map(s => s.file).filter(Boolean))],
                        evidence: v.map(s => s.reason).slice(0, 5) }))
    .sort((a, b) => b.n - a.n)
}
/* What the NEXT round is told. Capped hard: a prompt that grows with every failure eventually
   crowds out the instruction it is attached to, and an agent that reads ten stale scars pays
   attention to none of them. Newest first, because the most recent round is the most relevant. */
function scarBriefFor(file, cap = 6) {
  const others = SCARS.filter(s => s.file !== file).slice(-cap).reverse()
  if (!others.length) return ''
  return '\n\nWHAT HAS ALREADY FAILED IN THIS RUN, ON OTHER FILES — do not spend a round ' +
    're-deriving any of it, and check whether the same mistake is in YOUR file:\n' +
    others.map(s => `  · [round ${s.round} · ${s.file}] ${s.reason}`).join('\n') +
    '\nThese are EVIDENCE, not verdicts about your work: they narrow where to look. They never ' +
    'excuse you from any gate, and none of them means a check can be skipped.'
}

/* v32 §1.3 — A BAIL USED TO LEAK THE TREE FOR THE FULL TTL. There are 13 `return bail(...)` exits
   and only 4 `await releaseLock()` sites, so most refusals walked away still holding the workspace
   lock — for 180 minutes. Several of those exits are ORDINARY outcomes, not disasters: "CEILING: no
   budget for the plan", "triage says direct", a tiny brief missing an instruction. A typo that did
   ZERO work could lock the tree for three hours, and the next run would refuse against a holder
   that had already gone home. (Measured first-hand 2026-08-10: a run refused on a lock whose holder
   was finished, and clearing it by hand then let two runs share one tree.)
   Fixing it at the 13 call sites would be 13 chances to forget the 14th; it belongs HERE, once.
   ⚠ THE try/catch IS LOAD-BEARING, NOT CLUTTER: `lock` is declared `let` at ~line 1218, and bail()
   can fire BEFORE that line executes (e.g. the `!TASK` exit). Touching `lock` in its temporal dead
   zone throws a ReferenceError — and on those early exits there is provably no lock to release, so
   swallowing exactly that is correct rather than lazy. */
async function bail(o) {
  try { await releaseLock() } catch (e) { /* no lock existed yet — see the TDZ note above */ }
  return emit(Object.assign({
    quality: QUALITY,
    blockers: BLOCKERS,
    agent_errors: SPAWN_ERRORS,
    ceiling: { cap: MAX_AGENTS, spent: SPENT, hit: CEILING_HIT },
    scars: SCARS,
    carve_candidates: carveCandidates(),
    verdict: 'ABORTED — the run exited before completing; see error/refused',
    shippable: false,
  }, o))
}

/* v39 — one routine. The script refuses a dirty index and denylisted books.
   Orchestrator runs it; builders still never push. */
function logPassScript() {
  const home = (typeof process !== 'undefined' && process.env && process.env.HOME) || ''
  const cands = [
    home + '/.konyo-workflow/log-pass.sh',
    home + '/.claude/workflows/log-pass.sh',
    home + '/.grok/workflows/log-pass.sh',
    '/Users/konyo/konyo-workflow/automation/log-pass.sh',
  ]
  for (const p of cands) {
    try {
      const fs = (typeof process !== 'undefined' && typeof require === 'function') ? require('fs') : null
      if (fs && fs.existsSync(p)) return p
    } catch { /* host has no fs */ }
  }
  return cands[0]
}

function runLogPass(file, message) {
  const rec = { file, ok: false, sha: '', reason: '' }
  if (!file) { rec.reason = 'no file'; return rec }
  const script = logPassScript()
  try {
    const { spawnSync } = require('child_process')
    const r = spawnSync('bash', [script, '--message', message, '--', file], {
      encoding: 'utf8', timeout: 120000,
    })
    rec.reason = ((r.stdout || '') + (r.stderr || '')).slice(0, 500)
    rec.ok = r.status === 0
    const m = rec.reason.match(/\bpushed ([0-9a-f]{7,})\b/)
    if (m) rec.sha = m[1]
  } catch (e) {
    rec.reason = 'exec unavailable: ' + String((e && e.message) || e).slice(0, 200)
  }
  log(rec.ok
    ? `logPass: ${file} → ${rec.sha || 'ok'}`
    : `logPass REFUSED ${file}: ${rec.reason}`)
  return rec
}

if (!TASK) { log('No task given. Pass a task string or {task:"..."} as args.'); return bail({ error: 'no task' }) }

// v5 (Konyo: "so it doesnt get stuck hours by default too") — THE PACE CLAUSE.
// v4 bounded how MANY agents run; nothing bounded how long each one takes, and that is where the
// hours actually went: an Opus agent told to be exhaustive on a 38k-line file will happily spend
// forty tool calls on it. Agents honour an explicit budget when given one, so every prompt carries
// the same sentence — attached inside spawn(), so no call site can forget it.
/* v18.4 — PACE NOW EXPLAINS ITS OWN MECHANIC, because "work briskly" reads as a style note and the
   real reason is arithmetic. Measured on this machine 2026-08-04: one session showed 843K output
   tokens against 117.6M CONTEXT READS. Nobody wrote 117M tokens — that is the same context re-read
   on every tool round-trip, and it grows monotonically, so a file you read early is paid for again
   on every call you make afterwards. That is why a whole-file read is expensive in a way its own
   size does not show, and why a script that prints a verdict beats a file that prints its contents. */
const PACE = '\n\nWORK BRISKLY — this run is budgeted, and the budget works in a way worth knowing: '
  + 'EVERY tool call re-reads your whole context, so anything you pull in early you pay for again on '
  + 'every call after it. A 2,000-line file read once is not read once. So: prefer targeted grep/sed '
  + 'over reading whole files, and prefer running a small script that PRINTS A VERDICT over reading '
  + 'the material and judging it yourself. IN A FILE OVER ~5,000 LINES, do not hunt with grep/sed '
  + 'for WHERE something is defined — run `node /Users/konyo/konyo-workflow/automation/claude-code/'
  + 'anchor_index.mjs <file> --find <name>`, which indexes DEFINITIONS (css id/class, html id, '
  + 'function, const, window.x) and answers in one call what a grep hunt costs five. A measured '
  + 'run spent 18 of its 51 tool calls re-deriving a map that never changes. '
  + 'NEVER spend a call on `cd` alone — the shell resets '
  + 'between calls, so use absolute paths or chain with && in ONE call; a measured run burned six '
  + 'full round-trips on bare `cd`. Chain cheap probes together rather than paying a round-trip each. '
  + 'Stop at the FIRST solid answer rather than the exhaustive '
  + 'one; aim for roughly 12-18 tool calls. A good answer now beats a perfect one in twenty minutes. '
  + 'If you genuinely cannot settle a point inside that budget, SAY SO in your result instead of '
  + 'spending more — an honest "not established" is worth more than a slow guess. '
  + 'NONE OF THIS APPLIES TO EVIDENCE: never skip opening an image, running the test, or fetching the '
  + 'real remote state to save a call. Cheap is not a reason to verify a proxy.'

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
   the MCP transport was returning "Incorrect API key". ROOT-CAUSED 2026-08-05 and FIXED: the key was
   never dead — Grok-MCP/src/utils.py loaded `example.env` (a git-TRACKED template holding a 7-char
   placeholder) instead of `.env` (the real 84-char key), and a stale key in the ~/.claude.json
   registration `env` block shadowed it on top. Both fixed; the key verifies HTTP 200. The MCP is
   therefore usable again — but this script still prefers the CLI below, because the CLI needs no
   MCP connection at all and so survives headless and cron runs where MCP servers may be absent. Nothing read the "unavailable"
   string, so a third eye that never spoke read as a clean pass. That is the v16 defect class
   (a null that reads as success) living inside the safeguard machinery itself.
   THE TRANSPORT THAT WORKS: the Grok CLI at ~/.grok/bin/grok authenticates on its own
   session, independent of that key. Measured working the same day, twice: a plain prompt, and an
   agentic read of a repo (`--cwd`) that ran `git log` and answered correctly. It is ALSO multimodal
   — asked what art/mephisto_graphic.png depicts, with no hint of what it should be, it answered
   "a polished, deep-blue teardrop gemstone", independently confirming the mislabelled boss art.
   That is why seat 4 exists.
   ⚠⚠ BOUND EVERY GROK CALL YOURSELF — THE BASH TIMEOUT DOES NOT REACH IT. `timeout` is not
   installed on this Mac, so `timeout 120 grok ...` fails command-not-found and the seat reports
   unreachable for the wrong reason. But relying on the Bash tool's own timeout is WORSE, and it
   cost ten days of CPU: that timeout kills BASH, not bash's GRANDCHILDREN, so a hung `grok` is
   reparented to init and runs at 100% forever. Two were found alive at 3 days and 10 days,
   burning a core and a half continuously, long after the runs that spawned them had finished.
   USE THE PERL WRAPPER THIS REPO ALREADY SHIPS (see d2r_bible_tests/hooks/pre-push:71) — it forks,
   alarms, and SIGTERMs the child, so nothing can outlive the call:
     perl -e 'my $t=shift; my $p=fork; die unless defined $p; if(!$p){exec @ARGV; exit 127}
       $SIG{ALRM}=sub{kill "TERM",$p; waitpid($p,0); exit 142}; alarm $t; waitpid($p,0);
       my $st=$?; alarm 0; exit(($st & 127) ? 128+($st & 127) : ($st >> 8));' 180 \
       /Users/konyo/.grok/bin/grok --cwd ... --prompt-file ...
   Exit 142 means the seat TIMED OUT, which is a real verdict — report it as unreachable, never as
   agreement. Kill the grok PID you spawned; never `MAXMIN=0 reap -f` (that matches the live TUI).
   `reap` (~/.local/bin/reap) with no `-f` lists true orphans after a run ends oddly; `reap -f`
   kills only that list, and refuses a registered / TTY grok.
   THE RULE THAT MAKES IT WORTH HAVING: a Claude agent may NEVER fill a Grok seat. If the transport
   is down the seat is reported EMPTY — panel 3 becomes 2, named in the payload — because a panel
   that looks diverse while being an echo is worse than a panel that is honestly short.
   ⚠ v36 §C3 — DO NOT PIN A VERSION NUMBER IN PROSE HERE AGAIN. This paragraph carried an 0.2.x pin
   (exact digits in git history — not repeated here, so that a guard grepping for the stale literal
   cannot be tripped by the comment that records killing it) long enough that the binary moved two
   major versions underneath it: measured 2026-08-13, `grok --version`
   prints `grok 1.0.3 (1a29d5bc12d4)` and ~/.grok/bin/grok is a symlink to grok-1.0.3-macos-aarch64.
   `--best-of-n` is gone from that build. A pinned number in a comment is a fact with no owner and no
   guard — nothing re-measures it, so it rots silently and then briefs an agent with a lie. Ask the
   binary: `grok --version`. (Separately: the CLI VERSION is 1.0.3 and the default MODEL self-reports
   as Grok 4.6 — two different numbers, and confusing them is how "1.0.3" got called wrong.)
   Verified present in 1.0.3 and used below: --cwd, --prompt-file, --no-memory, --disable-web-search,
   --output-format plain. 1.0.3 also adds --json-schema, which constrains the model to a JSON shape;
   not used here because the COURIER already returns the schema and the seat wants Grok's raw prose. */
const GROK_CLI = '/Users/konyo/.grok/bin/grok'
// v36 §C4 — the MCP fallback's tool namespace. Any mcp__grok-mcp__* tool (chat, chat_with_vision,
// chat_with_files) is a legitimate Grok transport; the prefix is what identifies it as one.
const GROK_MCP_PREFIX = 'mcp__grok-mcp__'
/* v36 §C3 — THE WRAPPER IS THE INVOCATION, NOT AN OPTIONAL EXTRA. The block comment above spends
   six lines explaining that the Bash tool's timeout kills bash and NOT bash's grandchildren, that
   two hung `grok` processes were found alive at 3 and 10 days burning a core and a half, and that
   `timeout` is not installed on this Mac — and then the courier prompt told the agent to run a BARE
   `grok`. The documentation and the instruction disagreed, and the instruction is the one that runs.
   So the wrapper now lives in a constant that the prompt interpolates: there is no way to write the
   command without it. Exit 142 = the alarm fired = TIMED OUT, which is a real verdict (unreachable),
   never agreement. Measured 2026-08-13: `perl … 60 grok --version` exits 0 and prints 1.0.3. */
/* ── v40 §D2 — THE SEAT DID NOT FAIL. WE HUNG UP ON IT. ─────────────────────────────
   MEASURED on run wf_7ad48f08-5dc (2026-08-21), from its journal.jsonl, 5 third-eye seats:
     4 of 5 returned reached:false / verdict:'unreachable', EVERY ONE of them with the reason
     "grok timed out after 180s (perl alarm, exit 142)" — and every one of them carrying partial
     output proving grok was ALIVE AND MID-REVIEW when our own alarm killed it: "reading
     tv/conftest.py, diffing working tree vs HEAD, hunting for callers", "independently scanning
     source", "had reached 'measure the skip paths'". The ONE seat that beat the clock is the seat
     that caught a real defect Konyo had shipped hours earlier.
   The handoff that commissioned this fix offered two candidate causes — "grok is unreachable" and
   "the ceiling was exhausted before the seat could spawn" — and said, correctly, do not fix the
   symptom until it is measured. Measured, it is NEITHER. It is a third fact the engine had no way
   to express, because 180 was ONE FLAT NUMBER for every seat regardless of how much reading that
   seat was told to do. The skeptic seat is told "you may read the files in this directory ... do
   not take the summary's word for what the code does". That is a research task on a 62k-line tree,
   and it was being handed the same clock as a paste-only question.
   THERE ARE THREE FACTS HERE, NOT TWO, AND THEY POINT OPPOSITE WAYS: "we could not afford to ask",
   "we asked and nothing answered", and "we asked, it was working, and we cut it off". Only the
   third is fixed by waiting longer; only the second is a reason to go and look at an API key. They
   were all being written down as the same word.
   WHY RAISING THE BUDGET IS CHEAP: the alarm only ever fires on a seat that would otherwise return
   NOTHING. A seat that answers in 40s is completely unaffected — this is a ceiling, not a wait.
   The cost is wall-clock on exactly the seats whose current yield is zero, and that run spent
   4.37M tokens and lost its entire independent review to a 180-second clock.
   ⚠ THE BASH BACKSTOP MOVES WITH IT. The courier prompt below told the agent to set the Bash
   tool's own timeout to a HARDCODED 180000ms "as a backstop". A backstop shorter than the thing it
   backs is a second, tighter clock: raising the perl alarm alone would have changed nothing,
   because bash would still have been killed at 180s. Both now derive from ONE number. */
const GROK_TIMEOUT_S = (A && A.grokTimeoutSeconds) || 420
const perlAlarm = (secs) => `perl -e 'my $t=shift; my $p=fork; die unless defined $p; if(!$p){exec @ARGV; exit 127} ` +
  `$SIG{ALRM}=sub{kill "TERM",$p; waitpid($p,0); exit 142}; alarm $t; waitpid($p,0); ` +
  `my $st=$?; alarm 0; exit(($st & 127) ? 128+($st & 127) : ($st >> 8));' ${secs}`
// Kept under its old name AND derived from the same function: it is quoted in prompts, in SCARS.md
// and in the courier instructions, and two spellings of one command is how a safeguard drifts.
const PERL_ALARM = perlAlarm(GROK_TIMEOUT_S)
/* v40 §D2b — WHY A SEAT WAS SILENT IS A DIFFERENT FACT FROM THAT IT WAS SILENT, and until now
   only the second one reached the payload. `silent_seats` carried a 200-char prose `reason`, which
   a human can read and no caller can branch on. These kinds are that same fact, typed. */
const SILENCE_KINDS = {
  never_asked_ceiling: 'the agent ceiling refused the seat — it was NEVER contacted, so this says nothing at all about whether the third eye is reachable. Re-run with a higher {maxAgents}.',
  timed_out_mid_work:  'the transport was reached and was STILL WORKING when our own alarm killed it. This is NOT a dead API and NOT agreement — it is our clock being shorter than the question. Buy it more time with {grokTimeoutSeconds:N}.',
  no_evidence:         'it answered, but could not evidence the transport it claimed, so it is recorded as no review (an unprovable independent review is not one).',
  transport_down:      'it was contacted and nothing answered. THIS is the one that means go and look at the transport.',
  standin:             'a Claude stand-in was requested — same model family, so it is never counted as independent whatever it reports.',
  not_asked_off:       'thirdEye:false — the caller turned the third eye off. Nothing was attempted.',
}
/* ⚠ THE ORDER AND THE NARROWNESS ARE BOTH LOAD-BEARING. Both were wrong in the first cut and both
   were caught by the third eye (Grok) reviewing this very change — the cross-family seat earning
   its seat on the diff that widened its budget.
   1. `no_evidence` MUST SIT ABOVE THE TIMEOUT TEST. The evidence downgrade above PREPENDS its
      sentence to whatever the courier originally said, so a seat demoted for unprovable provenance
      still carries the courier's original tail — and if that tail mentioned a timeout, the seat was
      filed as "we cut it off" when what actually happened is "it answered and could not prove who
      answered". Those license opposite responses: one says buy more time, the other says distrust
      the courier. The MORE SPECIFIC determination — we downgraded it ourselves, on purpose — wins.
   2. THE TIMEOUT TEST NOW REQUIRES **OUR OWN ALARM'S** SIGNATURE. It used to accept a bare
      `timeout`, which a genuine transport error says all the time: "connection timeout to
      api.x.ai" is a DEAD API and was being reported as a live model we hung up on — the precise
      conflation this whole classifier exists to end, reintroduced by the loosest token in its own
      regex. Only exit 142, the perl alarm, or our own "timed out after Ns" sentence count now.
      Anything else falls through to transport_down, which is the CONSERVATIVE answer: it sends a
      reader to look at the transport, and being wrongly told to look is cheaper than being wrongly
      told the transport is fine and just needs more seconds. */
function classifySilence(rec) {
  if (!rec) return 'transport_down'
  if (rec.ran === false) return 'not_asked_off'
  const why = String(rec.reason || '')
  // The ceiling refusal writes its own sentence, and it must never be read as a timeout.
  if (/ceiling refused this seat/i.test(why)) return 'never_asked_ceiling'
  if (rec.transport === 'claude-standin') return 'standin'
  if (/produced no command|does not name|not evidence of independence|unverifiable/i.test(why)) return 'no_evidence'
  if (/exit 142|perl alarm|timed out after \d+\s*s/i.test(why)) return 'timed_out_mid_work'
  return 'transport_down'
}
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
    /* v19.3 — PROVE THE TRANSPORT RAN. Konyo, looking at a Sonnet courier on the pre-ship seat:
       "sonnet is the right model here at the end?" Right for the ROLE — this agent relays, it does
       not judge — but the question exposed a hole the model choice cannot fix: NOTHING verified that
       the reply came from Grok. A courier whose CLI call failed could return reached:true with its
       own opinion, and the payload would report an independent different-family review that never
       happened. The prompt forbids it in capitals; an instruction is not a guarantee, and the whole
       value of this phase is that the words are NOT Claude's. So the seat must now carry evidence:
       the command it ran and the raw head of stdout. Checked below — reached:true without evidence
       is downgraded to NOT reached, because an unverifiable claim of independence is worth less than
       an honest empty seat. */
    // v36.1 — "COMPLETE" is stated because raw_head below teaches a ~200-char clip, and the perl
    // wrapper puts the grok binary at ~index 251. A clipped command loses the only part that
    // identifies the transport, and the seat is then discarded as unproven.
    command:   { type: 'string', description: 'REQUIRED when reached=true: the exact command line you ran, COMPLETE and UNTRUNCATED (do NOT clip it — the part that names the grok binary may sit past character 200, after the perl wrapper)' },
    raw_head:  { type: 'string', description: 'REQUIRED when reached=true: the first ~200 characters of the transport RAW stdout, verbatim, before any tidying' },
  },
}
// How every seat talks to Grok. Written once so four seats cannot drift apart.
function grokHow(question, opts = {}) {
  const cwd = opts.cwd || '.'
  // v40 §D2 — the seat's own budget. ONE number drives the perl alarm, the Bash backstop and the
  // sentence that tells the courier what exit 142 means, so they cannot disagree again.
  const tmo = Math.max(30, opts.timeoutS || GROK_TIMEOUT_S)
  return (
    `TRANSPORT — do this literally, in this order, and report which one answered.\n` +
    `1. CLI FIRST (this is the working path). Write the question below to a temp file with the Write ` +
    `tool (e.g. /tmp/te_$$.txt), then run this with the Bash tool — COPY IT WHOLE, the perl prefix is ` +
    `part of the command, not decoration:\n` +
    `   ${perlAlarm(tmo)} \\\n` +
    `     ${GROK_CLI} --cwd ${cwd} --prompt-file <file> --no-memory --disable-web-search --output-format plain\n` +
    `   Why the perl: the Bash tool's timeout kills BASH, not bash's GRANDCHILDREN, so a hung grok is ` +
    `reparented to init and burns a core forever — two were found alive at 3 and 10 days. The perl ` +
    `forks, alarms and SIGTERMs the child, so nothing can outlive the call. Do NOT use the \`timeout\` ` +
    `binary: it is not installed on this Mac and the command would die with command-not-found.\n` +
    `   Also set the Bash tool's OWN timeout parameter to ${(tmo + 30) * 1000} as a backstop — belt and ` +
    `braces, not a replacement for the wrapper. ⚠ It is DERIVED from the alarm above (+30s) on purpose: ` +
    `this line used to say a hardcoded 180000, so a longer alarm would have been strangled by a shorter ` +
    `backstop and the fix would have changed nothing.\n` +
    `   EXIT 142 MEANS THE ALARM FIRED — grok TIMED OUT. That is a real verdict: report it as ` +
    `reached:false / verdict:'unreachable' with reason 'grok timed out after ${tmo}s ` +
    `(perl alarm, exit 142)'. It is NEVER agreement and never "no concerns".\n` +
    `2. Only if the CLI errors or returns empty, try the MCP fallback: ToolSearch for ` +
    `mcp__grok-mcp__chat and call it. If it fails, put the ACTUAL error text you received in ` +
    `\`reason\` — verbatim. Do NOT assume the key is dead: that key was measured WORKING on ` +
    `2026-08-13 (a live models listing and a real completion), and an older version of this very ` +
    `prompt told couriers to expect "Incorrect API key provided" for months after the root cause ` +
    `had been found and fixed. If it fails now, that is NEWS and the error string is the evidence — ` +
    `report it, do not explain it away.\n` +
    `3. If neither answered, return reached:false, transport:'none', verdict:'unreachable', and put ` +
    `the ACTUAL error text in reason. \n` +
    `\n🚫 YOU ARE A COURIER, NOT THE THIRD EYE. Never answer the question yourself, never paraphrase ` +
    `what you think Grok would say, and never let your own opinion reach the concerns[] array. An ` +
    `empty seat honestly reported is the correct outcome when the transport is down; a Claude opinion ` +
    `wearing a Grok label is the one outcome that destroys the entire point of this phase.\n` +
    `\n──── QUESTION TO SEND ────\n${question}\n──── END QUESTION ────\n` +
    `\nReturn Grok's answer: concerns[] verbatim from its reply (or [] if it raised none).\n` +
    `EVIDENCE IS MANDATORY when you claim reached=true: put the EXACT command you ran in \`command\`, `+
    `and the first ~200 characters of its RAW stdout, verbatim and untidied, in \`raw_head\`. A seat `+
    `that claims it reached another model without showing what it ran is RECORDED AS NOT REACHED, `+
    `because the only thing this phase sells is that the words are not yours.`
  )
}
// One consult. Records itself in the ledger no matter how it ends.
async function thirdEyeAsk(seat, question, phaseName, opts = {}) {
  if (THIRD_EYE === 'off') {
    THIRD_EYE_SEATS.push({ seat, ran: false, reached: false, transport: 'none',
      silence_kind: 'not_asked_off',
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
  /* v19.4 — "THE RUN COULD NOT AFFORD TO ASK" IS NOT "THE TRANSPORT IS DOWN".
     Measured on the 2026-08-04 D2R run: the pre-ship seat returned
     {reached:false, transport:'none', verdict:'unreachable', reason:''} — an EMPTY reason, on a
     schema whose whole point is "the ACTUAL error text, not a guess". Nothing had failed to reach
     Grok. The ceiling was spent (24/24), so spawn() REFUSED the seat and returned null WITHOUT
     throwing, so the .catch above never fired and there was no error to report. A reader sees an
     unreachable third eye and goes hunting a dead API key; the true answer was that the run ran out
     of agents before it got to the question. Same shape as the v14 skeptic bug — a null from a
     ceiling refusal read as a verdict — so it gets the same treatment: name the refusal. */
  if (!r) {
    return (function () {
      const rec = { seat, ran: true, reached: false, transport: 'none', verdict: 'unreachable',
        concerns: [], severity: 'none',
        reason: 'the agent ceiling refused this seat — the run could not afford to ask. This is NOT ' +
                'a transport failure: the third eye was never contacted, so nothing here says whether ' +
                'it is reachable. Re-run with a higher {maxAgents} to buy the seat.' }
      rec.silence_kind = 'never_asked_ceiling'
      THIRD_EYE_SEATS.push(rec)
      log(`👁 THIRD EYE [${seat}] NEVER ASKED — the agent ceiling refused the seat (not a transport failure).`)
      return rec
    })()
  }
  const rec = { seat, ran: true, reached: !!(r && r.reached), transport: (r && r.transport) || 'none',
    verdict: (r && r.verdict) || 'unreachable', concerns: (r && r.concerns) || [],
    severity: (r && r.severity) || 'none', reason: (r && r.reason) || '',
    command: (r && r.command) || '', raw_head: (r && r.raw_head) || '' }
  /* v19.3 — AN UNPROVEN INDEPENDENT REVIEW IS NOT AN INDEPENDENT REVIEW. If the seat claims it
     reached a different model but cannot show the command it ran and the raw stdout it got back,
     it is recorded as NOT reached. That is deliberately harsher than "trust the courier": the only
     thing this phase sells is that the words came from outside Claude, so a claim of independence
     that cannot be evidenced is exactly the proxy PROOF exists to refuse. */
  /* v36 §C4 — "NON-EMPTY" IS NOT "PROVENANCE". The v19.3 check above required `command` and
     `raw_head` to be non-blank strings, and stopped there. A courier whose CLI call failed could
     satisfy it with `command:'echo hi'` and 200 characters of its own prose, and the payload would
     then report an independent different-family review that never happened — the precise outcome
     v19.3 was written to prevent, defeated by the weakest possible reading of its own rule.
     A string test can only ever ask "did you write something?"; the question worth asking is
     "does this command NAME THE TRANSPORT YOU CLAIMED?" So a cli seat must show the actual grok
     binary and an mcp seat must show an actual grok MCP tool. This is not cryptographic — a
     determined fabricator can still write the right path — but it closes the any-string hole, and
     the failure it catches is the LIKELY one: a courier that quietly substituted itself.
     ⚠ The tilde form is accepted on purpose. ~/.grok/bin/grok and /Users/konyo/.grok/bin/grok are
     the same binary, and downgrading a genuine Grok review because the courier typed a tilde would
     be the instrument lying about the measurement — the opposite of what this check is for. */
  /* ⚠ v36.1 — THE FIRST CUT OF THIS CHECK REJECTED REAL GROK REVIEWS. Found by the third eye on
     the very diff that introduced it, and every claim verified on this machine before acting:
       · it accepted exactly two spellings, GROK_CLI and the ~ form;
       · `~/.local/bin/grok` EXISTS here and symlinks to the same binary → would have been refused;
       · bare `grok` resolves on PATH (`which grok` → the same binary) → refused;
       · `/Users/konyo/.grok/downloads/grok-1.0.3-macos-aarch64` is what GROK_CLI actually points
         at — and the C3 comment above NAMES that path — → refused;
       · worst, §C3's own perl wrapper is 243 characters, so the grok path now starts at index ~251
         of the command, while the sibling `raw_head` field teaches the courier to clip at ~200.
         A courier clipping `command` the same way keeps the perl and loses the binary.
     So C3 made C4 reject genuine work, and the two changes shipped in the same pass. The failure
     mode is the one this check exists to prevent, pointed the other way: a real independent review
     discarded, which — because §C1 aborts only when a seat is `reached` — ALSO silently disarms the
     plan seat's veto. A false negative here is not conservative, it is a disabled safeguard.
     The rule now: does the command NAME grok as the program being run? That still refuses
     `echo hi` (the actual hole) without adjudicating which of five legitimate spellings was used. */
  const _cmd = String(rec.command || '')
  // grok as a command token: a path ending in /grok, a bare `grok`, or the versioned binary name.
  const _namesGrokBinary = /(?:^|[\s"'=|/])grok(?:-[\w.-]+)?(?:\s|$|["'])/.test(_cmd) ||
                           _cmd.includes(GROK_CLI) || _cmd.includes('~/.grok/bin/grok')
  const _namesTransport =
    rec.transport === 'cli' ? _namesGrokBinary
    : rec.transport === 'mcp' ? _cmd.includes(GROK_MCP_PREFIX)
    : false
  if (rec.reached && rec.transport !== 'claude-standin' &&
      !(_cmd.trim() && String(rec.raw_head).trim())) {
    rec.reached = false
    rec.reason = 'claimed ' + rec.transport + ' but produced no command/raw stdout as evidence — ' +
      'an unverifiable independent review is recorded as no review. ' + (rec.reason || '')
  } else if (rec.reached && rec.transport !== 'claude-standin' && !_namesTransport) {
    rec.reached = false
    rec.reason = 'claimed transport ' + rec.transport + ' but the command it showed (' +
      _cmd.slice(0, 120) + ') does not name ' +
      (rec.transport === 'mcp' ? 'a ' + GROK_MCP_PREFIX + '* tool' : GROK_CLI) +
      ' — evidence that does not identify the transport is not evidence of independence. ' +
      (rec.reason || '')
  }
  // A stand-in is never counted as the real thing, whatever it reports about itself.
  if (standin) { rec.reached = false; rec.transport = 'claude-standin' }
  /* v40 §D2b — CLASSIFIED HERE, BELOW EVERY DOWNGRADE, NOT AT THE POINT THE COURIER ANSWERED.
     The evidence checks above can turn a reached:true seat into a silent one; classifying earlier
     would file such a seat under whatever its original reason said, which is the "a fact computed
     before the decision that changes it" shape this file keeps paying for, mirrored. */
  if (!rec.reached) rec.silence_kind = classifySilence(rec)
  THIRD_EYE_SEATS.push(rec)
  log(rec.reached
    ? `👁 THIRD EYE [${seat}] via ${rec.transport}: ${rec.verdict}` +
      (rec.concerns.length ? ` — ${rec.concerns.slice(0, 2).join(' | ').slice(0, 220)}` : '')
    : `👁 THIRD EYE [${seat}] DID NOT SPEAK (${rec.transport}) [${rec.silence_kind}] — ` +
      `${String(rec.reason).slice(0, 180)}` +
      (rec.silence_kind === 'timed_out_mid_work'
        ? `\n   ⏱ THAT IS OUR CLOCK, NOT ITS SILENCE — it was still working at ${GROK_TIMEOUT_S}s. Re-run with {grokTimeoutSeconds:${GROK_TIMEOUT_S * 2}} to buy the answer.`
        : ''))
  return rec
}

const LADDER = ['haiku', 'sonnet', 'opus']               // the cost-scaling ladder
const bump = (tier) => LADDER[Math.min(LADDER.indexOf(tier) + 1, LADDER.length - 1)] || 'sonnet'
// THE MODEL-TIER KNOB, in ONE place. Standard keeps the cost-scaling ladder exactly as it was; max
// forces Opus everywhere, which is what konyo-workflow-max.js did by hardcoding 'opus' at every call
// site. Note bump('opus') === 'opus', so at max the escalation ladder is a harmless no-op and needs
// no branch of its own — the rework round still happens, it just cannot escalate further.
/* v19.1 — LEAN FLOORS AT SONNET. Konyo: "we want it smart.. like why not sonnet". He is right, and
   the harness had already shown the failure: a risk:'low' item built at HAIKU. Two reasons that is
   the wrong floor for this path specifically:
     1. COMPETENCE. Fast's builders edit the same real files max's do — a 40k-line control_ui.html is
        a 40k-line file whatever the item's blast radius. "Low risk" describes what breaks if the
        change is WRONG, not how hard the change is to MAKE.
     2. ONE ATTEMPT. Fast runs maxRounds:1, so a failed build is reported, not retried. On the cost
        ladder a haiku miss is cheap because Fable gates every merge and the ladder escalates on
        rework; here the same miss burns the item for the whole run.
   So lean reads the architect's tier as a CEILING, never below sonnet. Haiku stays available on the
   cost-scaled path, where the ladder and the retry exist to catch it. */
/* v22 — TINY BUILDS AT SONNET BY DEFAULT, AND THAT IS A TIME DECISION, NOT A COST ONE. A tiny item
   arrives with its file and its anchor already named, so the builder is not deciding WHAT to do —
   it is making a known edit. Opus is slower per turn and buys judgement this hop does not need.
   The caller can still force a tier per item (`tier:'opus'`) and an item the caller marks
   `risk:'high'` is built at Opus regardless, because "small" is about scope, never about stakes.
   The REVIEW is Opus at every quality — the reader that refutes the diff is where judgement pays. */
const tierFor = (t, risk) => TINYQ
  ? (risk === 'high' ? 'opus' : (!t || t === 'haiku' ? 'sonnet' : t))
  : LEANQ
  // fast: honour the architect's tier ONLY where it also called the blast radius low. No risk tag
  // means no permission — an untagged item is treated as risky, because "unknown" is not "low".
  ? (risk === 'low' ? (!t || t === 'haiku' ? 'sonnet' : t) : 'opus')
  : MAXQ ? 'opus' : (t || 'sonnet')
/* EFFORT LADDER — widened 2026-08-05. The old MAXONLY branch returned 'high', which is EXACTLY
   what `tier === 'opus'` returned one line later, so MAX paid Opus prices for lean's effort and
   the flag bought nothing at the top. The dial has FIVE positions (low/medium/high/xhigh/max),
   not four; this engine had never used the top two. MAX now takes xhigh — the long-horizon tier —
   while lean and tiny keep 'high', because tiny is a WALL-CLOCK budget and xhigh spends exactly
   the thing tiny is short of. */
const effortFor = (tier) => MAXONLY ? 'xhigh'
  : tier === 'opus' ? 'high' : tier === 'sonnet' ? 'medium' : 'low'
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
    /* v20.1 — THE KEY IS DERIVED FROM AN INVISIBLE INPUT. It is `pwd -P` of the agent's shell, which
       the caller may have changed for an unrelated reason and which nothing announces. The SAFE
       direction already misfired live (the shell sat in another repo, so the run tried to lock that
       repo, collided with its live holder and refused at preflight — correct fail-safe). The
       DANGEROUS direction is the mirror image: if the shell sits in a tree the run will NOT edit,
       the lock lands on the wrong tree and the real target is left completely unprotected. The path
       must therefore come BACK, verbatim, so a human can see which tree was locked. */
    cwd:           { type: 'string',  description: 'REQUIRED: the ABSOLUTE path that `pwd -P` printed, verbatim (not the slug) — the tree this lock covers. Return it whether you acquired the lock or not.' },
    token:         { type: 'string',  description: 'unique id written into our lock file; needed to release it' },
    purged_stale:  { type: 'number',  description: 'how many expired locks were cleaned up' },
    holder_token:  { type: 'string',  description: 'if not acquired: the token of the live lock' },
    holder_since:  { type: 'string',  description: 'if not acquired: when the holder took it' },
    holder_expires:{ type: 'string',  description: 'if not acquired: when the holder lock expires on its own' },
    holder_task:   { type: 'string',  description: 'if not acquired: the holder task snippet' },
    // v36 §C9 — the read-only liveness probe from step 5b. Advisory: it never clears a lock itself.
    holder_evidence:     { type: 'string', description: 'if not acquired: ONE line of measured evidence about whether the holder is still alive (lock age, processes holding the tree, newest mtime). Say which probe failed if one did.' },
    holder_lock_age_min: { type: 'number', description: 'if not acquired: age of the holder lock FILE in whole minutes' },
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
  `spawn more items.\n` +
  /* v30 — VERSION ARC / TIP / THRASH (Grok meter routing, measured 2026-08-07). */
  `VERSION ARC DISCIPLINE (v30): Do NOT plan one integer per micro-edit, and do NOT plan 10–30 ` +
  `empty/hollow stamps. Prefer fewer FAT packages. If the human asked for a multi-version arc, ` +
  `slice it: each RUN ships a small fat package; the NEXT run continues. quality:max is for a SMALL ` +
  `high-stakes list (items[] preferred, <=6 files), never for 'do the whole arc of 30'. Use lean/tiny ` +
  `for volume.\n` +
  `TIP HONESTY (v30): VERSION stamp, CHANGELOG tip, and HANDOFF tip trail must name the SAME integer. ` +
  `Never rewind VERSION. Never invent empty fleet stamp gaps. Prefer the project's version-bump tool ` +
  `(and --allow-skip only when deliberate). The project's suite runner is the gate when the tree has it.\n` +
  `THRASH RESISTANCE (v30): Never add import-time rewrites of production modules, exec splits of source, ` +
  `or helper scripts that write_text server/source as a "ship". Native commits only. Shared lock with ` +
  `Grok fleets must be respected — two fleets on one tree is double spend + silent overwrite.`
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
    /* ── v40 §D3 — THE SEAM, DECLARED BY THE AGENT THAT OPENS IT ────────────────────────────────
       MEASURED on run wf_7ad48f08-5dc: one agent wrote `redirect_module_path` / `redirect_path`
       into tv/conftest.py; a second agent's tests PRESCRIBED that helper; and neither of them
       CALLED it — the tests used mock.patch.object instead. LAW19 caught it honestly ("zero call
       sites anywhere in the repo") and the fleet had produced it in the first place, because a
       fan-out gives every builder its own file and no knowledge of what its siblings are building.
       Two halves, each built correctly, that never meet — [[the-unjoined-end]], manufactured by
       the topology rather than found by it.
       This does not add a coordination protocol (agents still cannot talk mid-run, and inventing a
       channel between them is how a fan-out becomes a distributed system). It makes the seam a
       DECLARED, CHECKABLE fact: the provider names what it exposed and who should call it, the
       consumer names what it expected to find. A provides with no matching consumes is the exact
       shape LAW19 later fails on — now visible before the gate, and handed TO the gate. */
    provides: { type: 'array', maxItems: 12, items: { type: 'string' },
      description: 'Symbols/fixtures/endpoints you CREATED that something OUTSIDE this file is meant to call. Name each as `symbol — who should call it`. [] if your change is self-contained. Do not list internal helpers only your own file uses.' },
    consumes: { type: 'array', maxItems: 12, items: { type: 'string' },
      description: 'Symbols/fixtures/endpoints your change CALLS that another item in this same run is creating. Name each as `symbol — which file provides it`. [] if none.' },
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
  `answer, because nothing catches it unless something compares them.\n` +
  `5. CHANGE ONLY WHAT THE BRIEF NAMES. Do NOT "improve" code that already works — no drive-by ` +
  `refactor, no rename, no reformat, no extra feature, no tidying an adjacent function while you ` +
  `are in there. If you believe something nearby is wrong, SAY SO in self_check and LEAVE IT. ` +
  `An unrequested improvement is indistinguishable from a regression to every reviewer ` +
  `downstream, and it is why a one-line fix arrives as a forty-line diff that nobody can gate.`

/* v40 §D3 — WHAT THE OTHER BUILDERS ARE DOING, WHICH UNTIL NOW NO BUILDER WAS TOLD.
   A builder knew its own file, its own instruction and (since v31) what its siblings had FAILED at.
   It was never told what they were BUILDING. So a builder told "add a redirect fixture" had no way
   to know another item was told "write tests that use the redirect fixture", and vice versa — each
   made a locally reasonable choice and the two never met.
   This is deliberately READ-ONLY context, not a channel: the one-owner-per-file rule is the thing
   that makes a parallel fan-out safe over a shared tree, and it is restated here rather than
   softened. What changes is that a builder can now name the seam instead of guessing across it. */
function siblingBrief(item) {
  const sibs = (globalThis.__planSiblings || []).filter(x => x.file !== item.file)
  if (!sibs.length) return ''
  return `\nOTHER AGENTS ARE EDITING THESE FILES IN PARALLEL, IN THIS SAME RUN — you may NOT touch ` +
    `them, and they do not exist in their finished form yet:\n` +
    sibs.slice(0, 12).map(x => `  · ${x.file} — ${String(x.instruction || '').slice(0, 160)}`).join('\n') +
    `\n${sibs.length > 12 ? `  · (+${sibs.length - 12} more)\n` : ''}` +
    `WHY YOU ARE BEING TOLD: a fan-out's characteristic failure is two halves that are each correct ` +
    `and never meet. MEASURED on run wf_7ad48f08-5dc — one agent wrote a redirect_path fixture, ` +
    `another agent's tests prescribed that fixture, and NEITHER CALLED IT; the tests used ` +
    `mock.patch.object instead, and the helper shipped with zero call sites in the entire repo.\n` +
    `SO: if your instruction has you CREATE something a sibling is meant to call, list it in ` +
    `\`provides\` and WRITE IT UNDER THE NAME THE PLAN USES — do not rename it to taste. If your ` +
    `instruction has you USE something a sibling is creating, list it in \`consumes\` and CALL IT ` +
    `BY THAT NAME — do not quietly invent your own private equivalent because it does not exist on ` +
    `disk yet, and do not skip it. An unjoined seam is a FAILED item, not a stylistic difference.\n`
}
function buildAgent(item, reworkNote) {
  const tier = tierFor(item.tier, item.risk)   // standard: the plan's tier. max: Opus always. fast: Opus unless risk=low.
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
      /* v22.4 — A BUILDER MAY NOT PUSH, AND UNTIL NOW NOTHING SAID SO. Konyo, reading that the gates
         were still running after the code was already on the remote: "so its shipping versions
         silently within the workflow? and validating itself?" Yes — and that is a safeguard hole,
         not a quirk.
         MEASURED on the v1651 run: the builder committed at 09:36:50 and the gate agents were still
         writing at 09:40, 09:44 and 09:52. The render gate, LAW17 and LAW19 all run AFTER Build+Gate
         (lines 1566 → 1775 → 1820 → 2015) and every one of them is documented as a SHIP BLOCKER —
         but a blocker cannot block a ship that already left. They could only narrate it.
         Worse, it was INCONSISTENT: v1643's run reported "committed locally but NOT PUSHED" while
         v1645 and v1651 pushed. Whether the ship gates could block depended on how a builder read
         prose in the brief ("ONE push at the end" — whose end?). A safeguard whose effect depends on
         interpretation is not a safeguard.
         The `never push` rule already existed for the MERGE agent and was simply never given to the
         BUILDER. Committing stays allowed — it is local and reversible, and the gates read the diff.
         PUSHING is the irreversible half, so it moves behind the verdict where it belongs. */
      : `Make the edit directly to ${item.file}. Touch NO other file — you are the sole owner of this one.\n` +
        `⛔ NEVER \`git push\`. Commit if the task asks, but pushing is FORBIDDEN for you: the render gate, ` +
        `LAW17 and LAW19 all run AFTER you and each is a SHIP BLOCKER. Code you push cannot be un-pushed ` +
        `by a blocker they raise, so a push here turns three blocking gates into three narrators. The ` +
        `human pushes after reading the verdict — that is the whole point of the verdict.`
  return spawn(
    // v20 — a lean builder was told it was a "MAX-QUALITY build agent". Name the quality that ran.
    `${MAXQ ? `${QUALITY.toUpperCase()}-QUALITY` : 'KONYO WORKFLOW'} build agent (tier=${tier}). Task context: ${TASK}\n` +
    `You own exactly ONE file: ${item.file}${item.kind ? ` (kind=${item.kind})` : ''}.\n` +
    `Instruction: ${item.instruction}\n${act}${rw}\n` + siblingBrief(item) +
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
/* v20.1 — THE FLOOR IS A CONSTANT NOW, NOT A LOCAL. It used to live inside activeLenses(), where the
   ceiling-aware sizer below could not read it — and a second copy of a safeguard's number is exactly
   the two-formula bug v18.3 was fixed for. The VALUE is unchanged: 2 at max AND lean, 1 at standard.
   SKEPTIC_PIN is the ceiling-aware seat count, decided ONCE (see the sizer at the plan) so that the
   trim, the feasibility line, the announced count and the panel that actually sits are all the same
   number. It can only ever sit BETWEEN the floor and what triage asked for; it can never lower the
   floor, and an explicit {skeptics:N} outranks it. */
const SKEPTIC_FLOOR = MAXQ ? Math.min(2, LENSES.length) : 1
let SKEPTIC_PIN = null
function activeLenses() {
  const want = SKEPTICS_OVERRIDE !== null
    ? SKEPTICS_OVERRIDE
    : SKEPTIC_PIN !== null
      ? SKEPTIC_PIN
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
  const FLOOR_N = SKEPTIC_FLOOR   // v20.1 — ONE floor constant, shared with the ceiling-aware sizer
  if (SKEPTICS_OVERRIDE === null && floored < FLOOR_N && (MAXQ || APPLY)) {
    if (!globalThis.__skepticFloored) {
      globalThis.__skepticFloored = true
      /* v20 — THE FLOOR MESSAGE MUST NAME THE QUALITY THAT ACTUALLY RAN. MAXQ is `max || lean`,
         so this line said "is MAX quality" on every LEAN run — and lean is now the default, which
         would have made the most common run in the system describe itself as something it is not.
         Same defect class as the alvl on a terrorized card: every word true of SOME run, and the
         conclusion the reader draws is false. */
      log(`⚠ SKEPTIC FLOOR: triage asked for ${floored} skeptic(s) on a run that ` +
          (MAXQ ? `is ${QUALITY.toUpperCase()} quality` : 'WRITES FILES') + ` — a change does not ship unreviewed. Using ${FLOOR_N}.` +
          (MAXQ && FLOOR_N === 2 ? ' (2 is the floor for max AND lean: a refusal needs corroboration, and the third eye needs a seat.)' : ''))
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
/* v21 — THE THIN-PANEL LEDGER: SEATS BOUGHT IS NOT VOTES CAST, AND ONLY ONE OF THEM WAS REPORTED.
   ROOT CAUSE (same class as v14's "votes cast, never votes bought", one level up): tallyVotes was
   already careful to count CAST votes for the threshold — but the number that reached the human was
   `SKEPTICS`, the seats BOUGHT, in every surface that matters: the announcement, the payload's
   skeptics.used, the quality_label, and the pre-ship third-eye claim ("skeptic panel: N seat(s)").
   So the arithmetic below is honest and the report above it is not. The live failure mode is exact
   and cheap to hit: at the 2-seat FLOOR, seat 2 is Grok; an unreachable Grok casts NO vote (by
   design — it must never become a Claude opinion), so cast=1, `refutedN * 2 > cast` lets ONE Claude
   approval ship the change, and the payload still says a 2-seat adversarial panel reviewed it.
   The safeguard is NOT touched: the threshold, the floor and the zero-votes-is-REWORK rule are
   unchanged. What changes is that a panel that came up short is now RECORDED, surfaced in the
   payload, put in front of the pre-ship third eye, and forces a DEGRADED verdict — exactly the
   treatment an agent that died already gets, because that is exactly what an empty seat is.
   PREVENTION: one ledger, written at the ONLY place votes are counted, so a future surface cannot
   re-derive "how many reviewed this" from the seat count again. */
/* v40 §D2c — WHY EACH SEAT WAS EMPTY, RECORDED WHERE THE SEAT EMPTIED, NOT INFERRED LATER.
   THIN_PANELS knew the ARITHMETIC (1 of 2 voted) and nothing about the CAUSE, because by the time
   tallyVotes runs, an empty seat is a `null` in an array and a null carries no story. So the
   payload could say "3 thin panels" and a reader had no way to tell a run that could not afford
   its seats from one whose seats were killed mid-sentence by our own alarm — which, measured on
   wf_7ad48f08-5dc, is exactly what had happened on all four of them.
   ⚠ THIS IS A SIDE LEDGER ON PURPOSE, AND IT MUST STAY ONE. The obvious implementation is to
   return a reason OBJECT from the empty seat instead of null. That would be a live safeguard bug:
   tallyVotes counts `votes.filter(Boolean)`, so any truthy object lands in the tally as a vote
   with `refuted: undefined` — falsy — and an EMPTY SEAT WOULD BE COUNTED AS AN APPROVAL. The vote
   array is left exactly as it was; only the commentary is new. */
const EMPTY_SEATS = []
const THIN_PANELS = []
function tallyVotes(votes, panel, file) {
  const _seen = new Set()
  const _why = EMPTY_SEATS.filter(e => e.file === file)
    .filter(e => { const k = e.seat + '|' + e.kind; if (_seen.has(k)) return false; _seen.add(k); return true })
  const _whyFor = () => ({ empty_seats: _why.map(e => ({ seat: e.seat, kind: e.kind, reason: e.reason })),
    empty_seat_kinds: [...new Set(_why.map(e => e.kind))] })
  const v = votes.filter(Boolean)
  const cast = v.length
  if (cast === 0) {
    log(`SKEPTIC PANEL PRODUCED NO VOTES for ${file} (refused or died) — not approved.`)
    THIN_PANELS.push({ file, cast: 0, panel, ..._whyFor() })
    return { verdict: 'rework', refutedN: 0, votes: 0, panel,
      reasons: ['the skeptic panel produced no votes (refused or died) — unreviewed is not approved'] }
  }
  if (cast < panel) {
    THIN_PANELS.push({ file, cast, panel, ..._whyFor() })
    log(`⚠ THIN SKEPTIC PANEL on ${file}: ${cast}/${panel} vote(s) cast — the seats bought are NOT ` +
        `the reviews received; this is recorded and forces a DEGRADED verdict.` +
        (_why.length ? `\n   EMPTY BECAUSE: ${_why.map(e => `${e.seat} → ${e.kind}`).join('; ')}` : ''))
  }
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
      if (!rec || !rec.reached) {
        const kind = rec ? (rec.silence_kind || classifySilence(rec)) : 'transport_down'
        EMPTY_SEATS.push({ file: built.item.file, seat: `thirdEye(${lens})`, kind,
          reason: String((rec && rec.reason) || '').slice(0, 200) })
        return null                              // an empty seat, honestly empty — never a Claude vote
      }
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
    `claiming a full version stamp is a BLOCKER under LAW17, not a nit.\n` +
    `YOU ARE ASKED FOR ANALYSIS, NOT AGREEMENT. Do not tell the builder what it wants to hear, and ` +
    `do not manufacture a refutation to look useful either. State the strongest case that this ` +
    `change is WRONG, then the strongest case that it is RIGHT, and say which you actually believe ` +
    `and why. If you cannot judge it on the evidence available, say exactly that and name what you ` +
    `would need to see — "insufficient evidence, I would need X" is a REAL verdict and is worth ` +
    `more to this run than a confident guess that later turns out to be wrong.`,
    { model: 'opus', effort: MAXONLY ? 'xhigh' : 'high', phase: phaseName,
      label: `skeptic${i + 1}:${built.item.file}`, schema: SKEPTIC_SCHEMA }
  ).catch(() => ({ refuted: true, severity: 'major', reason: 'skeptic errored — an unverified change is refuted by default' }))
   /* v40 §D2c — A CLAUDE SEAT CAN EMPTY SILENTLY TOO, and only the grok one was being explained.
      spawn() returns null on a ceiling refusal WITHOUT throwing, so the .catch above never fires
      and there is no error anywhere — the seat simply is not in the tally. That is the v19.4 bug
      (a null from a ceiling refusal read as a verdict) at the panel instead of at the third eye. */
   .then(v => { if (!v) EMPTY_SEATS.push({ file: built.item.file, seat: `skeptic${i + 1}(${lens})`,
       kind: 'never_asked_ceiling', reason: 'the agent ceiling refused this seat — it was never asked' }); return v })
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
  // v31 — CAPTURE. Round 1's refusals are recorded before anything is re-attempted, so the round
  // that follows can be told what the round before it learned. Recording is free; it changes no
  // verdict and skips no gate.
  for (const x of res) {
    if (x.gate && x.gate.verdict === 'rework') {
      recordScar({ round: 1, file: (x.item || {}).file, stage: 'gate', severity: x.gate.severity,
                   reason: (x.gate.reasons || [x.gate.reason]).filter(Boolean).join(' | ') })
    }
  }
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
             /* v31 — the item's OWN failure (unchanged) PLUS what its siblings hit this run. The
                second half is the new part: items that share a brief fail the same way, and paying
                twice for one lesson is the whole reason this ledger exists. */
             const own = (x.gate.reasons || [x.gate.reason]).filter(Boolean).join(' | ')
             return buildAgent(esc, own + scarBriefFor(x.item.file)).then(b => ({ ...b, item: esc })) },
      built => gateFor(built),
      gated => skepticStage(gated)
    )
    const byFile = new Map(res.map(x => [x.item.file, x]))
    for (const x of redone.filter(Boolean)) byFile.set(x.item.file, x)
    res = [...byFile.values()]
    // v31 — capture THIS round's refusals for the round after it (and for the arc-end carve pass).
    for (const x of redone.filter(Boolean)) {
      if (x.gate && x.gate.verdict === 'rework') {
        recordScar({ round: r, file: (x.item || {}).file, stage: 'gate', severity: x.gate.severity,
                     reason: (x.gate.reasons || [x.gate.reason]).filter(Boolean).join(' | ') })
      }
    }
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
    /* v20 — THE BANNER ADVERTISED A PHASE THE RUN WOULD NEVER BUY. This was gated on MAXQ
       (`max || lean`) while the completeness loop is gated on `MAXONLY`, so every LEAN run
       opened by promising "N dry completeness round(s)" and then never ran one. Harmless-looking,
       and lean is now the DEFAULT, so it would have become the most-printed line in the system. */
    `max ${MAXROUNDS} rework round(s)` + ((MAXONLY) ? ` · ${DRYROUNDS} dry completeness round(s)` : '') +
    (ISOLATE ? ' · ISOLATE+MERGE' : '') +
    ` · third eye ${THIRD_EYE === 'off' ? 'OFF' : THIRD_EYE === 'claude' ? 'CLAUDE STAND-IN (degraded)' : 'ON (grok)'}`)
/* v38 — say the stakes translation out loud. A dial that silently becomes a different word is how
   the door and the engine drifted apart in the first place; printing the mapping means the next
   disagreement is visible in the first ten lines of a run instead of inferred from a bill. */
if (STAKES_FLAG) {
  log(`STAKES: "${STAKES_FLAG}" → quality:${QUALITY}` +
      (QUALITY_FLAG ? `  (an explicit quality:"${QUALITY_FLAG}" was ALSO passed and was OVERRULED — ` +
                      `stakes is the public dial)` : ''))
}
// v18 — a flag we did not understand must never be a silent downgrade.
if (STAKES_TYPO) log(`⚠ stakes:"${STAKES_FLAG}" is not a stakes this workflow knows ` +
    `(reversible | costly | irreversible). Ran at IRREVERSIBLE — an unrecognised flag fails EXPENSIVE, never quiet.`)
if (QUALITY_TYPO) log(`⚠ quality:"${QUALITY_FLAG}" is not a quality this workflow knows ` +
    `(internal: max | lean | standard | tiny). Ran at MAX — an unrecognised flag fails EXPENSIVE, never quiet. ` +
    `The public dial is stakes, not quality.`)
/* v20 — say the default out loud on the path that takes it. The old line fired on `!A?.quality`,
   which missed a quality arriving via globalThis.__KONYO_QUALITY; QUALITY_DEFAULTED is the same
   fact computed once, at the site that decided it. */
if (QUALITY_DEFAULTED) log('   (costly is the default — EVERY gate still runs, at ~62% of the tokens: one architect ' +
    'instead of a judge panel, one rework round, no completeness critic. Pass {stakes:"irreversible"} for the judge panel + completeness critic; {stakes:"reversible"} for the cheap ladder)')
log(`v30 METER: maxItems=${MAX_ITEMS_CAP} (quality=${QUALITY}) · volumeArcHeuristic=${LOOKS_LIKE_VOLUME_ARC}`)
if (LOOKS_LIKE_VOLUME_ARC) {
  log('⚠ v30 METER ROUTING: this task reads like a MULTI-VERSION VOLUME arc.')
  if (MAXONLY) {
    log('   quality=max is the expensive path. Prefer lean/tiny slices with items[], not one max fleet.')
    log(`   This run will hard-cap items at ${MAX_ITEMS_CAP} and report PARTIAL if more were planned.`)
    log('   Measured: max + 30-version brief → 2h+, agent ceiling, render CEILING, thrash on VERSION.')
  } else {
    log(`   quality=${QUALITY} is appropriate for volume — keep each package FAT (LAW17), not 30 hollow stamps.`)
  }
}
if (MAXONLY && FORCE) {
  log('⚠ v30: quality=max + force:true — triage cannot send this back to the main loop. Keep the item list SMALL.')
}

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
log('SCARS: the Preflight agent reads SCARS.md beside this engine before any build')

phase('Preflight')
let lock = null
if (APPLY) {
  /* ⚠ COMPUTED HERE, IN CODE — NOT DELEGATED TO AN AGENT.
     The key must identify the TREE THIS RUN EDITS. The sandbox has no filesystem, so a
     git root cannot be resolved — and does not need to be: the deepest common directory
     of the declared item paths is deterministic, derivable from strings alone, and
     always inside the tree being edited.
     The previous version asked the lock agent to work this out from a paragraph. One run
     did it correctly and produced "Users-konyo-kai-achilles"; the very next run, same
     engine and same instruction, keyed on the shell cwd and locked an entire home
     directory for eight hours over an edit to one repo. A safeguard that depends on an
     agent following prose is a suggestion. */
  /* ══ v32 §1.2 — THE KEY WAS A CONSTANT ON EVERY DEFAULT RUN ═════════════════════════════════════
     Two defects lived in these four lines, and the first one bit us on 2026-08-10.

     (a) THE KEY CAME ONLY FROM `A.items`. Every lean/max run uses an ARCHITECT and passes no items,
         so `_base` fell through to '' and the slug became the literal 'no-items'. Consequences, both
         real: two runs on UNRELATED repos collided on one global lock file; and — far worse — a
         default run on /repo did NOT block an items run on /repo, because they took different keys.
         That is precisely the lost-update the lock exists to prevent. Observed: a run editing
         ~/d2r_bible_tests held `no-items.json` whose recorded cwd was a completely different
         directory, and the engine's own tree_check reported `mismatch: true` while doing it.

     (b) THE COMMON-PREFIX REDUCE THEN STRIPPED ONE SEGMENT TOO MANY. It folded whole PATHS and only
         afterwards removed a trailing segment, so ONE item `tv/x.py` gave 'tv' while TWO items
         `tv/a.py` + `tv/b.py` gave '' — the same directory, two different locks, neither blocking
         the other. Taking the dirname FIRST and folding directories makes both cases 'tv'.

     THE EMPTY CASE now keys on the TREE the lock agent already resolves (git toplevel, with a
     refuse-$HOME backstop). That is NOT the "derive it yourself" delegation the comment below warns
     about — the agent is told to apply one exact mechanical transform to a value it has already
     computed deterministically, with no directory left to its judgement. */
  /* ══ v34 — ONE REPO, ONE LOCK. THE ITEM-DERIVED KEY WAS ACTIVELY HARMFUL. ══════════════════════
     v32 §1.2 fixed the key falling through to the constant 'no-items', but kept deriving it from
     the ITEM PATHS when items were supplied. Item paths are RELATIVE, so `tests/test_paper_demo.py`
     produced the slug `tests` — a key with no repo in it at all. Measured 2026-08-11, and it did
     real damage: a run working in ~/kai-achilles took the key `tests`, the lock agent resolved
     TREE from its own cwd and wrote the lock against ~/d2r_bible_routines, and the engine's own
     tree_check reported `mismatch: true`. So the lock guarded a repo nobody was editing while
     kai-achilles sat unprotected — and it ended with TWO AGENTS COMMITTING INTO THAT ONE TREE.
     Any two repos with a `tests/` directory also collided on one global key.

     ⚠ AND THE OBVIOUS REPAIR IS ALSO WRONG. Making the key `<tree>--<subdir>` would let a run with
     items and a run without items take DIFFERENT keys on the SAME repo, so neither blocks the
     other — which is exactly the lost-update the lock exists to prevent, reintroduced by the
     optimisation meant to fix it. The subdir narrowing only ever bought concurrent runs on
     different folders of one repo, and those still share its version stamps, its suite and its
     git index. That is not a thing worth buying.

     So: the key is ALWAYS the tree. An explicit human `{lockKey}` still overrides, because a person
     naming a key is a person who knows what they are doing. */
  const _slug = String((A && A.lockKey) || '').replace(/^\/+/, '').replace(/\//g, '-')
  const LOCK_SLUG = _slug || '__FROM_TREE__'
  log(`🔒 lock key (computed in code, not delegated): ${LOCK_SLUG}`)
  const taskSnip = TASK.slice(0, 120).replace(/\s+/g, ' ')
  lock = await spawn(
    `WORKSPACE LOCK — acquire. Pure mechanics, no judgement. Use Bash only.\n\n` +
    `1. LOCKDIR="$HOME/.claude/workflows/.locks"; mkdir -p "$LOCKDIR".\n` +
    `2. TREE = \`git rev-parse --show-toplevel 2>/dev/null\` || \`pwd -P\`. REFUSE if TREE is "$HOME" ` +
    `or "/" or empty — never lock the home directory (a Users-konyo.json lock blocks every repo under ` +
    `home). If refuse: return acquired:false, key:"refused-home", cwd:TREE.\n` +
      `3. KEY: ${LOCK_SLUG === '__FROM_TREE__'
        ? `this run passed no item paths, so derive the key from TREE (step 2) by ONE mechanical transform and nothing else: drop the leading "/" and replace every remaining "/" with "-". So /Users/konyo/d2r_bible_tests becomes Users-konyo-d2r_bible_tests. Do NOT shorten it, do NOT use basename, do NOT use pwd instead of TREE, do NOT "improve" it — the whole point is that two runs on the same tree compute the SAME string. TREE already refused $HOME in step 2, so this cannot produce a home-wide lock.`
        : `use EXACTLY this string, computed for you in code — do not derive your own, do not use pwd, do not "improve" it: ${LOCK_SLUG}`}. If it is empty or resolves to your home directory, REFUSE per step 2 rather than substituting one. ⚠ THE DERIVE-IT-YOURSELF WORDING WAS OBEYED ONCE AND IGNORED THE NEXT RUN: one run walked up to the git root correctly, the next keyed on the shell cwd and locked a whole home directory for eight hours over an edit to one repo. Step 2 is the backstop; this literal is the fix. ` +
    `LOCKFILE="$LOCKDIR/<slug>.json". Only this exact file covers this repo — a parent-path lock ` +
    `(e.g. $HOME) does NOT block a subdirectory repo.\n` +
    `4. PURGE FIRST. NOW=$(date -u +%s) — INTEGER EPOCH SECONDS. For every *.json in "$LOCKDIR", read ` +
    `its "expires_epoch" and delete the file if it is numerically less than $NOW, using ` +
    `[ "$EXP" -lt "$NOW" ] — an INTEGER test. Do NOT compare ISO strings with [ a \\< b ]: that is ` +
    `invalid under zsh, the test silently fails, and a dead lock then survives forever and locks the ` +
    `human out of their own repo. Also DELETE any lock whose cwd is exactly "$HOME" (toxic home-wide). ` +
    `Count deletions -> purged_stale. Malformed/unparseable counts as stale — delete it too.\n` +
    `5. If "$LOCKFILE" still exists after the purge, another run owns this EXACT tree. Do NOT touch ` +
    `or overwrite it. Return acquired:false with its token/started_at/expires_at/task as holder_token / ` +
    `holder_since / holder_expires / holder_task.\n` +
    /* v36 §C9 — GATHER THE EVIDENCE A HUMAN WOULD OTHERWISE HAVE TO GATHER BY HAND.
       Reported live 2026-08-13 by a peer session: a run died mid-flight, its lock stayed valid for
       the full TTL, and the next run refused against a holder that had already gone home. It cost a
       full launch cycle and a human adjudication. The purge in step 4 only removes EXPIRED locks, so
       a dead-but-unexpired holder is invisible to it.
       WHAT THIS DELIBERATELY DOES NOT DO IS AUTO-CLEAR. There is no trustworthy liveness signal to
       key on: the lock is WRITTEN by a short-lived subagent shell, so a recorded pid would name a
       process that exited seconds later and every lock would look dead. Guessing wrong in the other
       direction is far worse than waiting — this file already records what happened the last time a
       lock was cleared by hand: two runs shared one tree. A wrong wait costs minutes; two fleets
       writing the same files costs the tree.
       So the probe REPORTS and lets the decision stay with the human, but does the legwork first,
       which is the part that actually cost the peer its cycle. */
    `5b. LIVENESS EVIDENCE (only when step 5 refused). Do NOT delete or modify anything here — this ` +
    `step is READ-ONLY and its output is advisory. Gather, with a 20s budget total:\n` +
    `   · the lock file's own age: AGE_MIN=$(( ( $(date -u +%s) - $(stat -f %m "$LOCKFILE") ) / 60 ))\n` +
    `   · whether any process still holds that tree as its working directory:\n` +
    `     lsof -a -d cwd -- "<the holder cwd>" 2>/dev/null | tail -n +2 | wc -l\n` +
    `     ⚠ lsof ORs its selection flags — the -a is REQUIRED to AND them. Without it you get every ` +
    `open file on the machine and a meaningless non-zero count.\n` +
    `   · the newest mtime inside that tree, so "the holder has written nothing for 2 hours" is a ` +
    `fact and not a feeling.\n` +
    `Put a ONE-LINE plain summary in holder_evidence, e.g. "lock 127m old; 0 processes hold the tree; ` +
    `newest file mtime 2h05m ago — holder looks DEAD" or "... 3 processes hold the tree; written 40s ` +
    `ago — holder looks ALIVE". Put the integer minutes in holder_lock_age_min. If a probe fails, say ` +
    `which one failed in holder_evidence — never report a clean "looks dead" off a command that errored.\n` +
    `6. Otherwise WRITE "$LOCKFILE" with exactly these keys, then return acquired:true:\n` +
    `   token         = a unique id you generate (e.g. "$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM")\n` +
    `   started_at    = now, ISO-8601 UTC (human-readable only)\n` +
    `   expires_at    = now + ${LOCK_TTL_MIN} minutes, ISO-8601 UTC (human-readable only)\n` +
    `   expires_epoch = $(( $(date -u +%s) + ${LOCK_TTL_MIN} * 60 ))  <- INTEGER, the field step 4\n` +
    `                   compares. MUST be present and numeric or the lock is unpurgeable.\n` +
    `   cwd           = TREE from step 2 (git toplevel, never $HOME)\n` +
    `   task          = ${JSON.stringify(taskSnip)}\n` +
    `Return the token you wrote, AND TREE verbatim in \`cwd\` — on BOTH outcomes, acquired or not. ` +
    `That path is the only way a human can see WHICH tree this run locked. Do not create, edit or ` +
    `delete anything outside "$LOCKDIR".`,
    { model: 'sonnet', effort: 'low', phase: 'Preflight', label: 'lock:acquire', schema: LOCK_SCHEMA },
    true                              // reserved: the lock is taken before anything else spends
  ).catch(() => null)

  if (lock && lock.acquired === false && !IGNORE_LOCK) {
    log(`⛔ WORKSPACE LOCKED — another run is already editing this tree.`)
    log(`   tree     : ${lock.key}`)
    log(`   held by  : ${lock.holder_token || '(unknown)'} since ${lock.holder_since || '(unknown)'}`)
    log(`   its task : ${lock.holder_task || '(not recorded)'}`)
    log(`   expires  : ${lock.holder_expires || '(unknown)'} (locks self-expire after ${LOCK_TTL_MIN}m)`)
    /* v36 §C9 — SAY WHETHER THE HOLDER IS STILL BREATHING. Without this the refusal named a token
       and a timestamp and left the human to work out, by hand, whether anything was still running —
       which is exactly the cycle a peer session lost tonight to a holder that had already finished. */
    if (lock.holder_evidence) {
      log(`   liveness : ${lock.holder_evidence}`)
      log(`   lock age : ${lock.holder_lock_age_min != null ? lock.holder_lock_age_min + ' min' : '(unknown)'} ` +
          `of a ${LOCK_TTL_MIN}m TTL`)
    } else {
      log(`   liveness : NOT MEASURED — treat the holder as ALIVE. An unmeasured holder is not a dead one.`)
    }
    log(`   Refusing to start. Two fleets editing one tree silently overwrite each other.`)
    log(`   Wait for it, stop it, or re-run with {ignoreLock:true} if you KNOW the holder is dead.`)
    /* ⚠ THE ENGINE WILL NOT CLEAR THIS FOR YOU, AND THAT IS ON PURPOSE. The evidence above is
       advisory. Clearing a lock whose holder is actually alive puts two fleets in one tree, and the
       last time one was cleared by hand that is precisely what happened. If the evidence says dead:
       ARCHIVE the lock file (move it aside, do not delete it — the peer that did this tonight kept
       the artifact and it is how this defect got diagnosed at all), then re-run normally so this run
       TAKES a lock of its own. Prefer that to {ignoreLock:true}, which walks over the lock WITHOUT
       taking one and leaves your own fleet unprotected against the next run. Never pkill by name. */
    log(`   If the evidence says DEAD: archive the lock file (mv, do not rm) and re-run normally so ` +
        `this run takes its OWN lock — {ignoreLock:true} proceeds without taking one at all.`)
    // v13 defect #4 — every exit routes through bail(), or it carries no verdict and no shippable.
    return bail({
      refused: 'workspace locked by another run',
      lock,
      holder_liveness: lock.holder_evidence || 'not measured',
      fix: 'wait for the holder to finish, TaskStop it, or — if the liveness evidence says it is ' +
           'dead — archive the lock file with mv and re-run normally (preferred over {ignoreLock:true}, ' +
           'which proceeds without taking a lock of its own)',
      verdict: 'NOT RUN — refused at preflight; another run holds this tree',
    })
  }
  if (lock && lock.acquired === false && IGNORE_LOCK) {
    log(`⚠ WORKSPACE LOCKED but {ignoreLock:true} was passed — proceeding over ${lock.holder_token || '(unknown)'}. ` +
        `If that run is alive, one of you will lose work.`)
  }
  if (lock && lock.acquired) {
    log(`🔒 Workspace lock taken on ${lock.cwd || lock.key} (expires in ${LOCK_TTL_MIN}m).` +
        (lock.purged_stale ? ` Purged ${lock.purged_stale} stale lock(s).` : ''))
  }
  /* ── v20.1 — ANNOUNCE THE TREE, AND CROSS-CHECK IT AGAINST THE TASK ──────────────────────────────
     The lock key is `pwd -P` of the lock agent's shell. Nothing chose it, nothing declared it and
     until now nothing PRINTED it in a form you could compare to anything. Two failure directions:
       · shell sits in a tree ANOTHER run holds  -> preflight refuses. Loud, safe, already handled.
       · shell sits in a tree this run will NOT touch -> the lock lands somewhere irrelevant and the
         REAL target is unprotected, so a second fleet can edit it concurrently. That is precisely
         the lost-update this lock exists to prevent, and it is SILENT.
     BEHAVIOUR CHANGE, STATED PLAINLY: this WARNS, it does not refuse, and it changes no locking
     semantics — the same lock is taken on the same key, {ignoreLock:true} is untouched, and nothing
     new can abort a run. It is deliberately not a blocker: task text legitimately names absolute
     paths in trees the run must NOT edit (backups, installed copies, "do not touch X"), so a hard
     block here would fire on correct runs. The signal that IS worth shouting is the strict one:
     the task named absolute paths and NOT ONE of them lives under the tree that got locked. */
  const LOCKED_TREE = (lock && String(lock.cwd || lock.key || '').trim()) || ''
  if (LOCKED_TREE) {
    const declared = String(TASK).match(/\/(?:Users|home|opt|srv|private|var|workspace)\/[^\s'"`,;:)\]]{3,}/g) || []
    const inside = declared.filter(p => p.indexOf(LOCKED_TREE) === 0)
    globalThis.__lockCheck = { tree: LOCKED_TREE, declared_paths: declared.length,
      inside_locked_tree: inside.length, mismatch: !!(declared.length && !inside.length) }
    if (declared.length && !inside.length) {
      log(`⚠⚠ LOCK-TREE MISMATCH — the workspace lock was taken on ${LOCKED_TREE}, but NONE of the ` +
          `${declared.length} absolute path(s) named in the task live under it.`)
      log(`   e.g. ${declared.slice(0, 3).join(' · ')}`)
      log(`   The lock key is the SHELL's working directory, which nobody declared. If the files this ` +
          `run edits are not under the locked tree, THEY ARE NOT PROTECTED and a second run can edit ` +
          `them at the same time.`)
      log(`   If that is wrong, stop this run and re-launch it from the tree it is meant to edit.`)
    } else if (declared.length) {
      log(`   lock cross-check: ${inside.length}/${declared.length} absolute path(s) named in the task live under the locked tree.`)
    }
  }
  /* ── v40 §D5 — "THE LOCK AGENT NEVER ANSWERED" WAS A LOG LINE AND NOTHING ELSE ────────────────
     Found sweeping for this file's own signature defect: a fact that is true in the run and absent
     from the DECISION. Every branch above is `if (lock && ...)`, and spawn() returns null WITHOUT
     throwing when an agent dies or the ceiling refuses the seat — so a run whose lock agent never
     came back skipped the refusal, skipped the acquired-log, skipped the tree cross-check (which
     needs LOCKED_TREE and therefore silently does nothing), printed ONE warning line, and then
     EDITED A SHARED TREE WITH NO LOCK. The payload said `lock: null`, which is the identical value
     a dry run produces — so a caller could not tell "no lock was needed" from "the lock failed and
     we wrote anyway".
     THIS IS THE ONE PLACE THAT COSTS SOMEBODY ELSE'S WORK. Every other unreported fact in this file
     makes a report misleading; this one lets two fleets interleave edits in one tree, which is the
     exact lost-update the lock exists to prevent, arriving through the lock's own failure path.
     WHY A BLOCKER AND NOT A REFUSAL: the engine already decided to proceed here and that is a
     defensible call — a flaky lock agent should not throw away a run's work. What is NOT defensible
     is the result then being SHIPPABLE. Nobody can say whether another fleet was editing the same
     files, so the one thing that must not happen automatically is the push. A human can still push
     by hand after looking; the verdict now tells them what they are deciding.
     ⚠ Deliberately NOT raised under {ignoreLock:true} — that flag IS the human saying "proceed
     without a lock, I know what I am doing", and blocking a run for doing what it was told would
     make the flag useless. */
  if (!lock) {
    globalThis.__lockUnestablished = true
    log(`⚠ Preflight lock could not be established — proceeding UNLOCKED (no tree is protected).`)
    if (!IGNORE_LOCK) {
      blocker('WROTE TO A SHARED TREE WITH NO WORKSPACE LOCK',
        'the lock agent never returned (it died, or the agent ceiling refused the seat) — spawn() ' +
        'returns null in both cases WITHOUT throwing, so nothing refused and this run edited the ' +
        'tree unprotected. No claim can be made that another fleet was not editing the same files ' +
        'at the same time, so this must not ship automatically. Check `git log`/`git status` for ' +
        'interleaved work, then push by hand if it is clean. Pass {ignoreLock:true} if you know no ' +
        'other run was live and want this to stop blocking.')
    } else {
      log(`   ({ignoreLock:true} was passed, so this is not raised as a blocker — you asked for it.)`)
    }
  }
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

// v22 — tiny buys no triage agent, so it must not open an empty Triage box either (the v18.2
// lesson: a phase group with nothing in it reads as a phase that failed).
if (!TINYQ) phase('Triage')
/* v35 — AN `items` WORK LIST IS FILE-SHAPED BY CONSTRUCTION, AND THIS GUARD COULD NOT SEE IT.
   wantsAFile() reads the TASK PROSE. A caller who passes items:[{file,instruction}] has named the
   files outright, which is a stronger statement of intent than any sentence — but the prose may
   never say "write a file", so the refusal did not fire and the run proceeded as a "dry run".

   IT HAPPENED TWICE, BOTH TIMES SILENTLY: wf_cae716ee-9bb and wf_83f3bfc0-06f both reported
   mode "DRY-RUN (agents propose diffs, nothing written)" and shippable:false, and both left files
   MODIFIED in the real working tree. Builders ARE instructed "Do NOT write anything" (:818) and
   ignored it. The damage is not the edit — the caller wanted those edits — it is that the RESULT
   SAYS NOTHING WAS WRITTEN while the tree disagrees, so the next commit sweeps up work no gate
   ever ran on. In wf_83f3bfc0-06f that work was WRONG (it would have minted duplicate roster rows)
   and only a manual `git checkout --` kept it out of a commit.

   ⚠ THE FIX IS A REFUSAL, NOT A PROMOTION. Auto-setting APPLY=true would be worse than the bug:
   APPLY gates the render gate, the fat version bar and the SHIP phase (:1924, :1929), so a caller
   who asked for a dry run would silently get a run that PUSHES. Refuse, name the contradiction,
   and let them choose. */
const _fileShapedItems = (A && Array.isArray(A.items)) ? A.items.filter(x => x && x.file).length : 0
if (!APPLY && (wantsAFile(TASK) || _fileShapedItems)) {
  const why = _fileShapedItems
    ? `this is a DRY-RUN (apply:false) but ${_fileShapedItems} item(s) name a FILE to edit.`
    : 'this is a DRY-RUN (apply:false) but the task asks agents to WRITE A FILE.'
  log(`⚠ TRIAGE REFUSED: ${why}`)
  log('  Nothing can satisfy that, so every item would fail its gate and rework would multiply.')
  if (_fileShapedItems) {
    log('  Worse, builders have twice ignored "do not write" and edited the tree anyway, while the')
    log('  report still said nothing was written — work that no gate ran on, sitting in the repo.')
  }
  log('  Re-run with apply:true, or ask for the content in the RESULT instead of on disk.')
  return bail({
    refused: _fileShapedItems ? 'dry-run with a file-shaped items[] work list' : 'dry-run with a file-shaped deliverable',
    fix: 'apply:true, or drop the file deliverable',
    file_shaped_items: _fileShapedItems,
  })
}

if (LOG_PASS && !APPLY) {
  log('⚠ logPass:true is a DRY-RUN — a log of a pass that wrote nothing is a lie.')
  return bail({
    refused: 'logPass requires apply:true',
    fix: 'apply:true with logPass:true, or drop logPass',
  })
}

/* ── v22 — TINY REFUSES A BRIEF IT CANNOT DO IN FOUR HOPS ────────────────────────────────────────
   Tiny buys its speed by SKIPPING triage and the architect, which is only honest when the plan is
   already in the brief. So the work list is not optional here: `items` must arrive with a file and
   an instruction per entry. A tiny run handed a vague ask has two options — degrade into a slow run
   while still calling itself tiny, or refuse. It refuses, loudly, and names the exact re-run.
   The bounds are the hop budget expressed as limits: >4 items or >3 files cannot finish in one
   build hop plus one gate hop, and "investigate / find out why / figure out" is a DIAGNOSIS, which
   triage has always classified as serial work that a fleet makes slower, not faster. */
const TINY_MAX_ITEMS = 4, TINY_MAX_FILES = 3
if (TINYQ) {
  const its = (A && Array.isArray(A.items)) ? A.items : null
  const files = its ? [...new Set(its.map(i => i && i.file).filter(Boolean))] : []
  const bad = !its ? 'no `items` array was passed'
    : !its.length ? '`items` was empty'
    : its.some(i => !i || !i.file || !i.instruction) ? 'every item needs BOTH `file` and `instruction`'
    : its.length > TINY_MAX_ITEMS ? `${its.length} items — tiny caps at ${TINY_MAX_ITEMS}`
    : files.length > TINY_MAX_FILES ? `${files.length} files — tiny caps at ${TINY_MAX_FILES}`
    : /\b(investigate|figure out|find out why|diagnose|root[- ]cause|why is)\b/i.test(TASK)
      ? 'this reads as a DIAGNOSIS, which is serial work — a fleet makes it slower, not faster'
      : null
  if (bad) {
    log(`⛔ TINY REFUSED: ${bad}.`)
    log('   Tiny skips triage AND the architect, so the plan must already be in the brief:')
    log('   {quality:"tiny", apply:true, items:[{file:"/abs/path", instruction:"…", risk:"low", anchor:"~line N, symbolName"}]}')
    log('   `anchor` is optional but is the single biggest time saver on a large file — it turns a search into a jump.')
    log(`   Bounds: <=${TINY_MAX_ITEMS} items across <=${TINY_MAX_FILES} files, no diagnosis.`)
    log('   For anything else use the lean default — it plans for you, and it is honest about taking longer.')
    return bail({ refused: `tiny brief unusable: ${bad}`,
      fix: 'pass items:[{file,instruction}] within the tiny bounds, or drop quality:"tiny" to run lean' })
  }
}
/* v22 — tiny spawns NO triage agent. The caller already answered every question triage asks by
   passing an explicit work list, so paying an Opus round-trip to be told "build, parallel, light"
   is a hop bought for nothing. The shape is stated here instead, and it is REPORTED like any other
   triage so the run still says out loud what it assumed. */
const TINY_TRIAGE = {
  shape: 'build', parallelism: 'parallel', cost_of_wrong: 'medium', tier: 'light',
  est_agents: ((A && A.items) || []).length + 3,
  skeptics: 0, work_list_known: true,
  why: 'quality=tiny — the caller supplied an explicit file+instruction work list, so no triage agent was bought',
}
const triage = TINYQ ? TINY_TRIAGE : await spawn(
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
} else {
  /* ── v40.2 — A DEAD TRIAGE AGENT SILENTLY DISARMED TWO SPEND SAFEGUARDS ──────────────────────
     Found with __harness.nullAgents against a baseline that could actually SHIP: nulling the triage
     agent left `shippable: true`, `verdict: OK`, zero blockers, and NOT ONE LOG LINE saying triage
     had failed. `if (triage) {` had no else, so a null simply fell through everything.
     WHAT SILENTLY DID NOT HAPPEN:
       · THE DIRECT-WORK REFUSAL. Inside the block above, `triage.tier === 'direct'` bails the whole
         run with "TRIAGE SAYS DO THIS DIRECTLY — spawning nothing". That is the one safeguard that
         can stop a fleet being bought for a job one process does better, and a dead agent removes
         it — the run fans out regardless, and nobody is told the question was never answered.
       · THE TRIAGE CAP. `if (globalThis.__triage && globalThis.__triage.est_agents)` at the plan
         trims an architect that returned 23 items for a job sized at 6. With __triage unset that
         `&&` is false and the cap does not apply. (The plan is still bounded by MAX_ITEMS_CAP and
         the ceiling trim, so this is a widened bound, not an unbounded one — stated precisely
         because overstating it would be its own version of the defect.)
     THIS DOES NOT BLOCK, AND THAT IS DELIBERATE. Every gate still ran and the work is as verified
     as any other run's; refusing to ship fully-gated work because a SIZING agent flaked would spend
     more than the flake cost. What was wrong was never the shipping — it was that the run reported
     a sizing decision it never made. So this is loud, and it is in the payload, and it stops there.
     ⚠ Cannot fire at quality=tiny: TINY_TRIAGE is a real object, so `if (triage)` is true there and
     this branch is only reachable when the spawn genuinely returned null. */
  globalThis.__triageFailed = true
  log(`⚠⚠ TRIAGE DID NOT RETURN — the agent died or the ceiling refused it. This run was NEVER SIZED.`)
  log(`   Two safeguards did not run, and neither would have said so:`)
  log(`   · the DIRECT-WORK refusal — nothing could tell this run "do it in the main loop, spawn nothing".`)
  log(`   · the TRIAGE CAP on plan size — the architect's item count is bounded only by the quality`)
  log(`     item cap (${MAX_ITEMS_CAP}) and the agent ceiling, not by a judgement about this task.`)
  log(`   The run continues at its DEFAULTS. Everything below is fully gated; only the sizing is unmeasured.`)
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
/* ── v27 — CALLER ITEMS AT ANY QUALITY (port of the 2026-08-07 Grok shipper fix) ──────────────
   Measured on Grok lean apply:true: architect returned items:[] because the lead had already sealed
   the work mid-flight. The empty array is TRUTHY in JS (`![] === false`), so `!plan.items` did NOT
   bail, the fleet built nothing, failed stayed [], and SHIPPABLE became true with zero work —
   a vacuous green ship. Tiny already skipped the architect when the human named the files; that
   law applies at lean/max/standard too. When items:[] is intentional "already done", we refuse with
   architect_noop — never report success over an empty plan. */
const CALLER_ITEMS = (A && Array.isArray(A.items)) ? A.items.filter(Boolean) : []
const HAS_CALLER_ITEMS = CALLER_ITEMS.length > 0
if (!TINYQ && HAS_CALLER_ITEMS) {
  const files = [...new Set(CALLER_ITEMS.map(i => i && i.file).filter(Boolean))]
  const bad = CALLER_ITEMS.some(i => !i || !i.file || !i.instruction)
    ? 'every item needs BOTH `file` and `instruction`'
    : files.length !== CALLER_ITEMS.length
      ? 'two items name the same file — one owner per file'
      : null
  if (bad) {
    log(`⛔ CALLER ITEMS REFUSED: ${bad}.`)
    log('   {apply:true, items:[{file:"/abs/path", instruction:"…", risk:"low", anchor:"~line N"}]}')
    return bail({ refused: `caller items unusable: ${bad}`,
      fix: 'fix items:[{file,instruction}] with unique files, or drop items and let the architect plan' })
  }
  log(`CALLER ITEMS → ${CALLER_ITEMS.length} item(s) supplied — architect will be skipped (same law as tiny).`)
}

if (!(TINYQ || HAS_CALLER_ITEMS)) phase('Architect')   // v27 — also skip when caller named the files
let plan = null
/* v22 — TINY HAS NO ARCHITECT, BECAUSE THE CALLER ALREADY IS ONE. The refusal gate above proved
   every item carries a file and an instruction, which is exactly what an architect produces. Buying
   an Opus round-trip to restate the caller's own list is the single cheapest hop to delete, and the
   one-owner-per-file law the architect enforces is checked here directly instead of trusted.
   Nothing downstream can tell the difference: this builds the same PLAN_SCHEMA shape the spawn
   would have returned, so build, gate, rework and every report read it unchanged. */
if (TINYQ || HAS_CALLER_ITEMS) {
  const raw = (A && A.items) || []
  const seen = new Set(), dupes = []
  for (const it of raw) { if (seen.has(it.file)) dupes.push(it.file); seen.add(it.file) }
  if (dupes.length) {
    // ONE OWNER PER FILE is a correctness law, not a style rule — two agents on one file is the
    // lost-update the workspace lock exists to prevent, reproduced inside a single run.
    log(`⛔ TINY REFUSED: two items name the same file (${[...new Set(dupes)].join(', ')}).`)
    log('   One owner per file. Merge them into a single item whose instruction does both edits.')
    return bail({ refused: 'tiny: duplicate file owner', fix: 'merge the items that share a file' })
  }
  plan = {
    version_label: (A && A.versionLabel) || (TINYQ ? 'v-tiny-r1' : 'v-items-r1'),
    summary: `${TINYQ ? 'tiny' : 'caller-items'} — ${raw.length} caller-specified edit(s), no architect bought`,
    items: raw.map((it, i) => ({
      id: it.id || ('t' + (i + 1)),
      file: it.file,
      kind: it.kind || 'code',
      tier: it.tier || 'sonnet',
      risk: it.risk || 'low',
      /* v22.3 — AN `anchor` IS FOLDED INTO THE INSTRUCTION, because READING is the real cost.
         Konyo, after a 43-minute tiny run on a 2-item brief: "add the line anchors to the items
         next time". MEASURED why that matters: cutting the phase chain from 11 hops to 6 did not
         buy the time back, because on this repo a single hop costs 8-10 minutes — bible.html and
         tv/control_ui.html are ~40k lines, and the builder, EACH skeptic and the render gate all
         re-read large stretches hunting for their seam. Hop count is not the binding constraint
         once a file is big enough; LOCATING THE EDIT is. An anchor ("~line 11286, _aiSetName")
         turns a hunt into a jump for every one of those agents, which is where the minutes are.
         Optional by design: a tiny brief without anchors still runs, it just pays to search. */
      instruction: it.instruction + (it.anchor ? `\n\nANCHOR (where this lives — go straight here, do not hunt): ${it.anchor}` : ''),
    })),
  }
  const _anch = raw.filter(it => it.anchor).length
  log(`ARCHITECT SKIPPED (${TINYQ ? 'quality=tiny' : 'caller items[]'}) — plan taken verbatim from the caller: ${plan.items.length} item(s), one owner per file verified.`)
  log(_anch === raw.length
    ? `   every item carries an ANCHOR — builders and gates jump instead of searching (the real cost on big files).`
    : `   ⚠ ${raw.length - _anch}/${raw.length} item(s) have NO \`anchor\` — on a large file that is 8-10 min per hop of SEARCHING, paid again by every skeptic and the render gate. Pass anchor:'~line N, symbolName' next time.`)
  // v30 — quality item cap also applies to caller items (tiny already refused >4 upstream)
  if (plan.items.length > MAX_ITEMS_CAP) {
    log(`v30 ITEM CAP on caller items[]: ${plan.items.length} → ${MAX_ITEMS_CAP}`)
    for (const dropped of plan.items.slice(MAX_ITEMS_CAP)) {
      // trimmedFromPlan does not exist yet — stash on global for later merge into the real array
      ;(globalThis.__v30CallerTrimmed = globalThis.__v30CallerTrimmed || []).push(dropped.file)
    }
    plan.items = plan.items.slice(0, MAX_ITEMS_CAP)
  }
}
/* ── v20.1 — RIGHT-SIZE THE PANEL, AND REPORT THE SIZE ───────────────────────────────────────────
   MEASURED, v1635: the 20+ agent ceiling went entirely to the architect panel, the builders and the
   skeptics, and all three closing blockers were the same sentence — "the ceiling was already spent,
   so this gate never ran" (render gate, LAW17, LAW19). One of the two fixed-size spends is right
   here: 3 architects + 1 judge = FOUR agents, paid identically for a 2-item mechanical job and for a
   cross-cutting rewrite.
   THE PANEL RUNS BEFORE `items` EXISTS, so it cannot be sized by planned-item count. The only
   signals that exist at this moment are triage's: cost_of_wrong, est_agents, tier. Size off those.
   A judge is only worth an agent when there is MORE THAN ONE candidate to merge — a judge over a
   single candidate is pure spend — so ARCH_N === 1 takes the single-architect branch that standard
   and lean already run every day, which is the best-tested path in the file.
   THIS TRIMS THE COUNT, NEVER THE TIER: every architect and the judge stay Opus/high at max, which
   Konyo explicitly declined to change. And it is REPORTED — a bound that is enforced but never
   announced is the same defect as no bound at all. */
const ARCH_TRIAGE = globalThis.__triage || {}
const ARCH_N = !(MAXONLY) ? 1
  : (ARCH_TRIAGE.cost_of_wrong === 'high' && (ARCH_TRIAGE.est_agents || 0) >= 3) ? 3
  : (ARCH_TRIAGE.cost_of_wrong === 'high' || (ARCH_TRIAGE.est_agents || 0) >= 3) ? 2
  : 1
if (MAXONLY) {
  log(`ARCHITECT PANEL → ${ARCH_N} candidate plan(s)` +
      (ARCH_N > 1 ? ' + 1 judge to merge them' : ' + NO judge (a judge over a single candidate is pure spend)') +
      ` = ${ARCH_N + (ARCH_N > 1 ? 1 : 0)} agent(s), sized from triage ` +
      `(cost_of_wrong=${ARCH_TRIAGE.cost_of_wrong || '?'}, est_agents=${ARCH_TRIAGE.est_agents || '?'}). ` +
      `Every seat is still Opus/high — this trims the COUNT, never the tier.`)
}
/* v19 — THE PANEL IS A BARRIER, AND LEAN DOES NOT PAY FOR IT. Three architects plus a judge is four
   agents and a serial round: nothing starts building until the slowest candidate AND the judge are
   done (measured 13:14:50 -> 13:17:46 on the first max run). Lean buys ONE architect — and the plan
   is still independently read, because the third eye reviews it before a builder spends anything.
   That is a different MODEL FAMILY looking at the plan, which is a stronger check than a second
   Claude candidate anyway. */
if (!plan && MAXONLY && ARCH_N > 1) {
  const ANGLES = [
    'RISK-FIRST: order items by blast radius; isolate the highest-risk change and make it the most defensively specified.',
    'CORRECTNESS-FIRST: decompose so each item has a single, testable, unambiguous fix; no item bundles two concerns.',
    'SIMPLEST-ROBUST: the smallest set of one-owner-per-file changes that fully solves it with no scope creep.',
  ]
  const candidatePlans = (await parallel(ANGLES.slice(0, ARCH_N).map((angle, i) => () =>
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
  /* v20.1 — A JUDGE OVER ONE CANDIDATE IS AN AGENT SPENT TO AGREE WITH ITSELF. When two of three
     architects die (they .catch(() => null), so this is a normal outcome, not an exception) the run
     used to buy a "JUDGE + MERGE" of a single plan — the merge is a no-op and the ceiling is one
     agent poorer at exactly the moment the run is already degraded. Take the survivor and say so. */
  if (candidatePlans.length === 1) {
    log(`ARCHITECT PANEL: only 1 of ${ARCH_N} candidate plan(s) came back — taking it directly, ` +
        `skipping the judge (there is nothing to merge, and the agent is worth more to the closing gates).`)
    plan = candidatePlans[0]
  } else {
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
  }
} else if (!plan) {
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
  `\nITEM CAP THIS RUN (v30 meter routing, quality=${QUALITY}): produce AT MOST ${MAX_ITEMS_CAP} items. ` +
  `quality:max is for SMALL high-stakes lists, not volume arcs — lean/tiny slices ship multi-version work. ` +
  `Fewer, FATTER packages beat 30 hollow stamps.\n` +
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
// v27 — EMPTY ARRAY IS TRUTHY. `![] === false`, so `!plan.items` never caught items:[].
// An architect that returns [] (often: "already done") used to fall through, build nothing, and
// leave SHIPPABLE true with zero work. Bail here with an honest error name.
if (!plan || !Array.isArray(plan.items)) {
  log('Architect produced no plan.')
  return bail({ error: 'no plan', fix: 're-run, or pass items:[{file,instruction}] to skip the architect' })
}
if (plan.items.length === 0) {
  // summary only — `why` is often a harness/judge filler and must not rebrand empty as noop.
  const sum = String(plan.summary || '').trim().slice(0, 240)
  log(`⛔ ARCHITECT RETURNED 0 ITEMS` + (sum ? ` — ${sum}` : ''))
  log('   This is NOT a ceiling trim. Pass items:[{file,instruction}] (works at any quality), or force a real plan.')
  if (FORCE) {
    log('   note: force:true overrode triage-direct, but an empty architect plan still cannot ship.')
  }
  await releaseLock()
  return bail({
    error: sum ? 'architect_noop' : 'architect_empty',
    refused: 'architect returned items:[]',
    architect_summary: sum || null,
    force: FORCE,
    fix: FORCE
      ? 'force:true got you past triage, not past an empty plan. Pass items:[{file,instruction}] or give the architect real remaining work.'
      : 'Pass items:[{file,instruction}] at any quality to skip the architect, or re-run with a task that still has work.',
    verdict: sum ? 'ALREADY COMPLETE OR NOOP — architect returned no work items' : 'BLOCKED — architect returned an empty plan',
  })
}

// one-owner-per-file guarantee
const seen = new Set()
let items = plan.items.filter(it => {
  if (!it || !it.file) return false
  const k = it.file
  if (seen.has(k)) return false
  seen.add(k)
  return true
})
if (!items.length) {
  log('⛔ EMPTY PLAN AFTER FILTER — every item lacked a file path or was a duplicate.')
  await releaseLock()
  return bail({ error: 'empty plan after filter',
    fix: 'every item needs a unique file path',
    verdict: 'BLOCKED — no workable items after one-owner-per-file filter' })
}
// Triage's number is a CEILING, not a suggestion — an architect that returns 23 items for a job
// triaged at 6 is how a planning doc turns into a hundred agents. Trim, and say so out loud.
// Saying it out loud in the LOG is not saying it in the SUMMARY: a trimmed plan used to return
// ceiling.complete=true, so a run that dropped planned work read as a run that finished it.
const trimmedFromPlan = []
/* v40 §D1a — THE FEASIBILITY GATE WAS BLIND BY CONSTRUCTION, AND THIS IS THE NUMBER IT NEEDED.
   The FEASIBILITY block ~90 lines below exists to warn, BEFORE the money is spent, that a plan
   cannot finish inside the ceiling. It computed its worst case from `items.length` — and every
   trim above it had already shortened `items` to something that fits. So the one input that could
   have made it fire was removed before it read it: the two sides of the comparison were made equal
   by the very trim the warning is about. It could still fire on the rework MULTIPLIER, which is
   why it was not obviously dead, and never on the trim itself.
   That is [[gate_blind_to_unexercised_input]] in the engine's own safeguards — a gate whose two
   sides cannot disagree — and it is why run wf_7ad48f08-5dc dropped a third of its brief without
   the warning written to catch exactly that ever printing a word.
   PLANNED_N / PLANNED_FILES are captured HERE, above every trim, and the feasibility block reads
   them. Nothing else uses them, and no trim may ever be moved above this line. */
const PLANNED_N = items.length
const PLANNED_FILES = items.map(i => i.file)
/* ⚠ THE SUMMARY READS THIS MIRROR, NOT THE CONST. PLANNED_N is a top-level `const`, so on any path
   that reaches the summary without executing this line it sits in its TEMPORAL DEAD ZONE — and a
   `typeof` guard would THROW there rather than yield 'undefined', because typeof only protects
   UNDECLARED identifiers, not un-initialised ones. A summary that throws is a run with no verdict
   at all, which is strictly worse than the reporting bug this section is fixing.
   (The first cut of this comment named the identifier and the `typeof` operator in one phrase, and
   the assertion proving the rewrite was complete then matched ITS OWN PROSE — source-reading-guard,
   caught in the act of writing the fix for it.) */
globalThis.__plannedN = items.length
globalThis.__plannedFiles = PLANNED_FILES.slice()
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
  /* v18.3 — THE TRIM MUST RESERVE THE GATES, OR IT FUNDS BUILDING AND STARVES VERIFYING.
     Measured on the 2026-08-04 merge run: this trim reserved 2 agents while the FEASIBILITY block
     twelve lines below counted 5 gates + 2. Two formulas for one decision, and the OPTIMISTIC one
     was the one that bound. So nothing was trimmed (trimmedFromPlan: []), feasibility then announced
     worst 21 > cap 20, the run spent all 20 agents on builds — and its three closing blockers were
     all the same sentence: "the ceiling was already spent, so this gate never ran." Render gate,
     LAW17 and LAW19, the three things that decide whether a ship is trustworthy, all unfunded.
     Building more than you can verify is NEGATIVE value: it produces unreviewed edits and a verdict
     of UNVERIFIED. One item built and fully gated beats two built and none gated, every time.
     GATES and RESERVE now live in ONE place and are read by both the trim and the feasibility line,
     so the two can no longer drift apart. The rework MULTIPLIER stays out of the trim on purpose —
     rework is conditional, and folding it in here would halve every plan for a cost most runs never
     pay. Feasibility still warns about that worst case; this guarantees the FIXED costs. */
  /* v20.1 — CEILING-AWARE PANEL SIZING, DECIDED ONCE, AND IT CAN ONLY ADD COVERAGE.
     The other fixed-size spend: skeptics are a PER-ITEM multiplier, so items x seats dominates any
     multi-item run and the trim below then throws whole ITEMS away to pay for depth on the few that
     survive. When the two do not both fit, coverage is worth more than the 3rd seat: an item that is
     never built is never reviewed at all, while an item reviewed by 2 seats still faces a panel that
     can refuse (2 votes to refute, one of them the third eye). So: drop seats ONE at a time, ONLY
     while that buys at least one more item, and NEVER below SKEPTIC_FLOOR.
     GUARANTEES, deliberately narrow: it never seats fewer than the floor (the safeguard is untouched);
     it never seats MORE than triage/default asked for; an explicit {skeptics:N} skips it entirely; and
     it is pinned so the trim, the feasibility line, the announcement and the panel that actually sits
     all read the SAME number through activeLenses() — the v18.3 two-formula bug cannot come back
     through this door, because there is still only one door. */
  if (SKEPTICS_OVERRIDE === null) {
    const room   = Math.max(0, MAX_AGENTS - SPENT - GATE_COST - RESERVE_COST)
    const wantN  = activeLenses().length
    const fitsAt = n => Math.floor(room / (1 + n))
    let seats = wantN
    while (seats > SKEPTIC_FLOOR && fitsAt(seats) < items.length) seats--
    if (seats < wantN) {
      SKEPTIC_PIN = seats
      log(`SKEPTIC SIZING: ${wantN} seat(s) x ${items.length} item(s) did not fit under the ${MAX_AGENTS}-agent ` +
          `cap once ${GATE_COST} gate(s) + ${RESERVE_COST} reserved are paid for. Seating ${seats} per item ` +
          `(floor is ${SKEPTIC_FLOOR} and is NEVER lowered) — that funds ${fitsAt(seats)} fully-reviewed item(s) ` +
          `instead of ${fitsAt(wantN)}. Pass {skeptics:${wantN}} to force the full panel and trim items instead.`)
    }
  }
  const perItem = 1 + activeLenses().length
  const roomForItems = Math.max(1, Math.floor((MAX_AGENTS - SPENT - GATE_COST - RESERVE_COST) / Math.max(1, perItem)))
  if (items.length > roomForItems) {
    log(`CEILING: plan had ${items.length} items; ${roomForItems} fit under the ${MAX_AGENTS}-agent cap ` +
        `once ${GATE_COST} gate(s) + ${RESERVE_COST} reserved are paid for — the rest are REPORTED, not silently dropped.`)
    for (const dropped of items.slice(roomForItems)) trimmedFromPlan.push(dropped.file)
    items = items.slice(0, roomForItems)
  }
}
// v30 — quality item cap (meter routing). Applied AFTER ceiling math so both bounds hold.
// Rest → follow-up / PARTIAL via the same trimmedFromPlan ledger.
if (Array.isArray(globalThis.__v30CallerTrimmed) && globalThis.__v30CallerTrimmed.length) {
  for (const f of globalThis.__v30CallerTrimmed) trimmedFromPlan.push(f)
  globalThis.__v30CallerTrimmed = []
}
if (items.length > MAX_ITEMS_CAP) {
  log(`v30 ITEM CAP (quality=${QUALITY}): plan had ${items.length} items; keeping ${MAX_ITEMS_CAP} ` +
      `(rest → follow-up / PARTIAL). Max is not a volume throttle.`)
  for (const dropped of items.slice(MAX_ITEMS_CAP)) trimmedFromPlan.push(dropped.file)
  items = items.slice(0, MAX_ITEMS_CAP)
}
/* v40 §D1b — "SILENTLY DROPPING THE LAST N ITEMS IS THE ONE OPTION THAT SHOULD NOT EXIST."
   That is the handoff's sentence, and after §D1a/§D1c the drop is no longer silent — it is warned
   at the plan, blocked at the verdict and named in the headline. But loud is not the same as
   CHOSEN: the engine still decides WHICH items die, and it decides by array order, so the tail of
   the architect's list falls off. On wf_7ad48f08-5dc the tail happened to be defect classes 3 and
   4 of 6, and nothing about "last in the list" made them the right two to lose.
   {strictScope:true} refuses instead, and names the number that would let it run. It is OPT-IN
   because a truncated run is very often exactly what is wanted — this refuses to let the engine
   make that call on the caller's behalf when the caller has said not to. */
if (STRICT_SCOPE && trimmedFromPlan.length) {
  const _need = SPENT + PLANNED_N * (1 + (MAXQ ? 0 : 1) + activeLenses().length) * MAXROUNDS + GATE_COST + RESERVE_COST
  log(`⛔ STRICT SCOPE — REFUSING A PARTIAL SWEEP. The plan had ${PLANNED_N} item(s); only ` +
      `${items.length} fit under the ${MAX_AGENTS}-agent cap, and {strictScope:true} says do not ` +
      `choose for you.`)
  log(`  NOT SWEPT: ${trimmedFromPlan.join(', ')}`)
  log(`  Re-run with {maxAgents:${_need}} to sweep all ${PLANNED_N}, or narrow the brief yourself.`)
  return bail({ error: 'strict-scope',
    verdict: `REFUSED — the plan needs ~${_need} agents and the cap is ${MAX_AGENTS}; ` +
             `{strictScope:true} refuses to pick which ${trimmedFromPlan.length} item(s) to drop`,
    planned: PLANNED_N, would_run: items.length, not_swept: trimmedFromPlan.slice(),
    need_max_agents: _need })
}
/* v21.1 — COUNT THE TIERS THAT WILL ACTUALLY BE BOUGHT, NOT THE ONES THAT WERE ASKED FOR.
   v20 fixed the GATING of the parenthetical (it no longer claims quality=max on a lean run) and
   left the halves of the line contradicting each other anyway: the counts came straight off
   `item.tier` — the ARCHITECT'S REQUEST — while the parenthetical described the EFFECTIVE tier. On
   a max run that printed, in one breath, `1 haiku / 0 sonnet / 0 opus (all built by Opus at
   quality=max)`. Both halves true, read together nonsense — the same defect class as the terrorized
   alvl on a TZ card, and as the four MAXQ strings v20 fixed, one layer down. Found by the round-2
   audit critic; the fix is to route the counts through tierFor(), the SAME function the spawn uses,
   so the log cannot drift from the spend. One function, one answer. */
/* v40 §D3 — set AFTER every trim above, so a builder is never told a sibling is coming that the
   ceiling already dropped. A promised collaborator who never spawns is a worse seam than none. */
globalThis.__planSiblings = items.map(i => ({ file: i.file, instruction: i.instruction }))
const _effTier = it => tierFor(it.tier, it.risk)
const _tierN   = t  => items.filter(i => _effTier(i) === t).length
log(`Plan "${plan.version_label}": ${items.length} items — ` +
    `${_tierN('haiku')} haiku / ${_tierN('sonnet')} sonnet / ${_tierN('opus')} opus` +
    ((MAXONLY) ? ' (effective tiers — quality=max builds everything at Opus)'
      : LEANQ ? " (effective tiers — quality=lean honours the architect's tier on risk:low items, floored at sonnet; opus otherwise)"
      : ' (effective tiers — cost-scaled ladder, escalates on rework)'))
log(`v30 itemCap=${MAX_ITEMS_CAP} (quality routing) · volumeArc=${LOOKS_LIKE_VOLUME_ARC}` +
    (trimmedFromPlan.length ? ` · trimmedFromPlan=${trimmedFromPlan.length}` : ''))
if (LOOKS_LIKE_VOLUME_ARC && MAXONLY) {
  log('⚠ v30: volume-arc task under MAX — expect PARTIAL; schedule remaining stamps as lean follow-ups.')
}

/* ── v11 — FEASIBILITY, ANNOUNCED BEFORE THE MONEY IS SPENT (max only) ───────────────────────────
   The ceiling is honest but it is a TRIPWIRE: it tells you the run was truncated only once it has
   already truncated it, three quarters of the way in. The arithmetic that predicts it is available
   the moment the plan exists. This does NOT refuse — a truncated run is often exactly what the human
   wants. It refuses to let the truncation be a SURPRISE.
   v21 — AND IT IS ANNOUNCED AT EVERY QUALITY NOW, NOT ONLY AT MAX. Standard deliberately does not
   take the plan-level TRIM (see the comment above it: its per-item cost is different and shrinking
   its plans would be a behaviour change nobody asked for) — but that decision was silently also
   withholding the WARNING, which costs nothing and refuses nothing. So a standard run whose plan
   could never fit found out the same way v1635 did: three closing gates reporting "the ceiling was
   already spent". This changes NO behaviour at standard — it prints the arithmetic, with standard's
   real per-item cost (1 build + 1 Fable gate + its skeptics), and sets __infeasible so the payload
   carries it. Nothing is trimmed here that was not trimmed before. */
{
  const skeptN   = activeLenses().length
  const FABLE    = MAXQ ? 0 : 1            // standard buys a Fable merge gate per item; max's panel IS the gate
  const GATES    = GATE_COST               // v18.3 — the SAME number the trim reserved, not a second copy
  const RESERVE2 = RESERVE_COST
  const perAgent = (1 + FABLE + skeptN) * MAXROUNDS
  const worst    = SPENT + items.length * perAgent + GATES + RESERVE2
  // v40 §D1a — the worst case for what was PLANNED, which is the question this block is asking.
  const worstPlanned = SPENT + PLANNED_N * perAgent + GATES + RESERVE2
  log(`FEASIBILITY → ${items.length} item(s) x (1 build${FABLE ? ' + 1 Fable gate' : ''} + ${skeptN} skeptic(s)) x up to ${MAXROUNDS} round(s) ` +
      `+ ${GATES} gates + ${RESERVE2} reserved ≈ ${worst} agents worst-case, against a ceiling of ${MAX_AGENTS}.`)
  if (trimmedFromPlan.length) {
    log(`⚠ THE PLAN WAS ${PLANNED_N} ITEM(S); ${items.length} SURVIVED THE CEILING. The line above ` +
        `describes what will RUN, not what was ASKED FOR. As planned it needed ≈${worstPlanned} agents ` +
        `against a cap of ${MAX_AGENTS}.`)
    log(`  NOT SWEPT (${trimmedFromPlan.length}): ${trimmedFromPlan.join(', ')}`)
    log(`  To sweep all ${PLANNED_N}, re-run with {maxAgents:${worstPlanned}}. To choose what goes ` +
        `rather than letting the tail fall off, re-run with {strictScope:true} — it refuses instead of trimming.`)
    globalThis.__infeasible = { worst: worstPlanned, cap: MAX_AGENTS, items: PLANNED_N,
      skeptics: skeptN, trimmed: trimmedFromPlan.slice(), survived: items.length }
  }
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
/* v22 — tiny skips the third eye's PLAN seat, and only that seat. There is no plan to review: the
   caller wrote the work list and the architect never ran, so this seat would be asking a second
   opinion on the user's own instruction. Seats 2-4 (the skeptic panel, the render gate's pictures
   and the pre-ship verdict challenge) all still sit — those read the DIFF, which nobody has seen
   yet, and the skeptic seat is the one that caught a real type-flip bug this session. */
/* ⚠ v36 §C1 — THE PLAN SEAT WAS A DECORATION: ITS ANSWER WAS THROWN AWAY.
   This call had no assignment. `await thirdEyeAsk('plan', ...)` — return value discarded, nothing
   read it, nothing could act on it. So the third eye could say "this plan solves the wrong problem"
   and the fleet built that plan anyway, at full cost, and the run still reached the Ship phase.
   The seat DID reach the ledger (thirdEyeAsk pushes itself), but THIRD_EYE_SEATS was only ever read
   AFTER `SHIPPABLE` was computed — so even the ledger could not turn a refusal into a verdict.
   That is the exact defect class this whole file exists to kill: a gate that observes and cannot
   refuse (the same shape as the 3-skeptic gate that ran on a 1-skeptic panel). The pre-ship seat
   below has had teeth since v18; the plan seat — the CHEAPEST leverage in the run, one call before
   a single builder spends anything — had none.
   WHY THIS ONE BAILS INSTEAD OF JUST RAISING A BLOCKER: a blocker here would be honest but useless.
   BLOCKERS is not read until SHIPPABLE, thousands of lines and an entire fleet later, so the run
   would still buy every builder, every skeptic and every gate to reach a verdict that was already
   decided. The whole value of reviewing the plan BEFORE Build+Gate is not spending that money.
   bail() is the correct exit: it releases the workspace lock (v32 §1.3) rather than holding the
   tree for the full TTL, and it carries the blocker and the seat ledger out in the payload.
   ONLY a reached seat can block. An unreachable transport is silence, and silence is not a refusal —
   that would let a dead Grok CLI abort every run on this machine. Advisory severities (minor/major)
   stay in the ledger and reach the report; only 'blocking' — which the prompt reserves for a
   concrete, demonstrable defect — stops the fleet. */
if (USE_GROK && !TINYQ) {
  phase('Third-eye')
  const planSeat = await thirdEyeAsk('plan',
    `You are the independent second opinion on an implementation plan. You are a DIFFERENT model from ` +
    `the one that wrote it — that is exactly why you were asked.\n\nTASK: ${TASK}\n\nPLAN:\n` +
    items.map(i => `- [${i.tier}] ${i.file}: ${i.instruction}`).join('\n') +
    `\n\nWhat is wrong with this plan? Look for: the wrong problem being solved, a step that cannot ` +
    `work as described, a missing step whose absence only shows up later, and any assumption that has ` +
    `not been checked. Reply with your top 3 concerns, or say plainly that you have none — an empty ` +
    `answer to be agreeable is worthless here.\n` +
    `Set severity:'blocking' ONLY if building this plan would be a concrete, demonstrable mistake — ` +
    `the wrong problem, or a step that provably cannot work. THAT ANSWER STOPS THE FLEET BEFORE IT ` +
    `SPENDS ANYTHING, so it is worth using when it is true and worth withholding when it is taste. ` +
    `A preference about ordering or style is 'minor' — it will be recorded and read, not obeyed.`,
    'Third-eye')
  /* ⚠ v36.1 — WHAT ACTUALLY FIRES THIS, SAID PLAINLY. `severity` is not Grok's word. It is an enum
     filled in by the SONNET COURIER that relayed Grok's plain-text reply, and this file's own v19.3
     note already concedes that a prompt forbidding a courier from injecting its own opinion "is not
     a guarantee". Raising a blocker on that basis was already the pre-ship seat's behaviour; making
     it ABORT THE FLEET raises the stakes of a courier mistake from a note to a kill switch, so the
     bar has to rise with it. Three conditions now, not one:
       · reached — silence is not a refusal (a dead transport must not abort every run);
       · concerns[] non-empty — a veto must carry the WORDS it is vetoing on. A bare enum with no
         stated objection is exactly what a confused courier emits, and it is worthless to the human
         who has to decide whether to re-run;
       · verdict not 'no concerns' — the schema has BOTH a verdict enum and a severity enum, and
         nothing reconciled them. `verdict:'no concerns'` beside `severity:'blocking'` is a seat
         contradicting itself; two checks disagreeing IS the finding, and the safe reading of a
         self-contradictory veto is to let the run continue and let the ledger carry the concern.
     Raised by the third eye against this very change, which is the seat working as intended. */
  const _planVeto = planSeat && planSeat.reached && planSeat.severity === 'blocking' &&
                    (planSeat.concerns || []).length > 0 && planSeat.verdict !== 'no concerns'
  if (_planVeto) {
    blocker('THE PLAN SEAT RETURNED A BLOCKING REFUSAL',
      `plan seat (${planSeat.transport}, relayed by the courier): ` +
      `${planSeat.concerns.slice(0, 3).join(' · ')}`)
    log('⛔ ABORTING BEFORE BUILD — the plan seat came back blocking. Nothing was built, ' +
        'nothing was spent on builders, and the workspace lock is being released.')
    return bail({
      refused: 'the plan seat returned a blocking refusal',
      third_eye_plan_seat: planSeat,
      /* Deliberately the same SHAPE as the end-of-run thirdEye block, and deliberately marked
         partial: this exit happens before the run's own ledger consts exist, so it must not look
         like the full accounting. Naming it `partial_ledger` stops a reader treating the two as
         the same object. */
      thirdEye: { partial_ledger: true, seats: THIRD_EYE_SEATS,
                  reached: THIRD_EYE_SEATS.filter(s => s.reached).length,
                  attempted: THIRD_EYE_SEATS.filter(s => s.ran).length,
                  of: THIRD_EYE_SEATS.length },
      /* ⚠ THE OLD WORDING HERE WAS "an independent model (different family) refused the plan", and
         that is a claim about the MECHANISM which the mechanism does not support — the enum was
         written by a same-family courier relaying Grok, not by Grok. Overclaiming the provenance of
         a veto is the same defect as overclaiming a review. Say what is true: a seat came back
         blocking, with these words, relayed over this transport. */
      verdict: 'BLOCKED — the plan seat returned severity:blocking before any work began ' +
               '(relayed by a courier from the third-eye transport; see third_eye_plan_seat for the ' +
               'command and raw stdout it evidenced)',
      fix: 'address the concerns and re-run, or re-run with {thirdEye:false} if you have judged the ' +
           'objection wrong — but do that deliberately, not by accident',
    })
  }
}

// 3) BUILD + GATE (pipeline, no barrier — each item gates the moment its build lands)
// Skeptics ride along ONLY when triage judged the cost of being wrong high. On the run that found
// two real counting bugs in a time-tracker they earned their keep; on a CSS fix they are pure spend.
// An EXPLICIT {skeptics:N} must survive a dead triage agent: SKEPTICS_OVERRIDE is only folded into
// __triage inside `if (triage)`, so when triage returned null the user's own request evaporated and
// the run bought no adversarial gate at all — silently.
const SKEPTICS = activeLenses().length
// ⚠ v22.2 — THIS BLOCK MUST STAY BELOW `const SKEPTICS`. Placed above it, `node --check` passes
// and the script throws ReferenceError: Cannot access 'SKEPTICS' before initialization at RUNTIME —
// the exact TDZ that --check cannot see and that load_harness.mjs exists to catch. It did.
/* ── v22.2 — EVERY RUN SAYS WHICH PHASES IT WILL ACTUALLY OPEN ───────────────────────────────────
   `meta.phases` MUST be a pure literal (the engine parses it before the script runs), so it declares
   all 13 for every quality and the progress display lists all 13 whatever you asked for. A tiny run
   opens six; lean and standard never open Completeness; nothing opens Merge without {isolate:true};
   Rework only exists if something fails. So the unopened ones sit at "Not started yet" forever and
   the run reads as STUCK.
   Konyo, watching a tiny run at 14 minutes: "it feels funny.. i cant see it like going to 30minutes
   like this and finishing". He was right that the display was lying; he was wrong that it was stuck;
   and NEITHER of us could tell from the counter — which is the real defect. Then: "check the other
   workflows for this logic all relevant to their own coding" — because tiny is not special here,
   it is just the worst case.
   meta cannot be computed, but a LOG LINE can. This is derived from the SAME flags that gate the
   phase() calls below (TINYQ / MAXONLY / USE_GROK / ISOLATE / APPLY / SKEPTICS), so it cannot drift
   from them the way a hand-written list would. A bound that is enforced but never reported is
   indistinguishable from no bound at all — that has been the lesson of this whole arc. */
const PHASE_PLAN = (() => {
  const open = ['Preflight']
  if (!TINYQ) open.push('Triage')
  if (!(TINYQ || HAS_CALLER_ITEMS)) open.push('Architect')
  if (USE_GROK && !TINYQ) open.push('Third-eye')
  open.push('Build+Gate')
  if (SKEPTICS > 0) open.push('Adversarial gate')
  if (ISOLATE) open.push('Merge')
  if (MAXONLY) open.push('Completeness')
  open.push('Reachability')
  if (APPLY) open.push('Render gate', 'Fat version bar')
  if (!TINYQ) open.push('Synthesize')
  /* v23 — Ship is CONDITIONAL ON A VERDICT THAT DOES NOT EXIST YET, so it is announced honestly as
     "only if clean" rather than promised. Announcing it flatly would be the same defect as the
     banner that advertised completeness rounds a lean run never bought. */
  if (APPLY) open.push('Ship (only if every gate passes)')
  const ALL = ['Preflight','Triage','Architect','Third-eye','Build+Gate','Adversarial gate','Rework',
               'Merge','Completeness','Render gate','Fat version bar','Reachability','Synthesize','Ship']
  /* v32 §(c1) — 'Ship' WAS REPORTED AS "NOT OPENED" ON EVERY RUN THAT THEN PUSHED. The line above
     pushes the DECORATED label 'Ship (only if every gate passes)', while this filter matched the
     plain token 'Ship' — which never appears in `open`. So the honest decoration added for v23
     silently moved Ship into the SKIPPED list, and the run announced it would not do the one thing
     it was about to do. Match on the BASE title (decoration stripped) and keep the decoration for
     display. Exactly the defect class this whole session kept finding: a correct value filed under
     a name that stopped matching. [[label-outlived-referent]] */
  const openBase = open.map(t => t.replace(/\s*\(.*\)\s*$/, ''))
  return { open, skip: ALL.filter(t => openBase.indexOf(t) < 0) }
})()
log(`PHASES THIS RUN WILL OPEN (${PHASE_PLAN.open.length}/13): ${PHASE_PLAN.open.join(' → ')}`)
log(`   NOT OPENED (${PHASE_PLAN.skip.length}) — the display still lists them; they are SKIPPED, not pending: ${PHASE_PLAN.skip.join(', ')}`)
log(`   ("Rework" only appears if an item fails its gate.) A phase count is NOT a progress bar — ` +
    `progress is the tree diff and the agent transcripts growing.`)

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
    /* v20.1 — MAXQ is `max || lean`, so this warning said "a MAX run at MAX prices" on every LEAN
       run. Lean is the default; the sentence was false on the most common run in the system. Same
       class as the v20 four. */
    log(`⚠ TRIAGE ASKED FOR ${_sk} SKEPTIC(S), NOT ${LENSES.length} — this is a ${QUALITY.toUpperCase()} run ` +
        `at ${QUALITY.toUpperCase()} prices ` +
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
/* v19 — THE COMPLETENESS LOOP IS THE OTHER LONG TAIL, AND LEAN DOES NOT BUY IT. On the measured max
   run it opened at 13:39 of a run that started at 13:14 and can add whole build+gate rounds after
   every item has already passed. It is the right thing to buy when being wrong is expensive; it is
   the wrong thing to buy when the caller asked for speed. Skipped at lean, and REPORTED as skipped
   with its reason — never silently, because "no gaps found" and "nobody looked for gaps" must not
   read the same. Lean therefore cannot claim completeness, and its verdict clause below reflects it. */
/* v22 — tiny never buys the completeness critic. It is the run's longest tail (it can open whole
   new build+gate rounds AFTER every item has passed), and a 4-item brief has no hidden scope to
   hunt. Reported as not-run, exactly like lean, so nobody reads silence as 'nothing was missing'. */
if (MAXONLY) {
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
/* ── v40 §D3 — THE UNJOINED SEAM, NAMED BEFORE THE GATE GOES LOOKING FOR IT ────────────────────
   Every builder now declares what it PROVIDED for a sibling and what it CONSUMED from one. Those
   two lists are the same seam seen from its two ends, so a provide with no matching consume is an
   end that was built and never joined — the exact defect LAW19 found by hand on wf_7ad48f08-5dc,
   available here from the run's own bookkeeping.
   THIS DOES NOT REPLACE LAW19 AND MUST NOT. It is the fleet's SELF-REPORT, and a builder that
   forgot to declare a seam is precisely the builder whose seam is most likely dead — so this is
   handed to LAW19 as a LEAD, and LAW19 still does its own independent sweep of the diff. A
   self-report treated as a verdict would be the proxy that PROOF exists to refuse. */
const SEAMS = { provided: [], consumed: [], unjoined: [] }
for (const r of (results || [])) {
  const b = r && r.build; if (!b) continue
  for (const x of (b.provides || [])) SEAMS.provided.push({ file: r.item.file, decl: String(x).slice(0, 200) })
  for (const x of (b.consumes || [])) SEAMS.consumed.push({ file: r.item.file, decl: String(x).slice(0, 200) })
}
// A crude symbol key: the first identifier-ish token of the declaration, which is how both ends
// were asked to write it ("symbol — who should call it"). Deliberately loose; it produces LEADS.
const _sym = d => (String(d).match(/[A-Za-z_][\w.]*/) || [''])[0].toLowerCase()
const _consumedSyms = new Set(SEAMS.consumed.map(c => _sym(c.decl)))
for (const p of SEAMS.provided) {
  if (p.decl && !_consumedSyms.has(_sym(p.decl))) SEAMS.unjoined.push(p)
}
if (SEAMS.provided.length || SEAMS.consumed.length) {
  log(`🔌 SEAMS declared by the fleet: ${SEAMS.provided.length} provided, ${SEAMS.consumed.length} consumed.`)
  if (SEAMS.unjoined.length) {
    log(`⚠ ${SEAMS.unjoined.length} PROVIDED SEAM(S) THAT NO SIBLING CLAIMED TO CONSUME — handing to LAW19 as leads, ` +
        `NOT as a verdict:`)
    for (const u of SEAMS.unjoined) log(`   · ${u.file} provides: ${u.decl}`)
  }
}
const SEAM_LEADS = SEAMS.unjoined.length
  ? `\n\nLEADS FROM THE FLEET'S OWN BOOKKEEPING — treat as SUSPECTS, not findings, and verify each ` +
    `yourself exactly as you would any other symbol. In this run a builder declared it CREATED the ` +
    `following for something else to call, and NO other builder declared it calls them:\n` +
    SEAMS.unjoined.map(u => `  · ${u.file} provides: ${u.decl}`).join('\n') +
    `\nIf one of these has no caller in the repo, that is a seam the FAN-OUT ITSELF created — one ` +
    `agent wrote it, another was supposed to call it, and neither did. Say so explicitly in notes.\n`
  : ''
phase('Reachability')
/* v22 — REACHABILITY AND THE RENDER GATE NOW RUN CONCURRENTLY. They were two separate serial phases
   costing a full agent round-trip each, and they share NOTHING: LAW19 reads the diff, the render
   gate drives the UI. Chaining them was ~4 wasted minutes on every run at every quality.
   Deliberately NOT extended to the fat version bar: LAW17's prompt READS renderGate.failures, so it
   has a real dependency and must stay downstream. Two hops here, not three, and not one.
   The spawn starts here; its verdict is consumed below, after the render gate has also been put in
   flight. Ordering of the LOGS is unchanged, so a reader sees the same sequence as before. */
const reachP = spawn(
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
  `Do NOT fix anything. Report.` + SEAM_LEADS,
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
// 5) SYNTHESIZE (Opus, once) — ONE final ping
// ── THE RENDER GATE (v-render, 2026-08-02) ───────────────────────────────────────────────────────
// A parser cannot see a painted page. Konyo's predicter shipped a MutationObserver loop that froze
// the entire app past a fully green gate — parity, modules, i18n all passing. If the project has a
// way to drive its own UI, use it, and treat a failure as a ship blocker.
let renderGate = null
/* v26 — the loop's own ledger. Reported verbatim so nobody has to infer how many attempts it took,
   and so a run that CONVERGED reads differently from one that simply ran out of passes. */
const renderLoop = { passes: 0, fixes: [], converged: false, stopped: '' }
if (APPLY) {
  phase('Render gate')
  for (let _rp = 1; _rp <= RENDERLOOP; _rp++) {
  renderLoop.passes = _rp
  renderGate = await spawn(
    (_rp > 1
      ? `RE-RENDER — PASS ${_rp} of ${RENDERLOOP}. A fixer agent has just edited the code in ` +
        `response to the previous pass. Your job is unchanged: render it and report what you SEE ` +
        `now. Do NOT assume the fix worked and do NOT soften an assertion to let it through — the ` +
        `whole value of a second look is that it can still say no. Re-check the SAME surfaces that ` +
        `failed, and the ones that passed, because a fix can break a neighbour.\n` +
        `WHAT THE LAST PASS REPORTED (fix attempted since):\n` +
        (Array.isArray(renderGate && renderGate.failures) ? renderGate.failures : [])
          .slice(0, 8).map(f => `  · ${f}`).join('\n') + '\n' +
        `WHAT THE FIXER SAYS IT CHANGED: ${(renderLoop.fixes[renderLoop.fixes.length - 1] || {}).what || '(nothing reported)'}\n\n`
      : '') +
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
    /* v26 — LOOKING AT THE RENDER IS NOT ENOUGH IF YOU ALWAYS LOOK AT THE SAME RENDER.
       Measured this session, and it is the reason this paragraph exists: a TZ zone name rendered
       "Worldston / e Keep" — the name box was 134px against a 139px word, because a badge sharing
       its flex row was allowed to squeeze it. At the suite's own 1470px viewport the slot fits ONE
       column, every name has room, and the defect DOES NOT EXIST. It only appears at 1920px, where
       the panel goes two-up and each card halves. The gate was green, the screenshot was clean, and
       the bug was on his screen. A width is as much a fixture as a data stub is. */
    `RENDER AT MORE THAN ONE WIDTH — a single viewport is a fixture, and a layout defect that only ` +
    `exists at one size is invisible to it. Run the geometry assertions at a NARROW and a WIDE ` +
    `viewport (1280x900 and 1920x1200 are good defaults; add the project's own breakpoints if it ` +
    `declares any, and prefer widths where a grid changes column count, because that is where ` +
    `squeeze bugs live). Report the width beside every failure — "at 1920: <what>" — and capture a ` +
    `screenshot at EACH width, not just one. If a surface is width-independent, say so once rather ` +
    `than measuring it twice. ` +
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
          failures:  { type: 'array', items: { type: 'string' }, description: 'failures THIS CHANGE is responsible for. A failure you have PROVEN pre-existing belongs in pre_existing[], not here.' },
          /* v33 — A GATE THAT CANNOT SAY "THIS WAS ALREADY BROKEN" BLOCKS EVERY HONEST SHIP.
             v32 §(c4) correctly stopped `passed:true` with a non-empty failures[] from converging —
             a pass carrying failures is a contradiction. But it had no way to express the OTHER
             true state: "I found four failures, I PROVED all four exist identically on HEAD, and
             none is mine." v1693 hit exactly that: a MutationObserver roster gap, a JS-syntax gate
             that self-indicts as an instrument failure on a file the ship never touched, and a 2px
             text-line overlap shown byte-identical on HEAD by a differential probe. All four were
             proven pre-existing and the ship was blocked anyway.
             ⚠ THIS MUST NOT BECOME A LOOPHOLE, so it is built like `images_na_reason`: the claim
             costs ONE SENTENCE OF PROOF, and silence costs a blocker. An entry here without a
             `proof` is counted as a REAL failure — the honest default, because "it was already
             broken" is the single easiest thing for a gate to say and the hardest to check. */
          pre_existing: { type: 'array', description: 'v33 — failures PROVEN to exist on HEAD too, i.e. not introduced by this change. Each needs its proof or it counts as a real failure.', items: { type: 'object', properties: {
            failure: { type: 'string', description: 'the failure, worded as it appears in failures[]' },
            proof:   { type: 'string', description: 'HOW you proved it pre-existing — e.g. "differential probe: same 2504px overlap at the same geometry against `git show HEAD:bible.html`", or "grep shows the symbol is 2,800 lines from this diff and absent from it". A restatement of the failure is NOT a proof.' },
          } } },
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

  /* ── v26 · THE CORRECTION HALF OF THE LOOP ───────────────────────────────────────────────────
     Clean means every one of: the gate ran, it passed, and no image it opened depicts the wrong
     thing. That last clause matters — `passed` is the agent's own summary, while a matches:false
     image is a BLOCKER the wiring below raises independently, so a pass that ships a wrong picture
     must not be allowed to end the loop as a success. */
  const _rf = Array.isArray(renderGate && renderGate.failures) ? renderGate.failures : []
  const _ri = Array.isArray(renderGate && renderGate.images) ? renderGate.images : []
  const _rWrong = _ri.filter(i => i && i.matches === false)
  /* v32 §(c4) — A "PASS" CARRYING FAILURES USED TO END THE LOOP AS A SUCCESS. This tested
     `passed && !_rWrong.length` — it had already learned that a wrong IMAGE must not converge the
     loop, but it never checked `failures[]`. So a gate reporting `passed:true` alongside a
     non-empty failures[] converged, blocked nothing, and shipped. `passed:true` with failures is
     not a pass, it is a CONTRADICTION — and the standing rule here is that the contradiction IS
     the finding: refuse and report both halves, never let one silently win.
     [[feedback-contradiction-is-the-finding]] */
  /* v33 — the convergence test and the blocker must narrow by the SAME rule, or the loop stops for
     a failure the blocker excuses (or worse, converges on one it does not). Two formulas for one
     decision is the v18.3 bug this file already carries a scar for. */
  const _rPre = new Set(((renderGate && Array.isArray(renderGate.pre_existing)) ? renderGate.pre_existing : [])
    .filter(p => p && String(p.failure || '').trim() && String(p.proof || '').trim())
    .map(p => String(p.failure).trim()))
  const _rfOwn = _rf.filter(f => !_rPre.has(String(f).trim()))
  const _rClean = !!(renderGate && renderGate.available && renderGate.passed
                     && !_rWrong.length && !_rfOwn.length)

  if (!renderGate) { renderLoop.stopped = 'the gate did not return'; break }
  if (!renderGate.available) { renderLoop.stopped = 'no UI verification in this project'; break }
  if (_rClean) {
    renderLoop.converged = true
    renderLoop.stopped = _rp === 1 ? 'clean on the first render' : `clean after ${_rp - 1} correction(s)`
    if (_rp > 1) log(`✅ RENDER LOOP CONVERGED on pass ${_rp} — ${_rp - 1} correction(s) applied.`)
    break
  }
  /* Count the wrong pictures alongside the failures in every message. A gate can report passed:true
     with an empty failures[] and STILL be dirty because an image depicts the wrong thing — measured
     in the loop's own tests, where that case printed "failed with 0 failure(s)" and read like a bug
     in the loop rather than the defect it had correctly refused to ship. */
  const _rOpen = `${_rf.length} failure(s)${_rWrong.length ? ` + ${_rWrong.length} wrong image(s)` : ''}`
  if (_rp >= RENDERLOOP) {
    renderLoop.stopped = `ran out of passes (${RENDERLOOP}) with ${_rOpen} still open`
    log(`⛔ RENDER LOOP EXHAUSTED after ${RENDERLOOP} pass(es) — ${_rOpen} remain.`)
    break
  }
  /* Bounds BEFORE opening a correction, because a fixer + a re-render is two more agents and the
     last two are reserved for the report and the lock release. A loop that eats its own reserve
     leaves the tree locked for the full 180-minute TTL, which is far worse than an unfixed defect. */
  if (SPENT >= Math.max(1, MAX_AGENTS - 4)) {
    renderLoop.stopped = `ceiling — ${SPENT}/${MAX_AGENTS} agents spent, correction not affordable`
    log(`⚠ RENDER LOOP STOPPED: ${renderLoop.stopped}`)
    break
  }
  if (budget.total && budget.remaining() < FLOOR) {
    renderLoop.stopped = `budget — ${Math.round(budget.remaining() / 1000)}k left, under the ${Math.round(FLOOR / 1000)}k floor`
    log(`⚠ RENDER LOOP STOPPED: ${renderLoop.stopped}`)
    break
  }

  log(`🔁 RENDER LOOP pass ${_rp}/${RENDERLOOP} failed with ${_rOpen} — correcting.`)
  const _fix = await spawn(
    `RENDER FIX — pass ${_rp} of ${RENDERLOOP}. Task: ${TASK}\n` +
    `The render gate just LOOKED at this UI and found the failures below. Fix them in the code.\n\n` +
    `FAILURES (each may name the viewport width it was seen at):\n` +
    _rf.slice(0, 12).map(f => `  · ${f}`).join('\n') + '\n' +
    (_rWrong.length
      ? `\nIMAGES THAT DEPICT THE WRONG THING (each is a blocker):\n` +
        _rWrong.slice(0, 6).map(i => `  · ${i.surface || '?'}: claims ${i.claims || '?'}, depicts ${i.depicts || '?'}`).join('\n') + '\n'
      : '') +
    (Array.isArray(renderGate.screenshots) && renderGate.screenshots.length
      ? `\nSCREENSHOTS THE GATE CAPTURED — OPEN THEM. They are the evidence, and they show the ` +
        `defect as the user sees it:\n` + renderGate.screenshots.slice(0, 6).map(s => `  · ${s}`).join('\n') + '\n'
      : '\n(the gate captured no screenshot — work from the failure text)\n') +
    (renderGate.notes ? `\nGATE NOTES: ${renderGate.notes}\n` : '') +
    `\nRULES, and they are what keep this loop honest:\n` +
    `· FIX THE CODE, NEVER THE ASSERTION. Weakening a check, widening a tolerance, deleting a ` +
    `spec or special-casing the gate's own selector is the one failure mode this loop could ` +
    `introduce that we did not have before. If a failure is the GATE being wrong rather than the ` +
    `UI, do not edit anything — report it in unfixable[] and say why.\n` +
    `· DIAGNOSE BEFORE EDITING. A layout failure that only appears at one width usually has a ` +
    `cause a step up the tree (a flex sibling, a min-width, an intrinsic size), not at the element ` +
    `that visibly broke. Measure with the project's own tooling; do not guess from the screenshot.\n` +
    `· STAY IN SCOPE. Fix these failures and nothing else — no drive-by refactor, no reformatting.\n` +
    `· ⛔ NEVER \`git push\`, and do not bump a version — the ship gate downstream owns both.\n` +
    /* v32 §(b) — COMMIT WHAT YOU FIX, OR THE SHIP GATE CANNOT RUN. This rule used to say only
       "never push, do not bump" and said NOTHING about committing. But the ship agent ABORTS when
       `git status --porcelain` is non-empty and is explicitly forbidden from committing on the
       fixer's behalf ("Do NOT commit it yourself — report it and stop"). So every run whose render
       loop edited a file reached the ship gate with a dirty tree and refused: the render loop's
       SUCCESS path was the one path that could never ship.
       ⚠ It did not fail every time, and that is the worse half — agents sometimes committed of
       their own accord (v1691 landed four commits and ended with a clean tree), so the contract
       held BY LUCK. A safeguard that depends on an agent choosing well is a suggestion, which is
       the same lesson the lock key already taught this file.
       Committing here is also the honest ordering: the NEXT render pass then validates the
       COMMITTED state, so what the final pass grades is exactly what would ship. */
    `· ✅ COMMIT what you changed, in this repo, with a one-line message naming the failure you ` +
    `fixed. Do NOT leave it in the working tree: the ship gate REFUSES a dirty tree and is ` +
    `forbidden from committing for you, so an uncommitted fix silently blocks the whole run. ` +
    `Commit only the files you actually edited — never \`git add -A\` over someone else's work. ` +
    `If you changed nothing, commit nothing.\n` +
    `· If you cannot fix one, that is a fine answer: list it in unfixable[] with the reason. An ` +
    `honest miss costs a blocker; a fake fix costs the next render pass AND the trust in it.\n` +
    `Report exactly what you changed — the next render pass is told your answer and re-checks it.`,
    { effort: TINYQ ? 'medium' : 'high', phase: 'Render gate', model: MAXQ ? 'opus' : undefined,
      schema: { type: 'object', additionalProperties: false,
        required: ['changed', 'what', 'files', 'unfixable'],
        properties: {
          changed:   { type: 'boolean', description: 'true only if you actually edited a file' },
          what:      { type: 'string', description: 'what you changed and WHY it addresses the failure — one or two sentences, passed verbatim to the next render pass' },
          files:     { type: 'array', items: { type: 'string' }, description: 'absolute paths you edited' },
          unfixable: { type: 'array', items: { type: 'string' }, description: 'failures you did NOT fix, each with the reason (including "this is the gate being wrong")' },
        } } }
  )
  renderLoop.fixes.push({
    pass: _rp,
    what: (_fix && _fix.what) || '(the fixer returned nothing)',
    files: (_fix && _fix.files) || [],
    unfixable: (_fix && _fix.unfixable) || [],
    changed: !!(_fix && _fix.changed),
  })
  if (_fix && Array.isArray(_fix.unfixable) && _fix.unfixable.length) {
    _fix.unfixable.slice(0, 4).forEach(u => log(`   ↳ not fixed: ${u}`))
  }
  /* NO PROGRESS ⇒ STOP. Re-rendering unchanged code cannot produce a different picture, so another
     pass would spend two agents to reprint the same failures and, worse, would read in the report
     like the loop tried again. */
  if (!_fix || !_fix.changed) {
    renderLoop.stopped = _fix ? 'the fixer changed nothing — re-rendering would print the same result'
                              : 'the fixer did not return'
    log(`⚠ RENDER LOOP STOPPED: ${renderLoop.stopped}`)
    break
  }
  log(`   ↳ fixed: ${String(_fix.what || '').slice(0, 160)}`)
  }
  /* the blocker wiring below reads the FINAL renderGate — the loop buys attempts, never a pass */
  if (renderLoop.passes > 1) {
    log(`🔁 Render loop: ${renderLoop.passes} pass(es), ${renderLoop.fixes.filter(f => f.changed).length} correction(s) — ${renderLoop.stopped}`)
  }
  /* v32 §(c4), SECOND HALF — this branch was gated on `!renderGate.passed`, so a gate reporting
     `passed:true` WITH a non-empty failures[] raised NOTHING. Fixing the loop's convergence test
     alone would have left the run exhausting its passes and then shipping in silence, because the
     thing that raises the blocker is here. A pass carrying failures is a contradiction, and the
     contradiction is what gets reported — both halves, named. */
  /* v33 — subtract the failures PROVEN pre-existing. An entry only counts as proven when it carries
     a `proof` string; without one it stays a real failure, because "it was already broken" is the
     easiest claim a gate can make and the hardest to check. The subtraction is by exact wording, so
     a gate cannot excuse a failure it did not also list. */
  const _preOK = ((renderGate && Array.isArray(renderGate.pre_existing)) ? renderGate.pre_existing : [])
    .filter(p => p && String(p.failure || '').trim() && String(p.proof || '').trim())
  const _preSet = new Set(_preOK.map(p => String(p.failure).trim()))
  const _allFails = (renderGate && Array.isArray(renderGate.failures)) ? renderGate.failures : []
  const _finalFails = _allFails.filter(f => !_preSet.has(String(f).trim()))
  if (_preSet.size) log(`   ↩ ${_preSet.size} failure(s) proven PRE-EXISTING and excluded from the block ` +
    `(${_allFails.length - _finalFails.length} matched by wording; ${_finalFails.length} remain as this ship's).`)
  if (renderGate && renderGate.available && (!renderGate.passed || _finalFails.length)) {
    // `.failures` is guarded: a truncated agent return used to throw a TypeError at top level here,
    // AFTER the entire run had finished, destroying the report it was about to write.
    const _contradiction = renderGate.passed && _finalFails.length
    log(`⛔ RENDER GATE FAILED — ${_finalFails.length} failure(s). SHIP BLOCKER.`)
    if (_contradiction) log(`   ⚠ the gate reported passed:true WHILE listing ${_finalFails.length} failure(s) — ` +
      `that is not a pass, it is a contradiction, and it is reported rather than resolved in the gate's favour.`)
    _finalFails.slice(0, 6).forEach(f => log(`   · ${f}`))
    blocker(_contradiction ? 'RENDER GATE SAID PASS WHILE LISTING FAILURES' : 'RENDER GATE FAILED',
      `${_finalFails.length} failure(s): ${_finalFails.slice(0, 3).join('; ')}`)
  } else if (renderGate && !renderGate.available) {
    /* v32 §(c3) — `available:false` SILENTLY DISABLED THREE GATES. This branch only logged, and
       every downstream check (the image gate, the "nobody looked" blocker, the Grok vision seat)
       is itself gated on `renderGate.available` — so one false flag turned off all of them and the
       run reported no blocker at all. That is the same shape as v15's own lesson, one level up:
       an honest "this project has no UI surface" costs one sentence and passes; SILENCE costs a
       blocker. A reason is accepted from `images_na_reason` or `notes`. */
    const _naWhy = String((renderGate.images_na_reason || renderGate.notes || '')).trim()
    if (_naWhy) {
      log(`⚠ RENDER GATE: no UI verification in this project — nothing was seen painted. Reason given: ${_naWhy.slice(0, 200)}`)
    } else {
      log('⛔ RENDER GATE: reported available:false and gave NO reason — the render gate, the image ' +
          'gate and the vision seat were ALL skipped on one unexplained flag. SHIP BLOCKER.')
      blocker('RENDER GATE DISABLED WITHOUT A REASON',
        'available:false with no images_na_reason and no notes — one unexplained flag silently ' +
        'turned off the render gate, the image gate and the second-family vision seat')
    }
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

// v22 — both gates are now in flight; collect LAW19 here.
let reach = await reachP

/* ⚠ v28 — THE CONCURRENCY PREMISE WAS FALSE, AND IT SHIPPED A BLOCKER ABOUT A FILE THAT
   NO LONGER EXISTED. The v22 comment above says reachability and the render gate "share
   NOTHING: LAW19 reads the diff, the render gate drives the UI." They share the WORKING
   TREE. The render gate is a LOOP with a FIXER that writes to the same files LAW19 is
   reading, so LAW19 graded page.py at +21 lines while the fixer rewrote it to +57.

   Observed on a real repo: LAW19 reported a dead seam with an executed headless-Chrome
   probe as proof, and the third eye caught that the finding described a build that had
   been replaced mid-run — "carrying LAW19 FAILED forward onto this tree grades a corpse,
   not the shipped code." The blocker was real about a file, and the file was gone.

   So: if the render loop APPLIED A FIX, LAW19's verdict is about the pre-fix tree and is
   discarded. It re-runs against what actually shipped. That costs one agent, and only on
   the runs where a fix landed — which are exactly the runs where the first answer cannot
   be trusted. Concurrency is still worth it; pretending the two never collide is not. */
if (renderLoop.fixes.length && reach) {
  log(`↻ REACHABILITY RE-RUN — the render loop applied ${renderLoop.fixes.length} fix(es) ` +
      `after LAW19 read the tree, so its verdict describes a file that no longer exists.`)
  const reachAgain = await spawn(
    `REACHABILITY GATE — RE-RUN. An earlier reachability pass ran CONCURRENTLY with the ` +
    `render gate, and the render gate's fixer then REWROTE the files. That earlier verdict ` +
    `is about a superseded tree and has been discarded — do not read it, do not defend it, ` +
    `and do not assume its findings still hold.\n\n` +
    `Task: ${TASK}\n\n` +
    `Re-answer the ONLY question that matters: is everything added actually REACHED at ` +
    `runtime, ON THE TREE AS IT STANDS NOW? Re-read the files from disk. If the earlier ` +
    `finding has been fixed, say so plainly rather than restating it.\n\n` +
    `Return {"checked":<int>,"dead":[<string>...],"tests_added":<bool>,"tests_proven_run":<bool>} ` +
    `— dead is EMPTY when every new seam is reached. An empty list is the correct answer when the ` +
    `code is correct; inventing a finding to look useful is the failure this re-run exists to undo.\n` +
    `⚠ ANSWER THE TWO TEST FIELDS TOO, on the tree AS IT STANDS NOW: tests_added is whether this ` +
    `run added any test, and tests_proven_run is whether those tests were PROVEN to execute. The ` +
    `render fixer may have touched the tests as well as the source, so these are re-asked rather ` +
    `than carried over. If tests were added and you cannot prove they ran, say tests_proven_run:false ` +
    `— that is a SHIP BLOCKER and it is supposed to be.`,
    { model: 'opus', effort: 'high', label: 'reachability:rerun', phase: 'Reachability',
      /* v32 §(a) — THE RE-RUN USED TO ERASE ITS OWN BLOCKER. This schema was
         `additionalProperties:false` with ONLY {checked, dead}, and the assignment below was a
         whole-object REPLACE. So `reach.tests_added` and `reach.tests_proven_run` became
         `undefined` the moment a re-run happened, and the "tests were added and NOT proven to run"
         blocker further down became structurally unreachable. The trigger is merely
         `renderLoop.fixes.length` — ONE render fix landing was enough to silently delete a gate.
         A narrowed schema that quietly drops a field is the same defect as a null reading as a
         pass, which v13 already had to fix once. */
      schema: { type: 'object', additionalProperties: false,
        required: ['checked', 'dead', 'tests_added', 'tests_proven_run'],
        properties: { checked: { type: 'integer' },
                      dead: { type: 'array', items: { type: 'string' } },
                      tests_added: { type: 'boolean' },
                      tests_proven_run: { type: 'boolean',
                        description: 'false if tests were added and not proven to run' } } } })
  if (reachAgain) {
    log(`↻ LAW19 re-run: ${(reachAgain.dead || []).length} dead seam(s) on the SHIPPED tree ` +
        `(was ${(reach.dead || []).length} on the pre-fix tree)`)
    /* MERGE, NEVER REPLACE — the second half of the same fix. Even with the schema widened above,
       a replace makes every field the re-run does not carry vanish. Spreading the old verdict
       first means a future field added to the FIRST pass and forgotten here degrades to "stale
       value kept" instead of "gate silently deleted". Stale is visible; undefined is not. */
    reach = { ...reach, ...reachAgain }
  } else {
    log(`⚠ LAW19 re-run produced nothing — keeping the stale verdict and saying so, because ` +
        `a gate that silently drops its own finding is worse than one that reports a stale one.`)
  }
}

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

if (!TINYQ) phase('Synthesize')  // v22 — tiny writes its own report in-script
const passed = results.filter(r => r.gate && r.gate.verdict === 'pass')
const failed = results.filter(r => !r.gate || r.gate.verdict !== 'pass')
const logPassLedger = []
if (LOG_PASS && APPLY) {
  for (const r of passed) {
    const f = r.item && r.item.file
    const lie = (r.item && r.item.instruction) || 'proven pass'
    logPassLedger.push(runLogPass(f, `konyo pass: ${f} — ${String(lie).slice(0, 160)}`))
  }
}
/* v22 — TINY WRITES ITS OWN REPORT. The synthesizer is an Opus/high round-trip whose job is to
   INTEGRATE many results into prose. Tiny has at most four items, and every fact the report needs is
   already computed in this script: which items passed, which failed, and the blockers ledger. Paying
   a hop to have a model restate four rows is the last easy hop to delete.
   It is assembled from the SAME fields the payload uses, so the headline cannot disagree with
   `blockers`/`shippable` the way a prose summary can — which is the exact failure v20 found when a
   synthesizer was handed "wentDry=false, stoppedBecause=(went dry)" for a loop that never ran. */
const _tinyFinal = () => ({
  version_label: (plan && plan.version_label) || 'v-tiny-r1',
  headline: BLOCKERS.length
    ? `BLOCKED — ${BLOCKERS.length} blocker(s): ${BLOCKERS.map(b => b.what).slice(0, 3).join('; ')}`
    : failed.length
      ? `PARTIAL — ${passed.length}/${results.length} item(s) passed the gate, ${failed.length} failed`
      : `${passed.length} item(s) built and gated clean`,
  shipped: passed.map(r => `${r.item.file}: ${r.item.instruction}`.slice(0, 300)),
  follow_ups: [
    ...failed.map(r => `FAILED GATE: ${r.item.file} — ${(r.gate && r.gate.reason) || 'no reason given'}`.slice(0, 300)),
    ...BLOCKERS.map(b => `${b.what}: ${b.why}`.slice(0, 300)),
  ],
})
const final = TINYQ ? _tinyFinal() : await spawn(
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
  `PLAN SIZE: ${globalThis.__plannedN ?? '?'} item(s) planned, ${items.length} actually run\n` +
  `TRIMMED FROM THE PLAN (${trimmedFromPlan.length}): ` + (trimmedFromPlan.length ? trimmedFromPlan.slice(0, 8).join(', ') : 'none') + `\n` +
  `REWORK: ${round}/${MAXROUNDS} round(s), stopped_because=${reworkStop}\n` +
  `SKEPTICS: ${SKEPTICS} per item (source: ${SKEPTICS_SOURCE})\n` +
  `QUALITY: ${QUALITY}\n` +
  /* v20 — THE WORST OF THE MAXQ/LEANQ CONFUSIONS, BECAUSE THIS STRING IS THE SYNTHESIZER'S INPUT.
     The completeness loop runs under `MAXONLY`; this line asked only `MAXQ`. So on a LEAN run
     — now the DEFAULT — the synthesizer was handed
       "COMPLETENESS: 0 round(s), 0/2 dry, wentDry=false, stoppedBecause=(went dry)"
     because critStop is null when the loop never opened and `|| '(went dry)'` then invented a reason.
     The structured `completeness` field said `ran:false` the whole time. A payload that knows the
     truth and a summary that contradicts it is the exact defect class this ledger exists to kill,
     and it would have taught the final report that nothing was left unswept. */
  `COMPLETENESS: ` + ((MAXONLY)
    ? `${critRound} round(s), ${dry}/${DRYROUNDS} dry, wentDry=${dry >= DRYROUNDS}, stoppedBecause=${critStop || '(went dry)'}`
    : LEANQ
      ? 'NOT RUN (quality=lean buys no completeness critic — it is the run\'s longest tail). NOBODY hunted for work nobody did, which is NOT the same as finding none. You may NOT describe this run as exhaustive, complete or fully swept; say plainly that completeness was not checked.'
      : 'NOT RUN (quality=standard buys no completeness critic — do not describe the work as exhaustively swept)') + `\n` +
  `GAPS RAISED BUT NEVER BUILT (${unbuiltGaps.length}): ` + (unbuiltGaps.slice(0, 5).join(' | ') || 'none') + `\n` +
  `INFEASIBILITY: ${globalThis.__infeasible ? JSON.stringify(globalThis.__infeasible).slice(0, 400) : '(none flagged)'}\n` +
  `MERGE: ` + (merge ? `${(merge.applied || []).length} applied, ${(merge.failed || []).length} failed`
    : ISOLATE ? 'isolate mode was on but no merge result came back' : 'not run (no {isolate:true})') + `\n` +
  `RULES, not suggestions: a NON-EMPTY blockers list forces the headline to LEAD with "BLOCKED" and ` +
  `name the blocker. A HIT CEILING forces "UNVERIFIED". A dead agent means planned work silently did ` +
  `not happen — say so. You may NEVER report success over a blocker, and you may never describe work ` +
  `that was trimmed, refused or never gated as done.\n` +
  /* v40 §D1c — BLOCKED AND INCOMPLETE ARE NOT ALTERNATIVES, and this prompt used to make them one:
     it said a trimmed list "forces PARTIAL" while the line above forces BLOCKED, so on a run that
     was both — which is exactly wf_7ad48f08-5dc — the synthesiser had two rules and could satisfy
     only one. It chose BLOCKED, correctly, and the four never-swept files left the headline. The
     rule is now ADDITIVE, and it is stated as a sentence the headline must CONTAIN rather than a
     word it must start with, because the leading word is already spoken for. */
  `⚠ INCOMPLETENESS IS ADDITIVE TO THE HEADLINE, NEVER AN ALTERNATIVE TO IT. If the trimmed list ` +
  `above is NON-EMPTY, the headline must ALSO carry — in the same line, whatever else it leads with — ` +
  `how many planned items were never run and that this was therefore NOT a complete sweep. "BLOCKED" ` +
  `and "4 of 6 classes swept" are both true and the reader needs both; a headline that reports only ` +
  `the blocker reads as a finished sweep that found problems, which is a DIFFERENT AND BETTER RUN ` +
  `than the one that happened.\n` +
  `Anything you write of the form "no issues found in X" is FORBIDDEN for any trimmed file: nothing ` +
  `looked at it. Absence of a finding where nothing searched is not evidence of absence.\n` +
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
    // v21 — SEATS BOUGHT, THEN VOTES ACTUALLY CAST. The pre-ship third eye was being handed the
    // seat count as if it were the review count; a short-handed panel is exactly the kind of thing
    // an independent reviewer must be told about rather than have to infer.
    `skeptic panel: ${SKEPTICS} seat(s) bought` +
    `${THIN_PANELS.length ? `, but ${THIN_PANELS.length} panel(s) came up short (` +
      THIN_PANELS.slice(0, 3).map(t => `${t.file}: ${t.cast}/${t.panel} cast`).join('; ') + ')' : ' (all seats voted)'}` +
    `; render gate: ${renderGate ? (renderGate.passed ? 'passed' : 'FAILED') : 'not run'}` +
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

/* ── v23 — THE SHIP PHASE: SOMETHING FINALLY ACTS ON THE VERDICT ────────────────────────────────
   Konyo: "why cant like an opus agent at the end after all the gates ship it ... just to like lock
   it and push automatically inbetween gates? or is that automated not good?"
   It is not just good, it closes a hole v22.4 opened. v22.4 stopped BUILDERS pushing so the closing
   gates could actually block instead of narrating — measured on v1651, where the builder pushed at
   09:36 and the render gate, LAW17 and LAW19 all reported between 09:40 and 09:52, on code already
   live. That fix was right and left the opposite gap: nothing pushes at all, so proven-clean work
   sits local until a human remembers. Worse, the run has always computed `blockers`, `verdict` and
   `shippable` — AND NOTHING EVER READ THEM. A verdict nobody acts on is a narrator too, which is the
   very defect the no-push rule existed to fix, one step further along.
   WHAT MAKES IT SAFE IS THAT IT IS GATED ON THE VERDICT, NOT ON AN AGENT'S OPINION:
     · SHIPPABLE is computed ONCE, here, and the payload below reads the SAME const — never a second
       copy. Two formulas for one decision is the v18.3 bug, where the optimistic one bound.
     · It PUSHES ONLY. It never commits: committing is where content decisions live, pushing is a
       yes/no on an already-frozen result, and one irreversible action with one precondition is the
       only shape worth auditing.
     · NEVER --no-verify, NEVER --force. The repo's own pre-push hook stays a fully independent second
       gate — it blocked a real push today, which is exactly the case this agent must report honestly
       rather than route around.
     · Whatever happens, `shipped` carries pushed + why. A refusal with no stated reason would be the
       same silence this whole arc has been about. */
/* ⚠ v23.1 — THIS IS THE WHOLE PREDICATE, AND IT MUST STAY THAT WAY. My first cut copied only the
   FIRST LINE of the payload's `shippable:` expression, which continued onto a second line with three
   more conditions (SPAWN_ERRORS, THIN_PANELS, and the completeness clause). That would have made the
   Ship gate STRICTLY MORE PERMISSIVE than the verdict it claims to enforce — a run with a dead agent
   or a thin skeptic panel would have reported shippable:false and pushed anyway. It is the v18.3 bug
   exactly (two formulas for one decision, the optimistic one binding), committed while writing the
   comment that warns against it. node --check passed; the load harness caught it. */
// v27 — passed.length > 0: a fleet that built nothing used to be SHIPPABLE (failed=[] is vacuously
// true). Empty success is the same defect class as a gate that never ran reading as a pass.
// v27.1 — APPLY required: a dry-run that proposed diffs is never shippable. shippable:true used to
// mean "gates look clean" including dry-runs, which is how a human reads "ready to push" over a
// run that wrote nothing. Push is already gated on APPLY; the flag must agree.
/* ── v36 §C6 — THE THIRD-EYE LEDGER IS COMPUTED HERE, ABOVE THE VERDICT, NOT BELOW IT ────────────
   THE BUG: these four consts used to be declared ~90 lines BELOW `SHIPPABLE`, next to the log line
   that prints them, and the payload's `thirdEye:{...}` block was assembled further down still. So
   every fact about the independent reviewer — how many seats were bought, how many answered, whether
   the panel came up short — was computed AFTER the verdict it should have been able to inform. The
   field could describe the run; it could never affect it. A dead pre-ship seat was narration.
   That is this file's own recurring defect (a fact that is true in the payload and absent from the
   decision), and it was living inside the safeguard machinery again.
   WHAT MOVED AND WHAT DID NOT: only the DECLARATIONS moved. The log block below still reads these
   same consts and the payload still reads these same consts — there is deliberately no second count
   anywhere. Two formulas for one decision is the v18.3 bug, where the optimistic copy bound.
   WHY SHIPPABLE STILL DOES NOT READ THEM: a silent third eye must not block by itself, and that is
   unchanged and correct — the transport being down says nothing about whether the work is good, and
   a machine-wide grok outage would otherwise abort every run on it.
   ⚠ v36.1 — WHAT THIS MOVE DOES **NOT** BUY, because the first version of this comment claimed it
   and the third eye caught the claim. It said the move makes the seats that carry a verdict raise
   their blocker "before this line reads BLOCKERS.length, instead of after". That was false: the
   pre-ship seat already called blocker() well above SHIPPABLE even in the old layout, and the plan seat
   never reaches SHIPPABLE at all because it bails. Moving the COUNTS never moved the BLOCKERS.
   What the move actually buys is narrower and worth stating honestly: the ledger is a fact about
   the run that is now available at the point the run decides, so any future clause that wants to
   read it CAN, and a reader of this region no longer has to scroll 90 lines past the verdict to
   find out whether anything independent ever answered. A fact computed after the decision it
   describes is the shape this file keeps having to fix; this removes the shape, not a live bug. */
/* ── v40 §D1c — MAKE AN INCOMPLETE RUN IMPOSSIBLE TO MISTAKE FOR A COMPLETE ONE ─────────────────
   This is the handoff's one-line ask, and it is the same defect the run it came from was
   commissioned to hunt: a trimmed plan, a thin panel and a dead seam each produced output that
   READS FINISHED.
   WHAT WAS ALREADY RIGHT, so that none of it is "fixed" away: `trimmedFromPlan` and `CEILING_HIT`
   already suppressed SHIPPABLE, and the verdict LADDER already had a `PARTIAL — N item(s) were
   trimmed` rung. Nothing here loosens either.
   WHAT WAS WRONG IS THE SHAPE OF THE LADDER. It is a chain of ternaries, so it emits EXACTLY ONE
   rung — the first that matches — and `BLOCKERS.length ? 'BLOCKED'` sits at the top. So on any run
   that had a blocker for ANY unrelated reason, the PARTIAL rung was unreachable and the fact that a
   third of the brief was never swept vanished from the one string every reader reads. That is
   precisely what happened on wf_7ad48f08-5dc: verdict `BLOCKED`, four files never swept, two of the
   six named defect classes never looked at, and the word "trimmed" nowhere in the verdict.
   Meanwhile `complete: false` sat in a NESTED key under `ceiling`, which is where the handoff found
   it and where nobody looks: "make complete:false a blocker, not a field".
   THE FIX IS TWO THINGS, AND BOTH ARE MONOTONE — a run can only become MORE blocked, never less:
     1. Incompleteness raises a REAL blocker, so it is in blockers[] with a name and a reason like
        every other refusal, instead of being a boolean a reader has to go and look for.
     2. The suffix is CONCATENATED onto whatever rung the ladder chose, so BLOCKED and PARTIAL can
        be true in the same sentence. A ternary can only pick one fact; incompleteness is not an
        alternative to being blocked, it is an additional thing that is true.
   ⚠ SHIPPABLE IS NOT RECOMPUTED HERE. It already reads `!CEILING_HIT && !trimmedFromPlan.length`
   and is computed once, below; raising a blocker for the same facts cannot make it more permissive.
   Two formulas for one decision is the v18.3 bug and this deliberately is not one — the blocker
   changes what is REPORTED, not what is ALLOWED. */
const NOT_SWEPT = trimmedFromPlan.slice()
const RUN_COMPLETE = !CEILING_HIT && !NOT_SWEPT.length
if (NOT_SWEPT.length) {
  blocker('THE SWEEP WAS NOT COMPLETE — ' + NOT_SWEPT.length + ' PLANNED ITEM(S) WERE NEVER RUN',
    `the plan had ${globalThis.__plannedN ?? '?'} item(s) and ${NOT_SWEPT.length} ` +
    `were trimmed to fit the ${MAX_AGENTS}-agent cap, so THIS RUN DID NOT COVER ITS OWN BRIEF. ` +
    `Never swept: ${NOT_SWEPT.join(', ')}. Any conclusion of the form "nothing was found in X" is ` +
    `unsupported for these files — nothing looked. Re-run with a higher {maxAgents}, or with ` +
    `{strictScope:true} to be refused up front rather than trimmed from the back.`)
}
if (CEILING_HIT && !NOT_SWEPT.length) {
  blocker('THE AGENT CEILING STOPPED THIS RUN EARLY',
    `${SPENT}/${MAX_AGENTS} agents were spent and further spawns were refused, so an unknown amount ` +
    `of the closing work — gates included — never ran. What is reported is what fitted, not what was asked.`)
}
const INCOMPLETE_SUFFIX = NOT_SWEPT.length
  ? ` · ⚠ INCOMPLETE: ${NOT_SWEPT.length} of ${globalThis.__plannedN ?? '?'} ` +
    `planned item(s) were NEVER SWEPT (${NOT_SWEPT.slice(0, 6).join(', ')}` +
    `${NOT_SWEPT.length > 6 ? `, +${NOT_SWEPT.length - 6} more` : ''}) — this is NOT a clean sweep with findings`
  : CEILING_HIT
  ? ` · ⚠ INCOMPLETE: the agent ceiling (${SPENT}/${MAX_AGENTS}) stopped the run early — closing gates may never have run`
  : ''
const TE_ASKED_FOR = THIRD_EYE !== 'off'
const TE_SPOKE = THIRD_EYE_SEATS.filter(s => s.reached)
const TE_SILENT = THIRD_EYE_SEATS.filter(s => s.ran && !s.reached)
/* v36 §C5 — `degraded` WAS ONE BIT FOR N SEATS, AND ONE BIT CANNOT HOLD A PARTIAL PANEL.
   It read `TE_SPOKE.length === 0`: true only when EVERY seat was silent. So a run where one seat of
   four answered — the plan seat reached, the skeptic, render-vision and pre-ship seats all dead —
   reported `degraded:false` and printed "an independent model (different family) reviewed this run".
   Technically one did. The sentence is read as "this run was independently reviewed", and 1/4 is not
   that. The worst version is the pre-ship seat being the dead one: the LAST check, the only one that
   can refuse the final claim, silently absent behind a clean-looking boolean.
   THE FIX IS TO STOP SUMMARISING N SEATS INTO ONE BIT. degraded is now reached < attempted, and the
   counts and the seat names ride alongside it so a reader never has to trust the adjective. */
const TE_ATTEMPTED = THIRD_EYE_SEATS.filter(s => s.ran).length
const TE_PARTIAL = TE_ASKED_FOR && TE_ATTEMPTED > 0 && TE_SPOKE.length > 0 && TE_SPOKE.length < TE_ATTEMPTED
const TE_DEGRADED = TE_ASKED_FOR && TE_ATTEMPTED > 0 && TE_SPOKE.length < TE_ATTEMPTED
const SHIPPABLE = APPLY
  && !BLOCKERS.length && !CEILING_HIT && !trimmedFromPlan.length && !failed.length
  /* v32 §1.1 — TINY COULD NEVER SHIP, AND THE REASON WAS ONE FLAG. This read
     `(!MAXQ || LEANQ || (dry >= DRYROUNDS && ...))`. But MAXQ is `max || lean || TINYQ` (line 117)
     and LEANQ is `lean` ONLY — so on a TINY run both escapes are false and the clause collapses to
     `dry >= DRYROUNDS`. `dry` is only ever incremented by the completeness loop, which is gated on
     MAXONLY (`MAXQ && !LEANQ && !TINYQ`) and therefore NEVER RUNS AT TINY. dry stayed 0, DRYROUNDS
     defaults to 1, so 0 >= 1 was false on every tiny run: a PERFECT tiny run printed
     "NOT SHIPPABLE — the completeness loop did not go dry" about a loop tiny deliberately does not
     buy. The condition must be asked of the SAME flag that gates the loop it is asking about. */
  && !SPAWN_ERRORS.length && !THIN_PANELS.length && (!MAXONLY || (dry >= DRYROUNDS && !unbuiltGaps.length))
  && passed.length > 0
let shipped = { pushed: false, why: 'not attempted' }
if (!APPLY) {
  shipped = { pushed: false, why: 'dry-run — nothing was written, so nothing can ship' }
} else if (!SHIPPABLE) {
  /* ⚠ ENUMERATE EVERY CONDITION IN THE PREDICATE, NOT FOUR OF THE EIGHT.
     This listed blockers, ceiling, trimmed and failed — and SHIPPABLE also depends on
     SPAWN_ERRORS, THIN_PANELS, the completeness clause and passed>0. A run with verdict
     "OK", zero blockers and 3/3 items passed reported `NOT SHIPPABLE — 0 blocker(s). The
     verdict said no` and named nothing, which is precisely the silent refusal the comment
     above this block forbids. A reason list built from a different set of facts than the
     decision is the two-formulas bug in prose form. */
  const _reasons = [
    BLOCKERS.length          && `${BLOCKERS.length} blocker(s)`,
    CEILING_HIT              && 'agent ceiling hit',
    trimmedFromPlan.length   && `${trimmedFromPlan.length} item(s) trimmed from the plan`,
    failed.length            && `${failed.length} item(s) failed their gate`,
    SPAWN_ERRORS.length      && `${SPAWN_ERRORS.length} agent(s) died`,
    THIN_PANELS.length       && `${THIN_PANELS.length} thin skeptic panel(s) — fewer eyes than the seat count claims`,
    !passed.length           && 'no item passed a gate (vacuous green is forbidden)',
    /* v32 §1.1 — MUST MIRROR THE PREDICATE ABOVE, and it did not: this said `MAXQ && !LEANQ`,
       which is TRUE on a tiny run, so tiny was blocked AND told why by a second copy of the same
       wrong test. Two copies of one condition is how the predicate and its explanation drift —
       exactly what the "reason list and decision disagree" fallback below exists to catch. */
    (MAXONLY && !(dry >= DRYROUNDS && !unbuiltGaps.length))
                             && 'the completeness loop did not go dry',
    !APPLY                   && 'dry-run: nothing was written',
  ].filter(Boolean)
  shipped = { pushed: false, why: `NOT SHIPPABLE — ${_reasons.join('; ') ||
    'the predicate is false but no enumerated condition explains it — THIS IS AN ENGINE ' +
    'BUG: the reason list and the decision disagree, and the decision is binding'}. ` +
    `The verdict said no, so the push did not happen.` }
  log(`⛔ NOT PUSHED — ${shipped.why}`)
} else {
  phase('Ship')
  const shipRes = await spawn(
    `SHIP AGENT. Every gate has passed and the verdict is SHIPPABLE. Your ONLY job is to push what is ` +
    `already committed, and to refuse honestly if anything is not as stated.\n\n` +
    `VERIFY FIRST, and ABORT without pushing if any of these is false:\n` +
    `1. \`git status --porcelain\` is EMPTY. An uncommitted file means the verdict graded something ` +
    `that is not what would ship. Do NOT commit it yourself — report it and stop.\n` +
    `2. \`git log origin/main..HEAD\` shows at least one commit. Nothing to push is not a failure; say so.\n` +
    `3. If this project stamps a version, every stamp agrees. A half-bumped tree is the exact state ` +
    `this project's own pre-push gate refuses.\n\n` +
    `THEN: \`git push origin HEAD\`. ⛔ NEVER --no-verify. ⛔ NEVER --force. The repo's pre-push hook is ` +
    `an INDEPENDENT gate and it outranks you: if it rejects the push, that is the correct outcome — ` +
    `capture its exact output, report pushed:false, and DO NOT retry with a flag that skips it.\n` +
    `FINALLY: prove the push landed by comparing \`git rev-parse HEAD\` against \`git ls-remote origin HEAD\` ` +
    `— a push whose exit code was 0 but whose remote did not move has not shipped. Report both hashes.\n\n` +
    `TASK CONTEXT: ${TASK.slice(0, 400)}`,
    { model: 'opus', effort: 'high', phase: 'Ship', label: 'ship:push', schema: {
        type: 'object', additionalProperties: false,
        required: ['pushed', 'why'],
        properties: {
          pushed: { type: 'boolean' },
          why:    { type: 'string', description: 'one line: what happened, and if not pushed, the exact blocking reason' },
          local:  { type: 'string' }, remote: { type: 'string' },
          hook_output: { type: 'string', description: 'the pre-push hook output verbatim if it refused' },
        } } }
  ).catch(() => null)
  if (!shipRes) {
    shipped = { pushed: false, why: 'the ship agent did not return (ceiling refused it or it died) — push by hand' }
    blocker('SHIP DID NOT RUN', 'the verdict was shippable but the push was never attempted')
  } else {
    shipped = { pushed: !!shipRes.pushed, why: shipRes.why || '(no reason given)',
                local: shipRes.local || null, remote: shipRes.remote || null,
                hook_output: shipRes.hook_output || null }
    if (shipRes.pushed) log(`🚀 SHIPPED — ${shipRes.local || '?'} is on the remote.`)
    else {
      log(`⛔ SHIP REFUSED — ${shipped.why}`)
      blocker('PUSH REFUSED', shipped.why + (shipRes.hook_output ? ` · hook: ${String(shipRes.hook_output).slice(0, 300)}` : ''))
    }
  }
}

/* v18 — AND IF IT NEVER SPOKE, SAY SO WHERE THE VERDICT IS READ. A third eye that was requested and
   could not be reached is a DEGRADED run, not a clean one. It does not block by itself — the work may
   be perfectly good — but the summary may never let silence read as approval.
   ⚠ v36 §C6 — THIS LEDGER USED TO BE COMPUTED HERE, AFTER `SHIPPABLE`. It has been MOVED to just
   above the SHIPPABLE formula; this block now only LOGS what was already computed. The lines below
   are deliberately left as a read of the same consts rather than a recount — see the §C6 note at
   the definition site for why a second copy of a decision is the v18.3 bug. */
if (TE_ASKED_FOR && THIRD_EYE_SEATS.length) {
  log(TE_SPOKE.length
    // v36.1 — denominator is TE_ATTEMPTED, matching the payload. The human-facing line was still
    // dividing by THIRD_EYE_SEATS.length while the payload had moved to the honest denominator;
    // two denominators for one ratio is how a report and its own numbers drift apart.
    ? `👁 THIRD EYE: ${TE_SPOKE.length}/${TE_ATTEMPTED} seat(s) answered (${[...new Set(TE_SPOKE.map(s => s.transport))].join(', ')})` +
      `${TE_PARTIAL ? ` — ⚠ PARTIAL PANEL: ${TE_SILENT.length} seat(s) did not answer (${TE_SILENT.map(s => s.seat).join(', ')}). ` +
        `This run was reviewed by an independent model on SOME questions and by nobody on the rest.` : '.'}`
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
/* ══ v38 — CARVE PER ARC, AND IT NOW WRITES ═══════════════════════════════════════════════════════
   v31 captured per round and PROPOSED per arc, and the proposal was where it stopped. Konyo,
   2026-08-15: "take it from half to full .. it needs to be in there."

   WHY THIS IS NOW SAFE, AND WHAT WAS ACTUALLY UNSAFE. The v31 comment gave one hazard for not
   writing: carving prunes shared skill files that agents LOAD, so doing it mid-run rewrites the
   rules underneath running agents. That hazard is real and it is entirely a MID-RUN hazard. Here,
   every round is finished, every gate has reported, no agent will read a skill file again this run.
   The dangerous moment and this moment are not the same moment.

   The second objection — a carve from one run is fitted to one run — is answered by the floor, not
   by refusing to write: THREE scars in one territory, because two is a coincidence. That floor is
   unchanged.

   WHAT IS STILL NOT AUTOMATIC, DELIBERATELY:
     * NOTHING IS DELETED. The carving skill prunes its source; this ARCHIVES instead. Carved scars
       move to SCARS.archive.md. A rule whose evidence was deleted is a rule you cannot argue with
       later, and that is the one property that makes a wrong auto-rule worse than no rule.
     * A DRY RUN CARVES NOTHING. apply:false means agents write nothing — a carve is a write.
     * CAPPED AT TWO PER ARC. Every carved skill's description loads into every future session
       forever. Unbounded carving is a startup-context leak that nobody is watching.
     * {carve:false} opts out entirely.

   ⚠ THE SAFETY LAW SURVIVES THE PROMOTION, VERBATIM: A SCAR NARROWS ATTENTION, IT NEVER SUPPRESSES
   A GATE. A carved skill may tell the next run what has already been tried and failed. It may not
   skip a check, lower a bar, mark anything already-judged, or cache a verdict. The carve prompt
   below states this as a hard constraint because it is now writing a file that every future
   session loads, which makes it the highest-leverage place in this engine to get that wrong. ══ */
const CARVE_MAX = 2
const CARVE = carveCandidates()
let CARVED = { ran: false, reason: 'no carve candidate', written: [] }
if (SCARS.length) {
  log(`SCARS captured this run: ${SCARS.length} (fed forward to later rounds; none of them skipped a gate).`)
  if (!CARVE.length) {
    log('No carve candidate — no single territory failed 3+ times. That is a normal, healthy result.')
  } else if (A && A.carve === false) {
    CARVED = { ran: false, reason: '{carve:false} — proposal only', written: [] }
    log(`🪓 ${CARVE.length} carve candidate(s), NOT carved ({carve:false}): ` +
        CARVE.map(c => `${c.territory} (x${c.n})`).join(' · '))
  } else if (!APPLY) {
    /* Not a silent skip. A dry run that quietly declined to carve reads exactly like a run that
       found nothing to carve, and those are opposite facts. */
    CARVED = { ran: false, reason: 'dry run — apply:false writes nothing, and a carve is a write', written: [] }
    log(`🪓 ${CARVE.length} carve candidate(s) found but NOT carved — this is a dry run. ` +
        CARVE.map(c => `${c.territory} (x${c.n})`).join(' · '))
  } else {
    const picked = CARVE.slice(0, CARVE_MAX)
    if (CARVE.length > picked.length) {
      log(`🪓 ${CARVE.length} candidates, carving the top ${picked.length} — the rest are named ` +
          `in carve_candidates and were NOT dropped silently: ` +
          CARVE.slice(picked.length).map(c => `${c.territory} (x${c.n})`).join(' · '))
    }
    phase('Carve')
    const carveResults = await parallel(picked.map(c => () => agent(
      `Carve a durable skill from a cluster of failures this run kept hitting. You are the LAST\n` +
      `agent of the arc: every round is finished and no other agent will read a skill file again,\n` +
      `which is the only moment carving is safe.\n\n` +
      `TERRITORY: ${c.territory}\n` +
      `TIMES HIT: ${c.n}\n` +
      `FILES INVOLVED: ${c.files.join(' ') || '(none recorded)'}\n` +
      `EVIDENCE — the actual failure reasons, verbatim:\n` +
      c.evidence.map((e, i) => `  ${i + 1}. ${e}`).join('\n') + '\n\n' +
      `DO THIS:\n` +
      `1. Choose a kebab-case slug naming the TERRITORY, not this run (e.g. "stale-version-stamp",\n` +
      `   not "tuesday-build-failure"). Target ~/.claude/skills/<slug>/SKILL.md.\n` +
      `2. If that file already EXISTS, read it and MERGE: add only evidence it does not already\n` +
      `   carry, and raise its hit count. Never duplicate a scar it already records, never rewrite\n` +
      `   its existing rules to match this run. If it does not exist, write it.\n` +
      `3. Frontmatter: name (the slug) and a description that says WHEN to load it — the trigger,\n` +
      `   not a summary. Keep the description under 900 characters: it is truncated at 1536 in\n` +
      `   Claude Code and near 200 in Desktop, and a truncated description loses its tail silently.\n` +
      `4. Every rule you write carries its EVIDENCE. A rule with no failure behind it is an opinion,\n` +
      `   and opinions are what make a skill file stop being worth loading.\n` +
      `5. ARCHIVE, DO NOT DELETE. Append the carved scars to ~/.konyo-workflow/SCARS.archive.md with\n` +
      `   this run's version label (${plan.version_label}) and today's date. If they also appear in\n` +
      `   ~/.konyo-workflow/SCARS.inbox.md, remove them from the INBOX only — the archive is now the\n` +
      `   record. Deleting evidence is forbidden; a rule you cannot argue with later is worse than\n` +
      `   no rule.\n\n` +
      `⚠ HARD CONSTRAINT — A SCAR NARROWS ATTENTION, IT NEVER SUPPRESSES A GATE. What you write may\n` +
      `tell a future run what has already been tried and failed, so it does not spend a round\n` +
      `re-deriving it. It may NOT skip a check, lower a bar, mark anything as already-judged, or\n` +
      `record a verdict that a later run could read instead of re-proving. If you cannot write the\n` +
      `rule without it reading as permission to skip something, write no rule and say so.\n\n` +
      `PROOF: after writing, cat the file back and confirm the frontmatter parses and the\n` +
      `description is under 900 characters. Report the path you wrote and what you actually changed.`,
      { label: `carve:${c.territory.slice(0, 28)}`, phase: 'Carve', model: 'opus',
        schema: { type: 'object', additionalProperties: false,
          required: ['wrote', 'path', 'action', 'summary'],
          properties: {
            wrote:   { type: 'boolean', description: 'true only if a SKILL.md was actually written' },
            path:    { type: 'string' },
            action:  { type: 'string', enum: ['created', 'merged', 'declined'] },
            summary: { type: 'string' },
            archived:{ type: 'boolean' },
          } } })))
    const written = carveResults.filter(Boolean).filter(r => r.wrote)
    CARVED = {
      ran: true,
      reason: '',
      written: written.map(r => ({ path: r.path, action: r.action, summary: r.summary,
                                   archived: !!r.archived })),
      declined: carveResults.filter(Boolean).filter(r => !r.wrote)
        .map(r => ({ action: r.action, summary: r.summary })),
    }
    if (written.length) {
      log(`🪓 CARVED ${written.length} skill(s) — ` +
          written.map(r => `${r.path} (${r.action})`).join(' · ') +
          `. Evidence archived, not deleted. Loads at the START of your next session.`)
    } else {
      log('🪓 Carve ran and wrote nothing — the agent declined every candidate. That is a legal ' +
          'outcome, not a failure; a rule that could only read as permission to skip a gate is ' +
          'one it is supposed to refuse to write.')
    }
  }
}
return emit({
  version: plan.version_label,
  mode,
  scars: SCARS,
  carve_candidates: CARVE,
  carved: CARVED,   // v38 — what the arc-end carve actually WROTE (or why it did not)
  /* v18 — ONE SHAPE ON BOTH EXIT PATHS. Caught by the completeness critic of the very run that
     built this merge: bail() returned `quality: QUALITY` (the machine token 'max'|'standard') while
     the SUCCESS path returned `quality:` as a PROSE SENTENCE, with the machine value buried in
     knobs.quality. So `result.quality === 'max'` — the exact check this merge told callers to use to
     prove a max run was really bought — was FALSE on every successful run and TRUE only when the run
     ABORTED. A field that answers correctly only on failure is the null-reads-as-pass defect wearing
     a different hat. The token is now the field; the prose is a separate label. */
  quality: QUALITY,
  /* v20.1 — THE LABEL CLAIMED THE TWO PHASES LEAN DELIBERATELY DOES NOT BUY. Same class as the four
     fixed by hand at v20: "3-architect judge panel · loop-until-dry" is true of MAX ONLY, and this is
     the human-readable field of the LEAN payload — which is now the DEFAULT run, so this was about to
     become the most-printed sentence in the system. It also contradicted TWO fields in its OWN object:
     knobs.judgePanel said 'single architect' and completeness.ran said false. Two surfaces, two
     answers, and nothing compared them. */
  /* v22.1 — TINY DESCRIBED ITSELF AS MAX. These report branches switch on LEANQ and fall through to
     the MAX prose, so the very first real tiny run returned
     quality_label:"MAX (Opus everywhere · 3-architect judge panel · loop-until-dry)" for a run that
     built at SONNET, bought no panel and no critic. That is the v20 defect exactly, reintroduced by
     me: v22 named the concept for the GATES (MAXONLY) and left the REPORTING switching on LEANQ, so
     adding a quality broke every prose branch at once. A payload that misnames the run is worse than
     a missing field — it is confidently wrong about what was bought. */
  quality_label: TINYQ
    ? `TINY (every ship gate · NO triage/architect/completeness/synthesizer · ${SKEPTICS}-skeptic ` +
      `adversarial gate · sonnet builders unless risk:high · reachability ‖ render gate)`
    : LEANQ
    ? `LEAN (every MAX gate · ONE architect, no judge panel · ${SKEPTICS}-skeptic adversarial gate · ` +
      `${MAXROUNDS} rework round(s) · NO completeness critic · ` +
      `low-risk items built at their architect's tier, floored at sonnet)`
    : MAXQ
    ? `MAX (Opus everywhere · 3-architect judge panel · ${SKEPTICS}-skeptic adversarial gate · loop-until-dry)`
    : `STANDARD (cost-scaled ladder · single Opus architect · Fable merge gate${SKEPTICS ? ` · ${SKEPTICS}-skeptic panel` : ' · no skeptics'})`,
  knobs: {
    quality: QUALITY,
    maxRounds: MAXROUNDS,
    dryRounds: DRYROUNDS,
    floor: FLOOR,
    tierPolicy: TINYQ ? "sonnet, EXCEPT risk:'high' items which build at opus (the caller named the site, so the builder is not deciding WHAT to do)"
      : LEANQ ? "opus, EXCEPT risk:'low' items which build at the architect's tier floored at SONNET (never haiku)"
      : MAXQ ? 'opus everywhere' : 'cost-scaled ladder (haiku→sonnet→opus, escalate on rework)',
    /* v20.1 — REPORT THE SIZE THAT WAS BOUGHT, not the size the flag used to imply. The panel is now
       sized from triage (see ARCH_N at the Architect phase), so a hardcoded "3 architects + judge"
       would be the same lie the quality_label was telling one field above. */
    judgePanel: (MAXONLY)
      ? `${ARCH_N} architect(s)` + (ARCH_N > 1 ? ' + judge' : ' (no judge — nothing to merge)') + ' — sized from triage'
      : 'single architect',
    gateKind: MAXQ ? 'adversarial skeptic panel (the panel IS the gate)' : 'fable merge gate + skeptic panel behind it',
    isolate: ISOLATE,
    skeptics: { used: SKEPTICS, of: LENSES.length, source: SKEPTICS_SOURCE },
  },
  // v20.1 — the tree that was locked, and whether it matches the paths the task named. The key is
  // the lock agent's shell cwd: nobody declares it, so the payload must show it or a lock on the
  // WRONG tree is indistinguishable from a lock on the right one.
  /* v40 §D5 — `null` used to mean BOTH "a dry run needs no lock" and "the lock attempt failed and
     we wrote anyway". Those are opposite facts and a caller could not branch on either. */
  lock: lock ? { acquired: !!lock.acquired, key: lock.key, tree: lock.cwd || lock.key || null,
                 tree_check: globalThis.__lockCheck || null, released: didRelease }
    : { acquired: false, key: null, tree: null, tree_check: null, released: false,
        why: globalThis.__lockUnestablished
          ? 'THE LOCK AGENT NEVER RETURNED and this run wrote to the tree anyway — unprotected. Not the same as a free tree.'
          : 'no lock was attempted (dry-run writes nothing, so none is needed)',
        unestablished: !!globalThis.__lockUnestablished },
  /* v40.2 — `null` meant BOTH "sized fine, nothing to report" and "the triage agent died and this
     run was never sized at all". Those are opposite facts; only one of them means two spend
     safeguards did not run. */
  triage: globalThis.__triage
    || (globalThis.__triageFailed
      ? { ran: false, why: 'the triage agent never returned (it died, or the ceiling refused it) — THIS RUN WAS NEVER SIZED. The direct-work refusal and the triage cap on plan size both did not run.',
          safeguards_skipped: ['direct-work refusal', 'triage cap on plan size'] }
      : null),
  rounds: round,
  rework: { rounds: round, maxRounds: MAXROUNDS, stopped_because: reworkStop },
  // v20.1 — `ceiling_pinned` is the ceiling-aware sizer's decision: null = it never fired, a number =
  // the seats it settled on (never below `floor`). Silent right-sizing is a bound enforced and never
  // reported, which is the defect this file keeps paying for.
  // v21 — `seats` is what was BOUGHT; `thin_panels` is where fewer actually VOTED. `used` is kept
  // under its old name for anything reading this payload, but it is the seat count and nothing else.
  skeptics: { used: SKEPTICS, seats_bought: SKEPTICS, of: LENSES.length, source: SKEPTICS_SOURCE,
              floor: SKEPTIC_FLOOR, ceiling_pinned: SKEPTIC_PIN,
              thin_panels: THIN_PANELS, thin_panel_count: THIN_PANELS.length,
              opted_out: !!globalThis.__skepticsOptedOut, floored: !!globalThis.__skepticFloored },
  completeness: (MAXONLY)
    ? { ran: true, rounds: critRound, dry, required: DRYROUNDS, wentDry: dry >= DRYROUNDS,
        stoppedBecause: critStop, unbuiltGaps }
    : { ran: false, reason: LEANQ
        ? 'quality=lean — the completeness critic was deliberately not bought (it is the run\'s longest tail). Nothing hunted for work nobody did; re-run at quality:"max" if that matters.'
        : TINYQ
        ? 'quality=tiny — the completeness critic is deliberately not bought: it is the longest tail in the file and a <=4-item brief has no hidden scope to hunt. Nothing looked for work nobody did.'
        : 'quality=standard — the completeness critic is a max-only phase and was never bought' },
  infeasible: globalThis.__infeasible || null,
  /* v18.4 — REPORT THE SPEND, ALWAYS. This read `budget.total ? budget.spent() : null`, so unless a
     caller had set an explicit token target the run reported tokens_spent:null — while budget.spent()
     answers perfectly well with no target set. A number that exists and is withheld is the same
     defect this ledger exists to kill, just pointed at the bill instead of the work. */
  tokens_spent: budget.spent(),
  budget: { target: budget.total, spent: budget.spent(),
            remaining: budget.total ? budget.remaining() : null },
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
  verdict: (BLOCKERS.length ? 'BLOCKED — see blockers[]'
    : CEILING_HIT ? 'UNVERIFIED — the agent ceiling stopped the run early'
    : (MAXONLY && (dry < DRYROUNDS || unbuiltGaps.length)) ? 'UNVERIFIED — the completeness critic never went dry (' + (critStop || 'gaps raised but never built') + ')'
    : trimmedFromPlan.length ? 'PARTIAL — ' + trimmedFromPlan.length + ' item(s) were trimmed from the plan to fit the ceiling'
    : failed.length ? 'INCOMPLETE — ' + failed.length + ' item(s) never passed the gate'
    : SPAWN_ERRORS.length ? 'DEGRADED — some agents died; their work is missing, not failed'
    /* v21 — an EMPTY SEAT IS A DEAD AGENT, and it was the only one of the two that did not reach the
       verdict. A panel that came up short reviewed the change with fewer eyes than the report claims;
       that is degraded, not clean. It sits BELOW the other clauses on purpose — it never masks a
       blocker, a ceiling or a failed item, it only stops a short-handed panel reading as a full one. */
    : THIN_PANELS.length ? 'DEGRADED — ' + THIN_PANELS.length + ' skeptic panel(s) came up short (' +
        THIN_PANELS.slice(0, 3).map(t => `${t.file}: ${t.cast}/${t.panel} vote(s) cast`).join('; ') +
        ') — fewer eyes reviewed this than the seat count claims'
    : (results.length === 0 || passed.length === 0) ? 'EMPTY — no item passed a gate (vacuous green is forbidden)'
    : 'OK') + INCOMPLETE_SUFFIX,   // v40 §D1c — a ternary picks ONE rung; incompleteness is not an alternative to being blocked
  complete: RUN_COMPLETE,          // v40 §D1c — top-level, because nested under `ceiling` is where nobody looked
  not_swept: NOT_SWEPT,
  planned_items: (globalThis.__plannedN ?? null),
  /* v32 §(c2) — THE ONE AUDIT ITEM I COULD NOT REPRODUCE UNTIL I LOOKED AT THE ORDERING.
     `SHIPPABLE` is computed ONCE, well above, and that is correct: it is the precondition the Ship
     phase gates on, and two formulas for one decision is the v18.3 bug. But THREE blockers are
     raised AFTER that line — 'THE THIRD EYE REFUSED THIS SHIP', 'SHIP DID NOT RUN' and, worst,
     'PUSH REFUSED' when the repo's own pre-push hook rejects the push. None of them could reach a
     const already computed, so the payload could carry `verdict: 'BLOCKED — see blockers[]'` and
     `shippable: true` AT THE SAME TIME. `verdict` reads BLOCKERS.length at emit and was always
     right; `shippable` is the field a CALLER checks, and it was wrong on exactly the runs that
     failed at the last step.
     This is NOT a second formula for the gate — the gate still reads SHIPPABLE and is untouched.
     It is the same decision NARROWED by facts learned after it was taken, which is the honest
     direction: a run can stop being shippable, it can never start. */
  shippable: SHIPPABLE && !BLOCKERS.length,
  shippable_at_gate: SHIPPABLE,   // what the Ship phase actually gated on, kept for auditing
  shipped,
  log_pass: { on: LOG_PASS, commits: logPassLedger },
  passed: passed.length,
  failed: failed.length,
  // v30 — meter routing (Grok parity 2026-08-07)
  max_items_cap: MAX_ITEMS_CAP,
  volume_arc_heuristic: LOOKS_LIKE_VOLUME_ARC,
  safeguards: {
    v30_meter_routing: true,
    v30_item_cap_by_quality: true,
    v30_max_not_for_volume_arcs: true,
    v30_tip_honesty_and_thrash: true,
    v39_log_pass: true,
  },
  /* v40 §D3 — the seam ledger. `unjoined` is a LEAD LIST the fleet produced about itself, not a
     verdict; LAW19's `dead` is the verdict. Both are reported so they can be compared. */
  seams: SEAMS,
  render_gate: renderGate,
  /* v26 — the loop, reported rather than inferred. `converged:true` means a render came back clean;
     anything else names WHY it stopped, so "2 passes" never has to be read as "it worked". */
  render_loop: renderLoop,
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
    /* v36 §C5 — the numbers a reader needs in order NOT to have to trust the adjective.
       `of` counts every seat the run declared, including seats skipped before they ran (thirdEye:off
       pushes a ran:false record). `attempted` counts only the seats that were actually put to a
       courier, which is the honest denominator for "how much of this run was independently seen". */
    attempted: TE_ATTEMPTED,
    /* v40 §D2b — THE KIND RIDES WITH THE PROSE. `reason` is 200 characters a human reads; nothing
       could branch on it, so every silence looked alike to a caller and "unreachable" was doing the
       work of three opposite facts. See SILENCE_KINDS for what each one licenses you to conclude. */
    silent_seats: TE_SILENT.map(s => ({ seat: s.seat, kind: s.silence_kind || classifySilence(s),
      means: SILENCE_KINDS[s.silence_kind || classifySilence(s)] || null,
      reason: String(s.reason || '').slice(0, 200) })),
    silence_kinds: TE_SILENT.reduce((acc, s) => {
      const k = s.silence_kind || classifySilence(s); acc[k] = (acc[k] || 0) + 1; return acc }, {}),
    /* THE FIELD THAT ANSWERS THE QUESTION THE HANDOFF ASKED. A run whose seats all timed out mid-
       work has NOT measured the third eye as unreachable — it has measured its own clock. Keeping
       that as a top-level count means the next reader does not have to re-derive it from prose. */
    timed_out_seats: TE_SILENT.filter(s => (s.silence_kind || classifySilence(s)) === 'timed_out_mid_work').length,
    timeout_budget_s: GROK_TIMEOUT_S,
    transports: [...new Set(TE_SPOKE.map(s => s.transport))],
    // v36 §C5 — was `TE_SPOKE.length === 0`: only ALL-silent counted as degraded, so 1-of-4 read clean.
    degraded: TE_DEGRADED,
    partial: TE_PARTIAL,
    note: !TE_ASKED_FOR ? 'thirdEye:false — no independent model was asked to review this run'
      : THIRD_EYE === 'claude' ? 'thirdEye:"claude" — a SAME-FAMILY stand-in reviewed this run; it is not an independent eye'
      : TE_PARTIAL ? `PARTIAL — an independent model answered ${TE_SPOKE.length} of ${TE_ATTEMPTED} seat(s) (` +
          `silent: ${TE_SILENT.map(s => s.seat).join(', ')}). The questions those seats carried were reviewed ` +
          `by NOBODY outside Claude. Do not read this as an independent review of the whole run.`
      : TE_SPOKE.length ? `an independent model (different family) reviewed this run — all ${TE_ATTEMPTED} seat(s) answered`
      /* ⚠ v36.1 — THESE TWO SILENCES ARE DIFFERENT AND USED TO SHARE ONE SENTENCE. With
         TE_ATTEMPTED === 0 no seat was ever opened (reachable: quality:'tiny' skips the plan seat,
         pre-ship is gated on APPLY, render-vision on there being images, the skeptic seat on a
         panel of 2+ — a tiny dry run with a thin panel opens none of them). The old text then read
         "requested and NEVER ANSWERED", which describes a dead transport, beside degraded:false.
         Nothing failed; nothing was asked. Saying so is the difference between "your third eye is
         broken" and "this run never bought one". Caught by the third eye on this same change. */
      : TE_ATTEMPTED === 0
        ? 'the third eye was configured but NO SEAT WAS EVER OPENED on this run — this quality/flag ' +
          'combination asked it nothing, so nothing outside Claude reviewed this run. That is not a ' +
          'transport failure: the third eye was never contacted.'
        : 'the third eye was requested and NEVER ANSWERED — nothing outside Claude reviewed this run',
  },
  final,
})
