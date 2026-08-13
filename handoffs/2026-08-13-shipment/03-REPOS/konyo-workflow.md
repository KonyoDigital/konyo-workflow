# konyo-workflow

- **Path:** `/Users/konyo/konyo-workflow`
- **Remote:** `https://github.com/KonyoDigital/konyo-workflow.git`
- **Tip:** `91930ba` 2026-08-13 20:04 +0300 — skill-forge audited against its own rules
- **Tree:** clean, even with origin/main

## Upgrade / update

This **is** the shipment home (`handoffs/2026-08-13-shipment/`). After engines move:

1. Claude install JS → `automation/claude-code/konyo-workflow.js` (1-line description drift today).
2. Grok: keep `Konyo-Grok.rhai` three-way equal; extend `parity.sh`; sync `v27_grok_safeguard_proof.sh` repo ← install.
3. Do not resurrect a second implementer in `konyo-workflow.rhai`.

## Debug / fix summary

| Item | Evidence | Fix owner |
|---|---|---|
| JS install ≠ repo | `diffstat` 1 line, `meta.description` | Claude self-fix C7 |
| agent-army.js same drift | 1 line, install newer | only if touching agent-army |
| proof.sh repo behind | 4821 vs 5322 bytes | Grok G6 |
| parity.sh blind to Konyo-Grok | script pairs listed in `00-ENGINE-PARITY.md` | Grok G6 |
| public grok rhai 113859 vs stub 2698 | `parity.sh` remotes | merge, never copy |

## Do not

Run a fleet in this tree while also editing `~/.claude/workflows/konyo-workflow.js` without a lock on **both** minds — the install is outside this git root.
