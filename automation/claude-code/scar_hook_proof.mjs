#!/usr/bin/env node
/* Proof for the scar capture layer. Three things, each of which has a real failure mode:

   1. PARITY. `scarTerritory()` lives in konyo-workflow.js (JS, because a workflow script
      cannot import Python) and in hooks/scar_territory.py (Python, because a hook cannot
      import the engine). Two implementations of one algorithm is the drift this repo keeps
      being bitten by, so they are compared over a corpus and any disagreement is red.

   2. CAPTURE. The hook must record a correction and must NOT record an ordinary
      instruction. A capture layer that fires on everything is noise; one that fires on
      nothing is the unjoined end — and both look identical from outside (a quiet file).
      So this asserts BOTH directions.

   3. CLUSTER. Below the floor it must be silent; at the floor it must emit valid JSON with
      hookSpecificOutput.additionalContext. A startup hook that prints malformed JSON, or
      chatters on every session, gets turned off and then protects nothing.

   Run: node automation/claude-code/scar_hook_proof.mjs
*/
import { readFileSync, mkdtempSync, writeFileSync, existsSync, readFileSync as rf } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENGINE = join(HERE, 'konyo-workflow.js')
const HOOKS = join(HERE, 'hooks')
let pass = 0, fail = 0
const ok = (c, m) => { c ? (pass++, console.log('  ok  · ' + m)) : (fail++, console.log('  FAIL· ' + m)) }

/* ── 1. PARITY ──────────────────────────────────────────────────────────────────────── */
const src = readFileSync(ENGINE, 'utf8')
const m = src.match(/function scarTerritory\(reason\)\s*\{[\s\S]*?\n\}/)
if (!m) { console.log('  FAIL· could not extract scarTerritory() from the engine'); process.exit(1) }
// Body first, THEN return the binding. `(function f(){}, f)` makes it a function
// EXPRESSION, so the name never binds in the enclosing scope and this throws.
const jsTerritory = new Function(m[0] + '\nreturn scarTerritory')()

const CORPUS = [
  'the control set was mislabelled and the detector had been right',
  'No, I told you not to run browser tests on this Mac',
  'render gate failed at 701px, text clipped inside the cell',
  'a-b c-d',                                   // all words <=3 chars -> empty key
  '',                                          // empty -> empty key
  'THE The the AND and',                       // stopwords only -> empty key
  'Version stamp disagreed with CHANGELOG tip after the fleet ran twice',
  'punctuation!!! matters??? here... maybe;;; not',
  'duplicate duplicate duplicate words words collapse',
  'MiXeD CaSe SHOULD Lowercase Consistently Across Both',
]
/* ⚠ exec the SOURCE, never `import`. Found the hard way on 2026-08-15: macOS python sets
   sys.pycache_prefix=~/Library/Caches/com.apple.python, so bytecode caches live in a
   CENTRAL directory — `find . -name __pycache__` shows nothing and the cache is invisible
   beside the file. Invalidation compares mtime AND SIZE, so an edit that is the same byte
   length and lands in the same second (here `[:5]` -> `[:6]`) looks unchanged, and the
   stale .pyc keeps being served. The proof then grades a copy of the code that no longer
   exists — a gate reading yesterday's build and reporting on today's. Reading the file
   text removes the entire class. */
const pyOut = execFileSync('python3', ['-B', '-c', `
import json, sys
ns = {}
exec(open(${JSON.stringify(join(HOOKS, 'scar_territory.py'))}, encoding='utf-8').read(), ns)
print(json.dumps([ns['scar_territory'](s) for s in json.load(sys.stdin)]))
`], { input: JSON.stringify(CORPUS), encoding: 'utf8' })
const py = JSON.parse(pyOut)
console.log('PARITY — scarTerritory JS vs Python')
CORPUS.forEach((s, i) => {
  const j = jsTerritory(s)
  ok(j === py[i], `"${(s || '(empty)').slice(0, 42)}" -> ${JSON.stringify(j)}`)
})

/* ── 2. CAPTURE ─────────────────────────────────────────────────────────────────────── */
console.log('\nCAPTURE — fires on corrections, stays silent on instructions')
const tmp = mkdtempSync(join(tmpdir(), 'scarhook-'))
const inbox = join(tmp, 'SCARS.inbox.md')
const runCapture = (prompt) => execFileSync('python3', ['-B', join(HOOKS, 'scar_capture.py')], {
  input: JSON.stringify({ session_id: 'test', prompt }),
  env: { ...process.env, KONYO_SCAR_INBOX: inbox }, encoding: 'utf8',
})
const count = () => existsSync(inbox)
  ? (rf(inbox, 'utf8').match(/^- `/gm) || []).length : 0

const CORRECTIONS = [
  'No, I told you the tests run on CI not locally',
  "that's wrong — the default is lean not max",
  'you forgot to update the installed copy',
  'why did you delete that file',
  'stop using pkill by name',
]
const INSTRUCTIONS = [
  'Do not use tabs in this file, use two spaces',
  'Add a routing map to the repo and link it from the README',
  'Please run the parity script and report what it says',
  'never mind the styling for now, focus on the logic',   // "never" but not "never do/use/run"
]
CORRECTIONS.forEach(p => { const b = count(); runCapture(p); ok(count() === b + 1, `captured: "${p.slice(0, 44)}"`) })
INSTRUCTIONS.forEach(p => { const b = count(); runCapture(p); ok(count() === b, `ignored:  "${p.slice(0, 44)}"`) })

// A prompt with no recognisable key must not write a keyless entry.
const before = count()
runCapture('No, a b c')
ok(count() === before, 'a correction with an empty territory key is not recorded')

// The hook must never break a turn, whatever it is fed.
for (const bad of ['not json at all', '[]', '{}', 'null', '{"prompt": 12345}']) {
  let code = 0
  try {
    execFileSync('python3', ['-B', join(HOOKS, 'scar_capture.py')],
      { input: bad, env: { ...process.env, KONYO_SCAR_INBOX: inbox }, encoding: 'utf8' })
  } catch (e) { code = e.status ?? 1 }
  ok(code === 0, `exit 0 on malformed input: ${bad.slice(0, 24)}`)
}

/* ── 3. CLUSTER ─────────────────────────────────────────────────────────────────────── */
console.log('\nCLUSTER — silent below the floor, JSON at the floor')
const runCluster = (box) => execFileSync('python3', ['-B', join(HOOKS, 'scar_cluster.py')], {
  input: '{}', env: { ...process.env, KONYO_SCAR_INBOX: box }, encoding: 'utf8',
})
const quiet = join(tmp, 'quiet.md')
writeFileSync(quiet, '- `2026-08-15T00:00:00` cwd=`/x` territory=`alpha-beta`\n  > one\n'.repeat(1)
  + '- `2026-08-15T00:00:01` cwd=`/x` territory=`alpha-beta`\n  > two\n')
ok(runCluster(quiet).trim() === '', 'two scars in one territory -> no output (floor is 3)')

const loud = join(tmp, 'loud.md')
writeFileSync(loud, [0, 1, 2].map(i =>
  `- \`2026-08-15T00:00:0${i}\` cwd=\`/x\` territory=\`alpha-beta\`\n  > evidence ${i}\n`).join(''))
const out = runCluster(loud).trim()
let parsed = null
try { parsed = JSON.parse(out) } catch { /* leave null */ }
ok(parsed !== null, 'three scars -> parseable JSON on stdout')
ok(parsed?.hookSpecificOutput?.hookEventName === 'SessionStart', 'declares hookEventName')
ok(typeof parsed?.hookSpecificOutput?.additionalContext === 'string'
   && parsed.hookSpecificOutput.additionalContext.includes('alpha-beta'),
   'additionalContext names the territory')
ok(!/carve it|carved automatically/i.test(parsed?.hookSpecificOutput?.additionalContext || ''),
   'proposes without claiming anything was carved')
ok(runCluster(join(tmp, 'does-not-exist.md')).trim() === '', 'missing inbox -> silent, not an error')

console.log(`\n${fail === 0 ? '✅ ALL GREEN' : '❌ RED'} — ${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
