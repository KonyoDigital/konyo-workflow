# predicter

- **Path:** `/Users/konyo/predicter`
- **Tip:** `8b28687` 2026-08-03 00:29 — v396 actions.js was dirty too
- **Upstream:** even
- **Dirty (4):** `CHANGELOG.md`, `css/app.css`, `css/arena-v2.css`, `css/system.css`

## Upgrade / update

This repo is the measured case for "cost guardrail is not a capability ban" (`grok-second-eye`: MutationObserver freeze, `{used} of {cap}`, Full button). Render-gate specs + pre-push are the product guards. No engine copy lives here.

## Debug / fix summary

| Item | Evidence | Fix |
|---|---|---|
| Uncommitted CSS + changelog | porcelain 4 | Human review. Last committed ship already called out leftover dirty `actions.js` — same shape. |
| Tip is 10 days old | `2026-08-03` | Either these CSS edits are the next stamp, or they are abandoned. Do not leave them dirty across another engine pass. |

Do not run a volume max fleet ("30 versions") here. Lean/tiny slices if you ship the CSS.
