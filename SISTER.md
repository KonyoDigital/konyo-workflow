# For sister (Claude only — no Grok)

You do **not** need Grok, SuperGrok, or any xAI account.

## Install (Mac)

Open **Terminal**, paste this whole line, press Enter:

```bash
mkdir -p ~/.claude/skills/konyo-workflow && curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/SKILL.md -o ~/.claude/skills/konyo-workflow/SKILL.md && echo "✅ Done"
```

## Use

1. Open **Claude Code** on your project  
2. Type: **`/konyo-workflow`**  
3. Or say: *“Please ship this using the Konyo Workflow.”*

Claude will use **its own agents** for the army and for review pingpong. That’s correct.

## What “pingpong” means here

Not “talk to Grok.”  
It means: build → **independent Claude review agent** → fix → re-check → … about **7** solid rounds before calling something a full version.

## Link

https://github.com/KonyoDigital/konyo-workflow
