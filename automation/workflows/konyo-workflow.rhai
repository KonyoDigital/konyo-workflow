let meta = #{
    name: "konyo-workflow",
    description: "Konyo Workflow — ultimate shipper: universal gates + indestructible ceremony (TDD, review, security, UX, 7-round session-LLM pingpong, fail-closed ship/draft/blocked)",
    when_to_use: "Any serious ship: idea, PR, version arc. Default strict Konyo law; works on any stack via PASS/FAIL/N-A gates",
    phases: [
        #{ title: "Intake", detail: "objective, success criteria, scope" },
        #{ title: "Inventory", detail: "stack, changes, tests, deploy surface" },
        #{ title: "Plan", detail: "checklist + one owner per file" },
        #{ title: "Gate-Audit", detail: "parallel ceremony + general quality laws" },
        #{ title: "Third-Eye", detail: "adversarial third-eye verification" },
        #{ title: "Verdict", detail: "ship / draft / blocked fail-closed" },
        #{ title: "Approve", detail: "optional human go-live gate" },
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
                "required": ["gate", "severity", "issue"],
                "properties": #{
                    "gate": #{ "type": "string" },
                    "severity": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                    "fix": #{ "type": "string" },
                    "status": #{ "type": "string" },
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

let intake_schema = #{
    "type": "object",
    "required": ["success_criteria", "out_of_scope", "risk_notes"],
    "properties": #{
        "success_criteria": #{
            "type": "array",
            "maxItems": 10,
            "items": #{ "type": "string" },
        },
        "out_of_scope": #{
            "type": "array",
            "maxItems": 8,
            "items": #{ "type": "string" },
        },
        "risk_notes": #{ "type": "string" },
        "has_ui": #{ "type": "boolean" },
        "has_deploy": #{ "type": "boolean" },
    },
};

let inv_schema = #{
    "type": "object",
    "required": ["summary", "stack", "changed_areas", "test_commands"],
    "properties": #{
        "summary": #{ "type": "string" },
        "stack": #{ "type": "string" },
        "changed_areas": #{
            "type": "array",
            "maxItems": 12,
            "items": #{ "type": "string" },
        },
        "test_commands": #{
            "type": "array",
            "maxItems": 10,
            "items": #{ "type": "string" },
        },
        "deploy_surface": #{ "type": "string" },
        "ledger_paths": #{
            "type": "array",
            "maxItems": 8,
            "items": #{ "type": "string" },
        },
    },
};

let plan_schema = #{
    "type": "object",
    "required": ["checklist", "file_owners"],
    "properties": #{
        "checklist": #{
            "type": "array",
            "maxItems": 18,
            "items": #{ "type": "string" },
        },
        "file_owners": #{
            "type": "array",
            "maxItems": 14,
            "items": #{
                "type": "object",
                "required": ["owner", "paths"],
                "properties": #{
                    "owner": #{ "type": "string" },
                    "paths": #{ "type": "string" },
                },
            },
        },
        "on_air_risk": #{ "type": "string" },
        "version_label": #{ "type": "string" },
        "overlap_ok": #{ "type": "boolean" },
    },
};

let report_schema = #{
    "type": "object",
    "required": ["verdict", "summary", "blockers", "next_actions", "pingpong_rounds_claimed", "ship_allowed"],
    "properties": #{
        "verdict": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "blockers": #{
            "type": "array",
            "maxItems": 16,
            "items": #{ "type": "string" },
        },
        "next_actions": #{
            "type": "array",
            "maxItems": 14,
            "items": #{ "type": "string" },
        },
        "pingpong_rounds_claimed": #{ "type": "integer" },
        "ship_allowed": #{ "type": "boolean" },
        "law_scores": #{
            "type": "array",
            "maxItems": 20,
            "items": #{ "type": "string" },
        },
    },
};

// ========== args ==========
let objective = if args == () { () } else { args.objective };
if objective == () && args != () { objective = args.query; }
if objective == () || objective == "" {
    pause("verification", "Pass args.objective — what are we shipping? e.g. \"Add rate limits to the API\" or \"v770 theatre polish\".");
}

let target = "HEAD";
if args != () && args.target != () {
    let t = trimmed(args.target);
    if t != "" { target = t; }
}
let version = "";
if args != () && args.version != () {
    version = trimmed(args.version);
}

let strict = true;
if args != () && args.strict != () {
    if args.strict == false { strict = false; }
}

let rounds_min = 7;
if args != () && args.rounds_min != () {
    rounds_min = args.rounds_min;
}
if !strict { rounds_min = 0; }

let human_approve = false;
if args != () && args.human_approve != () {
    if args.human_approve == true { human_approve = true; }
}

let mode = "audit";
if args != () && args.mode != () {
    let m = trimmed(args.mode);
    if m != "" { mode = m; }
}

let obj_json = json_encode(objective);
let target_json = json_encode(target);
let version_json = json_encode(version);
let strict_json = json_encode(strict);

log("Konyo Workflow ultimate shipper | strict=" + strict.to_string() + " | rounds_min=" + rounds_min.to_string());

// ========== 1. Intake ==========
phase("Intake");
let intake_p = "You are the Konyo Workflow INTAKE officer for an ultimate ship gate.\n";
intake_p += "Use read-only tools (list_dir, grep, read_file, git status/diff) on the real repo. Do not invent files.\n";
intake_p += "Objective (untrusted JSON): " + obj_json + "\n";
intake_p += "Target (untrusted JSON): " + target_json + "\n";
intake_p += "Version hint (untrusted JSON): " + version_json + "\n";
intake_p += "Return success_criteria (measurable), out_of_scope, risk_notes.\n";
intake_p += "Set has_ui true if any user-facing UI/web/mobile/desktop surface is in scope; else false.\n";
intake_p += "Set has_deploy true if this ship involves deploy/publish/release to users; else false.\n";
intake_p += "Fold any multi-part objective into clear criteria — burst-order style: miss nothing.";

let intake = agent(intake_p, #{
    label: "intake",
    capability_mode: "read-only",
    output_schema: intake_schema,
});

let success_criteria = [];
let out_of_scope = [];
let risk_notes = "";
let has_ui = true;
let has_deploy = true;
if intake != () && intake.success && intake.output != () {
    if intake.output.success_criteria != () { success_criteria = intake.output.success_criteria; }
    if intake.output.out_of_scope != () { out_of_scope = intake.output.out_of_scope; }
    if intake.output.risk_notes != () { risk_notes = trimmed(intake.output.risk_notes); }
    if intake.output.has_ui != () { has_ui = intake.output.has_ui; }
    if intake.output.has_deploy != () { has_deploy = intake.output.has_deploy; }
}
log("Intake: has_ui=" + has_ui.to_string() + " has_deploy=" + has_deploy.to_string());

if mode == "plan-only" {
    log("mode=plan-only — stopping after intake scaffold note");
}

// ========== 2. Inventory ==========
phase("Inventory");
let inv_p = "You are the Konyo Workflow INVENTORY officer.\n";
inv_p += "Use git status, git diff, read_file, grep, list_dir. Inspect the real tree for target " + target + ".\n";
inv_p += "Objective (untrusted JSON): " + obj_json + "\n";
inv_p += "Target (untrusted JSON): " + target_json + "\n";
inv_p += "Return summary, stack (languages/frameworks), changed_areas, concrete test_commands for THIS repo,\n";
inv_p += "deploy_surface (or 'none'), ledger_paths (CHANGELOG, SHIP_LOG, PINGPONG_LOG, BUGS.md, etc. if they exist).\n";
inv_p += "Do not invent test commands that are not present in package files or CI.";

let inv = agent(inv_p, #{
    label: "inventory",
    capability_mode: "read-only",
    output_schema: inv_schema,
});

let inv_summary = "";
let stack = "";
let changed_areas = [];
let test_commands = [];
let deploy_surface = "unknown";
let ledger_paths = [];
if inv != () && inv.success && inv.output != () {
    if inv.output.summary != () { inv_summary = trimmed(inv.output.summary); }
    if inv.output.stack != () { stack = trimmed(inv.output.stack); }
    if inv.output.changed_areas != () { changed_areas = inv.output.changed_areas; }
    if inv.output.test_commands != () { test_commands = inv.output.test_commands; }
    if inv.output.deploy_surface != () { deploy_surface = trimmed(inv.output.deploy_surface); }
    if inv.output.ledger_paths != () { ledger_paths = inv.output.ledger_paths; }
}

let inv_json = json_encode(#{
    summary: inv_summary,
    stack: stack,
    changed_areas: changed_areas,
    test_commands: test_commands,
    deploy_surface: deploy_surface,
    ledger_paths: ledger_paths,
    has_ui: has_ui,
    has_deploy: has_deploy,
});

// ========== 3. Plan ==========
phase("Plan");
let plan_p = "You are the Konyo Workflow PLANNER (army discipline).\n";
plan_p += "Use read-only tools. Build a ship plan for the objective.\n";
plan_p += "HARD RULE: file_owners must have ZERO path overlap — one owner per file/path.\n";
plan_p += "Include burst-order folding: every part of the objective appears in checklist.\n";
plan_p += "Flag on_air_risk if restarting services or deploying could harm a live user session.\n";
plan_p += "Objective (untrusted JSON): " + obj_json + "\n";
plan_p += "Inventory (untrusted JSON): " + inv_json + "\n";
plan_p += "Version (untrusted JSON): " + version_json + "\n";
plan_p += "Return checklist, file_owners, on_air_risk, version_label, overlap_ok (true only if no path overlap).";

let plan = agent(plan_p, #{
    label: "planner",
    capability_mode: "read-only",
    output_schema: plan_schema,
});

let checklist = [];
let file_owners = [];
let on_air_risk = "unknown";
let version_label = version;
let overlap_ok = false;
if plan != () && plan.success && plan.output != () {
    if plan.output.checklist != () { checklist = plan.output.checklist; }
    if plan.output.file_owners != () { file_owners = plan.output.file_owners; }
    if plan.output.on_air_risk != () { on_air_risk = trimmed(plan.output.on_air_risk); }
    if plan.output.version_label != () {
        let vl = trimmed(plan.output.version_label);
        if vl != "" { version_label = vl; }
    }
    if plan.output.overlap_ok != () { overlap_ok = plan.output.overlap_ok; }
}
log("Plan: checklist=" + checklist.len().to_string() + " owners=" + file_owners.len().to_string() + " overlap_ok=" + overlap_ok.to_string());

if mode == "plan-only" {
    let md_po = "# Konyo Workflow — plan only\n\n**Objective:** " + objective + "\n\n";
    md_po += "## Checklist\n";
    for c in checklist { md_po += "- " + c + "\n"; }
    md_po += "\n## File owners\n";
    for o in file_owners {
        let line = "- ";
        if o.owner != () { line += trimmed(o.owner) + ": "; }
        if o.paths != () { line += trimmed(o.paths); }
        md_po += line + "\n";
    }
    let ppath = write_scratch_file("konyo-plan-only.md", md_po);
    complete(#{ path: ppath, report: md_po, mode: "plan-only", objective: objective });
}

// ========== 4. Gate-Audit (ceremony + general) ==========
phase("Gate-Audit");

// Law list: general + Konyo. Each auditor may return status pass|fail|na via findings.
let gates = [
    "LAW01 TDD/Tests: locks or tests exist for THIS change; suites/commands from inventory are green or clearly runnable — FAIL if missing coverage for changed behavior",
    "LAW02 Review: correctness bugs, error handling, edge cases in the real diff/target — general multi-lens code review",
    "LAW03 Security: secrets/keys logged or committed, injection, authz gaps, unsafe defaults — FAIL with evidence or empty only after real search",
    "LAW04 Docs/Ops: README/changelog/operator notes needed for this ship; ledger paths if project uses them",
    "LAW05 Rollback/blast-radius: how to reverse; migrations; feature flags; worst-case impact",
    "LAW06 Patch discipline: re-grep live anchors, no partial-apply smell, single coherent write pattern on substantive edits",
    "LAW07 Syntax/static gates: parse/lint strategy for touched languages (py/js/ts/sh/etc.) present or run-able",
    "LAW08 UX polish: every touched user-facing surface polished — if no UI in scope set finding status na with evidence (no UI paths)",
    "LAW09 Interaction/RINSE-class: buttons/flows both directions, keyboard, latency budgets OR status na with evidence if no interactive UI",
    "LAW10 Visual verification: screenshots or visual check of changed surfaces LOOKED AT — or na with evidence if non-visual project",
    "LAW11 Version stamps: consistent version identity across artifacts (semver/VERSION/tag/changelog/build id) — na only if project has zero versioning",
    "LAW12 Ledger: ship log entry path exists or planned (CHANGELOG/SHIP_LOG/PINGPONG_LOG/BUGS REG style)",
    "LAW13 Deploy/live safety: preflight before deploy/restart; do not cycle live systems while ON AIR; mode/status checks if applicable — na if no deploy",
    "LAW14 Self-enforcing layer: CI/hooks/required checks that make critical gates hard to skip — note gaps as major/blocker when strict",
    "LAW15 Army/overlap: plan file_owners have zero path overlap; burst objective fully covered by checklist",
    "LAW16 Seven-round session-LLM pingpong: find evidence of >= rounds of design/implement/back-pass/fix/re-verify/polish/seal (or prior rounds logged). Fewer than required => draft not ship. Count what exists in ledger/commits/PRs.",
];

let jobs = [];
let gi = 0;
for g in gates {
    let p = "You are a Konyo Workflow GATE AUDITOR for an ultimate shipper (works on ANY stack).\n";
    p += "Fail closed. Use read-only tools only. Never invent files or test results.\n";
    p += "Each finding needs severity: blocker|major|minor|info and optional status: pass|fail|na.\n";
    p += "If a law does not apply to this project, return ONE finding with status na, severity info, and evidence why — not an empty silent skip.\n";
    p += "If the law applies and is broken, severity blocker or major with evidence + fix.\n";
    p += "If fully satisfied after inspection, findings may be empty ONLY if you cite what you checked in a single info finding with status pass OR return findings: [] after real tool use.\n";
    p += "Prefer at least one status-bearing finding per law.\n";
    p += "LAW: " + g + "\n";
    p += "strict_mode (untrusted JSON): " + strict_json + "\n";
    p += "rounds_min required for full ship: " + rounds_min.to_string() + "\n";
    p += "Objective (untrusted JSON): " + obj_json + "\n";
    p += "Target (untrusted JSON): " + target_json + "\n";
    p += "Version (untrusted JSON): " + version_json + "\n";
    p += "Inventory (untrusted JSON): " + inv_json + "\n";
    p += "On-air risk (untrusted JSON): " + json_encode(on_air_risk) + "\n";
    p += "has_ui=" + has_ui.to_string() + " has_deploy=" + has_deploy.to_string() + "\n";
    jobs.push(#{
        prompt: p,
        label: "law-" + gi.to_string(),
        capability_mode: "read-only",
        output_schema: findings_schema,
    });
    gi += 1;
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
log("Gate-Audit raw findings: " + findings.len().to_string());

// If plan said overlap not ok, inject a synthetic finding for third-eye
if overlap_ok == false && file_owners.len() > 0 {
    findings.push(#{
        gate: "LAW15 Army/overlap",
        severity: "blocker",
        issue: "Planner did not confirm zero path overlap (overlap_ok=false) — army discipline broken",
        evidence: "plan.overlap_ok=false",
        fix: "Reassign file_owners so each path has exactly one owner",
        status: "fail",
    });
}

let MAX_VERIFY = 16;
if findings.len() > MAX_VERIFY {
    log("Truncating findings for third-eye: " + findings.len().to_string() + " -> " + MAX_VERIFY.to_string());
    let capped = [];
    let ci = 0;
    for f in findings {
        if ci < MAX_VERIFY {
            capped.push(f);
            ci += 1;
        }
    }
    findings = capped;
}

// ========== 5. Third-Eye ==========
phase("Third-Eye");
let confirmed = [];

// Always run at least one third-eye skeptic when few findings
if findings.len() == 0 {
    let sk_p = "You are THIRD-EYE (session LLM) for Konyo Workflow. Hunt real ship blockers.\n";
    sk_p += "Use read-only tools. Bias to refute 'ready to ship'.\n";
    sk_p += "Objective (untrusted JSON): " + obj_json + "\n";
    sk_p += "Inventory (untrusted JSON): " + inv_json + "\n";
    sk_p += "Return findings for TDD, security, UX, deploy, version, ledger, or 7-round gaps.\n";
    let sk = agent(sk_p, #{
        label: "third-eye-skeptic",
        capability_mode: "read-only",
        output_schema: findings_schema,
    });
    if sk != () && sk.success && sk.output != () && sk.output.findings != () {
        for f in sk.output.findings {
            findings.push(f);
        }
    }
}

if findings.len() > 0 {
    let vjobs = [];
    let fi = 0;
    for f in findings {
        // Skip pure na from verification load? Still verify fail claims.
        let st = "";
        if f.status != () { st = trimmed(f.status); }
        let issue = "";
        let gate = "";
        if f.issue != () { issue = trimmed(f.issue); }
        if f.gate != () { gate = trimmed(f.gate); }
        if f.evidence != () {
            let ev = trimmed(f.evidence);
            if ev != "" { issue += " | evidence: " + ev; }
        }
        let vp = "Adversarially verify this ship-gate finding by reading the real repo.\n";
        vp += "Gate: " + gate + "\n";
        vp += "Claimed status: " + st + "\n";
        vp += "Claimed issue: " + issue + "\n";
        vp += "Set real=true ONLY if this is a genuine problem or a false na that should be a fail — with concrete evidence.\n";
        vp += "If the finding is a valid na or already fixed / not real, set real=false.\n";
        vp += "Fail closed on weak claims that would block ship without proof.";
        vjobs.push(#{
            prompt: vp,
            label: "eye-" + fi.to_string(),
            capability_mode: "read-only",
            output_schema: verdict_schema,
        });
        fi += 1;
    }
    let verdicts = parallel(vjobs);
    let vi = 0;
    for v in verdicts {
        if v != () && v.success && v.output != () && v.output.real == true {
            if v.output.evidence != () && trimmed(v.output.evidence) != "" {
                confirmed.push(findings[vi]);
            }
        }
        vi += 1;
    }
}
log("Third-eye confirmed: " + confirmed.len().to_string());

// ========== 6. Verdict ==========
phase("Verdict");
let conf_json = json_encode(confirmed);
let check_json = json_encode(checklist);
let owners_json = json_encode(file_owners);

let rep_p = "You are the Konyo Workflow SHIP VERDICT synthesizer (ultimate shipper).\n";
rep_p += "Doctrine: fail closed. Confirmed blockers => not ship_allowed.\n";
rep_p += "If strict and pingpong_rounds_claimed < " + rounds_min.to_string() + " => verdict must be draft (not ship), ship_allowed false.\n";
rep_p += "verdict one of: ship | draft | blocked.\n";
rep_p += "Live-session sanctity: never recommend restart while ON AIR / high on_air_risk.\n";
rep_p += "Generalize laws for any stack; respect na when evidenced.\n";
rep_p += "Objective (untrusted JSON): " + obj_json + "\n";
rep_p += "Version (untrusted JSON): " + json_encode(version_label) + "\n";
rep_p += "strict=" + strict.to_string() + " rounds_min=" + rounds_min.to_string() + "\n";
rep_p += "On-air risk (untrusted JSON): " + json_encode(on_air_risk) + "\n";
rep_p += "Inventory (untrusted JSON): " + inv_json + "\n";
rep_p += "Checklist (untrusted JSON): " + check_json + "\n";
rep_p += "File owners (untrusted JSON): " + owners_json + "\n";
rep_p += "Confirmed third-eye findings (untrusted JSON): " + conf_json + "\n";
rep_p += "Return verdict, summary, blockers, next_actions, pingpong_rounds_claimed (int from evidence, 0 if unknown),\n";
rep_p += "ship_allowed, law_scores as short strings like 'LAW01:pass' for the 16 laws when possible.";

let report = agent(rep_p, #{
    label: "ship-verdict",
    capability_mode: "read-only",
    output_schema: report_schema,
});

let verdict = "blocked";
let summary = "Verdict agent failed; treat as blocked.";
let blockers = [];
let next_actions = [];
let rounds = 0;
let ship_allowed = false;
let law_scores = [];

if report != () && report.success && report.output != () {
    if report.output.verdict != () { verdict = trimmed(report.output.verdict); }
    if report.output.summary != () { summary = trimmed(report.output.summary); }
    if report.output.blockers != () { blockers = report.output.blockers; }
    if report.output.next_actions != () { next_actions = report.output.next_actions; }
    if report.output.pingpong_rounds_claimed != () { rounds = report.output.pingpong_rounds_claimed; }
    if report.output.ship_allowed != () { ship_allowed = report.output.ship_allowed; }
    if report.output.law_scores != () { law_scores = report.output.law_scores; }
}

// Script-enforced fail closed
if confirmed.len() > 0 {
    ship_allowed = false;
    if verdict == "ship" { verdict = "blocked"; }
}
if strict && rounds_min > 0 && rounds < rounds_min {
    ship_allowed = false;
    if verdict == "ship" { verdict = "draft"; }
}
// severity blockers in confirmed
for f in confirmed {
    if f.severity != () {
        let sev = trimmed(f.severity);
        if sev == "blocker" || sev == "critical" {
            ship_allowed = false;
            if verdict == "ship" || verdict == "draft" {
                if sev == "blocker" || sev == "critical" { verdict = "blocked"; }
            }
        }
    }
}

// ========== 7. Optional human approve ==========
phase("Approve");
let human_approved = false;
if human_approve && ship_allowed && verdict == "ship" {
    await_user("user", "Konyo Workflow verdict is SHIP. Resume this workflow to mark human-approved for deploy/merge. (Does not deploy by itself.)");
    human_approved = true;
} else if human_approve && !ship_allowed {
    log("human_approve requested but ship not allowed — skipping approve pause");
} else {
    log("human_approve=false — no deploy pause");
}

// ========== Report markdown ==========
let md = "# Konyo Workflow — Ultimate Ship Verdict\n\n";
md += "**Objective:** " + objective + "\n\n";
md += "**Version:** " + version_label + "\n\n";
md += "**Target:** `" + target + "`\n\n";
md += "**Strict:** " + strict.to_string() + " | **Rounds min:** " + rounds_min.to_string() + " | **Claimed rounds:** " + rounds.to_string() + "\n\n";
md += "**Verdict:** `" + verdict + "`\n\n";
md += "**Ship allowed:** `" + ship_allowed.to_string() + "`\n\n";
md += "**Human approved:** `" + human_approved.to_string() + "`\n\n";
md += "**Stack:** " + stack + "\n\n";
md += "**On-air risk:** " + on_air_risk + "\n\n";
md += "## Summary\n" + summary + "\n\n";
md += "## Inventory\n" + inv_summary + "\n\n";
md += "### Test commands\n";
if test_commands.len() == 0 {
    md += "- _(none discovered)_\n";
} else {
    for t in test_commands { md += "- `" + t + "`\n"; }
}
md += "\n## Confirmed blockers (" + confirmed.len().to_string() + ")\n";
if confirmed.len() == 0 {
    md += "_None confirmed after third-eye._\n";
} else {
    for f in confirmed {
        let line = "- ";
        if f.severity != () { line += "**" + trimmed(f.severity) + "** "; }
        if f.gate != () { line += trimmed(f.gate) + ": "; }
        if f.issue != () { line += trimmed(f.issue); }
        md += line + "\n";
    }
}
md += "\n## Next actions\n";
if next_actions.len() == 0 {
    md += "- Re-run after fixing blockers\n";
} else {
    for a in next_actions { md += "- " + a + "\n"; }
}
md += "\n## Law scores\n";
if law_scores.len() == 0 {
    md += "- _(see gate findings)_\n";
} else {
    for s in law_scores { md += "- " + s + "\n"; }
}
md += "\n## Planner checklist\n";
for c in checklist { md += "- " + c + "\n"; }
md += "\n## File owners (army)\n";
for o in file_owners {
    let line = "- ";
    if o.owner != () { line += "**" + trimmed(o.owner) + "**: "; }
    if o.paths != () { line += trimmed(o.paths); }
    md += line + "\n";
}
md += "\n## Konyo Ship Laws (reference)\n";
md += "1. TDD/Tests for this change\n";
md += "2. Multi-lens review\n";
md += "3. Security\n";
md += "4. Docs/ops\n";
md += "5. Rollback/blast radius\n";
md += "6. Patch discipline\n";
md += "7. Syntax/static gates\n";
md += "8. UX polish (or N/A+evidence)\n";
md += "9. Interaction/RINSE-class (or N/A+evidence)\n";
md += "10. Visual verification (or N/A+evidence)\n";
md += "11. Version stamps\n";
md += "12. Ledger\n";
md += "13. Deploy/live safety\n";
md += "14. Self-enforcing CI/hooks\n";
md += "15. Army zero-overlap + burst coverage\n";
md += "16. Seven-round session-LLM pingpong (strict default)\n";
md += "\n---\n";
md += "_Konyo Workflow — ultimate shipper. General for any stack. Strict by default. Skipping laws is a doctrine break._\n";

let path = write_scratch_file("konyo-ship-verdict.md", md);
log("Wrote " + path + " verdict=" + verdict);
complete(#{
    path: path,
    report: md,
    verdict: verdict,
    ship_allowed: ship_allowed,
    human_approved: human_approved,
    confirmed_count: confirmed.len(),
    pingpong_rounds_claimed: rounds,
    rounds_min: rounds_min,
    strict: strict,
    objective: objective,
    version: version_label,
});
