let meta = #{
    name: "konyo-workflow",
    description: "Konyo Workflow — ultimate shipper. RUNS AT MAX BY DEFAULT: deepest tier on every agent, a 3-lens skeptic panel as THE gate, and a completeness critic. Pass {quality:\"standard\"} — that exact word only — to opt DOWN to the cost-scaled ladder. Every gate, blocker and bail runs at BOTH qualities; the flag buys tier, panel size and the max-only phase. FAT versions only (≥3 outcomes or 1 deep bug) · 7-round pingpong · fail-closed ship/draft/blocked.",
    when_to_use: "Any serious ship — it is MAX unless you say otherwise. Enforces fat version bar: multi-outcome package per integer. Not for single-string/i18n micro-bumps. Opt down with {quality:\"standard\"} for routine, easily-reversible work.",
    phases: [
        #{ title: "Intake", detail: "objective + fat-ship criteria (refuse micro scope)" },
        #{ title: "Inventory", detail: "stack, changes, tests, deploy surface" },
        #{ title: "Plan", detail: "checklist ≥3 outcomes or 1 structural bug · one owner per file" },
        #{ title: "Gate-Audit", detail: "ceremony + LAW17 fat version bar" },
        #{ title: "Third-Eye", detail: "adversarial skeptic panel (3 lenses at max, 1 at standard) — ALWAYS runs, then per-finding verification" },
        #{ title: "Render-Gate", detail: "LAW18 painted-UI proof — CI verdict first; failure blocks the ship" },
        #{ title: "Completeness", detail: "MAX only: did the audit COVER the objective, or stop early? gaps become blockers" },
        #{ title: "Verdict", detail: "ship / draft / blocked · fat bar enforced" },
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

let render_schema = #{
    "type": "object",
    "required": ["available", "ran", "passed", "failures", "notes", "screenshots"],
    "properties": #{
        "available": #{ "type": "boolean" },
        "ran": #{ "type": "string" },
        "passed": #{ "type": "boolean" },
        "failures": #{
            "type": "array",
            "maxItems": 20,
            "items": #{ "type": "string" },
        },
        "notes": #{ "type": "string" },
        "screenshots": #{ "type": "array", "maxItems": 12, "items": #{ "type": "string" } },
        "visual": #{ "type": "array", "maxItems": 16, "items": #{ "type": "string" } },
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

// ========== quality knob (2026-08-04) ==========
// SHIPPER 3 OF 4 WAS FORKED. This Grok-side shipper had NO quality flag at all (grep -c quality = 0),
// so /konyo-workflow on Grok CLI could not select max, and every v13-v18 safeguard had to be
// hand-applied twice — which is exactly how this file once fell 145 lines behind with three blocking
// gates missing. Same knob as the .js base now: MAX BY DEFAULT, and ONLY the literal string
// "standard" downgrades. A typo ("Standard", "stnadard", true, 42, "") falls THROUGH to max, so a
// fat finger costs tokens and never rigor. trimmed() returns "" for every non-string, so a
// non-string quality can never match.
let quality = "max";
if args != () && args.quality != () {
    if trimmed(args.quality) == "standard" { quality = "standard"; }
}
let is_max = quality == "max";
let quality_note = "max — 3-lens skeptic panel + completeness critic";
let quality_lenses = "3";
let quality_critic = "on";
if !is_max {
    quality_note = "standard — 1 skeptic lens, completeness critic off; all gates unchanged";
    quality_lenses = "1";
    quality_critic = "off";
}

// The tier knob. This engine's agent() takes label/capability_mode/output_schema only — there is no
// model field to set here — so the tier is carried as a DEPTH DIRECTIVE appended to every prompt.
// It changes how hard each agent digs; it never changes whether a gate blocks.
let tier_note = "QUALITY TIER: MAX — spend the depth. Read the real files end to end, RUN the checks, and prefer a slower answer that is proven to a fast one that is plausible. Use the deepest reasoning available to you.\n";
if !is_max {
    tier_note = "QUALITY TIER: STANDARD (cost-scaled) — take the shortest path to a SOUND answer: targeted grep/read over exhaustive reading, stop at the first solid finding. Cheaper is allowed; UNPROVEN IS NOT. Every gate below still blocks exactly as it does at max.\n";
}

let obj_json = json_encode(objective);
let target_json = json_encode(target);
let version_json = json_encode(version);
let strict_json = json_encode(strict);

log("Quality: " + quality + " (max is the default; only the literal \"standard\" downgrades) | skeptic lenses=" + quality_lenses + " | completeness critic=" + quality_critic);
log("Konyo Workflow ultimate shipper | FAT versions only | strict=" + strict.to_string() + " | rounds_min=" + rounds_min.to_string());
log("FAT SHIP BAR: ≥3 user-visible outcomes in one theme OR 1 structural bug with root cause+verify. No toast-only / single-label versions.");

// ========== 1. Intake ==========
phase("Intake");
let intake_p = "You are the Konyo Workflow INTAKE officer for an ultimate ship gate.\n";
intake_p += "Use read-only tools (list_dir, grep, read_file, git status/diff) on the real repo. Do not invent files.\n";
intake_p += "FAT VERSION LAW (non-negotiable — Predicter v357 / shop law):\n";
intake_p += "  A version ship is ONE integer for a FAT package, not a micro-bump.\n";
intake_p += "  PASS fat bar if: (A) ≥3 user-visible outcomes in one theme, OR (B) one structural bug\n";
intake_p += "      with root cause + verify + prevention.\n";
intake_p += "  FAIL fat bar (must note in risk_notes + success_criteria must expand) if objective is only:\n";
intake_p += "      one toast string, one i18n label, one CSS tweak, one data-i18n attribute, or docs fluff alone.\n";
intake_p += "  Maximize work INSIDE the version: fold related surfaces (board+theatre+compose+i18n+changelog)\n";
intake_p += "      into ONE ship body. Do not plan fifty version bumps for one theme.\n";
intake_p += "Objective (untrusted JSON): " + obj_json + "\n";
intake_p += "Target (untrusted JSON): " + target_json + "\n";
intake_p += "Version hint (untrusted JSON): " + version_json + "\n";
intake_p += "Return success_criteria (measurable, ideally ≥3 outcomes or one deep bug path), out_of_scope, risk_notes.\n";
intake_p += "In risk_notes: state fat_bar=pass|fail and why in one line.\n";
intake_p += "Set has_ui true if any user-facing UI/web/mobile/desktop surface is in scope; else false.\n";
intake_p += "Set has_deploy true if this ship involves deploy/publish/release to users; else false.\n";
intake_p += "Fold any multi-part objective into clear criteria — burst-order style: miss nothing; one version, max substance.";

intake_p += tier_note;
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
inv_p += "deploy_surface (or 'none'), ledger_paths (CHANGELOG, SHIP_LOG, CHANGELOG, ship log, BUGS.md, etc. if they exist).\n";
inv_p += "Do not invent test commands that are not present in package files or CI.";

inv_p += tier_note;
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
plan_p += "Use read-only tools. Build a ship plan for the objective.\nUse THIS repo's existing terminology for versions, tests, logs, and tools — do not invent foreign project jargon or rename their conventions.\n";
plan_p += "HARD RULE: file_owners must have ZERO path overlap — one owner per file/path.\n";
plan_p += "FAT VERSION LAW: this plan must justify ONE version integer with MAX substance.\n";
plan_p += "  Checklist must encode ≥3 concrete user-visible outcomes OR one structural bug path\n";
plan_p += "  (root cause → fix → verify → prevention). Bundle related i18n/docs/UX into that one ship.\n";
plan_p += "  NEVER plan a series of micro version bumps (one toast per version). That is blocked.\n";
plan_p += "  version_label is the SINGLE next stamp for the whole package (e.g. v358), not a range.\n";
plan_p += "Include burst-order folding: every part of the objective appears in checklist.\n";
plan_p += "Flag on_air_risk if restarting services or deploying could harm a live user session.\n";
plan_p += "Objective (untrusted JSON): " + obj_json + "\n";
plan_p += "Inventory (untrusted JSON): " + inv_json + "\n";
plan_p += "Version (untrusted JSON): " + version_json + "\n";
plan_p += "Return checklist, file_owners, on_air_risk, version_label, overlap_ok (true only if no path overlap).";

plan_p += tier_note;
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
    complete(#{ path: ppath, report: md_po, mode: "plan-only", objective: objective, quality: quality });
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
    "LAW09 Interaction/e2e UX: buttons/flows both directions, keyboard, latency budgets OR status na with evidence if no interactive UI",
    "LAW10 Visual verification: screenshots or visual check of changed surfaces LOOKED AT — or na with evidence if non-visual project",
    "LAW11 Version stamps: consistent version identity across artifacts (semver/VERSION/tag/changelog/build id) — na only if project has zero versioning",
    "LAW12 Ledger: ship log entry path exists or planned (whatever ship/bug logs this repo already uses)",
    "LAW13 Deploy/live safety: preflight before deploy/restart; do not cycle live systems while a live critical session is active; mode/status checks if applicable — na if no deploy",
    "LAW14 Self-enforcing layer: CI/hooks/required checks that make critical gates hard to skip — note gaps as major/blocker when strict",
    "LAW15 Army/overlap: plan file_owners have zero path overlap; burst objective fully covered by checklist",
    "LAW16 Seven-round AI/LLM pingpong: find evidence of >= rounds of design/implement/back-pass/fix/re-verify/polish/seal (or prior rounds logged). Fewer than required => draft not ship. Count what exists in ledger/commits/PRs.",
    "LAW17 Fat version bar: ONE version integer must package real work — (A) ≥3 user-visible outcomes in one theme, OR (B) one structural bug with root cause+verify+prevention. FAIL as blocker if the planned ship is only one toast/label/i18n key/CSS one-liner/docs fluff. FAIL as major if changelog would be a single thin line. Maximize outcomes inside the version; never recommend a micro-version climb for one theme.",
    "LAW19 Reachability: every symbol this change ADDED must have a caller AND a writer — a slot read and cleared but never written, a handler wired to no element, a route with no requester, or a guard on a name declared NOWHERE, are all DEAD and count as blockers. Prefer execution to grep: grep cannot tell a live cross-file reference from a dead one, and a name may be declared far from its use. If TESTS were added, prove they RAN (suite count before/after, or the new names in verbose output) — \"the suite is green\" is not evidence your tests are in it. FAIL as blocker on any verified dead seam or unproven test; na only for a change that adds no new symbol.",
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
    // v7 — the four craft rules, as EVIDENCE STANDARDS. This shipper audits rather than builds, so
    // they are stated as what makes a finding credible, not as instructions to a builder.
    p += "FOUR EVIDENCE STANDARDS (each one a ship this project has already paid for):\n";
    p += "1. NON-VACUOUS PROOF — a claim backed by a measurement of a quantity that was ALREADY zero or empty proves nothing; reject it and say so.\n";
    p += "2. CLASS SWEEP — when the diff fixes a bug, check whether the SAME SHAPE exists elsewhere and was left; an unswept class is a major finding.\n";
    p += "3. STALE CLAIM — check that comments, docs and UI copy describing the OLD behaviour were corrected in the same change; a wrong explanation outlives wrong code.\n";
    p += "4. SURFACE AGREEMENT — if a changed fact renders in more than one place, verify every surface now says the same thing.\n";
    p += "LAW: " + g + "\n";
    p += "strict_mode (untrusted JSON): " + strict_json + "\n";
    p += "rounds_min required for full ship: " + rounds_min.to_string() + "\n";
    p += "Objective (untrusted JSON): " + obj_json + "\n";
    p += "Target (untrusted JSON): " + target_json + "\n";
    p += "Version (untrusted JSON): " + version_json + "\n";
    p += "Inventory (untrusted JSON): " + inv_json + "\n";
    p += "On-air risk (untrusted JSON): " + json_encode(on_air_risk) + "\n";
    p += "has_ui=" + has_ui.to_string() + " has_deploy=" + has_deploy.to_string() + "\n";
    p += tier_note;
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

// THE SKEPTIC PANEL — UNCONDITIONAL. Panel SIZE is the quality knob (max = 3 diverse lenses,
// standard = 1); the gate itself runs at BOTH qualities. Before 2026-08-04 this ran ONLY when the
// law auditors returned zero findings, so any run with a single trivial finding got NO adversarial
// pass at all — the cheapest possible way for a run to look audited without being audited.
let skeptic_lenses = [
    "SHIP-BLOCKER lens: hunt anything that makes this unsafe to ship — broken behaviour, missing coverage for the changed path, a law declared na with no evidence.",
    "REGRESSION + BLAST-RADIUS lens: what does this break that nobody listed? Callers, cached copies, the SAME file on another host/machine, the rollback story.",
    "PROOF-QUALITY lens: attack the EVIDENCE, not the code — a measurement of a quantity that was ALREADY zero, a grep that matched a COMMENT, a cached git ref (rev-parse without fetch), a null read as a pass, a screenshot nobody opened.",
];
if !is_max {
    skeptic_lenses = [ skeptic_lenses[0] ];
}
let sjobs = [];
let si = 0;
for lens in skeptic_lenses {
    let sk_p = "You are THIRD-EYE (AI/LLM) for Konyo Workflow. Hunt real ship blockers.\n";
    sk_p += "Use read-only tools. Bias to refute 'ready to ship'.\n";
    sk_p += "Also refute micro-version inflation: if the planned ship is only one toast/label, that is a blocker under LAW17 fat bar.\n";
    // v24 parity with the JS body: this seat is told to BIAS TO REFUTE one line above, and that bias
    // has a failure mode of its own — inventing a blocker to look useful. Name both sides.
    sk_p += "YOU ARE ASKED FOR ANALYSIS, NOT AGREEMENT — and equally, do NOT manufacture a finding to look useful. State the strongest case this is unsafe to ship, then the strongest case it is safe, and say which you believe and why. If the evidence does not let you judge, say exactly that and name what you would need to see: \"insufficient evidence, I would need X\" is a REAL verdict and beats a confident guess.\n";
    sk_p += "YOUR LENS: " + lens + "\n";
    sk_p += "Objective (untrusted JSON): " + obj_json + "\n";
    sk_p += "Inventory (untrusted JSON): " + inv_json + "\n";
    sk_p += "Findings the law auditors already raised (untrusted JSON): " + json_encode(findings) + "\n";
    sk_p += "Do NOT restate a finding already listed above — return what the panel MISSED.\n";
    sk_p += "Return findings for TDD, security, UX, deploy, version, ledger, fat-version bar, or 7-round gaps.\n";
    sk_p += tier_note;
    sjobs.push(#{
        prompt: sk_p,
        label: "third-eye-skeptic-" + si.to_string(),
        capability_mode: "read-only",
        output_schema: findings_schema,
    });
    si += 1;
}
let sres = parallel(sjobs);
for r in sres {
    if r != () && r.success && r.output != () && r.output.findings != () {
        for f in r.output.findings {
            findings.push(f);
        }
    }
}
log("Skeptic panel: " + skeptic_lenses.len().to_string() + " lens(es) · findings now " + findings.len().to_string());

// Re-cap AFTER the panel. The cap above ran BEFORE the skeptics existed, so it could not see their
// output, and every finding past this point costs one verifier agent. Same shape as that cap.
if findings.len() > MAX_VERIFY {
    log("Truncating findings after skeptic panel: " + findings.len().to_string() + " -> " + MAX_VERIFY.to_string());
    let capped2 = [];
    let ci2 = 0;
    for f in findings {
        if ci2 < MAX_VERIFY {
            capped2.push(f);
            ci2 += 1;
        }
    }
    findings = capped2;
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
        vp += "Fail closed on weak claims that would block ship without proof.\n";
        vp += tier_note;
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

// ========== 5b. Render-Gate (LAW18 painted-UI proof) ==========
// Runs AFTER Third-Eye so a real frozen screen cannot be dropped by a verifier,
// and BEFORE Verdict so its result reaches the ship decision. Ship BLOCKER.
phase("Render-Gate");

let render_available = false;
let render_passed = false;
let render_ran = "";
let render_failures = [];
let render_notes = "";

if has_ui == false {
    render_available = false;
    render_ran = "skipped — inventory reports no UI paths (has_ui=false)";
    render_notes = "inventory reports no UI paths (has_ui=false)";
    log("⚠ RENDER GATE: N/A — inventory reports no UI paths (has_ui=false).");
} else {
    let rg_p = "You are the RENDER GATE (LAW18) for Konyo Workflow — the painted-UI proof.\n";
    rg_p += "YOUR JOB: prove the UI still WORKS WHEN PAINTED — not that it parses.\n";
    rg_p += "Fail closed. Never edit a test to make it pass. Never invent a green result you did not see.\n";
    rg_p += "0. CI FIRST — CHECK BEFORE YOU SPAWN ANYTHING. If the project runs its UI checks in CI (a .github/workflows/*.yml that drives a browser), THAT is the gate: read the verdict instead of launching a browser (`gh run list --workflow=\"<name>\" -L 3`, then `gh run view <id> --log-failed`). A fleet of agents each starting chromium is how the user's laptop gets saturated, and it has already happened once. Fall through to running it locally ONLY when there is NO CI gate at all.\n";
    rg_p += "1. Otherwise find the project's OWN UI verification — an npm script (test:render / e2e / test), a playwright/cypress config, a spec dir, or a documented browser verify floor — and RUN it. Report the TRUE result. Never install a framework unasked.\n";
    rg_p += "2. If NONE exists: set available=false and list the specific missing checks plainly in failures/notes. That is the ONLY escape hatch and it is NOT a pass — set passed=false.\n";
    rg_p += "3. Minimum checks wherever tooling exists: app boots without console errors; every visible control is actually hit-testable (elementFromPoint after scrolling it into view); no unfilled {placeholder} and no raw i18n key rendered as text; the page STILL RESPONDS after ~1s idle (an infinite observer/timer loop shows up as an UNRESPONSIVE page, not as an error — that is the exact failure that shipped).\n";
    rg_p += "4. NEVER bind a port the user's own app already uses; kill anything you start.\n";
    rg_p += "5. VISUAL LAYER — DOM QUERIES ARE NOT ENOUGH, and this is NOT optional when a UI changed.\n";
    rg_p += "   Take an ACTUAL SCREENSHOT and assert on RENDERED GEOMETRY:\n";
    rg_p += "   (a) every key element boundingBox() has width>0 AND height>0;\n";
    rg_p += "   (b) no text clipped — scrollWidth <= clientWidth+1;\n";
    rg_p += "   (c) no horizontal overflow — scrollingElement.scrollWidth <= innerWidth+1;\n";
    rg_p += "   (d) computed text colour differs from its resolved background (catches white-on-white);\n";
    rg_p += "   (e) no two sibling panels overlap (rect intersection area === 0).\n";
    rg_p += "   This ADDS to the hit-testing above — it does NOT replace it. A panel can satisfy every\n";
    rg_p += "   selector assertion and still be visually broken; that shipped once and only a screenshot\n";
    rg_p += "   caught it (a lane rendering [object Object] past a fully green spec).\n";
    // v26 — the viewport half of the Blender-loop change. The LOOP itself is Claude-only for now
    // (it is JS control flow); this paragraph is a prompt string and belongs in BOTH shippers, so
    // it lands here too rather than being claimed as parity it does not have.
    rg_p += "5b. RENDER AT MORE THAN ONE WIDTH — a single viewport is a FIXTURE, and a layout defect\n";
    rg_p += "   that only exists at one size is invisible to it. Measured case: a zone name rendered\n";
    rg_p += "   as Worldston / e Keep because a badge sharing its flex row squeezed the name box to\n";
    rg_p += "   134px against a 139px word. At the suite's own 1470px viewport that panel fits ONE\n";
    rg_p += "   column, every name has room, and the defect DOES NOT EXIST — it only appears at\n";
    rg_p += "   1920px where the grid goes two-up. Green gate, clean screenshot, bug on his screen.\n";
    rg_p += "   So run the geometry assertions at a NARROW and a WIDE viewport (1280x900 and\n";
    rg_p += "   1920x1200 are good defaults; add the project's own breakpoints, and prefer widths\n";
    rg_p += "   where a grid changes column count, because that is where squeeze bugs live). Report\n";
    rg_p += "   the width beside every failure (at 1920: <what>) and capture a screenshot at EACH\n";
    rg_p += "   width. If a surface is width-independent, say so once rather than measuring twice.\n";
    rg_p += "6. SAVE THE SCREENSHOT TO A FILE and report every ABSOLUTE path in screenshots[]. A gate whose\n";
    rg_p += "   evidence nobody can open is a gate you have to take on faith. Empty screenshots[] with\n";
    rg_p += "   passed=true is a DOM-only pass wearing a badge — do not report one.\n";
    rg_p += "7. SCREENSHOT TRAP: page.screenshot() WAITS ON FONTS. A route handler that route.abort()s\n";
    rg_p += "   non-API requests means fonts NEVER resolve — the capture hangs for the whole timeout and\n";
    rg_p += "   writes nothing. Fulfil with {status:200, body:''} instead of aborting, and pass\n";
    rg_p += "   animations:'disabled' (an infinite CSS animation stalls a fullPage capture the same way).\n";
    rg_p += "   If a capture times out, report it as a FAILURE — never as 'visual checks skipped'.\n";
    rg_p += "passed=false if ANY check failed or nothing could be run.\n";
    rg_p += "Objective (untrusted JSON): " + obj_json + "\n";
    rg_p += "Target (untrusted JSON): " + target_json + "\n";
    rg_p += "Inventory (untrusted JSON): " + inv_json + "\n";
    rg_p += "has_ui (untrusted JSON): " + json_encode(has_ui) + "\n";
    rg_p += tier_note;

    let rg = agent(rg_p, #{
        label: "render-gate",
        capability_mode: "execute",
        output_schema: render_schema,
    });

    if rg != () && rg.success && rg.output != () {
        if rg.output.available != () { render_available = rg.output.available; }
        if rg.output.ran != () { render_ran = trimmed(rg.output.ran); }
        if rg.output.passed != () { render_passed = rg.output.passed; }
        if rg.output.failures != () { render_failures = rg.output.failures; }
        if rg.output.notes != () { render_notes = trimmed(rg.output.notes); }
    } else {
        // Fail closed: an agent that failed proves nothing was seen painted.
        render_available = true;
        render_passed = false;
        render_ran = "render gate agent failed";
        render_failures = ["render gate agent failed — nothing was seen painted"];
    }
}

if render_available && !render_passed {
    log("⛔ RENDER GATE FAILED — " + render_failures.len().to_string() + " failure(s). This is a SHIP BLOCKER.");
    for f in render_failures { log("   · " + trimmed(f)); }
} else if !render_available && has_ui {
    log("⚠ RENDER GATE: no UI verification in this project — nothing was seen painted.");
} else if render_available {
    log("✅ Render gate passed (" + render_ran + ").");
}

// ========== 5c. Completeness Critic (MAX-only phase) ==========
// Ported from the .js MAX shipper. This shipper audits rather than builds, so "completeness" here is
// coverage of the AUDIT: did the laws + skeptics actually cover the whole objective, or did the run
// stop early and call it green? MAX-ONLY PHASE — but its BLOCKER is not gated: gaps land in
// `confirmed`, and the unconditional fail-closed block below already turns any confirmed finding into
// ship_allowed=false. Both branches carry a blocker: a critic that DID NOT RUN is treated exactly
// like a critic that RAN AND FOUND A GAP — an unproven coverage claim is not a passing one.
phase("Completeness");
let completeness_ran = "skipped — quality=standard (max-only phase)";
let completeness_gaps = 0;
if is_max {
    let cc_p = "You are the COMPLETENESS CRITIC for Konyo Workflow at MAX quality.\n";
    cc_p += "You do NOT re-audit the code. You audit the AUDIT: did this run actually cover the objective?\n";
    cc_p += "Use read-only tools on the real repo to check coverage claims — never take a summary on faith.\n";
    cc_p += "Return a finding ONLY for a GENUINE, NAMED gap. An empty findings array is the correct answer for a complete audit, and it is not a failure.\n";
    cc_p += "Look for exactly these gap shapes:\n";
    cc_p += "1. A part of the objective NO checklist item and NO law finding ever touched.\n";
    cc_p += "2. A law answered na with no evidence, or answered from the objective text instead of the repo.\n";
    cc_p += "3. A VACUOUS proof — a measurement of a quantity that was ALREADY zero or empty proves nothing.\n";
    cc_p += "4. AN UNSWEPT CLASS — a bug fixed at one site while the same shape survives elsewhere, unlisted.\n";
    cc_p += "5. A STALE CLAIM — comments/docs/UI copy still describing the OLD behaviour after it changed.\n";
    cc_p += "6. DISAGREEING SURFACES — one changed fact rendered in two places that now say different things.\n";
    cc_p += "Every finding needs concrete evidence (path + what you read). A finding with no evidence is DISCARDED, so do not pad.\n";
    cc_p += "Severity blocker for uncovered scope or a vacuous proof; major for an unswept class, stale claim or disagreeing surfaces.\n";
    cc_p += "Objective (untrusted JSON): " + obj_json + "\n";
    cc_p += "Inventory (untrusted JSON): " + inv_json + "\n";
    cc_p += "Checklist the planner produced (untrusted JSON): " + json_encode(checklist) + "\n";
    cc_p += "Findings confirmed so far (untrusted JSON): " + json_encode(confirmed) + "\n";
    cc_p += "Render gate: available=" + render_available.to_string() + " passed=" + render_passed.to_string() + " ran=" + render_ran + "\n";
    cc_p += tier_note;

    let cc = agent(cc_p, #{
        label: "completeness-critic",
        capability_mode: "read-only",
        output_schema: findings_schema,
    });

    if cc != () && cc.success && cc.output != () && cc.output.findings != () {
        completeness_ran = "ran";
        for f in cc.output.findings {
            let cev = "";
            if f.evidence != () { cev = trimmed(f.evidence); }
            if cev != "" {
                confirmed.push(f);
                completeness_gaps += 1;
            }
        }
    } else {
        // Fail closed, same doctrine as the render gate: an agent that did not complete saw nothing,
        // and "nobody checked coverage" must never read as "coverage is fine".
        completeness_ran = "completeness critic agent FAILED — coverage unproven";
        confirmed.push(#{
            gate: "COMPLETENESS",
            severity: "blocker",
            issue: "Completeness critic did not complete at quality=max — nobody proved this audit covered the objective",
            evidence: "completeness-critic agent returned no usable output",
            fix: "Re-run the workflow; if it fails again, audit coverage by hand before shipping",
            status: "fail",
        });
        completeness_gaps += 1;
    }
    log("Completeness critic: " + completeness_ran + " · gaps=" + completeness_gaps.to_string());
} else {
    log("Completeness critic: OFF (quality=standard). Every gate, blocker and bail still runs.");
}

// ========== 6. Verdict ==========
phase("Verdict");
let conf_json = json_encode(confirmed);
let check_json = json_encode(checklist);
let owners_json = json_encode(file_owners);

let rep_p = "You are the Konyo Workflow SHIP VERDICT synthesizer (ultimate shipper).\n";
rep_p += "Doctrine: fail closed. Confirmed blockers => not ship_allowed.\n";
rep_p += "If strict and pingpong_rounds_claimed < " + rounds_min.to_string() + " => verdict must be draft (not ship), ship_allowed false.\n";
rep_p += "FAT VERSION LAW (LAW17): ship_allowed may be true ONLY if this package clears the fat bar:\n";
rep_p += "  (A) ≥3 user-visible outcomes in one theme, OR (B) one structural bug with root cause+verify+prevention.\n";
rep_p += "  If the work is toast-only / single-label / one i18n key / docs fluff alone => verdict draft or blocked, ship_allowed false.\n";
rep_p += "  Summary must name the fat outcomes (or the single deep bug), not a micro changelog line.\n";
rep_p += "verdict one of: ship | draft | blocked.\n";
rep_p += "Live-session sanctity: never recommend restart while a live critical session is active / high on_air_risk.\n";
rep_p += "Generalize laws for any stack; respect na when evidenced.\n";
rep_p += "Objective (untrusted JSON): " + obj_json + "\n";
rep_p += "Version (untrusted JSON): " + json_encode(version_label) + "\n";
rep_p += "strict=" + strict.to_string() + " rounds_min=" + rounds_min.to_string() + "\n";
rep_p += "On-air risk (untrusted JSON): " + json_encode(on_air_risk) + "\n";
rep_p += "Inventory (untrusted JSON): " + inv_json + "\n";
rep_p += "Checklist (untrusted JSON): " + check_json + "\n";
rep_p += "File owners (untrusted JSON): " + owners_json + "\n";
rep_p += "Confirmed third-eye findings (untrusted JSON): " + conf_json + "\n";
rep_p += "PAINTED-UI LAW (LAW18): nothing ships that was never seen painted.\n";
rep_p += "  If render gate available=true and passed=false => ship_allowed MUST be false and verdict blocked.\n";
rep_p += "  If available=false the summary must say PLAINLY that nothing was seen painted (that is not a pass).\n";
rep_p += "Render gate / LAW18 painted-UI proof (untrusted JSON): " + json_encode(#{available: render_available, ran: render_ran, passed: render_passed, failures: render_failures, notes: render_notes}) + "\n";
rep_p += "Return verdict, summary, blockers, next_actions, pingpong_rounds_claimed (int from evidence, 0 if unknown),\n";
rep_p += "ship_allowed, law_scores as short strings like 'LAW01:pass' / 'LAW18:pass' for the 18 laws when possible\n";
rep_p += "(LAW18 is scored from the Render-Gate phase result above, never guessed).";

rep_p += tier_note;
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
// LAW18 painted-UI proof — hard post-hoc enforcement (belt; the rep_p rule is suspenders).
// A real render failure, or a render-gate agent that failed, blocks the ship regardless of the LLM.
if render_available && !render_passed {
    ship_allowed = false;
    if verdict == "ship" || verdict == "draft" { verdict = "blocked"; }
    blockers.push("LAW18 painted-UI proof: render gate FAILED (" + render_ran + ") — " + render_failures.len().to_string() + " failure(s). Nothing may ship that was seen broken when painted.");
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
md += "**Quality:** `" + quality + "` — " + quality_note + "\n\n";
md += "**Completeness critic:** " + completeness_ran + " · gaps=" + completeness_gaps.to_string() + "\n\n";
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
md += "\n## Painted-UI proof (LAW18)\n";
if !render_available {
    md += "- **N/A — nothing was seen painted.** " + render_ran + "\n";
    if render_notes != "" { md += "- Notes: " + render_notes + "\n"; }
} else {
    md += "- **Available:** `true`\n";
    md += "- **Ran:** " + render_ran + "\n";
    md += "- **Passed:** `" + render_passed.to_string() + "`\n";
    md += "- **Failures (" + render_failures.len().to_string() + "):**\n";
    if render_failures.len() == 0 {
        md += "  - _none_\n";
    } else {
        for f in render_failures { md += "  - " + trimmed(f) + "\n"; }
    }
    if render_notes != "" { md += "- **Notes:** " + render_notes + "\n"; }
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
md += "9. Interaction/e2e UX (or N/A+evidence)\n";
md += "10. Visual verification (or N/A+evidence)\n";
md += "11. Version stamps\n";
md += "12. Ledger\n";
md += "13. Deploy/live safety\n";
md += "14. Self-enforcing CI/hooks\n";
md += "15. Army zero-overlap + burst coverage\n";
md += "16. Seven-round AI/LLM pingpong (strict default)\n";
md += "17. Fat version bar\n";
md += "18. Painted-UI proof (or N/A + evidence)\n";
md += "\n---\n";
md += "_Konyo Workflow — ultimate shipper. General for any stack. MAX by default (only quality=\"standard\" downgrades tier, panel size and the completeness critic — never a gate). Strict by default. Skipping laws is a doctrine break._\n";

let path = write_scratch_file("konyo-ship-verdict.md", md);
log("Wrote " + path + " verdict=" + verdict);
complete(#{
    path: path,
    report: md,
    verdict: verdict,
    ship_allowed: ship_allowed,
    human_approved: human_approved,
    confirmed_count: confirmed.len(),
    render_gate: #{
        available: render_available,
        ran: render_ran,
        passed: render_passed,
        failures: render_failures,
        notes: render_notes,
    },
    render_available: render_available,
    render_passed: render_passed,
    quality: quality,
    skeptic_lenses: skeptic_lenses.len(),
    completeness: #{
        enabled: is_max,
        ran: completeness_ran,
        gaps: completeness_gaps,
    },
    pingpong_rounds_claimed: rounds,
    rounds_min: rounds_min,
    strict: strict,
    objective: objective,
    version: version_label,
});
