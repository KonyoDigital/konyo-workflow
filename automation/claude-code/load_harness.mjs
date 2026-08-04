#!/usr/bin/env node
// LOAD HARNESS for konyo-workflow.js
// node --check cannot see TDZ or top-level throws. This executes the whole script body with the
// engine's injected globals stubbed, so the module is PROVEN to load and run to its return.
// Usage: node load_harness.mjs '<json args>'
import { readFileSync } from 'node:fs'

const SCRIPT = process.argv[3] || '/Users/konyo/.claude/workflows/konyo-workflow.js'
const ARGS = JSON.parse(process.argv[2] || '{}')

let src = readFileSync(SCRIPT, 'utf8')
// workflow scripts use a top-level `return`, which is illegal in an ES module — the engine wraps the
// body in an async function, so we do exactly the same thing.
src = src.replace(/^export const meta/m, 'const meta')

const calls = []
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
  if (/file|path/.test(k)) return '/Users/konyo/.claude/workflows/konyo-workflow.js'
  return `[fake:${key || 'str'}]`
}

globalThis.args = ARGS
globalThis.budget = { total: null, spent: () => 0, remaining: () => Infinity }
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
  if (opts.schema) {
    const v = fake(opts.schema, '', rec.label)
    // triage drives the whole run — force the expensive path so every phase is exercised
    if (/triage/i.test(rec.label) || (v && typeof v === 'object' && 'cost_of_wrong' in v && 'est_agents' in v)) {
      Object.assign(v, { shape: 'code', parallelism: 'parallel', cost_of_wrong: 'high', tier: 'max', est_agents: 4, skeptics: 3, why: 'harness' })
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
say('ARGS:', JSON.stringify(ARGS))
say('SCRIPT:', SCRIPT)
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
say('  architects        :', has(/arch/i))
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
const allPrompts = calls.map(c => c.prompt).join('\n')
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
