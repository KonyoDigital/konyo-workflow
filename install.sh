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
  fi
else
  curl -fsSL "$BASE/SKILL.md" -o "$DEST/SKILL.md"
  curl -fsSL "$BASE/docs/SHIP_LAWS.md" -o "$DEST/SHIP_LAWS.md" 2>/dev/null || true
  for f in konyo-workflow review-changes security-pass ship-ready find-flaky-tests; do
    curl -fsSL "$BASE/automation/workflows/${f}.rhai" -o "$DEST/workflows/${f}.rhai" 2>/dev/null || true
  done
fi

echo "✅ Konyo Workflow installed to $DEST"
echo "   Give your AI: $DEST/SKILL.md"
echo "   Say: Use the Konyo Workflow."
