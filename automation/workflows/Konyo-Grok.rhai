let meta = #{
    name: "Konyo-Grok",
    description: "Konyo-Grok (/Konyo-Grok) — short name for the Grok Konyo shipper. FULL IMPLEMENTER. ONE body, four qualities (lean|max|standard|tiny). LEAN default: every ship gate (adversarial panel, LAW17/18/19, workspace lock, agent ceiling). max buys multi-architect, completeness, deeper rework. Pass {apply:true} to edit; apply:false dry-run. Third eye = Claude CLI (different family). Args: task, quality, apply, force, items, skeptics, isolate, thirdEye, maxAgents, ignoreLock, push, renderLoop. items[] skips architect. v26 render LOOP; v27/v27.1 SHIPPABLE; v28 PACE+PROXY+PHASE_PLAN+stop reasons; v28.1 early lock; v29 scar FOUNDING vs LEARNED; v30 meter routing (max is not volume); v31 LAW19 parallel first-render hop + images_na fail-closed + rich LAW19 schema; v32 record scars at failure + run-not-inspect; v33 CAPTURE PER ROUND / CARVE PER ARC (Claude JS v31 parity 2026-08-11) — sibling failures brief rework; arc-end carve candidates PROPOSE only, never suppress a gate.",
    when_to_use: "SURGICAL — NOT THE DEFAULT FOR EVERY CHAT. Use only when the human asked for a multi-round ship, a sealed version, a night/fleet run, or an explicit /Konyo-Grok (alias /konyo-workflow). Do NOT open this fleet for one-file fixes, Q&A, audits, or routine edits — those use direct tools + the few specialist skills that match the surface. Bare call = lean + dry-run. {apply:true} to write. quality max ONLY for SMALL high-stakes lists (items preferred). quality tiny needs items[]. Multi-stamp: N lean/tiny slices. Carving is separate: open carving-skill only when 3+ scars share a territory (or carve_candidates non-empty), never as a default stack with this workflow.",
    phases: [
        #{ title: "Preflight", detail: "workspace lock when apply:true — shared lock dir with Claude so fleets exclude each other" },
        #{ title: "Triage", detail: "right-size before spending; SKIPPED at tiny" },
        #{ title: "Architect", detail: "one-owner-per-file plan; multi-architect at max; SKIPPED when caller passes items[] or quality tiny" },
        #{ title: "Third-eye", detail: "Claude (different family) reviews the plan before builders spend; SKIPPED at tiny" },
        #{ title: "Build+Gate", detail: "builders write when apply:true; one owner per file; patch carrier when isolate" },
        #{ title: "Adversarial gate", detail: "diverse-lens skeptics ARE the gate (floor 2 at max/lean when applying)" },
        #{ title: "Rework", detail: "failed items get one more attempt (max keeps two)" },
        #{ title: "Merge", detail: "only with {isolate:true}: sequential git apply --check of patches" },
        #{ title: "Completeness", detail: "max ONLY — hunt work nobody planned; lean/tiny/standard report skipped" },
        #{ title: "Render ‖ Reachability", detail: "v31 — LAW19 + first render pass in ONE parallel hop (Claude v22 wall-clock; Rhai has no fire-and-forget so fix-loop stays serial after). Then v26 LOOP continues if dirty; stops PASSED|CEILING|STALLED" },
        #{ title: "Fat version bar", detail: "LAW17 — fat package or structural bug; thin ship blocks; apply only; AFTER render (prompt may read failures)" },
        #{ title: "Reachability", detail: "LAW19 — folded into the concurrent hop under apply; dry-run still runs alone. Rich schema: checked/dead/tests_proven_run" },
        #{ title: "Ship", detail: "push ONLY if shippable and {push:true}; never --force / --no-verify" },
        #{ title: "Synthesize", detail: "ONE final ping report; tiny writes its own headline" },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// KONYO WORKFLOW — Grok Build implementer
// Parity with ~/.claude/workflows/konyo-workflow.js (lean default, apply,
// army, skeptic gate, LAW17/18/19, items@any quality, no vacuous green ship) +
// v26 render loop + v28/v28.1/v29 + v30 meter routing + v31 concurrent LAW19‖render
// + v32 scar@failure / run-not-inspect + v33 CAPTURE PER ROUND / CARVE PER ARC
// (Claude JS v31, 2026-08-11 — sibling gate failures brief the next rework round;
// arc-end carve candidates PROPOSE only; scars never suppress a gate).
//
// Host differences (named, not papered over):
//   · Claude thirdEye default = Grok CLI.  Grok thirdEye default = Claude CLI.
//   · Grok agent() has no Opus/Sonnet ladder — tier is a DEPTH DIRECTIVE in the
//     prompt, never a silent claim that a different model ran.
//   · capability_mode is the write boundary: read-only | read-write | execute | all.
// ═══════════════════════════════════════════════════════════════════════════

fn trimmed(s) {
    if type_of(s) == "string" {
        s.trim();
        s
    } else {
        ""
    }
}

fn as_map(v) {
    if type_of(v) == "map" { v } else { #{} }
}

fn as_arr(v) {
    if type_of(v) == "array" { v } else { [] }
}

fn truthy(v) {
    if v == true { true } else { false }
}

// ---------- schemas ----------
let triage_schema = #{
    "type": "object",
    "required": ["shape", "parallelism", "cost_of_wrong", "tier", "est_agents", "skeptics", "work_list_known", "why"],
    "properties": #{
        "shape": #{ "type": "string" },
        "parallelism": #{ "type": "string" },
        "cost_of_wrong": #{ "type": "string" },
        "tier": #{ "type": "string" },
        "est_agents": #{ "type": "integer" },
        "skeptics": #{ "type": "integer" },
        "work_list_known": #{ "type": "boolean" },
        "why": #{ "type": "string" },
    },
};

let plan_schema = #{
    "type": "object",
    "required": ["version_label", "summary", "items"],
    "properties": #{
        "version_label": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "items": #{
            "type": "array",
            "maxItems": 24,
            "items": #{
                "type": "object",
                "required": ["id", "file", "instruction", "risk"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "file": #{ "type": "string" },
                    "kind": #{ "type": "string" },
                    "tier": #{ "type": "string" },
                    "risk": #{ "type": "string" },
                    "instruction": #{ "type": "string" },
                    "anchor": #{ "type": "string" },
                },
            },
        },
        "why": #{ "type": "string" },
    },
};

let build_schema = #{
    "type": "object",
    "required": ["file", "summary", "changes", "self_check", "files_touched"],
    "properties": #{
        "file": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "changes": #{ "type": "string" },
        "self_check": #{ "type": "string" },
        "files_touched": #{ "type": "array", "maxItems": 40, "items": #{ "type": "string" } },
        "patch": #{ "type": "string" },
    },
};

let gate_schema = #{
    "type": "object",
    "required": ["verdict", "severity", "reason"],
    "properties": #{
        "verdict": #{ "type": "string" },
        "severity": #{ "type": "string" },
        "reason": #{ "type": "string" },
    },
};

let skeptic_schema = #{
    "type": "object",
    "required": ["refute", "severity", "issue", "evidence"],
    "properties": #{
        "refute": #{ "type": "boolean" },
        "severity": #{ "type": "string" },
        "issue": #{ "type": "string" },
        "evidence": #{ "type": "string" },
    },
};

let law_schema = #{
    "type": "object",
    "required": ["pass", "reason", "evidence"],
    "properties": #{
        "pass": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
        "available": #{ "type": "boolean" },
    },
};

// v31 — LAW19 rich schema (Claude v22 parity). pass is still the ship-blocker
// summary; dead[] / tests_proven_run can refuse independently when pass is soft.
let reach_schema = #{
    "type": "object",
    "required": ["pass", "reason", "evidence", "checked", "dead", "tests_added", "tests_proven_run"],
    "properties": #{
        "pass": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
        "checked": #{ "type": "integer" },
        "dead": #{ "type": "array", "items": #{ "type": "string" } },
        "tests_added": #{ "type": "boolean" },
        "tests_proven_run": #{ "type": "boolean" },
        "notes": #{ "type": "string" },
    },
};

// v26 — render gate schema (richer than law_schema). `pass` is the ship-blocker
// field Grok already used; `passed` is accepted as a synonym for Claude parity.
let render_schema = #{
    "type": "object",
    "required": ["available", "pass", "reason", "evidence", "failures", "notes", "screenshots"],
    "properties": #{
        "available": #{ "type": "boolean" },
        "pass": #{ "type": "boolean" },
        "passed": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
        "ran": #{ "type": "string" },
        "failures": #{ "type": "array", "items": #{ "type": "string" } },
        "notes": #{ "type": "string" },
        "screenshots": #{ "type": "array", "items": #{ "type": "string" } },
        "visual": #{ "type": "array", "items": #{ "type": "string" } },
        "images": #{
            "type": "array",
            "items": #{
                "type": "object",
                "properties": #{
                    "surface": #{ "type": "string" },
                    "path": #{ "type": "string" },
                    "claims": #{ "type": "string" },
                    "depicts": #{ "type": "string" },
                    "matches": #{ "type": "boolean" },
                },
            },
        },
        "images_na_reason": #{ "type": "string" },
    },
};

// v26 — fixer half of the render loop. `changed:false` STOPS the loop rather
// than re-rendering identical code (no-progress stop).
let fix_schema = #{
    "type": "object",
    "required": ["changed", "what", "files", "unfixable"],
    "properties": #{
        "changed": #{ "type": "boolean" },
        "what": #{ "type": "string" },
        "files": #{ "type": "array", "items": #{ "type": "string" } },
        "unfixable": #{ "type": "array", "items": #{ "type": "string" } },
    },
};

let final_schema = #{
    "type": "object",
    "required": ["version_label", "headline", "shipped", "follow_ups"],
    "properties": #{
        "version_label": #{ "type": "string" },
        "headline": #{ "type": "string" },
        "shipped": #{ "type": "array", "maxItems": 20, "items": #{ "type": "string" } },
        "follow_ups": #{ "type": "array", "maxItems": 12, "items": #{ "type": "string" } },
    },
};

let lock_schema = #{
    "type": "object",
    "required": ["acquired"],
    "properties": #{
        "acquired": #{ "type": "boolean" },
        "token": #{ "type": "string" },
        "key": #{ "type": "string" },
        "cwd": #{ "type": "string" },
        "holder_token": #{ "type": "string" },
        "holder_since": #{ "type": "string" },
        "holder_expires": #{ "type": "string" },
        "holder_task": #{ "type": "string" },
        "purged_stale": #{ "type": "integer" },
    },
};

let missing_schema = #{
    "type": "object",
    "required": ["done", "missing"],
    "properties": #{
        "done": #{ "type": "boolean" },
        "missing": #{
            "type": "array",
            "maxItems": 12,
            "items": #{
                "type": "object",
                "required": ["file", "instruction"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "instruction": #{ "type": "string" },
                },
            },
        },
    },
};

// ---------- args ----------
let a = if type_of(args) == "map" { args } else if type_of(args) == "string" { #{ task: args } } else { #{} };

let task = "";
if a.task != () { task = trimmed(a.task); }
if task == "" && a.objective != () { task = trimmed(a.objective); }
if task == "" && a.query != () { task = trimmed(a.query); }
if task == "" {
    pause("verification", "Pass args.task (or objective) — what are we shipping? e.g. {\"task\":\"…\",\"apply\":true,\"quality\":\"lean\"}");
}

// quality: lean default (Claude v20). Only exact tokens. Typo → max (fail expensive).
let quality_asked = "";
if a.quality != () { quality_asked = trimmed(a.quality); quality_asked = quality_asked.to_lower(); }
if quality_asked == "fast" { quality_asked = "lean"; }
let quality = "lean";
if quality_asked == "max" || quality_asked == "lean" || quality_asked == "standard" || quality_asked == "tiny" {
    quality = quality_asked;
} else if quality_asked != "" {
    quality = "max";
    log("⚠ quality '" + quality_asked + "' unrecognised — failing EXPENSIVE to max (not quiet standard).");
}
let quality_defaulted = quality_asked == "";
let tiny_q = quality == "tiny";
let lean_q = quality == "lean";
// MAXQ = every max-only GATE applies to lean and tiny too
let max_q = quality == "max" || quality == "lean" || tiny_q;
// MAXONLY = max and nothing else
let max_only = quality == "max";

let apply_mode = truthy(a.apply);
let force_run = truthy(a.force);
let ignore_lock = truthy(a.ignore_lock) || truthy(a.ignoreLock);
let isolate_mode = (truthy(a.isolate) || truthy(a.isolation_worktree)) && apply_mode;
let do_push = truthy(a.push);  // ship phase only if true AND shippable

let max_rounds = 1;
if max_only { max_rounds = 2; }
if quality == "standard" { max_rounds = 3; }
if a.maxRounds != () { max_rounds = a.maxRounds; }
if a.max_rounds != () { max_rounds = a.max_rounds; }

let dry_rounds = 1;
if a.dryRounds != () { dry_rounds = a.dryRounds; }
if a.dry_rounds != () { dry_rounds = a.dry_rounds; }

// v26 — RENDERLOOP: number of RENDER passes (fixes = RENDERLOOP-1).
// tiny 2 (one correction) / lean|standard 3 / max 4. Override with renderLoop.
let render_loop_n = 3;
if tiny_q { render_loop_n = 2; }
if max_only { render_loop_n = 4; }
if a.renderLoop != () { render_loop_n = a.renderLoop; }
if a.render_loop != () { render_loop_n = a.render_loop; }
// Build the pass plan as a fixed array (for-in; no break required).
let rl_plan = [];
if render_loop_n <= 1 { rl_plan = [1]; }
else if render_loop_n == 2 { rl_plan = [1, 2]; }
else if render_loop_n == 3 { rl_plan = [1, 2, 3]; }
else { rl_plan = [1, 2, 3, 4]; }

let max_agents = 24;
if a.maxAgents != () { max_agents = a.maxAgents; }
if a.max_agents != () { max_agents = a.max_agents; }

// v30 — ITEM CAP BY QUALITY (meter routing). Tiny already hard-caps at 4.
// Max keeps the fleet SMALL because each item multiplies skeptics + rework.
// Lean/standard allow more volume; max is for danger, not throughput.
let max_items_cap = 8;
if tiny_q { max_items_cap = 4; }
if lean_q { max_items_cap = 8; }
if quality == "standard" { max_items_cap = 10; }
if max_only { max_items_cap = 6; }
if a.maxItems != () { max_items_cap = a.maxItems; }
if a.max_items != () { max_items_cap = a.max_items; }
if max_items_cap < 1 { max_items_cap = 1; }
if max_items_cap > 24 { max_items_cap = 24; }

let skeptics_override = ();
if a.skeptics != () { skeptics_override = a.skeptics; }

// third eye: on Grok host default = Claude (different family)
let te_raw = true;
if a.thirdEye != () { te_raw = a.thirdEye; }
else if a.third_eye != () { te_raw = a.third_eye; }
else if a.claude != () { te_raw = a.claude; }  // legacy alias on Grok side
let third_eye = "claude";  // 'claude' | 'grok' | 'off'
if te_raw == false { third_eye = "off"; }
else if trimmed(te_raw) == "off" || trimmed(te_raw) == "false" { third_eye = "off"; }
else if trimmed(te_raw) == "grok" { third_eye = "grok"; }  // same-family DEGRADED, labelled
else { third_eye = "claude"; }
let use_third_eye = third_eye != "off";

let lock_ttl_min = 180;
if a.lockTtlMinutes != () { lock_ttl_min = a.lockTtlMinutes; }

let items_arg = [];
if a.items != () { items_arg = as_arr(a.items); }

// ---------- ledgers ----------
let blockers = [];
let spawn_errors = [];
let agents_spent = 0;
let ceiling_hit = false;
let thin_panels = [];
let third_eye_seats = [];
let trimmed_from_plan = [];
let unbuilt_gaps = [];

fn add_blocker(what, why) {
    // Rhai cannot close over outer mutables cleanly in nested fns for all hosts —
    // callers push directly. This is a documentation stub.
    true
}

let craft_rules = "\n\nFOUR RULES (paid for already):\n";
craft_rules += "1. PROVE NON-VACUOUSLY — before/after with real numbers.\n";
craft_rules += "2. SWEEP THE CLASS — same shape repo-wide or list deliberate leftovers.\n";
craft_rules += "3. KILL STALE CLAIMS — update prose that described old behaviour.\n";
craft_rules += "4. SURFACES AGREE — if a fact appears twice, both answers match.\n";
craft_rules += "5. CHANGE ONLY WHAT THE BRIEF NAMES — no drive-by refactors.\n";

// v28 — PACE (Claude v5/v18.4). Budget is re-read cost, not style. Attached to
// every builder/skeptic/gate via craft_rules so no call site can forget it.
craft_rules += "\nWORK BRISKLY — this run is budgeted: EVERY tool call re-reads context, so a whole-file read early is paid again on every call after. Prefer targeted grep over whole-file reads; prefer a small script that PRINTS A VERDICT over reading and judging yourself. Chain probes with &&; never bare `cd`. Stop at the FIRST solid answer (~12-18 tool calls). If you cannot settle, say so — honest 'not established' beats a slow guess. NONE OF THIS SKIPS EVIDENCE: never skip opening an image, running the test, or fetching real remote state to save a call.\n";

// v28 — PROXY BAN (Claude v16). Three wrong-confident answers in one day were
// the same mistake: measuring a stand-in for the fact.
craft_rules += "\nVERIFY THE THING, NOT A PROXY. Named traps: an IMAGE is only correct if you OPENED it and said what it depicts (naturalWidth/path/hash/size are NOT content); REMOTE git needs fetch or ls-remote (rev-parse origin is a CACHED ref); a test proves nothing until seen FAIL on a deliberate break; NULL/absent is never a pass; 'the file changed' is not 'the running system changed' when anything caches. If you could not verify the thing itself, say not established.\n";

// v32 — RUN, DON'T INSPECT (2026-08-08). The session pattern: nearly everything
// worth keeping came from executing something, not reading it. Inspection is a
// proxy; green reports from unexecuted paths are fiction.
craft_rules += "\nRUN THE THING — READING IS NOT PROOF (v32). Nearly every real lesson came from executing, not inspecting. Named traps from one session: a workflow that had never once been run died in 17ms with every gate green; a reachability gate graded a file the render fixer had already rewritten; a pre-push hook went green on eleven fictional version stamps. Grepping source, reading a gate report, or trusting a green status from a path that never executed is not evidence. RUN it (or the deliberate-break / mutation / live path that would catch the lie). If you only inspected, say not established.\n";

// v29 — SCAR LAW (desktop skill + Prime Continual Harness, 2026-08-07).
// Founding rules are human-authored and never overwritten by a learned lesson.
// Learned scars need EVIDENCE from THIS run, not a sensible-sounding regret.
// Wrong lessons must be undoable — snapshot before append.
// v32 — RECORD AT THE FAILURE (2026-08-08). Seal-only scars die on long sessions.
craft_rules += "\nSCAR LAW (FOUNDING vs LEARNED + RECORD AT FAILURE):\n";
craft_rules += "· FOUNDING RULES (hand-written at top of SCARS.md / project scar file) are immutable by this run. Never overwrite, move, or 'improve' them from a bug.\n";
craft_rules += "· LEARNED SCARS are APPENDED only, below the learned marker. Lower authority on purpose.\n";
craft_rules += "· Every learned scar needs EVIDENCE: what in THIS run proved the rule (not why it sounds sensible). Without it a workflow fills with untraceable refusals.\n";
craft_rules += "· Before pasting a new scar: snapshot (SCARS.prev.md or tools/scar.py --rollback path). A wrong lesson is worse than no lesson because you will follow it.\n";
craft_rules += "· Prefer project tools (e.g. tools/scar.py) over hand-editing machine-parsed blocks when they exist.\n";
craft_rules += "· RECORD AT THE FAILURE, not only at the seal (v32). A long autonomous session never reaches Step 6; scars earned mid-run are lost if you wait. When a failure costs something, write the six-line scar THEN (print + offer SCARS.md + say durability unverified). One scar per DISTINCT failure — not one per session. Four real failures in one session is four scars. Most runs produce none; 'I noticed a thing' is not a scar. Same failure twice = keep the most expensive framing only.\n";

// SURGICAL ROUTING (2026-08-11)
// 1) THIS FLEET is not the default for every human message — only when shipped as /konyo-workflow
//    or the human asked for a sealed multi-round ship.
// 2) CARVING is the default *graduation rule* (3 scars → skill), not a default *open every run*.
// 3) Specialist skills are scalpels — match surface, never stack the whole belt.
craft_rules += "\nROUTING — WORKFLOW IS NOT ALWAYS-ON; CARVING IS NOT ALWAYS-OPEN:\n";
craft_rules += "· You are INSIDE this fleet only because a ship run was started. Outside this fleet, agents must NOT default to spawning /konyo-workflow for routine work.\n";
craft_rules += "· Load ONLY skills that match THIS task's surface (console paint → kai-console-design + unknown-stays-unknown; ports → process-port-discipline; CDP → chrome-cdp-mac; skills/ copy edits → copy-drift).\n";
craft_rules += "· carving-skill: DEFAULT RULE is 'when 3+ learned scars share a territory, graduate them' — that is automatic judgment, not automatic open. Open carving-skill only when carve_candidates is non-empty OR SCARS already has that cluster. Empty candidates → do not open it.\n";
craft_rules += "· Do NOT stack ship-skill + carving + taste + redesign + every host skill. One domain skill + the gates beats a full stack.\n";

// ══ v33 — CAPTURE PER ROUND, CARVE PER ARC (Claude JS v31, 2026-08-11) ════════
// Sibling items fail the same way; re-deriving one lesson twice is the defect.
// CAPTURE is automatic per rework round. CARVE candidates are PROPOSED at run
// end only (floor 3 — two is coincidence). A scar NARROW attention; it NEVER
// suppresses a gate or skips a check.
// Rhai note: no fancy string clustering — territory is the first 80 chars of
// the reason (same failure text clusters; distinct failures stay distinct).
let run_scars = [];  // #{round, file, stage, severity, reason}

fn record_run_scar(round, file, stage, severity, reason) {
    let rsn = trimmed(reason);
    if rsn == "" { return false; }
    let why = if rsn.len() > 600 { rsn.sub_string(0, 600) } else { rsn };
    run_scars.push(#{
        round: round,
        file: trimmed(file),
        stage: if trimmed(stage) == "" { "gate" } else { trimmed(stage) },
        severity: trimmed(severity),
        reason: why,
    });
    true
}

fn scar_territory(reason) {
    let rsn = trimmed(reason);
    if rsn == "" { return ""; }
    if rsn.len() > 80 { rsn.sub_string(0, 80) } else { rsn }
}

// Newest-first brief of OTHER files' failures — cap 6.
fn scar_brief_for(file) {
    let f = trimmed(file);
    let out = "";
    let count = 0;
    let i = run_scars.len();
    while i > 0 && count < 6 {
        i -= 1;
        let s = as_map(run_scars[i]);
        if trimmed(s.file) == f { /* skip own */ } else {
            if count == 0 {
                out = "\n\nWHAT HAS ALREADY FAILED IN THIS RUN, ON OTHER FILES — do not spend a round re-deriving any of it, and check whether the same mistake is in YOUR file:\n";
            }
            out += "  · [round " + s.round.to_string() + " · " + trimmed(s.file) + "] " + trimmed(s.reason) + "\n";
            count += 1;
        }
    }
    if count == 0 { return ""; }
    out += "These are EVIDENCE, not verdicts about your work: they narrow where to look. They never excuse you from any gate, and none of them means a check can be skipped.\n";
    out
}

// Floor 3 identical territories. Proposes only — never applies, never skips gates.
fn carve_candidates() {
    let out = [];
    let seen_keys = [];
    let si = 0;
    while si < run_scars.len() {
        let s = as_map(run_scars[si]);
        let key = scar_territory(s.reason);
        if key == "" {
            si += 1;
        } else {
            let already = false;
            let ki = 0;
            while ki < seen_keys.len() {
                if seen_keys[ki] == key { already = true; }
                ki += 1;
            }
            if already {
                si += 1;
            } else {
                seen_keys.push(key);
                let n = 0;
                let files = [];
                let evidence = [];
                let sj = 0;
                while sj < run_scars.len() {
                    let t = as_map(run_scars[sj]);
                    if scar_territory(t.reason) == key {
                        n += 1;
                        let ff = trimmed(t.file);
                        if ff != "" {
                            let has = false;
                            let fi = 0;
                            while fi < files.len() {
                                if files[fi] == ff { has = true; }
                                fi += 1;
                            }
                            if !has { files.push(ff); }
                        }
                        if evidence.len() < 5 {
                            evidence.push(trimmed(t.reason));
                        }
                    }
                    sj += 1;
                }
                if n >= 3 {
                    out.push(#{ territory: key, n: n, files: files, evidence: evidence });
                }
                si += 1;
            }
        }
    }
    out
}

let fat_law = "FAT VERSION LAW (LAW17): ONE version packages real work — (A) >=3 user-visible outcomes in one theme, OR (B) one structural bug with root cause + verify + prevention. Toast/label/CSS one-liner alone does NOT clear. Fold outcomes into items; do not inflate fleet.\n";
// v30 — VERSION ARC DISCIPLINE (measured 2026-08-07 on kai-achilles + workflow-7).
// A task that says "ship 30 versions" under quality:max burns multi-M tokens, hits
// agent ceiling, fails render, and PARTIAL-ships while concurrent fleets thrash
// VERSION/CHANGELOG. That is not thoroughness — it is the wrong quality for volume.
fat_law += "VERSION ARC DISCIPLINE (v30): Do NOT plan one integer per micro-edit, and do NOT plan 10–30 empty/hollow stamps. Prefer fewer FAT packages. If the human asked for a multi-version arc, slice it: each RUN ships a small fat package; the NEXT run continues. quality:max is for a SMALL high-stakes list (items[] preferred, <=6 files), never for 'do the whole Arc D of 30'. Use lean/tiny for volume.\n";
fat_law += "TIP HONESTY (v30): VERSION_NUMBER, CHANGELOG tip, and HANDOFF tip trail must name the SAME integer. Never rewind VERSION. Never invent stamps 198–227 style empty fleet gaps. Prefer project tools/bump_version.py (and --allow-skip only when deliberate). Suite tools/run_suite.sh is the gate when the tree has it.\n";
fat_law += "THRASH RESISTANCE (v30): Never add import-time rewrites of server.py, _server_body exec splits, or tools/apply_arc_d*.py / _arc_d*.py that write_text server source. Native commits only. Shared lock with Claude must be respected — two fleets on one tree is double spend + silent overwrite.\n";

let lenses = [
    "CORRECTNESS — walk the logic; assume broken; prove edges, nulls, races.",
    "SAFETY & SCOPE — regressions, secrets, invariant breaks, scope creep beyond the instruction.",
    "REPRODUCE — trace the SPECIFIC failure claimed; confirm the change addresses that failure.",
];

let skeptic_floor = 1;
if max_q { skeptic_floor = 2; if lenses.len() < 2 { skeptic_floor = lenses.len(); } }

// Depth directive (Grok has one model family on this host — tier is HOW HARD, not which model)
fn tier_note(q) {
    if q == "max" {
        "QUALITY TIER: MAX — deepest reasoning, read real files end-to-end, RUN checks, prefer proven over plausible.\n"
    } else if q == "lean" || q == "tiny" {
        "QUALITY TIER: LEAN/TINY — every gate still blocks; be efficient but never unproven.\n"
    } else {
        "QUALITY TIER: STANDARD — shortest path to a SOUND answer; gates still block.\n"
    }
}

fn builder_cap(do_apply, do_isolate) {
    if do_apply {
        if do_isolate { "all" } else { "read-write" }
    } else {
        "read-only"
    }
}

// ---------- announce ----------
let mode_label = if apply_mode { "APPLY (agents edit files)" } else { "DRY-RUN (propose only, write nothing)" };
log("════════════════════════════════════════════════════════");
log("KONYO WORKFLOW · Grok Build IMPLEMENTER · quality=" + quality + (if quality_defaulted { " (default lean)" } else { "" }));
log("mode=" + mode_label + " · thirdEye=" + third_eye + " · isolate=" + isolate_mode.to_string() + " · push=" + do_push.to_string());
log("maxRounds=" + max_rounds.to_string() + " · maxAgents=" + max_agents.to_string() + " · maxItems=" + max_items_cap.to_string() + " · skepticFloor=" + skeptic_floor.to_string());
log("RENDERLOOP=" + render_loop_n.to_string() + " (v26 loop · v28 stop: PASSED|CEILING|STALLED) · SHIPPABLE=apply+passed>0+no spawn_errors (v27.1)");
log("Konyo-Grok · PACE+PROXY · FAT BAR · LAW18‖LAW19 concurrent · shared lock · v30 meter · v31 concurrent hop · v32 scar@failure · v33 capture/carve");
log("════════════════════════════════════════════════════════");
log("TASK: " + task);

// v30 — METER ROUTING WARNING (task-text heuristic, non-blocking but loud).
// "30 versions" + quality:max is the measured anti-pattern (workflow-7, 2026-08-07).
let task_lc = task.to_lower();
let looks_like_volume_arc = false;
if task_lc.contains("30 version") || task_lc.contains("30 real") || task_lc.contains("100 version") {
    looks_like_volume_arc = true;
}
if task_lc.contains("whole-console versions") || task_lc.contains("whole console versions") {
    looks_like_volume_arc = true;
}
if task_lc.contains("arc d of") || task_lc.contains("ship them all") || task_lc.contains("finish them all") {
    looks_like_volume_arc = true;
}
if looks_like_volume_arc {
    log("⚠ v30 METER ROUTING: this task reads like a MULTI-VERSION VOLUME arc.");
    if max_only {
        log("   quality=max is the expensive path. Prefer lean/tiny slices with items[], not one max fleet.");
        log("   This run will hard-cap items at " + max_items_cap.to_string() + " and report PARTIAL if more were planned.");
        log("   Measured: max + 30-version brief → 2h+, agent ceiling, render CEILING, thrash on VERSION.");
    } else {
        log("   quality=" + quality + " is appropriate for volume — keep each package FAT (LAW17), not 30 hollow stamps.");
    }
}
if max_only && force_run {
    log("⚠ v30: quality=max + force:true — triage cannot send this back to the main loop. Keep the item list SMALL.");
}

// v28 — PHASE_PLAN (Claude v22.2). List what will open vs skip UP FRONT so a
// skipped phase never reads as "still pending" on the status line.
let phase_open = ["Preflight"];
let phase_skip = [];
if tiny_q {
    phase_skip.push("Triage");
    phase_skip.push("Architect");
    phase_skip.push("Third-eye plan");
    phase_skip.push("Completeness");
    phase_skip.push("Synthesize agent");
} else {
    phase_open.push("Triage");
    if items_arg.len() > 0 {
        phase_skip.push("Architect (caller items[])");
    } else {
        phase_open.push("Architect");
    }
    if use_third_eye {
        phase_open.push("Third-eye");
    } else {
        phase_skip.push("Third-eye");
    }
}
phase_open.push("Build+Gate");
phase_open.push("Adversarial");
phase_open.push("Rework");
if isolate_mode { phase_open.push("Merge"); } else { phase_skip.push("Merge"); }
if max_only { phase_open.push("Completeness"); } else if !tiny_q { phase_skip.push("Completeness"); }
if apply_mode {
    phase_open.push("Render ‖ Reachability");
    phase_open.push("Fat version bar");
} else {
    phase_skip.push("Render gate (dry-run)");
    phase_skip.push("Fat version bar (dry-run)");
    phase_open.push("Reachability");
}
if apply_mode && do_push { phase_open.push("Ship"); } else { phase_skip.push("Ship (need apply+push)"); }
if !tiny_q { phase_open.push("Synthesize"); }
// Manual join — no reliance on Array::join across Rhai host versions.
let phase_open_s = "";
let _poi = 0;
while _poi < phase_open.len() {
    if _poi > 0 { phase_open_s += " → "; }
    phase_open_s += phase_open[_poi];
    _poi += 1;
}
let phase_skip_s = "";
let _psi = 0;
while _psi < phase_skip.len() {
    if _psi > 0 { phase_skip_s += ", "; }
    phase_skip_s += phase_skip[_psi];
    _psi += 1;
}
log("PHASES OPEN (" + phase_open.len().to_string() + "): " + phase_open_s);
log("   NOT OPENED (" + phase_skip.len().to_string() + ") — skipped, not pending: " + phase_skip_s);

// ═══════════════════════════════════════════════════════════════════════════
// 0) PREFLIGHT — workspace lock (apply only). SHARED dir with Claude Code so
// the two hosts exclude each other on the same tree.
// ═══════════════════════════════════════════════════════════════════════════
phase("Preflight");
let lock = #{};
let lock_acquired = false;
let lock_token = "";

if apply_mode {
    let lock_p = "WORKSPACE LOCK — acquire. Bash only, pure mechanics.\n";
    lock_p += "1. LOCKDIR=\"$HOME/.claude/workflows/.locks\"; mkdir -p \"$LOCKDIR\".\n";
    lock_p += "   (SHARED with Claude Code shippers — Grok and Claude fleets must exclude each other.)\n";
    lock_p += "2. TREE=`git rev-parse --show-toplevel 2>/dev/null` || TREE=`pwd -P`.\n";
    lock_p += "   REFUSE if TREE is $HOME or / or empty — never lock the home directory (that blocks every repo under it).\n";
    lock_p += "   If refuse: return acquired:false, key:refused-home, cwd:TREE, reason:lock-key-must-be-a-git-repo-not-home.\n";
    lock_p += "3. KEY=$TREE. Slugify: replace / with - , strip leading -. LOCKFILE=\"$LOCKDIR/<slug>.json\".\n";
    lock_p += "4. PURGE: NOW=$(date -u +%s). For each *.json, if expires_epoch < NOW (INTEGER test) delete it. Malformed = stale.\n";
    lock_p += "   Also purge locks whose cwd is exactly $HOME (toxic home-wide locks — they are never valid).\n";
    lock_p += "5. If LOCKFILE still exists: return acquired:false with holder_token/holder_since/holder_expires/holder_task. Do NOT overwrite.\n";
    lock_p += "   Parent-path locks (e.g. home) do NOT block this TREE — only the exact slug file does.\n";
    lock_p += "6. Else WRITE lock with token, started_at, expires_at, expires_epoch=NOW+" + lock_ttl_min.to_string() + "*60, cwd=$TREE, task snippet.\n";
    lock_p += "Return acquired, token, key, cwd, purged_stale. Touch nothing outside LOCKDIR.\n";
    lock_p += "Task snippet: " + json_encode(task.sub_string(0, if task.len() < 120 { task.len() } else { 120 }));
    let lock_r = agent(lock_p, #{
        label: "lock:acquire",
        phase: "Preflight",
        capability_mode: "execute",
        output_schema: lock_schema,
    });
    if lock_r != () && lock_r.success && lock_r.output != () {
        lock = as_map(lock_r.output);
        if lock.acquired == true {
            lock_acquired = true;
            if lock.token != () { lock_token = trimmed(lock.token); }
            log("🔒 Workspace lock taken" + (if lock.cwd != () { " on " + trimmed(lock.cwd) } else { "" }) + " (TTL " + lock_ttl_min.to_string() + "m).");
        } else {
            log("⛔ WORKSPACE LOCKED by another run.");
            if lock.holder_token != () { log("   holder: " + trimmed(lock.holder_token)); }
            if lock.holder_task != () { log("   task: " + trimmed(lock.holder_task)); }
            if !ignore_lock {
                complete(#{
                    verdict: "blocked",
                    ship_allowed: false,
                    shippable: false,
                    quality: quality,
                    mode: mode_label,
                    refused: "workspace locked by another run",
                    lock: lock,
                    fix: "wait, stop the holder, or pass {ignoreLock:true} if it is dead",
                    blockers: ["workspace locked"],
                });
            }
            log("⚠ {ignoreLock:true} — proceeding over a live lock. One of you may lose work.");
        }
    } else {
        log("⚠ Preflight lock could not be established — proceeding UNLOCKED.");
        if lock_r != () && !lock_r.success { spawn_errors.push("lock:acquire failed"); }
    }
} else {
    log("Preflight: dry-run writes nothing — no workspace lock.");
}

// dry-run + file-shaped deliverable → refuse (Claude lesson)
if !apply_mode {
    let tl = task.to_lower();
    let wants_file = false;
    // crude: write/create/save near file/.md, without a leading "do not"
    if tl.contains("write ") || tl.contains("create ") || tl.contains("save ") || tl.contains("edit ") {
        if tl.contains("file") || tl.contains(".md") || tl.contains(".py") || tl.contains(".rhai") || tl.contains(".js") {
            if !(tl.contains("do not") || tl.contains("don't") || tl.contains("without writing") || tl.contains("propose only")) {
                wants_file = true;
            }
        }
    }
    if wants_file {
        log("⛔ TRIAGE REFUSED: dry-run (apply:false) but task asks to write files.");
        log("   Re-run with {apply:true}, or ask for content in the RESULT instead of on disk.");
        complete(#{
            verdict: "blocked",
            ship_allowed: false,
            shippable: false,
            quality: quality,
            refused: "dry-run with a file-shaped deliverable",
            fix: "apply:true, or drop the file deliverable",
            blockers: ["dry-run cannot write files the task demands"],
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 0b) TINY REFUSAL — plan must already be in the brief
// ═══════════════════════════════════════════════════════════════════════════
if tiny_q {
    let bad = "";
    if items_arg.len() == 0 { bad = "no `items` array was passed"; }
    else if items_arg.len() > 4 { bad = items_arg.len().to_string() + " items — tiny caps at 4"; }
    else {
        let files_seen = [];
        let i = 0;
        while i < items_arg.len() {
            let it = as_map(items_arg[i]);
            if trimmed(it.file) == "" || trimmed(it.instruction) == "" {
                bad = "every item needs BOTH `file` and `instruction`";
            }
            let f = trimmed(it.file);
            let j = 0;
            let dupe = false;
            while j < files_seen.len() {
                if files_seen[j] == f { dupe = true; }
                j += 1;
            }
            if dupe { bad = "two items name the same file (" + f + ") — one owner per file"; }
            files_seen.push(f);
            i += 1;
        }
        if files_seen.len() > 3 { bad = files_seen.len().to_string() + " files — tiny caps at 3"; }
    }
    let tlow = task.to_lower();
    if bad == "" && (tlow.contains("investigate") || tlow.contains("figure out") || tlow.contains("find out why") || tlow.contains("diagnose") || tlow.contains("root cause")) {
        bad = "this reads as a DIAGNOSIS — serial work; drop quality:tiny or use lean";
    }
    if bad != "" {
        log("⛔ TINY REFUSED: " + bad);
        log("   {quality:\"tiny\", apply:true, items:[{file:\"/abs/path\", instruction:\"…\", risk:\"low\", anchor:\"~line N\"}]}");
        if lock_acquired && lock_token != "" {
            let rel_e3 = agent(
                "WORKSPACE LOCK — release. Bash only.\nLOCKDIR=\"$HOME/.claude/workflows/.locks\"\n" +
                "Find the file whose token is exactly " + json_encode(lock_token) + " and delete ONLY that file.\n" +
                "Return acquired:false, key:released.",
                #{ label: "lock:release-early", phase: "Preflight", capability_mode: "execute", output_schema: lock_schema });
            if rel_e3 != () && rel_e3.success { log("🔓 Workspace lock released (tiny-refuse bail)."); }
            lock_acquired = false;
        }
        complete(#{
            verdict: "blocked",
            ship_allowed: false,
            shippable: false,
            quality: quality,
            refused: "tiny brief unusable: " + bad,
            fix: "pass items:[{file,instruction}] within tiny bounds, or drop quality:tiny",
            blockers: [bad],
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 1) TRIAGE
// ═══════════════════════════════════════════════════════════════════════════
let triage = #{
    shape: "build",
    parallelism: "parallel",
    cost_of_wrong: "medium",
    tier: "light",
    est_agents: items_arg.len() + 3,
    skeptics: 0,
    work_list_known: tiny_q,
    why: if tiny_q { "quality=tiny — caller supplied work list; no triage agent bought" } else { "" },
    skeptics_asked: 0,
};

if !tiny_q {
    phase("Triage");
    let tri_p = tier_note(quality);
    tri_p += "You are TRIAGE for the KONYO WORKFLOW on Grok Build. Decide how much machinery this task deserves.\n";
    tri_p += "Rules: ONE root cause = serial (tier=direct). Known sweep list = parallel (tier=standard). Docs = light.\n";
    tri_p += "Skeptics ONLY when being wrong is expensive (money, security, silent arithmetic). Cosmetics get 0.\n";
    tri_p += "Recommending direct is a SUCCESS. Use tools if needed to ground the answer.\n\nTASK: " + task;
    let tri_r = agent(tri_p, #{
        label: "triage",
        phase: "Triage",
        capability_mode: "read-only",
        output_schema: triage_schema,
    });
    agents_spent += 1;
    if tri_r != () && tri_r.success && tri_r.output != () {
        triage = as_map(tri_r.output);
        if triage.skeptics == () { triage.skeptics = 0; }
        triage.skeptics_asked = triage.skeptics;
        log("TRIAGE → " + trimmed(triage.tier) + " · " + trimmed(triage.shape) + " · cost-of-wrong " + trimmed(triage.cost_of_wrong));
        log("  " + trimmed(triage.why));
        if trimmed(triage.tier) == "direct" && !force_run {
            log("⛔ TRIAGE SAYS DO THIS DIRECTLY — spawning nothing. Re-run with force:true to override.");
            // v28.1 — RELEASE THE LOCK ON EVERY EARLY EXIT. Workflow-5 took the lock,
            // bailed as direct, and left Users-konyo.json for 180 minutes — blocking
            // the next lean apply cold. complete() never reaches the bottom release.
            if lock_acquired && lock_token != "" {
                let rel_early = agent(
                    "WORKSPACE LOCK — release. Bash only.\nLOCKDIR=\"$HOME/.claude/workflows/.locks\"\n" +
                    "Find the file whose token is exactly " + json_encode(lock_token) + " and delete ONLY that file.\n" +
                    "Return acquired:false, key:released.",
                    #{ label: "lock:release-early", phase: "Triage", capability_mode: "execute", output_schema: lock_schema });
                if rel_early != () && rel_early.success { log("🔓 Workspace lock released (early bail)."); }
                else { log("⚠ Early lock release uncertain — TTL will expire it."); }
                lock_acquired = false;
            }
            complete(#{
                verdict: "not_run",
                ship_allowed: false,
                shippable: false,
                quality: quality,
                refused: "triage says direct",
                triage: triage,
                advice: "do it in the main session; a fleet would be slower and dearer",
                blockers: [],
            });
        }
    } else {
        log("⚠ triage agent failed — continuing with defaults (medium / parallel).");
        spawn_errors.push("triage failed");
        triage.why = "triage agent failed; defaults used";
        triage.skeptics_asked = 0;
        triage.skeptics = if max_q { 2 } else { 0 };
    }
} else {
    log("Triage SKIPPED (quality=tiny).");
}

// effective skeptic seat count
let seats_want = if max_q { lenses.len() } else { 0 };
if triage.skeptics != () {
    let ts = triage.skeptics;
    if type_of(ts) == "i64" || type_of(ts) == "int" || type_of(ts) == "f64" {
        seats_want = ts;
    }
}
if skeptics_override != () {
    seats_want = skeptics_override;
}
// floor when applying or at max_q, unless human explicitly asked 0
let human_zero = skeptics_override != () && skeptics_override == 0;
if !human_zero && apply_mode && seats_want < skeptic_floor {
    log("SKEPTIC FLOOR: asked " + seats_want.to_string() + " → seating " + skeptic_floor.to_string() + " (empty panel cannot refuse).");
    seats_want = skeptic_floor;
}
if seats_want > lenses.len() { seats_want = lenses.len(); }
if seats_want < 0 { seats_want = 0; }
log("Skeptics this run: " + seats_want.to_string() + " seat(s) · floor=" + skeptic_floor.to_string());

// ═══════════════════════════════════════════════════════════════════════════
// 2) ARCHITECT
// ═══════════════════════════════════════════════════════════════════════════
let plan = #{};
let plan_items = [];
let version_label = "v-unplanned";

// Explicit items[] skip the architect at EVERY quality (not only tiny).
// Measured: an architect handed a finished tree returns items:[] and the run
// dies as "empty plan". When the human already named the files, buy no opinion.
if tiny_q || items_arg.len() > 0 {
    phase("Architect");
    if tiny_q {
        log("ARCHITECT SKIPPED (quality=tiny) — plan from caller items.");
    } else {
        log("ARCHITECT SKIPPED — caller passed items[] (" + items_arg.len().to_string()
            + "); using that list as the plan (one owner per file checked below).");
    }
    let i = 0;
    while i < items_arg.len() {
        let it = as_map(items_arg[i]);
        let instr = trimmed(it.instruction);
        if it.anchor != () && trimmed(it.anchor) != "" {
            instr += "\n\nANCHOR (go straight here): " + trimmed(it.anchor);
        }
        plan_items.push(#{
            id: if it.id != () { trimmed(it.id) } else { "t" + (i + 1).to_string() },
            file: trimmed(it.file),
            kind: if it.kind != () { trimmed(it.kind) } else { "code" },
            tier: if it.tier != () { trimmed(it.tier) } else { "sonnet" },
            risk: if it.risk != () { trimmed(it.risk) } else { "low" },
            instruction: instr,
        });
        i += 1;
    }
    version_label = if a.versionLabel != () { trimmed(a.versionLabel) } else if a.version_label != () { trimmed(a.version_label) } else if tiny_q { "v-tiny-r1" } else { "v-items-r1" };
    plan = #{ version_label: version_label, summary: (if tiny_q { "tiny" } else { "caller-items" }) + " — " + plan_items.len().to_string() + " caller items", items: plan_items };
    // v30 — quality item cap also applies to caller items (except tiny already refused >4)
    if plan_items.len() > max_items_cap {
        log("v30 ITEM CAP on caller items[]: " + plan_items.len().to_string() + " → " + max_items_cap.to_string());
        let kept_c = [];
        let mc = 0;
        while mc < max_items_cap {
            kept_c.push(plan_items[mc]);
            mc += 1;
        }
        let tc = max_items_cap;
        while tc < plan_items.len() {
            let d = as_map(plan_items[tc]);
            trimmed_from_plan.push(trimmed(d.file));
            tc += 1;
        }
        plan_items = kept_c;
        plan.items = plan_items;
    }
} else {
    phase("Architect");
    let arch_p = tier_note(quality);
    arch_p += "You are the ARCHITECT for the KONYO WORKFLOW. Decompose into independent work items.\n";
    arch_p += "HARD: ONE OWNER PER FILE — no file appears twice.\n";
    arch_p += "Tag risk (low|medium|high). Ground paths with read/grep tools.\n";
    arch_p += fat_law;
    arch_p += "ITEM CAP THIS RUN: produce AT MOST " + max_items_cap.to_string()
        + " items (quality=" + quality + "). Fewer FAT items beat many thin ones.\n";
    if max_only {
        arch_p += "This is MAX quality — plan a SMALL high-stakes package, not a 10–30 stamp arc. "
            + "If the human asked for a huge arc, plan the FIRST fat slice and name the rest as follow_ups.\n";
    }
    if triage.est_agents != () {
        arch_p += "TRIAGE sized ~" + triage.est_agents.to_string() + " agents — produce AT MOST that many items (still <= item cap). Fewer larger items beat many thin ones.\n";
    }
    arch_p += "\nTASK: " + task;
    let arch_r = agent(arch_p, #{
        label: "architect",
        phase: "Architect",
        capability_mode: "read-only",
        output_schema: plan_schema,
    });
    agents_spent += 1;
    if arch_r == () || !arch_r.success || arch_r.output == () {
        spawn_errors.push("architect failed");
        blockers.push(#{ what: "no plan", why: "architect produced no usable plan" });
        complete(#{
            verdict: "blocked",
            ship_allowed: false,
            shippable: false,
            quality: quality,
            error: "no plan",
            blockers: blockers,
            agent_errors: spawn_errors,
        });
    }
    plan = as_map(arch_r.output);
    if plan.version_label != () { version_label = trimmed(plan.version_label); }
    plan_items = as_arr(plan.items);
    let raw_item_count = plan_items.len();
    log("Architect raw items: " + raw_item_count.to_string()
        + (if plan.summary != () { " · summary: " + trimmed(plan.summary).sub_string(0, if trimmed(plan.summary).len() < 160 { trimmed(plan.summary).len() } else { 160 }) } else { "" }));

    // CALLER ITEMS OUTRANK AN EMPTY ARCHITECT. Same law as tiny, available at every
    // quality: if you passed items:[{file,instruction}], that IS the plan when the
    // architect returns []. Measured 2026-08-07: a real apply:true run returned
    // items:[] because the lead had already sealed the work mid-flight — and the
    // shipper reported "empty plan after caps", which was a lie (caps never ran).
    if plan_items.len() == 0 && items_arg.len() > 0 {
        log("Architect returned 0 items — using caller items[] (" + items_arg.len().to_string() + ").");
        let ci = 0;
        while ci < items_arg.len() {
            let it = as_map(items_arg[ci]);
            let instr = trimmed(it.instruction);
            if it.anchor != () && trimmed(it.anchor) != "" {
                instr += "\n\nANCHOR: " + trimmed(it.anchor);
            }
            plan_items.push(#{
                id: if it.id != () { trimmed(it.id) } else { "c" + (ci + 1).to_string() },
                file: trimmed(it.file),
                kind: if it.kind != () { trimmed(it.kind) } else { "code" },
                tier: if it.tier != () { trimmed(it.tier) } else { "sonnet" },
                risk: if it.risk != () { trimmed(it.risk) } else { "medium" },
                instruction: instr,
            });
            ci += 1;
        }
        raw_item_count = plan_items.len();
    }

    // one-owner-per-file dedupe
    let seen = [];
    let deduped = [];
    let dropped_empty_file = 0;
    let i = 0;
    while i < plan_items.len() {
        let it = as_map(plan_items[i]);
        let f = trimmed(it.file);
        let hit = false;
        let j = 0;
        while j < seen.len() {
            if seen[j] == f { hit = true; }
            j += 1;
        }
        if f == "" {
            dropped_empty_file += 1;
        } else if !hit {
            seen.push(f);
            if it.risk == () { it.risk = "medium"; }
            if it.id == () { it.id = "i" + (i + 1).to_string(); }
            if it.instruction == () { it.instruction = ""; }
            deduped.push(it);
        }
        i += 1;
    }
    plan_items = deduped;
    if dropped_empty_file > 0 {
        log("⚠ dropped " + dropped_empty_file.to_string() + " item(s) with empty file path");
    }
    let after_dedupe = plan_items.len();

    // triage cap — coerce est_agents (schema may yield int; never silently use 0)
    if triage.est_agents != () {
        let cap = triage.est_agents;
        // if a string sneaks through, refuse to treat it as 0
        if type_of(cap) == "string" {
            log("⚠ triage.est_agents is a string (" + trimmed(cap) + ") — ignoring cap");
        } else {
            if cap < 1 { cap = 1; }
            if cap > 24 { cap = 24; }
            if plan_items.len() > cap {
                log("TRIAGE CAP: architect returned " + plan_items.len().to_string() + " items, trim to " + cap.to_string());
                let k = cap;
                while k < plan_items.len() {
                    let d = as_map(plan_items[k]);
                    trimmed_from_plan.push(trimmed(d.file));
                    k += 1;
                }
                let kept = [];
                let m = 0;
                while m < cap {
                    kept.push(plan_items[m]);
                    m += 1;
                }
                plan_items = kept;
            }
        }
    }
    // ceiling-aware item trim: each item costs 1 build + seats skeptics
    let per_item = 1 + seats_want;
    if per_item < 1 { per_item = 1; }
    let gate_cost = 5;
    let reserve_cost = 2;
    let room = max_agents - agents_spent - gate_cost - reserve_cost;
    if room < 1 { room = 1; }
    let room_for = room / per_item;
    if room_for < 1 { room_for = 1; }
    if plan_items.len() > room_for {
        log("CEILING: plan had " + plan_items.len().to_string() + " items; " + room_for.to_string() + " fit under cap once gates reserved.");
        let k = room_for;
        while k < plan_items.len() {
            let d = as_map(plan_items[k]);
            trimmed_from_plan.push(trimmed(d.file));
            k += 1;
        }
        let kept2 = [];
        let m2 = 0;
        while m2 < room_for {
            kept2.push(plan_items[m2]);
            m2 += 1;
        }
        plan_items = kept2;
    }
    // v30 — quality item cap (meter routing). Applied AFTER ceiling math so both
    // limits hold: agent budget AND "max is not a volume path".
    if plan_items.len() > max_items_cap {
        log("v30 ITEM CAP (quality=" + quality + "): plan had " + plan_items.len().to_string()
            + " items; keeping " + max_items_cap.to_string() + " (rest → follow-up / PARTIAL).");
        let k3 = max_items_cap;
        while k3 < plan_items.len() {
            let d3 = as_map(plan_items[k3]);
            trimmed_from_plan.push(trimmed(d3.file));
            k3 += 1;
        }
        let kept3 = [];
        let m3 = 0;
        while m3 < max_items_cap {
            kept3.push(plan_items[m3]);
            m3 += 1;
        }
        plan_items = kept3;
    }
    log("Plan \"" + version_label + "\": " + plan_items.len().to_string()
        + " item(s) (raw=" + raw_item_count.to_string()
        + " after_dedupe=" + after_dedupe.to_string()
        + " trimmed=" + trimmed_from_plan.len().to_string()
        + " maxItems=" + max_items_cap.to_string() + ").");
}

if plan_items.len() == 0 {
    // HONEST BRANCHES — never say "after caps" when caps never saw an item.
    let why = "";
    let err = "empty plan";
    if items_arg.len() > 0 {
        why = "caller items[] were present but none survived (empty file paths or dedupe) — fix items";
        err = "caller items unusable";
    } else if tiny_q {
        why = "tiny requires items:[{file,instruction}] and none survived";
        err = "tiny items empty";
    } else {
        // architect deliberately returned [] (often: work already done mid-flight)
        let sum = if plan.summary != () { trimmed(plan.summary) } else { "" };
        if sum != "" {
            why = "architect returned 0 items on purpose. summary: " + sum.sub_string(0, if sum.len() < 240 { sum.len() } else { 240 });
            err = "architect_noop";
        } else {
            why = "architect returned 0 items (not a cap trim — raw count was 0). Pass items:[{file,instruction}] or quality:\"tiny\" with a work list.";
            err = "architect_empty";
        }
    }
    log("⛔ EMPTY PLAN — " + why);
    blockers.push(#{ what: "empty plan", why: why });
    // v28.1 — release lock before complete() (same orphan bug as triage-direct bail)
    if lock_acquired && lock_token != "" {
        let rel_e2 = agent(
            "WORKSPACE LOCK — release. Bash only.\nLOCKDIR=\"$HOME/.claude/workflows/.locks\"\n" +
            "Find the file whose token is exactly " + json_encode(lock_token) + " and delete ONLY that file.\n" +
            "Return acquired:false, key:released.",
            #{ label: "lock:release-early", phase: "Architect", capability_mode: "execute", output_schema: lock_schema });
        if rel_e2 != () && rel_e2.success { log("🔓 Workspace lock released (empty-plan bail)."); }
        lock_acquired = false;
    }
    complete(#{
        verdict: if err == "architect_noop" { "already_complete_or_noop" } else { "blocked" },
        ship_allowed: false,
        shippable: false,
        quality: quality,
        error: err,
        fix: "Pass items:[{file,instruction}] (works at ANY quality now), or quality:\"tiny\" with the same list. Do not rely on the architect when the work list is already known.",
        architect_summary: if plan.summary != () { plan.summary } else { () },
        blockers: blockers,
    });
}

// feasibility announcement
let fable_extra = if max_q { 0 } else { 1 };
let worst = agents_spent + plan_items.len() * (1 + fable_extra + seats_want) * max_rounds + 5 + 2;
log("FEASIBILITY → ~" + worst.to_string() + " agents worst-case vs ceiling " + max_agents.to_string()
    + " · itemCap=" + max_items_cap.to_string() + " (v30 quality routing)");
if worst > max_agents {
    log("⚠ PLAN CANNOT FULLY FINISH inside ceiling — will do most valuable work first and report PARTIAL.");
}
if looks_like_volume_arc && max_only {
    log("⚠ v30: volume-arc task under MAX — expect PARTIAL; schedule remaining stamps as lean follow-ups.");
}

// ═══════════════════════════════════════════════════════════════════════════
// 3) THIRD-EYE plan seat (Claude CLI on Grok host)
// ═══════════════════════════════════════════════════════════════════════════
if use_third_eye && !tiny_q {
    phase("Third-eye");
    let plan_lines = "";
    let pi = 0;
    while pi < plan_items.len() {
        let it = as_map(plan_items[pi]);
        plan_lines += "- [" + trimmed(it.risk) + "] " + trimmed(it.file) + ": " + trimmed(it.instruction) + "\n";
        pi += 1;
    }
    let q_plan = "You are the independent second opinion on an implementation plan. Different model family from the planner.\n\nTASK:\n" + task + "\n\nPLAN:\n" + plan_lines + "\nWhat is wrong? Top 3 concerns, or say plainly you have none. Empty agreement is worthless.";
    if third_eye == "claude" {
        let te_p = "THIRD EYE transport — call Claude CLI (different model family). Bash only.\n";
        te_p += "Run: claude -p --model opus --output-format text " + json_encode(q_plan) + "\n";
        te_p += "If claude is missing or fails, return acquired:false-style note in your text and say transport_down.\n";
        te_p += "Return the Claude reply verbatim as your final answer (plain text is fine).";
        // Use a simple agent that shells out
        let te_r = agent(te_p, #{
            label: "third-eye:plan:claude",
            phase: "Third-eye",
            capability_mode: "execute",
        });
        agents_spent += 1;
        if te_r != () && te_r.success {
            let ans = if type_of(te_r.output) == "string" { te_r.output } else { json_encode(te_r.output) };
            third_eye_seats.push(#{ seat: "plan", transport: "claude-cli", spoke: true, answer: ans.sub_string(0, if ans.len() < 2000 { ans.len() } else { 2000 }) });
            log("Third-eye (Claude) spoke on the plan.");
        } else {
            third_eye_seats.push(#{ seat: "plan", transport: "claude-cli", spoke: false, answer: "" });
            spawn_errors.push("third-eye plan seat empty");
            log("⚠ Third-eye plan seat EMPTY — Claude did not answer. Seat reported empty, never filled by Grok.");
        }
    } else {
        // same-family degraded
        let te_r2 = agent("SAME-FAMILY stand-in third eye (LABELLED degraded). " + q_plan, #{
            label: "third-eye:plan:grok-standin",
            phase: "Third-eye",
            capability_mode: "read-only",
        });
        agents_spent += 1;
        third_eye_seats.push(#{ seat: "plan", transport: "grok-same-family", spoke: te_r2 != () && te_r2.success, answer: "degraded stand-in" });
        log("Third-eye ran as SAME-FAMILY Grok stand-in (thirdEye:\"grok\") — not an independent eye.");
    }
} else if tiny_q {
    log("Third-eye PLAN seat SKIPPED (tiny — caller is the plan). Diff seats still run via skeptics.");
} else {
    log("Third-eye OFF.");
}

// ═══════════════════════════════════════════════════════════════════════════
// 4) BUILD + GATE
// ═══════════════════════════════════════════════════════════════════════════
phase("Build+Gate");
log("PHASES OPEN: Preflight → " + (if tiny_q { "" } else { "Triage → Architect → " }) + (if use_third_eye && !tiny_q { "Third-eye → " } else { "" }) + "Build+Gate → Adversarial → …");

let build_jobs = [];
let bi = 0;
while bi < plan_items.len() {
    let it = as_map(plan_items[bi]);
    let f = trimmed(it.file);
    let act = "";
    if !apply_mode {
        act = "Do NOT write anything. Return the change as a unified diff in \"changes\". patch=\"\".";
    } else if isolate_mode {
        act = "You are in an ISOLATED git worktree. Edit ONLY " + f + ". Then: git add -A && git diff --cached. Return COMPLETE unified diff in \"patch\". NEVER push. NEVER commit to main.";
    } else {
        act = "Make the edit directly to " + f + ". Touch NO other file. ⛔ NEVER git push. Commit only if the task asks; pushing is FORBIDDEN — ship blockers run AFTER you.";
    }
    let bp = tier_note(quality);
    bp += "KONYO BUILD agent. quality=" + quality + ".\n";
    bp += "You own exactly ONE file: " + f + "\n";
    bp += "Instruction: " + trimmed(it.instruction) + "\n";
    bp += act + "\n";
    bp += "In self_check state what you verified. files_touched = every path you created/edited/deleted.\n";
    bp += "Task context: " + task + craft_rules;
    let job = #{
        prompt: bp,
        label: "build:" + f,
        phase: "Build+Gate",
        capability_mode: builder_cap(apply_mode, isolate_mode),
        output_schema: build_schema,
    };
    if isolate_mode { job.isolation_worktree = true; }
    build_jobs.push(job);
    bi += 1;
}

let build_results_raw = parallel(build_jobs);
agents_spent += build_jobs.len();

// attach items; run ownership self-report + skeptic panel per item
let results = [];
let ri = 0;
while ri < plan_items.len() {
    let it = as_map(plan_items[ri]);
    let br = if ri < build_results_raw.len() { build_results_raw[ri] } else { () };
    let build_out = #{};
    let build_ok = false;
    if br != () && br.success && br.output != () {
        build_out = as_map(br.output);
        build_ok = true;
    } else {
        spawn_errors.push("build failed: " + trimmed(it.file));
    }

    // Adversarial panel (or single fable-style gate at standard with 0 seats handled below)
    let refuted = 0;
    let cast = 0;
    let gate_verdict = "pass";
    let gate_reason = "no skeptics seated — nothing refuted";
    let gate_sev = "none";

    if !build_ok {
        gate_verdict = "rework";
        gate_sev = "blocking";
        gate_reason = "build agent produced no output";
    } else if seats_want > 0 {
        phase("Adversarial gate");
        let sjobs = [];
        let si = 0;
        while si < seats_want {
            let lens = lenses[si];
            let sp = tier_note(quality);
            sp += "SKEPTIC LENS: " + lens + "\n";
            sp += "You try to REFUTE this change. refute=true only with concrete evidence you inspected.\n";
            sp += "File: " + trimmed(it.file) + "\nInstruction: " + trimmed(it.instruction) + "\n";
            sp += "Builder summary: " + trimmed(build_out.summary) + "\nChanges:\n" + trimmed(build_out.changes) + "\n";
            if build_out.patch != () { sp += "Patch:\n" + trimmed(build_out.patch).sub_string(0, 4000) + "\n"; }
            sp += "Task: " + task + "\nUse read tools on the real tree. Default refute=false if unproven.";
            sjobs.push(#{
                prompt: sp,
                label: "skeptic:" + si.to_string() + ":" + trimmed(it.file),
                phase: "Adversarial gate",
                capability_mode: "read-only",
                output_schema: skeptic_schema,
            });
            si += 1;
        }
        let sres = parallel(sjobs);
        agents_spent += sjobs.len();
        let sj = 0;
        while sj < sres.len() {
            let sr = sres[sj];
            if sr != () && sr.success && sr.output != () {
                cast += 1;
                let so = as_map(sr.output);
                if so.refute == true && so.evidence != () && trimmed(so.evidence) != "" {
                    refuted += 1;
                    if gate_reason == "no skeptics seated — nothing refuted" || gate_verdict == "pass" {
                        gate_reason = trimmed(so.issue);
                        gate_sev = if so.severity != () { trimmed(so.severity) } else { "major" };
                    }
                }
            }
            sj += 1;
        }
        if cast < seats_want {
            thin_panels.push(#{ file: trimmed(it.file), cast: cast, panel: seats_want });
        }
        // majority refute: refuted * 2 > cast
        if cast == 0 {
            gate_verdict = "rework";
            gate_sev = "blocking";
            gate_reason = "skeptic panel cast zero votes — gate did not run";
            blockers.push(#{ what: "empty skeptic panel", why: trimmed(it.file) });
        } else if refuted * 2 > cast {
            gate_verdict = "rework";
            if gate_sev == "none" { gate_sev = "major"; }
        } else {
            gate_verdict = "pass";
            gate_reason = "panel did not majority-refute (" + refuted.to_string() + "/" + cast.to_string() + " refute)";
            gate_sev = "none";
        }
    } else if apply_mode && !max_q {
        // standard with 0 skeptics: single correctness gate
        let gp = "MERGE GATE. File: " + trimmed(it.file) + "\nInstruction: " + trimmed(it.instruction) + "\n";
        gp += "Summary: " + trimmed(build_out.summary) + "\nChanges:\n" + trimmed(build_out.changes) + "\n";
        gp += "verdict=pass only if merge-ready and ownership respected. Run git status if apply mode.\nTask: " + task;
        let gr = agent(gp, #{
            label: "gate:" + trimmed(it.file),
            phase: "Build+Gate",
            capability_mode: "read-only",
            output_schema: gate_schema,
        });
        agents_spent += 1;
        if gr != () && gr.success && gr.output != () {
            let gate_out = as_map(gr.output);
            gate_verdict = if gate_out.verdict != () { trimmed(gate_out.verdict) } else { "rework" };
            gate_reason = if gate_out.reason != () { trimmed(gate_out.reason) } else { "" };
            gate_sev = if gate_out.severity != () { trimmed(gate_out.severity) } else { "minor" };
        } else {
            gate_verdict = "rework";
            gate_sev = "major";
            gate_reason = "gate agent failed";
        }
    }

    results.push(#{
        item: it,
        build: build_out,
        build_ok: build_ok,
        gate: #{ verdict: gate_verdict, severity: gate_sev, reason: gate_reason, refuted: refuted, cast: cast },
    });
    log("  " + trimmed(it.file) + " → build=" + build_ok.to_string() + " gate=" + gate_verdict + " (" + gate_reason.sub_string(0, if gate_reason.len() < 80 { gate_reason.len() } else { 80 }) + ")");
    // v33 CAPTURE — round-1 refusals land in the run ledger before rework.
    if gate_verdict != "pass" {
        record_run_scar(1, trimmed(it.file), "gate", gate_sev, gate_reason);
    }
    ri += 1;
}
if run_scars.len() > 0 {
    log("v33 CAPTURE: " + run_scars.len().to_string() + " gate refusal(s) recorded after build round 1.");
}

// ═══════════════════════════════════════════════════════════════════════════
// 5) REWORK
// ═══════════════════════════════════════════════════════════════════════════
let rework_round = 0;
while rework_round < max_rounds {
    let need = [];
    let qi = 0;
    while qi < results.len() {
        let r = as_map(results[qi]);
        let g = as_map(r.gate);
        if trimmed(g.verdict) != "pass" {
            need.push(qi);
        }
        qi += 1;
    }
    if need.len() == 0 { break; }
    rework_round += 1;
    phase("Rework");
    log("REWORK round " + rework_round.to_string() + " — " + need.len().to_string() + " item(s).");
    let rjobs = [];
    let ni = 0;
    while ni < need.len() {
        let idx = need[ni];
        let r = as_map(results[idx]);
        let it = as_map(r.item);
        let g = as_map(r.gate);
        let f = trimmed(it.file);
        let act = if !apply_mode {
            "Do NOT write. Return unified diff in changes."
        } else {
            "Edit ONLY " + f + ". NEVER push. Address EVERY gate failure."
        };
        let rp = tier_note(quality);
        // v33 — own failure + sibling failures from this run (scar brief).
        rp += "REWORK agent. Previous gate: " + trimmed(g.reason) + "\n";
        rp += scar_brief_for(f);
        rp += "File: " + f + "\nInstruction: " + trimmed(it.instruction) + "\n" + act + craft_rules;
        let job = #{
            prompt: rp,
            label: "rework:" + f,
            phase: "Rework",
            capability_mode: builder_cap(apply_mode, isolate_mode),
            output_schema: build_schema,
        };
        if isolate_mode { job.isolation_worktree = true; }
        rjobs.push(job);
        ni += 1;
    }
    let rraw = parallel(rjobs);
    agents_spent += rjobs.len();
    let nj = 0;
    while nj < need.len() {
        let idx = need[nj];
        let r = as_map(results[idx]);
        let it = as_map(r.item);
        let br = if nj < rraw.len() { rraw[nj] } else { () };
        if br != () && br.success && br.output != () {
            r.build = as_map(br.output);
            r.build_ok = true;
            // re-gate with one correctness skeptic for speed
            let sp = "REWORK GATE. refute=true only with evidence. File: " + trimmed(it.file) + "\n";
            sp += "Instruction: " + trimmed(it.instruction) + "\nSummary: " + trimmed(r.build.summary) + "\n";
            sp += "Changes:\n" + trimmed(r.build.changes);
            let sr = agent(sp, #{
                label: "rework-gate:" + trimmed(it.file),
                phase: "Rework",
                capability_mode: "read-only",
                output_schema: skeptic_schema,
            });
            agents_spent += 1;
            if sr != () && sr.success && sr.output != () {
                let so = as_map(sr.output);
                if so.refute == true {
                    r.gate = #{ verdict: "rework", severity: "major", reason: trimmed(so.issue), refuted: 1, cast: 1 };
                } else {
                    r.gate = #{ verdict: "pass", severity: "none", reason: "rework accepted", refuted: 0, cast: 1 };
                }
            } else {
                r.gate = #{ verdict: "pass", severity: "none", reason: "rework gate empty — fail-open only after rework build ok", refuted: 0, cast: 0 };
            }
            results[idx] = r;
            // v33 CAPTURE this rework round's still-failing gates
            let gg = as_map(r.gate);
            if trimmed(gg.verdict) != "pass" {
                record_run_scar(rework_round + 1, trimmed(it.file), "rework-gate",
                    trimmed(gg.severity), trimmed(gg.reason));
            }
        }
        nj += 1;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6) MERGE (isolate only)
// ═══════════════════════════════════════════════════════════════════════════
let merge = #{ ran: false, reason: "no isolate" };
if isolate_mode {
    phase("Merge");
    let patches = "";
    let pcount = 0;
    let mi = 0;
    while mi < results.len() {
        let r = as_map(results[mi]);
        let g = as_map(r.gate);
        let b = as_map(r.build);
        let it = as_map(r.item);
        if trimmed(g.verdict) == "pass" {
            if b.patch != () && trimmed(b.patch) != "" {
                pcount += 1;
                patches += "--- PATCH " + pcount.to_string() + " · " + trimmed(it.file) + " ---\n" + trimmed(b.patch) + "\n\n";
            } else {
                blockers.push(#{ what: "MERGE: WORK LOST — NO PATCH", why: trimmed(it.file) });
            }
        }
        mi += 1;
    }
    if pcount == 0 {
        log("MERGE: nothing to apply.");
        merge = #{ ran: true, applied: [], failed: [], notes: "no patches" };
    } else {
        let mp = "MERGE AGENT. You are in the REAL repo. Apply patches IN ORDER:\n";
        mp += "1. Write patch to temp file\n2. git apply --check FIRST — on fail, record and skip\n3. git apply if check passes\n";
        mp += "Never commit, never push, never reset.\n\nPATCHES:\n" + patches;
        let mr = agent(mp, #{
            label: "merge",
            phase: "Merge",
            capability_mode: "all",
            output_schema: #{
                "type": "object",
                "required": ["applied", "failed", "notes"],
                "properties": #{
                    "applied": #{ "type": "array", "maxItems": 60, "items": #{ "type": "string" } },
                    "failed": #{ "type": "array", "maxItems": 60, "items": #{ "type": "string" } },
                    "notes": #{ "type": "string" },
                },
            },
        });
        agents_spent += 1;
        if mr != () && mr.success && mr.output != () {
            merge = as_map(mr.output);
            merge.ran = true;
            if merge.failed != () && as_arr(merge.failed).len() > 0 {
                blockers.push(#{ what: "MERGE FAILED", why: json_encode(merge.failed) });
            }
        } else {
            blockers.push(#{ what: "MERGE AGENT DID NOT RUN", why: pcount.to_string() + " patches not applied" });
            merge = #{ ran: false, reason: "merge agent died" };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7) COMPLETENESS (max only)
// ═══════════════════════════════════════════════════════════════════════════
let completeness = #{
    ran: false,
    reason: if max_only { "" } else { "quality=" + quality + " — completeness critic not bought" },
    rounds: 0,
    wentDry: false,
};
if max_only && apply_mode {
    phase("Completeness");
    let dry = 0;
    let crit_round = 0;
    let owned = [];
    let oi = 0;
    while oi < plan_items.len() {
        let it = as_map(plan_items[oi]);
        owned.push(trimmed(it.file));
        oi += 1;
    }
    while dry < dry_rounds && crit_round < 6 {
        crit_round += 1;
        let done_lines = "";
        let di = 0;
        while di < results.len() {
            let r = as_map(results[di]);
            let g = as_map(r.gate);
            let it = as_map(r.item);
            let b = as_map(r.build);
            if trimmed(g.verdict) == "pass" {
                done_lines += "- " + trimmed(it.file) + ": " + trimmed(b.summary) + "\n";
            }
            di += 1;
        }
        let cp = tier_note(quality);
        cp += "COMPLETENESS CRITIC. What did nobody plan that the task still needs?\n";
        cp += "TASK: " + task + "\nDONE:\n" + done_lines + "\n";
        cp += "Return done=true if nothing material is missing. Else missing[{file,instruction}] for NEW files only.\n";
        let cr = agent(cp, #{
            label: "completeness:" + crit_round.to_string(),
            phase: "Completeness",
            capability_mode: "read-only",
            output_schema: missing_schema,
        });
        agents_spent += 1;
        if cr == () || !cr.success || cr.output == () {
            log("Completeness critic failed round " + crit_round.to_string());
            break;
        }
        let co = as_map(cr.output);
        if co.done == true {
            dry += 1;
            log("Completeness dry " + dry.to_string() + "/" + dry_rounds.to_string());
        } else {
            let miss = as_arr(co.missing);
            let new_n = 0;
            let mi = 0;
            while mi < miss.len() {
                let m = as_map(miss[mi]);
                let f = trimmed(m.file);
                let already = false;
                let oj = 0;
                while oj < owned.len() {
                    if owned[oj] == f { already = true; }
                    oj += 1;
                }
                if already {
                    unbuilt_gaps.push(f + " (already owned — still reported broken)");
                } else if f != "" {
                    owned.push(f);
                    new_n += 1;
                    // one-shot build of gap
                    let gap_it = #{ id: "gap" + crit_round.to_string(), file: f, instruction: trimmed(m.instruction), risk: "medium", tier: "sonnet" };
                    let gp = tier_note(quality) + "GAP BUILD. File: " + f + "\n" + trimmed(m.instruction) + "\n" + (if apply_mode { "Edit the file. NEVER push." } else { "Propose diff only." }) + craft_rules;
                    let gjob = #{ prompt: gp, label: "gap-build:" + f, phase: "Completeness", capability_mode: builder_cap(apply_mode, isolate_mode), output_schema: build_schema };
                    let gr = agent(gp, gjob);
                    agents_spent += 1;
                    let bout = #{};
                    let bok = false;
                    if gr != () && gr.success && gr.output != () { bout = as_map(gr.output); bok = true; }
                    results.push(#{
                        item: gap_it,
                        build: bout,
                        build_ok: bok,
                        gate: #{ verdict: if bok { "pass" } else { "rework" }, severity: if bok { "none" } else { "major" }, reason: "gap build", refuted: 0, cast: 0 },
                    });
                }
                mi += 1;
            }
            if new_n == 0 { dry += 1; } else { dry = 0; }
        }
    }
    completeness = #{
        ran: true,
        rounds: crit_round,
        wentDry: dry >= dry_rounds,
        unbuiltGaps: unbuilt_gaps,
        reason: "",
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 8) RENDER ‖ REACHABILITY (v31) + FAT BAR (LAW17)
// Claude v22: LAW19 and the render gate share NOTHING — chaining them wasted
// ~4 minutes wall-clock every run. Rhai has no fire-and-forget spawn (parallel
// is a barrier of option maps, one agent each), so v31 runs LAW19 ‖ FIRST
// render pass in one hop; the fix/re-render loop stays serial after. Fat bar
// stays downstream: its prompt may read render failures.
// ═══════════════════════════════════════════════════════════════════════════
let render_gate = #{ available: false, pass: true, reason: "not run", evidence: "", failures: [], screenshots: [], notes: "" };
// v28 stop_reason: PASSED | CEILING | STALLED | N/A | not_run
// CEILING = hit pass limit, failure still changing → more room or human.
// STALLED = same failure unchanged across passes → stop and change approach.
// Folding both into "didn't work" is how the next hour goes into the version that cannot work.
let render_loop = #{ passes: 0, fixes: 0, converged: false, stopped: "not run", stop_reason: "not_run", last_failures_sig: "", concurrent_with_law19: false };
let fat_bar = #{ pass: false, reason: "not run", evidence: "" };
let reach = #{ pass: false, reason: "not run", evidence: "", checked: 0, dead: [], tests_added: false, tests_proven_run: false };

// LAW19 prompt — shared by concurrent hop and dry-run serial path.
let rch_p = "LAW19 REACHABILITY. Every symbol this change ADDED must have a caller AND a writer.\n";
rch_p += "Prefer execution to grep. If tests were added, prove they RAN (names in output).\n";
rch_p += "1) List every SYMBOL the change introduced (functions, handlers, state slots, routes, CSS classes referenced by code).\n";
rch_p += "2) For each, find CALLER and WRITER. Read-but-never-written is dead. Defined-but-unwired is dead.\n";
rch_p += "3) PREFER EXECUTION TO GREP. Grep alone cannot tell live cross-file from dead.\n";
rch_p += "4) IF TESTS WERE ADDED: prove they RAN (suite count before/after or names in verbose output). Green suite alone is not evidence your tests are in it.\n";
rch_p += "5) Report only seams you verified as dead. Do NOT fix anything. Report.\n";
rch_p += "pass=true only with evidence. dead[] empty when nothing is unreachable. tests_proven_run=false if tests_added and not proven.\n";
rch_p += "TASK: " + task + "\nUse git diff and the real tree.\n" + craft_rules;

if apply_mode {
    phase("Render ‖ Reachability");
    // ══ v26 · THE RENDER GATE IS A LOOP, NOT A VERDICT ═══════════════════════════════════════
    // Restored after the implementer rewrite dropped it. FINAL pass is what blocks — the loop
    // buys attempts, never a free pass. Fixer rule #1: FIX THE CODE, NEVER THE ASSERTION.
    let rg_base = "LAW18 PAINTED-UI PROOF for KONYO WORKFLOW (v26 multi-width + look).\n";
    rg_base += "0) CI FIRST — if `.github/workflows` drives a browser, read `gh run list` / failed logs before spawning chromium.\n";
    rg_base += "1) Else drive the project's own UI verify (playwright/cypress/test:render). Never edit a test to green it. Never invent a pass.\n";
    rg_base += "2) available=false is honest when there is NO UI tooling — that is NOT a painted pass; set pass=false when tooling is missing but UI clearly changed.\n";
    rg_base += "3) VISUAL LAYER — DOM queries are necessary and NOT sufficient. Screenshot + geometry:\n";
    rg_base += "   (a) key elements boundingBox width>0 AND height>0; (b) no text clipped; (c) no horizontal overflow;\n";
    rg_base += "   (d) text colour ≠ background; (e) no sibling panel overlap.\n";
    rg_base += "4) RENDER AT MORE THAN ONE WIDTH — narrow AND wide (e.g. 1280x900 and 1920x1200). A layout bug that\n";
    rg_base += "   only exists at one width is invisible to a single viewport. Report width beside every failure.\n";
    rg_base += "5) LOOK AT THE PICTURES when art/icons/thumbnails changed — say in words what each depicts vs claims.\n";
    rg_base += "   matches:false is a BLOCKER. Empty images[] requires images_na_reason or the gate is not done.\n";
    rg_base += "6) SAVE screenshots to absolute paths in screenshots[]. pass=true ONLY with evidence.\n";
    rg_base += "Never bind ports the user uses. TASK: " + task + "\n" + craft_rules;

    let rl_done = false;
    let render_failures = [];
    let render_screenshots = [];
    let render_notes = "";
    let render_available = false;
    let render_passed = false;
    let last_rp = 0;
    let images_na_reason = "";
    let images_opened = [];

    // ── v31 · FIRST RENDER ‖ LAW19 in one parallel hop ─────────────────────────────────────
    log("v31 CONCURRENT HOP: LAW19 ‖ first render pass (Claude v22 wall-clock; fix loop serial after).");
    render_loop.concurrent_with_law19 = true;
    render_loop.passes = 1;
    last_rp = 1;
    let gate_jobs = [
        #{
            prompt: rch_p,
            label: "law19:reachability",
            phase: "Reachability",
            capability_mode: "execute",
            output_schema: reach_schema,
        },
        #{
            prompt: rg_base,
            label: "law18:render-1",
            phase: "Render gate",
            capability_mode: "execute",
            output_schema: render_schema,
        },
    ];
    let gate_raw = parallel(gate_jobs);
    agents_spent += 2;

    // Absorb LAW19 (index 0)
    let rch = if gate_raw.len() > 0 { gate_raw[0] } else { () };
    if rch != () && rch.success && rch.output != () {
        reach = as_map(rch.output);
        let dead = as_arr(reach.dead);
        let tests_added = reach.tests_added == true;
        let tests_run = reach.tests_proven_run == true;
        if dead.len() > 0 {
            reach.pass = false;
            blockers.push(#{ what: "LAW19 reachability", why: dead.len().to_string() + " dead seam(s): " + trimmed(reach.reason) });
            log("⛔ REACHABILITY FAILED — " + dead.len().to_string() + " dead seam(s). SHIP BLOCKER.");
        } else if tests_added && !tests_run {
            reach.pass = false;
            blockers.push(#{ what: "LAW19 reachability", why: "tests were added and were not proven to run" });
            log("⛔ REACHABILITY FAILED — tests added, not proven to run. SHIP BLOCKER.");
        } else if reach.pass != true {
            blockers.push(#{ what: "LAW19 reachability", why: trimmed(reach.reason) });
            log("⛔ REACHABILITY FAILED — " + trimmed(reach.reason));
        } else {
            let checked_s = "?";
            if reach.checked != () { checked_s = reach.checked.to_string(); }
            log("✅ Reachability: concurrent hop returned pass (checked=" + checked_s + ").");
        }
    } else {
        reach = #{ pass: false, reason: "reachability agent failed — fail closed", evidence: "", checked: 0, dead: [], tests_added: false, tests_proven_run: false };
        blockers.push(#{ what: "LAW19 reachability", why: "agent failed" });
        spawn_errors.push("reachability failed");
        log("⛔ REACHABILITY agent failed in concurrent hop — fail closed.");
    }

    // Absorb first render (index 1)
    let rr = if gate_raw.len() > 1 { gate_raw[1] } else { () };
    if rr != () && rr.success && rr.output != () {
        let out = as_map(rr.output);
        let p = out.pass;
        if p == () { p = out.passed; }
        render_available = out.available == true;
        render_passed = p == true;
        render_failures = as_arr(out.failures);
        render_screenshots = as_arr(out.screenshots);
        render_notes = trimmed(out.notes);
        if render_notes == "" { render_notes = trimmed(out.reason); }
        images_na_reason = trimmed(out.images_na_reason);
        images_opened = as_arr(out.images);
        let ii = 0;
        while ii < images_opened.len() {
            let im = as_map(images_opened[ii]);
            if im.matches == false {
                render_failures.push("wrong image: " + trimmed(im.surface) + " claims " + trimmed(im.claims) + " depicts " + trimmed(im.depicts));
                render_passed = false;
            }
            ii += 1;
        }
        render_gate = #{
            available: render_available,
            pass: render_passed,
            reason: if render_notes != "" { render_notes } else { trimmed(out.reason) },
            evidence: trimmed(out.evidence),
            failures: render_failures,
            screenshots: render_screenshots,
            notes: render_notes,
            images: images_opened,
            images_na_reason: images_na_reason,
        };
    } else {
        render_available = true;
        render_passed = false;
        render_failures = ["render gate agent failed — nothing was seen painted"];
        render_gate = #{ available: true, pass: false, reason: "render agent failed", evidence: "agent failed", failures: render_failures, screenshots: [], notes: "" };
        spawn_errors.push("render gate pass 1 failed");
    }

    // Decide whether pass 1 ends the loop
    let fail_sig = json_encode(render_failures);
    if !render_available {
        render_loop.stopped = "no UI verification in this project";
        render_loop.stop_reason = "N/A";
        render_loop.converged = true;
        rl_done = true;
    } else if render_passed {
        render_loop.stopped = "clean on the first render";
        render_loop.stop_reason = "PASSED";
        render_loop.converged = true;
        rl_done = true;
        log("✅ RENDER LOOP PASSED on concurrent first pass.");
    } else if rl_plan.len() <= 1 {
        render_loop.stop_reason = "CEILING";
        render_loop.stopped = "CEILING after 1 pass — still failing";
        rl_done = true;
        log("⛔ RENDER LOOP CEILING — " + render_loop.stopped);
    } else if agents_spent >= max_agents - 4 {
        render_loop.stop_reason = "CEILING";
        render_loop.stopped = "CEILING — agent budget reserved for fat bar (" + agents_spent.to_string() + "/" + max_agents.to_string() + ")";
        rl_done = true;
        log("⚠ RENDER LOOP STOPPED: " + render_loop.stopped);
    } else {
        // Need correction — enter serial fix loop from pass 2
        render_loop.last_failures_sig = fail_sig;
        log("🔁 RENDER LOOP pass 1/" + render_loop_n.to_string() + " failed with " + render_failures.len().to_string() + " failure(s) — correcting (serial after concurrent hop).");
        let fx_p = "RENDER FIX — pass 1 of " + render_loop_n.to_string() + ".\n";
        fx_p += "The render gate LOOKED at this UI and found the failures below. Fix them in the CODE.\n";
        fx_p += "FAILURES (may name viewport width) — name each one in words; a silent check cannot detect stall:\n" + json_encode(render_failures) + "\n";
        fx_p += "SCREENSHOTS — OPEN THEM:\n" + json_encode(render_screenshots) + "\n";
        fx_p += "GATE NOTES: " + render_notes + "\n";
        fx_p += "RULES (what keeps this loop honest):\n";
        fx_p += "· FIX THE CODE, NEVER THE ASSERTION. Weakening a check is the one failure mode a self-correcting loop introduces. If the GATE is wrong, change NOTHING — list it in unfixable[].\n";
        fx_p += "· DIAGNOSE BEFORE EDITING. A one-width layout failure usually lives a step up the tree.\n";
        fx_p += "· STAY IN SCOPE. No drive-by refactor. NEVER git push. NEVER bump a version.\n";
        fx_p += "· Honest unfixable[] beats a fake fix that costs the next render pass AND trust.\n";
        fx_p += "TASK: " + task + "\n" + craft_rules;
        let fx = agent(fx_p, #{
            label: "law18:fix-1",
            phase: "Render gate",
            capability_mode: "all",
            output_schema: fix_schema,
        });
        agents_spent += 1;
        let fx_changed = false;
        if fx != () && fx.success && fx.output != () {
            let fo = as_map(fx.output);
            if fo.changed == true { fx_changed = true; }
            render_notes = trimmed(fo.what);
            let unf = as_arr(fo.unfixable);
            let ui = 0;
            while ui < unf.len() {
                log("   ↳ not fixed: " + trimmed(unf[ui]));
                ui += 1;
            }
            if fx_changed { log("   ↳ fixed: " + render_notes); }
        } else {
            spawn_errors.push("render fix pass 1 failed");
        }
        if fx_changed {
            render_loop.fixes = render_loop.fixes + 1;
        } else {
            render_loop.stop_reason = "STALLED";
            render_loop.stopped = "STALLED — the fixer changed nothing; re-rendering would print the same result";
            log("⚠ RENDER LOOP STALLED: " + render_loop.stopped);
            rl_done = true;
        }
    }

    // Serial re-render passes 2..N (only when pass 1 was dirty and fixer made progress)
    if !rl_done {
        for rp in rl_plan {
            if !rl_done && rp > 1 {
                last_rp = rp;
                render_loop.passes = rp;
                let pre = "RE-RENDER — PASS " + rp.to_string() + " of " + render_loop_n.to_string() + ".\n";
                pre += "A fixer has just edited the code. Report what you SEE NOW. Do NOT assume the fix worked.\n";
                pre += "Do NOT soften assertions. Re-check failed surfaces AND previously green ones (fixes break neighbours).\n";
                pre += "Previous failures (untrusted): " + json_encode(render_failures) + "\n";
                pre += "Last fixer note: " + render_notes + "\n\n";
                let rg_full = pre + rg_base;
                let rr2 = agent(rg_full, #{
                    label: "law18:render-" + rp.to_string(),
                    phase: "Render gate",
                    capability_mode: "execute",
                    output_schema: render_schema,
                });
                agents_spent += 1;

                if rr2 != () && rr2.success && rr2.output != () {
                    let out = as_map(rr2.output);
                    let p = out.pass;
                    if p == () { p = out.passed; }
                    render_available = out.available == true;
                    render_passed = p == true;
                    render_failures = as_arr(out.failures);
                    render_screenshots = as_arr(out.screenshots);
                    render_notes = trimmed(out.notes);
                    if render_notes == "" { render_notes = trimmed(out.reason); }
                    images_na_reason = trimmed(out.images_na_reason);
                    images_opened = as_arr(out.images);
                    let ii = 0;
                    while ii < images_opened.len() {
                        let im = as_map(images_opened[ii]);
                        if im.matches == false {
                            render_failures.push("wrong image: " + trimmed(im.surface) + " claims " + trimmed(im.claims) + " depicts " + trimmed(im.depicts));
                            render_passed = false;
                        }
                        ii += 1;
                    }
                    render_gate = #{
                        available: render_available,
                        pass: render_passed,
                        reason: if render_notes != "" { render_notes } else { trimmed(out.reason) },
                        evidence: trimmed(out.evidence),
                        failures: render_failures,
                        screenshots: render_screenshots,
                        notes: render_notes,
                        images: images_opened,
                        images_na_reason: images_na_reason,
                    };
                } else {
                    render_available = true;
                    render_passed = false;
                    render_failures = ["render gate agent failed — nothing was seen painted"];
                    render_gate = #{ available: true, pass: false, reason: "render agent failed", evidence: "agent failed", failures: render_failures, screenshots: [], notes: "" };
                    spawn_errors.push("render gate pass " + rp.to_string() + " failed");
                }

                let fail_sig2 = json_encode(render_failures);
                if !render_available {
                    render_loop.stopped = "no UI verification in this project";
                    render_loop.stop_reason = "N/A";
                    render_loop.converged = true;
                    rl_done = true;
                } else if render_passed {
                    render_loop.stopped = "clean after " + (rp - 1).to_string() + " correction(s)";
                    render_loop.stop_reason = "PASSED";
                    render_loop.converged = true;
                    log("✅ RENDER LOOP PASSED on pass " + rp.to_string());
                    rl_done = true;
                } else if rp == rl_plan[rl_plan.len() - 1] {
                    let prior = render_loop.last_failures_sig;
                    if prior != "" && prior == fail_sig2 {
                        render_loop.stop_reason = "STALLED";
                        render_loop.stopped = "STALLED after " + render_loop_n.to_string() + " pass(es) — same failure unchanged; stop and change approach";
                    } else {
                        render_loop.stop_reason = "CEILING";
                        render_loop.stopped = "CEILING after " + render_loop_n.to_string() + " pass(es) — still failing; failure may still be changing";
                    }
                    log("⛔ RENDER LOOP " + render_loop.stop_reason + " — " + render_loop.stopped);
                    rl_done = true;
                } else if agents_spent >= max_agents - 4 {
                    render_loop.stop_reason = "CEILING";
                    render_loop.stopped = "CEILING — agent budget reserved for fat bar (" + agents_spent.to_string() + "/" + max_agents.to_string() + ")";
                    log("⚠ RENDER LOOP STOPPED: " + render_loop.stopped);
                    rl_done = true;
                } else if render_loop.last_failures_sig != "" && render_loop.last_failures_sig == fail_sig2 {
                    render_loop.stop_reason = "STALLED";
                    render_loop.stopped = "STALLED — identical failures after a correction pass; stop and change approach";
                    log("⚠ RENDER LOOP STALLED: " + render_loop.stopped);
                    rl_done = true;
                } else {
                    render_loop.last_failures_sig = fail_sig2;
                    log("🔁 RENDER LOOP pass " + rp.to_string() + "/" + render_loop_n.to_string() + " failed with " + render_failures.len().to_string() + " failure(s) — correcting.");
                    let fx_p = "RENDER FIX — pass " + rp.to_string() + " of " + render_loop_n.to_string() + ".\n";
                    fx_p += "The render gate LOOKED at this UI and found the failures below. Fix them in the CODE.\n";
                    fx_p += "FAILURES (may name viewport width) — name each one in words; a silent check cannot detect stall:\n" + json_encode(render_failures) + "\n";
                    fx_p += "SCREENSHOTS — OPEN THEM:\n" + json_encode(render_screenshots) + "\n";
                    fx_p += "GATE NOTES: " + render_notes + "\n";
                    fx_p += "RULES (what keeps this loop honest):\n";
                    fx_p += "· FIX THE CODE, NEVER THE ASSERTION. Weakening a check is the one failure mode a self-correcting loop introduces. If the GATE is wrong, change NOTHING — list it in unfixable[].\n";
                    fx_p += "· DIAGNOSE BEFORE EDITING. A one-width layout failure usually lives a step up the tree.\n";
                    fx_p += "· STAY IN SCOPE. No drive-by refactor. NEVER git push. NEVER bump a version.\n";
                    fx_p += "· Honest unfixable[] beats a fake fix that costs the next render pass AND trust.\n";
                    fx_p += "TASK: " + task + "\n" + craft_rules;
                    let fx = agent(fx_p, #{
                        label: "law18:fix-" + rp.to_string(),
                        phase: "Render gate",
                        capability_mode: "all",
                        output_schema: fix_schema,
                    });
                    agents_spent += 1;
                    let fx_changed = false;
                    if fx != () && fx.success && fx.output != () {
                        let fo = as_map(fx.output);
                        if fo.changed == true { fx_changed = true; }
                        render_notes = trimmed(fo.what);
                        let unf = as_arr(fo.unfixable);
                        let ui = 0;
                        while ui < unf.len() {
                            log("   ↳ not fixed: " + trimmed(unf[ui]));
                            ui += 1;
                        }
                        if fx_changed { log("   ↳ fixed: " + render_notes); }
                    } else {
                        spawn_errors.push("render fix pass " + rp.to_string() + " failed");
                    }
                    if fx_changed {
                        render_loop.fixes = render_loop.fixes + 1;
                    } else {
                        render_loop.stop_reason = "STALLED";
                        render_loop.stopped = "STALLED — the fixer changed nothing; re-rendering would print the same result";
                        log("⚠ RENDER LOOP STALLED: " + render_loop.stopped);
                        rl_done = true;
                    }
                }
            }
        }
    }
    log("🔁 Render loop: " + render_loop.passes.to_string() + " pass(es), " + render_loop.fixes.to_string() + " correction(s) · stop_reason=" + render_loop.stop_reason + " — " + render_loop.stopped);

    // FINAL pass is what blocks (same as Claude wiring).
    if render_available && !render_passed {
        blockers.push(#{ what: "LAW18 render gate", why: render_loop.stopped + " · " + render_failures.len().to_string() + " failure(s)" });
        log("⛔ RENDER GATE FAILED — SHIP BLOCKER.");
    } else if !render_available {
        log("⚠ RENDER GATE: available=false — nothing was seen painted (not a painted pass).");
    } else {
        log("✅ Render gate passed (" + render_loop.stopped + ").");
    }

    // v31 / Claude v15 — FAIL CLOSED ON "NOBODY LOOKED".
    // Empty images[] with no images_na_reason used to read as "fine". A picture of the wrong
    // thing passes every geometry assertion; silence cannot be allowed to mean "checked".
    if render_available {
        let wrong_n = 0;
        let wi = 0;
        while wi < images_opened.len() {
            let im = as_map(images_opened[wi]);
            if im.matches == false { wrong_n += 1; }
            wi += 1;
        }
        if wrong_n > 0 {
            // already folded into render_failures / pass=false; name the IMAGE blocker explicitly (Claude v15)
            blockers.push(#{ what: "IMAGE SHOWS THE WRONG THING", why: wrong_n.to_string() + " image surface(s) depict something other than their label" });
        } else if images_opened.len() == 0 && images_na_reason == "" {
            blockers.push(#{ what: "NO IMAGE WAS EVER OPENED", why: "render gate inspected zero image surfaces and gave no images_na_reason — nobody looked cannot read as fine" });
            log("⛔ NO IMAGE WAS EVER OPENED — SHIP BLOCKER (v31 / Claude v15 fail-closed).");
            render_passed = false;
            render_gate.pass = false;
        } else if images_opened.len() > 0 {
            log("✅ Images inspected: " + images_opened.len().to_string() + " surface(s).");
        }
        if render_screenshots.len() > 0 {
            log("   📸 " + render_screenshots.len().to_string() + " screenshot(s) captured.");
        } else if render_available {
            log("   ⚠ NO SCREENSHOT CAPTURED — this pass may be DOM-only.");
        }
    }

    phase("Fat version bar");
    let fp = fat_law + "\nAudit the ACTUAL diff/work against LAW17.\nTASK: " + task + "\nPlan version_label: " + version_label + "\n";
    fp += "pass=true only if fat package OR structural bug with root cause+verify+prevention.\n";
    if render_failures.len() > 0 {
        fp += "Render gate failures (context, do not invent fatness from them): " + json_encode(render_failures) + "\n";
    }
    let fr = agent(fp, #{
        label: "law17:fat",
        phase: "Fat version bar",
        capability_mode: "read-only",
        output_schema: law_schema,
    });
    agents_spent += 1;
    if fr != () && fr.success && fr.output != () {
        fat_bar = as_map(fr.output);
        if fat_bar.pass != true {
            blockers.push(#{ what: "LAW17 fat version bar", why: trimmed(fat_bar.reason) });
        }
    } else {
        fat_bar = #{ pass: false, reason: "fat-bar agent failed — fail closed", evidence: "" };
        blockers.push(#{ what: "LAW17 fat version bar", why: "agent failed" });
        spawn_errors.push("fat-bar failed");
    }
} else {
    // Dry-run: no paint loop; still run LAW19 alone (serial).
    phase("Reachability");
    let rch = agent(rch_p, #{
        label: "law19:reachability",
        phase: "Reachability",
        capability_mode: "read-only",
        output_schema: reach_schema,
    });
    agents_spent += 1;
    if rch != () && rch.success && rch.output != () {
        reach = as_map(rch.output);
        let dead = as_arr(reach.dead);
        let tests_added = reach.tests_added == true;
        let tests_run = reach.tests_proven_run == true;
        if dead.len() > 0 {
            reach.pass = false;
            blockers.push(#{ what: "LAW19 reachability", why: dead.len().to_string() + " dead seam(s): " + trimmed(reach.reason) });
        } else if tests_added && !tests_run {
            reach.pass = false;
            blockers.push(#{ what: "LAW19 reachability", why: "tests were added and were not proven to run" });
        } else if reach.pass != true {
            blockers.push(#{ what: "LAW19 reachability", why: trimmed(reach.reason) });
        } else {
            log("✅ Reachability (dry-run): pass.");
        }
    } else {
        reach = #{ pass: false, reason: "reachability agent failed — fail closed", evidence: "", checked: 0, dead: [], tests_added: false, tests_proven_run: false };
        blockers.push(#{ what: "LAW19 reachability", why: "agent failed" });
        spawn_errors.push("reachability failed");
    }
}

// // tally + ship
// ═══════════════════════════════════════════════════════════════════════════
let passed_n = 0;
let failed_n = 0;
let shipped_files = [];
let ti = 0;
while ti < results.len() {
    let r = as_map(results[ti]);
    let g = as_map(r.gate);
    let it = as_map(r.item);
    if trimmed(g.verdict) == "pass" {
        passed_n += 1;
        shipped_files.push(trimmed(it.file));
    } else {
        failed_n += 1;
    }
    ti += 1;
}

// Parity with Claude v27.1 — the WHOLE predicate (do not shorten to the first line):
//   · apply:true required (dry-run proposed diffs is never "ready to push")
//   · passed_n > 0 (empty fleet used to be SHIPPABLE because failed=[] is vacuously true)
//   · spawn_errors empty (a dead agent is missing work, not a green skip)
//   · thin_panels empty (seats bought ≠ votes cast)
//   · max completeness went dry when it ran
let shippable = apply_mode
    && blockers.len() == 0
    && failed_n == 0
    && passed_n > 0
    && !ceiling_hit
    && trimmed_from_plan.len() == 0
    && spawn_errors.len() == 0
    && thin_panels.len() == 0;
if max_only && completeness.ran == true && completeness.wentDry != true {
    shippable = false;
}

let shipped = #{ ran: false, reason: "not attempted" };
if apply_mode && do_push {
    phase("Ship");
    if shippable {
        let sp = "SHIP PHASE. Every gate passed. Push the current branch to origin.\n";
        sp += "RULES: never --force, never --no-verify, never rewrite history.\n";
        sp += "If there is nothing to push, say so. Prove remote moved with git status -sb and git log origin/.. if possible.\n";
        sp += "Do NOT commit new work — only push existing commits.\n";
        let sr = agent(sp, #{
            label: "ship:push",
            phase: "Ship",
            capability_mode: "all",
        });
        agents_spent += 1;
        if sr != () && sr.success {
            shipped = #{ ran: true, reason: "push agent completed", detail: if type_of(sr.output) == "string" { sr.output.sub_string(0, 500) } else { "ok" } };
        } else {
            shipped = #{ ran: false, reason: "push agent failed" };
            blockers.push(#{ what: "ship push failed", why: "push agent did not succeed" });
            shippable = false;
        }
    } else {
        log("Ship SKIPPED — not shippable (blockers or failed items).");
        shipped = #{ ran: false, reason: "not shippable" };
    }
} else if apply_mode {
    log("Ship phase idle — pass {push:true} to push after a clean shippable verdict. Builders never push.");
    shipped = #{ ran: false, reason: "push not requested (default). pass {push:true} when ready." };
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNTHESIZE + lock release
// ═══════════════════════════════════════════════════════════════════════════
// v33 — compute carve candidates BEFORE synthesize so the seal prompt can be
// surgical (open carving-skill only when non-empty).
let carve_out = carve_candidates();
phase("Synthesize");
let final = #{
    version_label: version_label,
    headline: "",
    shipped: shipped_files,
    follow_ups: [],
};
if !tiny_q {
    let syn_p = "Write the ONE final ping for this KONYO run.\n";
    syn_p += "quality=" + quality + " apply=" + apply_mode.to_string() + " shippable=" + shippable.to_string() + "\n";
    syn_p += "passed=" + passed_n.to_string() + " failed=" + failed_n.to_string() + " blockers=" + blockers.len().to_string() + "\n";
    syn_p += "version_label=" + version_label + "\nTASK: " + task + "\n";
    syn_p += "If this run earned a LEARNED scar, say so and require EVIDENCE from the run; never claim founding rules changed.\n";
    syn_p += "SCARS (v32): scars should already have been written AT each costly failure mid-run (one per distinct failure), not invented only here. At seal ask 'did I record the ones I hit?' — print any remaining scar blocks ready to paste; if none, say no scar. Never claim a scar was saved.\n";
    syn_p += "CARVING (surgical): invoke carving-skill ONLY if carve_candidates is non-empty (floor 3 scars in one territory) OR SCARS.md already has 3+ learned entries in one named territory. If neither, say 'no carve this run' — do not run carving-skill by default.\n";
    syn_p += "SKILL ROUTING: list which specialist skills this run actually used and why; do not claim a full skill stack was loaded.\n";
    syn_p += "If render_loop stop_reason is STALLED vs CEILING, name which in the headline (opposite responses).\n";
    syn_p += "Return version_label, headline (one line), shipped[], follow_ups[].";
    syn_p += "\ncarve_candidates_count=" + carve_out.len().to_string() + "\n";
    if carve_out.len() > 0 {
        syn_p += "carve_candidates_json=" + json_encode(carve_out) + "\n";
        syn_p += "ACTION: recommend carving-skill for each territory above (propose only — do not auto-write skills mid-fleet unless the human asked).\n";
    } else {
        syn_p += "carve_candidates empty — do NOT open carving-skill this seal.\n";
    }
    let syn = agent(syn_p, #{
        label: "synthesize",
        phase: "Synthesize",
        capability_mode: "read-only",
        output_schema: final_schema,
    });
    agents_spent += 1;
    if syn != () && syn.success && syn.output != () {
        final = as_map(syn.output);
    }
} else {
    final.headline = "tiny run: " + passed_n.to_string() + " passed / " + failed_n.to_string() + " failed · shippable=" + shippable.to_string();
}

// release lock
if lock_acquired && lock_token != "" {
    let rel_p = "WORKSPACE LOCK — release. Bash only.\n";
    rel_p += "LOCKDIR=\"$HOME/.claude/workflows/.locks\"\n";
    rel_p += "Find the file whose token field is exactly " + json_encode(lock_token) + " and delete ONLY that file.\n";
    rel_p += "Return acquired:false, key:released or key:not-ours.";
    let rel = agent(rel_p, #{
        label: "lock:release",
        phase: "Synthesize",
        capability_mode: "execute",
        output_schema: lock_schema,
    });
    agents_spent += 1;
    if rel != () && rel.success { log("🔓 Workspace lock released."); }
    else { log("⚠ Lock release uncertain — TTL will expire it."); }
}

// verdict ladder
let verdict = "OK";
if blockers.len() > 0 { verdict = "BLOCKED — see blockers[]"; }
else if ceiling_hit { verdict = "UNVERIFIED — agent ceiling"; }
else if trimmed_from_plan.len() > 0 { verdict = "PARTIAL — items trimmed to fit ceiling"; }
else if failed_n > 0 { verdict = "INCOMPLETE — " + failed_n.to_string() + " item(s) never passed"; }
else if spawn_errors.len() > 0 { verdict = "DEGRADED — some agents died"; }
else if thin_panels.len() > 0 { verdict = "DEGRADED — thin skeptic panel(s)"; }
else if max_only && completeness.ran == true && completeness.wentDry != true {
    verdict = "UNVERIFIED — completeness never went dry";
}

let quality_label = "";
if tiny_q {
    quality_label = "TINY (every ship gate · no triage/architect/completeness · " + seats_want.to_string() + "-skeptic panel)";
} else if lean_q {
    quality_label = "LEAN (every MAX gate · one architect · " + seats_want.to_string() + "-skeptic · no completeness critic)";
} else if max_only {
    quality_label = "MAX (deep · completeness critic · " + seats_want.to_string() + "-skeptic · multi-round rework)";
} else {
    quality_label = "STANDARD (cost-scaled · fable-style gate · " + seats_want.to_string() + "-skeptic)";
}

// report
let md = "# Konyo Workflow — Grok Build implementer\n\n";
md += "**Task:** " + task + "\n\n";
md += "**Quality:** `" + quality + "` — " + quality_label + "\n\n";
md += "**Mode:** " + mode_label + "\n\n";
md += "**Verdict:** " + verdict + "\n\n";
md += "**Shippable:** " + shippable.to_string() + "\n\n";
md += "**Version label:** " + version_label + "\n\n";
md += "**Passed / failed:** " + passed_n.to_string() + " / " + failed_n.to_string() + "\n\n";
md += "**Agents spent:** " + agents_spent.to_string() + " / cap " + max_agents.to_string() + "\n\n";
md += "## Headline\n" + trimmed(final.headline) + "\n\n";
md += "## Blockers\n";
if blockers.len() == 0 { md += "_(none)_\n"; }
let bi2 = 0;
while bi2 < blockers.len() {
    let b = as_map(blockers[bi2]);
    md += "- **" + trimmed(b.what) + "**: " + trimmed(b.why) + "\n";
    bi2 += 1;
}
md += "\n## Files\n";
let fi = 0;
while fi < results.len() {
    let r = as_map(results[fi]);
    let it = as_map(r.item);
    let g = as_map(r.gate);
    md += "- `" + trimmed(it.file) + "` → **" + trimmed(g.verdict) + "** — " + trimmed(g.reason) + "\n";
    fi += 1;
}
md += "\n## Gates\n";
md += "- LAW17 fat: " + json_encode(fat_bar) + "\n";
md += "- LAW18 render: " + json_encode(render_gate) + "\n";
md += "- LAW19 reach: " + json_encode(reach) + "\n";
md += "\n## Third eye\n";
md += "- requested: " + third_eye + "\n";
md += "- seats: " + third_eye_seats.len().to_string() + "\n";
md += "\n## Completeness\n" + json_encode(completeness) + "\n";
md += "\n## Ship\n" + json_encode(shipped) + "\n";
// v33 — run-capture ledger + carve candidates (already computed pre-synthesize)
md += "\n## Run scars (v33 capture-per-round)\n";
md += "- count: " + run_scars.len().to_string() + "\n";
md += "- ledger: " + json_encode(run_scars) + "\n";
md += "\n## Carve candidates (v33 — PROPOSE only, floor 3; never applied mid-run)\n";
if carve_out.len() == 0 {
    md += "_(none — need ≥3 scars in one territory)_\n";
} else {
    md += json_encode(carve_out) + "\n";
    md += "\n_These are proposals for a later carving-skill pass. They never skip a gate._\n";
}
md += "\n_Konyo-Grok · Grok implementer · parity Claude JS v31 capture/carve + concurrent LAW19‖render · v26–v33 · v30 meter · v32 scar@failure + run-not-inspect · audit-only body retired 2026-08-07_\n";

let report_path = write_scratch_file("konyo-report.md", md);

log("════════════════════════════════════════════════════════");
log("VERDICT: " + verdict);
log("SHIPPABLE: " + shippable.to_string() + " · passed " + passed_n.to_string() + " · failed " + failed_n.to_string() + " · blockers " + blockers.len().to_string());
log("v33 CAPTURE: " + run_scars.len().to_string() + " scar(s) · carve candidates: " + carve_out.len().to_string());
log("Report: " + report_path);
log("════════════════════════════════════════════════════════");

complete(#{
    path: report_path,
    report: md,
    quality: quality,
    quality_label: quality_label,
    mode: mode_label,
    apply: apply_mode,
    version: version_label,
    verdict: verdict,
    ship_allowed: shippable,
    shippable: shippable,
    shipped: shipped,
    passed: passed_n,
    failed: failed_n,
    scars: run_scars,
    carve_candidates: carve_out,
    blockers: blockers,
    agent_errors: spawn_errors,
    agents_spent: agents_spent,
    ceiling: #{ cap: max_agents, spent: agents_spent, hit: ceiling_hit, trimmedFromPlan: trimmed_from_plan },
    triage: triage,
    completeness: completeness,
    render_gate: render_gate,
    render_loop: render_loop,
    fat_version: fat_bar,
    reachability: reach,
    safeguards: #{
        v26_render_loop: true,
        v27_items_any_quality: true,
        v27_1_shippable_apply_and_passed: true,
        shippable_requires_no_spawn_errors: true,
        shippable_requires_no_thin_panels: true,
        architect_noop_honest: true,
        builders_never_push: true,
        v28_pace_and_proxy: true,
        v28_phase_plan: true,
        v28_render_stop_passed_ceiling_stalled: true,
        v28_1_early_lock_release: true,
        v29_scar_founding_vs_learned: true,
        v29_scar_evidence_required: true,
        v29_scar_undo_snapshot: true,
        v32_scar_record_at_failure: true,
        v32_scar_one_per_distinct_failure: true,
        v32_run_not_inspect: true,
        v30_meter_routing: true,
        v30_item_cap_by_quality: true,
        v30_max_not_for_volume_arcs: true,
        v30_tip_honesty_and_thrash: true,
        v31_render_law19_concurrent_first_hop: true,
        v31_images_na_fail_closed: true,
        v31_reach_rich_schema: true,
    },
    thin_panels: thin_panels,
    thin_panel_count: thin_panels.len(),
    max_items_cap: max_items_cap,
    volume_arc_heuristic: looks_like_volume_arc,
    phase_plan: #{ open: phase_open, skip: phase_skip },
    merge: merge,
    thirdEye: #{
        requested: third_eye,
        seats: third_eye_seats,
        note: if third_eye == "off" { "third eye off" } else if third_eye == "claude" { "Claude CLI (different family)" } else { "Grok same-family stand-in (degraded)" },
    },
    final: final,
    results: results,
    host: "grok-build",
    implementer: true,
    retired_audit_only: true,
});
