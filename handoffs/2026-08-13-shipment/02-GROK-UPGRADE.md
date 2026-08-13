# Grok workflow — upgrade shipment (host-first)

**Author here:** `~/.grok/workflows/Konyo-Grok.rhai`  
**Then copy (byte-identical) to:**

- `~/konyo-workflow/automation/workflows/Konyo-Grok.rhai`
- `~/.konyo-workflow/workflows/Konyo-Grok.rhai`

Those three are **already equal** (`46a57951`, 122487 bytes). Keep them that way.

`~/.grok/workflows/konyo-workflow.rhai` is a **redirect stub**. Do not put the implementer back in that filename. Public `konyo-workflow-grok` is a **merge** target (de-identifies private repo names).

**Do not launch `/Konyo-Grok` to edit itself** unless the human explicitly wants a fleet. This brief is for a main-loop Grok edit, or a tiny `items[]` run **after** the human says apply.

---

## What "Grok-first" means

Reverse-engineered from Claude JS v32–v35, then **translated to this host**. Not a paste.

| Claude JS fact | Grok host equivalent |
|---|---|
| `spawn()` + model ladder | `agent(prompt, #{ capability_mode, label, phase, output_schema })` — tier is a **depth directive in the prompt**, never a silent model claim |
| Grok CLI as third eye | **Claude CLI** as third eye (`claude -p --model opus`). `thirdEye:"grok"` stays labelled degraded |
| `timeout` binary | **not installed**. Bound Claude the same way JS should bound Grok: perl alarm, or the agent's own timeout |
| `bail()` + `releaseLock()` | Rhai `complete()` — every early `complete()` that holds `lock_acquired` must release first. Empty-plan already does (`:1150`). Hunt **siblings** |
| `LOCK_SLUG = '__FROM_TREE__'` | **Already there** (`:669` KEY=$TREE). Do not re-port v34 |
| `node --check` / `load_harness.mjs` | `workflow` tool `{ validate_only: true }` on **one** path + `bash ~/.grok/workflows/v27_grok_safeguard_proof.sh ~/.grok/workflows/Konyo-Grok.rhai` |

---

## Already on Grok (do not duplicate)

- Shared lock dir, tree key, home refuse, integer expiry purge
- v28.1 early lock release on empty-plan
- Dry-run + **task-prose** file-shape refuse (`:716–740`) — **weaker than JS v35** (does not see `items[]`)
- v26 render loop, v31 LAW19‖first-render `parallel()`, images_na fail-closed
- v30 meter caps / volume warning
- v32 **Grok-sense**: record scar at failure + run-not-inspect (not JS lock v32)
- v33 capture-per-round / carve-per-arc (JS v31 parity)
- Plan third-eye **does** store the answer in `third_eye_seats` (`:1211`). It still does **not** block Build on a blocking Claude reply (same unpaid hole as Claude C1)

---

## Port these (by defect)

### G1 — v35: `items[]` is file-shaped even when the task prose is not

- **JS:** `:1401–1434` — `_fileShapedItems` + refuse, never auto-`apply:true`.
- **Grok now:** `:716` only scans `task` for write/create/save/edit + file suffix.
- **Repair:** if `!apply_mode` and `items_arg` has any item with a non-empty `file`, `complete()` blocked with `refused: "dry-run with a file-shaped items[] work list"`. Same wording as JS. **Do not** flip `apply_mode` to true.
- **RED:** `{task:"review the plan", apply:false, items:[{file:"/tmp/x",instruction:"edit"}]}` must refuse before Build.
- **GREEN:** same with `apply:true` proceeds; prose-only dry-run with no items still refuses only if the existing write/file heuristic hits.

### G2 — JS v32 §1.3: every abort releases the lock

- **Hunt:** every `complete(` while `lock_acquired`. Empty-plan (`:1150`) and (check) triage-direct are the known sites. A dry-run refuse at `:731` happens **after** lock only when `apply_mode` — so that path is unlocked already. Apply-mode aborts later (ceiling, empty after trim, lock held by other) must release.
- **Repair:** one helper `fn release_lock_if_held()` and call it immediately before **every** `complete(` that can run after acquire. Rhai has no `bail()` wrapper — the helper **is** the wrapper. Do not add 14 copy-pasted agent() blocks.
- **RED:** count `complete(` after the lock block; each must be preceded (same branch) by the helper or sit on `!apply_mode`.
- **GREEN:** a forced early `complete` in apply mode deletes the lock file whose token matches.

### G3 — Plan third-eye must be able to refuse the plan

- **Now:** `:1209–1216` logs EMPTY or stores 2000 chars, then Build always starts.
- **Repair (Grok-native):** give the Claude courier an `output_schema` `{reached, verdict, severity, concerns, reason}` — not "plain text is fine". If `reached && severity=="blocking"`, release lock, `complete` blocked **before** Build. If Claude is empty, seat stays empty (already correct — do **not** fill with Grok).
- **Claude invocation:** do **not** use `timeout`. Use perl alarm 180 around `/usr/local/bin/claude -p --model opus --output-format text` with a **prompt file** (positional `-p` on a huge plan can be brittle; match grok-second-eye's `--prompt-file` discipline where Claude CLI supports it, else Write a temp file and `claude -p "$(cat file)"` in one bash line).
- **RED:** schema fixture `severity=blocking` ⇒ no builder agents.
- **GREEN:** `severity=none` ⇒ builders run; empty Claude ⇒ `spoke:false`, builders still run, payload says seat empty.

### G4 — Render v32/v33: pass-with-failures, pre_existing, available:false

- **JS:** `:2337–2531` cluster.
- **Grok:** render_schema (`:167`) has `pass` / `failures` / `images` / `images_na_reason`. Confirm in the loop body (search `renderGate` / `rl_plan`) that:
  1. `pass==true` AND `failures` non-empty **cannot** stop as PASSED.
  2. `available==false` still runs LAW17 / LAW19 / pre-ship (or names them N/A with reason — never silent skip).
  3. Optional: `pre_existing[]` with proof, subtracted by the **same** rule as the stop condition.
- Port only what the Rhai loop does not already do. Read the loop before writing. If (1) already holds, write "already present" in the seal with the line number — do not add a second check.

### G5 — Tiny ship predicate (JS v32 §1.1)

- **JS:** tiny used a flag that could never become shippable.
- **Grok:** read the `shippable` / `tiny_q` formula near the Ship phase (`:2104+`, `:2133`). If tiny+apply can never set `shippable:true` when gates passed, that is the port. If it already can, document the predicate and skip.

### G6 — Proof script + parity.sh

- Copy `~/.grok/workflows/v27_grok_safeguard_proof.sh` → repo (install is 10 lines ahead: v32 scar/run-not-inspect contracts).
- Extend the **install** proof with G1–G3 strings after they land (`file-shaped items[]`, `release_lock_if_held`, plan-seat `severity`).
- Add to `parity.sh`:
  - `Konyo-Grok.rhai` install → repo
  - `Konyo-Grok.rhai` install → `~/.konyo-workflow/workflows/`
  - `v27_grok_safeguard_proof.sh` install → repo
- Run the proof **against `Konyo-Grok.rhai`**, not the 2698-byte stub.

### G7 — Skill pointer hygiene (optional, small)

- `~/.konyo-workflow/SKILL.md` points only at Claude `ship-skill`. Add one line: Grok personal copy is `~/.grok/skills/konyo-workflow-konyo/SKILL.md` (byte-identical today). Do not paste the 62k method into `~/.konyo-workflow/`.

---

## Do not do these on Grok

- Default `thirdEye` to Grok. That makes the panel one family.
- Copy `konyo-workflow.js` into the rhai.
- Copy local Rhai over `konyo-workflow-grok` (de-identification boundary).
- Re-introduce `/konyo-workflow` as a second implementer.
- Stack carving-skill + this fleet as a default.

## Prove

```bash
bash ~/.grok/workflows/v27_grok_safeguard_proof.sh ~/.grok/workflows/Konyo-Grok.rhai
bash ~/konyo-workflow/parity.sh
# after G6, both must be 0 drift on the new pairs
```

`validate_only` on `/Konyo-Grok` with `{task:"noop", apply:false}` catches compile + one canned path only. It does not prove G1–G5. Say N/A for unrun live paths.
