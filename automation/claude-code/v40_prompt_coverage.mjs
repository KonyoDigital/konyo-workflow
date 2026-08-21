#!/usr/bin/env node
/* EVERY AGENT'S PROMPT MUST CARRY THE RULES THAT AGENT IS RESPONSIBLE FOR.
   The blocker battery proves each safeguard CAN fire. It says nothing about the rules that live in
   PROSE inside a prompt — and two real defects in this arc lived exactly there: file ownership was
   asked of a model and never of the code, and the courier's Bash backstop stayed hardcoded at
   180000 while the perl alarm it was backing moved to 420s. A rule that quietly stops reaching its
   agent disarms a gate with nothing to see.

   TWO CHECKS, AND THE FIRST IS THE STRUCTURAL ONE:

   1. SPAWN DISCIPLINE. spawn() is the only place SPENT is incremented and the only place PACE and
      PROOF are appended, so carrying both IS the runtime signature of having gone through it. Any
      agent whose prompt lacks them was spawned by the raw agent() — which means it did not COUNT
      against the ceiling, its death was not recorded, and it never received the proxy ban. That is
      a real bypass this guard found on its first run (the Carve phase), so it is checked at
      RUNTIME rather than by grepping source: a source grep would also match the comments that
      discuss it, which is this repo's own source-reading-guard scar.

   2. ROLE RULES. Per-role required phrases, every one of them VERIFIED to exist against a live
      prompt before being pinned here — never guessed. An earlier draft of this survey "found" four
      missing rules that were all present under different wording, which is the same defect (a
      guard failing on its own reach) pointed at prose.

   Usage: node v40_prompt_coverage.mjs [pathToEngine]                                             */
import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync, mkdtempSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENGINE = process.argv[2] || join(HERE, 'konyo-workflow.js')
const TMP = process.env.PROOF_TMP || mkdtempSync(join(tmpdir(), 'konyo-proof-'))

let n = 0
function run(args) {
  const dump = join(TMP, `pcov_${n++}.json`)
  try { unlinkSync(dump) } catch {}
  try {
    execFileSync(process.execPath, [join(HERE, 'load_harness.mjs'), JSON.stringify(args), ENGINE],
      { env: { ...process.env, HARNESS_DUMP: dump }, encoding: 'utf8', stdio: 'pipe', timeout: 180000 })
  } catch {}
  try { return JSON.parse(readFileSync(dump, 'utf8')) } catch { return {} }
}

const B = { task: 't', apply: true }
const RENDER_FAIL = { agentPatch: [{ match: 'render:gate',
  patch: { passed: false, failures: ['header overlaps nav'], pre_existing: [] } }] }
const SCENARIOS = [
  { ...B, stakes: 'irreversible' },                       // architects, judge, third eye, completeness
  { ...B, thirdEye: false },                              // the clean shipping path — reaches ship:push
  { ...B, isolate: true, thirdEye: false },               // merge:apply, and the builder's isolate wording
  { ...B, quality: 'standard', thirdEye: false },         // the Fable gate
  { ...B, thirdEye: false, __harness: RENDER_FAIL },      // render:fix
]

/* Every phrase below was checked against a live prompt before being written here. */
const ROLE_RULES = [
  { role: 'build/rework — the one-owner rule', match: /^(build|rework):/, needs: ['You own exactly ONE file'] },
  { role: 'build/rework — the craft rules', match: /^(build|rework):/, needs: ['FOUR RULES, each one a ship this project has already paid for'] },
  { role: 'build/rework — a builder may not push', match: /^(build|rework):/,
    needsAny: ['NEVER `git push`', 'Do NOT commit, push, or touch the main repo'] },
  { role: 'render fixer — never push', match: /^render:fix/, needs: ['NEVER `git push`'] },
  { role: 'render fixer — COMMIT what you fixed (else the ship gate refuses a dirty tree)',
    match: /^render:fix/, needs: ['COMMIT what you changed'] },
  { role: 'render fixer — fix the code, never the assertion', match: /^render:fix/, needs: ['FIX THE CODE, NEVER THE ASSERTION'] },
  { role: 'merge — never commit, never push', match: /^merge:/, needs: ['Never commit, never push'] },
  { role: 'third eye — you are a courier, never answer yourself', match: /^thirdEye:/, needs: ['YOU ARE A COURIER, NOT THE THIRD EYE'] },
  { role: 'third eye — evidence is mandatory', match: /^thirdEye:/, needs: ['EVIDENCE IS MANDATORY'] },
  { role: 'ship — never --no-verify, never --force', match: /^ship:/, needs: ['NEVER --no-verify', 'NEVER --force'] },
  { role: 'skeptic — check ownership against git, do not assume it', match: /^skeptic\d/, needs: ['OWNERSHIP — CHECK IT, DO NOT ASSUME IT'] },
  { role: 'LAW19 — prefer execution to grep', match: /^law19:/, needs: ['PREFER EXECUTION TO GREP'] },
]

const calls = []
for (const a of SCENARIOS) for (const c of (run(a).calls || [])) calls.push(c)
console.log(`ENGINE: ${ENGINE}`)
console.log(`${SCENARIOS.length} scenarios · ${calls.length} agent prompts captured\n`)

let fail = 0
// 1) spawn discipline
const bypassed = calls.filter(c => !/WORK BRISKLY/.test(c.prompt || '') || !/VERIFY THE THING, NOT A PROXY/.test(c.prompt || ''))
if (bypassed.length) {
  fail++
  console.log(`❌ SPAWN DISCIPLINE — ${bypassed.length} prompt(s) lack PACE/PROOF, i.e. were spawned OUTSIDE spawn():`)
  for (const b of [...new Set(bypassed.map(x => x.label))]) console.log(`     ⬜ ${b} (uncounted by the ceiling, untracked on death, no proxy ban)`)
} else {
  console.log(`✅ SPAWN DISCIPLINE — all ${calls.length} prompts carry PACE and PROOF (none bypassed spawn())`)
}

// 2) role rules
for (const r of ROLE_RULES) {
  const hits = calls.filter(c => r.match.test(c.label || ''))
  if (!hits.length) { fail++; console.log(`❌ ${r.role} — NO AGENT MATCHED in any scenario (this battery cannot see it)`); continue }
  const bad = hits.filter(c => {
    const p = c.prompt || ''
    if (r.needsAny) return !r.needsAny.some(x => p.includes(x))
    return !r.needs.every(x => p.includes(x))
  })
  if (bad.length) { fail++; console.log(`❌ ${r.role} — MISSING from ${bad.length}/${hits.length}: ${[...new Set(bad.map(x => x.label))].join(', ')}`) }
  else console.log(`✅ ${r.role} (${hits.length} prompt(s))`)
}

console.log(`\n${fail === 0 ? '✅ PROMPT COVERAGE CLEAN' : '❌ ' + fail + ' PROMPT-COVERAGE FAILURE(S)'}`)
process.exit(fail === 0 ? 0 : 1)
