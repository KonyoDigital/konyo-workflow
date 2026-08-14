# Konyo Workflow — Claude Code implementations

Runnable **Claude Code** workflow scripts (JS) that implement the Konyo Workflow doctrine.
Drop either file in `~/.claude/workflows/` and run it from Claude Code with:

    Workflow: name "konyo-workflow"       args {"task":"<what to do>", "apply":true}
    Workflow: name "konyo-workflow"       args {"task":"…", "apply":true, "items":[{"file":"/abs/path","instruction":"…"}]}

(`apply:false` = dry-run: agents propose diffs, write nothing. **Never pair it with a
file-shaped deliverable** — see the guard below.)

**v27 / v27.1:** `items:[{file,instruction}]` skips the architect at **any** quality (not only
`tiny`). An architect that returns `items:[]` no longer becomes a vacuous green ship
(`![]` is truthy in JS). `SHIPPABLE` requires `apply:true` **and** `passed.length > 0`.
`force:true` still cannot ship an empty architect plan.

```bash
# gate: vacuous green ship cannot return
node automation/claude-code/v27_empty_plan_proof.mjs
```

`/konyo-workflow-max` is retired — use `{quality:"max"}` on the one body.

## The cost-scaled one now sizes itself

`konyo-workflow.js` runs a **TRIAGE** phase before it spends anything: one cheap call classifies the
task, prints its verdict with an agent estimate, and shapes the run from it.

| the task looks like | what it does |
|---|---|
| find ONE root cause (a red test, a bug) | **spawns nothing** — tells you to do it directly |
| a sweep with a known list (audit 100 files) | one owner per item + a gate |
| write a document | a handful of agents, one adversarial read |
| arithmetic · data loss · money · security | buys 3 skeptics per item who try to **refute** it |

Recommending *"do this directly"* is a success. Fan-out does not make a root cause appear faster —
it produces N opinions that each still have to be checked.

Two rules are enforced in code, not left to judgment, both learned from real runs:

- **A dry-run may never be given a file-shaped deliverable.** `apply:false` means agents write
  nothing, so a task that also demands files can satisfy no one: every item fails its gate and each
  failure escalates with fresh skeptics. Observed live — an agent counter climbing 97 → 101 → 108
  across 2.5 hours while producing no file. Now refused in one line at zero cost, in **both**
  scripts.
- **Triage's estimate is a ceiling.** An architect answering a 4-item job with 23 items is trimmed,
  out loud. That inflation is how a planning document becomes a hundred agents.

Overrides: `{"force":true}` runs the fleet anyway; `{"skeptics":3}` sets the count by hand.

**Where each earned or wasted its keep, measured:** max on a time-tracking build caught a double-count
(100 items ledgered as 200) and a path that would have fabricated ~100 minutes of saved time — worth
every agent. Max on a *planning document* spent ~106 agents and 2.5 hours where a few plus one
adversarial read found the same holes. Same setting, opposite verdicts — which is why triage exists.

**There is ONE engine.** `konyo-workflow-max.js` was retired at v18 and is kept only as
`.retired-v18` for history — it is not installed and cannot be invoked. Max is a *quality string on
the one body*, not a second file.

| File | What | Use it for |
|------|------|-----------|
| `konyo-workflow.js` | **The engine.** One body, four cost shapes selected by `quality` — `standard` (Haiku bulk · Sonnet build · Fable gate) → `lean` (default) → `max` (Opus everywhere · 3-architect judge panel · 3-skeptic diverse-lens adversarial gate where majority-refute kills a change · loop-until-dry completeness critic). `tiny` cuts planning hops only. | Everything. `standard` ≈ 0.07–0.1x, `lean` ≈ 0.38x, `max` = 1x baseline. |
| `agent-army.js` | The fleet variant. **Registers the name `konyo-workflow` too** — always invoke by `scriptPath`, never `{name}`. | See [agent-army](https://github.com/KonyoDigital/agent-army). |
| `commands/` | `/Konyo` — the one door, which derives the cost shape from stakes. Plus `/KonyoLean` `/KonyoMax` `/KonyoCost` `/KonyoTiny` as manual overrides. | Start at `/Konyo`. |

Every quality: one owner per file, a quality gate on every change, optional Grok third-eye, version
per round, ONE final report. **A quality flag buys model tier, panel size and extra phases — never a
gate.**

Routing map, including what each shape is *wrong* for: [`ROUTING.md`](../../ROUTING.md).

Args: `{task, apply, maxRounds, budgetFloor, grok}` (max also takes `dryRounds`). Args may be an object or a JSON string.

## v30 meter routing (Grok parity, 2026-08-07)

Item caps by quality: **tiny 4 / max 6 / lean 8 / standard 10** (override with `{maxItems:N}` ≤24).

Volume-arc task text is non-blocking but loud under `quality:max`. FAT_LAW carries VERSION ARC DISCIPLINE, TIP HONESTY, and THRASH RESISTANCE.

```bash
node automation/claude-code/v30_meter_routing_proof.mjs
node automation/claude-code/v27_empty_plan_proof.mjs
```

