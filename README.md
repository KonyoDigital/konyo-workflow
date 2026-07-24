# The Konyo Workflow

**A shipping method for AI / LLMs.**

Army of workers (one owner per file) · lead gates every merge · third-eye pingpong with **the same AI** · version per round · fail-closed honesty · **ONE final ping**.

Any model. Any chat that can use tools and spawn helpers.  
**The AI running the session is the engine.** Pingpong is that AI reviewing its own work (a second model is optional).

Battle-tested by Konyo across hundreds of shipped versions.

---

## Quick start

```bash
curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/install.sh | bash
```

Or clone / ZIP, then `./install.sh`.

Installs to **`~/.konyo-workflow/`**.

Give your AI the method:

- Attach or paste **`~/.konyo-workflow/SKILL.md`** (or the copy in this repo) as instructions.
- Tell it: *“Use the Konyo Workflow.”* / *“Ship this Konyo Workflow style.”*

That’s it.

---

## What it is

| Piece | Meaning |
|-------|---------|
| **Army** | Parallel helpers, **one owner per file** |
| **Lead gates** | Tests / checks before merge — claims aren’t facts |
| **Third-eye pingpong** | Independent review rounds by **the same AI** (or another model if you want) |
| **7-round seal** | Full version ≈ design → implement → back-pass → fix → re-verify → polish → seal |
| **Version per round** | Each sealed slice gets its own version/commit story |
| **ONE final ping** | Long runs end with one summary for the human |

Not a product. Not a vendor lock. **Just how you make an AI ship serious work.**

---

## Repo layout

| Path | What |
|------|------|
| `SKILL.md` | The method — give this to the AI |
| `install.sh` | Copies into `~/.konyo-workflow/` |
| `docs/SHIP_LAWS.md` | 16 ship laws |
| `automation/workflows/` | Optional scripts if your setup can run them |

---

## 16 ship laws (short)

1. TDD/tests for this change · 2. Review · 3. Security · 4. Docs/ops · 5. Rollback  
6. Patch discipline · 7. Syntax gates · 8. UX polish · 9. Interaction matrix · 10. Visual eyes  
11. Version stamps · 12. Ledger · 13. Deploy/live safety · 14. Self-enforcing checks  
15. Army zero-overlap · 16. **Seven-round pingpong**

Verdicts: **ship** | **draft** | **blocked** (fail closed).  
If a law doesn’t apply (e.g. no UI), mark **N/A + evidence** — don’t fake it, don’t skip silently.

Full list: **[docs/SHIP_LAWS.md](./docs/SHIP_LAWS.md)**

---

## Uninstall

```bash
rm -rf ~/.konyo-workflow
```

---

## License

MIT

---

**Konyo Workflow** — a doctrine for AI LLMs that ship.
