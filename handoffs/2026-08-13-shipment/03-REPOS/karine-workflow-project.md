# karine-workflow-project

- **Path:** `/Users/konyo/karine-workflow-project`
- **Tip:** `cc89336` 2026-08-13 21:09 — baseline: konyo-workflow skills family handed off from Desktop/Cowork
- **Upstream:** none
- **Dirty (3):** `M tools/validate_skill.py`, `?? .claude/settings.json`, `?? .claude/worktrees/`

## Upgrade / update

This is Karine's fork / skills family, not the Grok host. Desktop variants also live under `~/konyo-workflow/automation/claude-desktop/variants/`.

## Debug / fix summary

| Item | Evidence | Fix |
|---|---|---|
| `validate_skill.py` dirty same day as baseline | porcelain | Finish or revert that edit before treating the baseline as sealed |
| Untracked worktrees + settings | `?? .claude/` | Isolation leftovers — do not commit unless they are the product |

Do not copy this tree over `~/.claude/skills/ship-skill` or `~/.grok/skills/konyo-workflow-konyo`.
