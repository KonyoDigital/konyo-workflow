#!/usr/bin/env node
// LOAD HARNESS for konyo-workflow.js
// node --check cannot see TDZ or top-level throws. This executes the whole script body with the
// engine's injected globals stubbed, so the module is PROVEN to load and run to its return.
//
// Usage:
//   node load_harness.mjs '<json args>' [path/to/konyo-workflow.js]
//
// Optional harness controls (inside args, stripped from the workflow's view of "task" only by us —
// they live on args.__harness so the script still sees them on A if it ever reads them; the workflow
// ignores unknown keys):
//
//   __harness: {
//     architectItems: [] | [...],     // force architect/judge plan items (v27 empty-plan proof)
//     architectSummary: string,       // summary when forcing empty items
//     triage: { ... },                // override triage fields
//     nullAgents: ['lock:acquire'],   // labels (substring) whose spawn() returns null — proves the
//                                     // "agent died / ceiling refused" branches, which return null
//                                     // WITHOUT throwing and are therefore silent by construction
//     exitOnThrow: true,              // default true — process.exit(1) if the script throws
//   }
//
// Exit codes: 0 = completed (even if verdict is blocked), 1 = script threw / harness misconfigured.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SCRIPT = process.argv[3] || join(HERE, 'konyo-workflow.js')
const ARGS = JSON.parse(process.argv[2] || '{}')
const H = (ARGS && typeof ARGS === 'object' && ARGS.__harness && typeof ARGS.__harness === 'object')
  ? ARGS.__harness
  : {}

let src = readFileSync(SCRIPT, 'utf8')
// workflow scripts use a top-level `return`, which is illegal in an ES module — the engine wraps the
// body in an async function, so we do exactly the same thing.
src = src.replace(/^export const meta/m, 'const meta')

const calls = []
const nulledAgents = []
const patchedAgents = []    // v40.3 — what __harness.agentPatch actually matched     // v40 — what __harness.nullAgents actually matched (see the note at the match site)
const phases = []
const logs = []

// ---- schema-shaped faker: synthesize a value satisfying the JSON Schema the script demands ----
function fake(schema, key = '', label = '') {
  if (!schema || typeof schema !== 'object') return null
  const t = schema.type
  if (schema.enum) {
    // prefer the "keep going / high quality" branch so the full path is exercised
    const pref = ['max', 'high', 'parallel', 'code', 'CONFIRMED', 'pass', 'ok']
    for (const p of pref) if (schema.enum.includes(p)) return p
    return schema.enum[0]
  }
  if (t === 'object' || schema.properties) {
    const o = {}
    for (const [k, v] of Object.entries(schema.properties || {})) o[k] = fake(v, k, label)
    return o
  }
  if (t === 'array') {
    const k = key.toLowerCase()
    // the render gate's inspected-images list: give it a real entry so seat 4 is exercised
    if (k === 'images') return [{ surface: 'boss thumb', path: 'art/mephisto_graphic.png',
      claims: 'Mephisto', depicts: 'Mephisto', matches: true }]
    if (k === 'screenshots') return ['/tmp/shot1.png']
    // arrays that must be non-empty for the run to have work to do
    const needsOne = /item|work|task|file|change|plan|step/.test(k)
    // arrays that must be EMPTY or the run is blocked by fake problems
    const mustBeEmpty = /blocker|gap|concern|finding|error|failure|missing|refut|violation|dead|unreach/.test(k)
    if (mustBeEmpty) return []
    if (needsOne) return [fake(schema.items, key.replace(/s$/, ''), label), fake(schema.items, key.replace(/s$/, ''), label)]
    return []
  }
  if (t === 'boolean') {
    const k = key.toLowerCase()
    if (/refut|fail|block|clip|overflow|hidden|stale|dead|missing|error|skip|thin|empty|bypass/.test(k)) return false
    return true // passed / ok / real / ran / reachable / shippable
  }
  if (t === 'integer' || t === 'number') {
    const k = key.toLowerCase()
    if (/agent|item|count|n$/.test(k)) return 2
    if (/score|confidence/.test(k)) return 9
    return 1
  }
  // strings
  const k = key.toLowerCase()
  if (/tier/.test(k)) return 'max'
  if (/shape/.test(k)) return 'code'
  if (/verdict/.test(k)) return 'OK'
  if (/parallel/.test(k)) return 'parallel'
  if (/cost_of_wrong|cost/.test(k)) return 'high'
  if (/model/.test(k)) return 'opus'
  /* v40.5 — A HAPPY FIXTURE MUST BE A **COHERENT** ONE. Every file/path field used to return one
     hardcoded path regardless of which agent was asking, so a builder told "you own a.js" returned
     files_touched:['/Users/konyo/.claude/workflows/konyo-workflow.js'] — a build result that
     contradicts its own brief. That went unnoticed for as long as nothing compared the two; the
     moment the engine gained a real ownership check (v40.5 §B) it correctly failed the FIXTURE,
     and the tiny baseline stopped shipping. The engine was right and the fixture was nonsense.
     A fixture that is internally inconsistent makes every proof built on it accidental: it can
     fail a correct engine, and it can pass a broken one for the same reason.
     Build/rework labels carry their file as `build:<tier>:<file>` / `rework:<tier>:<file>`, so the
     coherent answer is available — use it, and fall back to the old constant only when the label
     names no file. */
  if (/file|path/.test(k)) {
    const m = String(label || '').match(/^(?:build|rework):[^:]*:(.+)$/)
    if (m && m[1]) return m[1]
    return '/Users/konyo/.claude/workflows/konyo-workflow.js'
  }
  return `[fake:${key || 'str'}]`
}

function isTriage(rec, v) {
  return /triage/i.test(rec.label)
    || (v && typeof v === 'object' && 'cost_of_wrong' in v && 'est_agents' in v)
}

function isArchitectPlan(rec, opts, v) {
  // LEAN architect has NO label — phase is the stable identity (ceiling_proof_v4 lesson).
  if (opts.phase === 'Architect') return true
  if (/architect|judge/i.test(rec.label)) return true
  if (v && typeof v === 'object' && Array.isArray(v.items) && 'version_label' in v) return true
  return false
}

globalThis.args = ARGS
/* v40.6 — THE TOKEN BUDGET WAS UNREACHABLE FROM A TEST. total:null / remaining:Infinity means
   every `if (budget.total && budget.remaining() < FLOOR)` branch in the engine is dead in every
   proof — the render loop's budget stop, the completeness loop's budgetOK(), the whole cost-aware
   half of the engine. Same shape as the render fixer before agentPatch: never tested and tested-
   and-fine are indistinguishable from a green suite.
     __harness.budget: { total: 500000, spent: 480000 }
   `spent` may also be a number that GROWS per agent via `spentPerAgent`, so a loop can be watched
   crossing the floor rather than starting beyond it. */
const _hb = (H.budget && typeof H.budget === 'object') ? H.budget : null
let _spentTokens = _hb ? Number(_hb.spent || 0) : 0
globalThis.budget = _hb
  ? { total: Number(_hb.total) || null,
      spent: () => _spentTokens,
      remaining: () => Math.max(0, (Number(_hb.total) || 0) - _spentTokens) }
  : { total: null, spent: () => 0, remaining: () => Infinity }
globalThis.phase = (t) => { phases.push(t) }
globalThis.log = (m) => { logs.push(String(m)) }
globalThis.workflow = async () => { throw new Error('HARNESS: nested workflow() called — that is banned') }
globalThis.agent = async (prompt, opts = {}) => {
  const rec = {
    label: opts.label || '(unlabelled)',
    phase: opts.phase || phases[phases.length - 1] || '(no phase)',
    model: opts.model || '(inherit)',
    effort: opts.effort || '(inherit)',
    agentType: opts.agentType || '(default)',
    isolation: opts.isolation || null,
    hasSchema: !!opts.schema,
    promptLen: (prompt || '').length,
    prompt: prompt || '',
  }
  calls.push(rec)
  if (_hb && Number(_hb.spentPerAgent)) _spentTokens += Number(_hb.spentPerAgent)
  /* v40 — FORCE A SPECIFIC AGENT TO RETURN NULL, which is what the engine sees when an agent DIES
     or the ceiling refuses the seat. spawn() returns null WITHOUT throwing in both cases, so every
     `if (result && ...)` branch is skipped silently — the engine's most-repeated defect shape, and
     until now the harness had no way to exercise it. `__harness.nullAgents: ['lock:acquire']`
     matches on a substring of the agent LABEL. */
  /* ⚠ COUNT WHAT WAS ACTUALLY NULLED. A pattern that matches NO agent nulls nothing, and the run
     then looks exactly like a run whose missing agent did no harm — "this safeguard's absence is
     harmless" and "this agent does not exist in this configuration" are opposite facts producing
     identical output. Measured while sweeping: nulling 'architect:judge' at quality=lean, which
     buys no judge at all, reported a clean shippable run and read as a silent safeguard bypass.
     nulledAgents is the denominator; a sweep that does not check it is proving nothing. */
  if (Array.isArray(H.nullAgents)) {
    const hit = H.nullAgents.find(n =>
      String(n).startsWith('phase:')
        ? String(rec.phase || '') === String(n).slice(6)
        : String(rec.label || '').includes(n))
    if (hit) { nulledAgents.push({ pattern: hit, label: rec.label || null, phase: rec.phase || null }); return null }
  }
  if (opts.schema) {
    let v = fake(opts.schema, '', rec.label)
    // triage drives the whole run — force the expensive path so every phase is exercised,
    // unless the harness overrides it.
    if (isTriage(rec, v)) {
      Object.assign(v, {
        shape: 'code', parallelism: 'parallel', cost_of_wrong: 'high', tier: 'max',
        est_agents: 4, skeptics: 3, work_list_known: true, why: 'harness',
      })
      if (H.triage && typeof H.triage === 'object') Object.assign(v, H.triage)
    }
    // v27 — force architect/judge plan items (including items:[] for the empty-plan proof)
    if (isArchitectPlan(rec, opts, v) && Object.prototype.hasOwnProperty.call(H, 'architectItems')) {
      if (!v || typeof v !== 'object') v = {}
      v.version_label = v.version_label || 'v-harness'
      v.summary = H.architectSummary != null
        ? H.architectSummary
        : (Array.isArray(H.architectItems) && H.architectItems.length === 0
          ? 'harness: work already complete — no items'
          : (v.summary || 'harness plan'))
      v.why = v.why || 'harness'
      v.items = Array.isArray(H.architectItems) ? H.architectItems : []
    }
    /* ── v40.4 — FORCE FIELDS ONTO A NAMED AGENT'S RETURN. APPLIED **LAST**, AND THAT IS THE FIX.
       WHY IT EXISTS: the faker only ever produces a HAPPY result, so whole regions of the engine
       are unreachable from a test purely because nothing ever fails. The render-loop FIXER only
       spawns when the render gate reports a failure, and no harness run had ever produced one, so
       the fixer had never executed in any proof. "Never tested" and "tested and fine" look
       identical from a green suite.
         __harness.agentPatch: [{ match: 'law17:fat', patch: { applicable: true, passes: false } }]
       `match` uses the same grammar as nullAgents (substring of label, or 'phase:<Phase>').
       ⚠ WHY THE POSITION MATTERS, MEASURED: this block first sat immediately after fake(), ABOVE
       the built-in triage and architect overrides — and `isTriage` does Object.assign(v, {tier:
       'max', ...}) unconditionally. So a caller patching triage to tier:'direct' (the refusal that
       bails a whole run with "spawning nothing") had that value silently overwritten by the
       harness, the run fanned out anyway, and the sweep recorded it as "triage:direct does not
       stop the run" — a FALSE FINDING about a safeguard that works perfectly. Worse,
       `patchedAgents` said the patch had matched, because it HAD: "the patch was applied" and "the
       patch had an effect" are different facts, and the instrument was reporting the first while
       the second was false. That is precisely the defect class this whole arc is about, in the tool
       built to find it. The caller's explicit intent is the most specific instruction in the file
       and must therefore be applied LAST. */
    if (Array.isArray(H.agentPatch)) {
      for (const ap of H.agentPatch) {
        const m = String(ap && ap.match || '')
        const hit = m.startsWith('phase:')
          ? String(rec.phase || '') === m.slice(6)
          : m && String(rec.label || '').includes(m)
        if (hit && ap.patch && typeof ap.patch === 'object') {
          if (!v || typeof v !== 'object') v = {}
          Object.assign(v, ap.patch)
          /* Record the value AFTER assignment, so a later reader can see what the agent actually
             returned rather than what was requested — the two diverged once already. */
          patchedAgents.push({ match: m, label: rec.label || null, phase: rec.phase || null,
            applied: JSON.parse(JSON.stringify(ap.patch)),
            effective: Object.fromEntries(Object.keys(ap.patch).map(k => [k, v[k]])) })
        }
      }
    }
    return v
  }
  return `[fake text from ${rec.label}]`
}
globalThis.parallel = async (thunks) => Promise.all((thunks || []).map(t => { try { return t() } catch { return null } }))
globalThis.pipeline = async (items, ...stages) => {
  const out = []
  for (let i = 0; i < (items || []).length; i++) {
    let cur = items[i]
    try { for (const s of stages) cur = await s(cur, items[i], i) } catch { cur = null }
    out.push(cur)
  }
  return out
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
let result, err
try {
  const fn = new AsyncFunction(src)
  result = await fn()
} catch (e) {
  err = e
}

// ---------------- report ----------------
const say = (...a) => console.log(...a)
say('═'.repeat(78))
say('ARGS:', JSON.stringify(ARGS, (k, v) => k === '__harness' ? v : v, 0).slice(0, 500))
say('SCRIPT:', SCRIPT)
if (Object.keys(H).length) say('HARNESS:', JSON.stringify(H).slice(0, 400))
say('═'.repeat(78))
if (err) {
  say('❌ THE SCRIPT THREW — it does NOT load/run:')
  say('   ', err && err.stack ? err.stack.split('\n').slice(0, 6).join('\n    ') : String(err))
} else {
  say('✅ ran to completion, returned:', typeof result, result && typeof result === 'object' ? Object.keys(result).join(', ') : String(result).slice(0, 120))
}
say('')
say(`PHASES (${phases.length}): ${phases.join(' → ')}`)
say('')
say(`AGENTS SPAWNED: ${calls.length}`)
const byPhase = {}
for (const c of calls) (byPhase[c.phase] ||= []).push(c)
for (const [p, cs] of Object.entries(byPhase)) {
  say(`  ${p} (${cs.length}):`)
  for (const c of cs) say(`     - ${c.label}  [model=${c.model} effort=${c.effort} type=${c.agentType}${c.isolation ? ' isolation=' + c.isolation : ''}]`)
}
say('')
const has = (re) => calls.filter(c => re.test(c.label)).length
say('CENSUS:')
say('  architects        :', has(/arch/i) + calls.filter(c => c.phase === 'Architect').length)
say('  skeptics          :', has(/skeptic|refut/i))
say('  completeness crit :', has(/complete|critic|gap/i))
say('  third eye / grok  :', has(/grok|third|eye/i))
say('  render gate       :', has(/render|paint|screenshot|visual/i))
say('  LAW17 fat bar     :', has(/law17|fat|version.?bar/i))
say('  LAW19 reachability:', has(/law19|reach/i))
const models = {}
for (const c of calls) models[c.model] = (models[c.model] || 0) + 1
say('  model tiers       :', JSON.stringify(models))
say('')
say('PROMPT-LEVEL SAFEGUARDS (v16 must reach EVERY prompt) — matched on the REAL text, not the label:')
const withPace = calls.filter(c => /WORK BRISKLY/.test(c.prompt))
const withProof = calls.filter(c => /VERIFY THE THING, NOT A PROXY/.test(c.prompt))
say(`  PACE  ("WORK BRISKLY")            on ${withPace.length}/${calls.length} prompts`)
say(`  PROOF ("VERIFY THE THING…PROXY")  on ${withProof.length}/${calls.length} prompts`)
const missingProof = calls.filter(c => !/VERIFY THE THING, NOT A PROXY/.test(c.prompt)).map(c => c.label)
if (missingProof.length) say(`  ⚠ prompts WITHOUT the proxy ban: ${missingProof.join(', ')}`)
say('')
say('LOG LINES:')
for (const l of logs) say('  |', l.slice(0, 200))
say('')
if (result && typeof result === 'object') {
  say('RETURN PAYLOAD (trimmed):')
  say(JSON.stringify(result, (k, v) => typeof v === 'string' && v.length > 300 ? v.slice(0, 300) + '…' : v, 2).slice(0, 3000))
}

// Machine-readable line for proof scripts (last line is easy to parse)
if (result && typeof result === 'object') {
  say('')
  say('HARNESS_JSON:' + JSON.stringify({
    ok: !err,
    error: result.error || null,
    refused: result.refused || null,
    shippable: result.shippable,
    verdict: result.verdict || null,
    quality: result.quality || null,
    agents: calls.length,
    phases,
  }))
}

/* v40 — FULL, UNTRIMMED DUMP FOR PROOF SCRIPTS. The pretty payload above is clipped at 3000 chars
   and every long string at 300, which is right for a human and useless for an assertion: a proof
   that greps the trimmed view is asserting on the FORMATTER, not on the run. Env-gated so nothing
   about the normal output changes. HARNESS_DUMP=<path> writes {calls, logs, result} verbatim —
   calls[] carries every prompt, which is the only way to prove a prompt-level safeguard reaches
   the agent that needs it. */
if (process.env.HARNESS_DUMP) {
  try {
    const { writeFileSync } = await import('node:fs')
    writeFileSync(process.env.HARNESS_DUMP, JSON.stringify({
      ok: !err, error: err ? String(err && err.message || err) : null,
      result: result ?? null, logs, phases, nulledAgents, patchedAgents,
      calls: calls.map(c => ({ label: c.label, phase: c.phase, model: c.model, prompt: c.prompt })),
    }))
  } catch (e) { say('HARNESS_DUMP FAILED: ' + e.message) }
}

const exitOnThrow = H.exitOnThrow !== false
if (err && exitOnThrow) process.exit(1)
process.exit(0)
