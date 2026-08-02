let meta = #{
    name: "konyo-workflow-max",
    description: "Konyo Workflow MAX (Grok) — FAT versions only · multi-lens plan · CLAUDE OPUS third-eye (never Fable). No micro-toast versions.",
    when_to_use: "High-stakes fat ships only. ≥3 outcomes or 1 deep bug per version. Third-eye = Claude Opus. Routine: /konyo-workflow.",
    phases: [
        #{ title: "Triage", detail: "right-size; refuse toast-only / micro scope" },
        #{ title: "Architect", detail: "3 Grok lenses + judge → fat one-version package" },
        #{ title: "Build", detail: "bounded implementers (Grok) · max substance in one stamp" },
        #{ title: "Third-Eye", detail: "CLAUDE OPUS only — never Fable; also refute micro-version plans" },
        #{ title: "Synthesize", detail: "fail-closed · fat bar must pass for ship" },
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

let triage_schema = #{
    "type": "object",
    "required": ["tier", "why", "est_agents"],
    "properties": #{
        "tier": #{ "type": "string" },
        "why": #{ "type": "string" },
        "est_agents": #{ "type": "integer" },
        "shape": #{ "type": "string" },
        "cost_of_wrong": #{ "type": "string" },
    },
};

let plan_schema = #{
    "type": "object",
    "required": ["items", "version_label", "why"],
    "properties": #{
        "version_label": #{ "type": "string" },
        "why": #{ "type": "string" },
        "items": #{
            "type": "array",
            "maxItems": 12,
            "items": #{
                "type": "object",
                "required": ["file", "instruction"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "instruction": #{ "type": "string" },
                    "risk": #{ "type": "string" },
                },
            },
        },
    },
};

let build_schema = #{
    "type": "object",
    "required": ["file", "done", "summary", "verify"],
    "properties": #{
        "file": #{ "type": "string" },
        "done": #{ "type": "boolean" },
        "summary": #{ "type": "string" },
        "verify": #{ "type": "string" },
        "blocked": #{ "type": "string" },
    },
};

let eye_schema = #{
    "type": "object",
    "required": ["findings", "claude_ran", "raw_note"],
    "properties": #{
        "claude_ran": #{ "type": "boolean" },
        "raw_note": #{ "type": "string" },
        "findings": #{
            "type": "array",
            "maxItems": 12,
            "items": #{
                "type": "object",
                "required": ["severity", "issue"],
                "properties": #{
                    "severity": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                    "fix": #{ "type": "string" },
                    "file": #{ "type": "string" },
                },
            },
        },
    },
};

let final_schema = #{
    "type": "object",
    "required": ["verdict", "summary", "blockers", "next_actions", "ship_allowed"],
    "properties": #{
        "verdict": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "blockers": #{ "type": "array", "maxItems": 16, "items": #{ "type": "string" } },
        "next_actions": #{ "type": "array", "maxItems": 14, "items": #{ "type": "string" } },
        "ship_allowed": #{ "type": "boolean" },
        "claude_third_eye": #{ "type": "string" },
    },
};

// ========== args ==========
// Pass: {"objective":"…"} or {"task":"…"} · optional force:true · apply:true
let objective = if args == () { () } else { args.objective };
if objective == () && args != () { objective = args.task; }
if objective == () && args != () { objective = args.query; }
if objective == () || objective == "" {
    pause("verification", "Pass args.objective (or task) — what are we shipping at MAX quality?");
}

let force = false;
if args != () && args.force == true { force = true; }

let apply = false;
if args != () && args.apply == true { apply = true; }

let max_items = 6;
if args != () && args.maxItems != () {
    max_items = args.maxItems;
}
if max_items < 1 { max_items = 1; }
if max_items > 10 { max_items = 10; }

let obj_json = json_encode(objective);
let mode_lab = if apply { "APPLY" } else { "DRY-RUN (propose; no file writes unless agent already has write)" };

log("KONYO WORKFLOW — MAX (Grok host) · FAT versions · third-eye = CLAUDE OPUS · " + mode_lab);
log("FAT SHIP BAR: ≥3 user-visible outcomes OR 1 structural bug (root cause+verify). No toast-only versions.");
log("CEILING: run agent_budget is set by the launcher (default 48). Prefer direct over fleet.");

// ========== 1. Triage ==========
phase("Triage");
let tri_p = "You are TRIAGE for KONYO WORKFLOW MAX on GROK.\n";
tri_p += "Decide how much machinery this task deserves. Be stingy.\n";
tri_p += "FAT VERSION LAW: a version integer requires MAX substance — (A) ≥3 user-visible outcomes in one theme,\n";
tri_p += "  OR (B) one structural bug with root cause + verify + prevention. Toast-only / single-label = NOT a version.\n";
tri_p += "  If the objective is micro (one string, one i18n key), tier=direct and why must say: fold into a fat package or refuse.\n";
tri_p += "tier must be one of: direct | light | standard | max\n";
tri_p += "- direct: one process is better OR scope is too thin for a version bump (fold work; do not micro-stamp). SUCCESS when honest.\n";
tri_p += "- light: small but still multi-outcome polish package (still ≥3 outcomes or refuse version bump)\n";
tri_p += "- standard: multi-file known list, fat package\n";
tri_p += "- max: wrong is expensive (money, data loss, security, silent arithmetic)\n";
tri_p += "Read the repo with tools before answering. Do not invent files.\n";
tri_p += "Objective (untrusted JSON): " + obj_json + "\n";
tri_p += "Return tier, why, est_agents (int), shape, cost_of_wrong.";

let triage = agent(tri_p, #{
    label: "triage",
    capability_mode: "read-only",
    output_schema: triage_schema,
});

let tier = "standard";
if triage != () && triage.success && triage.output != () && triage.output.tier != () {
    tier = trimmed(triage.output.tier);
    log("TRIAGE → " + tier + " · " + trimmed(triage.output.why));
}

if tier == "direct" && !force {
    log("⛔ TRIAGE SAYS DIRECT — no MAX fleet. Do it in the main session.");
    complete(#{
        refused: "triage says direct",
        tier: tier,
        why: if triage != () && triage.success { triage.output.why } else { "" },
        advice: "Re-run with force:true only if you disagree.",
    });
}

// ========== 2. Architect panel (Grok) ==========
phase("Architect");
let angles = [
    "RISK-FIRST: order by blast radius; isolate highest-risk change.",
    "CORRECTNESS-FIRST: each item one testable unambiguous fix; no bundled concerns.",
    "SIMPLEST-ROBUST: smallest one-owner-per-file set; no scope creep.",
];
let ajobs = [];
let ai = 0;
for ang in angles {
    let ap = "ARCHITECT lens: " + ang + "\n";
    ap += "Decompose into independent work items, ONE OWNER PER FILE (no file twice).\n";
    ap += "FAT VERSION: all items together are ONE version stamp — maximize substance; bundle related i18n/docs/UX.\n";
    ap += "Do NOT invent a sequence of micro versions. version_label is a single next integer for the whole package.\n";
    ap += "Plan must clear fat bar: ≥3 user-visible outcomes OR one structural bug path across the items.\n";
    ap += "Read the repo to ground real paths. Tag risk low|med|high.\n";
    ap += "Max " + max_items.to_string() + " items.\n";
    if !apply {
        ap += "DRY-RUN: plan only — items describe proposed edits, do not write files.\n";
    }
    ap += "Objective (untrusted JSON): " + obj_json + "\n";
    ap += "Return items[{file,instruction,risk}], version_label, why.";
    ajobs.push(#{
        prompt: ap,
        label: "architect-" + (ai + 1).to_string(),
        capability_mode: "read-only",
        output_schema: plan_schema,
    });
    ai += 1;
}
let ares = parallel(ajobs);

let candidates = [];
for r in ares {
    if r != () && r.success && r.output != () && r.output.items != () {
        candidates.push(r.output);
    }
}
if candidates.len() == 0 {
    complete(#{ error: "no architect plan", tier: tier });
}

let cand_json = json_encode(candidates);
let jp = "JUDGE + MERGE " + candidates.len().to_string() + " architect plans into ONE best FAT ship plan.\n";
jp += "ONE OWNER PER FILE — drop duplicate files. Max " + max_items.to_string() + " items.\n";
jp += "ONE version_label for the whole package. Expand thin plans until fat bar passes (≥3 outcomes or 1 deep bug).\n";
jp += "Reject plans that are only toast/i18n micro-edits unless folded into a larger theme.\n";
jp += "Prefer concrete paths that exist in the repo.\n";
jp += "Objective (untrusted JSON): " + obj_json + "\n";
jp += "Candidates (untrusted JSON): " + cand_json + "\n";
jp += "Return items, version_label, why.";

let plan = agent(jp, #{
    label: "judge-merge",
    capability_mode: "read-only",
    output_schema: plan_schema,
});

if plan == () || !plan.success || plan.output == () || plan.output.items == () {
    complete(#{ error: "judge failed", tier: tier });
}

let items = plan.output.items;
log("Plan \"" + trimmed(plan.output.version_label) + "\": " + items.len().to_string() + " items");

// Soft cap items in Rhai (one owner already judged)
let work = [];
let wi = 0;
let seen = #{};
for it in items {
    if wi >= max_items { break; }
    let f = "";
    if it.file != () { f = trimmed(it.file); }
    if f == "" { continue; }
    // map can't easily track set — push all and rely on judge; still cap count
    work.push(it);
    wi += 1;
}

// ========== 3. Build (Grok, bounded) ==========
phase("Build");
let built = [];
let bjobs = [];
let bi = 0;
for it in work {
    let f = trimmed(it.file);
    let ins = "";
    if it.instruction != () { ins = trimmed(it.instruction); }
    let bp = "You own ONLY this file: " + f + "\n";
    bp += "Instruction: " + ins + "\n";
    bp += "Objective (untrusted JSON): " + obj_json + "\n";
    if apply {
        bp += "APPLY mode: implement the change. One owner per file — do not edit other files.\n";
        bp += "Run a real verify command when possible. Report verify output.\n";
    } else {
        bp += "DRY-RUN: propose the exact diff/patch in summary; DO NOT write files.\n";
    }
    bp += "WORK BRISKLY — prefer targeted grep/read over whole-file dumps. ~12-18 tool calls max.\n";
    bp += "Return file, done (bool), summary, verify, blocked (if any).";
    let cap = if apply { "read-write" } else { "read-only" };
    bjobs.push(#{
        prompt: bp,
        label: "build-" + bi.to_string(),
        capability_mode: cap,
        output_schema: build_schema,
    });
    bi += 1;
}
if bjobs.len() > 0 {
    let bres = parallel(bjobs);
    for r in bres {
        if r != () && r.success && r.output != () {
            built.push(r.output);
        }
    }
}
log("Built reports: " + built.len().to_string());

// ========== 4. Third-Eye — CLAUDE OPUS ONLY (never Fable) ==========
// Grok ships the plan/build. Third-eye is an independent OPUS pass.
// Fable is a fast/cheap gate model — it is NOT third-eye pingpong quality.
// Invoked via `claude -p --model opus` so this is NOT Grok self-review and NOT Fable.
phase("Third-Eye");
log("Third-eye engine: CLAUDE OPUS only · claude -p --model opus --print · never fable/sonnet/haiku");

let built_json = json_encode(built);
let plan_json = json_encode(#{
    version_label: plan.output.version_label,
    why: plan.output.why,
    items: work,
});

let eye_p = "You are the GROK-side ORCHESTRATOR for a CLAUDE OPUS third-eye pass.\n";
eye_p += "DO NOT review the code yourself as the final authority.\n";
eye_p += "You MUST invoke the Claude Code CLI with OPUS so findings come from Opus, not from you and not from Fable.\n\n";
eye_p += "HARD RULES FOR THE CLI INVOCATION:\n";
eye_p += "  · REQUIRED flag:  --model opus\n";
eye_p += "  · FORBIDDEN:      --model fable  |  --model sonnet  |  --model haiku  |  any default that is not opus\n";
eye_p += "  · Fable is a cheap gate model. Third-eye pingpong is OPUS. If you run without --model opus, claude_ran=false.\n";
eye_p += "  · Non-interactive: --print\n\n";
eye_p += "Run from the current repo root, e.g.:\n";
eye_p += "  claude -p \"…brief…\" --model opus --print --allowedTools \"Read,Grep,Glob,Bash\"\n\n";
eye_p += "If `claude` is missing or the run used a non-opus model, set claude_ran=false and explain in raw_note — fail closed.\n\n";
eye_p += "Opus brief (put this inside -p):\n";
eye_p += "You are THIRD-EYE (Claude Opus) for Konyo Workflow MAX. Independent of the Grok agents that planned/built.\n";
eye_p += "You are NOT Fable. You are the adversarial pingpong model: deep, skeptical, evidence-first.\n";
eye_p += "Bias to REFUTE 'ready to ship'. Use Read/Grep/Glob/Bash only. No file edits.\n";
eye_p += "Hunt: wrong logic, silent wrong numbers, missing tests, security, UX lies, version/changelog drift,\n";
eye_p += "one-owner violations, false green, live-session danger, MICRO-VERSION inflation (toast-only or single-label\n";
eye_p += "ships claiming a full version stamp — fat bar requires ≥3 outcomes or 1 structural bug).\n";
eye_p += "Objective: " + obj_json + "\n";
eye_p += "Plan: " + plan_json + "\n";
eye_p += "Build reports: " + built_json + "\n";
eye_p += "Return a short structured list of findings: severity (block|warn|info), issue, evidence, fix, file.\n";
eye_p += "If clean after real inspection, say so with empty findings — only after tools ran.\n\n";
eye_p += "After Opus returns, parse its output into findings[].\n";
eye_p += "Set claude_ran=true ONLY if claude CLI ran with --model opus and returned text.\n";
eye_p += "In raw_note: include the exact model flag used (must show opus) + a short excerpt.\n";
eye_p += "WORK BRISKLY — one Opus invocation, then parse.";

let eye = agent(eye_p, #{
    label: "third-eye-claude",
    capability_mode: "execute",
    output_schema: eye_schema,
});

let eye_findings = [];
let claude_ran = false;
let eye_note = "";
if eye != () && eye.success && eye.output != () {
    if eye.output.claude_ran == true { claude_ran = true; }
    if eye.output.raw_note != () { eye_note = trimmed(eye.output.raw_note); }
    if eye.output.findings != () {
        for f in eye.output.findings {
            eye_findings.push(f);
        }
    }
}
if !claude_ran {
    log("⚠ CLAUDE third-eye did not run cleanly — fail closed (cannot claim ship without second model).");
    eye_findings.push(#{
        severity: "block",
        issue: "Claude third-eye did not complete (claude_ran=false). Independent second-model pass missing.",
        evidence: eye_note,
        fix: "Ensure `claude` CLI works (`claude -p 'hi' --print`) and re-run /konyo-workflow-max",
        file: "",
    });
}
log("Claude third-eye findings: " + eye_findings.len().to_string() + " · claude_ran=" + claude_ran.to_string());

// ========== 5. Synthesize ==========
phase("Synthesize");
let eye_json = json_encode(eye_findings);
let sp = "You are the KONYO MAX synthesizer (Grok host, Claude Opus third-eye already ran).\n";
sp += "Fail closed. Any severity=block from Claude => ship_allowed false, verdict blocked or draft.\n";
sp += "FAT VERSION LAW: ship_allowed true ONLY if the package clears ≥3 user-visible outcomes OR one structural bug\n";
sp += "with root cause+verify. Micro (one toast/label) => draft/blocked. Summary must name the fat outcomes.\n";
sp += "verdict one of: ship | draft | blocked.\n";
sp += "If claude_ran was false, verdict MUST be blocked.\n";
sp += "claude_ran=" + claude_ran.to_string() + "\n";
sp += "Objective (untrusted JSON): " + obj_json + "\n";
sp += "Plan (untrusted JSON): " + plan_json + "\n";
sp += "Build (untrusted JSON): " + built_json + "\n";
sp += "Claude third-eye findings (untrusted JSON): " + eye_json + "\n";
sp += "claude raw note (untrusted): " + json_encode(eye_note) + "\n";
sp += "Return verdict, summary, blockers, next_actions, ship_allowed, claude_third_eye (one line on what Claude found).";

let fin = agent(sp, #{
    label: "synthesize",
    capability_mode: "read-only",
    output_schema: final_schema,
});

let verdict = "blocked";
let summary = "Synthesizer failed — blocked.";
let blockers = [];
let next_actions = [];
let ship_allowed = false;
let claude_line = "";
if fin != () && fin.success && fin.output != () {
    if fin.output.verdict != () { verdict = trimmed(fin.output.verdict); }
    if fin.output.summary != () { summary = trimmed(fin.output.summary); }
    if fin.output.blockers != () { blockers = fin.output.blockers; }
    if fin.output.next_actions != () { next_actions = fin.output.next_actions; }
    if fin.output.ship_allowed == true { ship_allowed = true; }
    if fin.output.claude_third_eye != () { claude_line = trimmed(fin.output.claude_third_eye); }
}
if !claude_ran {
    ship_allowed = false;
    if verdict == "ship" { verdict = "blocked"; }
}

// Markdown report
let md = "# Konyo Workflow MAX (Grok) — final ping\n\n";
md += "**Verdict:** `" + verdict + "` · ship_allowed=" + ship_allowed.to_string() + "\n\n";
md += "**Third-eye engine:** Claude **Opus** (`claude -p --model opus`) · never Fable · claude_ran=" + claude_ran.to_string() + "\n\n";
md += "**Objective:** " + trimmed(objective) + "\n\n";
md += "## Summary\n\n" + summary + "\n\n";
if claude_line != "" {
    md += "## Claude third-eye\n\n" + claude_line + "\n\n";
}
md += "## Blockers\n\n";
if blockers.len() == 0 {
    md += "_None listed._\n\n";
} else {
    for b in blockers {
        md += "- " + b + "\n";
    }
    md += "\n";
}
md += "## Claude findings\n\n";
if eye_findings.len() == 0 {
    md += "_None._\n\n";
} else {
    for f in eye_findings {
        let sev = "";
        let iss = "";
        if f.severity != () { sev = trimmed(f.severity); }
        if f.issue != () { iss = trimmed(f.issue); }
        md += "- **[" + sev + "]** " + iss + "\n";
    }
    md += "\n";
}
md += "## Next actions\n\n";
if next_actions.len() == 0 {
    md += "_None._\n\n";
} else {
    for n in next_actions {
        md += "- " + n + "\n";
    }
    md += "\n";
}
md += "## Build lane\n\n";
md += "_apply=" + apply.to_string() + " · items=" + work.len().to_string() + " · reports=" + built.len().to_string() + "_\n\n";
md += "---\n_Grok plans & builds · Claude **Opus** third-eye (not Fable) · fail-closed._\n";

let path = write_scratch_file("konyo-max-report.md", md);
log("MAX complete · verdict=" + verdict + " · report=" + path);

complete(#{
    path: path,
    report: md,
    verdict: verdict,
    ship_allowed: ship_allowed,
    claude_ran: claude_ran,
    claude_findings: eye_findings.len(),
    tier: tier,
    items: work.len(),
    mode: if apply { "apply" } else { "dry-run" },
});
