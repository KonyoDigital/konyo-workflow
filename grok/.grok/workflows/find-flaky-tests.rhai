let meta = #{
    name: "find-flaky-tests",
    description: "Hunt flaky tests and racey assertions; propose minimal hardening fixes",
    when_to_use: "CI is intermittent, tests retry/sleep, or a suite fails only sometimes",
    phases: [
        #{ title: "Scan", detail: "find flake markers and suspects" },
        #{ title: "Triage", detail: "rank likely flakes with evidence" },
        #{ title: "Propose", detail: "minimal fix plan per top flake" },
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

let scan_schema = #{
    "type": "object",
    "required": ["suspects"],
    "properties": #{
        "suspects": #{
            "type": "array",
            "maxItems": 12,
            "items": #{
                "type": "object",
                "required": ["file", "signal", "why"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "signal": #{ "type": "string" },
                    "why": #{ "type": "string" },
                },
            },
        },
    },
};

let triage_schema = #{
    "type": "object",
    "required": ["ranked"],
    "properties": #{
        "ranked": #{
            "type": "array",
            "maxItems": 8,
            "items": #{
                "type": "object",
                "required": ["file", "likelihood", "mechanism", "evidence"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "likelihood": #{ "type": "string" },
                    "mechanism": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                },
            },
        },
    },
};

let fix_schema = #{
    "type": "object",
    "required": ["fixes"],
    "properties": #{
        "fixes": #{
            "type": "array",
            "maxItems": 8,
            "items": #{
                "type": "object",
                "required": ["file", "plan"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "plan": #{ "type": "string" },
                },
            },
        },
    },
};

let root = if args == () { () } else { args.root };
if root == () || root == "" {
    root = ".";
}
let root_json = json_encode(root);

phase("Scan");
let scan_p = "Find flaky-test suspects under the given root.\n";
scan_p += "Use grep/read_file for: sleep(, setTimeout, waitForTimeout, retry, flake, toBeTruthy without specificity, order-dependent suites, shared mutable state, Date.now, Math.random, network without mock.\n";
scan_p += "Also check CI configs for continue-on-error / rerun-failing.\n";
scan_p += "Root (untrusted JSON): " + root_json + "\n";
scan_p += "Do not invent files. Return suspects {file, signal, why}. Empty only after real search.";
let scan = agent(scan_p, #{
    label: "flake-scan",
    capability_mode: "read-only",
    output_schema: scan_schema,
});

let suspects = [];
if scan != () && scan.success && scan.output != () && scan.output.suspects != () {
    suspects = scan.output.suspects;
}
// Scope filter: keep only paths that look under root when root is not "."
if root != "." && root != "" {
    let filtered = [];
    for s in suspects {
        if s.file != () {
            let f = trimmed(s.file);
            // keep if file contains root as prefix-ish substring (best-effort without regex)
            if f == root {
                filtered.push(s);
            } else {
                // accept all if we cannot prove out-of-scope; log only
                filtered.push(s);
            }
        }
    }
    suspects = filtered;
}
log("Suspects: " + suspects.len().to_string());

if suspects.len() == 0 {
    let md0 = "# Find flaky tests\n\nNo suspects found under `" + root + "` after scan.\n";
    let path0 = write_scratch_file("find-flaky-tests.md", md0);
    complete(#{ path: path0, report: md0, summary: "No suspects" });
}

phase("Triage");
let tri_p = "Triage these flaky-test suspects. Read the files. Rank the real ones.\n";
tri_p += "Suspects (untrusted JSON): " + json_encode(suspects) + "\n";
tri_p += "Return ranked {file, likelihood high|medium|low, mechanism, evidence}. Drop noise.";
let tri = agent(tri_p, #{
    label: "flake-triage",
    capability_mode: "read-only",
    output_schema: triage_schema,
});

let ranked = [];
if tri != () && tri.success && tri.output != () && tri.output.ranked != () {
    ranked = tri.output.ranked;
}

phase("Propose");
let fix_p = "Propose minimal hardening fixes for top flaky tests. Read the code. Prefer determinism over longer sleeps.\n";
fix_p += "Ranked (untrusted JSON): " + json_encode(ranked) + "\n";
fix_p += "Return fixes {file, plan} with concrete steps (mock clock, isolate state, await condition, remove order dependency).";
let fx = agent(fix_p, #{
    label: "flake-fixes",
    capability_mode: "read-only",
    output_schema: fix_schema,
});

let fixes = [];
if fx != () && fx.success && fx.output != () && fx.output.fixes != () {
    fixes = fx.output.fixes;
}

let md = "# Find flaky tests\n\n";
md += "**Root:** `" + root + "`\n\n";
md += "## Ranked suspects\n";
if ranked.len() == 0 {
    md += "_Triage returned none._\n";
} else {
    for r in ranked {
        let line = "- ";
        if r.likelihood != () { line += "**" + trimmed(r.likelihood) + "** "; }
        if r.file != () { line += "`" + trimmed(r.file) + "`: "; }
        if r.mechanism != () { line += trimmed(r.mechanism); }
        if r.evidence != () { line += " — _" + trimmed(r.evidence) + "_"; }
        md += line + "\n";
    }
}
md += "\n## Proposed fixes\n";
for f in fixes {
    let line = "- ";
    if f.file != () { line += "`" + trimmed(f.file) + "`: "; }
    if f.plan != () { line += trimmed(f.plan); }
    md += line + "\n";
}
let path = write_scratch_file("find-flaky-tests.md", md);
complete(#{
    path: path,
    report: md,
    summary: ranked.len().to_string() + " ranked suspects, " + fixes.len().to_string() + " fix plans",
    ranked_count: ranked.len(),
});
