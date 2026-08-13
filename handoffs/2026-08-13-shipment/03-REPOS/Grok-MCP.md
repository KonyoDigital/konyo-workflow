# Grok-MCP

- **Path:** `/Users/konyo/Grok-MCP`
- **Tip:** `03937a0` 2026-04-18 — docstring for tool calling (**four months** behind the loader fix)
- **Dirty:** `M main.py`, `M src/utils.py`, `?? chats/`

## Upgrade / update

The **loader fix is in the working tree and not on origin.** grok-second-eye says both loaders now load `.env` first (`main.py:10–11`, `utils.py:16–17`, `override=False`). Claude JS courier prompt still claims the key is dead (Claude C2).

Two copies of one credential routine = copy-drift. Change both or neither.

## Debug / fix summary

| Item | Evidence | Fix |
|---|---|---|
| Fix uncommitted | dirty `main.py` + `src/utils.py` vs tip April | Commit + say so; restart any running MCP (key bound at import) |
| `chats/` untracked | porcelain | Do not commit transcripts unless that is the product |
| Claude still briefs dead key | JS `:491` | Claude self-fix C2 — not this repo |
| `~/.claude.json` env override | second-eye §3 | already supposed `env: {}`; re-measure if MCP 400s |

## Do not

Print or commit the key. Report location + length only.
