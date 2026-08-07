# Installing the Konyo Workflow in Claude Desktop

**Download:** [`konyo-workflow.skill`](https://github.com/KonyoDigital/konyo-workflow/raw/main/automation/claude-desktop/konyo-workflow.skill)
· or [`konyo-workflow.zip`](https://github.com/KonyoDigital/konyo-workflow/raw/main/automation/claude-desktop/konyo-workflow.zip)

Both files are identical in content. `.skill` is what Claude Desktop's uploader
expects; `.zip` works too and is easier to inspect first. **You should inspect it
first** — it is two markdown files and nothing else. No scripts, no dependencies,
nothing that runs.

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

### SOLO or MULTI

By default it runs **SOLO** — one conversation, structured self-review. Good for
most work, and honest about its limit: a model reviewing its own output has
blind spots in the same places it just built.

For anything expensive to get wrong — going to a client, published, sent widely,
spending money — say **"run this MULTI."** The build happens here; the review
happens in a **fresh conversation that never saw you think**, so it has to be
convinced by the work itself rather than by your reasoning. That is a real manual
step: new conversation, paste only the finished artifact and the original request.

If you have a second AI available, use that for the review instead — different
model family, different blind spots, strictly better. The skill never assumes you
have one.

## SCARS — the part that makes it get better

The zip contains `SCARS.md`, which starts empty on purpose.

When a run goes wrong in a way worth remembering, Claude prints a **scar block** at
the end: what broke, what it cost, how it was caught, the rule that prevents it, and
where that rule now lives. **Paste it into `SCARS.md`.** Claude reads that file at
the start of every run.

Claude cannot write to the skill folder itself, so this one paste is manual — and
skipping it loses the lesson silently, which is why the seal always tells you
whether a scar was produced.

Once **three scars pile up in the same area**, that area has earned its own skill:
create a sibling folder, move those rules into it as a procedure, and delete them
from `SCARS.md`. That is the skill carving new skills out of what actually went
wrong — and it is what makes the workflow good at *your* work rather than work in
general.

**Re-installing:** upload the new zip and toggle it on. `SCARS.md` lives inside the
skill, so **keep a copy of your entries before replacing the package** — a re-upload
replaces the folder, entries and all.

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
