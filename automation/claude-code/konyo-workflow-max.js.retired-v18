export const meta = {
  name: 'konyo-workflow-max',
  description: 'DEPRECATED — just call konyo-workflow. MAX IS NOW ITS DEFAULT (2026-08-04), so a bare konyo-workflow run is exactly what this entry point used to be; no flag is needed. This entry point no longer runs anything. It spawns no agents, takes no workspace lock, and returns a BLOCKED payload carrying the exact re-run arguments.',
  whenToUse: 'Do not use. Kept only so an old saved invocation fails LOUDLY instead of silently running a stale duplicate implementation. For a MAX run call konyo-workflow with no quality flag at all — max is its default now. {quality:"max"} is accepted and means the same thing. Passing {task, apply, ...} here returns those arguments back to you under rerun_with, ready to paste.',
  phases: [
    { title: 'Delegation notice', detail: 'returns BLOCKED with re-run instructions — no triage, no lock, no agents, no gates' },
  ],
}

/* ── 2026-08-04 — THIS FILE STOPPED BEING AN IMPLEMENTATION ───────────────────────────────────────
   For four days konyo-workflow.js and konyo-workflow-max.js were two copies of the same orchestrator
   that happened to differ in model tier and panel size. Every safeguard from v13 to v17 — the
   BLOCKERS ledger, bail() on every exit path, the spawn() ceiling and its .catch into SPAWN_ERRORS,
   the strict-majority skeptic threshold, the render gate's fail-closed images[] check, LAW17, LAW19,
   the workspace lock, the skeptic floor — had to be typed twice, by hand, into two files. They had
   already drifted. That duplication was the structural defect, not the tokens.

   The fix: konyo-workflow.js is now the ONE implementation and takes {quality:'standard'|'max'}.
   The max-only phases (the 3-architect panel + judge, the 3-skeptic diverse-lens adversarial gate,
   the loop-until-dry completeness critic, isolate/merge, the FEASIBILITY line, the Opus-everywhere
   tiers) live there, gated on that flag. Nothing was deleted — it MOVED.

   Why this file is a notice and not a thin wrapper that calls the real one:

   • It cannot import konyo-workflow.js. This body is not a real ES module: it uses top-level
     `return`, which is illegal in ESM (`node --check` on the pre-merge file as .mjs fails with
     "Illegal return statement"). The engine therefore strips the export and wraps the body in an
     AsyncFunction, which has no module base — a relative import('./konyo-workflow.js') has nothing
     to resolve against. Unverified, it would turn every max run into a hard load error.

   • It must not call workflow('konyo-workflow') either. Nesting is ONE LEVEL ONLY. A shim would
     spend that level, and the real max run — which spawns its own sub-work — could then never call
     workflow() itself. A wrapper that works today and breaks the thing it wraps is not a wrapper.

   • It must not copy the merged implementation back here with the default flipped to 'max'. That is
     literally the defect this merge exists to remove.

   So: fail loudly, in the vocabulary the rest of the system already reads (verdict / shippable /
   blockers), and hand the caller their own arguments back so the re-run is a paste. A caller that
   checks `shippable` sees false. A caller that prints `verdict` sees where the run went. Nothing
   here can be mistaken for a run that happened.

   USER-VISIBLE BEHAVIOUR CHANGE: any saved habit, overnight chain or automation that invokes
   konyo-workflow-max now ABORTS IMMEDIATELY instead of running. That is deliberate — a silent
   fallback to the stale duplicate is exactly what this merge is preventing — but it means every
   saved invocation has to be updated to konyo-workflow with {quality:'max'}. ──────────────────── */

// Args may arrive as an object OR as a JSON string — normalised exactly as the base does, so the
// task echoes back verbatim even when the caller passed a bare string.
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch { A = { task: A } } }
const TASK = typeof A === 'string' ? A : (A && A.task) || ''

log('⛔ konyo-workflow-max HAS MOVED — MAX quality is now a FLAG on konyo-workflow, not a second script. ' +
    'Nothing was run: no triage, no workspace lock, no agents. ' +
    'Re-run as: /konyo-workflow {"task":' + JSON.stringify(TASK || '<your task>') + ',"quality":"max"}')

// Bail-SHAPED, using the same verdict vocabulary every caller and synthesizer already reads, so no
// reader can mistake this for a completed run. shippable:false is the load-bearing field.
return {
  verdict: 'BLOCKED — konyo-workflow-max was merged into konyo-workflow, and MAX is now its DEFAULT; re-run konyo-workflow with no quality flag',
  shippable: false,
  blockers: [{
    what: 'MAX WORKFLOW MOVED',
    why: 'konyo-workflow-max is no longer an implementation. MAX quality is now {quality:"max"} on ' +
         'konyo-workflow, which is the single orchestrator carrying the v13-v17 safeguards. This ' +
         'entry point deliberately aborts rather than run a stale duplicate. Re-run with rerun_with.',
  }],
  agent_errors: [],
  moved_to: 'konyo-workflow',
  // A workflow that ignores an argument it does not know is indistinguishable from one that honours
  // it. If konyo-workflow has not yet learned {quality:'max'}, it will accept the flag, drop it, and
  // run STANDARD while the caller believes they bought MAX — a silent downgrade on exactly the
  // high-stakes work this entry point existed for. This sandbox cannot read the filesystem, so the
  // check cannot be automated here; it is stated as a precondition instead of assumed away.
  verify_first: 'Confirm the target honours the flag before trusting a max run: ' +
    '`grep -c "quality" ~/.claude/workflows/konyo-workflow.js` must be > 0, and the returned payload ' +
    'must carry quality:\'max\'. If it does not, the merge has not landed — restore this file with ' +
    '`cp ~/.claude/workflows/konyo-workflow-max.js.bak-merge ~/.claude/workflows/konyo-workflow-max.js` ' +
    'and the old (stale but working) max implementation is back.',
  rerun_with: {
    task: TASK,
    quality: 'max',
    apply: !!(A && A.apply),
    maxRounds: (A && A.maxRounds) || 2,
    dryRounds: (A && A.dryRounds) || 1,
    budgetFloor: (A && A.budgetFloor) || 120_000,
    grok: !(A && A.grok === false),
    force: !!(A && A.force),
    maxAgents: (A && A.maxAgents) || 24,
    ...(A && A.skeptics ? { skeptics: A.skeptics } : {}),
    ...(A && A.ignoreLock ? { ignoreLock: true } : {}),
    ...(A && A.isolate ? { isolate: true } : {}),
  },
  error: 'moved',
}
