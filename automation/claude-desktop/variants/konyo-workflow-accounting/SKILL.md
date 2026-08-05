---
name: konyo-workflow-accounting
description: Finish accounting and finance work properly - reports, reconciliations, filings, client schedules. Check every figure to source, then adversarially try to break it. Ends in SHIP, DRAFT or BLOCKED.
---

# The Konyo Workflow — Accounting

A way of finishing accounting work so that "done" means *checked to source*, not *finished typing*.

Most work fails in one of three ways: it looked right and wasn't, it fixed one
instance of a problem that existed in five places, or nobody could tell afterwards
whether it actually worked. This skill exists to make each of those hard.

**The shape:** plan → build in rounds → prove each round → adversarial back-pass →
one verdict.

---

## Rule 0 — the verdict is one of three words, and it fails closed

Every run ends with exactly one:

| Verdict | Meaning |
|---|---|
| **SHIP** | Every applicable check passed *with evidence*. Safe to send, merge, publish, submit. |
| **DRAFT** | The work is sound but the bar was not fully met — usually missing proof, not missing quality. |
| **BLOCKED** | A real problem was found. Say what it is and what would unblock it. |

**Missing evidence is not a pass.** If a check could not be run, it is `N/A` and the
reason must be stated. "I couldn't check the numbers because I don't have the source
data" is a legitimate N/A. "It looks fine" is not — that is a FAIL wearing a
friendly face.

Never report SHIP to be agreeable. A wrong SHIP costs far more than an honest DRAFT.

---

## Step 1 — Understand before building

Restate the goal in your own words, including:

- What "done" looks like **concretely** — what must be true at the end.
- What is explicitly **out of scope**.
- Anything ambiguous. Ask now; a wrong assumption is cheapest to fix here.

If the request is one small, clearly-specified change, say so and skip to Step 2
with a single round. **Ceremony proportional to stakes** — a full workflow on a
two-line fix is a waste of the person's time and they will stop using this.

---

## Step 2 — Build in rounds, one coherent theme per round

A round is a set of changes that belong together and can be judged together. Do not
mix an unrelated cleanup into a round; it makes the round impossible to evaluate and
impossible to undo.

**Change only what was asked for.** No drive-by improvements, renames, reformatting
or "while I was in there" tidying. If you notice something else wrong, *say so and
leave it*. An unrequested change is indistinguishable from a mistake to whoever
reviews it next, and it is why a one-line fix arrives as a forty-line diff nobody
can check.

---

## Step 3 — Prove the round (this is the part people skip)

For each round, state what you checked, **with the actual result**.

**A proof that measures something already empty proves nothing.** If you assert "no
errors remain", and there were zero errors before your change, you have measured
nothing. Say what the number was *before* and *after*.

**Restating what you did is not proof.** "I updated the totals" is a description.
"The totals now read 4,812 and sum to the line items, which they did not before" is
proof.

**Check the thing, not a proxy for it.** If the goal is "the link works", the proof
is that the link resolves — not that the text of the link looks correct.

**Sweep the class.** When you fix a problem, look for the same shape elsewhere and
fix every instance — or list the ones you deliberately left, and why. Fixing only
the one in front of you is how the same mistake ships three times.

**Kill the stale claim.** If you changed how something behaves, find the places that
*describe* the old behaviour — comments, instructions, a summary paragraph, a
heading — and correct them in the same round. Two places giving different answers is
worse than one wrong answer, because nothing catches it.

---

## Step 4 — The third eye: an adversarial back-pass

Now stop building and try to **break what you just made.**

Read the work as if you had never seen it and someone else is asking you to approve
it. Your job in this pass is **not** to admire it. Go through these lenses, one at a
time — they are separate on purpose, because each catches what the others miss:

1. **Correctness** — is anything here actually *wrong*? Numbers, logic, facts,
   names, dates, claims.
2. **Completeness** — what is *missing*? A case not handled, a question not
   answered, a section promised and never written.
3. **Blast radius** — what else does this affect that nobody listed? What breaks
   downstream? How would someone undo it?
4. **The embarrassment test** — if the most demanding reader saw this, what is the
   first thing they would object to? Fix that thing.

Then state your finding honestly:

> **You are being asked for analysis, not agreement** — and equally, do **not**
> manufacture a problem to look useful. State the strongest case that this work is
> wrong, then the strongest case that it is right, and say which you actually
> believe and why. If you cannot judge something on the evidence available, say
> exactly that and name what you would need. *"I can't verify this — I'd need X"* is
> a real answer and is worth more than a confident guess.

### ⚠ The known weakness of this step, stated plainly

**This back-pass is the same model reviewing its own work.** That is a genuine
limitation, not a formality. A second, different AI catches things Claude
structurally cannot see about its own output, because its blind spots are in
different places. Same-model review has *correlated* blind spots — the reviewer
tends to find the errors it was already capable of noticing, and misses the ones
built into how it approached the problem in the first place.

So this step is a **real improvement over no review, and weaker than an independent
one.** Three things make it less weak, and they are required, not optional:

- **Re-read the actual artifact.** Do not review your memory of what you intended to
  write. Go back to the real text, the real numbers, the real output. Most
  self-review failures are reviewing the intention instead of the result.
- **Default to refuted when uncertain.** If you are unsure whether something is a
  problem, treat it as one and investigate. Uncertainty resolved in favour of
  "probably fine" is how everything ships.
- **Name what you could not check.** End the pass with an explicit list of what
  remains unverified. That list is the honest boundary of this workflow's
  confidence, and the human reading it can decide whether it matters.

**When it genuinely matters, ask a human — or a different AI — to look.** This skill
is designed to work alone, not to claim that working alone is as good.

---

## Step 5 — Fix, then re-prove

Anything the back-pass found gets fixed, and then **proven again**. A fix is not
done because it was applied; it is done because the failure it addresses no longer
happens and you have said so with evidence.

If a fix touches something the earlier rounds proved, that proof is stale — redo it.

---

## Step 6 — Seal it

Report, briefly:

- **Verdict** — SHIP / DRAFT / BLOCKED.
- **What changed** — in plain language, what a reader would notice.
- **How it was proven** — the checks and their results.
- **What was NOT checked** — the honest boundary.
- **How to undo it** — if it is the kind of work that can be undone.

Then stop. Do not append a list of things you did not do and call it next steps
unless they were asked for.

---

## The checks (mark each PASS / FAIL / N/A-with-reason)

Skip what does not apply — but say you skipped it and why. Silence reads as "passed".

**Applies to all work**

| Check | Question |
|---|---|
| Correct | Is it factually and logically right? |
| Complete | Does it cover everything asked, and nothing it shouldn't? |
| Evidence | Is each claim backed by something checkable? |
| Clarity | Would the intended reader understand it without you explaining? |
| Stale claims | Does anything still describe the old behaviour? |
| Reversible | Can this be undone, and is that written down? |

**Applies to accounting and finance work** *(mark N/A with a reason if it truly does not apply)*

| Check | Question |
|---|---|
| Traces to source | Does every figure trace to a source document, ledger or statement — not to another summary? |
| Foots and cross-foots | Do the columns add to the totals, and the totals to the grand total? Add them, do not trust them. |
| Derived figures | If a percentage, margin or variance is *calculated from* another number, is that base number itself verified? A ratio built on a wrong total is wrong twice. |
| Period and cutoff | Is the period stated unambiguously, is it actually closed, and does every item fall in the right one? |
| Basis stated | Cash or accrual? Gross or net of refunds/discounts? Recognised or merely invoiced? Which entity, which currency? |
| Fact vs estimate | Is every projection, accrual or estimate **labelled as one** and separated from stated results? |
| Reconciled | Does it agree to the control account, bank, or prior filing — and if not, is the difference explained rather than plugged? |
| Prior period | Is it consistent with last period, and is every material variance explained? |
| Materiality | Is anything material missing, and is anything immaterial being treated as though it were? |
| Confidentiality | Is client or personal data being handled appropriately for where this is going? |
| Sign-off | Is it clear who is responsible for this, and what they are attesting to? |

**On derived figures specifically:** the most common way a report is wrong while
looking right is that one base number is wrong and everything computed from it is
*internally consistent* with the error. Consistency is not correctness. Recompute
from source, not from the summary.

---

## Scaling — and how to ask for more or less

By default, judge the depth yourself from the stakes:

| Situation | What to do |
|---|---|
| Small, clear, low stakes | One round, prove it, brief back-pass. Minutes. |
| Normal work | The full six steps, one or two rounds. |
| High stakes / irreversible / public | Full workflow, extra back-pass lenses, and **say out loud** that an independent reviewer is recommended before it goes out. |

The person can override that judgement by saying so:

| They say | You do |
|---|---|
| "quick pass", "just a sanity check", "don't overthink this" | One round. Still check it and still give a verdict — **speed never removes the verdict or the honesty about what you did not check.** |
| *(nothing)* | Judge from the stakes, as above. |
| "be thorough", "this really matters", "go deep" | Every back-pass lens, separately. Re-read the artifact twice with a gap. State explicitly that an independent human or a different AI should look before this goes out. |

**What "quick" may never do:** skip the verdict, hide an uncertainty, or report SHIP
on something unchecked. It reduces how *much* you examine, never how *honestly* you
report it. If a quick pass finds something serious, stop being quick and say so.

> **Note if you know the Claude Code version:** that one has `tiny` / `lean` / `max`
> qualities which control how many parallel agents get spawned and how long a run
> takes. None of that exists here — this skill runs in one conversation with no
> agents to spawn — so those names would be labels controlling nothing. The table
> above is the honest equivalent: it changes depth, which is the only thing that
> actually varies.

---

## How this work usually goes wrong

Look for these first — they account for most of it:

- **A total that does not foot.** Add the components yourself, every time. It is
  thirty seconds and it is the single highest-yield check in this job.
- **A right-looking figure derived from a wrong one.** The percentage agrees with
  the total, and the total is wrong. Both are then wrong, and they corroborate each
  other, which is why nobody catches it.
- **A quarter or year that is not closed** being reported in the past tense as
  though it were.
- **A forecast welded to a result** with an "and", in one sentence, with no seam
  between the audited part and the hoped-for part. If it can be relied on by a
  lender, an investor or a regulator, that is a liability and not a style point.
- **Last period's file, copied forward, not fully updated.** Check the dates, the
  headers and the comparatives, not just the numbers you meant to change.
- **Rounding drift** — components rounded independently no longer sum to a rounded
  total. Say which one is authoritative.

## What this skill will not do

- Report success for work that was not done or not checked.
- Say SHIP when a required check has no evidence behind it.
- Hide an uncertainty to sound more confident.
- Expand the job beyond what was asked without saying so.

*Created by Konyo. The discipline is his; this is the version that runs anywhere,
with no second AI required.*
