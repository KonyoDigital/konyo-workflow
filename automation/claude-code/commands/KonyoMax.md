---
description: Konyo workflow at MAX — Opus everywhere, 3-architect judge panel, adversarial skeptic gate, completeness critic, third eye on. This is the default.
argument-hint: [what you want done]
---

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '$ARGUMENTS', quality: 'max', apply: true }
})
```

MAX is already the default, so `quality:'max'` here is belt-and-braces. Use this when being wrong
costs more than tokens: trading code, security, data migrations, anything you cannot roll back.

Invoke by **scriptPath, not `{name}`** — the engine snapshots named workflows and may serve a stale
generation after an edit.

Knobs: `apply:false` dry-runs. `{skeptics:3}` forces the full panel when triage under-buys (the max
floor is 2, and one of those seats is the third eye). `{thirdEye:false}` runs with no independent
reviewer; `{thirdEye:'claude'}` is a labelled same-family stand-in. `{isolate:true}` builds in git
worktrees and merges after. `{maxAgents:N}` raises the ceiling.

Faster: `/KonyoFast`. Cheaper: `/KonyoCost`.

## v30 meter routing

**Max is not volume.** Prefer `items[]` of ≤6 files. Multi-version arcs = N lean/tiny slices. Cap: max 6 / lean 8 / tiny 4 / standard 10 (`maxItems` override ≤24).
