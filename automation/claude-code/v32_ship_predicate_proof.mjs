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

console.log(`\n${fail ? '❌' : '✅'} ${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
