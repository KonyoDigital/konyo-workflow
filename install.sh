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
    # Static safeguard proofs (v27 empty-plan / render-loop contracts) — install
    # beside the shipper so a host can re-prove without cloning.
    cp "$ROOT/automation/workflows/"*.sh "$DEST/workflows/" 2>/dev/null || true
    # The Grok CLI loads from ~/.grok/workflows. automation/workflows/ holds the
    # LIVE implementer (parity with Claude Code konyo-workflow.js). grok/*.rhai holds
    # the MAX deprecation notice and host docs. Both must land under ~/.grok/workflows
    # or Grok silently runs a stale shipper (this happened once: audit-only body with
    # three fewer gates than Claude — the cross-host drift the law table exists to stop).
    if [[ -d "${HOME}/.grok/workflows" ]]; then
      cp "$ROOT/automation/workflows/"*.rhai "${HOME}/.grok/workflows/" 2>/dev/null || true
      cp "$ROOT/automation/workflows/"*.sh "${HOME}/.grok/workflows/" 2>/dev/null || true
    fi
  fi
  # Grok Build extras (MAX entry is a deprecation notice → quality:"max" on the one body)
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

# ---- Claude Code shippers (.js) --------------------------------------------------------------
# 2026-08-03: these had NO install path at all. install.sh only ever handled *.rhai, so the two
# workflows people actually run on Claude Code could be updated ONLY by hand-copying — which is
# precisely how "the repo lags the installed copies" happens, and it is the same bug that left the
# standard Grok shipper 145 lines behind with three blocking gates missing. Same rot, other host.
# Claude Code registers a workflow from the meta block of any .js in ~/.claude/workflows, so
# dropping the files there is the whole install.
CLAUDE_DEST="${CLAUDE_WORKFLOW_HOME:-$HOME/.claude/workflows}"
if [[ -d "$HOME/.claude" ]]; then
  mkdir -p "$CLAUDE_DEST"
  for f in konyo-workflow konyo-workflow-max; do
    if [[ -f "$ROOT/automation/claude-code/${f}.js" ]]; then
      cp "$ROOT/automation/claude-code/${f}.js" "$CLAUDE_DEST/${f}.js"
    else
      curl -fsSL "$BASE/automation/claude-code/${f}.js" -o "$CLAUDE_DEST/${f}.js" 2>/dev/null || true
    fi
  done
  # Proof harnesses (v27 empty-plan) — not required to run the shipper, required to trust it.
  for f in v27_empty_plan_proof.mjs load_harness.mjs; do
    if [[ -f "$ROOT/automation/claude-code/${f}" ]]; then
      cp "$ROOT/automation/claude-code/${f}" "$CLAUDE_DEST/${f}"
    fi
  done
  echo "   Claude Code shippers → $CLAUDE_DEST (konyo-workflow + v27 proof)"
fi

echo "✅ Konyo Workflow installed to $DEST"
echo "   Give your AI: $DEST/SKILL.md"
echo "   Say: Use the Konyo Workflow."
echo "   Grok implementer: /Konyo-Grok (alias /konyo-workflow redirects) {\"task\":\"…\",\"apply\":true}  (lean default; quality:max|standard|tiny)"
echo "   Grok third-eye = Claude CLI.  /konyo-workflow-max is a deprecation notice only."
