---
description: The Konyo Workflow — ONE door. Answers "run nothing" when one root cause is the whole job, otherwise ships. You set ONE thing, the stakes — reversible / costly / irreversible — and everything else (model tier, planning depth, rework rounds) is derived by triage. Unstated stakes resolve to COSTLY, never quietly cheap. Give it an items:[{file,instruction}] list when you already know the edits and it skips the planning hops at any stakes. Replaces choosing between /KonyoTiny /KonyoLean /KonyoMax /KonyoCost — those still work and are unchanged, but they ask you to pick a cost shape, which is the machine's job. The gates are identical no matter what you pick, so the only question that ever needed a human is what being wrong costs.
argument-hint: [what you want done] [--reversible | --irreversible]
---

# One door

**The four quality paths are one system with three dials.** Across `tiny`, `lean`, `max` and
`standard`, exactly three things vary — **model tier**, **planning depth** (architects, completeness
critic) and **rework rounds**. Every gate is identical in all four: the adversarial skeptic panel,
all third-eye seats, the render gate including vision, LAW17 fat version bar, LAW19 reachability,
the blockers ledger, the agent ceiling, the workspace lock.

Triage can derive tier and planning depth from the task. It **cannot** derive one thing: what being
wrong costs. A contained CSS fix and a contained CSS fix on the live console during market hours are
the same diff. That is the only question that ever needed you.

---

## Step 0 — the first legal answer is "run nothing"

If the job is **one root cause** — a red test, a single bug, a known one-line fix — say so and stop.
Fan-out does not make a cause appear faster; it produces N opinions that each still have to be
checked. Recommending *"do this directly"* is a **success**, not a failure to route.

Fleet cost is roughly fixed regardless of task size. A three-line fix through a fleet costs what a
thirty-file arc costs.

---

## Step 1 — stakes, and nothing else

| You say | Shape bought | Use when |
|---------|--------------|----------|
| `--reversible` | `quality:'standard'` — Haiku/Sonnet build, Fable gating every merge | routine, cheap to be wrong, you will review it anyway: copy edits, a contained CSS fix, a mechanical rename |
| *(say nothing)* | **`quality:'lean'`** — one architect, one rework round, ~0.38x max tokens | the default. Daily ships, multi-stamp arcs |
| `--irreversible` | `quality:'max'` — 3-architect judge panel, Opus everywhere, loop-until-dry completeness critic | money · security · trading code · migrations · live-site ships · anything you cannot roll back |

**Unstated resolves to COSTLY, never cheap.** An unrecognised or misspelled stakes word resolves the
same way and says so. A misread flag must fail expensive.

---

## Step 2 — hand over the plan if you have it

`items:[{file,instruction}]` is **an argument, not a tier**. It skips the architect hop at *any*
stakes — this is why `/KonyoTiny` was never really a fourth quality, only a lean run whose plan
arrived with the request.

Give `anchor` when you know roughly where in the file. It is the single biggest wall-clock saving.

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: {
    task: '$ARGUMENTS',
    quality: 'lean',        // <- 'standard' if --reversible, 'max' if --irreversible
    apply: true,
    // OPTIONAL. Present = skip the architect. <=4 items, <=3 distinct files, one owner per file.
    // items: [{ file: '/abs/path', instruction: 'the exact edit', risk: 'low',
    //           anchor: '~line 11286, _aiSetName' }],
  }
})
```

Invoke by **`scriptPath`, not `{name}`** — the engine snapshots named workflows and can serve a
stale generation after an edit, and `agent-army.js` registers the name `konyo-workflow` as well.

---

## What this does not change

- **No gate moves.** Stakes buys model tier, panel size and extra phases — never a gate.
- **The engine is untouched.** The collapse happens here, at the door. `quality` still takes the
  same four strings; this command decides which one, so you do not have to.
- **The four commands still work.** `/KonyoTiny` `/KonyoLean` `/KonyoMax` `/KonyoCost` are unchanged
  and pass their string straight through. Use them when you want to override the derivation by hand.

## Other knobs (any stakes)

`apply:false` dry-runs — **never with a file-shaped deliverable**, it is refused in one line.
`{skeptics:N}` sets the panel by hand. `{thirdEye:false}` drops the independent reviewer.
`{isolate:true}` builds in git worktrees and merges the patches back. `{force:true}` overrules
*triage only*. `{ignoreLock:true}` overrules the **workspace lock** — only when the holder is dead.
`{maxItems:N}` raises the item cap (tiny 4 · max 6 · lean 8 · standard 10, hard cap 24).

Full map: [`ROUTING.md`](../../../ROUTING.md)
