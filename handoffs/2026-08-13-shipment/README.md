# Shipment — 2026-08-13 22:10 IDT

Read-only audit of every local git repo, plus two engine packs:

| File | Who runs it | What it is |
|---|---|---|
| [`01-CLAUDE-SELF-FIX.md`](01-CLAUDE-SELF-FIX.md) | **Claude Code**, on its own workflow | Paid bugs still live in `~/.claude/workflows/konyo-workflow.js` (v35 body). Paste [`CLAUDE_PROMPT.md`](CLAUDE_PROMPT.md) into a Claude session. Do **not** launch `/konyo-workflow` to fix `/konyo-workflow`. |
| [`02-GROK-UPGRADE.md`](02-GROK-UPGRADE.md) | **Grok Build**, on `/Konyo-Grok` | Port Claude JS **v32–v35** into Rhai, Grok-host first. Author at `~/.grok/workflows/Konyo-Grok.rhai`, then copy to the repo. |
| [`00-ENGINE-PARITY.md`](00-ENGINE-PARITY.md) | either | Which copy is source, which way each file flows, what `parity.sh` still does not see. |
| [`03-REPOS/INDEX.md`](03-REPOS/INDEX.md) | human | One-line board. Detail files sit next to it. |

**This pack does not edit engines.** It is the brief. Applying it is a later, scoped run.

## Scope of this pass

- **In:** inventory of local git repos under home (depth 3), engine copy map, Claude JS unpaid defects (read from the live install + `grok-second-eye`), Grok Rhai gap vs JS v32–v35, per-repo dirty/ahead/debug notes.
- **Out:** applying the engine patches, pushing `kai-achilles` 38 commits, clearing the live workspace lock, Kai daily-audit probes over SSH, public `konyo-workflow-grok` merge.

## How to use

1. Read `00-ENGINE-PARITY.md` so you do not copy the wrong way.
2. Claude: open `CLAUDE_PROMPT.md` in Claude Code, working tree `~/konyo-workflow`, author at **`~/.claude/workflows/konyo-workflow.js`** (install → repo).
3. Grok: open `02-GROK-UPGRADE.md` in Grok Build. Author at **`~/.grok/workflows/Konyo-Grok.rhai`**, then `cp` to repo + `~/.konyo-workflow/workflows/`.
4. Repos: `03-REPOS/INDEX.md` first. Do not treat a dirty tree as a bug list.

## Live caution (do not ignore)

A workspace lock is **live** on `~/d2r_bible_tests`:

- file: `~/.claude/workflows/.locks/Users-konyo-d2r_bible_tests.json`
- token: `20260813T190335Z-28441`
- expires_epoch: `1786658615` (~2.9 h from 22:10 IDT)
- task snippet: three UI defects on the live console at v1710

Do **not** `{ignoreLock:true}` and do **not** delete that file unless you have proven the holder is dead. Founding rule 6 / `process-port-discipline`: never `pkill` by name.

## Mode / verdict for this audit

SOLO read-only. No engine bytes were changed. See the seal at the bottom of `00-ENGINE-PARITY.md`.
