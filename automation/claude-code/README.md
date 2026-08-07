# Konyo Workflow — Claude Code implementations

Runnable **Claude Code** workflow scripts (JS) that implement the Konyo Workflow doctrine.
Drop either file in `~/.claude/workflows/` and run it from Claude Code with:

    Workflow: name "konyo-workflow"       args {"task":"<what to do>", "apply":true}
    Workflow: name "konyo-workflow"       args {"task":"…", "apply":true, "items":[{"file":"/abs/path","instruction":"…"}]}

(`apply:false` = dry-run: agents propose diffs, write nothing. **Never pair it with a
file-shaped deliverable** — see the guard below.)

**v27:** `items:[{file,instruction}]` skips the architect at **any** quality (not only
`tiny`). An architect that returns `items:[]` no longer becomes a vacuous green ship
(`![]` is truthy in JS; `SHIPPABLE` now requires `passed.length > 0`).
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

| File | Mode | Use it for |
|------|------|-----------|
| `konyo-workflow.js` | **Cost-scaled** — cheapest capable model per job (Haiku bulk · Sonnet build · Fable gate · Opus only architects + synthesizes) | Everyday work. ~1x cost. |
| `konyo-workflow-max.js` | **Max quality** — Opus everywhere · 3-architect judge panel · 3-skeptic diverse-lens adversarial gate (majority-refute kills a change) · loop-until-dry completeness critic | High-stakes / correctness-critical work (trading code, security audits, production ships). ~10–15x cost. |

Both: one owner per file, a quality gate on every change, optional Grok third-eye, version per round, ONE final report.

Args: `{task, apply, maxRounds, budgetFloor, grok}` (max also takes `dryRounds`). Args may be an object or a JSON string.
