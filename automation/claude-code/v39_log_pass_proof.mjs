#!/usr/bin/env node
// v39 — logPass is opt-in, requires apply, one script, not a ship, not the door.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const js = readFileSync(join(root, 'automation/claude-code/konyo-workflow.js'), 'utf8')
const rhai = readFileSync(join(root, 'automation/workflows/Konyo-Grok.rhai'), 'utf8')
const sh = readFileSync(join(root, 'automation/log-pass.sh'), 'utf8')
const door = readFileSync(join(root, 'automation/claude-code/commands/Konyo.md'), 'utf8')

let fail = 0
const ok = (n) => console.log('  ok  · ' + n)
const bad = (n) => { console.log('  FAIL· ' + n); fail++ }
const has = (label, src, s) => src.includes(s) ? ok(label) : bad(label + ' (missing: ' + s.slice(0, 60) + ')')

console.log('v39 LOG-PASS')
has('script refuses dirty index', sh, 'index is not empty')
has('script denylists kai_balance.json', sh, 'kai_balance.json')
has('script denylists pt_signals.json', sh, 'pt_signals.json')
if (sh.includes('git add -- ') && !/\bgit add --all\b/.test(sh) && !/\bgit add -A\b/.test(sh)) ok('script adds only listed files')
else bad('script must add only listed files')
if (!sh.includes('git push --force') && !sh.includes('git push -f')) ok('script does not force-push')
else bad('script must not force-push')

has('JS logPass const', js, 'const LOG_PASS')
has('JS refuse without apply', js, 'logPass requires apply:true')
has('JS runs script per passed item', js, 'runLogPass')
has('JS payload log_pass', js, 'log_pass:')
has('JS v39 flag', js, 'v39_log_pass')
has('JS builders never push still', js, 'pushing is FORBIDDEN')

has('Rhai log_pass_on', rhai, 'let log_pass_on')
has('Rhai refuse without apply', rhai, 'logPass requires apply:true')
has('Rhai courier runs script only', rhai, 'LOG-PASS courier')
has('Rhai payload log_pass', rhai, 'log_pass:')
has('Rhai v39 flag', rhai, 'v39_log_pass')

if (door.includes('logPass:true') && door.includes('Not a')) ok('door mentions logPass as a knob, not a quality')
else bad('Konyo.md must mention logPass as a knob')
if (!door.includes('quality: \'logPass\'') && !door.includes('quality: "logPass"')) ok('door does not make logPass a quality')
else bad('logPass must not be a quality string')

if (existsSync(join(root, 'automation/log-pass.sh'))) ok('script exists')
else bad('automation/log-pass.sh missing')

if (fail === 0) {
  console.log('ALL GREEN — v39 log-pass contracts present.')
  process.exit(0)
}
console.log('FAILURES: ' + fail)
process.exit(1)
