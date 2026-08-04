---
description: Konyo workflow at STANDARD — the explicitly cheap path, cost-scaled ladder with Fable gating every merge. ~10-15x cheaper than max.
argument-hint: [what you want done]
---

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '$ARGUMENTS', quality: 'standard', apply: true }
})
```

**Only the exact string `standard` opts down.** A typo, `cheap`, `fast-ish` — anything unrecognised
resolves to MAX and logs that it did. That direction is deliberate: a misread flag should fail
expensive, never quietly cheap.

**Right for:** routine work, low cost of being wrong, easily reversible — copy edits, a contained CSS
fix, a mechanical rename, scaffolding you will review yourself anyway.

**Wrong for:** trading code, security, migrations, live-site ships, anything you cannot roll back in
one command.

Versus max you give up: Opus everywhere (standard runs a Haiku→Sonnet→Opus ladder), the architect
panel, the skeptic panel AS the gate (standard gates with Fable on every merge and rides skeptics
behind it), and the completeness critic. Everything else is identical by construction — ceiling,
blockers, verdict/shippable on every exit, render gate + vision, LAW17, LAW19, workspace lock,
skeptic floor, and the third eye.

Middle ground: `/KonyoFast` keeps every max gate and only cheapens low-risk builds.
