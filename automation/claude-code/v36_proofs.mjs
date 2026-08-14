#!/usr/bin/env node
/* RED-then-GREEN proofs for konyo-workflow.js v36 §C1, §C4, §C5, §C6.
   Every block under test is EXTRACTED FROM THE LIVE FILE at run time — never retyped here — so a
   proof cannot pass against a copy of the code while the real code says something else. */
import { readFileSync } from 'node:fs'
import { enginePath } from './engine_path.mjs'

const SRC_PATH = enginePath(process.argv[2])
const src = readFileSync(SRC_PATH, 'utf8')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

let pass = 0, fail = 0
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`) }
  else { fail++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`) }
}
/* When this suite is pointed at the PRE-FIX file (the whole point of a RED baseline), the markers
   are legitimately absent. Throwing aborts the report at the first missing block, so the remaining
   sections are never seen. Missing markers are recorded as failures and extraction yields '' — and
   every block has an "extracted ... whole" assertion below, which is what stops '' from turning a
   negative assertion into a false pass. */
const SOFT = process.env.SOFT_EXTRACT === '1'
const miss = (msg) => { if (!SOFT) throw new Error(msg); fail++; console.log(`  ❌ ${msg}`); return '' }
const attempt = (name, fn) => { try { return fn() } catch (e) { fail++; console.log(`  ❌ ${name} — ${e.message}`) } }

/* Pull a brace-balanced block starting at `marker`. Verifies it terminated, so a bad extraction
   fails loudly instead of testing half a block. */
function block(marker) {
  const i = src.indexOf(marker)
  if (i < 0) return miss(`EXTRACTION FAILED — marker not in live file: ${marker}`)
  let depth = 0, started = false
  for (let j = i; j < src.length; j++) {
    const c = src[j]
    if (c === '{') { depth++; started = true }
    else if (c === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error(`EXTRACTION FAILED — unbalanced from: ${marker}`)
}
function lines(from, to) {
  const i = src.indexOf(from), j = src.indexOf(to)
  if (i < 0 || j < 0) return miss(`EXTRACTION FAILED — ${i < 0 ? from : to}`)
  return src.slice(i, j + to.length)
}
/* ⚠ `lines()` ends at the FIRST match of its end marker, which silently TRUNCATED two extractions
   on the first run of this file: C4 lost its entire `else if` branch (the naming check) and C5 lost
   TE_DEGRADED, because both end markers occur earlier in an adjacent line. The proofs went RED and
   looked like engine bugs; they were fixture bugs. Anchor on a LATE unique string instead, and let
   the "extracted the real block" assertions below check for text from the END of the block. */
function spanTo(from, lateUnique, closer = '\n  }') {
  const i = src.indexOf(from)
  if (i < 0) return miss(`EXTRACTION FAILED — ${from}`)
  const k = src.indexOf(lateUnique, i)
  if (k < 0) return miss(`EXTRACTION FAILED — late marker absent: ${lateUnique}`)
  const j = src.indexOf(closer, k)
  if (j < 0) return miss(`EXTRACTION FAILED — no closer after: ${lateUnique}`)
  return src.slice(i, j + closer.length)
}

// ───────────────────────── C1 — the plan seat can stop the fleet ─────────────────────────
console.log('\nC1 — plan seat return is acted on (was: discarded)')
const C1 = block('if (USE_GROK && !TINYQ) {')
ok('extracted the REAL plan-seat block', /thirdEyeAsk\('plan'/.test(C1) && /return bail\(/.test(C1))

async function runC1(seatRec, opts = {}) {
  const state = { blockers: [], bailed: null, logs: [], buildOpened: false }
  const fn = new AsyncFunction(
    'USE_GROK', 'TINYQ', 'phase', 'thirdEyeAsk', 'items', 'TASK', 'blocker', 'bail', 'log',
    'THIRD_EYE_SEATS', 'state',
    // the block, then a line that only runs if the block did NOT return — that is "Build+Gate opened"
    C1 + '\n; state.buildOpened = true; return "fell-through"'
  )
  const out = await fn(
    opts.useGrok !== false, !!opts.tiny,
    () => {}, async () => seatRec,
    [{ tier: 'sonnet', file: 'a.js', instruction: 'do a thing' }], 'a task',
    (what, why) => state.blockers.push({ what, why }),
    (o) => { state.bailed = o; return o },
    (m) => state.logs.push(String(m)),
    [{ seat: 'plan', ran: true, reached: !!seatRec.reached }], state,
  )
  return { ...state, out }
}

// RED: a reached, blocking refusal must stop the run before Build+Gate
{
  const r = await runC1({ reached: true, severity: 'blocking', transport: 'cli',
    concerns: ['this plan solves the wrong problem'], reason: '' })
  ok('RED  blocking+reached ⇒ Build+Gate NEVER opens', r.buildOpened === false)
  ok('RED  blocking+reached ⇒ bail() called, shippable false', !!r.bailed && r.bailed.shippable !== true)
  ok('RED  blocking+reached ⇒ a blocker is recorded', r.blockers.length === 1 &&
     /BLOCKING REFUSAL/.test(r.blockers[0].what), JSON.stringify(r.blockers))
  ok('RED  the concern text reaches the blocker', /wrong problem/.test(r.blockers[0]?.why || ''))
  ok('RED  the seat ledger rides out in the payload', !!(r.bailed && r.bailed.thirdEye &&
     r.bailed.thirdEye.of === 1))
}
// GREEN: no concerns ⇒ the run continues
{
  const r = await runC1({ reached: true, severity: 'none', transport: 'cli', concerns: [], reason: '' })
  ok('GREEN severity none ⇒ Build+Gate opens', r.buildOpened === true)
  ok('GREEN severity none ⇒ no blocker, no bail', r.blockers.length === 0 && r.bailed === null)
}
// GREEN: advisory concerns are recorded, not obeyed
{
  const r = await runC1({ reached: true, severity: 'major', transport: 'cli', concerns: ['I would order it differently'], reason: '' })
  ok('GREEN severity major (advisory) ⇒ run continues', r.buildOpened === true && r.blockers.length === 0)
}
// GREEN: SILENCE IS NOT A REFUSAL — an unreachable transport must not abort every run on the machine
{
  const r = await runC1({ reached: false, severity: 'blocking', transport: 'none', concerns: [], reason: 'grok timed out' })
  ok('GREEN unreachable+blocking ⇒ does NOT block (silence ≠ refusal)', r.buildOpened === true && r.blockers.length === 0)
}
// v36.1 GREEN: a bare enum with NO stated concern must not kill a run
{
  const r = await runC1({ reached: true, severity: 'blocking', transport: 'cli', concerns: [], reason: '' })
  ok('GREEN blocking with EMPTY concerns ⇒ does NOT abort (a veto must carry its words)',
     r.buildOpened === true && r.blockers.length === 0)
}
// v36.1 GREEN: a seat that contradicts itself does not get to abort
{
  const r = await runC1({ reached: true, severity: 'blocking', verdict: 'no concerns',
    transport: 'cli', concerns: ['something'], reason: '' })
  ok('GREEN severity:blocking + verdict:"no concerns" ⇒ does NOT abort (self-contradictory veto)',
     r.buildOpened === true && r.blockers.length === 0)
}
// GREEN: tiny skips the seat entirely
{
  const r = await runC1({ reached: true, severity: 'blocking', transport: 'cli', concerns: ['x'] }, { tiny: true })
  ok('GREEN tiny ⇒ plan seat not asked, run continues', r.buildOpened === true && r.blockers.length === 0)
}

// ───────────────────────── C4 — provenance names the transport ─────────────────────────
console.log('\nC4 — provenance must NAME the transport (was: any non-empty string)')
const C4 = spanTo('const _cmd = String(rec.command || \'\')', 'not evidence of independence')
// these markers come from the START, the MIDDLE and the END of the block — truncation cannot pass
ok('extracted the REAL provenance block, whole',
   /_namesTransport/.test(C4) && /GROK_MCP_PREFIX/.test(C4) &&
   /else if \(rec\.reached/.test(C4) && /not evidence of independence/.test(C4))

function runC4(rec) {
  const r = { severity: 'none', concerns: [], reason: '', ...rec }
  new Function('rec', 'GROK_CLI', 'GROK_MCP_PREFIX', C4)(
    r, '/Users/konyo/.grok/bin/grok', 'mcp__grok-mcp__')
  return r
}
{
  const r = runC4({ reached: true, transport: 'cli', command: 'echo hi', raw_head: 'looks like grok' })
  ok('RED  fabricated command ⇒ downgraded to NOT reached', r.reached === false)
  ok('RED  the reason names why', /does not name/.test(r.reason), r.reason)
}
ok('RED  empty evidence ⇒ not reached',
   runC4({ reached: true, transport: 'cli', command: '', raw_head: '' }).reached === false)
ok('RED  mcp claimed but command is the CLI ⇒ not reached',
   runC4({ reached: true, transport: 'mcp', command: '/Users/konyo/.grok/bin/grok -p hi', raw_head: 'x' }).reached === false)
ok('GREEN real CLI path stays reached',
   runC4({ reached: true, transport: 'cli', raw_head: 'Grok says...',
     command: 'perl -e ... 180 /Users/konyo/.grok/bin/grok --cwd . --prompt-file /tmp/te.txt' }).reached === true)
ok('GREEN tilde form of the same binary stays reached',
   runC4({ reached: true, transport: 'cli', command: '~/.grok/bin/grok --prompt-file /tmp/x', raw_head: 'y' }).reached === true)
ok('GREEN v36.1 ~/.local/bin/grok symlink stays reached (verified real on this machine)',
   runC4({ reached: true, transport: 'cli', command: '~/.local/bin/grok --prompt-file /tmp/x', raw_head: 'y' }).reached === true)
ok('GREEN v36.1 bare `grok` on PATH stays reached',
   runC4({ reached: true, transport: 'cli', command: 'grok --cwd . --prompt-file /tmp/x', raw_head: 'y' }).reached === true)
ok('GREEN v36.1 versioned binary grok-1.0.3-macos-aarch64 stays reached',
   runC4({ reached: true, transport: 'cli', raw_head: 'y',
     command: '/Users/konyo/.grok/downloads/grok-1.0.3-macos-aarch64 --prompt-file /tmp/x' }).reached === true)
ok('GREEN v36.1 the perl-wrapped command (grok past char 250) stays reached',
   runC4({ reached: true, transport: 'cli', raw_head: 'y',
     command: "perl -e 'my $t=shift; my $p=fork; die unless defined $p; if(!$p){exec @ARGV; exit 127} $SIG{ALRM}=sub{kill \"TERM\",$p; waitpid($p,0); exit 142}; alarm $t; waitpid($p,0); my $st=$?; alarm 0; exit(($st & 127) ? 128+($st & 127) : ($st >> 8));' 180 /Users/konyo/.grok/bin/grok --prompt-file /tmp/x" }).reached === true)
ok('RED  v36.1 still refuses a non-grok command',
   runC4({ reached: true, transport: 'cli', command: 'echo hi | cat', raw_head: 'looks like grok' }).reached === false)
ok('GREEN real MCP tool stays reached',
   runC4({ reached: true, transport: 'mcp', command: 'mcp__grok-mcp__chat({model:"grok-4.3"})', raw_head: 'y' }).reached === true)
ok('GREEN claude-standin is exempt (already forced not-reached elsewhere)',
   runC4({ reached: true, transport: 'claude-standin', command: '', raw_head: '' }).reached === true)

// ───────────────────────── C5 — degraded is not one bit ─────────────────────────
console.log('\nC5 — degraded reflects PARTIAL panels (was: all-or-nothing)')
const C5 = spanTo('const TE_ASKED_FOR = THIRD_EYE !== \'off\'', 'const TE_DEGRADED', '\n')
ok('extracted the REAL ledger consts, whole',
   /TE_ASKED_FOR/.test(C5) && /TE_SPOKE/.test(C5) && /TE_SILENT/.test(C5) &&
   /TE_ATTEMPTED/.test(C5) && /TE_PARTIAL/.test(C5) && /const TE_DEGRADED =/.test(C5))

function runC5(reachedN, attemptedN, thirdEye = 'grok') {
  const seats = []
  for (let i = 0; i < attemptedN; i++) seats.push({ seat: 's' + i, ran: true, reached: i < reachedN })
  const out = new Function('THIRD_EYE', 'THIRD_EYE_SEATS',
    C5 + '\n; return {degraded: TE_DEGRADED, partial: TE_PARTIAL, spoke: TE_SPOKE.length, attempted: TE_ATTEMPTED}')
  try { return out(thirdEye, seats) }
  catch (e) { return { degraded: null, partial: null, spoke: null, attempted: null, err: e.message } }
}
{
  const r = runC5(1, 4)
  ok('RED  1 of 4 seats ⇒ degraded TRUE (old code said false)', r.degraded === true, JSON.stringify(r))
  ok('RED  1 of 4 seats ⇒ partial TRUE', r.partial === true)
}
{
  const r = runC5(4, 4)
  ok('GREEN 4 of 4 ⇒ not degraded, not partial', r.degraded === false && r.partial === false, JSON.stringify(r))
}
{
  const r = runC5(0, 4)
  ok('GREEN 0 of 4 ⇒ degraded TRUE, partial FALSE (nobody reviewed anything)',
     r.degraded === true && r.partial === false, JSON.stringify(r))
}
ok('GREEN thirdEye:off ⇒ not called degraded (nothing was asked for)',
   runC5(0, 0, 'off').degraded === false)

// the note string must not claim a full independent review on a partial panel
const noteBlock = spanTo('note: !TE_ASKED_FOR ?', 'nothing outside Claude reviewed this run', '\n  },')
ok('GREEN the PARTIAL note refuses the "reviewed this run" sentence',
   /TE_PARTIAL \?/.test(noteBlock) && /Do not read this as an independent review/.test(noteBlock))

// ───────────────────────── C6 — the ledger is computed BEFORE the verdict ─────────────────────────
console.log('\nC6 — ledger computed above SHIPPABLE (was: ~90 lines below it)')
const iLedger = src.indexOf('const TE_ATTEMPTED')
const iShip   = src.indexOf('const SHIPPABLE = APPLY')
ok('RED  ordering: TE ledger is declared ABOVE SHIPPABLE', iLedger > 0 && iLedger < iShip,
   `ledger@${iLedger} ship@${iShip}`)
ok('GREEN exactly one declaration of each const (no second copy of the decision)',
   ['TE_ASKED_FOR', 'TE_SPOKE', 'TE_SILENT', 'TE_ATTEMPTED', 'TE_PARTIAL', 'TE_DEGRADED']
     .every(v => (src.match(new RegExp('^const ' + v + ' ', 'gm')) || []).length === 1))
/* ⚠ was `indexOf(...) < iShip` alone — which is TRUE at -1, i.e. it passed on the pre-fix file
   precisely because the blocker did not exist. Existence must be asserted before position. */
const iPlanBlocker = src.indexOf('THE PLAN SEAT RETURNED A BLOCKING REFUSAL')
ok('GREEN the plan seat raises its blocker ABOVE the SHIPPABLE read',
   iPlanBlocker > 0 && iPlanBlocker < iShip, `blocker@${iPlanBlocker} ship@${iShip}`)

// ───────────────────────── C2/C3 — text-level proofs on the courier prompt ─────────────────────────
console.log('\nC2/C3 — the courier prompt')
/* ⚠ THIS ONE WAS A FALSE PASS, AND IT IS THE MOST IMPORTANT NOTE IN THIS FILE.
   It read `block('function grokHow(question, opts = {}) {')`. block() balances braces from the
   marker — and the marker itself ENDS with the `{}` of the `opts = {}` default parameter, so the
   scan opened and closed on that empty object and returned just the signature line. The extraction
   was ~45 characters of function header containing no prompt text at all. The RED assertion
   `!/known-dead key/` therefore PASSED — against a string that could not have contained it either
   way. A negative test on an empty haystack always passes; it proves nothing and reads as proof.
   The three GREEN assertions failed and exposed it. That is the whole argument for pairing every
   RED with a GREEN on the same extraction: a proof that can only go one way is not a proof. */
const grokHow = spanTo('function grokHow(question, opts = {}) {', 'the words are not yours', '\n}')
ok('extracted the REAL courier prompt, whole (not just the signature)',
   grokHow.length > 1500 && /TRANSPORT — do this literally/.test(grokHow) &&
   /the words are not yours/.test(grokHow), `${grokHow.length} chars`)
ok('RED  courier no longer briefs a dead key', !/known-dead key/.test(grokHow))
ok('GREEN courier is told to report the ACTUAL error', /ACTUAL error text you received/.test(grokHow))
ok('RED  courier no longer runs a bare CLI — the perl wrapper is in the command',
   /\$\{PERL_ALARM\}/.test(grokHow))
ok('GREEN courier is told exit 142 = timeout, never agreement', /142/.test(grokHow) && /NEVER agreement/.test(grokHow))
/* ⚠ was tested against grokHow only — but the stale pin never lived in the courier prompt, it lived
   in the block comment above GROK_CLI. Asserting it on the prompt passed on the PRE-FIX file too:
   a RED test aimed at the wrong file region is indistinguishable from a fix. Test the WHOLE file. */
ok('RED  no stale version pin anywhere in the FILE', !/0\.2\.118/.test(src))
ok('GREEN the file records the measured version instead', /grok 1\.0\.3|`grok --version`/.test(src))

console.log(`\n${fail === 0 ? '✅ ALL GREEN' : '❌ FAILURES'} — ${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
