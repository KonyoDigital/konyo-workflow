# Installing the Konyo Workflow in Claude Desktop

`konyo-workflow.zip` in this folder is the installable skill.

## First time only — turn on the capability

**Settings → Capabilities → enable "Code execution and file creation".**
Skills will not appear without it. (Team/Enterprise: an org owner must also enable
Skills in Organization settings.)

Available on Free, Pro, Max, Team and Enterprise.

## Install

1. **Customize → Skills** in the Desktop sidebar
2. **+** → **Create skill**
3. **Upload a skill**
4. Choose **`konyo-workflow.zip`**
5. Toggle it on

## Using it

Just describe the work. It triggers on its own for anything that sounds like
finishing something properly, or ask for it by name: *"use the konyo workflow on
this."*

## If the upload is rejected

The one likely cause is filename case. This package uses `SKILL.md` (the Agent
Skills standard, and what Claude Code uses). If Desktop wants `skill.md` lowercase,
unzip, rename, and re-zip **with the folder as the root of the archive**:

```
konyo-workflow.zip
└── konyo-workflow/
    └── SKILL.md      <- rename to skill.md if required
```

Files loose in the zip root, or an extra wrapping folder, will both fail.

## Note

Claude Code skills in `~/.claude/skills/` are **not** visible to Claude Desktop —
Desktop loads skills from your Claude account, not your local disk. That is why this
has to be uploaded, and why installing it does not affect the Claude Code setup.
