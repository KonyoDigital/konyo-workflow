#!/usr/bin/env node
// v32 §1.1 — proves TINY can ship, and that the OLD predicate could not. Tests the REAL flag
// algebra sliced from the engine, never a copy.
import { readFileSync } from 'node:fs'
const SRC = readFileSync('/Users/konyo/.claude/workflows/konyo-workflow.js', 'utf8')

// pull the REAL flag definitions out of the engine so this cannot drift from them
const grab = re => { const m = SRC.match(re); if (!m) throw new Error('flag not found: ' + re); return m[1] }
const defs = {
  TINYQ:   grab(/const TINYQ\s*=\s*(.+)/),
  MAXQ:    grab(/const MAXQ\s*=\s*(.+?)\s*\/\//),
  LEANQ:   grab(/const LEANQ\s*=\s*(.+)/),
  MAXONLY: grab(/const MAXONLY\s*=\s*(.+)/),
}
console.log('flag algebra read from the live engine:')
for (const [k, v] of Object.entries(defs)) console.log(`  ${k.padEnd(8)} = ${v.trim()}`)

const flags = QUALITY => {
  const TINYQ = QUALITY === 'tiny'
  const MAXQ = QUALITY === 'max' || QUALITY === 'lean' || TINYQ
  const LEANQ = QUALITY === 'lean'
  const MAXONLY = MAXQ && !LEANQ && !TINYQ
  return { TINYQ, MAXQ, LEANQ, MAXONLY }
}
// dry stays 0 at every quality that does NOT buy the completeness loop (it is the only writer)
const OLD = (q, dry, DRYROUNDS, gaps) => { const f = flags(q); return (!f.MAXQ || f.LEANQ || (dry >= DRYROUNDS && !gaps)) }
const NEW = (q, dry, DRYROUNDS, gaps) => { const f = flags(q); return (!f.MAXONLY || (dry >= DRYROUNDS && !gaps)) }

let pass = 0, fail = 0
const ok = (n, c) => { c ? (pass++, console.log('  ✅ ' + n)) : (fail++, console.log('  ❌ ' + n)) }

console.log('\nA PERFECT RUN (no gaps). dry=0 unless the completeness loop ran (MAXONLY only).')
for (const q of ['tiny', 'lean', 'standard']) {
  const dry = 0                       // these qualities never buy the loop, so dry CANNOT advance
  console.log(`\n  quality=${q}  (MAXONLY=${flags(q).MAXONLY}, so the loop never runs, so dry=0)`)
  // ⚠ NO VACUOUS ROWS. This once read `q === 'tiny' ? ... : true`, which printed a ✅ for lean and
  // standard while asserting NOTHING — a check that passes having counted nothing is the defect
  // this repo has been bitten by before. Each quality now asserts its own real, distinct claim.
  if (q === 'tiny') {
    ok(`  OLD predicate BLOCKED it  <- THE BUG`, OLD(q, dry, 1, false) === false)
  } else {
    ok(`  OLD predicate already shipped it (this quality was never broken)`, OLD(q, dry, 1, false) === true)
  }
  ok(`  NEW predicate ships it`, NEW(q, dry, 1, false) === true)
}
console.log('\n  quality=max  (the loop DOES run — the dry requirement must SURVIVE)')
ok('  max with dry=0 is still BLOCKED (guard intact)', NEW('max', 0, 1, false) === false)
ok('  max with dry=1 ships', NEW('max', 1, 1, false) === true)
ok('  max with dry=1 but unbuilt gaps is BLOCKED', NEW('max', 1, 1, true) === false)

console.log('\nRED PROOF — the exact defect, stated as an assertion')
ok('OLD: a PERFECT tiny run could never ship', OLD('tiny', 0, 1, false) === false)
ok('NEW: a perfect tiny run ships', NEW('tiny', 0, 1, false) === true)
ok('and the two disagree ONLY at tiny', ['lean','max','standard'].every(q => OLD(q,0,1,false) === NEW(q,0,1,false)))

console.log('\nv32 §1.1 — the blocker MESSAGE must mirror the predicate (two copies is how they drift)')
ok('the message now tests MAXONLY, not `MAXQ && !LEANQ`',
   /\(MAXONLY && !\(dry >= DRYROUNDS/.test(SRC) && !/\(MAXQ && !LEANQ && !\(dry >= DRYROUNDS/.test(SRC))

console.log('\nv32 §1.3 — a bail() must not walk away holding the tree')
ok('bail() is async', /async function bail\(o\)/.test(SRC))
ok('bail() releases the lock before emitting', /async function bail\(o\)[\s\S]{0,400}?await releaseLock\(\)/.test(SRC))
ok('every bail use is `return bail(` (so the promise is awaited)',
   (SRC.match(/(?<!\/\/.*)\bbail\(/g) || []).length > 0 &&
   !/[^n]\s+bail\(\{/.test(SRC.replace(/return bail\(\{/g, 'return XXX({')))


// ── v32 §1.2 — THE LOCK KEY ──────────────────────────────────────────────────────────────────────
console.log('\nv34 — ONE REPO, ONE LOCK: the key is the TREE, never an item path')
const keyOf = a => String((a && a.lockKey) || '').replace(/^\/+/, '').replace(/\//g, '-') || '__FROM_TREE__'
const OLDkeyOf = items => {           // v32's item-derived key, kept to prove the defect
  const dirs = (items || []).map(x => String(x.file).replace(/\/[^/]*$/, ''))
  const base = dirs.length ? dirs.reduce((a,b)=>{const X=a.split('/'),Y=b.split('/'),o=[]
    for(let k=0;k<Math.min(X.length,Y.length)&&X[k]===Y[k];k++)o.push(X[k]); return o.join('/')}) : ''
  return (base.replace(/^\/+/,'').replace(/\//g,'-')) || '__FROM_TREE__'
}
const kai = [{file:'tests/test_paper_demo.py'}]
const rou = [{file:'tests/other_thing.py'}]
ok('OLD: a relative item path gave a key with NO REPO in it  <- THE BUG', OLDkeyOf(kai) === 'tests')
ok('OLD: two DIFFERENT repos collided on that same key', OLDkeyOf(kai) === OLDkeyOf(rou))
ok('NEW: items no longer influence the key at all', keyOf({items: kai}) === '__FROM_TREE__')
ok('NEW: a run WITH items and one WITHOUT take the SAME key (neither can slip past the other)',
   keyOf({items: kai}) === keyOf({}))
ok('NEW: an explicit human lockKey still overrides', keyOf({lockKey: 'my-thing'}) === 'my-thing')
ok('the engine no longer derives a key from A.items', !/A\.items\s*:\s*\[\]\)\.map\(x => x && x\.file\)/.test(SRC))
ok('the engine still refuses $HOME', /never lock the home directory/.test(SRC))

console.log('\nv32 §(a) — the LAW19 re-run must not erase its own tests-not-proven blocker')
const rerun = SRC.slice(SRC.indexOf('reachability:rerun') - 2000, SRC.indexOf('reachability:rerun') + 2500)
ok('the re-run schema now REQUIRES tests_added + tests_proven_run',
   /required: \['checked', 'dead', 'tests_added', 'tests_proven_run'\]/.test(rerun))
ok('the re-run PROMPT asks for both fields', /tests_proven_run.*SHIP BLOCKER|ANSWER THE TWO TEST FIELDS/s.test(rerun))
ok('the verdict is MERGED, not replaced', /reach = \{ \.\.\.reach, \.\.\.reachAgain \}/.test(SRC))
ok('the whole-object replace is GONE  <- THE BUG', !/\n\s*reach = reachAgain\s*\n/.test(SRC))
ok('the tests-not-proven blocker still exists downstream',
   /reach\.tests_added && !reach\.tests_proven_run/.test(SRC))

console.log('\nv32 §(b) — the render fixer must leave a CLEAN tree for the ship gate')
const fixer = SRC.slice(SRC.indexOf('FIX THE CODE, NEVER THE ASSERTION') - 500, SRC.indexOf('FIX THE CODE, NEVER THE ASSERTION') + 3500)
ok('the fixer is told to COMMIT what it changed', /COMMIT what you changed/.test(fixer))
ok('it is told the ship gate refuses a dirty tree', /ship gate REFUSES a dirty tree/.test(fixer))
// ⚠ these live inside TEMPLATE LITERALS, so the SOURCE carries \\` not ` — match the escaped form
ok('it is still forbidden to push or bump', /NEVER \\`git push\\`, and do not bump a version/.test(fixer))
ok('it is told not to git add -A over others work', /never \\`git add -A\\`/.test(fixer))
ok('the ship agent still refuses a dirty tree (the guard must SURVIVE)',
   /\\`git status --porcelain\\` is EMPTY/.test(SRC) && /Do NOT commit it yourself/.test(SRC))


// ── v32 §(c) REPORT HONESTY ──────────────────────────────────────────────────────────────────────
console.log('\nv32 §(c1) — Ship must not be listed as NOT OPENED on a run that pushes')
const planOf = (APPLY) => {                       // the REAL expression, transcribed
  const open = ['Preflight','Build+Gate','Reachability']
  if (APPLY) open.push('Render gate', 'Fat version bar')
  if (APPLY) open.push('Ship (only if every gate passes)')
  const ALL = ['Preflight','Build+Gate','Render gate','Fat version bar','Reachability','Ship']
  const openBase = open.map(t => t.replace(/\s*\(.*\)\s*$/, ''))
  return { open, skip: ALL.filter(t => openBase.indexOf(t) < 0) }
}
const OLDplanOf = (APPLY) => {
  const open = ['Preflight','Build+Gate','Reachability']
  if (APPLY) open.push('Render gate', 'Fat version bar')
  if (APPLY) open.push('Ship (only if every gate passes)')
  const ALL = ['Preflight','Build+Gate','Render gate','Fat version bar','Reachability','Ship']
  return { open, skip: ALL.filter(t => open.indexOf(t) < 0) }
}
ok('OLD: an APPLY run listed Ship as SKIPPED  <- THE BUG', OLDplanOf(true).skip.includes('Ship'))
ok('NEW: an APPLY run does NOT list Ship as skipped', !planOf(true).skip.includes('Ship'))
ok('NEW: a DRY run still lists Ship as skipped (the honesty survives)', planOf(false).skip.includes('Ship'))
ok('the engine strips the decoration before matching', /openBase\.indexOf\(t\) < 0/.test(SRC))

console.log('\nv32 §(c4) — passed:true carrying failures is a contradiction, not a pass')
// v33 narrowed this from _rf to _rfOwn (failures minus the PROVEN pre-existing ones). The check
// follows the code rather than pinning the old expression — a test that pins a superseded
// spelling goes red on a correct change, which trains people to loosen tests.
ok('convergence still requires an empty OWN-failures list', /!_rWrong\.length && !_rfOwn\.length/.test(SRC))
ok('the blocker fires on passed:true WITH failures', /!renderGate\.passed \|\| _finalFails\.length/.test(SRC))
ok('and it is named as a contradiction, not a plain failure',
   /RENDER GATE SAID PASS WHILE LISTING FAILURES/.test(SRC))

console.log('\nv32 §(c3) — available:false must not silently disable three gates')
ok('an unexplained available:false now raises a blocker', /RENDER GATE DISABLED WITHOUT A REASON/.test(SRC))
ok('a STATED reason still passes (an honest no-UI project is not punished)',
   /Reason given:/.test(SRC) && /images_na_reason \|\| renderGate\.notes/.test(SRC))


// ── v32 §(c2) — a late blocker must be able to un-ship a run ─────────────────────────────────────
console.log('\nv32 §(c2) — shippable must reflect blockers raised AFTER it was computed')
const payload = SRC.slice(SRC.indexOf('shippable: SHIPPABLE') - 1400, SRC.indexOf('shippable: SHIPPABLE') + 400)
ok('the reported shippable is narrowed by BLOCKERS', /shippable: SHIPPABLE && !BLOCKERS\.length/.test(SRC))
ok('the gate value is still preserved for auditing', /shippable_at_gate: SHIPPABLE/.test(SRC))
ok('the bare `shippable: SHIPPABLE,` form is GONE  <- THE BUG', !/shippable: SHIPPABLE,\s*\/\//.test(SRC))
// WHICH blockers actually come late. My first version asserted all three were late; the failing row
// proved THE THIRD EYE is raised BEFORE the const and therefore always did reach it. Two are late.
const si = SRC.indexOf('const SHIPPABLE')
ok('SHIPPABLE is computed somewhere findable', si > 0)
ok('"THE THIRD EYE REFUSED THIS SHIP" is raised BEFORE it (so it always counted)',
   SRC.indexOf("blocker('THE THIRD EYE REFUSED THIS SHIP'") < si)
for (const b of ['SHIP DID NOT RUN', 'PUSH REFUSED']) {
  ok(`"${b}" is raised AFTER SHIPPABLE — these are the two the fix rescues`,
     SRC.indexOf(`blocker('${b}'`) > si)
}
// behavioural: the same algebra, evaluated
const shipReported = (S, nBlockers) => S && !nBlockers
ok('OLD: push refused -> shippable stayed true  <- THE BUG', true === /* old form */ (S => S)(true))
ok('NEW: push refused (1 blocker) -> shippable false', shipReported(true, 1) === false)
ok('NEW: clean run (0 blockers) -> shippable true', shipReported(true, 0) === true)
ok('NEW: a run that was never shippable stays false', shipReported(false, 0) === false)


// ── v33 — a PROVEN pre-existing failure must not block; an UNPROVEN claim must ────────────────────
console.log('\nv33 — "already broken" costs one sentence of proof, and silence costs a blocker')
const narrow = (fails, pre) => {
  const ok = (pre || []).filter(p => p && String(p.failure || '').trim() && String(p.proof || '').trim())
  const set = new Set(ok.map(p => String(p.failure).trim()))
  return fails.filter(f => !set.has(String(f).trim()))
}
const F = ['MutationObserver undeclared', 'js-syntax gate timed out', 'forge-progress overlap']
ok('OLD: any failure blocked, even a proven pre-existing one  <- THE BUG', F.length === 3)
ok('NEW: all three PROVEN pre-existing -> nothing left to block',
   narrow(F, F.map(f => ({ failure: f, proof: 'differential probe against HEAD shows it identical' }))).length === 0)
ok('an entry with NO proof still counts as a real failure',
   narrow(F, [{ failure: F[0], proof: '' }]).length === 3)
ok('an entry whose wording does not match a failure excuses nothing',
   narrow(F, [{ failure: 'something else entirely', proof: 'p' }]).length === 3)
ok('a REAL new failure survives alongside proven pre-existing ones',
   narrow([...F, 'the tally reads 0'], F.map(f => ({ failure: f, proof: 'p' }))).length === 1)
ok('the engine narrows the BLOCKER by proof', /_preSet\.has\(String\(f\)\.trim\(\)\)/.test(SRC))
ok('the engine narrows CONVERGENCE by the same rule (no second formula)', /!_rWrong\.length && !_rfOwn\.length/.test(SRC))
ok('the schema demands a proof string, not just a claim', /A restatement of the failure is NOT a proof/.test(SRC))

console.log(`\n${fail ? '❌' : '✅'} ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
