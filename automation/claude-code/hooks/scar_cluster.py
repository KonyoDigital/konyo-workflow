#!/usr/bin/env python3
"""SessionStart hook — report scar clusters that have reached the carve floor.

The other half of the split. scar_capture.py records; this reads the inbox at session start
and, when a territory has been hit THREE times, says so in context so the carve is a
decision you can make in one keystroke instead of a pattern nobody ever noticed.

WHY THIS PROPOSES AND DOES NOT CARVE. Carving prunes shared files that every future session
loads, and a rule auto-written from three coincidences becomes a permanent instruction with
its own evidence deleted. Three repetitions of a phrase are also not three distinct
failures. So the machine does the counting — which is the part humans are bad at — and the
judgement stays with Konyo, exactly as the engine does it at arc end.

Output contract: a single JSON object on stdout with hookSpecificOutput.additionalContext.
Silence is the common and correct case: no clusters, no output, no tokens spent.
"""

import json
import os
import re
import sys
from collections import defaultdict

INBOX = os.path.expanduser(
    os.environ.get('KONYO_SCAR_INBOX', '~/.konyo-workflow/SCARS.inbox.md'))
FLOOR = int(os.environ.get('KONYO_CARVE_FLOOR', '3'))
MAX_REPORTED = 3          # a startup notice that lists ten things is a notice nobody reads
ENTRY_RX = re.compile(r'^- `[^`]+` cwd=`[^`]*` territory=`([^`]+)`\s*$')


def clusters():
    if not os.path.exists(INBOX):
        return []
    by = defaultdict(list)
    try:
        with open(INBOX, encoding='utf-8') as fh:
            lines = fh.readlines()
    except Exception:
        return []
    for i, line in enumerate(lines):
        m = ENTRY_RX.match(line.rstrip('\n'))
        if not m:
            continue
        evidence = ''
        if i + 1 < len(lines) and lines[i + 1].lstrip().startswith('>'):
            evidence = lines[i + 1].lstrip()[1:].strip()
        by[m.group(1)].append(evidence)
    return sorted([(k, v) for k, v in by.items() if len(v) >= FLOOR],
                  key=lambda kv: -len(kv[1]))[:MAX_REPORTED]


def main():
    found = clusters()
    if not found:
        return 0                      # silence is the honest common case
    lines = ['%d scar territory/ies have reached the carve floor of %d, from the auto-'
             'captured inbox at %s. Nothing here has been reviewed and nothing was '
             'carved — mention it if the user asks about repeated corrections, and run '
             '/carving-skill only if they want it.' % (len(found), FLOOR, INBOX)]
    for territory, evidence in found:
        lines.append('- `%s` (x%d) e.g. %s' % (territory, len(evidence),
                                               (evidence[0] or '')[:160]))
    print(json.dumps({
        'suppressOutput': True,
        'hookSpecificOutput': {
            'hookEventName': 'SessionStart',
            'additionalContext': '\n'.join(lines),
        },
    }))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
