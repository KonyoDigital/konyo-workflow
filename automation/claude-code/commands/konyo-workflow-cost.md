---
description: Run the Konyo workflow at STANDARD (cost-scaled) quality — the explicit cheap path, ~10-15x cheaper than the default max run.
argument-hint: [what you want done]
---

Invoke the workflow at STANDARD quality:

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '$ARGUMENTS', quality: 'standard', apply: true }
})
```

**Only the exact string `standard` opts down.** Any other value — a typo, `cheap`, `fast` — resolves
to MAX and logs that it did. That direction is deliberate: a misread flag should fail expensive, not
quietly cheap.

**When the cheap path is the right call:** routine work with a low cost of being wrong, easily
reversible, and no correctness-critical surface — copy edits, a contained CSS fix, a mechanical
rename, scaffolding you will review yourself anyway.

**When it is not:** trading-system code, security, data migrations, anything that ships to the live
site, or anything you cannot roll back in one command. Use `/konyo-workflow-max` — or just
`konyo-workflow`, since max is the default.

What you give up versus max: Opus everywhere (standard uses a Haiku→Sonnet→Opus ladder), the
3-architect judge panel (standard uses one architect), the skeptic panel as THE gate (standard gates
with Fable on every merge and rides skeptics behind it), and the loop-until-dry completeness critic
(standard never buys it — the payload says so explicitly with `completeness.ran:false` and a reason,
so it can never be mistaken for a loop that ran and found nothing).

Everything else is identical by construction: the agent ceiling, the blockers ledger, verdict and
shippable on every exit, the render gate with its vision step, LAW17, LAW19, the workspace lock, the
skeptic floor, and the third eye.
