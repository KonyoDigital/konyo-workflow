#!/usr/bin/env python3
"""UserPromptSubmit hook — capture correction-shaped turns so lessons survive the session.

THE GAP THIS CLOSES. Inside the workflow, scars are captured automatically every round and
carve candidates are proposed at arc end. In an ordinary Claude Code session NOTHING is
captured: you correct the same thing three times across three days and the third correction
costs exactly what the first did. This hook is the missing capture half.

WHAT IT DOES NOT DO, DELIBERATELY:
  * It never blocks, never edits your prompt, and never writes to stdout. A capture layer
    that can break a turn is worse than no capture layer, so every path exits 0.
  * It writes to SCARS.inbox.md, NOT to SCARS.md. The inbox is automatic, noisy and
    unreviewed; SCARS.md is curated and is read by workflow builders at Preflight. Mixing
    them would let an unreviewed heuristic put words in front of every future agent.
  * It proposes nothing and carves nothing. Clustering is scar_cluster.py's job; the carve
    itself stays a decision, per the carving skill's three-scar floor.

⚠ SAFETY LAW, inherited verbatim from the engine: A SCAR NARROWS ATTENTION, IT NEVER
SUPPRESSES A GATE. Nothing captured here may skip a check, lower a bar, or mark anything
already-judged.
"""

import json
import os
import re
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scar_territory import scar_territory  # noqa: E402

INBOX = os.path.expanduser(
    os.environ.get('KONYO_SCAR_INBOX', '~/.konyo-workflow/SCARS.inbox.md'))
MAX_INBOX_BYTES = 256 * 1024   # a queue, not an archive; see prune note below
MAX_ENTRY_CHARS = 400
MAX_PROMPT_CHARS = 4000        # past this it is a spec, not a correction

# STRONG signals only. A correction is a prompt that says the LAST turn was wrong — not any
# prompt containing a negation. "Do not use tabs" in an opening brief is an instruction;
# "no, I told you not to use tabs" is a scar. Tuned to under-capture: a missed scar costs
# one repetition, a false one costs every future session's attention.
PATTERNS = [
    r'^\s*no[,.\s!]', r'\bi (?:already )?told you\b', r'\bi said\b',
    r'\bthat(?:\'s| is) (?:wrong|incorrect|not right)\b', r'\bwrong again\b',
    r'\byou (?:didn\'t|did not|forgot to|failed to)\b', r'\bwhy did you\b',
    r'\bnot what i (?:asked|wanted|said)\b', r'\bstop (?:doing|using|trying)\b',
    r'\bnever (?:do|use|run|touch)\b', r'\bagain\b.*\b(?:wrong|broken|failed)\b',
    r'\brevert (?:that|it)\b', r'\bundo (?:that|it)\b',
]
RX = [re.compile(p, re.I) for p in PATTERNS]


def extract_prompt(payload):
    """The prompt field name is not pinned by the docs, so do not bet the hook on one.

    Try the documented-ish names, then fall back to the longest top-level string. A capture
    layer that silently records nothing because a key was renamed is the exact failure this
    repo calls an unjoined end.
    """
    for key in ('prompt', 'user_prompt', 'message', 'text', 'content'):
        val = payload.get(key)
        if isinstance(val, str) and val.strip():
            return val
    strings = [v for v in payload.values() if isinstance(v, str) and len(v) > 20]
    return max(strings, key=len) if strings else ''


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0
    if not isinstance(payload, dict):
        return 0

    prompt = extract_prompt(payload).strip()
    if not prompt or len(prompt) > MAX_PROMPT_CHARS:
        return 0
    if not any(rx.search(prompt) for rx in RX):
        return 0

    entry = ' '.join(prompt.split())[:MAX_ENTRY_CHARS]
    territory = scar_territory(entry)
    if not territory:
        return 0

    try:
        os.makedirs(os.path.dirname(INBOX), exist_ok=True)
        # Size guard BEFORE the write. An inbox nobody prunes becomes a file nobody reads,
        # which is the same death SCARS.md dies. When it is full we stop appending and say
        # so in the file itself rather than silently dropping or silently growing.
        if os.path.exists(INBOX) and os.path.getsize(INBOX) > MAX_INBOX_BYTES:
            return 0
        new = not os.path.exists(INBOX)
        with open(INBOX, 'a', encoding='utf-8') as fh:
            if new:
                fh.write('# Scar inbox — AUTO-CAPTURED, UNREVIEWED\n\n'
                         'Written by the UserPromptSubmit hook when a turn looks like a\n'
                         'correction. This is a QUEUE, not a library, and not SCARS.md:\n'
                         'nothing here has been judged. `/carving-skill` promotes a cluster.\n\n'
                         'A scar narrows attention. It never suppresses a gate.\n\n')
            fh.write('- `%s` cwd=`%s` territory=`%s`\n  > %s\n'
                     % (datetime.now().isoformat(timespec='seconds'),
                        os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd()),
                        territory, entry.replace('\n', ' ')))
    except Exception:
        return 0
    return 0


if __name__ == '__main__':
    # Exit 0 unconditionally — see module docstring. Even an unhandled path must not
    # take a turn down with it.
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
