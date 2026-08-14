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
  # The routing map is the single source for WHICH entry point to run. Installed beside the method
  # so the answer is on disk, not only on GitHub.
  [[ -f "$ROOT/ROUTING.md" ]] && cp "$ROOT/ROUTING.md" "$DEST/ROUTING.md" || true
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
  curl -fsSL "$BASE/ROUTING.md" -o "$DEST/ROUTING.md" 2>/dev/null || true
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
CLAUDE_CMDS="${CLAUDE_COMMANDS_HOME:-$HOME/.claude/commands}"
if [[ -d "$HOME/.claude" ]]; then
  mkdir -p "$CLAUDE_DEST"
  # ONE engine. konyo-workflow-max.js was retired at v18 — max is a quality string on this body,
  # not a second file. Listing it here fetched a 404 forever and implied a shipper that is gone.
  for f in konyo-workflow; do
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

  # ---- Slash commands ------------------------------------------------------------------------
  # 2026-08-15: these had NO install path. install.sh handled *.rhai, *.js and two *.mjs proofs and
  # nothing else, so /Konyo /KonyoLean /KonyoMax /KonyoCost /KonyoTiny existed in the repo, were
  # documented in the README, and DID NOT EXIST for anyone who ran the curl one-liner. Both halves
  # were built correctly and never joined. Claude Code registers a command from any .md in
  # ~/.claude/commands, so copying them there is the whole install.
  mkdir -p "$CLAUDE_CMDS"
  CMD_N=0
  for f in Konyo KonyoLean KonyoMax KonyoCost KonyoTiny; do
    if [[ -f "$ROOT/automation/claude-code/commands/${f}.md" ]]; then
      cp "$ROOT/automation/claude-code/commands/${f}.md" "$CLAUDE_CMDS/${f}.md"
      CMD_N=$((CMD_N + 1))
    else
      curl -fsSL "$BASE/automation/claude-code/commands/${f}.md" -o "$CLAUDE_CMDS/${f}.md" 2>/dev/null \
        && CMD_N=$((CMD_N + 1)) || true
    fi
  done
  echo "   Slash commands → $CLAUDE_CMDS (${CMD_N}/5: /Konyo + 4 overrides)"
  # `|| true` is load-bearing: under `set -e` a false test as the LAST command in this block exits
  # the script — i.e. the SUCCESS case (5/5) would abort the install before the final banner.
  [[ "$CMD_N" -lt 5 ]] && echo "   ⚠️  only ${CMD_N}/5 commands installed — /Konyo may be missing" || true
fi

echo "✅ Konyo Workflow installed to $DEST"
echo "   Give your AI: $DEST/SKILL.md"
echo "   Which command to run: $DEST/ROUTING.md"
echo "   Say: Use the Konyo Workflow.   Or run: /Konyo <what you want done>"
echo "   Grok implementer: /Konyo-Grok (alias /konyo-workflow redirects) {\"task\":\"…\",\"apply\":true}  (lean default; quality:max|standard|tiny)"
echo "   Grok third-eye = Claude CLI.  /konyo-workflow-max is a deprecation notice only."
