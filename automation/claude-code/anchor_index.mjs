#!/usr/bin/env node
/* ANCHOR INDEX — stop re-deriving the map of a huge file on every run.
 *
 * WHY THIS EXISTS, measured 2026-08-04. A render-gate agent working tv/control_ui.html spent 51
 * tool calls, and 18 of them were grep/sed answering "where is #hd-taskforce / .hd-chips /
 * _readerHealth defined?" — a question with a fixed answer that every previous agent had already
 * answered and thrown away. On a 40,000-line file that discovery cost more than the actual work,
 * and it is paid again on every future run.
 *
 * This is the same principle as load_harness.mjs and phase_parity_check.mjs: a script that PRINTS
 * A VERDICT beats an agent that re-derives the method. One `node anchor_index.mjs <file> --find x`
 * replaces a grep/sed round-trip — and every tool call re-reads the agent's whole context, so the
 * saving compounds across the rest of that agent's turn.
 *
 * Usage:
 *   node anchor_index.mjs <file> [--find <name>] [--json]
 *     no --find : print the whole index, grouped
 *     --find x  : print only anchors whose name contains x (case-insensitive)
 *
 * It indexes DEFINITIONS, not mentions — a CSS rule that styles #x, an element that declares
 * id="x", a function/const that declares x. That distinction is the point: `grep '#hd-tz'` returns
 * every mention including comments, and a comment describing a selector is textually identical to
 * the selector. This project has been bitten by exactly that confusion more than once.
 */
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const file = args[0]
if (!file) { console.error('usage: node anchor_index.mjs <file> [--find <name>] [--json]'); process.exit(1) }
const findAt = args.indexOf('--find')
const find = findAt >= 0 ? (args[findAt + 1] || '').toLowerCase() : null
const asJson = args.includes('--json')

const lines = readFileSync(file, 'utf8').split('\n')

// Strip block comments so a comment ABOUT a selector is not indexed AS one. Line comments are left
// alone: in HTML/CSS/JS mixed files, `//` inside a URL or a string is far more common than a real
// comment, and over-stripping would hide real code.
let inBlock = false
const code = lines.map(l => {
  let out = '', i = 0
  while (i < l.length) {
    if (!inBlock && l.startsWith('/*', i)) { inBlock = true; i += 2; continue }
    if (inBlock && l.startsWith('*/', i)) { inBlock = false; i += 2; continue }
    if (!inBlock) out += l[i]
    i++
  }
  return out
})

const kinds = {
  'css id':      /(?:^|[,{}\s])#([A-Za-z_][\w-]*)\s*(?:[,{:.[]|\s*\{)/g,
  'css class':   /(?:^|[,{}\s])\.([A-Za-z_][\w-]*)\s*(?:[,{:.[]|\s*\{)/g,
  'html id':     /\bid="([^"]+)"/g,
  'function':    /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g,
  'const/let':   /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g,
  'window.':     /\bwindow\.([A-Za-z_$][\w$]*)\s*=/g,
}

const index = new Map()   // name -> [{kind, line}]
code.forEach((line, n) => {
  for (const [kind, re] of Object.entries(kinds)) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(line))) {
      const name = m[1]
      if (!name || name.length < 2) continue
      const key = `${kind}|${name}`
      if (!index.has(key)) index.set(key, { kind, name, lines: [] })
      const e = index.get(key)
      if (e.lines.length < 6) e.lines.push(n + 1)   // first few definitions are what you want
    }
  }
})

let rows = [...index.values()]
if (find) rows = rows.filter(r => r.name.toLowerCase().includes(find))
rows.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))

if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }

if (!rows.length) {
  console.log(`no DEFINITION found for "${find}" in ${file}.`)
  console.log('That is a real answer: it may be built dynamically (string concatenation), or it may')
  console.log('only ever appear in comments. Grep before concluding it does not exist.')
  process.exit(0)
}
console.log(`${file} — ${rows.length} anchor(s)${find ? ` matching "${find}"` : ''}\n`)
let lastKind = ''
for (const r of rows) {
  if (r.kind !== lastKind) { console.log(`  [${r.kind}]`); lastKind = r.kind }
  console.log(`    ${r.name.padEnd(34)} ${r.lines.join(', ')}`)
}
