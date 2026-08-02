# Grok Build workflows (Konyo)

| Slash | File | Role |
|-------|------|------|
| **`/konyo-workflow`** | `../automation/workflows/konyo-workflow.rhai` | Standard shipper · **LAW17 fat version bar** |
| **`/konyo-workflow-max`** | `konyo-workflow-max.rhai` | MAX · Grok builds · **Claude Opus** third-eye · same fat bar |

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
