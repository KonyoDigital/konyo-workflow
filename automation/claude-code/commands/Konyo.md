---
description: The Konyo Workflow — ONE door. Answers "run nothing" when one root cause is the whole job, otherwise ships. You set ONE thing, the stakes — reversible / costly / irreversible — and everything else is derived. Unstated stakes resolve to COSTLY, never quietly cheap. There is no max/lean/tiny door. Give items:[{file,instruction}] when you already know the edits and it skips the planning hops at any stakes.
argument-hint: [what you want done] [--reversible | --irreversible]
---

# One door

There is one command. `/Konyo`. You do not pick a cost name.

Triage derives model tier, planning depth and rework rounds from the task. It **cannot** derive
one thing: what being wrong costs. A contained CSS fix and a contained CSS fix on the live console
during market hours are the same diff. That is the only question that ever needed you.

Every gate is identical no matter what the stakes buy: the adversarial skeptic panel, all third-eye
seats, the render gate including vision, LAW17 fat version bar, LAW19 reachability, the blockers
ledger, the agent ceiling, the workspace lock.

---

## Step 0 — the first legal answer is "run nothing"

If the job is **one root cause** — a red test, a single bug, a known one-line fix — say so and stop.
Fan-out does not make a cause appear faster; it produces N opinions that each still have to be
checked. Recommending *"do this directly"* is a **success**, not a failure to route.

---

## Step 1 — stakes, and nothing else

| You say | Use when |
|---------|----------|
| `--reversible` | routine, cheap to be wrong, you will review it anyway: copy edits, a contained CSS fix, a mechanical rename |
| *(say nothing)* | the default. Daily ships. Unstated is COSTLY, never cheap |
| `--irreversible` | money · security · trading code · migrations · live-site ships · anything you cannot roll back |

**Unstated resolves to COSTLY, never cheap.** An unrecognised or misspelled stakes word resolves the
same way as irreversible and says so. A misread flag must fail expensive.

---

## Step 2 — hand over the plan if you have it

`items:[{file,instruction}]` is **an argument, not a door**. It skips the architect hop at *any*
stakes.

Give `anchor` when you know roughly where in the file. It is the single biggest wall-clock saving.

### Build the payload — two edits you MUST make, not comments to read past

**1. Strip the stakes flag out of the task.** `$ARGUMENTS` contains it. `--reversible` /
`--irreversible` are instructions to *this door*, not work for the engine.

**2. Pick the stakes line by hand from the table above.** There is no quality name to type.

`--reversible` →
```
Workflow({ scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '<$ARGUMENTS, flag removed>', stakes: 'reversible', apply: true } })
```

no flag →
```
Workflow({ scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '<$ARGUMENTS>', apply: true } })
```

`--irreversible` →
```
Workflow({ scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '<$ARGUMENTS, flag removed>', stakes: 'irreversible', apply: true } })
```

Add `items:` to any of them when you already have the plan — `<=4` items, `<=3` distinct files,
one owner per file:
`items: [{ file: '/abs/path', instruction: 'the exact edit', risk: 'low', anchor: '~line 11286, _aiSetName' }]`

**If the stakes word is present but unrecognised** (`--cheap`, `--fast`, a typo): use
`stakes: 'irreversible'` and **say out loud that you did**. A misread flag fails expensive,
never quietly cheap.

Invoke by **`scriptPath`, not `{name}`** — the engine snapshots named workflows and can serve a
stale generation after an edit, and `agent-army.js` registers the name `konyo-workflow` as well.

---

## What this does not change

- **No gate moves.** Stakes buys model tier, panel size and extra phases — never a gate.
- **The four old names are retired.** `/KonyoTiny` `/KonyoLean` `/KonyoMax` `/KonyoCost` are
  loud redirects. They do not pick a shape. Use this door.

## Other knobs (any stakes)

`apply:false` dry-runs — **never with a file-shaped deliverable**, it is refused in one line.
`{skeptics:N}` sets the panel by hand. `{thirdEye:false}` drops the independent reviewer.
`{isolate:true}` builds in git worktrees and merges the patches back. `{force:true}` overrules
*triage only*. `{ignoreLock:true}` overrules the **workspace lock** — only when the holder is dead.
`{logPass:true}` logs each proven pass (commit+push that file only). Requires `apply:true`. Not a
ship and not a door.

Full map: [`ROUTING.md`](../../../ROUTING.md)
