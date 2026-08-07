let meta = #{
    name: "konyo-workflow",
    description: "KONYO WORKFLOW for Grok Build — FULL IMPLEMENTER (not audit-only). ONE body, four qualities (lean|max|standard|tiny). LEAN is the default: every ship gate runs (adversarial panel, LAW17/18/19, workspace lock, agent ceiling) while max buys a multi-architect panel, completeness critic, and deeper rework. Pass {apply:true} to edit files; apply:false is dry-run (propose only). Third eye is Claude (different family) via the claude CLI — never a same-family stand-in unless thirdEye:\"claude\". Pass {task, quality, apply, force, items, skeptics, isolate, thirdEye, maxAgents, ignoreLock, push}. items:[{file,instruction}] skips the architect at ANY quality (not only tiny) — empty architect plans no longer die as \"after caps\".",
    when_to_use: "ANY multi-step ship on Grok Build. Bare call = lean + dry-run. {apply:true} to write. {quality:\"max\"} when being wrong is expensive. {quality:\"tiny\", apply:true, items:[{file,instruction}]} for a known small edit set. {quality:\"standard\"} for the cheap ladder. Parity target: Claude Code konyo-workflow.js (v26+).",
    phases: [
        #{ title: "Preflight", detail: "workspace lock when apply:true — shared lock dir with Claude so fleets exclude each other" },
        #{ title: "Triage", detail: "right-size before spending; SKIPPED at tiny" },
        #{ title: "Architect", detail: "one-owner-per-file plan; multi-architect at max; SKIPPED when caller passes items[] or quality tiny" },
        #{ title: "Third-eye", detail: "Claude (different family) reviews the plan before builders spend" },
        #{ title: "Build+Gate", detail: "builders write when apply:true; one owner per file; patch carrier when isolate" },
        #{ title: "Adversarial gate", detail: "diverse-lens skeptics ARE the gate (floor 2 at max/lean when applying)" },
        #{ title: "Rework", detail: "failed items get one more attempt (max keeps two)" },
        #{ title: "Merge", detail: "only with {isolate:true}: sequential git apply --check of patches" },
        #{ title: "Completeness", detail: "max ONLY — hunt work nobody planned; lean/tiny/standard report skipped" },
        #{ title: "Render gate", detail: "LAW18 painted-UI proof when UI exists; blocker when available" },
        #{ title: "Fat version bar", detail: "LAW17 — fat package or structural bug; thin ship blocks" },
        #{ title: "Reachability", detail: "LAW19 — added symbols have caller AND writer; tests proven to RUN" },
        #{ title: "Ship", detail: "push ONLY if shippable and {push:true}; never --force / --no-verify" },
        #{ title: "Synthesize", detail: "ONE final ping report" },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// KONYO WORKFLOW — Grok Build implementer
// Parity with ~/.claude/workflows/konyo-workflow.js (lean default, apply mode,
// army, skeptic gate, LAW17/18/19). Previous Grok rhai was AUDIT-ONLY; that
// body is preserved as konyo-workflow.rhai.bak-audit-only-2026-08-07.
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

let max_agents = 24;
if a.maxAgents != () { max_agents = a.maxAgents; }
if a.max_agents != () { max_agents = a.max_agents; }

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

let fat_law = "FAT VERSION LAW (LAW17): ONE version packages real work — (A) >=3 user-visible outcomes in one theme, OR (B) one structural bug with root cause + verify + prevention. Toast/label/CSS one-liner alone does NOT clear. Fold outcomes into items; do not inflate fleet.\n";

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
log("maxRounds=" + max_rounds.to_string() + " · maxAgents=" + max_agents.to_string() + " · skepticFloor=" + skeptic_floor.to_string());
log("FAT BAR enforced · LAW18 render · LAW19 reachability · shared workspace lock with Claude");
log("════════════════════════════════════════════════════════");
log("TASK: " + task);

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
    lock_p += "2. KEY=`pwd -P`. Slugify: replace / with - , strip leading -. LOCKFILE=\"$LOCKDIR/<slug>.json\".\n";
    lock_p += "3. PURGE: NOW=$(date -u +%s). For each *.json, if expires_epoch < NOW (INTEGER test) delete it. Malformed = stale.\n";
    lock_p += "4. If LOCKFILE still exists: return acquired:false with holder_token/holder_since/holder_expires/holder_task. Do NOT overwrite.\n";
    lock_p += "5. Else WRITE lock with token, started_at, expires_at, expires_epoch=NOW+" + lock_ttl_min.to_string() + "*60, cwd, task snippet.\n";
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
} else {
    phase("Architect");
    let arch_p = tier_note(quality);
    arch_p += "You are the ARCHITECT for the KONYO WORKFLOW. Decompose into independent work items.\n";
    arch_p += "HARD: ONE OWNER PER FILE — no file appears twice.\n";
    arch_p += "Tag risk (low|medium|high). Ground paths with read/grep tools.\n";
    arch_p += fat_law;
    if triage.est_agents != () {
        arch_p += "TRIAGE sized ~" + triage.est_agents.to_string() + " agents — produce AT MOST that many items (cap 24). Fewer larger items beat many thin ones.\n";
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
    log("Plan \"" + version_label + "\": " + plan_items.len().to_string()
        + " item(s) (raw=" + raw_item_count.to_string()
        + " after_dedupe=" + after_dedupe.to_string()
        + " trimmed=" + trimmed_from_plan.len().to_string() + ").");
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
log("FEASIBILITY → ~" + worst.to_string() + " agents worst-case vs ceiling " + max_agents.to_string());
if worst > max_agents {
    log("⚠ PLAN CANNOT FULLY FINISH inside ceiling — will do most valuable work first and report PARTIAL.");
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
    ri += 1;
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
        rp += "REWORK agent. Previous gate: " + trimmed(g.reason) + "\n";
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
// 8) RENDER GATE (LAW18) + FAT BAR (LAW17) + REACHABILITY (LAW19)
// ═══════════════════════════════════════════════════════════════════════════
let render_gate = #{ available: false, pass: true, reason: "not run", evidence: "" };
let fat_bar = #{ pass: false, reason: "not run", evidence: "" };
let reach = #{ pass: false, reason: "not run", evidence: "" };

if apply_mode {
    phase("Render gate");
    let rp = "LAW18 PAINTED-UI PROOF for KONYO WORKFLOW.\n";
    rp += "1) If the project has CI UI gates, read `gh run list` / failed logs — report that verdict.\n";
    rp += "2) Else if the project can drive its own UI, do so without binding ports the user uses.\n";
    rp += "3) available=false is honest when there is no UI tooling — do NOT invent a pass.\n";
    rp += "4) pass=true only with evidence. Screenshots paths in evidence if any.\n";
    rp += "TASK: " + task + "\nWhat changed: list from git status/diff if needed.\n";
    let rr = agent(rp, #{
        label: "law18:render",
        phase: "Render gate",
        capability_mode: "execute",
        output_schema: law_schema,
    });
    agents_spent += 1;
    if rr != () && rr.success && rr.output != () {
        render_gate = as_map(rr.output);
        if render_gate.available == true && render_gate.pass != true {
            blockers.push(#{ what: "LAW18 render gate", why: trimmed(render_gate.reason) });
        }
    } else {
        render_gate = #{ available: false, pass: true, reason: "render agent failed — treated as N/A only if no UI; recorded", evidence: "agent failed" };
        spawn_errors.push("render gate failed");
    }

    phase("Fat version bar");
    let fp = fat_law + "\nAudit the ACTUAL diff/work against LAW17.\nTASK: " + task + "\nPlan version_label: " + version_label + "\n";
    fp += "pass=true only if fat package OR structural bug with root cause+verify+prevention.\n";
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
    }
}

phase("Reachability");
let rch_p = "LAW19 REACHABILITY. Every symbol this change ADDED must have a caller AND a writer.\n";
rch_p += "Prefer execution to grep. If tests were added, prove they RAN (names in output).\n";
rch_p += "pass=true only with evidence. TASK: " + task + "\nUse git diff and the real tree.\n";
let rch = agent(rch_p, #{
    label: "law19:reachability",
    phase: "Reachability",
    capability_mode: if apply_mode { "execute" } else { "read-only" },
    output_schema: law_schema,
});
agents_spent += 1;
if rch != () && rch.success && rch.output != () {
    reach = as_map(rch.output);
    if reach.pass != true {
        blockers.push(#{ what: "LAW19 reachability", why: trimmed(reach.reason) });
    }
} else {
    reach = #{ pass: false, reason: "reachability agent failed — fail closed", evidence: "" };
    blockers.push(#{ what: "LAW19 reachability", why: "agent failed" });
    spawn_errors.push("reachability failed");
}

// ═══════════════════════════════════════════════════════════════════════════
// tally + ship
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

let shippable = blockers.len() == 0 && failed_n == 0 && !ceiling_hit && trimmed_from_plan.len() == 0;
if max_only && completeness.ran == true && completeness.wentDry != true {
    shippable = false;
}
if thin_panels.len() > 0 && shippable {
    // degraded, not clean
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
    syn_p += "Return version_label, headline (one line), shipped[], follow_ups[].";
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
md += "\n_Konyo Workflow · Grok implementer · parity target Claude konyo-workflow.js · audit-only body retired 2026-08-07_\n";

let report_path = write_scratch_file("konyo-report.md", md);

log("════════════════════════════════════════════════════════");
log("VERDICT: " + verdict);
log("SHIPPABLE: " + shippable.to_string() + " · passed " + passed_n.to_string() + " · failed " + failed_n.to_string() + " · blockers " + blockers.len().to_string());
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
    blockers: blockers,
    agent_errors: spawn_errors,
    agents_spent: agents_spent,
    ceiling: #{ cap: max_agents, spent: agents_spent, hit: ceiling_hit, trimmedFromPlan: trimmed_from_plan },
    triage: triage,
    completeness: completeness,
    render_gate: render_gate,
    fat_version: fat_bar,
    reachability: reach,
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
