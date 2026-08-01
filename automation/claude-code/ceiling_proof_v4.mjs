import fs from 'fs';
const src = fs.readFileSync('/Users/konyo/.claude/workflows/konyo-workflow-max.js','utf8')
  .replace(/^export const meta/m,'const meta');

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
  if (/architect|judge/i.test(label) || (prompt||'').includes('JUDGE'))
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
const res = await run(
  { apply:false, maxAgents:CAP, grok:false, task:'stress the ceiling' },
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
console.log(spawned <= CAP ? '\n✅ ceiling holds' : '\n❌ blew the cap by ' + (spawned-CAP));
console.log(finals > 0 ? '✅ the run can still REPORT' : '❌ spent everything, reported nothing');
