# Grok Build workflows (Konyo)

**Parity target:** Claude Code `konyo-workflow.js` (lean default, gates) + **v26** render loop + **v28** (PACE+PROXY, PHASE_PLAN, PASSED|CEILING|STALLED) + **v28.1** early lock release + **v29** scar law + **v30** meter routing / fleet caps / thrash+tip honesty + **v31** concurrent LAW19‖render + **v32** scar-at-failure + run-not-inspect + **v33** CAPTURE PER ROUND / CARVE PER ARC + **v36** Grok-host ports of Claude JS v35/v36 (items[] dry-run refuse, `release_held_lock` on every abort, plan seat can block, pass+failures cannot PASSED). File name stays `Konyo-Grok.rhai` (slash `/Konyo-Grok`); `meta.name` is `konyo-grok` because the host requires lowercase.

| Slash | File | Role |
|-------|------|------|
| **`/Konyo-Grok`** | `Konyo-Grok.rhai` | **Full implementer** · one door · stakes default costly · `{apply:true}` writes · third-eye = Claude CLI |
| **`/konyo-workflow`** | `konyo-workflow.rhai` | **Redirect stub** — returns BLOCKED + re-run args for `/Konyo-Grok` |
| **`/konyo-workflow-max`** | `konyo-workflow-max.rhai` | **DEPRECATED notice only** — there is no max door; use `{stakes:"irreversible"}` on `/Konyo-Grok` |

> **2026-08-07:** The Grok shipper was **audit-only** (read-only laws panel, no builders).
> That body was replaced, not archived in-tree — recover it from git history if you ever
> need it (`git log -- automation/workflows/konyo-workflow.rhai`).
> The live script is an **implementer**. **v30** adds meter routing after a measured
> max run burned 2h+ on a “30 whole-console versions” brief (ceiling + thrash).

## When to use (and when NOT to)

**Primary slash: `/Konyo-Grok`** (short). Old `/konyo-workflow` redirects here (stub, does not run).

**Use `/Konyo-Grok` only when** you want a multi-round sealed ship, a night/fleet run, or you explicitly say so.

**Do NOT use it as the default for** one-file fixes, Q&A, audits, “check the console”, or routine edits — those stay in the main chat with the few specialist skills that match the surface.

**Carving** is the default *graduation rule* (3+ scars in one territory → carve into a skill). It is **not** “open carving-skill every run.” The fleet only *proposes* carve candidates; open `carving-skill` when that floor is met.

## How to invoke (Grok Build)

> **Short name:** `/Konyo-Grok` · old `/konyo-workflow` returns a redirect stub.


```text
# Costly default, dry-run (propose only — safe) — only when you want the fleet
/Konyo-Grok {"task":"…"}

# Actually edit files (unstated stakes = costly)
/Konyo-Grok {"task":"…","apply":true}

# Irreversible — money, security, trading, live ships. Keep the list SMALL.
/Konyo-Grok {"task":"…","apply":true,"stakes":"irreversible","items":[
  {"file":"/abs/path","instruction":"…","risk":"high","anchor":"~line N"}
]}

# Known edit set: items[] skips the architect (a plan, not a door)
/Konyo-Grok {"task":"…","apply":true,"items":[
  {"file":"/abs/path","instruction":"…","risk":"low","anchor":"~line N, symbol"}
]}

# Cheap to be wrong
/Konyo-Grok {"task":"…","apply":true,"stakes":"reversible"}

# Push only after shippable (builders never push)
/Konyo-Grok {"task":"…","apply":true,"push":true}
```

### Args (same names as Claude where possible)

| Arg | Default | Meaning |
|-----|---------|---------|
| `task` / `objective` | required | What to ship |
| `apply` | `false` | `true` = builders edit; `false` = dry-run diffs only |
| `stakes` | `costly` | `reversible` · `costly` · `irreversible` (unrecognised → irreversible) |
| `force` | `false` | Override triage `direct` |
| `items` | — | `[{file, instruction, risk?, anchor?}]` — **skips architect at ANY quality** (required for tiny) |
| `maxItems` | by quality | Hard item cap: **tiny 4 · max 6 · lean 8 · standard 10** (override if you must) |
| `skeptics` | triage / floor | Explicit seat count; `0` = human opt-out |
| `isolate` | `false` | Worktree builders + merge (`git apply --check`) |
| `thirdEye` | `claude` | `claude` (different family) · `grok` (same-family, labelled degraded) · `false` off |
| `push` | `false` | Ship phase may `git push` only if shippable; never `--force` |
| `maxAgents` | `24` | Hard agent ceiling |
| `ignoreLock` | `false` | Proceed over a live workspace lock |
| `logPass` | `false` | After each **proven** item, commit+push that file only (`log-pass.sh`). Requires `apply:true`. Not a ship. Not the door. |

## Stakes law (identical spirit to Claude)

- **COSTLY (default, unstated):** every ship gate runs; one architect; no completeness critic. Daily ships.
- **IRREVERSIBLE:** multi-round rework + completeness critic + deepest prompts. Small high-stakes packages only. Not for “ship 30 versions.”
- **REVERSIBLE:** cheaper ladder. Routine work you will review anyway.

`stakes` may change **tier depth, panel size, extra phases, item cap** — never whether a safeguard runs. There is no max/lean/tiny door.

## v30 meter routing (2026-08-07)

Measured: `quality:max` + “30 fat whole-console versions” + `force:true` → ~2h, 28 agents, render CEILING, PARTIAL ship, concurrent VERSION thrash.

| Rule | Meaning |
|------|---------|
| **Max ≠ volume** | Task text like “30 versions” / “whole-console versions” logs a loud warning under max |
| **Item caps** | Hard trim after plan; excess files → `trimmedFromPlan` / PARTIAL, not silent invent |
| **Tip honesty** | Architect/builders told: VERSION + CHANGELOG + HANDOFF tip must agree; no empty fleet stamps |
| **Thrash resistance** | No import-time `server.py` rewrites / `_server_body` / `apply_arc_d*` writers |

Prove contracts:

```bash
bash ~/.grok/workflows/v27_grok_safeguard_proof.sh
# or: bash ~/konyo-workflow/automation/workflows/v27_grok_safeguard_proof.sh
```

## Host differences (named, not papered over)

| | Claude Code host | Grok Build host |
|--|------------------|-----------------|
| Engine | `konyo-workflow.js` | `Konyo-Grok.rhai` (`konyo-workflow.rhai` is a **redirect stub**) |
| Builders | Opus/Sonnet/Haiku ladder | Grok agents + **depth directive** in prompt |
| Third eye default | **Grok CLI** | **Claude CLI** (`claude -p --model opus`) |
| Write boundary | harness tools | `capability_mode`: `read-only` / `read-write` / `all` |
| Workspace lock | `~/.claude/workflows/.locks/` | **same dir** (fleets exclude each other) |

## Gates (all qualities when applying)

1. Workspace lock (apply only) — shared with Claude
2. Adversarial skeptic panel (floor 2 at max/lean apply)
3. LAW17 fat version bar (+ v30 arc discipline)
4. LAW18 painted-UI proof — v26 LOOP (narrow+wide; PASSED|CEILING|STALLED)
5. LAW19 reachability
6. Ship push only if shippable **and** `{push:true}`

## Install / sync

```bash
# from konyo-workflow repo
cp automation/workflows/Konyo-Grok.rhai ~/.grok/workflows/
cp automation/workflows/konyo-workflow.rhai ~/.grok/workflows/   # redirect stub only
cp automation/workflows/v27_grok_safeguard_proof.sh ~/.grok/workflows/
cp grok/konyo-workflow-max.rhai ~/.grok/workflows/
bash ~/.grok/workflows/v27_grok_safeguard_proof.sh ~/.grok/workflows/Konyo-Grok.rhai
```

Or `./install.sh` from the repo root when that path is wired for Grok.
