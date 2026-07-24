# The Konyo Workflow

**Ultimate shipping method for any coding AI** — agent army (one owner per file) · lead gates every merge · third-eye pingpong with the **session LLM** · version per round · fail-closed honesty · **ONE final ping**.

Not locked to any vendor.  
**Whoever is driving the session is the engine.** Pingpong uses that stack’s agents (a second model is optional).

Battle-tested by Konyo across hundreds of shipped versions.

---

## Quick start

### One-line install (Mac / Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/install.sh | bash
```

Or clone / ZIP, then:

```bash
./install.sh
```

This installs into **`~/.konyo-workflow/`** (skill + optional automation scripts).

### Wire it into your coding agent

Point your agent’s **skills / rules / instructions / workflows** at:

| File | Role |
|------|------|
| `~/.konyo-workflow/SKILL.md` | Full method (primary) |
| `~/.konyo-workflow/workflows/*.rhai` | Optional automated gate runner (if your tool supports workflow scripts) |

How you attach a skill file varies by product — use whatever “custom skill / project rule / agent instruction” path your tool documents.

### Invoke

Ask for it by name:

- *“Run this with the Konyo Workflow.”*
- *“Ship it Konyo Workflow style.”*
- Or your tool’s skill slash-command if it auto-registers `konyo-workflow`.

---

## The idea

| Piece | Meaning |
|-------|---------|
| **Army** | Parallel specialists, **one owner per file** |
| **Lead gates** | Tests / lint / smoke before merge — claims aren’t facts |
| **Third-eye pingpong** | Independent review rounds on the **same session stack** (or another model if you have one) |
| **7-round seal** | Full version ≈ design → implement → back-pass → fix → re-verify → polish → seal |
| **Version per round** | Each sealed slice gets its own version/commit story |
| **ONE final ping** | Autonomous chain ends with one summary table for the human |

---

## What’s in this repo

| Path | What |
|------|------|
| `SKILL.md` | The method (install this) |
| `install.sh` | Copies files to `~/.konyo-workflow/` |
| `docs/SHIP_LAWS.md` | 16 ship laws (human-readable) |
| `automation/workflows/` | Optional machine-check scripts for tools that run them |

---

## Optional automation runner

If your coding agent can execute named workflow scripts from a workflows folder:

1. Copy `automation/workflows/*.rhai` into that tool’s workflows directory (see its docs), **or** use the copies under `~/.konyo-workflow/workflows/` if you symlink them.
2. Run the `konyo-workflow` workflow with an objective, e.g. pass `objective` + `target`.

Args (when using the script runner):

| Arg | Default | Meaning |
|-----|---------|---------|
| `objective` | required | What you are shipping |
| `target` | `HEAD` | Diff / branch / path |
| `version` | — | Version label |
| `strict` | `true` | Full bar + 7-round for ship |
| `rounds_min` | `7` | Min pingpong rounds when strict |
| `human_approve` | `false` | Pause when verdict is ship |
| `mode` | `audit` | or `plan-only` |

Laws detail: **[docs/SHIP_LAWS.md](./docs/SHIP_LAWS.md)**

---

## 16 ship laws (short)

1. TDD/tests for this change · 2. Review · 3. Security · 4. Docs/ops · 5. Rollback  
6. Patch discipline · 7. Syntax gates · 8. UX polish · 9. Interaction matrix · 10. Visual eyes  
11. Version stamps · 12. Ledger · 13. Deploy/live safety · 14. Self-enforcing CI  
15. Army zero-overlap · 16. **Seven-round pingpong**

Verdicts: **ship** | **draft** | **blocked** (fail closed).  
UI/deploy laws return **N/A + evidence** on stacks that don’t have those surfaces.

---

## Uninstall

```bash
rm -rf ~/.konyo-workflow
```

Also remove any skill/rule copy you added inside your coding agent’s own config.

---

## License

MIT

---

**Konyo Workflow** — one doctrine, any agent that can run tools and subagents.
