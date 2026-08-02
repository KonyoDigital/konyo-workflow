# Grok Build workflows (Konyo)

| Slash | File | Role |
|-------|------|------|
| **`/konyo-workflow`** | `../automation/workflows/konyo-workflow.rhai` | Standard shipper · **LAW17 fat version bar** · **LAW18 painted-UI proof** |
| **`/konyo-workflow-max`** | `konyo-workflow-max.rhai` | MAX · Grok builds · **Claude Opus** third-eye · same fat bar · same painted-UI proof |

## Painted-UI proof (LAW18, both workflows)

Both Grok shippers now carry the same render gate the Claude Code ones do, and it is a **ship
blocker**. It reads the project's **CI verdict first** (`gh run list` / `gh run view --log-failed`)
and only drives a browser locally when there is no CI gate at all — a fleet of agents each starting
Chromium is how a laptop gets saturated. `available:false` is the honest answer when a project has
no UI verification; inventing a passing result, or installing a framework unasked, is itself a
violation.

## Fat version law (both workflows)

A version integer is earned only when the package is **fat**:

| Ship | Not a ship |
|------|------------|
| **≥3 user-visible outcomes** in one theme | One toast / one label / one `data-i18n` |
| **OR one structural bug** (root cause + verify + prevention) | Docs fluff alone |
| One changelog body that names the outcomes | Fifty thin `## vN` headers for one theme |

Maximize work **inside** the version. Do not climb the stamp for micro-edits.

## MAX doctrine

- **Host:** Grok (plan / build / synthesize)
- **Third-eye:** Claude **Opus** only (`claude -p --model opus`) — never Fable
- Fail closed if Opus did not run

Install:

```bash
cp automation/workflows/konyo-workflow.rhai ~/.grok/workflows/
cp grok/konyo-workflow-max.rhai ~/.grok/workflows/
```
