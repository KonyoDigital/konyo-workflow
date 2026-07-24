# 🏆 The Konyo Workflow

**Ultimate shipping method for any coding AI** — agent army (one owner per file) · lead gates every merge · **third-eye pingpong with whatever LLM is running** · version per round · fail-closed honesty · **ONE final ping**.

Not locked to Grok. Not locked to Claude.  
**Whoever is driving the session is the engine.** Pingpong / third-eye uses that stack’s agents (or a second model if you have one).

Battle-tested by Konyo across hundreds of shipped versions.

---

## Quick start (Claude Code — no Grok needed)

Works with **Claude Code** (or Claude with skills). **No Grok account required.**

### Easiest: one Terminal line (Mac)

```bash
mkdir -p ~/.claude/skills/konyo-workflow && curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/SKILL.md -o ~/.claude/skills/konyo-workflow/SKILL.md && echo "✅ Konyo Workflow installed — restart Claude Code, then type: /konyo-workflow"
```

### Or: Download ZIP

1. Open **https://github.com/KonyoDigital/konyo-workflow**
2. Green **Code** → **Download ZIP** → unzip  
3. Terminal:

```bash
mkdir -p ~/.claude/skills/konyo-workflow
cp ~/Desktop/konyo-workflow-main/SKILL.md ~/.claude/skills/konyo-workflow/
```

4. Restart Claude Code → type **`/konyo-workflow`**  
   Or say: *“do this the Konyo Workflow way.”*

That’s the whole product for most people: **one file, `SKILL.md`.**

---

## The idea (LLM-agnostic)

| Piece | Meaning |
|-------|---------|
| **Army** | Parallel specialists, **one owner per file** |
| **Lead gates** | Tests / lint / smoke before merge — claims aren’t facts |
| **Third-eye pingpong** | Independent review rounds using **the same product’s agents**, or another model if available — **not** “must be SuperGrok” |
| **7-round seal** | Full version = at least ~7 design → implement → back-pass → fix → re-verify → polish → seal exchanges (with the LLM you have) |
| **Version per round** | Each sealed slice is its own version/commit story |
| **ONE final ping** | Autonomous chain ends with one summary table for the human |

If you’re on **Claude** → Claude reviews Claude.  
If you’re on **Grok** → Grok reviews Grok.  
If you have two models → even better for third-eye. **Optional, not required.**

---

## Install matrix

| Tool | Needs Grok? | Install |
|------|-------------|---------|
| **Claude Code** | No | Curl one-liner above / ZIP `SKILL.md` |
| **Grok Build** (optional) | Yes | See [grok/INSTALL.md](./grok/INSTALL.md) — automated gate runner |

```bash
./install.sh claude   # default (Claude skill)
./install.sh grok     # only if you use Grok Build
./install.sh all      # both
```

---

## Claude — use

- **`/konyo-workflow`**
- or *“ship this Konyo Workflow style”*

Claude will: task board → army → gate each merge → third-eye rounds (with Claude agents) → version stamps → one final ping.

Full laws: **[SKILL.md](./SKILL.md)**

---

## Grok Build — optional automation

If *you* have Grok Build, the same doctrine runs as a workflow script:

```text
/workflow konyo-workflow {"objective":"What you are shipping","target":"HEAD"}
```

Details: **[grok/INSTALL.md](./grok/INSTALL.md)** · laws: **[grok/docs/SHIP_LAWS.md](./grok/docs/SHIP_LAWS.md)**

---

## Uninstall

**Claude:**

```bash
rm -rf ~/.claude/skills/konyo-workflow
```

**Grok (optional):**

```bash
rm -f ~/.grok/workflows/konyo-workflow.rhai
```

---

## License

MIT

---

**Konyo Workflow** — one doctrine, any LLM that can run agents. Pingpong with the host model.
