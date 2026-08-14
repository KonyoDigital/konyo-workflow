let meta = #{
    name: "konyo-workflow-max",
    description: "DEPRECATED — just call /konyo-workflow. MAX is now a QUALITY FLAG on the one shipper, not a second script. This entry point no longer runs anything: it spawns no agents, takes no lock, runs no gates, and returns a BLOCKED payload carrying the exact re-run arguments.",
    when_to_use: "Do not use. Kept only so an old saved /konyo-workflow-max invocation fails LOUDLY instead of silently running a stale duplicate implementation. For a MAX run call /konyo-workflow with {\"quality\":\"max\"}. Passing {objective/task, apply, force, maxItems} here hands those arguments straight back under rerun_with, ready to paste.",
    phases: [
        #{ title: "Delegation notice", detail: "returns BLOCKED with re-run instructions — no triage, no plan, no agents, no render gate, no third-eye" },
    ],
};

// ========== 2026-08-04 — THIS FILE STOPPED BEING AN IMPLEMENTATION ==========
// It was 650 lines / 31,338 bytes of MAX orchestrator: triage, a 3-lens architect panel + judge,
// bounded Grok implementers, the LAW18 render gate, LAW19 reachability, a Claude-Opus third eye and
// a fail-closed synthesizer — five agent() spawn sites in all. Every one of those was a SECOND,
// hand-typed copy of logic that also lives in the standard shipper. That is the same structural
// defect the Claude side just removed: a safeguard added to one copy is a safeguard forgotten in
// the other, and by the time anyone notices, the two have already drifted.
//
// The fix is the same fix, applied to the fourth shipper: konyo-workflow.rhai becomes the ONE Grok
// implementation and carries the quality knob; the max-only phases live there behind it. Nothing was
// deleted — it MOVED. The previous body is no longer archived beside this file; recover it from git
// history (`git log -- grok/konyo-workflow-max.rhai`) if it is ever needed. An in-tree copy could
// only ever be picked up by install.sh's `grok/*.rhai` step and shipped as a live workflow again.
//
// Why this is a NOTICE and not a wrapper that forwards to the real one:
//
//   * A shim would have to invoke the other workflow, and nesting is ONE LEVEL ONLY. The shim would
//     spend that single level, and the real MAX run — which spawns its own sub-work — could then
//     never spawn at all. A wrapper that works today by breaking the thing it wraps is not a wrapper.
//
//   * Copying the merged implementation back here with the default flipped to "max" is precisely the
//     duplication this merge exists to delete.
//
// So it fails loudly, in the vocabulary every caller and synthesizer in this system already reads
// (verdict / ship_allowed / blockers), and hands the caller their own arguments back so the re-run
// is a paste. A caller that checks ship_allowed sees false. A caller that prints verdict sees
// exactly where the run went. Nothing here can be mistaken for a run that happened.
//
// USER-VISIBLE BEHAVIOUR CHANGE: any saved habit, overnight chain or automation that invokes
// /konyo-workflow-max on the Grok host now ABORTS IMMEDIATELY instead of running. That is
// deliberate — a silent fallback to the stale duplicate is the thing being prevented — but it means
// every saved invocation has to be updated to /konyo-workflow with {"quality":"max"}.
// ===========================================================================

fn trimmed(s) {
    if type_of(s) == "string" {
        s.trim();
        s
    } else {
        ""
    }
}

// ========== args ==========
// Echoed straight back, never acted on. Guarded on type_of so a bare-string arg cannot throw on a
// property read — the old body did `args.objective` unguarded, which only survived because the host
// always handed it a map.
let a = if type_of(args) == "map" { args } else { #{} };

let objective = "";
if type_of(args) == "string" {
    objective = trimmed(args);
} else {
    if a.objective != () { objective = trimmed(a.objective); }
    if objective == "" && a.task != () { objective = trimmed(a.task); }
    if objective == "" && a.query != () { objective = trimmed(a.query); }
}

let echo_objective = objective;
if echo_objective == "" { echo_objective = "<your objective>"; }

let rerun_with = #{
    objective: objective,
    task: objective,
    quality: "max",
    apply: a.apply == true,
    force: a.force == true,
};
if a.maxItems != () { rerun_with.maxItems = a.maxItems; }
if a.maxAgents != () { rerun_with.maxAgents = a.maxAgents; }
if a.skeptics != () { rerun_with.skeptics = a.skeptics; }
if a.thirdEye != () { rerun_with.thirdEye = a.thirdEye; }
if a.grok != () { rerun_with.grok = a.grok; }

log("⛔ /konyo-workflow-max HAS MOVED — MAX is now a quality FLAG on /konyo-workflow, not a second script.");
log("   Nothing was run: no triage, no plan, no agents, no render gate, no third-eye.");
log("   Re-run as: /konyo-workflow {\"task\":\"" + echo_objective + "\",\"quality\":\"max\"}");

// Bail-SHAPED, using the same fields the old body returned (verdict / ship_allowed / blockers) so no
// existing reader has to learn a new schema to notice this is not a completed run. ship_allowed is
// the load-bearing field; verdict is what gets printed.
complete(#{
    verdict: "blocked",
    ship_allowed: false,
    moved_to: "konyo-workflow",
    error: "moved",
    summary: "konyo-workflow-max was merged into konyo-workflow; MAX is now {\"quality\":\"max\"} on that single shipper. This entry point runs nothing.",
    blockers: [
        "MAX WORKFLOW MOVED — konyo-workflow-max.rhai is no longer an implementation. MAX quality is now {\"quality\":\"max\"} on /konyo-workflow, the single Grok orchestrator. This entry point deliberately aborts rather than run a stale duplicate. Re-run using rerun_with.",
    ],
    next_actions: [
        "Re-run: /konyo-workflow {\"task\":\"" + echo_objective + "\",\"quality\":\"max\"}",
        "Update any saved invocation, overnight chain or alias that still says /konyo-workflow-max.",
    ],
    // A workflow that silently ignores an argument it does not understand is indistinguishable from
    // one that honours it. If konyo-workflow.rhai has not yet learned the quality knob, it will
    // accept {"quality":"max"}, drop it, and run STANDARD while the caller believes they bought MAX
    // — a silent downgrade on exactly the high-stakes work this entry point existed for. This
    // sandbox cannot read the filesystem, so the check cannot be automated here; it is stated as a
    // precondition instead of assumed away.
    verify_first: "Confirm the target honours the flag BEFORE trusting a max run: `grep -c quality ~/.grok/workflows/konyo-workflow.rhai` must be > 0, and the returned payload must carry quality=max. If it does not, the merge has NOT landed on the Grok side — re-install from this repo's konyo-workflow.rhai and pass {"quality":"max"} — do not revive a stale duplicate max script",
    rerun_with: rerun_with,
});
