#!/usr/bin/env bash
# Konyo Workflow installer — method for any AI/LLM
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
DEST="${KONYO_WORKFLOW_HOME:-$HOME/.konyo-workflow}"
BASE="https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main"

mkdir -p "$DEST/workflows"

if [[ -f "$ROOT/SKILL.md" ]]; then
  cp "$ROOT/SKILL.md" "$DEST/SKILL.md"
  [[ -f "$ROOT/docs/SHIP_LAWS.md" ]] && cp "$ROOT/docs/SHIP_LAWS.md" "$DEST/SHIP_LAWS.md" || true
  if [[ -d "$ROOT/automation/workflows" ]]; then
    cp "$ROOT/automation/workflows/"*.rhai "$DEST/workflows/" 2>/dev/null || true
    # The Grok CLI loads from ~/.grok/workflows, and until now ONLY grok/*.rhai was copied
    # there — so ~/.grok/workflows/konyo-workflow.rhai (the standard shipper) had no update
    # path at all and silently rotted. Found it 145 lines behind the repo, missing LAW17,
    # LAW18 and LAW19 entirely: /konyo-workflow on Grok was running a shipper with three
    # fewer blocking gates than the same-named one on Claude Code, which is exactly the
    # cross-host drift the law table was written to stop.
    if [[ -d "${HOME}/.grok/workflows" ]]; then
      cp "$ROOT/automation/workflows/"*.rhai "${HOME}/.grok/workflows/" 2>/dev/null || true
    fi
  fi
  # Grok Build MAX (third-eye = Claude CLI)
  if [[ -d "$ROOT/grok" ]]; then
    cp "$ROOT/grok/"*.rhai "$DEST/workflows/" 2>/dev/null || true
    if [[ -d "${HOME}/.grok/workflows" ]]; then
      cp "$ROOT/grok/"*.rhai "${HOME}/.grok/workflows/" 2>/dev/null || true
    fi
  fi
else
  curl -fsSL "$BASE/SKILL.md" -o "$DEST/SKILL.md"
  curl -fsSL "$BASE/docs/SHIP_LAWS.md" -o "$DEST/SHIP_LAWS.md" 2>/dev/null || true
  for f in konyo-workflow review-changes security-pass ship-ready find-flaky-tests; do
    curl -fsSL "$BASE/automation/workflows/${f}.rhai" -o "$DEST/workflows/${f}.rhai" 2>/dev/null || true
  done
  # optional Grok MAX from repo when present online
  curl -fsSL "$BASE/grok/konyo-workflow-max.rhai" -o "$DEST/workflows/konyo-workflow-max.rhai" 2>/dev/null || true
  if [[ -d "${HOME}/.grok/workflows" && -f "$DEST/workflows/konyo-workflow-max.rhai" ]]; then
    cp "$DEST/workflows/konyo-workflow-max.rhai" "${HOME}/.grok/workflows/" 2>/dev/null || true
  fi
fi

echo "✅ Konyo Workflow installed to $DEST"
echo "   Give your AI: $DEST/SKILL.md"
echo "   Say: Use the Konyo Workflow."
echo "   Grok MAX (Claude third-eye): /konyo-workflow-max  (needs ~/.grok/workflows/)"
