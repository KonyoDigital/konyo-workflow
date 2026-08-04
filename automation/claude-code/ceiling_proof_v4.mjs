import fs from 'fs';
/* v21.1 — THIS GATE HAD BEEN DEAD SINCE v18 AND NOTHING NOTICED. It hardcoded
   `~/.claude/workflows/konyo-workflow-max.js`, a file RETIRED when max and cost-scaled were merged
   into one body — so it threw ENOENT on line 2, before it ever reached argv, and every invocation
   died without running a single assertion. A tool that cannot fail is not a gate; this one could
   not even start, which is worse, because "I ran the ceiling proof" stayed sayable.
   Found by the round-2 audit, which correctly refused to run it and reported it instead of
   quietly skipping it. Now takes the script path as argv[2] and defaults to the repo copy beside
   it — the same convention load_harness.mjs and phase_parity_check.mjs already use. */
const SCRIPT = process.argv[2]
  || new URL('./konyo-workflow.js', import.meta.url).pathname;
const src = fs.readFileSync(SCRIPT,'utf8')
  .replace(/^export const meta/m,'const meta');
console.log('script         :', SCRIPT);

// a worst case ON PURPOSE: the plan asks for many items, every skeptic REFUTES so every item
// burns all its rework rounds, and the critic keeps finding more work forever. This is the exact
// shape that turned a cap of 34 into 119.
let spawned = 0, critRounds = 0, skeptics = 0, finals = 0;
const fakeAgent = async (prompt, opts) => {
  spawned++;
  const label = (opts && opts.label) || '';
  if (opts && opts.schema && /triage/.test(label))
    return { shape:'audit', parallelism:'parallel', cost_of_wrong:'medium', tier:'standard',
             est_agents:14, skeptics:1, work_list_known:true, why:'x' };
  /* v21.1 — MATCH THE PHASE, NOT THE LABEL. This tested `/architect|judge/` against opts.label,
     which held while max spawned `architect:1..3` + `architect:judge`. The LEAN path spawns ONE
     architect with NO label at all, so the fake fell through to the generic return, the script saw
     no `items`, and the whole stress aborted after 2 agents — while still printing "✅ ceiling
     holds", because a cap is trivially respected by a run that never started. The phase is the
     stable identity here; the label is decoration. */
  if ((opts && opts.phase === 'Architect') || /architect|judge/i.test(label) || (prompt||'').includes('JUDGE'))
    return { version_label:'v', summary:'s', why:'w',
             items: Array.from({length:22},(_,i)=>({id:'i'+i,file:'/f'+i+'.js',risk:'high',instruction:'do'})) };
  if (/skeptic/.test(label)) { skeptics++; return { refuted:false, severity:'minor', reason:'ok' }; }
  if (/build/.test(label))  return { summary:'s', changes:'diff', self_check:'c' };
  if ((prompt||'').includes('COMPLETENESS CRITIC')) {
    critRounds++;
    return { done:false, missing: Array.from({length:10},(_,i)=>({file:'/crit'+critRounds+'-'+i+'.js',instruction:'more'})) };
  }
  if ((prompt||'').includes('final report') || /Synthesize/.test((opts&&opts.phase)||'')) finals++;
  return { version_label:'v', headline:'h', shipped:['x'], follow_ups:[] };
};
const fakeParallel = (thunks) => Promise.all(thunks.map(t => t().catch(()=>null)));
const fakePipeline = async (items, ...stages) => {
  const out = [];
  for (const it of items) { let v = it; for (const st of stages) v = await st(v, it, 0); out.push(v); }
  return out;
};

const CAP = 24;
const run = new Function('args','budget','log','agent','parallel','pipeline','phase','workflow',
  'return (async()=>{' + src + '})()');
/* v21.1 — ASK FOR MAX EXPLICITLY. This passed no quality, which meant MAX while max was the
   default (v18) and silently became LEAN at v20 — so the tool built to stress the MAX ceiling
   quietly started stressing a different, cheaper path. A default is not a request. */
const res = await run(
  { apply:false, maxAgents:CAP, grok:false, quality:'max', task:'stress the ceiling' },
  { total:null, spent:()=>0, remaining:()=>Infinity },
  () => {}, fakeAgent, fakeParallel, fakePipeline, () => {}, async()=>null);

console.log('cap            :', CAP);
console.log('agents spawned :', spawned);
console.log('critic rounds  :', critRounds);
console.log('ceiling.spent  :', res && res.ceiling && res.ceiling.spent);
console.log('ceiling hit    :', res && res.ceiling && res.ceiling.hitDuringCompleteness);
console.log('reported complete:', res && res.ceiling && res.ceiling.complete);
console.log('skeptic spawns :', skeptics, '(triage asked for 1 per item)');
console.log('synthesis ran  :', finals > 0, '← v3 returned final:null here');
console.log('items planned  :', (res&&res.ceiling&&res.ceiling.trimmedFromPlan||[]).length, 'trimmed of 22');
/* v21.1 — A RUN THAT NEVER STARTED MUST NOT PRINT A PASS. `spawned <= CAP` is trivially TRUE when
   the stress aborts after 2 agents, so this tool announced "✅ ceiling holds" over a test that had
   proven nothing — the exact false-pass shape the workflow's own gates exist to refuse. The stress
   is only meaningful if the run actually reached its end, so that is now a precondition, checked
   FIRST and reported as INCONCLUSIVE rather than as either pass or fail. */
const aborted = !!(res && (res.error || res.refused)) || spawned < 5;
if (aborted) {
  console.log('\n❌ INCONCLUSIVE — the stress never ran, so the ceiling was never tested.');
  console.log('   verdict :', (res && res.verdict) || '(none)');
  console.log('   error   :', (res && (res.error || res.refused)) || '(none)');
  console.log('   Fix the harness fakes to match the current script before trusting any result.');
  process.exitCode = 1;
} else {
  console.log(spawned <= CAP ? '\n✅ ceiling holds' : '\n❌ blew the cap by ' + (spawned-CAP));
  console.log(finals > 0 ? '✅ the run can still REPORT' : '❌ spent everything, reported nothing');
  if (spawned > CAP || finals === 0) process.exitCode = 1;
}
