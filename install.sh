#!/usr/bin/env bash
# Konyo Workflow — vendor-neutral installer
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
DEST="${KONYO_WORKFLOW_HOME:-$HOME/.konyo-workflow}"

mkdir -p "$DEST/workflows"

cp "$ROOT/SKILL.md" "$DEST/SKILL.md"
cp "$ROOT/docs/SHIP_LAWS.md" "$DEST/SHIP_LAWS.md" 2>/dev/null || true

if [[ -d "$ROOT/automation/workflows" ]]; then
  cp "$ROOT/automation/workflows/"*.rhai "$DEST/workflows/" 2>/dev/null || true
fi

# Support curl | bash from raw GitHub (ROOT may be a temp dir with only this script)
if [[ ! -f "$DEST/SKILL.md" ]] || [[ ! -s "$DEST/SKILL.md" ]]; then
  BASE="https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main"
  curl -fsSL "$BASE/SKILL.md" -o "$DEST/SKILL.md"
  curl -fsSL "$BASE/docs/SHIP_LAWS.md" -o "$DEST/SHIP_LAWS.md" || true
  mkdir -p "$DEST/workflows"
  for f in konyo-workflow review-changes security-pass ship-ready find-flaky-tests; do
    curl -fsSL "$BASE/automation/workflows/${f}.rhai" -o "$DEST/workflows/${f}.rhai" 2>/dev/null || true
  done
fi

echo "✅ Konyo Workflow installed to $DEST"
echo "   Primary:  $DEST/SKILL.md"
echo "   Optional: $DEST/workflows/"
echo "   Attach SKILL.md as a skill/rule/instruction in your coding agent."
