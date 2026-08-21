#!/usr/bin/env node
/* PROOF for the three defects in HANDOFF_WORKFLOW_DEFECTS_2026-08-21.md, plus the fourth this
   work found (the feasibility gate that could not fire).
   EVERY CHECK IS RUN TWICE: once against the PRE-FIX engine and once against the fixed one. A check
   that does not go RED on the old file is not proving anything about the new one — it is a fixture
   agreeing with itself, which is the failure this whole repo's SCARS file keeps recording.
   Usage: node v40_defects_proof.mjs [pathToOldEngine]                                          */
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, unlinkSync, statSync, mkdtempSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const NEW = join(HERE, 'konyo-workflow.js')
/* ⚠ THE OLD ENGINE MUST BE A REAL, BOOTABLE FILE, AND THIS IS CHECKED BELOW — NOT ASSUMED.
   The first cut resolved a missing backup to `join(HERE, '')`, i.e. the DIRECTORY. Every old-run
   then returned null, `!c.ok(null)` was true, and all sixteen checks reported `old=RED`. They were
   red because the file did not exist, not because the behaviour was absent — a whole suite of
   vacuous proofs, printing exactly the same characters as real ones. That is the blind-fixture
   defect (a gate whose two sides cannot disagree) inside the instrument built to prove a
   blind-fixture defect was fixed. RED MUST MEAN "THE BEHAVIOUR IS ABSENT", NEVER "I COULD NOT FIND
   THE FILE" — so a missing or unbootable baseline is a hard refusal, not a pass. */
// Look beside this script first, then in the live engine directory — the same proof then runs from
// the repo checkout and from ~/.claude/workflows without being told where the baseline is.
const OLD_DIRS = [HERE, '/Users/konyo/.claude/workflows']
function findBaseline() {
  for (const d of OLD_DIRS) {
    let f = []
    try { f = readdirSync(d).filter(x => x.startsWith('konyo-workflow.js.bak-pre-v40')).sort() } catch { continue }
    if (f.length) return join(d, f.pop())
  }
  return ''
}
const OLD = process.argv[2] || findBaseline()
const TMP = process.env.PROOF_TMP || mkdtempSync(join(tmpdir(), 'konyo-proof-'))

// 12 items at quality=lean, whose MAX_ITEMS_CAP is 8 → the engine MUST drop 4.
const ITEMS = Array.from({ length: 12 }, (_, i) => ({
  file: `tv/f${i}.py`, instruction: `sweep defect class ${i}`, tier: 'sonnet', risk: 'low', kind: 'code',
}))

function run(engine, args, tag) {
  const dump = join(TMP, `proof_${tag}.json`)
  try { unlinkSync(dump) } catch {}
  try {
    execFileSync(process.execPath, [join(HERE, 'load_harness.mjs'), JSON.stringify(args), engine],
      { env: { ...process.env, HARNESS_DUMP: dump }, encoding: 'utf8', stdio: 'pipe', timeout: 120000 })
  } catch (e) { /* non-zero exit still writes the dump */ }
  try { return JSON.parse(readFileSync(dump, 'utf8')) } catch { return null }
}

const TRIM_ARGS = { task: 'sweep six defect classes', __harness: { architectItems: ITEMS } }

// ── the checks. Each returns true when the BEHAVIOUR IS PRESENT (i.e. green on the fixed engine).
const CHECKS = [
  { id: 'D1.1', what: 'a trimmed plan raises a BLOCKER named as an incomplete sweep',
    args: TRIM_ARGS,
    ok: d => (d?.result?.blockers || []).some(b => /SWEEP WAS NOT COMPLETE/i.test(b.what || '')) },

  { id: 'D1.2', what: 'the VERDICT STRING itself says INCOMPLETE (a ternary ladder emits one rung; BLOCKED used to hide the trim)',
    args: TRIM_ARGS,
    ok: d => /INCOMPLETE/.test(d?.result?.verdict || '') && /NEVER SWEPT/.test(d?.result?.verdict || '') },

  { id: 'D1.3', what: 'complete/not_swept/planned_items are TOP-LEVEL, not nested under ceiling',
    args: TRIM_ARGS,
    ok: d => d?.result?.complete === false && Array.isArray(d?.result?.not_swept)
             && d.result.not_swept.length > 0 && typeof d?.result?.planned_items === 'number' },

  { id: 'D1.4', what: 'the trimmed FILE NAMES reach the human-facing log, not only a nested key',
    args: TRIM_ARGS,
    ok: d => (d?.logs || []).some(l => /NOT SWEPT \(/.test(l) && /tv\/f/.test(l)) },

  { id: 'D4',   what: 'FEASIBILITY reports the PLANNED size, not the post-trim survivors (the gate that could not fire)',
    args: TRIM_ARGS,
    /* ⚠ THE FIRST CUT OF THIS CHECK HARDCODED "8 SURVIVED" — the v30 item cap for lean. The
       fixture's TRIAGE capped it to 4 first, so the assertion failed against code that was working
       perfectly. A test pinned to a number the fixture actually decides is the same defect this
       engine is being fixed for, committed inside its own proof. Assert the SHAPE and the
       inequality that matters: the warning names the PLANNED size and a worst case ABOVE the cap.
       That inequality is the whole point — pre-fix, `worst` was computed from the SURVIVORS
       (21 ≤ 24), so the warning could not fire no matter how much had been dropped. */
    ok: d => (d?.logs || []).some(l => /THE PLAN WAS 12 ITEM\(S\); \d+ SURVIVED/.test(l))
             && (d?.logs || []).some(l => {
                  const m = l.match(/As planned it needed ≈(\d+) agents against a cap of (\d+)/)
                  return m && Number(m[1]) > Number(m[2])
                }) },

  { id: 'D1.6', what: 'the SYNTHESISER is told incompleteness is ADDITIVE to the headline, and is given the planned-vs-run counts',
    args: TRIM_ARGS,
    ok: d => (d?.calls || []).some(c => /INCOMPLETENESS IS ADDITIVE TO THE HEADLINE/.test(c.prompt)
             && /PLAN SIZE: 12 item\(s\) planned/.test(c.prompt)
             && /FORBIDDEN for any trimmed file/.test(c.prompt)) },

  { id: 'D1.5', what: '{strictScope:true} REFUSES instead of choosing which items die',
    args: { ...TRIM_ARGS, strictScope: true },
    ok: d => /^REFUSED/.test(d?.result?.verdict || '') && (d?.result?.not_swept || []).length > 0 },

  { id: 'D2.1', what: 'the third-eye payload types WHY a seat was silent (silence_kinds / timed_out_seats)',
    args: { task: 't' },
    ok: d => d?.result?.thirdEye && typeof d.result.thirdEye.silence_kinds === 'object'
             && typeof d.result.thirdEye.timed_out_seats === 'number' },

  { id: 'D2.2', what: 'the grok timeout is a REPORTED budget and is no longer 180s',
    args: { task: 't' },
    ok: d => d?.result?.thirdEye?.timeout_budget_s >= 420 },

  { id: 'D2.3', what: "the courier's Bash backstop DERIVES from the alarm (it was hardcoded 180000, which would strangle a longer alarm)",
    args: { task: 't' },
    ok: d => (d?.calls || []).some(c => /timeout parameter to 450000/.test(c.prompt))
             && !(d?.calls || []).some(c => /timeout parameter to 180000/.test(c.prompt)) },

  { id: 'D2.4', what: 'a thin panel records WHY each seat was empty, not just the arithmetic',
    args: { task: 't' },
    ok: d => (d?.result?.skeptics?.thin_panels || []).every(t => 'empty_seats' in t)
             && (d?.result?.skeptics?.thin_panels || []).length > 0 },

  /* ── D5: found by sweeping for this file's OWN signature defect (a fact true in the run and
     absent from the decision), not from the handoff. spawn() returns null when an agent dies or the
     ceiling refuses it, every lock branch was `if (lock && ...)`, and the run then EDITED A SHARED
     TREE UNPROTECTED with one warning line and no blocker. `__harness.nullAgents` was added to make
     that branch reachable at all — it had never been testable. */
  { id: 'D5.1', what: 'a dead LOCK agent + apply:true BLOCKS (it wrote to a shared tree with no lock)',
    args: { task: 't', apply: true, __harness: { nullAgents: ['lock:acquire'] } },
    ok: d => (d?.result?.blockers || []).some(b => /NO WORKSPACE LOCK/i.test(b.what || ''))
             && d?.result?.shippable === false },

  { id: 'D5.2', what: 'the payload distinguishes "no lock needed" from "the lock failed and we wrote anyway"',
    args: { task: 't', apply: true, __harness: { nullAgents: ['lock:acquire'] } },
    ok: d => d?.result?.lock?.unestablished === true && /NEVER RETURNED/.test(d?.result?.lock?.why || '') },

  { id: 'D5.3', what: 'a DRY-RUN is not blocked for a lock it never needed (the fix must not fire on correct runs)',
    args: { task: 't' },
    ok: d => !(d?.result?.blockers || []).some(b => /NO WORKSPACE LOCK/i.test(b.what || ''))
             && /no lock was attempted/.test(d?.result?.lock?.why || '') },

  { id: 'D5.4', what: '{ignoreLock:true} still suppresses the blocker — the flag IS the human saying proceed unlocked',
    args: { task: 't', apply: true, ignoreLock: true, __harness: { nullAgents: ['lock:acquire'] } },
    ok: d => !(d?.result?.blockers || []).some(b => /NO WORKSPACE LOCK/i.test(b.what || ''))
             && d?.result?.lock?.unestablished === true },

  /* ── D6: a dead TRIAGE agent silently disarmed two spend safeguards and logged nothing.
     Found only because the sweep was re-run against a baseline that could actually SHIP —
     the first pass used the default fixture, which is already unshippable (thin panel), so every
     nulled agent "looked" safely blocked. A fixture whose two sides cannot disagree, again. */
  { id: 'D6.1', what: 'a dead TRIAGE agent is announced and named in the payload (it was totally silent)',
    args: { task: 't', apply: true, thirdEye: false, __harness: { nullAgents: ['triage'] } },
    ok: d => d?.result?.triage?.ran === false
             && (d?.result?.triage?.safeguards_skipped || []).length === 2
             && (d?.logs || []).some(l => /TRIAGE DID NOT RETURN/.test(l)) },

  { id: 'D6.2', control: true, what: 'a HEALTHY triage run is NOT marked failed (the fix must not fire on correct runs)',
    args: { task: 't', apply: true, thirdEye: false },
    ok: d => d?.result?.triage && d.result.triage.ran !== false
             && !(d?.logs || []).some(l => /TRIAGE DID NOT RETURN/.test(l)) },

  { id: 'D6.3', control: true, what: 'the null-agent instrument reports WHAT IT MATCHED — a pattern matching nothing must not read as a harmless absence',
    args: { task: 't', apply: true, thirdEye: false, __harness: { nullAgents: ['architect:judge'] } },
    // lean buys no judge, so this pattern matches NOTHING. Without the denominator this run looked
    // like "nulling the judge is harmless" — it nulled nothing at all. Three such fake findings
    // were caught this way before they were reported.
    ok: d => Array.isArray(d?.nulledAgents) && d.nulledAgents.length === 0 },

  { id: 'D6.4', control: true, what: 'the instrument DOES match when the agent exists (the other half — else D6.3 passes vacuously)',
    args: { task: 't', apply: true, thirdEye: false, __harness: { nullAgents: ['triage'] } },
    ok: d => Array.isArray(d?.nulledAgents) && d.nulledAgents.length === 1
             && d.nulledAgents[0].label === 'triage' },

  /* ── D7: seven agents ran unlabelled, identified only by phase. Cost paid twice: the handoff had
     to reverse-engineer journal rows from result-key SHAPES, and the null sweep could not target
     the render FIXER apart from the render GATE — they share a phase and both were anonymous. */
  { id: 'D7.1', what: 'EVERY agent in a full run carries a label (7 were anonymous, incl. the render gate and its fixer)',
    args: { task: 't', apply: true, thirdEye: false, isolate: true, stakes: 'irreversible' },
    /* ⚠ `!!c.label` WAS NOT THE TEST. load_harness substitutes the literal string '(unlabelled)'
       for a missing label so its census reads nicely — and that string is TRUTHY, so the check
       passed on the pre-fix engine, which has six anonymous agents. The assertion was reading the
       instrument's DISPLAY PLACEHOLDER instead of the value, which is source-reading-guard's exact
       shape: asserting on a rendering rather than on the thing rendered. */
    ok: d => Array.isArray(d?.calls) && d.calls.length > 10
             && d.calls.every(c => c.label && c.label !== '(unlabelled)') },

  { id: 'D7.2', what: 'the render FIXER can now be killed on its own — proving its death path, which was untestable',
    args: { task: 't', apply: true, thirdEye: false, __harness: {
      agentPatch: [{ match: 'render:gate', patch: { passed: false, failures: ['header overlaps nav at 375px'], pre_existing: [] } }],
      nullAgents: ['render:fix'] } },
    // RED on the old engine because 'render:fix' matched nothing there: the fixer ran, the loop
    // exhausted its passes, and `stopped` read 'ran out of passes' instead.
    ok: d => d?.result?.render_loop?.stopped === 'the fixer did not return'
             && (d?.nulledAgents || []).length === 1 },

  { id: 'D7.3', control: true, what: 'a dead render fixer still BLOCKS and never converges (behaviour preserved, now proven)',
    args: { task: 't', apply: true, thirdEye: false, __harness: {
      agentPatch: [{ match: 'render:gate', patch: { passed: false, failures: ['header overlaps nav at 375px'], pre_existing: [] } }],
      nullAgents: ['render:fix'] } },
    ok: d => d?.result?.render_loop?.converged === false
             && d?.result?.shippable === false
             && (d?.result?.blockers || []).some(b => /RENDER GATE FAILED/.test(b.what || '')) },

  { id: 'D7.4', control: true, what: 'agentPatch reports what it matched — a patch matching nothing must not read as a behaviour that held',
    args: { task: 't', apply: true, thirdEye: false, __harness: {
      agentPatch: [{ match: 'no-such-agent-anywhere', patch: { passed: false } }] } },
    ok: d => Array.isArray(d?.patchedAgents) && d.patchedAgents.length === 0 },

  /* ── D8: a render gate could excuse its OWN failure with a one-character proof string.
     v33 lets a gate subtract failures it proves were already broken — right, and its own comment
     names the risk ("the easiest claim a gate can make and the hardest to check"). The test was
     `String(p.proof||'').trim()`, i.e. non-empty. Reachable only via agentPatch, because the
     failing-gate path had never been exercised: the faker only produces happy results. */
  { id: 'D8.1', what: "a ONE-CHARACTER proof no longer excuses a render failure (it shipped before)",
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [{ match: 'render:gate',
      patch: { passed: true, failures: ['header overlaps nav at 375px'], pre_existing: [{ failure: 'header overlaps nav at 375px', proof: 'x' }] } }] } },
    ok: d => d?.result?.shippable === false
             && (d?.result?.render_excusals?.rejected || []).length === 1 },

  { id: 'D8.2', what: 'a proof that merely repeats the failure text is refused',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [{ match: 'render:gate',
      patch: { passed: true, failures: ['header overlaps nav at 375px'], pre_existing: [{ failure: 'header overlaps nav at 375px', proof: 'header overlaps nav at 375px' }] } }] } },
    ok: d => d?.result?.shippable === false
             && /repeats the failure/.test((d?.result?.render_excusals?.rejected || [{}])[0]?.why || '') },

  { id: 'D8.3', what: 'a long, confident CLAIM that names nothing checkable is refused (length alone is not evidence)',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [{ match: 'render:gate',
      patch: { passed: true, failures: ['header overlaps nav at 375px'], pre_existing: [{ failure: 'header overlaps nav at 375px',
        proof: 'I am confident this problem existed previously and is definitely not something our change introduced' }] } }] } },
    ok: d => d?.result?.shippable === false
             && /names nothing checkable/.test((d?.result?.render_excusals?.rejected || [{}])[0]?.why || '') },

  { id: 'D8.4', control: true, what: 'a REAL proof naming a git ref is still accepted and still ships (no over-blocking)',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [{ match: 'render:gate',
      patch: { passed: true, failures: ['header overlaps nav at 375px'], pre_existing: [{ failure: 'header overlaps nav at 375px',
        proof: 'present on origin/main at a1b2c3d before this run; verified with git stash && re-render' }] } }] } },
    ok: d => d?.result?.shippable === true
             && (d?.result?.render_excusals?.accepted || []).length === 1 },

  { id: 'D8.5', what: 'what the render gate excused itself for reaches the PAYLOAD, not just a log line',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [{ match: 'render:gate',
      patch: { passed: true, failures: ['header overlaps nav at 375px'], pre_existing: [{ failure: 'header overlaps nav at 375px', proof: 'x' }] } }] } },
    ok: d => d?.result?.render_excusals && Array.isArray(d.result.render_excusals.accepted)
             && Array.isArray(d.result.render_excusals.rejected) },

  /* ── D9: the instrument again. agentPatch first ran BEFORE the harness's own triage override,
     which Object.assigns tier:'max' unconditionally — so patching triage to 'direct' was silently
     clobbered and the sweep recorded "triage:direct does not stop the run", a FALSE FINDING about
     a safeguard that works perfectly. patchedAgents said it matched, because it had: "applied" and
     "had an effect" are different facts. */
  { id: 'D9.1', control: true, what: "agentPatch survives the harness's own overrides — triage patched to 'direct' now REFUSES the run",
    args: { task: 't', apply: true, thirdEye: false, __harness: {
      agentPatch: [{ match: 'triage', patch: { tier: 'direct', why: 'one root cause, do it serially' } }] } },
    ok: d => d?.result?.refused === 'triage says direct'
             && (d?.patchedAgents || []).every(x => JSON.stringify(x.applied) === JSON.stringify(x.effective)) },

  /* ── D10/D11/D12: MALFORMED & CONTRADICTORY agent output — the shape a real agent degrades into,
     which neither the dead-agent nor the failing-gate sweep touched. */

  { id: 'D10.1', what: "2 seats voting refuted:false WITH severity:'blocking' now kill the change (they were 2 APPROVALS and shipped)",
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'skeptic1', patch: { refuted: false, severity: 'blocking', reason: 'badly broken' } },
      { match: 'skeptic2', patch: { refuted: false, severity: 'blocking', reason: 'badly broken' } }] } },
    ok: d => d?.result?.shippable === false && (d?.result?.vote_contradictions || []).length === 2 },

  { id: 'D10.2', what: 'the contradiction is REPORTED, not silently resolved into a refusal',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'skeptic1', patch: { refuted: false, severity: 'major', reason: 'leaks on retry' } }] } },
    ok: d => (d?.result?.vote_contradictions || []).length === 1
             && /severity/.test((d.result.vote_contradictions[0] || {}).severity ? 'severity' : '')
             && (d?.logs || []).some(l => /CONTRADICTORY SKEPTIC VOTE/.test(l)) },

  { id: 'D10.3', control: true, what: "refuted:false with severity:'minor' is a COHERENT answer and must NOT be flagged",
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'skeptic1', patch: { refuted: false, severity: 'minor', reason: 'nit: naming' } }] } },
    ok: d => (d?.result?.vote_contradictions || []).length === 0 && d?.result?.shippable === true },

  { id: 'D11.1', what: 'a builder declaring edits to another file and NOT its own is reworked — checked in CODE, not asked of an agent',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'build:', patch: { files_touched: ['some/other/file.js'] } }] } },
    ok: d => d?.result?.shippable === false
             && (d?.result?.ownership?.violations || []).some(v => v.blocked === true) },

  { id: 'D11.2', control: true, what: 'files_touched:[] is a REAL answer ("nothing needed changing") and must not block',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'build:', patch: { files_touched: [] } }] } },
    ok: d => d?.result?.shippable === true
             && (d?.result?.ownership?.violations || []).length === 0 },

  { id: 'D11.3', control: true, what: 'its own file PLUS an extra is recorded but not auto-failed (path spellings vary; a false rework costs a rebuild)',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'build:', patch: { files_touched: ['/Users/konyo/.claude/workflows/konyo-workflow.js', 'extra.js'] } }] } },
    ok: d => d?.result?.shippable === true
             && (d?.result?.ownership?.violations || []).some(v => v.blocked === false) },

  { id: 'D12.1', what: 'LAW19 tracing ZERO symbols no longer prints a green tick as if it had verified something',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'law19:reach', patch: { checked: 0, dead: [], tests_added: 0, tests_proven_run: true } }] } },
    ok: d => d?.result?.law19_traced_nothing === true
             && (d?.logs || []).some(l => /traced ZERO symbols. That is not a pass/.test(l))
             && !(d?.logs || []).some(l => /✅ Reachability: 0 symbol/.test(l)) },

  { id: 'D12.2', control: true, what: 'LAW19 that really traced symbols is NOT flagged as vacuous',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [
      { match: 'law19:reach', patch: { checked: 12, dead: [], tests_added: 0, tests_proven_run: true } }] } },
    ok: d => d?.result?.law19_traced_nothing === false && d?.result?.shippable === true },

  /* ── D13/D14/D15: SAFEGUARD INTERACTION — two safeguards each correct alone that disagree when
     they fire together. This is where the engine's own v18.3 scar came from. */

  { id: 'D13.1', what: "a CEILING refusal of the re-render is named as a ceiling, not as an agent crash (live at maxAgents 7-9)",
    args: { task: 't', apply: true, thirdEye: false, maxAgents: 9, __harness: { agentPatch: [{ match: 'render:gate', patch: { passed: false, failures: ['overlap'], pre_existing: [] } }],
      nullAgents: ['render:fix'] } },
    /* The render loop guards at MAX_AGENTS-RESERVE_COST-RENDER_ITER_COST while spawn() refuses at
       MAX_AGENTS-RESERVE_COST — different numbers — and reachability spends concurrently with this
       loop by design, so spawn's bound CAN bite between the loop's own checks. Pre-fix that read
       'the gate did not return', sending a reader after a crash that never happened. */
    ok: d => /ceiling — the re-render was refused/.test(d?.result?.render_loop?.stopped || '')
             && /NOT an agent crash/.test(d?.result?.render_loop?.stopped || '') },

  { id: 'D13.2', control: true, what: 'a genuinely dead fixer at a comfortable cap still reports a death, not a ceiling',
    args: { task: 't', apply: true, thirdEye: false, __harness: { agentPatch: [{ match: 'render:gate', patch: { passed: false, failures: ['overlap'], pre_existing: [] } }], nullAgents: ['render:fix'] } },
    ok: d => d?.result?.render_loop?.stopped === 'the fixer did not return' },

  { id: 'D13.3', control: true, what: "the render loop's own guard still fires first when IT is the binding bound",
    args: { task: 't', apply: true, thirdEye: false, maxAgents: 12, __harness: { agentPatch: [{ match: 'render:gate', patch: { passed: false, failures: ['overlap'], pre_existing: [] } }], nullAgents: ['render:fix'] } },
    ok: d => /correction not affordable/.test(d?.result?.render_loop?.stopped || '') },

  { id: 'D14.1', control: true, what: "the TOKEN BUDGET stop is reachable at all and names the budget as the bound (every such branch was dead in every proof)",
    args: { task: 't', apply: true, thirdEye: false, __harness: {
      budget: { total: 500000, spent: 495000 }, agentPatch: [{ match: 'render:gate', patch: { passed: false, failures: ['overlap'], pre_existing: [] } }] } },
    ok: d => /^budget — /.test(d?.result?.render_loop?.stopped || '')
             && d?.result?.budget?.remaining === 5000 },

  { id: 'D15.1', what: 'the trim ledger is ARITHMETICALLY whole: planned_items === items run + not_swept, across three independent trim sources',
    args: { task: 't', apply: true, thirdEye: false, __harness: {
      architectItems: Array.from({ length: 20 }, (_, i) => ({ file: `tv/f${i}.py`, instruction: `c${i}`, tier: 'sonnet', risk: 'low', kind: 'code' })) } },
    // the triage cap, the ceiling trim and the v30 item cap all write ONE ledger; if their union
    // did not account for every planned item the report would be quietly short.
    ok: d => typeof d?.result?.planned_items === 'number'
             && (d.result.passed + d.result.failed + (d.result.not_swept || []).length) === d.result.planned_items },

  /* ── D16: the TOKEN BUDGET, reachable for the first time via __harness.budget. */
  { id: 'D16.1', what: 'a budget AT OR BELOW the floor is announced BEFORE the spend — no rework or completeness round could ever open',
    args: { task: 't', apply: true, thirdEye: false, __harness: { budget: { total: 50000, spent: 0 } } },
    /* budgetOK() is `remaining() > FLOOR` and FLOOR is 120k, so a 50k target is false at its FIRST
       evaluation and stays false forever: the dial looks configured and the branch it guards can
       never run. [[feedback_threshold_above_the_ceiling]] pointed at the token dial. */
    ok: d => d?.result?.budget?.below_floor?.total === 50000
             && d?.result?.budget?.floor === 120000
             && (d?.logs || []).some(l => /BUDGET BELOW THE FLOOR/.test(l)) },

  { id: 'D16.2', control: true, what: 'a budget ABOVE the floor is not warned about (must not fire on correct runs)',
    args: { task: 't', apply: true, thirdEye: false, __harness: { budget: { total: 500000, spent: 0 } } },
    ok: d => d?.result?.budget?.below_floor === null
             && !(d?.logs || []).some(l => /BUDGET BELOW THE FLOOR/.test(l)) },

  { id: 'D16.3', control: true, what: '{budgetFloor:N} lowers the bar deliberately, and then a small budget is fine',
    args: { task: 't', apply: true, thirdEye: false, budgetFloor: 10000, __harness: { budget: { total: 50000, spent: 0 } } },
    ok: d => d?.result?.budget?.below_floor === null && d?.result?.shippable === true },

  { id: 'D16.4', control: true, what: 'a budget that runs out mid-run names the budget as the reason in BOTH loops',
    args: { task: 't', apply: true, thirdEye: false, quality: 'max', __harness: {
      budget: { total: 500000, spent: 400000 },
      agentPatch: [{ match: 'skeptic', patch: { refuted: true, severity: 'blocking', reason: 'broken' } }] } },
    ok: d => d?.result?.rework?.stopped_because === 'budget-floor'
             && /budget floor/.test(d?.result?.completeness?.stoppedBecause || '')
             && d?.result?.shippable === false },

  /* ── D17: the Carve phase spawned via the raw agent(), outside spawn(). */
  { id: 'D17.1', what: 'the CARVE agent is COUNTED by the ceiling and carries PACE/PROOF (it was spent invisibly)',
    args: { task: 't', apply: true, thirdEye: false, quality: 'max', maxRounds: 5, maxAgents: 40,
      __harness: { agentPatch: [{ match: 'skeptic', patch: { refuted: true, severity: 'blocking', reason: 'still broken' } }] } },
    /* MEASURED: pre-fix, 33 agents ran and ceiling.spent reported 32 — the carve agent was invisible
       to the counter, so the ledger a caller reads to size the next run was off by one per carve.
       It also missed the proxy ban, on the one agent that WRITES A FILE EVERY FUTURE SESSION LOADS. */
    ok: d => (d?.calls || []).some(c => /^carve:/.test(c.label || ''))
             && (d?.calls || []).every(c => /WORK BRISKLY/.test(c.prompt || ''))
             && d?.result?.ceiling?.spent === (d?.calls || []).length },

  { id: 'D3.1', what: 'BUILD_SCHEMA carries provides/consumes so a seam is a declared fact',
    args: TRIM_ARGS,
    ok: d => (d?.calls || []).some(c => /build:/.test(c.label || '')) && d?.result?.seams !== undefined },

  { id: 'D3.2', what: 'a builder is TOLD what its siblings are building, with the measured failure as the reason',
    args: TRIM_ARGS,
    ok: d => (d?.calls || []).some(c => /^build:/.test(c.label || '')
             && /OTHER AGENTS ARE EDITING THESE FILES IN PARALLEL/.test(c.prompt)
             && /redirect_path/.test(c.prompt)) },

  { id: 'D3.3', what: 'the seam ledger reaches the payload',
    args: TRIM_ARGS,
    ok: d => d?.result?.seams && Array.isArray(d.result.seams.provided)
             && Array.isArray(d.result.seams.unjoined) },
]

// ── classifySilence is pure, so prove it on the REAL reason strings from the real journal ────────
const REAL_REASONS = [
  'grok timed out after 180s (perl alarm, exit 142). The CLI was invoked correctly and grok began working',
  'grok timed out after 180s (perl alarm, exit 142). Partial stderr before the kill showed Grok mid-investigation',
  'grok timed out after 180s (perl alarm, exit 142). The CLI was mid-review (reading tv/conftest.py',
  'grok timed out after 180s (perl alarm, exit 142). Partial stdout was captured showing it was mid-review',
]
function classifyProbe(engine) {
  const src = readFileSync(engine, 'utf8')
  const m = src.match(/function classifySilence\(rec\) \{[\s\S]*?\n\}/)
  if (!m) return null
  const fn = new Function('return (' + m[0].replace(/^function/, 'function') + ')')()
  return REAL_REASONS.map(r => fn({ ran: true, reached: false, transport: 'cli', reason: r }))
}

// ── execute ──────────────────────────────────────────────────────────────────────────────────────
console.log(`OLD (pre-fix): ${OLD}`)
console.log(`NEW (fixed)  : ${NEW}\n`)
const cacheOld = new Map(), cacheNew = new Map()
const get = (cache, engine, args, tag) => {
  const k = JSON.stringify(args)
  if (!cache.has(k)) cache.set(k, run(engine, args, tag + '_' + cache.size))
  return cache.get(k)
}

/* ⚠ CHECK THE ENGINE LOADS AT ALL, FIRST AND LOUDLY. While writing this suite an apostrophe in
   `the third eye's budget` closed a single-quoted meta string; `node --check` reported SYNTAX OK
   and the engine did not load, and the only symptom was 14 unrelated checks failing at once. A
   suite whose first symptom of "the file is broken" is a wall of red is a suite that will send the
   next reader debugging the wrong thing. THE COUNT IS THE TELL — so name it. */
// The baseline must exist, be a FILE, and BOOT — otherwise "old=RED" is meaningless.
let oldStat = null
try { oldStat = statSync(OLD) } catch {}
if (!OLD || !oldStat || !oldStat.isFile()) {
  console.log(`❌ NO PRE-FIX BASELINE — refusing to run.`)
  console.log(`   Resolved OLD to: ${OLD || '(nothing)'}${oldStat && !oldStat.isFile() ? ' (a DIRECTORY, not a file)' : ''}`)
  console.log(`   Without a baseline every check would report old=RED because the file is missing,`)
  console.log(`   not because the behaviour is absent — which is a suite of vacuous proofs that look`)
  console.log(`   identical to real ones. Pass the pre-fix engine explicitly:`)
  console.log(`     node v40_defects_proof.mjs /path/to/konyo-workflow.js.bak-pre-v40-…`)
  process.exit(2)
}
const oldBoot = get(cacheOld, OLD, { task: 'boot check' }, 'oldboot')
if (!oldBoot || !oldBoot.ok || !oldBoot.result) {
  console.log(`❌ THE PRE-FIX BASELINE DOES NOT BOOT (${OLD}) — its RED results would be meaningless.`)
  console.log(`   ${oldBoot ? oldBoot.error : '(no dump produced)'}`)
  process.exit(2)
}
console.log('✅ pre-fix baseline loads and runs — its RED means the behaviour is genuinely absent')
const boot = get(cacheNew, NEW, { task: 'boot check' }, 'boot')
if (!boot || !boot.ok || !boot.result) {
  console.log(`❌ THE ENGINE DOES NOT LOAD — every check below is meaningless until this is fixed.`)
  console.log(`   ${boot ? boot.error : '(no dump produced)'}`)
  console.log(`   NOTE: \`node --check\` can pass on a file that fails to load; that is what this harness is for.`)
  process.exit(1)
}
console.log('✅ engine loads and runs to a payload\n')

/* ── CONTROLS vs PROOFS, LABELLED, BECAUSE THEY NEED DIFFERENT BARS ──────────────────────────────
   A PROOF asserts new behaviour, so "green on the old engine too" means it proves nothing and is a
   FAILURE — that rule is the whole point of this suite and is not relaxed.
   A CONTROL is a check that is SUPPOSED to be green everywhere, and there are exactly two kinds
   here: NEGATIVE CONTROLS ("the fix must NOT fire on a correct run" — trivially true before the fix
   existed) and INSTRUMENT SELF-TESTS (they exercise load_harness.mjs, which is shared by both
   engines, so both must agree by construction).
   They are marked, counted and PRINTED separately rather than quietly folded in with the proofs,
   because a control silently counted as a proof would inflate the number that is supposed to mean
   "this many behaviours were demonstrated to be new" — the same defect this whole engine is being
   fixed for, in the scoreboard of its own test suite. */
let pass = 0, fail = 0, controls = 0
for (const c of CHECKS) {
  let redOK = false, greenOK = false, err = ''
  try { redOK = !c.ok(get(cacheOld, OLD, c.args, 'old')) } catch { redOK = true }
  try { greenOK = !!c.ok(get(cacheNew, NEW, c.args, 'new')) } catch (e) { err = e.message }
  if (c.control) {
    /* ⚠ THE LABEL MUST NOT ASSERT WHAT WAS NOT CHECKED. This printed "green on both engines by
       design" for every control — but a control's old-engine result is deliberately NOT a
       requirement, and some of them ARE red there (D11.3 reads a payload field the old engine does
       not have). Claiming both were green was a statement nobody had verified, inside the suite
       whose entire subject is claims that outrun their evidence. It now reports what it observed. */
    if (greenOK) { controls++; console.log(`🔵 ${c.id} [CONTROL — green on the fixed engine; old=${redOK ? 'red' : 'green'}, not required either way] ${c.what}`) }
    else { fail++; console.log(`❌ ${c.id} [CONTROL FAILED on the fixed engine] ${c.what}${err ? ' — ' + err : ''}`) }
    continue
  }
  const verdict = greenOK && redOK ? 'PASS' : greenOK && !redOK ? 'NOT-A-PROOF (green on the OLD engine too)' : 'FAIL'
  if (verdict === 'PASS') pass++; else fail++
  console.log(`${verdict === 'PASS' ? '✅' : '❌'} ${c.id} [old=${redOK ? 'RED' : 'green'} new=${greenOK ? 'GREEN' : 'red'}] ${c.what}${err ? ' — ' + err : ''}`)
}

// ── classifySilence: a table, including the two cases the THIRD EYE found on this very diff ─────
/* Grok reviewed this change and refuted two things about the first cut, both real:
   (b) a genuine transport failure whose text contains the word "timeout" was filed as
       timed_out_mid_work — the exact conflation the classifier exists to end;
   (c) a seat downgraded for unprovable evidence keeps its original reason as a tail, so a timeout
       word in that tail beat the more specific no_evidence determination.
   Both are pinned here so they cannot come back. (Grok also flagged `_whyFor` as undeclared — that
   was a FALSE POSITIVE caused by an elided paste; `_whyFor` is declared and D2.4 proves it runs.
   A finding is reproduced before it is acted on, never taken wholesale.) */
function classifierFor(engine) {
  const src = readFileSync(engine, 'utf8')
  const m = src.match(/function classifySilence\(rec\) \{[\s\S]*?\n\}/)
  if (!m) return null
  return new Function('return (' + m[0] + ')')()
}
const EVIDENCE_DOWNGRADE =
  'claimed cli but produced no command/raw stdout as evidence — an unverifiable independent review ' +
  'is recorded as no review. grok timed out after 180s (perl alarm, exit 142)'
const CLS_TABLE = [
  ['REAL journal seat 1', { ran: true, reached: false, transport: 'cli', reason: 'grok timed out after 180s (perl alarm, exit 142). The CLI was invoked correctly and grok began working' }, 'timed_out_mid_work'],
  ['REAL journal seat 2', { ran: true, reached: false, transport: 'cli', reason: 'grok timed out after 180s (perl alarm, exit 142). Partial stderr before the kill showed Grok mid-investigation' }, 'timed_out_mid_work'],
  ['REAL journal seat 3', { ran: true, reached: false, transport: 'cli', reason: 'grok timed out after 180s (perl alarm, exit 142). The CLI was mid-review (reading tv/conftest.py' }, 'timed_out_mid_work'],
  ['REAL journal seat 4', { ran: true, reached: false, transport: 'cli', reason: 'grok timed out after 180s (perl alarm, exit 142). Partial stdout was captured showing it was mid-review' }, 'timed_out_mid_work'],
  ['ceiling refusal', { ran: true, reached: false, transport: 'none', reason: 'the agent ceiling refused this seat — the run could not afford to ask. This is NOT a transport failure' }, 'never_asked_ceiling'],
  ['GROK (b): a DEAD API whose text says "timeout"', { ran: true, reached: false, transport: 'none', reason: 'connection timeout to api.x.ai after 30s: ECONNREFUSED' }, 'transport_down'],
  ['GROK (b): read timeout on a dead socket', { ran: true, reached: false, transport: 'none', reason: 'the MCP call failed: request timeout, no route to host' }, 'transport_down'],
  ['GROK (c): evidence downgrade whose TAIL mentions a timeout', { ran: true, reached: false, transport: 'cli', reason: EVIDENCE_DOWNGRADE }, 'no_evidence'],
  ['claude stand-in', { ran: true, reached: false, transport: 'claude-standin', reason: 'same family' }, 'standin'],
  ['thirdEye off', { ran: false, reached: false, transport: 'none', reason: 'thirdEye:false' }, 'not_asked_off'],
  ['a plain dead transport', { ran: true, reached: false, transport: 'none', reason: 'grok exited 127: command not found' }, 'transport_down'],
]
const oldFn = classifierFor(OLD), newFn = classifierFor(NEW)
console.log('')
for (const [label, rec, want] of CLS_TABLE) {
  let got = null, oldGot = null
  try { got = newFn && newFn(rec) } catch (e) { got = 'THREW: ' + e.message }
  try { oldGot = oldFn && oldFn(rec) } catch { oldGot = null }
  const green = got === want
  const red = oldGot !== want           // absent classifier => null => genuinely red
  const verdict = green && red ? 'PASS' : green ? 'NOT-A-PROOF (old agreed)' : 'FAIL'
  if (green && red) pass++; else fail++
  console.log(`${green && red ? '✅' : '❌'} CLS  [old=${oldGot === null ? 'RED (no classifier)' : oldGot === want ? 'green' : 'RED (' + oldGot + ')'} new=${got}] ${label} → expected ${want}`)
}

console.log(`\n${fail === 0 ? '✅ ALL GREEN' : '❌ ' + fail + ' FAILED'} — ${pass} PROOF(S) (each verified RED on the pre-fix engine), ` +
  `${controls} control(s) (green on the fixed engine; old-engine result not required), ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
