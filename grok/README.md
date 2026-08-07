# Grok Build workflows (Konyo)

**Parity target:** Claude Code `konyo-workflow.js` (v26+ lean default, apply mode, army, skeptic gate, LAW17/18/19).

| Slash | File | Role |
|-------|------|------|
| **`/konyo-workflow`** | `../automation/workflows/konyo-workflow.rhai` | **Full implementer** · lean default · `{apply:true}` writes · third-eye = Claude CLI |
| **`/konyo-workflow-max`** | `konyo-workflow-max.rhai` | **DEPRECATED notice only** — MAX is `{quality:"max"}` on `/konyo-workflow` |

> **2026-08-07:** The Grok shipper was **audit-only** (read-only laws panel, no builders).
> That body is retired to `konyo-workflow.rhai.bak-audit-only-2026-08-07`.
> The live script is now an **implementer** with the same quality knob and gates as Claude.

## How to invoke (Grok Build)

```text
# Lean default, dry-run (propose only — safe)
/konyo-workflow {"task":"…"}

# Actually edit files
/konyo-workflow {"task":"…","apply":true}

# Max when being wrong is expensive
/konyo-workflow {"task":"…","apply":true,"quality":"max"}

# Tiny: known edit set, ~15-minute hop budget, every ship gate kept
/konyo-workflow {"task":"…","apply":true,"quality":"tiny","items":[
  {"file":"/abs/path","instruction":"…","risk":"low","anchor":"~line N, symbol"}
]}

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
| `items` | — | `[{file, instruction, risk?, anchor?}]` — **skips architect at ANY quality** (required for tiny). Empty architect plans no longer die as "after caps". |
| `skeptics` | triage / floor | Explicit seat count; `0` = human opt-out |
| `isolate` | `false` | Worktree builders + merge (`git apply --check`) |
| `thirdEye` | `claude` | `claude` (different family) · `grok` (same-family, labelled degraded) · `false` off |
| `push` | `false` | Ship phase may `git push` only if shippable; never `--force` |
| `maxAgents` | `24` | Hard ceiling |
| `ignoreLock` | `false` | Proceed over a live workspace lock |

## Quality law (identical spirit to Claude)

- **LEAN (default):** every ship gate runs; one architect; no completeness critic; efficient builders.
- **MAX:** multi-round rework + completeness critic (hunt unplanned work) + deepest tier prompts.
- **STANDARD:** cheaper ladder; fable-style per-item gate when skeptics=0.
- **TINY:** skips planning hops only — **never** skips adversarial / LAW17 / LAW18 / LAW19 / lock.

`quality` may change **tier depth, panel size, extra phases** — never whether a safeguard runs.

## Host differences (named, not papered over)

| | Claude Code host | Grok Build host |
|--|------------------|-----------------|
| Engine | `konyo-workflow.js` | `konyo-workflow.rhai` |
| Builders | Opus/Sonnet/Haiku ladder | Grok agents + **depth directive** in prompt (one model family) |
| Third eye default | **Grok CLI** | **Claude CLI** (`claude -p --model opus`) |
| Write boundary | harness tools | `capability_mode`: `read-only` / `read-write` / `all` |
| Workspace lock | `~/.claude/workflows/.locks/` | **same dir** (fleets exclude each other) |

A same-family stand-in is never a silent fallback. Empty third-eye seat is reported empty.

## Gates (all qualities when applying)

1. Workspace lock (apply only)
2. Adversarial skeptic panel (floor 2 at max/lean apply)
3. LAW17 fat version bar
4. LAW18 painted-UI proof (`available:false` honest when no UI)
5. LAW19 reachability (caller + writer; tests proven to run)
6. Ship push only if shippable **and** `{push:true}`

## Install

```bash
# from konyo-workflow repo
./install.sh
# or:
cp automation/workflows/konyo-workflow.rhai ~/.grok/workflows/
cp grok/konyo-workflow-max.rhai ~/.grok/workflows/   # deprecation notice only
```

Also mirrored at `~/.konyo-workflow/workflows/konyo-workflow.rhai`.
