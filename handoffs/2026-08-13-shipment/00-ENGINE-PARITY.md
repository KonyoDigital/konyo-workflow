# Engine parity — measured 2026-08-13 22:10 IDT

`bash ~/konyo-workflow/parity.sh` was run. One local pair drifted. Several load-bearing copies are **not on that script**.

## Direction (do not guess)

From `copy-drift` + `parity.sh` header:

| file | direction | author here |
|---|---|---|
| `konyo-workflow.js` | **install → repo** | `~/.claude/workflows/konyo-workflow.js` |
| `agent-army.js` | **public → install** (separate product) | not this repo's job unless you are in `agent-army` |
| `konyo-workflow.rhai` | install → repo → public (**last hop is a MERGE**) | stub only now |
| `Konyo-Grok.rhai` | **install → repo** (same spirit as the rhai) | `~/.grok/workflows/Konyo-Grok.rhai` |
| `konyo-workflow-max.rhai` | public → local | deprecated stub |
| `v27_grok_safeguard_proof.sh` | install → repo (not listed in parity.sh) | `~/.grok/workflows/v27_grok_safeguard_proof.sh` is newer |
| ship-skill / konyo-workflow-konyo SKILL | personal method | `~/.claude/skills/ship-skill/SKILL.md` ≡ `~/.grok/skills/konyo-workflow-konyo/SKILL.md` |

Public `konyo-workflow-grok` **genericises private repo names**. Never `cp` the local body over it.

## Measured hashes

| copy | bytes | md5-8 | note |
|---|---:|---|---|
| `~/.claude/workflows/konyo-workflow.js` | 246426 | `66915bac` | **live Claude engine** (mtime 2026-08-13 21:25) |
| `~/konyo-workflow/automation/claude-code/konyo-workflow.js` | 246993 | `57650618` | repo. **1 line behind**: `meta.description` only |
| `~/.claude/workflows/agent-army.js` | 219130 | `8af84dbe` | install |
| `~/konyo-workflow/automation/claude-code/agent-army.js` | 219602 | `cf7c04b1` | repo. same 1-line description drift |
| `~/.grok/workflows/Konyo-Grok.rhai` | 122487 | `46a57951` | **live Grok implementer** |
| `~/konyo-workflow/automation/workflows/Konyo-Grok.rhai` | 122487 | `46a57951` | in sync |
| `~/.konyo-workflow/workflows/Konyo-Grok.rhai` | 122487 | `46a57951` | in sync |
| `konyo-workflow.rhai` (all 3) | 2698 | `b7352471` | redirect stub → `/Konyo-Grok` |
| `konyo-workflow-max.rhai` (repo + konyo-workflow install) | 6887 | `18c55d93` | deprecation stub |
| `~/.grok/workflows/v27_grok_safeguard_proof.sh` | 5322 | `e55dca36` | has v32 contract strings |
| `~/konyo-workflow/automation/workflows/v27_grok_safeguard_proof.sh` | 4821 | `bcc1e3bb` | missing those 10 lines |
| Grok skill SKILL.md | 62520 | `dfb8b0dc` | = Claude `ship-skill` SKILL.md |
| `~/konyo-workflow/SKILL.md` | 10249 | — | **different document** (public method, not the personal skill) |
| `~/.konyo-workflow/SKILL.md` | 1005 | — | pointer: "read ship-skill" |

Remote (git protocol, not raw/main cache):

- `konyo-workflow-grok/konyo-workflow.rhai` = **113859 bytes** vs local stub **2698**. Expected: public still ships a full body; local renamed the body to `Konyo-Grok.rhai`. A size gap here is **not** "copy the public file back".
- `agent-army/agent-army.js` remote 218945 vs install 219130.

## What parity.sh does not see

- `Konyo-Grok.rhai` (the actual Grok shipper)
- `v27_grok_safeguard_proof.sh`
- `~/.grok/skills/konyo-workflow-konyo/SKILL.md`
- Claude `meta.description` vs repo (it hashes the whole JS file, so it **did** flag JS drift)

Add those four pairs on the next Grok upgrade pass.

## Version labels (do not confuse the two v32s)

| engine | claims | actually has |
|---|---|---|
| Claude JS install | v26 loop … **v35** items[] file-shape | v32–v35 comments **are** in the file (19 hits) |
| Grok `Konyo-Grok.rhai` | **v33** = Claude JS **v31** parity (2026-08-11) | Capture/carve yes. **Missing JS v32–v35 lock/render/tiny/items guards** |
| Grok "v32" in the rhai | scar-at-failure + run-not-inspect | a **different** v32 from Claude's lock/tiny-ship v32 |

Claude JS v32 and Grok rhai v32 are **not the same patch**. Port by **defect**, not by number.

## Host flip (Grok-first)

| | Claude Code host | Grok Build host |
|---|---|---|
| Engine | `konyo-workflow.js` | `Konyo-Grok.rhai` (`/konyo-workflow` is a **BLOCKED redirect**) |
| Third eye default | **Grok CLI** (`~/.grok/bin/grok` → 1.0.3) | **Claude CLI** (`/usr/local/bin/claude` → 2.1.231) |
| Same-family stand-in | `thirdEye:'claude'` labelled degraded | `thirdEye:"grok"` labelled degraded |
| Write boundary | harness tools | `capability_mode` |
| Lock dir | `~/.claude/workflows/.locks/` | **same dir** |

The family that counts is the one that is **not** the host. Do not "upgrade" Grok by defaulting the third eye to Grok.

## Seal of this audit file

- **Verdict:** DRAFT on "all engines healthy"; BLOCKED is the wrong word — the *engines run*, they have unpaid defects.
- **What was checked:** hashes, `diff -u` (JS = 1 description line; agent-army = 1 description line), version-marker grep, lock file contents + epoch vs `time.time()`, grok/claude `--version`, `parity.sh` output, Konyo-Grok lock/third-eye/dry-run slices, grok-second-eye unpaid list vs live JS lines.
- **What was NOT checked:** executing either shipper; `v27_grok_safeguard_proof.sh` against current `Konyo-Grok.rhai`; public 3-way merge; `load_harness.mjs` census; whether the live lock's holder process is still alive.
