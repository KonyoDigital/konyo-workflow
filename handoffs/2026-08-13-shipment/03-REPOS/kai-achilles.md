# kai-achilles

- **Path:** `/Users/konyo/kai-achilles`
- **Tip:** `5607943` 2026-08-12 00:19 +0300 — v406 checks-marks-derived-echo
- **Tree:** clean
- **Upstream:** **38 commits ahead**, 0 behind

## Upgrade / update

No engine work lives here. The product question is the **unpushed stack** v393–v406 (and earlier in the 38). That is a human push/ship decision, not an audit defect.

## Debug / fix summary

| Item | Evidence | Fix |
|---|---|---|
| Origin does not have v406 | `git rev-list --count origin/main..HEAD` = 38 | `git push` only if those stamps were meant to ship; do not rewind VERSION |
| Lock-key history | JS v34 measured a `tests` key colliding this repo with `d2r_bible_routines` | already in Claude JS; do not re-diagnose unless a new mismatch log appears |

## Do not

Start `/Konyo-Grok` `{apply:true}` here while any other fleet holds a tree lock. This repo is often the other half of a lock mismatch.
