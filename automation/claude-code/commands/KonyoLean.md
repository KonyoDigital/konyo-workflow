<!-- `/KonyoFast` was renamed to `/KonyoLean` on 2026-08-04: it saves ~62% of tokens but only ~15% of
     wall-clock, so the old name promised the number it was worst at. `{quality:'fast'}` still resolves. -->
---
description: Konyo workflow at LEAN — every MAX ship gate intact, ~62% fewer tokens. One architect, one rework round, no completeness loop, low-risk items built at sonnet. NOT much quicker — it saves spend, not clock.
argument-hint: [what you want done]
---

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '$ARGUMENTS', quality: 'lean', apply: true }
})
```

**What lean KEEPS — every gate that decides whether a ship is trustworthy:** the adversarial skeptic
panel AS the gate (floor 2, one seat is the third eye), all four third-eye seats, the render gate
including the vision step, LAW17 fat version bar, LAW19 reachability, the blockers ledger, the agent
ceiling, and the workspace lock.

**What lean DOES NOT buy, and says so in its payload:**
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
  because lean's builders edit the same real files max's do — "low risk" describes what breaks if
  the change is wrong, not how hard it is to make — and because lean runs one round, so a weak
  build burns the item instead of escalating. Haiku stays on `/KonyoCost`, where the ladder, the
  Fable gate and the retry exist to catch it. The skeptics reading the diff are Opus either way.

MEASURED, so you know what you are buying: against a real max run of 53.7min/1.42M tokens, this path took ~46min/~540k — about 15% quicker and 62% cheaper. The clock barely moves because wall-clock is set by the single owner walking the biggest file, which no flag can shorten; the SPEND is what you save. When being wrong is expensive, use
`/KonyoMax` — lean cannot claim completeness, by construction.
