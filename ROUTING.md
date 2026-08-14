# Konyo Workflow — routing

**What are you doing?** Find your row, run that command. Not sure → `/Konyo`.

This page is the single source for *which entry point to run*. If any other file in this repo
disagrees with a table here, **this page is right and the other file is a bug** — five of them were,
until this page existed.

---

## Shipping code (Claude Code) — one door

There is **one** command. `/Konyo` — and its first legal answer is *"run nothing."*

| Invoke | When | Do **NOT** use for | Relative cost |
|--------|------|--------------------|---------------|
| *(nothing — do it yourself)* | ONE root cause: a red test, a single bug, a known one-line fix | — fan-out does not make a cause appear faster; it makes N opinions you still have to check | **0** |
| `/Konyo <task>` | everything else. Triage derives model tier, planning depth and rework rounds | — | derived |
| `/Konyo <task> --reversible` | routine, cheap to be wrong: copy edits, a contained CSS fix, a mechanical rename | trading, security, live-site ships | **~0.07–0.1x** |
| `/Konyo <task> --irreversible` | money · security · trading code · migrations · live ships | "ship 30 versions" — volume is N slices, not one big run | **1x** (the baseline) |
| `/Konyo <task>` + `items:[…]` | you already know the exact edits | diagnosis — `items[]` is a plan, not a search | skips the architect hop |

### Why one door and not four

The four quality names were never four systems. Across the old `tiny` / `lean` / `max` / `standard`
labels, **exactly three things vary**: model tier, planning depth (architects, completeness critic)
and rework rounds. **Every gate is identical** — skeptic panel, third-eye seats, render gate with
vision, LAW17, LAW19, blockers ledger, agent ceiling, workspace lock.

Triage already derives tier and planning depth from the task. It cannot derive **one** thing: what
being wrong costs. A contained CSS fix and a contained CSS fix on the live console during market
hours are the same diff. That is the only question that ever needed a human — so it is the only
question the door asks.

**There is no max / lean / tiny door.** Those names are retired. They still exist as loud redirects
so an old slash fails instead of silently picking a cost shape. The engine keeps them as *internal*
shape names; you never type them.

Two of the four were already not doors:

- **A known edit list is an argument, not a tier.** Since v27, `items:[{file,instruction}]` skips the
  architect at *any* stakes.
- **Cheap vs costly is model tier**, which triage infers from task shape once you have named the
  stakes.

**Unstated stakes resolve to COSTLY, never cheap** — the same direction as the existing string rule.

### Retired slashes (loud redirects, not doors)

Keeping them as "manual overrides" was the half-measure — it still asked you to name a cost, which
is the machine's job.

| Old invoke | Now |
|------------|-----|
| `/KonyoLean` | `/Konyo <task>` |
| `/KonyoMax` | `/Konyo <task> --irreversible` |
| `/KonyoCost` | `/Konyo <task> --reversible` |
| `/KonyoTiny` | `/Konyo <task>` + `items:[{file,instruction}]` — tiny was a plan, not a door |

### stakes is the public dial; quality is the internal name

The door sends `stakes`. The engine maps it: `reversible → standard`, `costly` (or unstated) →
`lean`, `irreversible → max`, and every existing gate keeps keying off the internal `quality`.
**Stakes overrules an explicit `quality`** — the dial you typed at the door wins over plumbing — a
leading `--` is stripped, and an unrecognised stakes word resolves to **max** and says so.

> **This joint was broken and silent (2026-08-15).** The door was rewritten to send `stakes`; the
> engine read only `quality`. Nothing threw. `stakes` fell on the floor and every run resolved to
> the lean default — so `--irreversible`, whose entire purpose is "buy the careful shape", bought
> the cheap one while the caller believed otherwise. Measured on the shipped engine:
> `maxItems=8 (quality=lean)` before, `maxItems=6 (quality=max)` after. Gated now by
> `node automation/claude-code/v38_stakes_proof.mjs`.

Stakes buys model tier, panel size and extra phases — **never a gate.**

**Volume is N slices, not one irreversible fleet.** Measured 2026-08-07: irreversible shape + "30
whole-console fat versions" + `force` → multi-hour run, agent ceiling hit, render CEILING,
PARTIAL/BLOCKED ship. The gates worked correctly. The tokens burned anyway.

**Only a recognised stakes word opts down.** `reversible` opts down; `cheap`, `fast-ish`, or a typo
resolves to **irreversible** and logs that it did. A misread flag fails expensive, never quietly cheap.

### Knobs that apply at any stakes

| Flag | Does |
|------|------|
| `apply:false` | dry-run: agents propose diffs, write nothing. **Never pair with a file-shaped deliverable** — refused in one line, because it once climbed 97 → 101 → 108 agents over 2.5 hours producing no file |
| `items:[{file,instruction}]` | skips the architect hop at **any** stakes |
| `{skeptics:N}` | sets the adversarial panel by hand (max floor is 2, one seat is the third eye) |
| `{thirdEye:false}` | runs with no independent reviewer |
| `{isolate:true}` | each builder gets a git worktree, and one merge agent applies the patches back — opt-in, because a merge stage that goes wrong loses work |
| `{force:true}` | overrules *triage* only. Deliberately **not** the lock override |
| `{ignoreLock:true}` | overrules the **workspace lock** — only when the holder is genuinely dead |

Invoke by **`scriptPath`, not `{name}`** — the engine snapshots named workflows and can serve a stale
generation after an edit. This matters more than it looks: `agent-army.js` also registers the name
`konyo-workflow`, so a bare `{name:'konyo-workflow'}` invocation is ambiguous between two engines.

---

## Shipping code (Grok Build) — same door

There is **one** command. `/Konyo-Grok` — same stakes, same gates. The slash is different because
the Grok host requires a lowercase `meta.name` and the file must stay `Konyo-Grok.rhai` (APFS is
case-insensitive; a `konyo-grok.rhai` next to it overwrites the live file).

```text
/Konyo-Grok {"task":"…","apply":true}
/Konyo-Grok {"task":"…","apply":true,"stakes":"reversible"}
/Konyo-Grok {"task":"…","apply":true,"stakes":"irreversible"}
/Konyo-Grok {"task":"…","apply":true,"items":[{"file":"/abs/path","instruction":"…","anchor":"~line N"}]}
```

`/konyo-workflow` and `/konyo-workflow-max` are loud redirects. They do not run.

---

## Not on Claude Code

| Surface | Where | What you need to know |
|---------|-------|-----------------------|
| **Claude Desktop** — no terminal, no second AI | `automation/claude-desktop/konyo-workflow.zip` (upload it), variants in `automation/claude-desktop/variants/` | de-identified public bundles, rebuilt from source in this repo |
| **Claude Desktop**, maintained personal copy | [`KonyoDigital/ship-skill`](https://github.com/KonyoDigital/ship-skill) | the same method with ratified founding rules and real scars |
| **Grok Build** | `/Konyo-Grok` in this repo (`automation/workflows/Konyo-Grok.rhai`); public package [`KonyoDigital/konyo-workflow-grok`](https://github.com/KonyoDigital/konyo-workflow-grok) | **same door, same stakes.** Host slash is `/Konyo-Grok` (meta.name must be lowercase). Pass `{task, apply, stakes}`. No max/lean/tiny door. Workspace lock is shared with Claude |
| **The fleet** | [`KonyoDigital/agent-army`](https://github.com/KonyoDigital/agent-army) | registers `konyo-workflow` too — invoke by scriptPath |
| **Any AI, no automation** | `SKILL.md` (installed to `~/.konyo-workflow/SKILL.md`) | paste it as instructions and say *"Use the Konyo Workflow."* |

---

## Order — what runs before what

A router that only says *which* is half a router. These are chains, not choices.

**Before any run**
1. **Workspace lock** — Preflight takes it before a single agent is bought. A second run in the same
   tree refuses and names the holder. TTL-based, so a killed run cannot lock you out.
2. **Triage** — one cheap call classifies the task and prints an agent estimate. Its estimate is a
   **ceiling**: an architect answering a 4-item job with 23 items is trimmed, out loud.

**The arc** (`SKILL.md`)
```
SCOUT → BOARD → ARMY → GATE → 3RD EYE → SEAL
```
One owner per file · the lead re-verifies before accepting · version bump + ship-trail line on seal ·
ONE final ping.

**After every ship** — the third eye, and it is a *different model family* looking at the real
artifact. Not "the tests were green."

**When scars cluster** — three or more learned failures in one territory graduate into a skill of
their own rather than growing SCARS.md past the point anyone reads to the end.

**Verdicts are fail-closed:** `ship` | `draft` | `blocked`. Never "looks fine." If a law does not
apply (no UI on a library), mark **N/A + evidence** — do not fake it and do not skip silently.

---

## Proving the gates still hold

These are static harnesses. They do not need the fleet, and a green one is the point of running them.

```bash
node automation/claude-code/v27_empty_plan_proof.mjs     # a vacuous green ship cannot return
node automation/claude-code/v30_meter_routing_proof.mjs  # quality → cost shape, item caps
node automation/claude-code/v32_ship_predicate_proof.mjs # SHIPPABLE requires apply + passed>0
node automation/claude-code/v36_proofs.mjs               # current engine contracts
node automation/claude-code/v38_stakes_proof.mjs         # stakes → quality; fails expensive
node automation/claude-code/scar_hook_proof.mjs          # scar capture, clustering, JS↔Py parity
./parity.sh                                              # the four shippers still agree
```

---

## Scars — captured automatically, carved on purpose

| Where | What is automatic | What is not |
|-------|-------------------|-------------|
| **In a run** | every round captures its own failures; at arc end a territory hit **3 times** is carved into a skill | nothing is deleted — carved scars are *archived*; a dry run carves nothing; capped at 2 per arc; `{carve:false}` opts out |
| **In an ordinary session** | a `UserPromptSubmit` hook records correction-shaped turns to `SCARS.inbox.md`; a `SessionStart` hook reports a territory that hit 3 | the carve itself. The machine counts, you decide — `/carving-skill` |

Carving mid-run would rewrite the rules underneath live agents, which is why it happens only at the
end. Three is the floor because two is a coincidence.

⚠ **A scar narrows attention. It never suppresses a gate.** Nothing captured or carved may skip a
check, lower a bar, or mark anything already-judged. Details: `automation/claude-code/hooks/README.md`.

---

## Where you are reading this changes what you see

| Surface | What it shows | Consequence |
|---------|---------------|-------------|
| **GitHub** | full Markdown, tables render | this page is the reference — read it here |
| **Claude Code** | the `description:` frontmatter of each command, truncated at **1,536 chars** | a long description **silently loses its tail**. A real flag once fell off the end unseen |
| **Claude Desktop** | skill description truncated at **~200 chars** | the same description that fits Claude Code is cut to a fifth here |

Truncation does not reject — it **succeeds with less**. Put the routing rule in this table, never
only in a description.

---

*Public map of the Konyo Workflow. Private scars, personal variants and house-repo skills are
excluded — absence here means "not published", not "does not exist."*
