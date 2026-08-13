---
name: benefits-workflow
description: "Finish HR and benefits work properly - booklets, the Benefits Hub, eligibility and invoice audits, rate tables, OE comms. Prove every figure. One verdict - SHIP / DRAFT / BLOCKED."
---

# The Benefits Workflow

A way of finishing work so that "done" means *checked*, not *finished typing*.

Most benefits work fails in one of three ways: it looked right and wasn't, it fixed
one facility when the same thing was wrong in nine, or nobody could tell afterwards
whether it actually worked. This skill exists to make each of those hard.

The stakes are specific here. A wrong carrier name in a booklet is not a typo — it is
an employee calling the wrong number about their kid's prescription. A wrong plan-year
date is an enrollment window someone misses. And once a PDF is attached to an email to
3,000 people, there is no undo.

**The shape:** plan → build in rounds → prove each round → adversarial back-pass →
one verdict.

This skill does not tell you how to do the work — it tells you when the work is
finished. For eligibility testing and BenManage/IPS reconciliation specifically, the
`benefits-eligibility-audit` skill is the method; this one is the verdict on what that
produced. Use both together, and load durable facts from `session-memory` rather than
recalling them. For work outside benefits, `konyo-workflow` is the same discipline in
general form.

**`references/deliverables.md` is what each recurring deliverable specifically needs
before it ships** — booklets, the Benefits Hub, eligibility and invoice audit output, rate
tables, the contacts workbook, the comms calendar, OE communications, meeting materials,
and the reusable engines. Each block lists where the truth lives for that work, what has
to be true, and the trap that has already caught it once. Read the block for whatever is
being finished, at Step 3 and again at Step 6.

---

## Rule 0 — the verdict is one of three words, and it fails closed

Every run ends with exactly one:

| Verdict | Meaning |
|---|---|
| **SHIP** | Every applicable check passed *with evidence*. Safe to send to HR, post to the hub, attach to the OE email, hand to the administrator. |
| **DRAFT** | The work is sound but the bar was not fully met — usually missing proof, not missing quality. Fine to keep working on; not fine to distribute. |
| **BLOCKED** | A real problem was found. Say what it is and what would unblock it. |

**Missing evidence is not a pass.** If a check could not be run, it is `N/A` and the
reason must be stated. "I couldn't confirm the Rx carrier for Palmer Ranch because the
PANDA tab doesn't list it" is a legitimate N/A. "It looks fine" is not — that is a
FAIL wearing a friendly face.

Never report SHIP to be agreeable. A wrong SHIP costs far more than an honest DRAFT,
because a DRAFT gets a second look and a SHIP gets emailed.

---

## Step 1 — Understand before building

Restate the goal in your own words, including:

- What "done" looks like **concretely** — which facilities, which region, which plan
  year, which file, and what must be true at the end.
- What is explicitly **out of scope** — the other nine booklets, the hub, the OE email.
- Anything ambiguous. Ask now; a wrong assumption about a facility's plan set is
  cheapest to fix before the render, not after.

**Name the facility and the region out loud.** Almost everything in this environment
varies by facility and by NY/NJ vs Florida. Work that doesn't state which one it
assumed cannot be checked by anyone, including you later.

If the request is one small, clearly-specified change — a date, a logo swap, one line
of copy — say so and skip to Step 2 with a single round. **Ceremony proportional to
stakes.** A full workflow on a two-word fix wastes time and will get this skill
switched off.

---

## Step 2 — Build in rounds, one coherent theme per round

A round is a set of changes that belong together and can be judged together. One
facility's booklet is a round. "Carrier corrections across all Florida variants" is a
round. "Carrier corrections plus some hub tidying" is not — mixing them makes the
round impossible to evaluate and impossible to undo.

**Change only what was asked for.** No drive-by improvements, re-wording, re-styling
or "while I was in that file anyway" tidying. If you notice something else wrong —
a stale premium, a broken tile, a facility whose LTD scope looks off — *say so and
leave it.* An unrequested change is indistinguishable from a mistake to whoever
reviews it next, and it is why a one-date fix arrives as a rebuilt booklet nobody can
check.

---

## Step 3 — Prove the round (this is the part people skip)

For each round, state what you checked, **with the actual result**. If this is one of the
recurring deliverables, open its block in `references/deliverables.md` first.

**A proof that measures something already empty proves nothing.** "No eligibility
violations found" is worthless if the filter matched zero rows, or if there were no
violations before your change either. Say what the count was *before* and *after*, and
say how many rows you were looking at. A clean result on an empty set is not a clean
result.

**Restating what you did is not proof.** "I updated the plan year" is a description.
"The plan year now reads 8/1/2026–7/31/2027 on the cover, page 2 and page 14, and read
the prior year on all three before" is proof. (Values in this skill's examples are
illustrative only — never source a plan fact from this file.)

**Check the artifact, not the source that made it.** If the goal is "the booklet says
The Hartford," the proof is the text extracted from the rendered PDF page — not the
config value you set, and not the HTML you fed WeasyPrint. Renders fail silently. Open
the output. Same for the hub: click the filter, don't read the JavaScript.

**Make the two systems actually tie.** When reconciling — BenManage against IPS, either
against PANDA — a match is a number, not an impression. Row counts, name-by-name,
and the exceptions listed individually. "They broadly agree" is not a reconciliation.

**Sweep the class — this is the one that matters most here.** When you fix something,
assume it is wrong in every other variant until you have looked. The same carrier, the
same plan year, the same footer, the same logo lives in eleven facility booklets, the
hub, the workbook and the OE email. Fix every instance, or list the ones you
deliberately left and why. Fixing only the one in front of you is how the same wrong
carrier ships three times.

**Kill the stale claim.** If you changed what something says, find everywhere else that
*describes* the old version — the hub tile, the summary page, the workbook sheet, the
comms calendar, the session-memory record — and correct them in the same round. Two
documents giving employees different answers is worse than one wrong document, because
nothing catches it and HR gets the call.

---

## Step 4 — The third eye: an adversarial back-pass

Now stop building and try to **break what you just made.**

Read it as if a facility administrator handed it to you and asked you to approve it
going out. Your job in this pass is **not** to admire it. Go through these lenses one
at a time — they are separate on purpose, because each catches what the others miss:

1. **Correctness** — is anything actually *wrong*? Carrier names, plan names, network
   names, Rx vendor, telehealth vendor, wage-access provider, LTD scope, pay cycle,
   dates, premiums, phone numbers, facility names, brand.
2. **Completeness** — what is *missing*? A facility not covered, a region not
   addressed, a plan offered but never described, a page promised in the contents and
   never rendered, a question the employee will obviously ask and cannot answer from
   this.
3. **Blast radius** — what else does this affect that nobody listed? Which other
   booklets, which hub sections, which workbook sheets, which already-scheduled
   comms? Who has the old version already? How would this be undone if it's wrong?
4. **The embarrassment test** — if the most demanding reader saw this, what is the
   first thing they would object to? Pick the real one: the administrator who knows
   their own facility's plans better than the document does, the employee who enrolled
   based on it, or the auditor asking why two systems disagree. Fix that thing.

Then state your finding honestly:

> **You are being asked for analysis, not agreement** — and equally, do **not**
> manufacture a problem to look useful. State the strongest case that this work is
> wrong, then the strongest case that it is right, and say which you actually
> believe and why. If you cannot judge something on the evidence available, say
> exactly that and name what you would need. *"I can't verify Buena Vida's telehealth
> vendor — I'd need the UNION INFORMATION tab or the facility guidebook"* is a real
> answer and is worth more than a confident guess.

### ⚠ The known weakness of this step, stated plainly

**This back-pass is the same model reviewing its own work.** That is a genuine
limitation, not a formality. A second reviewer — a different AI, or Patty, Mirelle or
the facility administrator — catches things Claude structurally cannot see about its
own output, because their blind spots are in different places. Same-model review has
*correlated* blind spots: the reviewer finds the errors it was already capable of
noticing, and misses the ones built into how it approached the problem to begin with.
If Claude misread which region a facility is in, it will review the whole document
confidently in the wrong region.

So this step is a **real improvement over no review, and weaker than an independent
one.** Three things make it less weak, and they are required, not optional:

- **Re-open the actual artifact.** Extract the text from the rendered PDF. Load the
  hub file. Read the sheet. Do not review your memory of what you meant to produce —
  most self-review failures are reviewing the intention instead of the result.
- **Default to refuted when uncertain.** If you are unsure whether a facility really
  offers that plan, treat it as wrong and go check the source. Uncertainty resolved in
  favour of "probably fine" is how a wrong booklet gets distributed.
- **Name what you could not check.** End the pass with an explicit list of what
  remains unverified — which facilities, which fields, which sources you didn't have.
  That list is the honest boundary of this workflow's confidence, and it is the thing
  that tells you where to look yourself.

**When it genuinely matters — anything employee-facing — have a human look.** This
skill is designed to work alone, not to claim that working alone is as good.

---

## Step 5 — Fix, then re-prove

Anything the back-pass found gets fixed, and then **proven again**. A fix is not done
because it was applied; it is done because the failure no longer happens and you have
said so with evidence. Re-render and re-read — a PyMuPDF edit that reported success
can still have landed on the wrong page.

If a fix touches something an earlier round proved, that proof is stale. Redo it.

---

## Step 6 — Seal it

Report, briefly:

- **Verdict** — SHIP / DRAFT / BLOCKED, against the must-be-true list for this
  deliverable in `references/deliverables.md`.
- **What changed** — in plain language, what a reader would notice.
- **How it was proven** — the checks and their actual results.
- **What was NOT checked** — the honest boundary, named specifically.
- **How to undo it** — file paths, prior versions, and whether anything has already
  gone out.
- **What this now contradicts** — any other file, sheet or scheduled message that
  still says the old thing and is not in scope for this round.

Then stop. Do not append a list of things you did not do and call it next steps unless
they were asked for.

---

## The checks (mark each PASS / FAIL / N/A-with-reason)

Skip what does not apply — but say you skipped it and why. Silence reads as "passed".

**Applies to all work**

| Check | Question |
|---|---|
| Correct | Is it factually and logically right? |
| Complete | Does it cover everything asked, and nothing it shouldn't? |
| Evidence | Is each claim backed by something checkable? |
| Facility + region | Is it right for *this* facility and *this* region, not the last one you worked on? |
| Source read | Did you read what the source says about ITSELF — the note at the top of the tab, the column label, a footnote, an effective date, a future-dated row — and not only its numbers? A rate table read at the wrong tier or the wrong plan year reconciles perfectly. |
| Swept | Does the same issue exist in other facilities, regions, booklets or sheets, and were they fixed or listed? |
| Stale claims | Does anything else still describe the old version? |
| Clarity | Would an employee with no HR background understand it without you explaining? |
| Reversible | Can this be undone, is that written down, and has any of it already gone out? |

**Applies to anything you build and ship — booklets, hub, workbooks, audits**
*(mark N/A for pure advice or discussion)*

| Check | Question |
|---|---|
| Renders | Did the file actually build, open, and paginate — and did you look at the output, not the source? |
| Numbers tie | Do totals, counts and cross-references agree between every place they appear, and between systems? |
| Formulas | Do they compute on real data, including the edge rows — blanks, terminated employees, zero-hour, mid-year hires? |
| Reachability | Is every tile, link, filter option and page actually reachable, and does it have content behind it? A hub tile nobody can click, or a filter with no matching records, is worse than a missing one — nobody looks again. |
| Sensitive data | Any employee names, SSNs, DOBs, wages or enrollment detail in a file that is about to be shared more widely than it should be? |
| Brand + format | Correct logo artwork, correct colours, correct facility name and brand, consistent with the rest of the suite. |
| Version + record | Is the file named/versioned so the prior one survives, and is the change recorded in session memory? |
| Rollback | Is the reverse path known — the prior file, and who already has the old one? |

**Applies to anything that will RUN AGAIN — the monthly medical audit, the eligibility
engine, a reusable workbook, any saved skill or macro**
*(mark N/A for a one-off document)*

| Check | Question |
|---|---|
| Ran on real input | Did it run on an actual month's data, not only the example? Say which month and how many rows. |
| Every facility answered | Did any facility come back NOT TESTED, blank, or skipped — and is that named rather than dropped from the denominator? |
| Fails loudly | If a source file is missing, renamed, or has a changed column, does it RAISE — or does it quietly return a clean-looking result? A silent pass is the worst outcome this file can produce. |
| Filter is real | Every facility/plan/region filter matched something. Zero rows means the spelling did not match that system's spelling, until you have proved otherwise. |
| Edge rows | Terminated mid-month, hired mid-month, zero-hour, dual coverage, retro adjustment, negative amount — what did each one do? |
| Rerunnable | Running it twice does not double-post or double-count, and the second run is a no-op or an honest update. |
| Paths + access | No path or credential that only works on your machine or your login. |
| Recorded | What it did, for which month, is written where a person can read it later. |

⚠ **These eight are the ones most easily skipped, because a recurring process feels
already-proven — it worked last month.** It worked last month on last month's data. The
statement changed, a facility was added, a carrier renamed a plan, a column moved. The
whole point of a recurring process is that nobody watches it closely, which is exactly why
it needs the strictest bar, not the loosest.

**On ties and counts specifically:** "the reports match" is not evidence. Prove it —
row counts on both sides, the number of exceptions, and the exceptions named. A check
that cannot fail proves nothing: if you filtered to a facility and got zero rows,
confirm the filter matches how that facility is actually spelled in that system before
you call it clean.

---

## The fields that vary, and where the truth lives

These are the fields that have caused real errors in this work. They vary by facility
and by region, and none of them should ever be assumed from another facility, from an
earlier booklet, or from memory. **Verify each one, per facility, against the source —
not against this list.** No values are recorded in the table below, deliberately: a
second copy of the values would go stale and become exactly the contradicting document
this skill tells you to hunt down.

| Field | Where the truth lives |
|---|---|
| Union status and what that facility's union members are eligible for | UNION INFORMATION tab of the PANDA renewal workbook |
| Medical plan set, plan names and network | PANDA renewal workbook; facility guidebook packet |
| Rx carrier | PANDA; varies by region |
| LTD carrier and whether LTD is offered at all | PANDA; facility guidebook |
| Telehealth vendor | Facility guidebook; region-restricted — confirm before including |
| Wage-access / early-pay provider | Facility guidebook; known to be inconsistent between sources — reconcile before publishing |
| Dental and vision rates | Current rate sheet, or the agreed "ask HR" treatment |
| Pay cycle | Region |
| Plan year dates and the OE window | The current plan-year decision, applied identically everywhere |
| Enrollment vs. payroll deduction | BenManage and IPS — both, reconciled |
| **Which carrier and administrator a facility sits on** | PANDA — the `CIGNA - PHCS` sheet vs the `BLUE CROSS BLUE SHIELD` sheet. This decides whether an APA statement even exists for that facility |
| **The facility roster itself** | PANDA, read across **all** rate blocks — see below |

If a field cannot be sourced, it is `N/A` with the reason, and it is a reason not to
ship that facility yet. It is not a reason to copy the neighbouring facility's value.

### The facility roster is not a list you can hold in your head

PANDA is the authoritative roster, and reading it is harder than it looks. Three traps, all of
which have produced a wrong roster:

1. **The facility lists are not in one place.** The CIGNA - PHCS sheet holds ~19 rate blocks in a
   repeating 7-column pattern. Only some carry a "FACILITIES Covered under…" list; the rest name
   their facility only in the block title at row 1. Reading the lists alone loses facilities —
   **Sabal Palm** appears in no list at all, and **Clove Lakes** and **Golden Hill** appear only on
   the `UNION and Part Time Benefits` tab.
2. **Not every name under a block header is a facility.** One block lists *job titles* (the Sara
   Neuman non-union block) and another lists *ten named individuals* (Frontline grandfathered Clove
   Lakes employees). Both look like facility lists.
3. **Carrier determines whether a deliverable applies at all.** Facilities on the BCBS sheet are
   administered by Leading Edge, not APA — so no APA invoice exists for them, and an invoice audit
   that "can't find" their statement is not finding a problem.

**Which facilities are in scope, which carrier each is on, and how much of the current month has
been audited live in **`monthly-medical-audit`'s facilities reference** — one file, kept current as
each facility is completed. Read it rather than a count quoted in conversation: those go out of date
within the same working session. Two facilities were added to the roster and four more audited in
the space of one afternoon, and every count stated earlier that day was wrong by the end of it.

Which of these fields matters for which deliverable — and the trap each one has already
sprung — is in `references/deliverables.md`.

---

## Scaling — and how to ask for more or less

By default, judge the depth from the stakes:

| Situation | What to do |
|---|---|
| Small, clear, internal — a working file, a draft for one person | One round, prove it, brief back-pass. Minutes. |
| Normal work | The full six steps, one or two rounds. |
| Employee-facing, multi-facility, or irreversible once sent | Full workflow, every back-pass lens separately, and **say out loud** that a human should look before it goes out. |

Override that judgement by saying so:

| You say | Claude does |
|---|---|
| "quick pass", "just sanity check it", "don't overthink this" | One round. Still checks it and still gives a verdict — **speed never removes the verdict or the honesty about what went unchecked.** |
| *(nothing)* | Judges from the stakes, as above. |
| "be thorough", "this really matters", "go deep" | Every back-pass lens, separately. Re-reads the artifact twice with a gap. States explicitly that an independent human should look before this goes out. |

**What "quick" may never do:** skip the verdict, hide an uncertainty, or report SHIP on
something unchecked. It reduces how *much* gets examined, never how *honestly* it is
reported. If a quick pass finds something serious, it stops being quick and says so.

> **Note if you know the Claude Code version:** that one has `tiny` / `lean` / `max`
> qualities which control how many parallel agents get spawned and how long a run
> takes. None of that exists here — this skill runs in one conversation with no agents
> to spawn — so those names would be labels controlling nothing. The table above is the
> honest equivalent: it changes depth, which is the only thing that actually varies.

---

## Scars — how this skill gets smarter instead of you re-learning

The base workflow keeps a `scars.md`: when something goes wrong in a way that could happen
again, it becomes a written rule that is read before the next job. This fork dropped that
file, which means nothing here currently learns. Every mistake stays a one-off.

**On Desktop there is no disk to keep a scars file on** — that is the real difference, and
it is why the base's version does not port directly. But you already built the substrate:
`session-memory`. Scars belong there, in the store, beside the workstream state.

### The loop, in three moves

1. **Read them first.** At the start of a session, `session-memory` loads your state; the
   scars list rides along with it. Skim it before starting the job, not after.
2. **Record one only when it passes all three gates.** Most work produces no scar.
   - It actually went wrong, or would have if nobody caught it.
   - It could plausibly happen again — a different facility, a different month.
   - A rule stated beforehand would have prevented it.
   Two of three is not enough. A file full of near-misses stops being read, and a scars list
   nobody reads is worse than none, because everyone believes it is working.
3. **Write it in six lines**: what happened · what it cost · the rule, stated so it can be
   followed before the fact · how you would notice it recurring · the date · which
   deliverable type it belongs to.

### When a scar has earned its own skill

**Three or more scars in the same territory means that territory should become its own
skill.** Not three scars in the same FILE — three scars with the same *failure shape*. "Three
things went wrong in the invoice audit" is a pile. "Three times a facility's name was spelled
differently between APA and IPS and a filter silently matched nothing" is a territory, and it
has a name, and it should be a skill with its own checks.

That is how `monthly-medical-audit` and `benefits-eligibility-audit` should grow — and how the
next one should be born, rather than being designed from scratch each time.

⚠ **Never let a scar suppress a check.** A scar narrows where you look first. It never
excuses skipping a row in the tables above, no matter how many times that row has passed.

---

## Three habits worth more than any checklist

These come from three separate hard lessons on the engineering side of the same workflow.
They are not benefits rules, which is exactly why they transfer — each one is about how work
goes wrong, not about what the work is.

### 1. The list you were handed is not the list of what is wrong

You are asked to fix Tamarac's dental rate. You fix it. Done — except the same rate came
from the same source into eight other facilities' booklets, the Hub table, the rate workbook
and next Tuesday's OE email.

**So the moment you fix something, go looking for its siblings before you say it is done.**
Search for the value, the plan name, the carrier — not the symptom. Ask "where else did this
number come from the same place?" A fix applied to one of several identical sites reports
success and leaves the problem running, and the survivors are now HARDER to find, because
the issue looks closed.

⚠ Two cautions, both learned the expensive way. **Strip the prose before you believe a
count** — half your search hits will be the sentence describing the problem rather than the
problem. And **a finding too large to act on is noise**: if the search returns 200 places,
narrow it to the ones that actually pay something or tell an employee something, and say
that you narrowed it.

### 2. One artifact living in several places drifts, always

A carrier name lives in the booklet, the Hub, the workbook, the comms calendar and a saved
PDF someone downloaded in March. The moment there are two copies, they will disagree, and
the disagreement will be discovered by an employee.

**Name ONE source and write there.** Everything else is generated or copied FROM it, never
edited in place. If you find yourself correcting the same fact in a second location, stop —
you have just proved the first location is not the source, and the third copy you have not
thought of yet is already wrong.

⚠ **A sync that only pulls is a leak.** If the Hub is refreshed from the workbook but a
correction gets typed into the Hub, that correction dies at the next refresh — silently, and
looking exactly like it was never made.

### 3. A number nobody measured must never look like one that was

The most dangerous output is not an error message. It is a plausible figure sitting where a
real one belongs: a premium that quietly defaults to last year's, a count that reads 0
because the filter matched nothing, a rate that renders as `$--` in one place and as a real
number in another, a "total" that silently excludes the facility whose file failed to load.

**If you did not measure it, say so in the place the number would have been.** "Not
available for Bayside — their August file has not arrived" is worth more than a total that
looks complete.

⚠ **The worst shape is an error sitting BESIDE a healthy default.** A page that reports "3
facilities pending" next to a full-looking enrollment table reads as "everything is fine and
three are late" — when it may mean the table is missing three facilities' worth of people.
When something failed, the numbers that depend on it must visibly refuse, not quietly shrink.

---

## What this skill will not do

- Report success for work that was not done or not checked.
- Say SHIP when a required check has no evidence behind it.
- Assume a facility's plan details from another facility or from memory.
- Hide an uncertainty to sound more confident.
- Expand the job beyond what was asked without saying so.

*Created by Konyo. The discipline is his; this is the version that runs anywhere, with
no second AI required — adapted to ICC benefits work without changing any of his rules.
The general form of the same discipline is `konyo-workflow`.*
