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
has "triage-direct bail releases" 'release_held_lock'


echo ""

echo ""
echo "v29 SCAR LAW (FOUNDING / LEARNED / EVIDENCE / UNDO)"
has "FOUNDING vs LEARNED" 'FOUNDING vs LEARNED'
has "FOUNDING immutable" 'FOUNDING RULES'
has "LEARNED append only" 'LEARNED SCARS'
has "EVIDENCE required" 'EVIDENCE:'
has "undo snapshot" 'SCARS.prev.md'
has "v29 safeguards flag" 'v29_scar_founding_vs_learned'

echo ""
echo "v30 METER ROUTING + FLEET CAPS + THRASH/TIP (2026-08-07)"
has "v30 item cap variable" 'let max_items_cap'
has "max quality item cap 6" 'if max_only { max_items_cap = 6; }'
has "volume-arc heuristic" 'looks_like_volume_arc'
has "meter routing log" 'v30 METER ROUTING'
has "version arc discipline" 'VERSION ARC DISCIPLINE (v30)'
has "tip honesty craft" 'TIP HONESTY (v30)'
has "thrash resistance craft" 'THRASH RESISTANCE (v30)'
has "v30 safeguards flag" 'v30_meter_routing'
has "max not for volume flag" 'v30_max_not_for_volume_arcs'
has "item cap applied log" 'v30 ITEM CAP'


echo ""
echo "v31 RENDER‖LAW19 CONCURRENT + images_na + rich LAW19 (2026-08-07)"
has "v31 concurrent hop log" 'v31 CONCURRENT HOP'
has "reach_schema declared" 'let reach_schema'
has "parallel gate_jobs first hop" 'law19:reachability'
has "parallel first render label" 'law18:render-1'
has "images_na fail closed" 'NO IMAGE WAS EVER OPENED'
has "IMAGE wrong thing blocker" 'IMAGE SHOWS THE WRONG THING'
has "v31 concurrent safeguard flag" 'v31_render_law19_concurrent_first_hop'
has "v31 images_na safeguard flag" 'v31_images_na_fail_closed'
has "v31 reach rich schema flag" 'v31_reach_rich_schema'
has "thin_panels in payload" 'thin_panel_count: thin_panels.len()'
has "phase Render concurrent" 'Render ‖ Reachability'

echo ""
echo "v32 SCAR@FAILURE + RUN-NOT-INSPECT (2026-08-08)"
has "record at the failure craft" 'RECORD AT THE FAILURE'
has "one per distinct failure craft" 'One scar per DISTINCT failure'
has "run not inspect craft" 'RUN THE THING — READING IS NOT PROOF'
has "synth scar mid-run question" 'did I record the ones I hit'
has "v32 scar record flag" 'v32_scar_record_at_failure'
has "v32 one per distinct flag" 'v32_scar_one_per_distinct_failure'
has "v32 run not inspect flag" 'v32_run_not_inspect'

echo ""
echo "v36 GROK-HOST PORTS OF CLAUDE JS v35/v36 (2026-08-14)"
has "G1 file-shaped items refuse string" 'dry-run with a file-shaped items[] work list'
has "G1 file_shaped_items counter" 'file_shaped_items'
has "G2 release_held_lock helper" 'fn release_held_lock'
has "G2 architect-fail also releases" 'if lock_acquired { release_held_lock(lock_token); lock_acquired = false; }'
has "G3 te_schema" 'let te_schema'
has "G3 plan-seat blocking complete" 'the plan seat returned a blocking refusal'
has "G3 never fill empty seat with Grok" 'never filled by Grok'
has "G4 pass+failures cannot PASSED" 'pass:true carrying a non-empty failures[] must not converge as PASSED'
has "v36 G1 flag" 'v36_g1_items_file_shaped_dry_run_refuse'
has "v36 G2 flag" 'v36_g2_release_held_lock'
has "v36 G3 flag" 'v36_g3_plan_seat_can_block'
has "v36 G4 flag" 'v36_g4_pass_with_failures_not_passed'

if [[ "$fail" -eq 0 ]]; then
  echo "ALL SAFEGUARD CONTRACTS PRESENT."
  exit 0
fi
echo "FAILURES: $fail"
exit 1
