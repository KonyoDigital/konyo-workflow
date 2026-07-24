#!/usr/bin/env bash
# Konyo Workflow installer — Claude skill and/or Grok workflows
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

install_claude() {
  DEST="$HOME/.claude/skills/konyo-workflow"
  mkdir -p "$DEST"
  cp "$ROOT/SKILL.md" "$DEST/SKILL.md"
  echo "✅ Claude: installed to $DEST — restart Claude Code, then: /konyo-workflow"
}

install_grok() {
  DEST="$HOME/.grok/workflows"
  mkdir -p "$DEST"
  if [[ -d "$ROOT/grok/.grok/workflows" ]]; then
    cp "$ROOT/grok/.grok/workflows/"*.rhai "$DEST/"
  else
    echo "Missing grok/.grok/workflows — clone the full repo or use curl install in grok/INSTALL.md" >&2
    exit 1
  fi
  echo "✅ Grok: installed workflows to $DEST — run: /workflow konyo-workflow {\"objective\":\"...\",\"target\":\"HEAD\"}"
}

case "${1:-all}" in
  claude) install_claude ;;
  grok)   install_grok ;;
  all)
    install_claude
    install_grok
    ;;
  *)
    echo "Usage: ./install.sh [all|claude|grok]"
    exit 1
    ;;
esac
