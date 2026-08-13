#!/usr/bin/env node
/**
 * v27 EMPTY-PLAN PROOF — the vacuous green ship cannot return.
 *
 * Runs the real konyo-workflow.js body under load_harness fakes, forcing the
 * architect to return items:[], and asserts:
 *   · shippable === false
 *   · error is architect_noop | architect_empty
 *   · verdict is not OK / not a clean ship
 *   · force:true still does not green-ship an empty plan
 *   · caller items[] still skip the architect (positive control)
 *
 * Exit 0 only if every scenario passes. This is a GATE, not a narrative.
 *
 *   node v27_empty_plan_proof.mjs [path/to/konyo-workflow.js]
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SCRIPT = process.argv[2] || join(HERE, 'konyo-workflow.js')
const HARNESS = join(HERE, 'load_harness.mjs')

function run(argsObj) {
  const r = spawnSync(process.execPath, [HARNESS, JSON.stringify(argsObj), SCRIPT], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  })
  const out = (r.stdout || '') + (r.stderr || '')
  const m = out.match(/HARNESS_JSON:(\{.*\})\s*$/m)
  let json = null
  try { json = m ? JSON.parse(m[1]) : null } catch { json = null }
  // also parse RETURN payload for error field if HARNESS_JSON missing
  if (!json) {
    const ship = /"shippable"\s*:\s*(true|false)/.exec(out)
    const err = /"error"\s*:\s*"([^"]+)"/.exec(out)
    const ver = /"verdict"\s*:\s*"([^"]+)"/.exec(out)
    json = {
      ok: r.status === 0 && !/THE SCRIPT THREW/.test(out),
      shippable: ship ? ship[1] === 'true' : null,
      error: err ? err[1] : null,
      verdict: ver ? ver[1] : null,
    }
  }
  return { status: r.status, out, json }
}

const failures = []
function expect(cond, msg) {
  if (!cond) failures.push(msg)
  console.log(cond ? '  ok  ·' : '  FAIL·', msg)
}

console.log('script :', SCRIPT)
console.log('harness:', HARNESS)
console.log('')

// ── 1) architect returns items:[] with a summary (noop / already complete) ──
console.log('SCENARIO 1 — architect_noop (items:[], summary set, force:true, apply:true)')
{
  const { json, out } = run({
    task: 'do the work that is already sealed',
    apply: true,
    force: true,
    quality: 'lean',
    thirdEye: false,
    grok: false,
    __harness: {
      architectItems: [],
      architectSummary: 'harness: work already complete at c0170b3',
      triage: { tier: 'direct', shape: 'code', parallelism: 'serial', cost_of_wrong: 'low',
        est_agents: 1, skeptics: 0, work_list_known: true, why: 'harness forces direct then force:true' },
    },
  })
  expect(json && json.ok !== false, 'script completed without throw')
  expect(json && json.shippable === false, `shippable===false (got ${json && json.shippable})`)
  expect(json && (json.error === 'architect_noop' || json.error === 'architect_empty'),
    `error is architect_noop|architect_empty (got ${json && json.error})`)
  expect(json && json.verdict && !/^OK$/i.test(json.verdict) && !/shippable clean/i.test(json.verdict),
    `verdict is not a clean OK (got ${json && json.verdict})`)
  expect(/ARCHITECT RETURNED 0 ITEMS|architect_noop|architect_empty|already complete/i.test(out),
    'log/payload names the empty-architect condition')
}
console.log('')

// ── 2) architect returns items:[] with NO summary ──
console.log('SCENARIO 2 — architect_empty (items:[], no summary)')
{
  const { json } = run({
    task: 'something to build',
    apply: true,
    force: true,
    quality: 'lean',
    thirdEye: false,
    grok: false,
    __harness: {
      architectItems: [],
      architectSummary: '', // empty string → architect_empty branch (no sum)
      triage: { tier: 'standard', shape: 'code', parallelism: 'parallel', cost_of_wrong: 'medium',
        est_agents: 3, skeptics: 1, work_list_known: false, why: 'harness' },
    },
  })
  // empty summary string is still truthy for String() — force truly missing via only []
  // architectSummary: '' still becomes summary '' which is falsy for `sum ?` after String?
  // String('') is '' which is falsy in `sum ?` — good → architect_empty
  expect(json && json.shippable === false, `shippable===false (got ${json && json.shippable})`)
  expect(json && (json.error === 'architect_empty' || json.error === 'architect_noop'),
    `error architect_empty|architect_noop (got ${json && json.error})`)
}
console.log('')

// ── 3a) v35 — dry-run + file-shaped items[] REFUSES (never reaches architect) ──
console.log('SCENARIO 3a — dry-run + items[{file}] is refused (v35; does not reach architect-skip)')
{
  const { json, out } = run({
    task: 'known one-file edit',
    apply: false,
    quality: 'lean',
    thirdEye: false,
    grok: false,
    items: [{ file: '/tmp/v27-proof.js', instruction: 'add a comment', risk: 'low' }],
    __harness: {
      architectItems: [],
      architectSummary: 'SHOULD NOT RUN',
    },
  })
  expect(json && json.ok !== false, 'script completed')
  expect(/file-shaped items|DRY-RUN.*FILE|refused/i.test(out) ||
         (json && /file-shaped|dry-run/i.test(String(json.refused || json.error || ''))),
    'v35 refuse: dry-run + file-shaped items[]')
  expect(!(json && json.error === 'architect_noop'), 'did not bail as architect_noop')
  expect(!(json && json.error === 'architect_empty'), 'did not bail as architect_empty')
  expect(!(/ARCHITECT SKIPPED/i.test(out)), 'architect-skip log must NOT fire — refuse is earlier')
}

// ── 3b) POSITIVE — apply:true + caller items skip architect; empty-plan path not taken ──
console.log('SCENARIO 3b — apply:true + caller items[] skip architect')
{
  const { json, out } = run({
    task: 'known one-file edit',
    apply: true,
    quality: 'lean',
    thirdEye: false,
    grok: false,
    items: [{ file: '/tmp/v27-proof.js', instruction: 'add a comment', risk: 'low' }],
    __harness: {
      architectItems: [],
      architectSummary: 'SHOULD NOT RUN',
    },
  })
  expect(json && json.ok !== false, 'script completed')
  expect(/ARCHITECT SKIPPED|caller items/i.test(out), 'architect skipped for caller items')
  expect(!(json && json.error === 'architect_noop'), 'did not bail as architect_noop')
  expect(!(json && json.error === 'architect_empty'), 'did not bail as architect_empty')
}
console.log('')

// ── 4) no-task still shippable:false (regression) ──
console.log('SCENARIO 4 — no task → shippable false')
{
  const { json } = run({})
  expect(json && json.shippable === false, `shippable===false (got ${json && json.shippable})`)
  expect(json && json.error === 'no task', `error===no task (got ${json && json.error})`)
}
console.log('')

// ── 5) vacuous green is impossible: SHIPPABLE requires APPLY + passed>0 ──
console.log('SCENARIO 5 — SHIPPABLE predicate unit (APPLY && passed.length > 0)')
{
  const BLOCKERS = [], CEILING_HIT = false, trimmedFromPlan = [], failed = []
  const SPAWN_ERRORS = [], THIN_PANELS = []
  const MAXQ = true, LEANQ = true, dry = 0, DRYROUNDS = 1, unbuiltGaps = []
  const pred = (APPLY, passedN) => APPLY
    && !BLOCKERS.length && !CEILING_HIT && !trimmedFromPlan.length && !failed.length
    && !SPAWN_ERRORS.length && !THIN_PANELS.length
    && (!MAXQ || LEANQ || (dry >= DRYROUNDS && !unbuiltGaps.length))
    && passedN > 0
  expect(pred(true, 0) === false, 'zero passed work is not SHIPPABLE')
  expect(pred(false, 2) === false, 'dry-run is never SHIPPABLE even with passed items')
  expect(pred(true, 1) === true, 'apply + one passed item can be SHIPPABLE when other gates clear')
  expect(![] === false, 'documents the JS empty-array truthy trap')
  expect(![].length === true, 'length check catches empty items')
}

// ── 6) dry-run happy path never reports shippable:true ──
console.log('SCENARIO 6 — dry-run smoke is not shippable')
{
  const { json } = run({
    task: 'propose a tiny docs note',
    apply: false,
    quality: 'lean',
    thirdEye: false,
    grok: false,
  })
  expect(json && json.shippable === false, `dry-run shippable===false (got ${json && json.shippable})`)
}
console.log('')

if (failures.length) {
  console.log(`\n❌ v27 EMPTY-PLAN PROOF FAILED (${failures.length}):`)
  for (const f of failures) console.log('  ·', f)
  process.exit(1)
}
console.log('\n✅ v27 EMPTY-PLAN PROOF PASSED — vacuous green ship cannot return.')
process.exit(0)
