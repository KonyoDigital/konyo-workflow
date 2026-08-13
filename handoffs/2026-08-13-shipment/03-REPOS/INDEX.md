# Repo board — 2026-08-13 22:10 IDT

Read-only. `dirty` = `git status --porcelain` count. `ahead` / `behind` vs `@{u}` (`?` = no upstream).

| Repo | branch | dirty | ahead | behind | tip | Act? |
|---|---|---:|---:|---:|---|---|
| [konyo-workflow](konyo-workflow.md) | main | 0 | 0 | 0 | `91930ba` skill-forge audit | Engine shipment (this pack). JS description drift vs install. |
| [kai-achilles](kai-achilles.md) | main | 0 | **38** | 0 | `5607943` v406 | **Push decision.** 38 local stamps not on origin. |
| [achilles-revival](achilles-revival.md) | main | 3 | 0 | 0 | `e3fcd9b` v127 | Dirty audit/scar notes + a worktree path. |
| [d2r_bible_tests](d2r_bible_tests.md) | main | 0 | 0 | 0 | `887266e` wallpaper-guard | **LIVE LOCK.** Do not start a fleet here. |
| [d2r_bible_routines](d2r_bible_routines.md) | main | 0 | 0 | 0 | `5305a6b` no pkill TV | Clean. |
| [d2r_bible_routines/bridge_repo](d2r_bible_routines.md) | main | 0 | 0 | 0 | `fdf6dd4` status sync | Auto-sync tip today. |
| [edge-engine](edge-engine.md) | main | 0 | 0 | 0 | `9a657b9` v1 the-carve | Clean. |
| [predicter](predicter.md) | main | 4 | 0 | 0 | `8b28687` v396 | Uncommitted CSS + CHANGELOG. |
| [Grok-MCP](Grok-MCP.md) | main | 3 | 0 | 0 | `03937a0` 2026-04-18 | Loader fix **uncommitted**; `chats/` untracked. |
| [claude-workflow-starter](claude-workflow-starter.md) | main | 0 | 0 | 0 | `814382a` 2026-06-30 | Stale vs current workflow. |
| [facility-brief](facility-brief.md) | main | 0 | ? | ? | `b624a89` AZURE_SETUP | No upstream. |
| [karine-workflow-project](karine-workflow-project.md) | main | 3 | ? | ? | `cc89336` today | Desktop handoff tree, dirty. |
| [issta_macro](issta_macro.md) | main | 0 | ? | ? | `cde7b26` 2026-07-31 | No upstream. |
| [macro_issta_fibi](macro_issta_fibi.md) | main | 0 | ? | ? | `4118c92` 2026-07-31 | No upstream. |
| [d2r_tz_alert](d2r_tz_alert.md) | main | 0 | ? | ? | `5cdfcf0` 2026-06-15 | No upstream. |
| [coin_launch/site](coin_launch.md) | main | 0 | 0 | 0 | `928d8f6` promises gate | Parent `coin_launch/` is not a git repo. |
| [clawd](clawd.md) | HEAD | 123 | ? | ? | *no commits* | Unborn branch, huge untracked dump. |
| [.openclaw/workspace](openclaw.md) | HEAD | n/a | ? | ? | *no commits* | Unborn. |
| konyo-carve | — | — | — | — | — | **Not a git repo.** |
| d2r_loot_filter | — | — | — | — | — | **Not a git repo.** |
| CXPBottles / skill-lint | — | — | — | — | — | **Not a git repo.** |

## Priority if you only do three things

1. Leave `d2r_bible_tests` alone until the lock expires or the holder is proven dead.
2. Run [`../CLAUDE_PROMPT.md`](../CLAUDE_PROMPT.md) on the Claude engine.
3. Decide whether the 38 unpushed `kai-achilles` stamps are meant to be on origin.

## Not scanned as git (named so nobody thinks they were)

Home is not a repo. `~/Library`, `~/Desktop` (45k+ files), `~/d2r_claude_ai_profile`, `~/d2r_restore_points` were not walked as projects. Depth-3 `find` only.
