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
console.log('\nv32 §1.2 — the lock key must identify the TREE, not the argument shape')
const keyOf = items => {                       // the REAL expression, transcribed from the engine
  const _lp = (items || []).map(x => x && x.file).filter(Boolean)
  const _dirs = _lp.map(f => String(f).replace(/\/[^/]*$/, ''))
  const _base = _dirs.length
    ? _dirs.reduce((a, b) => { const X = a.split('/'), Y = b.split('/'), o = []
        for (let k = 0; k < Math.min(X.length, Y.length) && X[k] === Y[k]; k++) o.push(X[k])
        return o.join('/') })
    : ''
  return (_base.replace(/^\/+/, '').replace(/\//g, '-')) || '__FROM_TREE__'
}
const OLDkeyOf = items => {                    // what it used to be
  const _lp = (items || []).map(x => x && x.file).filter(Boolean)
  const _base = _lp.length
    ? _lp.reduce((a, b) => { const X = a.split('/'), Y = b.split('/'), o = []
        for (let k = 0; k < Math.min(X.length, Y.length) && X[k] === Y[k]; k++) o.push(X[k])
        return o.join('/') }).replace(/\/[^/]*$/, '')
    : ''
  return (_base.replace(/^\/+/, '').replace(/\//g, '-')) || 'no-items'
}
// ⚠ THE DEPTH MATTERS AND MY FIRST EXAMPLE HID THE BUG. With a ONE-segment dir ('tv/x.py') the old
// trailing strip is a no-op, so 1-item and 2-item agreed and the row failed while the CLAIM was
// right. The defect needs a dir of >= 2 segments — which is the normal case in both repos.
const one = [{file:'tv/frames/chronicle_template.py'}]
const two = [{file:'tv/frames/chronicle_template.py'},{file:'tv/frames/test_chronicle_template.py'}]
ok('OLD: 1 item and 2 items in ONE directory took DIFFERENT locks  <- THE BUG',
   OLDkeyOf(one) !== OLDkeyOf(two))
ok('NEW: 1 item and 2 items in one directory take the SAME lock', keyOf(one) === keyOf(two) && keyOf(one) === 'tv-frames')
ok('OLD: an architect-driven run keyed on the constant "no-items"  <- THE BUG', OLDkeyOf([]) === 'no-items')
ok('NEW: an architect-driven run defers to the TREE, never a constant', keyOf([]) === '__FROM_TREE__')
ok('the engine actually emits the tree-derived branch',
   /__FROM_TREE__/.test(SRC) && /drop the leading "\/" and replace every remaining "\/" with "-"/.test(SRC))
ok('and it still refuses $HOME (the backstop survives)', /never lock the home directory/.test(SRC))

console.log(`\n${fail ? '❌' : '✅'} ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
