#!/usr/bin/env node
/* EVERY BLOCKER IN THE ENGINE MUST BE REACHABLE BY AT LEAST ONE SCENARIO.
   A blocker that no input can trigger is a safeguard that exists only in the source — the
   [[feedback_threshold_above_the_ceiling]] shape ("a threshold above the ceiling is an ABSENT
   one"), and it reads as protection in every review of the file. This enumerates the blocker
   titles straight from the source and drives a scenario battery at them, so a future blocker that
   can never fire fails HERE instead of being discovered by the run it failed to stop.
   ⚠ IT REPORTS THE MISSES BY NAME. "Coverage is 20/23" tells nobody which three.
   Usage: node v40_blocker_coverage.mjs [pathToEngine]                                            */
import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENGINE = process.argv[2] || join(HERE, 'konyo-workflow.js')
const TMP = '/Users/konyo/.claude/jobs/c756f6f9/tmp'
const src = readFileSync(ENGINE, 'utf8')

const titles = new Set()
for (const m of src.matchAll(/blocker\(\s*(?:_contradiction\s*\?\s*)?'([^']+)'/g)) titles.add(m[1])
for (const m of src.matchAll(/blocker\([^)]*?:\s*'([^']+)'/g)) titles.add(m[1])
const TITLES = [...titles].filter(t => /^[A-Z]/.test(t))

let n = 0
function run(args) {
  const dump = join(TMP, `cov_${n++}.json`)
  try { unlinkSync(dump) } catch {}
  try {
    execFileSync(process.execPath, [join(HERE, 'load_harness.mjs'), JSON.stringify(args), ENGINE],
      { env: { ...process.env, HARNESS_DUMP: dump }, encoding: 'utf8', stdio: 'pipe', timeout: 180000 })
  } catch {}
  try { return JSON.parse(readFileSync(dump, 'utf8')) } catch { return {} }
}

const B = { task: 't', apply: true, thirdEye: false }
const RF = [{ match: 'render:gate', patch: { passed: false, failures: ['overlap'], pre_existing: [] } }]
const EV = { reached: true, transport: 'cli',
  command: "perl -e '...' 420 /Users/konyo/.grok/bin/grok --cwd . --prompt-file /tmp/q.txt",
  raw_head: 'Grok: I have read the diff and I object to the following' }
const eye = (seat, concerns) => ({ ...B, thirdEye: undefined, __harness: { agentPatch: [
  { match: seat, patch: { ...EV, verdict: 'refuted', severity: 'blocking', concerns } }] } })

const SCENARIOS = [
  B, { ...B, isolate: true }, { ...B, quality: 'max' }, { ...B, quality: 'standard' },
  { ...B, __harness: { nullAgents: ['lock:acquire'] } },
  { ...B, __harness: { nullAgents: ['phase:Reachability'] } },
  { ...B, __harness: { nullAgents: ['phase:Render gate'] } },
  { ...B, __harness: { nullAgents: ['phase:Fat version bar'] } },
  { ...B, __harness: { nullAgents: ['phase:Synthesize'] } },
  { ...B, __harness: { nullAgents: ['ship:push'] } },
  { ...B, isolate: true, __harness: { nullAgents: ['merge:apply'] } },
  { ...B, isolate: true, __harness: { agentPatch: [{ match: 'build:', patch: { patch: '' } }] } },
  { ...B, isolate: true, __harness: { agentPatch: [{ match: 'merge:apply', patch: { applied: [], failed: ['a.js: no'], notes: 'n' } }] } },
  { ...B, __harness: { agentPatch: RF } },
  { ...B, __harness: { agentPatch: [{ match: 'render:gate', patch: { passed: true, failures: ['overlap'], pre_existing: [{ failure: 'overlap', proof: '' }] } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'render:gate', patch: { available: false, images_na_reason: '', notes: '', passed: true, failures: [] } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'render:gate', patch: { passed: true, failures: [], images: [], images_na_reason: '' } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'render:gate', patch: { passed: true, failures: [], images: [{ surface: 'a', claims: 'X', depicts: 'Y', matches: false }] } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'law19:reach', patch: { dead: ['x has no caller'], checked: 0, tests_added: 0, tests_proven_run: true } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'law19:reach', patch: { dead: [], checked: 1, tests_added: 2, tests_proven_run: false } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'law17:fat', patch: { applicable: true, passes: false, kind: 'thin', outcomes: [], reason: 'thin' } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'law17:fat', patch: { applicable: false, passes: true, kind: 'thin', outcomes: [], reason: 'n/a', na_evidence: '' } }] } },
  { ...B, __harness: { agentPatch: [{ match: 'ship:push', patch: { pushed: false, why: 'hook rejected', hook_output: 'v' } }] } },
  // the agent ceiling WITHOUT a trim — one item, forced rework, a small cap
  { ...B, quality: 'standard', maxAgents: 10, __harness: {
      agentPatch: [{ match: 'skeptic', patch: { refuted: true, severity: 'blocking', reason: 'broken' } }],
      architectItems: [{ file: 'a.py', instruction: 'c', tier: 'sonnet', risk: 'low', kind: 'code' }] } },
  // a plan the ceiling must trim
  { ...B, maxAgents: 9, __harness: { architectItems: Array.from({ length: 12 }, (_, i) => ({ file: `f${i}.py`, instruction: 'c', tier: 'sonnet', risk: 'low', kind: 'code' })) } },
  // the three third-eye seats, which need the eye ON
  eye('thirdEye:plan', ['the plan edits a file the task forbids']),
  eye('thirdEye:pre-ship', ['the version stamp is thin']),
  eye('thirdEye:render-gate-vision', ['the thumbnail shows Andariel, not Mephisto']),
]

const seen = new Set()
for (const a of SCENARIOS) {
  const r = (run(a) || {}).result || {}
  for (const b of (r.blockers || [])) seen.add(String(b.what))
}
const norm = t => t.split('—')[0].trim()
const hit = [], miss = []
for (const t of TITLES.sort()) {
  const k = norm(t)
  ;([...seen].some(s => norm(s) === k) ? hit : miss).push(t)
}
console.log(`ENGINE: ${ENGINE}`)
console.log(`${TITLES.length} blocker titles in the source · ${SCENARIOS.length} scenarios driven\n`)
for (const t of hit) console.log('  ✅', t)
if (miss.length) {
  console.log(`\n⬜ NOT REACHED BY ANY SCENARIO (${miss.length}) — each is either a dead safeguard or a gap in THIS battery:`)
  for (const t of miss) console.log('  ⬜', t)
}
console.log(`\n${miss.length === 0 ? '✅' : '❌'} BLOCKER COVERAGE ${hit.length}/${TITLES.length}`)
process.exit(miss.length === 0 ? 0 : 1)
