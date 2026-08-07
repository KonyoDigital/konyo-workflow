# Grok Build workflows (Konyo)

**Parity target:** Claude Code `konyo-workflow.js` **v27.1+** concurrent LAW19‖render (**v22**) + **v26** render loop + **v28** (PACE+PROXY, PHASE_PLAN, PASSED|CEILING|STALLED) + **v28.1** early lock release + **v29** scar law + **v30** meter routing + **v31** concurrent first hop on Grok (2026-08-07).

| Slash | File | Role |
|-------|------|------|
| **`/konyo-workflow`** | `../automation/workflows/konyo-workflow.rhai` | **Full implementer** · lean default · `{apply:true}` writes · third-eye = Claude CLI |
| **`/konyo-workflow-max`** | `konyo-workflow-max.rhai` | **DEPRECATED notice only** — MAX is `{quality:"max"}` on `/konyo-workflow` |

> **2026-08-07:** The Grok shipper was **audit-only** (read-only laws panel, no builders).
> That body is retired to `konyo-workflow.rhai.bak-audit-only-2026-08-07`.
> The live script is an **implementer**. **v30** adds meter routing after a measured
> max run burned 2h+ on a “30 whole-console versions” brief (ceiling + thrash).
> **v31** ports Claude’s concurrent LAW19‖render hop: Rhai has no fire-and-forget
> `spawn`, so the first render pass and LAW19 run in one `parallel()` barrier;
> the fix/re-render loop stays serial; fat bar stays downstream. Also hard-fails
> empty `images[]` without `images_na_reason`, and uses Claude’s rich LAW19 schema.

## How to invoke (Grok Build)

```text
# Lean default, dry-run (propose only — safe)
/konyo-workflow {"task":"…"}

# Actually edit files (default quality = lean)
/konyo-workflow {"task":"…","apply":true}

# Max ONLY when being wrong is expensive AND the list is SMALL
/konyo-workflow {"task":"…","apply":true,"quality":"max","items":[
  {"file":"/abs/path","instruction":"…","risk":"high","anchor":"~line N"}
]}

# Tiny: known edit set, ~15-minute hop budget, every ship gate kept (max 4 items)
/konyo-workflow {"task":"…","apply":true,"quality":"tiny","items":[
  {"file":"/abs/path","instruction":"…","risk":"low","anchor":"~line N, symbol"}
]}

# Multi-version product arcs: N lean/tiny slices — NOT one max fleet of 30 stamps
/konyo-workflow {"task":"Arc slice 1 of 4: …","apply":true,"quality":"lean"}

# Standard cheap ladder
/konyo-workflow {"task":"…","apply":true,"quality":"standard"}

# Push only after shippable (builders never push)
/konyo-workflow {"task":"…","apply":true,"push":true}
```

### Args (same names as Claude where possible)

| Arg | Default | Meaning |
|-----|---------|---------|
| `task` / `objective` | required | What to ship |
| `apply` | `false` | `true` = builders edit; `false` = dry-run diffs only |
| `quality` | `lean` | `lean` · `max` · `standard` · `tiny` (`fast`→`lean`) |
| `force` | `false` | Override triage `direct` |
| `items` | — | `[{file, instruction, risk?, anchor?}]` — **skips architect at ANY quality** (required for tiny) |
| `maxItems` | by quality | Hard item cap: **tiny 4 · max 6 · lean 8 · standard 10** (override if you must) |
| `skeptics` | triage / floor | Explicit seat count; `0` = human opt-out |
| `isolate` | `false` | Worktree builders + merge (`git apply --check`) |
| `thirdEye` | `claude` | `claude` (different family) · `grok` (same-family, labelled degraded) · `false` off |
| `push` | `false` | Ship phase may `git push` only if shippable; never `--force` |
| `maxAgents` | `24` | Hard agent ceiling |
| `ignoreLock` | `false` | Proceed over a live workspace lock |

## Quality law (identical spirit to Claude)

- **LEAN (default):** every ship gate runs; one architect; no completeness critic; efficient builders. **Use for volume / multi-stamp arcs.**
- **MAX:** multi-round rework + completeness critic + deepest prompts. **Use for small high-stakes packages only** (prefer `items[]` ≤6). Not for “ship 30 versions.”
- **STANDARD:** cheaper ladder; fable-style per-item gate when skeptics=0.
- **TINY:** skips planning hops only — **never** skips adversarial / LAW17 / LAW18 / LAW19 / lock. Cap 4 items.

`quality` may change **tier depth, panel size, extra phases, item cap** — never whether a safeguard runs.

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
| Engine | `konyo-workflow.js` | `konyo-workflow.rhai` |
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
cp automation/workflows/konyo-workflow.rhai ~/.grok/workflows/
cp automation/workflows/v27_grok_safeguard_proof.sh ~/.grok/workflows/
cp grok/konyo-workflow-max.rhai ~/.grok/workflows/
bash ~/.grok/workflows/v27_grok_safeguard_proof.sh
```

Or `./install.sh` from the repo root when that path is wired for Grok.
