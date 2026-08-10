let meta = #{
    name: "konyo-workflow",
    description: "DEPRECATED short-path name — use /Konyo-Grok. This entry no longer runs the fleet: it returns BLOCKED with the exact re-run args for /Konyo-Grok so old saved invocations fail LOUDLY instead of running a second copy of the shipper.",
    when_to_use: "Do not use. Kept only so /konyo-workflow still appears and redirects. For a real ship call /Konyo-Grok with the same args (task, apply, quality, items, force, push, …).",
    phases: [
        #{ title: "Delegation notice", detail: "returns BLOCKED with re-run instructions — no agents, no lock, no gates" },
    ],
};

// Thin alias (2026-08-11). The ONE implementer is Konyo-Grok.rhai.
// Same pattern as konyo-workflow-max.rhai → quality:"max" on the one body.

fn as_map(v) {
    if type_of(v) == "map" { v } else { #{} }
}

fn trimmed(s) {
    if type_of(s) == "string" {
        s.trim();
        s
    } else {
        ""
    }
}

let a = (typeof args != "undefined" ? args : null) || globalThis.__KONYO_ARGS || #{};
if type_of(a) == "string" {
    try { a = parse_json(a); } catch { a = #{ task: a }; }
}
a = as_map(a);

let task = "";
if a.task != () { task = trimmed(a.task); }
else if a.objective != () { task = trimmed(a.objective); }

let rerun = #{};
// pass through common knobs so the human can paste into /Konyo-Grok
if task != "" { rerun.task = task; }
if a.apply != () { rerun.apply = a.apply; }
if a.quality != () { rerun.quality = a.quality; }
if a.force != () { rerun.force = a.force; }
if a.items != () { rerun.items = a.items; }
if a.push != () { rerun.push = a.push; }
if a.thirdEye != () { rerun.thirdEye = a.thirdEye; }
if a.skeptics != () { rerun.skeptics = a.skeptics; }
if a.isolate != () { rerun.isolate = a.isolate; }
if a.maxAgents != () { rerun.maxAgents = a.maxAgents; }
if a.renderLoop != () { rerun.renderLoop = a.renderLoop; }

log("⛔ /konyo-workflow is a short alias stub. The live shipper is /Konyo-Grok.");
log("   Re-run: /Konyo-Grok " + json_encode(rerun));

let md = "# Redirected — use /Konyo-Grok\n\n";
md += "This slash is **deprecated** as an implementer. The one Grok Konyo body is:\n\n";
md += "```\n/Konyo-Grok " + json_encode(rerun) + "\n```\n\n";
md += "Same args: `task`, `apply`, `quality` (lean|max|standard|tiny), `items`, `push`, …\n";
md += "Workflow is **not** the default for every chat — only when you want a sealed multi-round ship.\n";

let report_path = write_scratch_file("konyo-workflow-redirect.md", md);

complete(#{
    path: report_path,
    report: md,
    verdict: "BLOCKED — use /Konyo-Grok",
    shippable: false,
    ship_allowed: false,
    rerun_with: rerun,
    redirect: "Konyo-Grok",
});
