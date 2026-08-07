---
name: konyo-workflow
description: Finish serious work properly - code, writing, research or analysis. Build in rounds, prove each with evidence, then adversarially try to break it. Runs SOLO (self-review) or MULTI (an independent reviewer that never saw you think). Ends in one verdict - SHIP, DRAFT or BLOCKED - and turns whatever went wrong into a durable rule, so the workflow gets better at YOUR work over time.
---

# The Konyo Workflow

A way of finishing work so that "done" means *checked*, not *finished typing*.

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

**Finish the sweep you print.** If you list the places that need checking, check
*all* of them. A list you wrote and then half-worked is worse than no list, because
it looks like diligence. (This is a real failure: a sweep flagged fourteen files,
eight were checked, and one of the six skipped was broken in exactly the way the
sweep was looking for.)

**A check that agrees with a mistake will protect it.** The most dangerous thing you
can find is not a check that fails — it is a check that *passes for the wrong reason*.
If something was written to expect the old, incorrect answer, it will go on passing
for exactly as long as the mistake survives, and it will look like coverage the whole
time. So when two checks on the same thing disagree, do not assume the failing one is
wrong. **That contradiction is the signal** — it usually means one of them was written
against a truth that has since changed, and the other has been quietly holding the
error in place.

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

## Step 4b — SOLO or MULTI: how many independent looks this work gets

Step 4 just told you the truth about itself: **one model reviewing its own work has
correlated blind spots.** It tends to catch the errors it was already equipped to
notice, and miss the ones baked into how it approached the problem.

You cannot fix that by trying harder in the same breath. You fix it by **changing
what the reviewer knows.** So this workflow runs at one of two settings, and the
difference between them is not effort — it is *independence*.

### SOLO — one conversation, structured self-review

The default. Step 4 runs as written, in this same conversation, with the four
lenses. Fast, free, and genuinely useful: most defects are ordinary and a
disciplined re-read finds them.

Use SOLO when being wrong is cheap and recoverable — a draft, an internal note, an
experiment, anything you will look at again before it matters.

### MULTI — a reviewer that has not seen you think

Use MULTI when being wrong is expensive: anything going to a client, published,
sent to a lot of people, spending money, or that you would be embarrassed to get
wrong in public.

MULTI means the review happens **in a fresh conversation that never saw the
building.** That is the whole mechanism, and it is worth understanding why it
works: a reviewer who watched you reason has already been persuaded by your
reasoning. One that sees only the artifact has to be convinced by the artifact
itself — which is the actual test.

**How to run it (this is a real, manual step — there is no way to fake it):**

1. Finish Steps 1-3. You now have a finished artifact.
2. Open a **new conversation**. Not a new message — a new conversation, so none of
   the building is in its context.
3. Paste **only the artifact and the original request.** Not your plan, not your
   reasoning, not "here's what I was going for", and not your own verdict. Those
   are exactly the things that would contaminate the review.
4. Ask it to run **Step 4's four lenses** and answer one question: *would you
   approve this, and what is the strongest argument that it is wrong?*
5. Bring the findings back and continue at Step 5.

**One more turn of the same crank, when it really matters:** run step 3 twice more
with a different lens named each time — once reading only for factual correctness,
once reading only as the least sympathetic reader you can imagine. Separate passes
beat one combined pass, because a reviewer looking for everything reliably drifts
into looking for nothing.

> **Say which mode you ran.** The seal in Step 6 must name SOLO or MULTI. A reader
> deciding how much to trust this needs to know whether anything independent
> actually looked at it — and "SOLO" is an honest answer, not a confession.

### If you have access to a second AI

Then use it for the Step 4 pass instead of a fresh Claude conversation. A different
model family has blind spots in genuinely different places, which is strictly better
than a fresh conversation with the same one. This skill does not require it and
never assumes it — but if it is available, that is the strongest version of MULTI,
and you should say which model reviewed.

**MULTI is not "SOLO with more steps."** If you run the review in the same
conversation and call it MULTI, you have the cost of the ceremony and none of the
independence — which is worse than honestly running SOLO, because now the seal
claims something untrue.

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
- **Mode** — SOLO or MULTI (Step 4b). If MULTI, say what reviewed it. A reader
  deciding how far to trust this needs to know whether anything independent
  actually looked, and SOLO is an honest answer.
- **Scars** — did any existing scar apply, and did you follow its rule? Did this
  run produce a new one? If yes, **print the scar block here**, ready to paste
  (Step 7). If no, say "no scar" — that is a real answer, and saying it is what
  stops the step being quietly skipped forever.

Then stop. Do not append a list of things you did not do and call it next steps
unless they were asked for.

---

## Step 7 — SCARS: turn what went wrong into something that cannot go wrong again

Every workflow above this line makes *this* piece of work better. This step is the
only one that makes the **next** piece of work better, and it is the reason to keep
using the skill rather than just reading it once.

Here is the problem it solves. A conversation ends and everything it learned dies
with it. The next conversation starts from zero and is free to repeat the exact
mistake you just spent an hour finding. Writing "be careful about X" in your notes
does not help, because nobody re-reads their notes before starting.

**A scar is a mistake that has been converted into a rule that loads itself.**

### Recording one

When something went genuinely wrong this run — a real error, a wrong assumption, a
thing that had to be redone — write it down in exactly this shape, and put it in a
file called `SCARS.md` inside this skill's folder:

```
WHAT BROKE   the summary quoted a number that was never in the source
COST         it went out to 40 people before anyone noticed
CAUGHT BY    re-reading the source, not re-reading my summary
RULE         every figure in a summary gets traced back to the sentence it came
             from, before the summary is finished
GUARD        Step 3's check list — added "every number traced to source"
```

**All five lines, every time.** Four of them are a diary. The fifth is what makes it
a defence, and it is the one people skip.

- **RULE must be an instruction, not a regret.** "Be more careful with numbers" is
  not a rule — nothing can follow it. "Trace every figure to the sentence it came
  from" is a rule, because you can tell whether you did it.
- **GUARD names where the rule now lives.** A step in this skill, a line in a
  checklist, a question you now always ask. If you genuinely cannot think of one,
  write `GUARD: NONE` — **honestly**. An honest NONE is a bug you know you can still
  hit. A made-up guard is worse than nothing, because it reads as protected.

### Reading them

**At the start of every run, read `SCARS.md` first.** Before Step 1. It is usually
short, and it is the only thing in the folder written by experience rather than by
someone guessing in advance what would go wrong.

Then, at Step 6, answer one question in the seal: *did any scar apply to this work,
and did I follow its rule?*

### Carving a new skill out of scars — the part that compounds

Watch for **three or more scars in the same territory.** Not the same mistake three
times — the same *area*: three about handling numbers, three about tone in client
emails, three about a particular file or system.

Three scars in one area is a signal. It means that area is not an occasional
hazard, it is a **recurring kind of work** that deserves its own instructions.

When you see it, do this:

1. **Write a new skill.** A folder next to this one, with its own `SKILL.md`, named
   for the territory — `checking-figures`, `client-emails`, `monthly-report`.
2. **Put the rules in it,** turned from "don't do X" into how the work is done:
   the steps, the order, the specific checks, the phrasing that worked, the trap
   that keeps catching you. The scars are the raw material; the skill is the
   finished procedure.
3. **Say where they came from.** Each rule keeps a line naming the scar that
   produced it. A rule whose origin is recorded survives someone asking "do we
   still need this?" — a rule without one gets deleted by the first person tidying
   up, and then it happens again.
4. **Leave a pointer here,** so this skill knows to load the child when the work
   is in that territory.

That is the loop, and it is worth stating plainly because it is the whole idea:
**doing the work produces scars → scars accumulate into a territory → the territory
becomes a skill → the skill makes that work reliable → and the workflow is now
better at your job specifically, not at jobs in general.**

A generic workflow is worth something. One that has been shaped by twenty of your
own real mistakes is worth considerably more, and nobody else can hand it to you —
it can only be grown.

### ⚠ The honest limitation

**Claude cannot write to the skill folder by itself.** So the mechanism has exactly
one manual step, and pretending otherwise would guarantee it silently stops working:

> Claude ends the run by **printing the scar block**, formatted and ready. You paste
> it into `SCARS.md`. Ten seconds.

If you skip the paste, the scar is lost and nothing warns you — the run still looks
successful. So the seal in Step 6 asks whether a scar was produced, which at least
makes the loss visible at the moment it happens rather than three months later when
you hit the same bug again.

**And do not let it grow into a wall of text.** A `SCARS.md` nobody reads has failed
in the same way notes fail. When one area gets crowded, that is not a problem to
tidy up — it is the signal to carve it into a skill and remove those entries from
the list. The file should stay short *because* things keep graduating out of it.

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
| Scars read | Did you read `SCARS.md` before starting, and did any entry apply here? |
| Mode named | Does the seal say SOLO or MULTI, truthfully? |

**Applies to code and technical work** *(mark N/A for writing, research or analysis)*

| Check | Question |
|---|---|
| Tests | Do tests exist for *this* change, and did they actually run? |
| Syntax | Does it parse / lint cleanly? |
| Security | Secrets, injection, permissions, unsafe defaults. |
| Reachability | Is every new thing actually *reached* by something? Code nobody calls is dead, and dead code described as a feature is worse than a missing feature — nobody looks again. |
| Version + record | Is the version bumped and the change recorded where the project already records changes? |
| Rollback | Is the reverse path known? |

**On tests specifically:** "the suite is green" is not evidence that *your* tests ran.
Prove they executed — a count before and after, or the new test names in the output.
And a test that cannot fail proves nothing: if you strengthened a check, make sure
the case it guards against can actually occur, or you have bought confidence without
coverage.

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

## What this skill will not do

- Report success for work that was not done or not checked.
- Say SHIP when a required check has no evidence behind it.
- Hide an uncertainty to sound more confident.
- Expand the job beyond what was asked without saying so.

*Created by Konyo. The discipline is his; this is the version that runs anywhere,
with no second AI required.*
