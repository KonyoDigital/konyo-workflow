# Claude workflow — self-fix shipment

**Target (author here):** `~/.claude/workflows/konyo-workflow.js`  
**Then copy to:** `~/konyo-workflow/automation/claude-code/konyo-workflow.js`  
**Sibling (same description drift):** `~/.claude/workflows/agent-army.js` — fix only if the same hunk exists; it is a **different product**, do not merge bodies.

**Do not** invoke `/konyo-workflow` or `/KonyoMax` to patch this file. Edit it in the main Claude loop. After each hunk: `node --check` on the install path, then `node ~/konyo-workflow/automation/claude-code/load_harness.mjs` if that harness still loads this file.

Paste [`CLAUDE_PROMPT.md`](CLAUDE_PROMPT.md) as the human message if you want a fresh Claude session to execute this.

---

## Already present (do not re-implement)

These comments exist in the **install** JS (19 `v32`–`v35` hits). Treat them as landed unless a re-read of the code path shows they do not execute:

- v32 §1.1 tiny ship predicate + mirror
- v32 §1.2 / **v34** lock key = tree (`LOCK_SLUG = lockKey || '__FROM_TREE__'`)
- v32 §1.3 `bail()` always `releaseLock()` (TDZ try/catch)
- v32 render: pass-with-failures cannot converge; `available:false` no longer silences three gates; re-run must not erase its blocker; Ship phase "not opened" lie; commit-what-you-fix
- v33 `pre_existing[]` subtracted by the **same** rule as the loop stop
- v35 dry-run + file-shaped `items[]` **refuses** (does not auto-set `apply:true`)

---

## Unpaid defects (fix these)

Each item: **where**, **what is wrong**, **the repair**, **how to prove RED then GREEN**. Source: live file + `~/.claude/skills/grok-second-eye/SKILL.md` §8, re-read 2026-08-13.

### C1 — Plan seat return is discarded

- **Where:** `:1907` `await thirdEyeAsk('plan', …)` — no assignment, no `blocker()`.
- **Wrong:** Grok can say "this plan solves the wrong problem" and the fleet builds it anyway. `THIRD_EYE_SEATS` is only read **after** `SHIPPABLE` (`:2634` vs log `:2710` / payload `:2867`).
- **Repair:** keep the return value. If `reached && severity==='blocking'`, `blocker('THE THIRD EYE REFUSED THIS PLAN', …)` **before** Build+Gate. Advisory concerns stay in the ledger. Do **not** invent a shippable-after-the-fact read.
- **RED:** stub `thirdEyeAsk` to return `{reached:true,severity:'blocking',concerns:['wrong problem']}` and assert Build+Gate never opens / `SHIPPABLE` false.
- **GREEN:** same stub with `severity:'none'` lets the run continue; payload `seats[]` still lists the plan seat.

### C2 — `grokHow` still briefs a dead MCP key

- **Where:** `:491–492` *"It is EXPECTED to fail with 'Incorrect API key provided'; that is a known-dead key"*
- **Wrong:** Both `Grok-MCP` loaders were fixed (`.env` first). Comment at `:422–426` already says FIXED. The courier prompt still teaches the opposite. Founding rule 3.
- **Repair:** MCP fallback is optional. If used: "if it fails, put the **actual** error in `reason`. Do not assume the key is dead." Delete the "known-dead key" sentence.
- **RED:** grep the install file for `known-dead key` — must be 0 after the fix.
- **GREEN:** the FIXED history in the block comment can stay (it is a diary). Only the **courier instruction** changes.

### C3 — CLI version prose is stale; invocation ignores its own perl wrapper

- **Where:** `:430` says `0.2.118`. Measured this run: `~/.grok/bin/grok` → **1.0.3** (`1a29d5bc12d4`). `:487` runs the CLI **without** the perl alarm documented at `:444–447`.
- **Wrong:** `--best-of-n` is gone; a hung grok still orphans (founding rule 6). `timeout` is still not on this Mac.
- **Repair:**
  1. Replace `0.2.118` with `1.0.3` (or drop the pin and say "whatever `GROK_CLI --version` prints").
  2. Make `grokHow` step 1 **the perl wrapper**, 180s, then `GROK_CLI --cwd … --prompt-file … --no-memory --disable-web-search --output-format plain`.
  3. Keep Bash-tool timeout 180000 as a backstop, not the only bound.
- **RED:** a courier prompt that still mentions `0.2.118` or a bare `GROK_CLI` with no `perl -e`.
- **GREEN:** one dry `perl … grok --version` via the wrapper exits 0; prompt contains `alarm`.

### C4 — Provenance check is non-blank, not provenance

- **Where:** schema `:476–477` + enforcement around `:470–475` (non-empty `command` and `raw_head`).
- **Wrong:** a courier that never ran the CLI can write a plausible command + 200 chars and count as `reached`.
- **Repair:** `reached:true` requires `command` to **contain** `GROK_CLI` (the exact path constant) **or** a documented MCP tool name. Otherwise downgrade to not-reached. Still not cryptographic; it closes the "any string" hole.
- **RED:** `{reached:true,command:'echo hi',raw_head:'looks like grok'}` must become `reached:false`.
- **GREEN:** command containing `/Users/konyo/.grok/bin/grok` stays reached.

### C5 — `degraded` is all-or-nothing

- **Where:** payload ~`:2871` (`TE_SPOKE.length === 0`).
- **Wrong:** 1 of 4 seats answered → `degraded:false` and prose "an independent model reviewed this run".
- **Repair:** `degraded = reached < attempted`. Publish `reached`, `attempted`, `seats[]`. Never a boolean that hides a 1/4 panel.
- **RED:** fixture 1 reached / 4 attempted → `degraded:true` (or drop the boolean and only ship the counts).
- **GREEN:** 4/4 → not degraded; 0/4 → degraded + no "independent model reviewed" sentence.

### C6 — `thirdEye.*` written after `SHIPPABLE`

- **Where:** `SHIPPABLE` ~`:2634`; seat summary ~`:2865–2876`.
- **Wrong:** the payload field cannot affect the verdict. A dead pre-ship seat is narration.
- **Repair:** compute seat ledger **before** `SHIPPABLE`. Pre-ship blocking already has teeth (`:2874`). Plan seat (C1) must join that same ledger. Thin-panel arithmetic already feeds `SHIPPABLE` — do not duplicate it; **order** the reads.
- **RED:** reorder test — `SHIPPABLE` formula source-contains `THIRD_EYE_SEATS` or a `teReached` const declared above it.
- **GREEN:** `node` harness: blocking plan seat ⇒ `shippable:false`.

### C7 — Repo description is a day behind the install

- **Where:** install mtime 2026-08-13 21:25 vs repo 2026-08-12 12:02. `diff` is **exactly** `meta.description` (four paths vs "three paths" wording). Same shape on `agent-army.js`.
- **Repair:** after C1–C6, `cp` install → repo for `konyo-workflow.js` only if `diff` is still that one line **or** you just authored at install. Do not copy repo → install.
- **RED:** `parity.sh` still prints DRIFT for `konyo-workflow.js`.
- **GREEN:** hashes equal.

### C8 — `agent-army.js` plan seat is the same hole

- **Where:** grok-second-eye: `agent-army.js:1696` identical discarded plan seat.
- **Repair:** same as C1, **in that file**, only if you are allowed to touch agent-army. Direction is public → install. If you only have the local install, patch install and say the public repo still owes a merge.
- **Do not** "while I am here" port unrelated konyo-workflow.js hunks into agent-army.

---

## Out of scope for this Claude pass (name them, do not fix)

- G5 budget epoch collision (`g5_grok_eyes.py` seconds vs `intake_grok_sub.mjs` milliseconds) — `d2r_bible_tests`, read-only this session.
- Vision "can it say NO" rehearsal — no home does this today.
- Public `konyo-workflow-grok` merge.
- Grok Rhai ports — that is `02-GROK-UPGRADE.md`.

## Stop conditions

- **PASSED** when C1–C7 have RED-then-GREEN evidence in the seal.
- **UNFIXABLE HERE:** C8 if you were not given `agent-army`.
- Do not invent a "three pass" ceiling.
