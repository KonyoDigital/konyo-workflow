# Konyo Workflow — Claude Code implementations

Runnable **Claude Code** workflow scripts (JS) that implement the Konyo Workflow doctrine.
Drop either file in `~/.claude/workflows/` and run it from Claude Code with:

    Workflow: name "konyo-workflow"       args {"task":"<what to do>", "apply":true}
    Workflow: name "konyo-workflow-max"   args {"task":"<what to do>", "apply":true}

(`apply:false` = dry-run: agents propose diffs, write nothing.)

| File | Mode | Use it for |
|------|------|-----------|
| `konyo-workflow.js` | **Cost-scaled** — cheapest capable model per job (Haiku bulk · Sonnet build · Fable gate · Opus only architects + synthesizes) | Everyday work. ~1x cost. |
| `konyo-workflow-max.js` | **Max quality** — Opus everywhere · 3-architect judge panel · 3-skeptic diverse-lens adversarial gate (majority-refute kills a change) · loop-until-dry completeness critic | High-stakes / correctness-critical work (trading code, security audits, production ships). ~10–15x cost. |

Both: one owner per file, a quality gate on every change, optional Grok third-eye, version per round, ONE final report.

Args: `{task, apply, maxRounds, budgetFloor, grok}` (max also takes `dryRounds`). Args may be an object or a JSON string.
