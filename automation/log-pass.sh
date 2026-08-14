#!/usr/bin/env bash
# log-pass.sh — commit+push ONE proven finish/revival pass.
#
#   bash log-pass.sh --message "konyo pass: path — what it stopped lying about" -- file [file...]
#
# Opt-in loop mode for {logPass:true} on /Konyo and /Konyo-Grok. Not the door.
# Not a ship. Ship is still {push:true} after a shippable verdict.
#
# Refuses: empty message, no files, dirty index, extra staged files, denylisted
# money/secret paths, force-push. Adds only the listed files.
set -euo pipefail

MSG=""
FILES=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --message|-m) MSG="${2:-}"; shift 2 ;;
    --) shift; FILES+=("$@"); break ;;
    --help|-h)
      echo "usage: log-pass.sh --message \"konyo pass: <file> — <lie>\" -- <file> [file...]"
      exit 0
      ;;
    *) FILES+=("$1"); shift ;;
  esac
done

if [[ -z "$MSG" ]]; then
  echo "log-pass: pass --message" >&2
  exit 2
fi
if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "log-pass: pass at least one file after --" >&2
  exit 2
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "log-pass: not inside a git work tree" >&2
  exit 2
fi

# Money books and secrets never ride a finish-loop commit.
deny() {
  local f="$1" base
  base="$(basename "$f")"
  case "$base" in
    .env|.env.*|*.pem|id_rsa|id_ed25519|credentials|secrets|*.key) return 0 ;;
    kai_balance.json|pt_signals.json|naked_kai_signals.json|raw_signals.json) return 0 ;;
  esac
  return 1
}

abs_files=()
for f in "${FILES[@]}"; do
  if [[ ! -e "$f" ]]; then
    echo "log-pass: missing $f" >&2
    exit 2
  fi
  if deny "$f"; then
    echo "log-pass: refuse denylisted path $f (book/secret — not a finish log)" >&2
    exit 3
  fi
  # resolve to repo-relative so staged names match
  rel="$(git ls-files --full-name -- "$f" || true)"
  if [[ -z "$rel" ]]; then
    rel="$(python3 -c 'import os,sys; print(os.path.relpath(sys.argv[1]))' "$f" 2>/dev/null || echo "$f")"
  fi
  if deny "$rel"; then
    echo "log-pass: refuse denylisted path $rel" >&2
    exit 3
  fi
  abs_files+=("$rel")
done

if [[ -n "$(git diff --cached --name-only)" ]]; then
  echo "log-pass: index is not empty — unstage first. This script will not scoop." >&2
  git diff --cached --name-only >&2
  exit 3
fi

dirty=0
for f in "${abs_files[@]}"; do
  if ! git diff --quiet -- "$f" || ! git diff --cached --quiet -- "$f"; then
    dirty=1
  elif ! git ls-files --error-unmatch -- "$f" >/dev/null 2>&1; then
    # untracked but present — allow only if the pass created it and it is not denied
    dirty=1
  fi
done
if [[ "$dirty" -eq 0 ]]; then
  echo "log-pass: listed files unchanged — nothing to push"
  exit 0
fi

git add -- "${abs_files[@]}"
staged="$(git diff --cached --name-only | sort)"
expected="$(printf '%s\n' "${abs_files[@]}" | sort)"
if [[ "$staged" != "$expected" ]]; then
  echo "log-pass: refuse — staged set is not exactly the pass files:" >&2
  echo "  staged:" >&2
  echo "$staged" >&2
  echo "  expected:" >&2
  echo "$expected" >&2
  git reset -q HEAD --
  exit 3
fi

git commit -m "$MSG"
git push origin HEAD
echo "log-pass: pushed $(git rev-parse --short HEAD) — $MSG"
