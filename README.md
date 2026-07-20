# 🏆 The Konyo Workflow — for Claude Code

A shipping method for big arcs of work: **agent army (one owner per file) · lead gates every merge · third-eye review rounds · a version per round · autonomous chain → ONE final ping.**

Invented and battle-tested by Konyo across hundreds of shipped versions. This repo contains only the method — install it as a Claude Code skill and your Claude will run arcs this way.

## Install (copy-paste into your terminal)

```bash
mkdir -p ~/.claude/skills/konyo-workflow && curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/SKILL.md -o ~/.claude/skills/konyo-workflow/SKILL.md && echo "✅ Konyo Workflow installed — restart Claude Code, then type: /konyo-workflow"
```

That's it. One folder, one file, nothing else touched.

## Use

In any Claude Code session:

- Type **`/konyo-workflow`** to invoke it explicitly, or
- Just say **"do this Konyo Workflow style"** — Claude will load the skill when the task is arc-shaped.

Claude will then: make a visible task board, spawn one agent per file, gate every merge with tests, run third-eye review rounds, ship a version per round, and finish with one final summary ping.

## What this is NOT

- No hooks, no scripts that run anything, no settings changes — it's a single instruction file.
- No project-specific content: bring your own repo, tests, and version scheme; the workflow adapts.

## Uninstall

```bash
rm -rf ~/.claude/skills/konyo-workflow
```
