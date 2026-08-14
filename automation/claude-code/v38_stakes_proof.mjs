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
ok(/stakes:"cheap" is not a stakes this workflow knows/.test(typo),
   'and it is shouted rather than absorbed')

console.log('\nA DIAL MANGLED IN TRANSIT')
/* A door that forwards $ARGUMENTS naturally produces `--irreversible`, flag and all. Without the
   strip that reads as an unknown word — which lands on MAX, so it would have LOOKED fine while
   actually taking the typo path, and the typo warning would have cried wolf on every correct call. */
const dashed = run({ stakes: '--irreversible' })
ok(quality(dashed) === 'max', 'stakes:"--irreversible" resolves to max, not via the typo path')
ok(!/is not a stakes this workflow knows/.test(dashed),
   'and is NOT reported as a typo — the leading -- is stripped')
ok(quality(run({ stakes: '--reversible' })) === 'standard',
   'stakes:"--reversible" resolves to standard, where the typo path would have wrongly said max')
ok(quality(run({ stakes: '  IRREVERSIBLE  ' })) === 'max', 'whitespace and case are tolerated')

console.log('\nPRECEDENCE AND BACK-COMPAT')
ok(quality(run({})) === 'lean', 'no stakes and no quality still resolves to the lean default')
/* Konyo's call, 2026-08-15: stakes is the PUBLIC dial and quality is plumbing, so a caller who
   passes both meant the one they typed at the door. This deliberately reverses the first draft of
   this feature, which let quality win. */
const both = run({ stakes: 'reversible', quality: 'max' })
ok(quality(both) === 'standard', 'stakes OVERRULES an explicit quality — the door wins over plumbing')
ok(/OVERRULED/.test(both), 'and the engine says out loud which one it obeyed')
for (const q of ['max', 'lean', 'standard', 'tiny']) {
  ok(quality(run({ quality: q, items: [{ file: '/tmp/x', instruction: 'y' }] })) === q,
     `quality:"${q}" alone is unchanged by this feature`)
}

console.log(`\n${fail === 0 ? '✅ ALL GREEN' : '❌ RED'} — ${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
