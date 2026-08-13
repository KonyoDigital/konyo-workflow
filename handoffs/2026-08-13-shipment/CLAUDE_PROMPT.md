# Paste this into a **new** Claude Code session

Working directory: `/Users/konyo/konyo-workflow`

You are fixing **Claude's own shipper**, not running it.

Read, in this order, and do not skip:

1. `handoffs/2026-08-13-shipment/00-ENGINE-PARITY.md`
2. `handoffs/2026-08-13-shipment/01-CLAUDE-SELF-FIX.md`
3. `~/.claude/skills/copy-drift/SKILL.md` (author at the install)
4. `~/.claude/skills/grok-second-eye/SKILL.md` §8 (the unpaid list — confirm each against the live file; do not trust this prompt over the file)

**Author here:** `/Users/konyo/.claude/workflows/konyo-workflow.js`  
**Then** copy to `automation/claude-code/konyo-workflow.js` only when install is a fast-forward of repo (content test, not mtime).

**Do not** start `/konyo-workflow`, `/KonyoLean`, `/KonyoMax`, or `/KonyoTiny` to apply this. Those load the file you are editing.

**Do not** delete or `{ignoreLock:true}` the live lock `~/.claude/workflows/.locks/Users-konyo-d2r_bible_tests.json` unless you have proven the holder process is dead (token `20260813T190335Z-28441`, tree `~/d2r_bible_tests`).

Implement **C1–C7** from `01-CLAUDE-SELF-FIX.md`. One theme per commit-quality hunk. After each:

- `node --check ~/.claude/workflows/konyo-workflow.js`
- grep the **install** path for the string you claim is gone
- for C1/C4/C5/C6: a small fixture or `load_harness.mjs` census if that tool still exists

Do not touch `Konyo-Grok.rhai`. Do not "also tidy" `meta.description` except C7.

End with a ship-skill seal: verdict, what changed, how proven (RED then GREEN), what was not checked, how to undo (`cp` from git / the `.prev` you took).

If you cannot prove a item, leave the code and mark it UNFIXABLE HERE. Missing evidence is not a pass.
