# achilles-revival

- **Path:** `/Users/konyo/achilles-revival`
- **Tip:** `e3fcd9b` 2026-08-13 21:52 +0300 — v127 the-reader-needed-no-tab-after-all
- **Upstream:** even
- **Dirty (3):**
  - `M .claude/worktrees/achilles-webhook-url-truth`
  - `M POST_SHIP_AUDIT.md`
  - `M kai_scars_pending.md`

## Upgrade / update

None for the Grok/Claude engines. Working-tree leftovers look like **post-ship notes + a worktree pointer**, not unfinished product code. Confirm before commit: scars pending should go through `SCARS.md` / `tools/scar.py` if that is this repo's rule, not sit dirty.

## Debug / fix summary

| Item | Evidence | Fix |
|---|---|---|
| Uncommitted audit/scar files | `git status --porcelain` | Human: keep, commit, or revert. Do not auto-commit. |
| Worktree path dirty | `.claude/worktrees/…` | Isolation leftover — check the worktree is merged or disposable. |
