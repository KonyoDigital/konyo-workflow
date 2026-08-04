---
description: Run the Konyo workflow at MAX quality (which is now its default) — Opus everywhere, 3-architect judge panel, adversarial skeptic gate, completeness critic, third eye on.
argument-hint: [what you want done]
---

Invoke the workflow at MAX quality:

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: { task: '$ARGUMENTS', quality: 'max', apply: true }
})
```

Notes before you run it:

- **MAX is already the default.** Since v18 (2026-08-04) a bare `konyo-workflow` call buys the max
  path, so `quality:'max'` here is belt-and-braces, not what buys it. This command exists because
  Konyo types `/konyo-workflow-max` out of habit and his `settings.local.json` permission entry
  names it. It replaced a deprecation stub that aborted every invocation.
- **Invoke by `scriptPath`, not `{name}`** — the engine snapshots named workflows and may serve a
  stale generation after an edit.
- Add `apply: false` for a dry run (propose, write nothing). Add `{skeptics: 3}` to force the full
  panel when triage under-buys — at max the floor is 2, and one of those seats is the third eye.
- `{thirdEye: false}` runs without an independent reviewer; `{thirdEye:'claude'}` is a labelled
  same-family stand-in. Default is Grok via the CLI.
- For the cheap path use `/konyo-workflow-cost` or pass `{quality:'standard'}`.
