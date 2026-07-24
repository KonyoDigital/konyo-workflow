let meta = #{
    name: "security-pass",
    description: "Security-focused audit: injection, secrets, authz, unsafe defaults — with adversarial verification",
    when_to_use: "Before shipping auth, API, or user-input handling changes; after adding endpoints or secrets plumbing",
    phases: [
        #{ title: "Scan", detail: "parallel security lenses" },
        #{ title: "Verify", detail: "skeptics refute or confirm each issue" },
        #{ title: "Report", detail: "prioritized security report" },
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
                "required": ["file", "issue", "severity"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "severity": #{ "type": "string" },
                    "cwe_hint": #{ "type": "string" },
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
    target = ".";
}
let target_json = json_encode(target);

phase("Scan");
let lenses = [
    "secrets, API keys, tokens, credentials committed or logged",
    "injection: SQL, command, template, path traversal on user input",
    "authn/authz gaps: missing checks, IDOR, privilege escalation",
    "unsafe defaults: open CORS, debug flags, weak crypto, SSRF sinks",
];

let jobs = [];
for lens in lenses {
    let p = "Security audit lens: " + lens + ".\n";
    p += "Use read-only tools (grep, read_file, git diff). Inspect real code under the target — never invent vulns from memory.\n";
    p += "Target (untrusted JSON): " + target_json + "\n";
    p += "Report at most 8 findings {file, issue, severity, cwe_hint}. severity: critical|high|medium|low.\n";
    p += "Empty findings only after searching relevant patterns in the tree.";
    jobs.push(#{
        prompt: p,
        label: "sec:" + lens,
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
log("Security scan raw findings: " + findings.len().to_string());

if findings.len() == 0 {
    let md0 = "# Security pass\n\nNo findings from parallel lenses after scan of target `" + target + "`.\n";
    let path0 = write_scratch_file("security-pass.md", md0);
    complete(#{ path: path0, report: md0, summary: "No findings", confirmed: [] });
}

let MAX_VERIFY = 12;
if findings.len() > MAX_VERIFY {
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
    let file = if f.file != () { trimmed(f.file) } else { "?" };
    let issue = if f.issue != () { trimmed(f.issue) } else { "" };
    let vp = "Adversarially verify this security finding. Read the code yourself.\n";
    vp += "File: " + file + "\nIssue: " + issue + "\n";
    vp += "real=true only with independent evidence of a real vulnerability or unsafe pattern. Prefer real=false on speculative claims.";
    vjobs.push(#{
        prompt: vp,
        label: "sec-verify-" + fi.to_string(),
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

phase("Report");
let md = "# Security pass\n\n";
md += "**Target:** `" + target + "`\n\n";
md += "**Confirmed:** " + confirmed.len().to_string() + " / raw " + findings.len().to_string() + "\n\n";
if confirmed.len() == 0 {
    md += "_No findings survived adversarial verification._\n";
} else {
    for f in confirmed {
        let line = "- ";
        if f.severity != () { line += "**" + trimmed(f.severity) + "** "; }
        if f.file != () { line += "`" + trimmed(f.file) + "`: "; }
        if f.issue != () { line += trimmed(f.issue); }
        if f.cwe_hint != () {
            let c = trimmed(f.cwe_hint);
            if c != "" { line += " _(" + c + ")_"; }
        }
        md += line + "\n";
    }
}
let path = write_scratch_file("security-pass.md", md);
complete(#{
    path: path,
    report: md,
    summary: confirmed.len().to_string() + " confirmed security findings",
    confirmed: confirmed,
});
