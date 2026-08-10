// Tests the REAL functions, sliced out of the live engine — never a copy. A copy would drift.
import { readFileSync } from 'node:fs'
const SRC = readFileSync('/Users/konyo/.claude/workflows/konyo-workflow.js','utf8')
const start = SRC.indexOf('const SCARS = []')
// ⚠ ANCHOR ON A STABLE MARKER. This slice used to end at 'function bail(o) {' — then v32
// made bail ASYNC and the marker vanished, so indexOf returned -1, the slice ran to the end
// of the file and the proof died on a syntax error. A guard anchored to a line someone else
// is free to edit is a guard that breaks silently the day they edit it.
const end   = SRC.search(/\n(?:async )?function bail\(o\) \{/)
if (start < 0 || end < 0 || end < start) { console.log('SLICE FAILED'); process.exit(1) }
const body = SRC.slice(start, end)
const mk = (minOverride) => {
  const src = minOverride ? body.replace('function carveCandidates(minN = 3)', `function carveCandidates(minN = ${minOverride})`) : body
  return new Function(src + '\nreturn {SCARS, recordScar, scarTerritory, carveCandidates, scarBriefFor}')()
}
let pass=0, fail=0
const ok=(n,c)=>{ c?(pass++,console.log('  ✅ '+n)):(fail++,console.log('  ❌ '+n)) }

console.log('\nEVIDENCE-OR-NOTHING')
let m = mk()
m.recordScar({file:'a.py'})                       // no reason
m.recordScar({file:'a.py', reason:''})            // empty reason
ok('a scar with no reason is REFUSED', m.SCARS.length === 0)
m.recordScar({file:'a.py', reason:'control set was mislabelled', round:1})
ok('a scar WITH evidence is recorded', m.SCARS.length === 1)

console.log('\nTHE CARVE FLOOR IS LOAD-BEARING (three, because two is a coincidence)')
m = mk()
for (const f of ['a.py','b.py']) m.recordScar({file:f, reason:'the control set was mislabelled entirely', round:1})
ok('TWO scars in one territory propose NOTHING', m.carveCandidates().length === 0)
m.recordScar({file:'c.py', reason:'the control set was mislabelled entirely', round:2})
ok('THREE scars in one territory DO propose a carve', m.carveCandidates().length === 1)
ok('and it carries its evidence + files', (m.carveCandidates()[0].evidence||[]).length === 3 && m.carveCandidates()[0].files.length === 3)

console.log('\nRED PROOF — drop the floor to 2 and the guard must go WRONG')
const bad = mk(2)
for (const f of ['a.py','b.py']) bad.recordScar({file:f, reason:'the control set was mislabelled entirely', round:1})
ok('with minN=2 a COINCIDENCE is wrongly proposed (so the 3 is doing real work)', bad.carveCandidates().length === 1)

console.log('\nDISTINCT FAILURES MUST NOT MERGE (a false cluster manufactures the 3rd scar)')
m = mk()
m.recordScar({file:'a.py', reason:'the control set was mislabelled entirely', round:1})
m.recordScar({file:'b.py', reason:'render gate never ran because ceiling hit', round:1})
m.recordScar({file:'c.py', reason:'reachability found a dead seam nobody calls', round:1})
ok('three UNRELATED failures propose nothing', m.carveCandidates().length === 0)

console.log('\nTHE BRIEF NARROWS, NEVER SUPPRESSES')
m = mk()
m.recordScar({file:'a.py', reason:'AAA failed', round:1})
m.recordScar({file:'b.py', reason:'BBB failed', round:1})
const brief = m.scarBriefFor('a.py')
ok('a file is NOT told its own scar (it already has it)', !brief.includes('AAA'))
ok("a file IS told its sibling's scar", brief.includes('BBB'))
ok('the brief says these never excuse a gate', /never excuse you from any gate/.test(brief))
ok('no siblings -> empty brief, not noise', m.scarBriefFor('zzz.py') !== '' && mk().scarBriefFor('a.py') === '')

console.log('\nTHE CAP HOLDS (a prompt that grows forever crowds out its own instruction)')
m = mk()
for (let i=0;i<40;i++) m.recordScar({file:`f${i}.py`, reason:`failure number ${i} happened`, round:1})
ok('at most 6 scars reach a prompt', (m.scarBriefFor('x.py').match(/ · \[round/g)||[]).length <= 6)

console.log(`\n${fail? '❌':'✅'} ${pass} passed, ${fail} failed`)
process.exit(fail?1:0)
