import fs from 'fs';
const src = fs.readFileSync('/Users/konyo/.claude/workflows/konyo-workflow-max.js','utf8')
  .replace(/^export const meta/m,'const meta');

// a worst case ON PURPOSE: the plan asks for many items, every skeptic REFUTES so every item
// burns all its rework rounds, and the critic keeps finding more work forever. This is the exact
// shape that turned a cap of 34 into 119.
let spawned = 0, critRounds = 0;
const fakeAgent = async (prompt, opts) => {
  spawned++;
  const label = (opts && opts.label) || '';
  if (opts && opts.schema && /triage/.test(label))
    return { shape:'audit', parallelism:'parallel', cost_of_wrong:'medium', tier:'standard',
             est_agents:200, skeptics:3, work_list_known:true, why:'x' };
  if (/architect|judge/i.test(label) || (prompt||'').includes('JUDGE'))
    return { version_label:'v', summary:'s', why:'w',
             items: Array.from({length:40},(_,i)=>({id:'i'+i,file:'/f'+i+'.js',risk:'high',instruction:'do'})) };
  if (/skeptic/.test(label)) return { refuted:true, severity:'major', reason:'no' };   // ALWAYS refute
  if (/build/.test(label))  return { summary:'s', changes:'diff', self_check:'c' };
  if ((prompt||'').includes('COMPLETENESS CRITIC')) {
    critRounds++;
    return { done:false, missing: Array.from({length:10},(_,i)=>({file:'/crit'+critRounds+'-'+i+'.js',instruction:'more'})) };
  }
  return 'ok';
};
const fakeParallel = (thunks) => Promise.all(thunks.map(t => t().catch(()=>null)));
const fakePipeline = async (items, ...stages) => {
  const out = [];
  for (const it of items) { let v = it; for (const st of stages) v = await st(v, it, 0); out.push(v); }
  return out;
};

const CAP = 20;
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
console.log(spawned <= CAP ? '\n✅ THE CEILING HOLDS' : '\n❌ BLEW THE CAP by ' + (spawned-CAP));
