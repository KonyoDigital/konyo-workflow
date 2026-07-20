#!/usr/bin/env bash
# Konyo Workflow — installer (same as the README one-liner, for clone-based installs)
set -euo pipefail
DEST="$HOME/.claude/skills/konyo-workflow"
mkdir -p "$DEST"
cp "$(dirname "$0")/SKILL.md" "$DEST/SKILL.md"
echo "✅ Konyo Workflow installed to $DEST — restart Claude Code, then type: /konyo-workflow"
