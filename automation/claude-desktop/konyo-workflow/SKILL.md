---
name: konyo-workflow
description: "Finish serious work properly - documents, workbooks, decks, scripts, audits, research, comms. Build in rounds, prove each round, adversarial back-pass, one verdict: SHIP / DRAFT / BLOCKED."
---

# The Konyo Workflow

A way of finishing work so that "done" means *checked*, not *finished typing*.

Most work fails in one of three ways: it looked right and wasn't, it fixed one instance
when the same thing was wrong in nine places, or nobody could
tell afterwards whether it actually worked. This skill exists to make each of those hard.

The stakes are specific. A wrong name or number in something employee-facing is not a
typo — it is someone calling the wrong place about their kid's prescription. A wrong date
is a window someone misses. A wrong figure in a workbook is a decision made on it. A
script that quietly drops rows is an error nobody sees for a month. And once a file is
attached to an email to a few thousand people, there is no undo.

**The shape:** plan → build in rounds → prove each round → adversarial back-pass →
one verdict.

This skill does not tell you how to do the work — it tells you when the work is
finished. The domain skills are the method; this is the verdict on what they produced.
For benefits work specifically, `benefits-workflow` is this same discipline with the
per-deliverable specifics attached — use that one there. Load durable facts from
`session-memory` rather than recalling them.

**Two reference files, read only when they apply:**
- `references/independence.md` — SOLO vs MULTI: how independent the review was, and the
  reviewer ladder. Read it before Step 4 on anything that leaves your hands.
- `references/deliverables.md` — what "done" means for each KIND of artifact: documents,
  spreadsheets, engines, audits, communications, research. The checks below are universal;
  that file is where the artifact-specific bar lives, so neither list has to be vague.
  ⚠ A variant should REPLACE it with its own artifact types — this idea came from a variant
  (Karine's benefits fork) that had one when the base did not.
- `references/scars.md` — turning a failure into a durable rule, and where the scars
  live. Read it when a run produced one, or at the start of a session to load them.

---

## Rule 0 — the verdict is one of three words, and it fails closed

Every run ends with exactly one:

| Verdict | Meaning |
|---|---|
| **SHIP** | Every applicable check passed *with evidence*. Safe to send, post, attach, hand over. |
| **DRAFT** | The work is sound but the bar was not fully met — usually missing proof, not missing quality. Fine to keep working on; not fine to distribute. |
| **BLOCKED** | A real problem was found. Say what it is and what would unblock it. |

**The ordinary happy path is SHIP:** errors found, all of them fixed, the fixes proven,
the boundary stated. Finding problems is not a reason to downgrade — it is the work.

**Missing evidence is not a pass.** If a check could not be run, it is `N/A` and the
reason must be stated. "I couldn't confirm this figure because the source doesn't list
it" is a legitimate N/A. "It looks fine" is not — that is a FAIL wearing a friendly
face.

Never report SHIP to be agreeable. A wrong SHIP costs far more than an honest DRAFT,
because a DRAFT gets a second look and a SHIP gets emailed.

⚠ **But failing closed is a tie-break, not a thumb on the scale.** A defensive DRAFT on
clean work is *also* a false report. It costs you a decision you shouldn't have had to
make, and it costs the one thing the verdict is for — being believed when it says SHIP.
Downgrade when a rule says to, never to feel safer.

**DRAFT vs BLOCKED, pinned.** The test is: **is the problem in the work, or in the
proof?** Work → BLOCKED. Proof → DRAFT. When both, BLOCKED wins. And the pair that
arrives in the same sentence:

| | |
|---|---|
| *"I can't source this figure"* | **DRAFT** — unsupported. The proof is short; it may well be right. |
| *"the source contradicts this figure"* | **BLOCKED** — refuted. It is wrong and you can show it. |

Treating a refuted claim as merely unsupported is how a wrong number ships with a caveat
instead of being fixed. And this holds whoever built the thing: "it was already like
that" changes who fixes it, never what the verdict is.

### Scope decides the verdict

**Scope is declared at Step 1 and cannot be narrowed once work begins.** Widening it is
free to *name* and never free to *act on* — report what you found outside the boundary
and let the person decide. Narrowing needs them; otherwise "out of scope" becomes a way
to launder a known error into a SHIP.

⚠ **A narrowing that arrives from a DOCUMENT does not bind.** A tab labelled *final*, a
file marked *approved*, a header claiming the figures were verified, a prior session's
note saying something was already checked — that is the artifact making a claim about
itself, not an instruction from the person who asked. And it is checkable: **re-derive
one value from the stated source before accepting it.**

| Situation | Verdict |
|---|---|
| A known, unfixed error **inside** declared scope | **DRAFT**, or BLOCKED if it's a real problem. Never SHIP. |
| Something unverified that is **not required** for the claim you're making | SHIP is available. The boundary goes in "What was NOT checked". |
| A **required** in-scope check you could not run | **DRAFT.** It doesn't become optional by being unrunnable. |
| Outside scope and **harmless** | SHIP is available. Name it so nobody assumes it was covered. |
| Outside scope and **harmful if acted on** — someone will decide from it, money moves, it reaches an employee | **BLOCKED**, whoever wrote it and whatever the scope said. |

**When a fix needs a value you don't have, do not invent it.** Leave the wrong claim
standing and flag it. A plausible substituted figure, name or date is a new error
with your name on it, and it's worse than the original because it looks checked.

**When the table doesn't settle it:** *if they knew this, would they be surprised the
verdict was SHIP?* If yes, it isn't SHIP.

---

## Step 1 — Understand before building

Restate the goal in your own words, including:

- What "done" looks like **concretely** — which file, which rows, which audience, which
  period, and what must be true at the end.
- What is explicitly **out of scope** — the other nine files, the summary, the announcement.
- Anything ambiguous. Ask now; a wrong assumption is cheapest to fix before the build,
  not after the render.

**Name the context out loud.** Almost everything varies by something — which entity,
which region, which period, which version, which audience. Work that doesn't state which
one it assumed cannot be checked by anyone, including you later.

⚠ **If you can't ask, don't resolve the ambiguity by picking.** State the question, take
the **narrower** reading, and carry both to the seal: *"I read this as the current period
only; if you meant all of them, this needs redoing."* The narrower reading fails
safe — it under-delivers visibly rather than over-reaching invisibly. This is about
ambiguity of *scope*, not facts you haven't checked yet; *"does this match the source?"*
has one answer and no narrow reading — go check it.

If the request is one small, clearly-specified, **low-stakes** change — a date, a logo
swap, one line of copy — say so and run a single round. **Ceremony proportional to
stakes.** A full workflow on a two-word fix wastes time and will get this skill switched
off. But **small is not the same as cheap to get wrong**: a one-word change in something
going to three thousand people, or a one-line change to a script that runs monthly, is a
two-minute edit and not low-stakes. Size measures the diff; stakes decide
the ceremony. When they disagree, stakes win.

---

## Step 2 — Build in rounds, one coherent theme per round

A round is a set of changes that belong together and can be judged together. One
document is a round. "The same correction across every variant" is a round. "That
correction plus some tidying elsewhere" is not — mixing them makes the round impossible
to evaluate and impossible to undo.

**Change only what was asked for.** No drive-by improvements, re-wording, re-styling
or "while I was in that file anyway" tidying. If you notice something else wrong —
a stale figure, a broken link, something that looks off two rows down — *say so and
leave it.* An unrequested change is indistinguishable from a mistake to whoever
reviews it next, and it is why a one-date fix arrives as a rebuilt file nobody can
check.

---

## Step 3 — Prove the round (this is the part people skip)

For each round, state what you checked, **with the actual result**.

⚠ **Read what a source says about itself, not just what it tabulates.** The note at the
top of a tab, the label on a column, a footnote, a header, a future-dated row, a comment
in the code. Those carry the meaning and every script skips them. Something reading only
the numbers can reconcile every figure perfectly while the basis it read was the wrong
one. **The most damaging errors are the ones where all the numbers are right.**

**A proof that measures something already empty proves nothing.** "No violations found"
is worthless if the filter matched zero rows, or if there were none before your change
either. Say the count *before* and *after*, and how many rows you were looking at. A
clean result on an empty set is not a clean result.

**Restating what you did is not proof.** "I updated the plan year" is a description.
"The plan year now reads 8/1/2026–7/31/2027 on the cover, page 2 and page 14, and read
the prior year on all three before" is proof. (Values in this skill's examples are
illustrative only — never source a fact from this file.)

**Check the artifact, not the source that made it.** If the goal is "the document says
X," the proof is the text extracted from the rendered file — not the config value you set,
and not the markup that went in. Renders fail silently. Open the output. Same for a
filter: click it, don't read the JavaScript. Same for a surgical edit to a page: re-open
it, because a reported success can land on the wrong one. Same for a script: read what it
wrote, not what it logged.

**Make the two systems actually tie.** Whenever a number has to agree across two places —
two reports, a file and its source, an export and a statement — a match is a number, not
an impression. Row counts on both sides, the exception count, and the exceptions listed
individually. "They broadly agree" is not a reconciliation.

⚠ **A search that found nothing must say where it looked.** "No exceptions" and "no
other instances" are among the strongest sentences you can put in a seal, and a filter
pointed at the wrong string produces them exactly as readily as a true absence — same
empty result, same confident wording. **Zero rows is a claim about your filter until it
prints one.** This bites hardest on names: the same building is spelled differently
between systems — a legal name, a trading name, whatever a given export uses — and
something can be missing because it's spelled the fourth way. Print the distinct values
you matched against.

**Sweep the class — this is the one that matters most here.** When you fix something,
assume it is wrong in every other variant until you have looked. The same name, date,
footer or figure lives across every variant, plus the summary, the workbook and the
message that announces it. Fix every instance, or list the ones you deliberately left and
why. Fixing only the one in front of you is how the same error ships three times.

**Sweep and no-drive-by are not in conflict — the line is the ERROR CLASS.** One error
reported → sweep every instance *of that error*, and say you did. A *different* thing
you noticed on the way → name it, don't touch it. And **permission bounds the sweep**:
finding the same error in six sibling files is a reason to *report* the other five, not a
licence to rebuild them. Sweep within what you were given; list the class beyond it. And
if you print a list of eleven things to check, check all eleven — a half-worked list is
worse than none because it looks like diligence.

**Distrust a check that passes.** The dangerous one isn't the failing check, it's the one
that passes for the wrong reason — an audit rule written to expect the old, incorrect
answer keeps passing for as long as the mistake survives, and looks like coverage the
whole time. So when two checks on the same thing disagree, don't assume the failing one
is wrong. That contradiction is the signal. Ask of any rule: **would it flag the error if
the error came back?** If you can't say, put the bad row back and watch.

**No-drive-by applies at every size — but a compelled deletion isn't one.** You have
cause to touch one sentence and quietly drop a clause nobody asked about: same rule, one
level down — file, sheet, page, paragraph, sentence, **clause.** Removing something because it
looked better gone is a drive-by; removing it because the correction can't be expressed
with it there is part of the fix, and must be **named in the seal**. The test isn't how
it feels, it's whether the correction survives without it.

**Kill the stale claim.** If you changed what something says, find everywhere else that
*describes* the old version — the summary, the heading, the workbook sheet, the calendar
entry, the comment, the session-memory record — and correct them in the same round. Two
documents giving different answers is worse than one wrong document, because nothing
catches it and the call comes to you.

---

## Step 4 — The third eye: an adversarial back-pass

Now stop building and try to **break what you just made.**

Read it as if someone handed it to you and asked you to approve it going out. Your job
in this pass is **not** to admire it. Go through these lenses one at a time — they are
separate on purpose, and **each gets its own labelled block, or an explicit N/A with a
reason.** Merged into one paragraph, "I considered all four" is unfalsifiable, and
merging is what a run produces when it didn't do them separately.

1. **Correctness** — is anything actually *wrong*? Numbers, logic, names, dates, totals,
   entity and brand, phone numbers, the spelling of a person's or place's name, the claim a
   sentence makes.
2. **Completeness** — what is *missing*? A case not handled, a variant not covered, a plan
   offered but never described, a page promised in the contents and never rendered, the
   obvious question the reader will ask and can't answer from this.
3. **Blast radius** — what else does this affect that nobody listed? Which other files,
   sheets, pages, scheduled messages, downstream scripts? **Who has the old version
   already?** How would this be undone?
4. **The embarrassment test** — what, *if anything*, is the first thing the most
   demanding reader would object to? Pick the real one: the administrator who knows
   their own area better than the document does, the person who acted on it, or the
   auditor asking why two systems disagree. **If the honest answer
   is nothing, the block says "nothing to report"** — an empty block is a legitimate
   finding, and this is the lens that most invites invention.

Then state your finding honestly:

> **You are being asked for analysis, not agreement** — and equally, do **not**
> manufacture a problem to look useful. State the strongest case that this work is
> wrong, then the strongest case that it is right, and say which you actually
> believe and why. If you cannot judge something on the evidence available, say
> exactly that and name what you would need. *"I can't verify this — I'd need the source
> packet"* is a real answer and is worth more than a confident guess.

### ⚠ The known weakness of this step, stated plainly

**This back-pass is the same model reviewing its own work.** That is a genuine
limitation, not a formality. Same-model review has *correlated* blind spots: it finds the
errors it was already capable of noticing, and misses the ones built into how it
approached the problem. If it misread which context it was working in, it will review the
whole thing confidently in the wrong one.

So this step is a **real improvement over no review, and weaker than an independent
one.** Three things make it less weak, and they are required:

- **Re-open the actual artifact.** Extract the text from the rendered file. Load the
  sheet. Read the output. Most self-review failures review the intention, not the result.
- **Default to refuted when uncertain.** If you're unsure whether something is really true
  here, treat it as wrong and check the source. Uncertainty resolved as "probably fine" is
  how everything ships.
- **Name what you could not check** — which items, which fields, which sources you
  didn't have. That list is the honest boundary of this workflow's confidence.

**When it matters — anything that leaves your hands — the review should happen somewhere
that never saw the building. Read `references/independence.md`** for the modes (SOLO vs
MULTI), who counts as an independent reviewer, and what to say in the seal when one
wasn't available. This skill is designed to work alone, not to claim that working alone
is as good.

---

## Step 5 — Fix, then re-prove

Anything the back-pass found gets fixed, and then **proven again**. A fix is not done
because it was applied; it is done because the failure no longer happens and you have
said so with evidence. Re-render and re-read — an edit that reported success can still
have landed on the wrong page.

If a fix touches something an earlier round proved, that proof is stale. Redo it.

**Take the ceiling from the person, not from thin air.** If they gave a limit — passes,
time — that's the ceiling. If they didn't, don't invent one; stop on no-progress
instead. And don't manufacture a loop at all when nothing between passes could change
what you do next: that's one-shot work, so do it once, well, and seal it.

> **Don't loop on confidence. Loop on evidence.** "I think it's right now" is not a stop
> condition — the counts tie, the file opens, the exceptions are named, the owner
> confirmed. If you can't name what would end the loop before you start, you don't have
> a loop, you have a habit.

Stop for one of these four, and **say which:**

| | |
|---|---|
| **PASSED** | The check succeeds. The only real success. |
| **CEILING** | Out of room, still failing, **and the failure kept changing.** Possibly converging — a human decides whether to grant another run. |
| **STALLED** | The same failure **twice** running, unchanged. Stop immediately, and don't raise the ceiling — change the approach or the assumption under it. |
| **UNFIXABLE HERE** | Checked thoroughly, found things you cannot fix — a rate nobody has released, a source you don't have, someone else's call. No number of passes touches these. Name each and who can act on it. |

UNFIXABLE HERE can pair with one of the other three, since it describes a different set of
items: *"PASSED in scope after one pass; UNFIXABLE HERE on the two items below."* Rule
0's scope table decides the verdict, not this word — out of scope and harmless, **SHIP is
still available.**

---

## Step 6 — Seal it

Report, briefly:

- **Verdict** — SHIP / DRAFT / BLOCKED, per Rule 0's scope table. A known unfixed error
  inside declared scope is never SHIP, however well everything else was proven.
- **What changed** — in plain language, what a reader would notice.
- **How it was proven** — the checks and their actual results.
- **What was NOT checked** — the honest boundary, named specifically: which items, which
  fields, and what sat outside the scope declared at Step 1. This explains a SHIP;
  it never rescues one.
- **How to undo it** — file paths, prior versions, and whether anything has already
  gone out.
- **What this now contradicts** — any other file, sheet, page or scheduled message that
  still says the old thing and is not in scope for this round.
- **Stopped because** — PASSED / CEILING / STALLED / UNFIXABLE HERE, after how many passes.
- **Mode** — SOLO or MULTI, truthfully; if MULTI, who or what reviewed it.
- **Scars** — did an existing scar apply, and did you follow it? Did this run produce a
  new one? If none, say "no scar" — saying it out loud is what stops the step being
  quietly skipped forever. Format and handling: `references/scars.md`.

Then stop. Do not append a list of things you did not do and call it next steps unless
they were asked for.

**A verdict is retractable.** Anything that can only promote will eventually be wrong and
stay wrong. When later evidence contradicts a sealed verdict, retract it explicitly —
name the original evidence and what beat it — including your own seal from earlier in the
same run.

---

## The checks (mark each PASS / FAIL / N/A-with-reason)

Skip what does not apply — but say you skipped it and why. Silence reads as "passed".

**Then run the artifact-specific bar** from `references/deliverables.md` for whatever you are
actually handing over. These tables ask "is the work sound?"; that file asks "is THIS KIND of
thing finished?" — and a spreadsheet, a booklet and a monthly engine answer that differently.

**Applies to all work**

| Check | Question |
|---|---|
| Correct | Is it factually and logically right? |
| Complete | Does it cover everything asked, and nothing it shouldn't? |
| Evidence | Is each claim backed by something checkable? |
| Right context | Is it right for *this* one — this entity, this region, this period, this version — not the last one you worked on? |
| Source read | Did you read what the source says about itself — headers, notes, column labels — not only its numbers? |
| Swept | Does the same error exist in other variants, and were they fixed or listed? |
| Stale claims | Does anything else still describe the old version? |
| Clarity | Would the intended reader understand it without you explaining? |
| Reversible | Can this be undone, is that written down, and has any of it already gone out? |
| Scars | Were they read at the start, and did any apply? |
| Mode named | Does the seal say SOLO or MULTI, truthfully? |

**Applies to anything you build and hand over — documents, spreadsheets, decks, files, published pages**
*(mark N/A for pure advice or discussion)*

| Check | Question |
|---|---|
| Renders | Did the file actually build, open and paginate — and did you look at the output, not the source? |
| Numbers tie | Do totals, counts and cross-references agree everywhere they appear, and between systems, with counts on both sides? |
| Filter is real | Did the filter match anything? Confirm the name is spelled the way *that* system spells it before calling zero rows clean. |
| Formulas | Do they compute on real data, including the edge rows — blanks, duplicates, terminations, zero values, mid-period starts, future-dated rows? |
| Reachability | Is every link, tile, filter option and page reachable, with content behind it? Something nobody can click is worse than something missing — nobody looks again. |
| Sensitive data | Any names, ID numbers, dates of birth, pay or health detail in a file about to be shared more widely than it should be? |
| Brand + format | Correct logo artwork, colours, entity name and brand, consistent with the rest of the set. |
| Version + record | Is the file named so the prior one survives, and is the change recorded in session memory? |
| Rollback | Is the reverse path known — the prior file, and who already has the old one? |

**Anything that will run again — scripts, engines, a monthly process**
*(mark N/A for one-off documents)*

| Check | Question |
|---|---|
| Ran on real input | Did it execute on the actual data, and did you read the output rather than the log line? |
| Fails loudly | Does it raise on an input it doesn't recognise, rather than passing it through silently? |
| Edge rows | Blanks, duplicates, future dates, partial records, a category it has never seen. |
| Rerunnable | Same input, same output — and does re-running overwrite something it shouldn't? |
| Paths | Does it resolve files absolutely, so it behaves the same from any directory? |
| Recorded | Is what it does — and what it deliberately excludes — written where the next person will look? |

**Never tune against the only check that will judge you.** Adjust the work until one check
passes and it now measures how hard you tuned, not whether the work is right — invisible
from inside, because everything is green. Keep a gate you didn't touch: an item you never
looked at, a second reader, a source you didn't use while building. If you only had
one check and you tuned against it, say so.

---

## Where the truth lives

The facts that vary are the ones that cause errors, and the failure is almost always the
same: carried across from a neighbour, an earlier version, or memory. **Every varying fact
is verified for this instance, against its source, in this round.**

- **A copy is not the system of record.** A prior file, a summary, a screenshot or a
  previous session's note is a copy; it can be stale and it is not proof.
- **A second copy of a value is a future contradiction.** Don't restate a value that has a
  source — point at the source. That is why this skill records no values of its own.
- **When two sources disagree, that's a finding, not a tie to break by preference.** Name
  both, say which you used and why, and flag it, because it will be back.
- **If a fact cannot be sourced, it is `N/A` with the reason** — and that is a reason not to
  ship that item yet, never a reason to copy the neighbouring value.

Where a domain skill names the system of record for a particular field, that skill governs.
For benefits work the per-field and per-deliverable detail is in `benefits-workflow`.


## Scaling — and how to ask for more or less

By default, judge the depth from the stakes:

| Situation | What to do |
|---|---|
| Small, clear, internal — a working file, a draft for one person | One round, prove it, brief back-pass. Minutes. SOLO by choice. |
| Normal work | The full six steps, one or two rounds. |
| Goes out to other people, covers many variants, or is irreversible once sent | Full workflow, every back-pass lens separately, MULTI at the strongest rung available, and **say out loud** that a human should look before it goes out. |

Override that judgement by saying so:

| You say | Claude does |
|---|---|
| "quick pass", "just sanity check it", "don't overthink this" | One round. Still checks it and still gives a verdict — **speed never removes the verdict or the honesty about what went unchecked.** |
| *(nothing)* | Judges from the stakes, as above. |
| "be thorough", "this really matters", "go deep" | Every back-pass lens, separately. Re-reads the artifact twice with a gap. States explicitly that an independent human should look before this goes out. |

**What "quick" may never do:** skip the verdict, hide an uncertainty, or report SHIP on
something unchecked. It reduces how *much* gets examined, never how *honestly* it is
reported. If a quick pass finds something serious, it stops being quick and says so.

> **If you know the Claude Code version:** its `tiny` / `lean` / `max` qualities route
> parallel agents, which don't exist here — so those words would control nothing. The
> tables above change depth and independence, the only things that actually vary.

---

## What this skill will not do

- Report success for work that was not done or not checked.
- Say SHIP when a required check has no evidence behind it.
- Carry a fact across from another instance, an older version, or memory.
- Substitute a plausible value for one it could not source.
- Hide an uncertainty to sound more confident.
- Expand the job beyond what was asked without saying so.
- Claim MULTI for a review that happened in this conversation.

*Created by Konyo. The discipline is his; this is the version that runs anywhere, with
no second AI required — adapted without changing any of his rules.*
