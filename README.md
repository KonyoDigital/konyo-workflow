# The Konyo Workflow

**The ultimate shipper for AI / LLMs.**

Not a chatbot vibe. A way an AI **actually ships**: plan → build in sealed rounds → prove each round (tests, checks, eyes on evidence) → independent back-pass → fix until it holds → stamp a version → **ONE final ping** when the arc is done.

Fail closed: **ship**, **draft**, or **blocked** — never “looks fine.”  
Full version means real iteration (about **seven** design → implement → review → fix → re-verify → polish → seal exchanges), not a single lucky pass.

Any model. Any chat that can use tools and helpers.  
**The AI running the session is the engine** — it reviews its own work (a second model is optional).

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

## How it ships

| Stage | What happens |
|-------|----------------|
| **Plan** | Clear objective, checklist, success criteria |
| **Build in rounds** | One coherent deliverable per round — not a mega-dump |
| **Gate** | Prove it (tests, lint, smoke, evidence) before it counts |
| **Third-eye** | Independent back-pass by the **same AI** (or another model) |
| **Seal** | Version stamp + ship log; **draft** if not enough rounds, **blocked** if gates fail |
| **Final ping** | One summary table for the human when the arc ends |

Under the hood the AI may use parallel helpers (one owner per surface) so work doesn’t thrash — that’s mechanics, not the pitch.  
**The pitch is the ship quality bar.**

Not a product. Not a vendor. **How an AI ships serious work.**

**Does not rewrite other people’s projects’ lingo** — but it **does** require a real ship system:

| Required outcome | Meaning |
|------------------|---------|
| **Versions go up** | Each sealed ship bumps version and commits (their scheme, or a minimal one if missing) |
| **Ship trail** | Durable “what shipped” record (their changelog/log, or a simple CHANGELOG) |
| **Bug log** | Breakages remembered (their issues/tracker, or a simple BUGS file) |

Not required: Obsidian, a new GitHub org, or foreign names. **Same spirit as a perfected house system — adaptive form.**

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
