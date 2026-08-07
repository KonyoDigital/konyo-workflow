#!/usr/bin/env bash
# v27 / v26 GROK SHIPPER SAFEGUARD PROOF — static gate, not a narrative.
#
# The Claude side has v27_empty_plan_proof.mjs (load_harness). Grok Rhai has no
# equivalent harness on this host, so we prove the load-bearing SOURCE contracts
# that the implementer rewrite once dropped (render loop) or left incomplete
# (spawn_errors in SHIPPABLE).
#
# Exit 0 only if every check passes.
#
#   bash automation/workflows/v27_grok_safeguard_proof.sh [path/to/konyo-workflow.rhai]

set -euo pipefail
SCRIPT="${1:-}"
if [[ -z "$SCRIPT" ]]; then
  if [[ -f "$HOME/.grok/workflows/konyo-workflow.rhai" ]]; then
    SCRIPT="$HOME/.grok/workflows/konyo-workflow.rhai"
  else
    SCRIPT="$(cd "$(dirname "$0")" && pwd)/konyo-workflow.rhai"
  fi
fi

fail=0
ok()  { printf '  ok  · %s\n' "$1"; }
bad() { printf '  FAIL· %s\n' "$1"; fail=$((fail+1)); }
has() {
  if rg -q --fixed-strings "$2" "$SCRIPT"; then ok "$1"; else bad "$1 (missing: $2)"; fi
}
has_re() {
  if rg -q "$2" "$SCRIPT"; then ok "$1"; else bad "$1 (regex: $2)"; fi
}

echo "script: $SCRIPT"
echo ""
[[ -f "$SCRIPT" ]] || { echo "missing script"; exit 2; }

echo "v26 RENDER LOOP"
has "render_schema declared" 'let render_schema'
has "fix_schema declared" 'let fix_schema'
has "RENDERLOOP plan array" 'let rl_plan'
has "re-render pass banner" 'RE-RENDER — PASS'
has "fixer never weakens assertions" 'FIX THE CODE, NEVER THE ASSERTION'
has "no-progress stop" 'the fixer changed nothing'
has "narrow+wide viewport demand" 'MORE THAN ONE WIDTH'
has "render_loop ledger in payload" 'render_loop:'

echo ""
echo "v27 / v27.1 VACUOUS-GREEN DEATHS"
has "architect_noop error name" 'architect_noop'
has "architect_empty error name" 'architect_empty'
has "caller items skip architect at any quality" 'caller passed items[]'
has_re "shippable requires apply_mode" 'let shippable = apply_mode'
has_re "shippable requires passed_n > 0" 'passed_n > 0'
has_re "shippable requires spawn_errors empty" 'spawn_errors\.len\(\) == 0'
has_re "shippable requires thin_panels empty" 'thin_panels\.len\(\) == 0'

echo ""
echo "SHIP DISCIPLINE"
has "builders never push (prompt)" 'NEVER push'
has "ship only with push:true" 'push not requested'
has "no --force" 'never --force'

echo ""
echo "THIRD EYE (Grok host = Claude)"
has "default third eye claude" 'let third_eye = "claude"'
has "empty seat not filled by Grok" 'Seat reported empty, never filled by Grok'

echo ""
echo "v28 PACE + PROXY + PHASE_PLAN + STOP REASONS"
has "PACE clause (WORK BRISKLY)" 'WORK BRISKLY'
has "PROXY ban (VERIFY THE THING)" 'VERIFY THE THING, NOT A PROXY'
has "PHASE_PLAN open ledger" 'PHASES OPEN'
has "PHASE_PLAN skip honesty" 'NOT OPENED'
has "stop reason PASSED" 'stop_reason = "PASSED"'
has "stop reason CEILING" 'stop_reason = "CEILING"'
has "stop reason STALLED" 'stop_reason = "STALLED"'
has "v28 safeguards flag" 'v28_render_stop_passed_ceiling_stalled'

echo ""
echo "v28.1 EARLY LOCK RELEASE"
has "early release on triage-direct" 'lock:release-early'
has "triage-direct bail releases" 'Early lock release'


echo ""

echo ""
echo "v29 SCAR LAW (FOUNDING / LEARNED / EVIDENCE / UNDO)"
has "FOUNDING vs LEARNED" 'FOUNDING vs LEARNED'
has "FOUNDING immutable" 'FOUNDING RULES'
has "LEARNED append only" 'LEARNED SCARS'
has "EVIDENCE required" 'EVIDENCE:'
has "undo snapshot" 'SCARS.prev.md'
has "v29 safeguards flag" 'v29_scar_founding_vs_learned'

if [[ "$fail" -eq 0 ]]; then
  echo "ALL SAFEGUARD CONTRACTS PRESENT."
  exit 0
fi
echo "FAILURES: $fail"
exit 1
