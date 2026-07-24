# 🏆 The Konyo Workflow

**Ultimate shipping method** — agent army (one owner per file) · gates every merge · SuperGrok third-eye · version per round · **7-round seal** · fail-closed **ship / draft / blocked**.

Works on **any project**. Strict by default. Easy for family to download.

Battle-tested by Konyo across hundreds of shipped versions.

---

## For my sister (and anyone non-technical) — easiest path

1. Open: **https://github.com/KonyoDigital/konyo-workflow**
2. Click green **Code** → **Download ZIP**
3. Unzip to Desktop
4. Pick your tool below and follow the 3 steps

### Install for **Grok Build** (Mac)

Open **Terminal**, paste (adjust folder name if ZIP extracted differently):

```bash
mkdir -p ~/.grok/workflows
cp ~/Desktop/konyo-workflow-main/grok/.grok/workflows/*.rhai ~/.grok/workflows/
echo "✅ Grok: Konyo Workflow installed"
```

Then in Grok Build:

```text
/workflow konyo-workflow {"objective":"My first ship check","target":"HEAD"}
```

Full Grok guide: **[grok/INSTALL.md](./grok/INSTALL.md)**

### Install for **Claude Code** (one liner)

```bash
mkdir -p ~/.claude/skills/konyo-workflow && curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/SKILL.md -o ~/.claude/skills/konyo-workflow/SKILL.md && echo "✅ Claude: Konyo Workflow installed — restart Claude Code, then type: /konyo-workflow"
```

Or run:

```bash
./install.sh
```

---

## What’s in this repo

| Path | What |
|------|------|
| `SKILL.md` | Claude Code skill (instruction method) |
| `install.sh` | One-click Claude install |
| `grok/.grok/workflows/konyo-workflow.rhai` | **Grok ultimate shipper** (16 laws, automated gate run) |
| `grok/.grok/workflows/*.rhai` | Bonus: review, security, ship-ready, flaky-tests |
| `grok/docs/SHIP_LAWS.md` | Human-readable law list |
| `grok/INSTALL.md` | Grok install detail |

---

## Grok — run the ultimate shipper

```text
/workflow konyo-workflow {"objective":"Add rate limits to the API","target":"HEAD"}

/workflow konyo-workflow {"objective":"v770 theatre polish","version":"v770","target":"HEAD"}

/workflow konyo-workflow {"objective":"Hotfix","target":"HEAD","strict":false}

/workflow konyo-workflow {"objective":"Prod ready","target":"HEAD","human_approve":true}
```

Watch: `/workflows`

### Args (Grok)

| Arg | Default | Meaning |
|-----|---------|---------|
| `objective` | required | What you are shipping |
| `target` | `HEAD` | Diff / branch / path |
| `version` | — | Version label |
| `strict` | `true` | Full bar + 7-round for ship |
| `rounds_min` | `7` | Min pingpong rounds when strict |
| `human_approve` | `false` | Pause when verdict is ship |
| `mode` | `audit` | or `plan-only` |

---

## General + strict (how it fits every project)

Gates return **PASS / FAIL / N/A(+evidence)**:

- Web app → full UX, visual, deploy heat  
- Python library → UI laws **N/A** with proof, still tests/security/review/7-round  

Same ceremony. Adaptive surfaces. No silent skips.

### 16 ship laws (short)

1. TDD/tests for this change · 2. Review · 3. Security · 4. Docs/ops · 5. Rollback  
6. Patch discipline · 7. Syntax gates · 8. UX polish · 9. RINSE-class interaction · 10. Visual eyes  
11. Version stamps · 12. Ledger · 13. Deploy/live safety · 14. Self-enforcing CI  
15. Army zero-overlap · 16. **Seven-round SuperGrok pingpong**

Verdicts: **ship** | **draft** | **blocked** (fail closed).

---

## Claude Code — use

- Type **`/konyo-workflow`**, or  
- Say **“do this Konyo Workflow style”**

Claude: task board → one agent per file → gate merges → third-eye rounds → version per round → one final ping.

---

## What this is NOT

- Not auto-deploy to production (gates protect; humans/tools still ship when ON AIR is clear)  
- Not project-specific glue — bring your own tests and version scheme  

---

## Uninstall

**Claude:**

```bash
rm -rf ~/.claude/skills/konyo-workflow
```

**Grok:**

```bash
rm -f ~/.grok/workflows/konyo-workflow.rhai
# optional extras:
# rm -f ~/.grok/workflows/{review-changes,security-pass,ship-ready,find-flaky-tests}.rhai
```

---

## License

MIT

---

**Konyo Workflow** — one doctrine, Claude skill + Grok ultimate shipper, ready for the whole family.
