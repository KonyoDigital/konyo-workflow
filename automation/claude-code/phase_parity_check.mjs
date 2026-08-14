#!/usr/bin/env node
// PHASE PARITY CHECK for konyo-workflow.js
//
// The progress tree groups agents by phase TITLE, matched EXACTLY. meta.phases must be a static
// literal, so any title that is templated, or that appears in only one of the three places a title
// can live, produces a box that never fills or a box nobody declared. Both look like a bug to a
// human watching the run, and one of them hid a real question for an hour: "is it okay that it
// completes and skips rows?"
//
// Three places a phase title can appear, and they must agree:
//   1. meta.phases[].title      — what the tree DECLARES
//   2. phase('X')               — what OPENS a group
//   3. agent(..., {phase:'X'})  — what LANDS agents in a group
//
// Usage: node phase_parity_check.mjs [path]   → exits 1 on any mismatch.
import { readFileSync } from 'node:fs'
import { enginePath } from './engine_path.mjs'

const FILE = enginePath(process.argv[2])
const raw = readFileSync(FILE, 'utf8')
// STRIP COMMENTS FIRST. The first version of this checker flagged a TEMPLATED TITLE that existed
// only inside a comment *describing* that very bug — a comment about a defect is textually identical
// to the defect, which is a trap this project has fallen into repeatedly. Scan the code, not the prose.
const src = raw
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n').map(l => l.replace(/(^|[^:'"\`\\])\/\/.*$/, '$1')).join('\n')

const metaBlock = (src.match(/phases: \[([\s\S]*?)\n {2}\],/) || [])[1] || ''
const declared = [...metaBlock.matchAll(/title: '([^']+)'/g)].map(m => m[1])

const opened = [...src.matchAll(/\bphase\('([^']+)'\)/g)].map(m => m[1])
const templated = [...src.matchAll(/\bphase\(`([^`]*)`\)/g)].map(m => m[1])
// opts.phase — literal strings only; a ternary of two literals counts as both.
const assigned = [...src.matchAll(/phase: '([^']+)'/g)].map(m => m[1])
const assignedTernary = [...src.matchAll(/phase: [^,\n]*\?\s*'([^']+)'\s*:\s*'([^']+)'/g)]
  .flatMap(m => [m[1], m[2]])

// A phase can also be handed in as a VARIABLE — runSkeptics(built, 'Adversarial gate') reaches the
// spawn as `phase: phaseName`. A literal-only scan cannot see that and reported the busiest gate in
// the script as never used. So any title that appears anywhere as a bare string literal counts as
// used: weaker, but it never accuses a working phase of not existing.
const anyLiteral = new Set([...src.matchAll(/'([^'\n]+)'/g)].map(m => m[1]))
const used = new Set([...opened, ...assigned, ...assignedTernary])
const dec = new Set(declared)

const problems = []

for (const t of templated) {
  problems.push(`TEMPLATED PHASE TITLE \`${t}\` — a template can never match a static meta entry, so ` +
    `phase() opens a box that meta did not declare, and the agents (which carry a plain literal) land ` +
    `in a different box beside it.`)
}
for (const t of used) {
  if (!dec.has(t)) problems.push(`USED BUT NOT DECLARED: '${t}' — agents will appear in a group meta never mentions.`)
}
for (const t of declared) {
  if (!used.has(t) && !anyLiteral.has(t)) {
    problems.push(`DECLARED BUT NEVER USED: '${t}' — this row sits in the tree forever as a phase that never happens.`)
  } else if (!used.has(t)) {
    console.log(`   note: '${t}' is reached indirectly (passed as a variable), not by a literal phase()/opts.phase — fine, but grep will not find it.`)
  }
}

// duplicate declarations are their own trap: two rows, one concept
const dupes = declared.filter((t, i) => declared.indexOf(t) !== i)
for (const d of new Set(dupes)) problems.push(`DECLARED TWICE: '${d}'`)

console.log(`file      : ${FILE}`)
console.log(`declared  : ${declared.length} → ${declared.join(', ')}`)
console.log(`opened    : ${[...new Set(opened)].join(', ')}`)
console.log(`assigned  : ${[...new Set([...assigned, ...assignedTernary])].join(', ')}`)
console.log('')
if (problems.length) {
  console.log(`❌ ${problems.length} phase-parity problem(s):`)
  for (const p of problems) console.log('   - ' + p)
  process.exit(1)
}
console.log('✅ phase parity clean — every declared title is used, every used title is declared, none templated.')
