"""Territory key for scar clustering — THE one implementation for the hook side.

⚠ THIS ALGORITHM EXISTS TWICE, ON PURPOSE, AND THAT IS A LIABILITY.

`konyo-workflow.js` has `scarTerritory()` in JavaScript because a workflow script cannot
import Python; this file has it in Python because a hook cannot import the engine. Two
copies of one algorithm is exactly the drift this repo keeps getting bitten by — so the
copies are held together by a PROOF, not by good intentions:

    node automation/claude-code/scar_hook_proof.mjs

runs both implementations over a fixed corpus and fails if any key disagrees. Change one,
the gate goes red until you change the other. Do not "improve" the clustering here alone.

WHY IT IS DELIBERATELY CRUDE. A cleverer clusterer silently merges distinct failures, and
a false cluster is worse than no cluster: it manufactures the third scar that authorises a
carve. Three is the floor precisely because two is a coincidence.
"""

import re

STOP = {
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'was', 'it', 'its', 'this', 'that', 'of',
    'to', 'in', 'on', 'for', 'with', 'not', 'no', 'be', 'been', 'has', 'have', 'had',
    'at', 'as', 'by', 'from', 'so', 'if', 'then', 'than', 'which', 'what', 'when',
    'they', 'their',
}


def scar_territory(reason: str) -> str:
    """Lowercase significant words, stopwords dropped, first 6, sorted, hyphen-joined.

    Mirrors scarTerritory() in konyo-workflow.js line-for-line in behaviour:
      lowercase -> non-alphanumerics to spaces -> split -> keep len>3 and not stopword
      -> take first 6 -> sort -> join with '-'
    """
    cleaned = re.sub(r'[^a-z0-9\s]', ' ', str(reason or '').lower())
    words = [w for w in cleaned.split() if len(w) > 3 and w not in STOP]
    return '-'.join(sorted(words[:6]))
