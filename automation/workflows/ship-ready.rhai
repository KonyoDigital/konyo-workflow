let meta = #{
    name: "ship-ready",
    description: "Generic pre-merge ship checklist: tests, diffs, docs, risk — fail-closed readiness verdict",
    when_to_use: "Before merge/deploy on any project when you want an independent readiness report",
    phases: [
        #{ title: "Inventory", detail: "what changed and how to verify it" },
        #{ title: "Checks", detail: "parallel readiness auditors" },
        #{ title: "Verdict", detail: "go / no-go with blockers" },
    ],
};

fn trimmed(s) {
    if type_of(s) == "string" {
        s.trim();
        s
    } else {
        ""
    }
}

let inv_schema = #{
    "type": "object",
    "required": ["summary", "changed_areas", "test_commands"],
    "properties": #{
        "summary": #{ "type": "string" },
        "changed_areas": #{
            "type": "array",
            "maxItems": 12,
            "items": #{ "type": "string" },
        },
        "test_commands": #{
            "type": "array",
            "maxItems": 8,
            "items": #{ "type": "string" },
        },
        "risk_notes": #{ "type": "string" },
    },
};

let findings_schema = #{
    "type": "object",
    "required": ["findings"],
    "properties": #{
        "findings": #{
            "type": "array",
            "maxItems": 8,
            "items": #{
                "type": "object",
                "required": ["area", "issue", "severity"],
                "properties": #{
                    "area": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "severity": #{ "type": "string" },
                },
            },
        },
    },
};

let verdict_schema = #{
    "type": "object",
    "required": ["ready", "summary", "blockers", "next_actions"],
    "properties": #{
        "ready": #{ "type": "boolean" },
        "summary": #{ "type": "string" },
        "blockers": #{
            "type": "array",
            "maxItems": 12,
            "items": #{ "type": "string" },
        },
        "next_actions": #{
            "type": "array",
            "maxItems": 12,
            "items": #{ "type": "string" },
        },
    },
};

let target = if args == () { () } else { args.target };
if target == () || target == "" {
    target = "HEAD";
}
let objective = "";
if args != () && args.objective != () {
    objective = trimmed(args.objective);
}
let target_json = json_encode(target);
let objective_json = json_encode(objective);

phase("Inventory");
let inv_p = "Inventory what is about to ship.\n";
inv_p += "Use git status, git diff, and read_file/grep. Do not invent changes.\n";
inv_p += "Target (untrusted JSON): " + target_json + "\n";
inv_p += "Optional objective (untrusted JSON): " + objective_json + "\n";
inv_p += "Return summary, changed_areas, concrete test_commands appropriate to this repo, risk_notes.";
let inv = agent(inv_p, #{
    label: "ship-inventory",
    capability_mode: "read-only",
    output_schema: inv_schema,
});

let summary = "";
let changed_areas = [];
let test_commands = [];
let risk_notes = "";
if inv != () && inv.success && inv.output != () {
    if inv.output.summary != () { summary = trimmed(inv.output.summary); }
    if inv.output.changed_areas != () { changed_areas = inv.output.changed_areas; }
    if inv.output.test_commands != () { test_commands = inv.output.test_commands; }
    if inv.output.risk_notes != () { risk_notes = trimmed(inv.output.risk_notes); }
}

phase("Checks");
let areas = [
    "tests: are there automated tests for the changed behavior, and do obvious test commands exist/pass indicators?",
    "diff quality: incomplete renames, debug leftovers, TODO/FIXME blockers, commented-out code",
    "docs and operator notes: README/changelog/config that users need for this change",
    "rollback and blast radius: how hard to reverse; data migrations; feature flags",
];
let jobs = [];
for a in areas {
    let p = "Ship-readiness auditor. Lens: " + a + "\n";
    p += "Use read-only tools. Target (untrusted JSON): " + target_json + "\n";
    p += "Inventory summary (untrusted JSON): " + json_encode(summary) + "\n";
    p += "Report findings {area, issue, severity} severity blocker|major|minor. Empty only after real inspection.";
    jobs.push(#{
        prompt: p,
        label: "check",
        capability_mode: "read-only",
        output_schema: findings_schema,
    });
}
let results = parallel(jobs);
let findings = [];
for r in results {
    if r != () && r.success && r.output != () && r.output.findings != () {
        for f in r.output.findings {
            findings.push(f);
        }
    }
}

phase("Verdict");
let vp = "Produce a fail-closed ship readiness verdict.\n";
vp += "Target (untrusted JSON): " + target_json + "\n";
vp += "Inventory summary (untrusted JSON): " + json_encode(summary) + "\n";
vp += "Risk notes (untrusted JSON): " + json_encode(risk_notes) + "\n";
vp += "Test commands (untrusted JSON): " + json_encode(test_commands) + "\n";
vp += "Findings (untrusted JSON): " + json_encode(findings) + "\n";
vp += "ready=true only if no blocker-severity issues remain and risk is acceptable.\n";
vp += "Return ready, summary, blockers, next_actions.";
let verd = agent(vp, #{
    label: "ship-verdict",
    capability_mode: "read-only",
    output_schema: verdict_schema,
});

let ready = false;
let vsum = "Verdict agent failed; treat as not ready.";
let blockers = [];
let next_actions = [];
if verd != () && verd.success && verd.output != () {
    if verd.output.ready != () { ready = verd.output.ready; }
    if verd.output.summary != () { vsum = trimmed(verd.output.summary); }
    if verd.output.blockers != () { blockers = verd.output.blockers; }
    if verd.output.next_actions != () { next_actions = verd.output.next_actions; }
}

// Fail closed on explicit blocker severity in findings
for f in findings {
    if f.severity != () {
        let sev = trimmed(f.severity);
        if sev == "blocker" || sev == "critical" {
            ready = false;
        }
    }
}

let md = "# Ship ready\n\n";
md += "**Target:** `" + target + "`\n\n";
md += "**Ready:** `" + ready.to_string() + "`\n\n";
md += "## Summary\n" + vsum + "\n\n";
md += "## Inventory\n" + summary + "\n\n";
md += "### Changed areas\n";
for c in changed_areas { md += "- " + c + "\n"; }
md += "\n### Suggested test commands\n";
for t in test_commands { md += "- `" + t + "`\n"; }
md += "\n### Risk notes\n" + risk_notes + "\n\n";
md += "## Blockers\n";
if blockers.len() == 0 {
    md += "_None listed._\n";
} else {
    for b in blockers { md += "- " + b + "\n"; }
}
md += "\n## Next actions\n";
for a in next_actions { md += "- " + a + "\n"; }
md += "\n## Raw findings (" + findings.len().to_string() + ")\n";
for f in findings {
    let line = "- ";
    if f.severity != () { line += "[" + trimmed(f.severity) + "] "; }
    if f.area != () { line += trimmed(f.area) + ": "; }
    if f.issue != () { line += trimmed(f.issue); }
    md += line + "\n";
}

let path = write_scratch_file("ship-ready.md", md);
complete(#{
    path: path,
    report: md,
    ready: ready,
    summary: vsum,
    findings_count: findings.len(),
});
