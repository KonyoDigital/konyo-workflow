#!/usr/bin/env node
/**
 * v30 METER ROUTING PROOF — Claude shipper has Grok parity on item caps + craft.
 * Static source contracts (same style as v27_empty_plan_proof.mjs).
 *
 *   node v30_meter_routing_proof.mjs [path/to/konyo-workflow.js]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const script = process.argv[2]
  || path.join(process.env.HOME || '', '.claude/workflows/konyo-workflow.js')
  || path.join(__dirname, 'konyo-workflow.js')

const src = fs.readFileSync(script, 'utf8')
const failures = []
function has(label, needle) {
  if (src.includes(needle)) console.log(`  ok  · ${label}`)
  else { console.log(`  FAIL· ${label}`); failures.push(label) }
}
function hasRe(label, re) {
  if (re.test(src)) console.log(`  ok  · ${label}`)
  else { console.log(`  FAIL· ${label}`); failures.push(label) }
}

console.log('script:', script)
console.log('')
console.log('v30 METER ROUTING')
has('MAX_ITEMS_CAP declared', 'let MAX_ITEMS_CAP')
has('max only cap 6', 'else if (MAXONLY) MAX_ITEMS_CAP = 6')
has('lean cap 8', 'else if (LEANQ) MAX_ITEMS_CAP = 8')
has('standard cap 10', "else if (QUALITY === 'standard') MAX_ITEMS_CAP = 10")
has('tiny cap 4', 'if (TINYQ) MAX_ITEMS_CAP = 4')
has('caller override maxItems', 'A.maxItems')
has('volume arc heuristic', 'LOOKS_LIKE_VOLUME_ARC')
has('meter routing log', 'v30 METER ROUTING')
has('version arc discipline', 'VERSION ARC DISCIPLINE (v30)')
has('tip honesty', 'TIP HONESTY (v30)')
has('thrash resistance', 'THRASH RESISTANCE (v30)')
has('item cap log', 'v30 ITEM CAP')
has('architect item cap prompt', 'ITEM CAP THIS RUN (v30 meter routing')
has('payload max_items_cap', 'max_items_cap: MAX_ITEMS_CAP')
has('payload volume heuristic', 'volume_arc_heuristic: LOOKS_LIKE_VOLUME_ARC')
has('safeguard flag meter', 'v30_meter_routing: true')
has('safeguard flag max not volume', 'v30_max_not_for_volume_arcs: true')
has('whenToUse maxItems', 'maxItems')

if (failures.length) {
  console.log(`\n❌ v30 METER ROUTING PROOF FAILED (${failures.length})`)
  process.exit(1)
}
console.log('\n✅ v30 METER ROUTING PROOF PASSED — Claude has Grok meter parity.')
