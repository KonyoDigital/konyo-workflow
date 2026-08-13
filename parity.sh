#!/usr/bin/env bash
# ENGINE PARITY — show every copy of every shipper, and say which way each one travels.
#
# ⚠ WHY THIS EXISTS. On 2026-08-09 an audit found the engines existed in more places than
# anyone was tracking, with no two copies equal and nothing reporting it:
#
#   konyo-workflow.js    install 220,368  repo 214,111   -- 96 lines only on this Mac,
#                        including the lock key computed in code, after a run locked an
#                        entire HOME DIRECTORY for eight hours
#   konyo-workflow.rhai  install v32      repo v31       public package v31
#   agent-army.js        install 217,931  public 218,945 -- the install was MISSING the
#                        home-directory lock fix that public already had
#   konyo-workflow-max   public 6,887 carried BETTER advice than the local 7,002, which
#                        told you to cp a .bak-merge back and revive a stale duplicate
#
# Every one was silent. The repos were not behind because anyone decided they should be;
# they were behind because nothing ever compared them. This is the comparing.
#
# ⚠ DIRECTION IS PER FILE AND IS NOT OBVIOUS. Two of these flow UP and two flow DOWN, and
# guessing wrong destroys work in whichever direction you guessed:
#
#   konyo-workflow.js     install -> repo   AUTHORED AT THE INSTALL. That is what the
#                                           Workflow tool loads, and the engine caches a
#                                           named workflow, so an edit has to land there
#                                           to take effect at all.
#   konyo-workflow.rhai   install -> repo -> public, BUT THE LAST HOP IS A MERGE, NEVER A
#                                           COPY: the public package genericises private
#                                           repo names, and copying over it undoes that
#                                           silently while looking like a version bump.
#   konyo-workflow-max    public -> local   the published copy is the maintained one.
#   agent-army.js         public -> install SEPARATE PRODUCT, authored in its own repo.
#                                           agent-army.js is NOT konyo-workflow.js.
#
# Report only. It deliberately does not auto-sync: the .rhai hop needs a 3-way merge and
# a leak check, and a script that silently "fixes" that is how the de-identification dies.
set -u
cd "$(dirname "$0")"

h() { [ -f "$1" ] && md5 -q "$1" | cut -c1-8 || echo "MISSING"; }
z() { [ -f "$1" ] && stat -f%z "$1" || echo "-"; }
short() { echo "$1" | sed "s|$HOME|~|"; }

remote_size() {   # $1 repo  $2 path — size at origin/main, over the git protocol
  local sha
  sha=$(git ls-remote "https://github.com/KonyoDigital/$1" main 2>/dev/null | cut -f1)
  [ -n "$sha" ] || { echo "?"; return; }
  curl -fsSL "https://raw.githubusercontent.com/KonyoDigital/$1/$sha/$2" 2>/dev/null | wc -c | tr -d ' '
}

pair() {  # $1 label  $2 direction  $3 from  $4 to
  local fh th
  fh=$(h "$3"); th=$(h "$4")
  printf "\n  %s   [%s]\n" "$1" "$2"
  printf "    %-46s %9s  %s\n" "$(short "$3")" "$(z "$3")" "$fh"
  printf "    %-46s %9s  %s\n" "$(short "$4")" "$(z "$4")" "$th"
  if [ "$fh" = "$th" ]; then
    printf "    -> in sync\n"
  else
    printf "    -> ⚠ DRIFT — resolve in the direction above\n"
    DRIFT=$((DRIFT + 1))
  fi
}

DRIFT=0
echo "ENGINE PARITY  ($(date '+%Y-%m-%d %H:%M'))"

pair "konyo-workflow.js" "install -> repo" \
  "$HOME/.claude/workflows/konyo-workflow.js" \
  "automation/claude-code/konyo-workflow.js"

pair "konyo-workflow.rhai" "install -> repo" \
  "$HOME/.konyo-workflow/workflows/konyo-workflow.rhai" \
  "automation/workflows/konyo-workflow.rhai"

pair "konyo-workflow.rhai (grok skills copy)" "install -> skills" \
  "$HOME/.konyo-workflow/workflows/konyo-workflow.rhai" \
  "$HOME/.grok/workflows/konyo-workflow.rhai"

pair "konyo-workflow-max.rhai" "public -> local" \
  "grok/konyo-workflow-max.rhai" \
  "$HOME/.konyo-workflow/workflows/konyo-workflow-max.rhai"

# ── ADDED 2026-08-13 — four load-bearing copies this script could not see ───────────
# The header above says a guard exists because nothing was comparing these. The same was
# true of the Grok side: Konyo-Grok.rhai is the ACTUAL Grok shipper and lived in three
# places watched by nothing, and v27_grok_safeguard_proof.sh had ALREADY drifted — the
# repo copy is missing the ~10 lines carrying the v32 contract strings, and no output
# anywhere said so. A guard that cannot see a file reports green forever while it drifts.
#
# Each row below was watched going RED before being kept: one copy broken in place, the
# row observed firing, the copy restored and its md5 re-checked. A row that has never
# gone red is not a guard, it is a receipt.

pair "Konyo-Grok.rhai" "install -> repo" \
  "$HOME/.grok/workflows/Konyo-Grok.rhai" \
  "automation/workflows/Konyo-Grok.rhai"

pair "Konyo-Grok.rhai (konyo-workflow copy)" "install -> local" \
  "$HOME/.grok/workflows/Konyo-Grok.rhai" \
  "$HOME/.konyo-workflow/workflows/Konyo-Grok.rhai"

pair "v27_grok_safeguard_proof.sh" "install -> repo" \
  "$HOME/.grok/workflows/v27_grok_safeguard_proof.sh" \
  "automation/workflows/v27_grok_safeguard_proof.sh"

pair "v27_grok_safeguard_proof.sh (konyo-workflow copy)" "install -> local" \
  "$HOME/.grok/workflows/v27_grok_safeguard_proof.sh" \
  "$HOME/.konyo-workflow/workflows/v27_grok_safeguard_proof.sh"

# ⚠ DIRECTION NOT ESTABLISHED on the next one, and it is deliberately not guessed. Both
# sides are installs of the same body; nobody has said which is authored. The header's
# rule applies — guessing wrong destroys work in whichever direction you guessed — so
# this row REPORTS drift and refuses to imply a resolution. Establish the direction
# before acting on a red here.
pair "agent-army.js (vendored in this repo)" "install -> repo  (live install is authored; public is the other product)" \
  "$HOME/.claude/workflows/agent-army.js" \
  "automation/claude-code/agent-army.js"

pair "ship-skill body (grok skills <-> claude skills)" "?? ASK — direction not established" \
  "$HOME/.grok/skills/konyo-workflow-konyo/SKILL.md" \
  "$HOME/.claude/skills/ship-skill/SKILL.md"

# ⚠ DELIBERATELY NOT A PAIR — do not add it. ~/konyo-workflow/SKILL.md (10,249 B) is the
# PUBLIC METHOD document and ~/.konyo-workflow/SKILL.md (1,005 B) is a pointer stub. They
# are different documents that happen to share a filename. Pairing them would print a red
# row on every run forever, and a guard that is always red is switched off within a week,
# taking the rows that mean something with it.
#
# ⚠ Nor is the .rhai size gap drift. The public konyo-workflow-grok body genericises
# private repo names and the local one was renamed to Konyo-Grok.rhai, leaving a 2,698 B
# stub behind. The remote rows below already say this. Never make this script copy the
# public body over the local one.

echo
echo "  REMOTES (fetched over git protocol — raw/main and the REST API are both cached"
echo "  and have each certified stale content while reporting OK)"
printf "    %-46s %9s\n" "konyo-workflow-grok/konyo-workflow.rhai" "$(remote_size konyo-workflow-grok konyo-workflow.rhai)"
printf "    %-46s %9s   local repo %s\n" "  ^ compare: repo .rhai" "" "$(z automation/workflows/konyo-workflow.rhai)"
printf "    %-46s %9s\n" "agent-army/agent-army.js" "$(remote_size agent-army agent-army.js)"
printf "    %-46s %9s\n" "  ^ compare: install agent-army.js" "$(z "$HOME/.claude/workflows/agent-army.js")"
echo
echo "  ⚠ The two remote rows are NOT expected to match byte-for-byte: konyo-workflow-grok"
echo "    genericises private repo names, so it is a MERGE target, not a copy target."
echo "    A size gap there is normal; a gap in the v32 contracts is not — prove with"
echo "    v27_grok_safeguard_proof.sh against the public file before believing it is fine."
echo
[ "$DRIFT" -eq 0 ] && echo "ALL LOCAL PAIRS IN SYNC." || echo "$DRIFT LOCAL PAIR(S) DRIFTED."
exit $([ "$DRIFT" -eq 0 ] && echo 0 || echo 1)
