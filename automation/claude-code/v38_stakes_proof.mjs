#!/usr/bin/env node
/* v38 — STAKES → QUALITY, the joint that failed silently and in the unsafe direction.

   The door (`/Konyo`) was rewritten to send `stakes:'irreversible'`. The engine read only
   `A.quality`. Nothing threw, nothing warned: `stakes` fell on the floor, and the run resolved to
   the LEAN DEFAULT. The flag whose whole purpose is "buy the careful shape" bought the cheap one
   while the caller believed otherwise — a silent downgrade arriving through a door the v18 typo
   safeguard never watched.

   That failure is invisible from either side. The door looks right, the engine looks right, the run
   completes green. Only the bill and the missing judge panel disagree. So it gets a gate.

   Run: node automation/claude-code/v38_stakes_proof.mjs
*/
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const HARNESS = join(HERE, 'load_harness.mjs')
let pass = 0, fail = 0
const ok = (c, m) => { c ? (pass++, console.log('  ok  · ' + m)) : (fail++, console.log('  FAIL· ' + m)) }

const run = (args) => {
  try {
    return execFileSync('node', [HARNESS, JSON.stringify({ task: 'a small chore', ...args })],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) { return (e.stdout || '') + (e.stderr || '') }
}
// The meter line prints the RESOLVED machine token: "v30 METER: maxItems=N (quality=X)".
const quality = (out) => (out.match(/v30 METER:.*?\(quality=([a-z]+)\)/) || [])[1] || '(none)'

console.log('STAKES → QUALITY')
const CASES = [
  ['irreversible', 'max',      'the expensive shape is actually bought'],
  ['reversible',   'standard', 'the cheap shape is actually bought'],
  ['costly',       'lean',     'the explicit middle resolves to the default shape'],
]
for (const [stakes, want, why] of CASES) {
  const got = quality(run({ stakes }))
  ok(got === want, `stakes:"${stakes}" -> quality:${got} (want ${want}) — ${why}`)
}

console.log('\nTHE ORIGINAL BUG, asserted directly')
const irr = run({ stakes: 'irreversible' })
ok(quality(irr) !== 'lean',
   'stakes:"irreversible" does NOT silently resolve to the lean default (this was the live defect)')
ok(/STAKES: "irreversible" → quality:max/.test(irr),
   'the translation is printed, so a future drift is visible in the first lines of a run')

console.log('\nFAIL EXPENSIVE, NEVER QUIETLY CHEAP')
const typo = run({ stakes: 'cheap' })
ok(quality(typo) === 'max', 'an unrecognised stakes word resolves to MAX, not to the cheap shape')
ok(/UNRECOGNISED stakes word/.test(typo), 'and it is shouted rather than absorbed')

console.log('\nPRECEDENCE AND BACK-COMPAT')
ok(quality(run({})) === 'lean', 'no stakes and no quality still resolves to the lean default')
const both = run({ stakes: 'reversible', quality: 'max' })
ok(quality(both) === 'max', 'an explicit quality still wins over stakes (saved invocations unbroken)')
ok(/STAKES: "reversible" IGNORED/.test(both), 'and the engine says which one it obeyed')
for (const q of ['max', 'lean', 'standard', 'tiny']) {
  ok(quality(run({ quality: q, items: [{ file: '/tmp/x', instruction: 'y' }] })) === q,
     `quality:"${q}" alone is unchanged by this feature`)
}

console.log(`\n${fail === 0 ? '✅ ALL GREEN' : '❌ RED'} — ${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
