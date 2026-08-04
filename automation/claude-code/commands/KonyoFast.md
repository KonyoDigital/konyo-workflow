---
description: Konyo workflow at FAST — every MAX ship gate intact, but one architect, one rework round, no completeness loop, and low-risk items built at their own tier.
argument-hint: [what you want done]
---

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '$ARGUMENTS', quality: 'fast', apply: true }
})
```

**What fast KEEPS — every gate that decides whether a ship is trustworthy:** the adversarial skeptic
panel AS the gate (floor 2, one seat is the third eye), all four third-eye seats, the render gate
including the vision step, LAW17 fat version bar, LAW19 reachability, the blockers ledger, the agent
ceiling, and the workspace lock.

**What fast DOES NOT buy, and says so in its payload:**
- **One architect, not a 3-way panel + judge.** The panel is a barrier — nothing builds until the
  slowest candidate and the judge are done. The plan is still independently read, by the third eye,
  which is a different model family and a stronger check than a second Claude candidate.
- **One rework round, not two.** A first failure is reported instead of retried. Failed items already
  force an INCOMPLETE verdict, so nothing is hidden — it just is not attempted twice.
- **No completeness critic.** It is the run's longest tail, and it can add whole build+gate rounds
  after every item has already passed. `completeness.ran:false` carries the reason, so "no gaps
  found" can never be confused with "nobody looked".
- **Low-risk items build at their architect's tier, floored at SONNET — never haiku.** Anything
  tagged medium/high risk, or untagged (unknown is not low), still gets Opus. The floor exists
  because fast's builders edit the same real files max's do — "low risk" describes what breaks if
  the change is wrong, not how hard it is to make — and because fast runs one round, so a weak
  build burns the item instead of escalating. Haiku stays on `/KonyoCost`, where the ladder, the
  Fable gate and the retry exist to catch it. The skeptics reading the diff are Opus either way.

Use it when the work is well-specified and you want it soon. When being wrong is expensive, use
`/KonyoMax` — fast cannot claim completeness, by construction.
