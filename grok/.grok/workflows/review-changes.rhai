let meta = #{
    name: "review-changes",
    description: "Review a diff across dimensions, then adversarially verify each finding",
    when_to_use: "Before merging a PR, after a large edit wave, or when you want multi-lens code review with independent skeptics",
    phases: [
        #{ title: "Review", detail: "one reviewer per dimension" },
        #{ title: "Verify", detail: "one skeptic per finding" },
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

let findings_schema = #{
    "type": "object",
    "required": ["findings"],
    "properties": #{
        "findings": #{
            "type": "array",
            "maxItems": 8,
            "items": #{
                "type": "object",
                "required": ["file", "issue"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "severity": #{ "type": "string" },
                },
            },
        },
    },
};

let verdict_schema = #{
    "type": "object",
    "required": ["real", "reason", "evidence"],
    "properties": #{
        "real": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
    },
};

let target = if args == () { () } else { args.target };
if target == () || target == "" {
    pause("verification", "Pass args.target — the diff, branch range, or path to review (e.g. origin/main...HEAD).");
}

let target_json = json_encode(target);

phase("Review");
let dimensions = [
    "correctness bugs and logic errors",
    "error handling and edge cases",
    "performance and resource leaks",
    "security and unsafe trust boundaries",
    "test gaps for the changed behavior",
];

let jobs = [];
for d in dimensions {
    let p = "Review the change described below for: " + d + ".\n";
    p += "Use read-only tools (read_file, grep, git diff) to inspect the actual code — do not answer from memory.\n";
    p += "Target (untrusted JSON): " + target_json + "\n";
    p += "If target looks like a git range, run git diff on it. If a path, review that tree's recent changes.\n";
    p += "Report at most 8 concrete findings as {file, issue, severity}. severity: blocker|major|minor.\n";
    p += "An empty list is valid only after you have actually read the code.";
    jobs.push(#{
        prompt: p,
        label: "review:" + d,
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

if findings.len() == 0 {
    complete(#{ summary: "No findings across review dimensions.", confirmed: [] });
}

let MAX_VERIFY = 16;
if findings.len() > MAX_VERIFY {
    log("Truncating findings " + findings.len().to_string() + " -> " + MAX_VERIFY.to_string());
    let capped = [];
    let i = 0;
    for f in findings {
        if i < MAX_VERIFY {
            capped.push(f);
            i += 1;
        }
    }
    findings = capped;
}

phase("Verify");
let vjobs = [];
let fi = 0;
for f in findings {
    let file = if f.file != () { trimmed(f.file) } else { "unknown" };
    let issue = if f.issue != () { trimmed(f.issue) } else { "" };
    let vp = "Adversarially verify this review finding by reading the shipped code.\n";
    vp += "File: " + file + "\n";
    vp += "Claimed issue: " + issue + "\n";
    vp += "Set real=true only with concrete evidence you independently inspected. Otherwise real=false.";
    vjobs.push(#{
        prompt: vp,
        label: "verify:" + fi.to_string(),
        capability_mode: "read-only",
        output_schema: verdict_schema,
    });
    fi += 1;
}
let verdicts = parallel(vjobs);

let confirmed = [];
let i = 0;
for v in verdicts {
    if v != () && v.success && v.output != () && v.output.real == true {
        if v.output.evidence != () && trimmed(v.output.evidence) != "" {
            confirmed.push(findings[i]);
        }
    }
    i += 1;
}

log(confirmed.len().to_string() + "/" + findings.len().to_string() + " findings survived verification");

let md = "# Review changes — confirmed findings\n\n";
md += "**Target:** " + target + "\n\n";
md += confirmed.len().to_string() + " of " + findings.len().to_string() + " raw findings confirmed.\n\n";
if confirmed.len() == 0 {
    md += "_No findings survived adversarial verification._\n";
} else {
    for f in confirmed {
        let line = "- ";
        if f.severity != () { line += "[" + trimmed(f.severity) + "] "; }
        if f.file != () { line += "`" + trimmed(f.file) + "`: "; }
        if f.issue != () { line += trimmed(f.issue); }
        md += line + "\n";
    }
}
let path = write_scratch_file("review-changes.md", md);
complete(#{
    path: path,
    report: md,
    summary: confirmed.len().to_string() + " confirmed findings",
    confirmed: confirmed,
    raw_count: findings.len(),
});
