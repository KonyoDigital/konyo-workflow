# SCARS

This is the file the workflow reads at Step 0 of every run. It has three layers, and the
difference between them is **authority**.

---

## FOUNDING RULES

*(Empty on purpose. These are yours — written by hand, deliberately. They are the terms
your work runs on, not lessons from a bug, and nothing learned may ever overwrite one.)*

**Claude must not write these for you.** A founding rule carries your authority, and one
you did not choose will be followed by every future run as though you had. Until you
ratify some, this section is legitimately empty and every run proceeds on the skill's
steps alone.

**To ratify yours, answer four questions** — they are about your past, not your intentions,
because a rule invented in advance is a guess about what will go wrong:

1. **What went out wrong in the last year — and what did it cost?** Not near-misses.
   Something that reached another person. One or two is plenty.
2. **What did you find out afterwards that you could have checked before?** This is where
   the rule lives. "I could have opened the source" is a rule. "I should have been more
   careful" is not.
3. **What do you already always do, that you would be annoyed to see skipped?** These are
   founding rules never written down, and usually the strongest.
4. **What would you refuse to do even under deadline?** A rule that bends when you are busy
   is a preference, and it belongs lower.

Then write **three to six, in your own words**, each with the thing that produced it.
Three is plenty; twenty is a list nobody reads.

---

## STARTER RULES — generalized, not yours yet

⚠ **Read this paragraph before trusting anything below it.** These did not come from your
work. They are domain-neutral failure modes that recur across many projects, shipped as a
starting point so the file is not empty on day one. They sit **below** founding rules and
**below** anything you learn yourself, and their EVIDENCE lines say honestly that the
incident was someone else's. **Delete any that do not match how you work** — a rule you
kept out of politeness is a rule you will follow without believing it.

When one of these bites you for real, rewrite it in place with your own COST and EVIDENCE.
That is the moment it stops being a starter rule and becomes a scar.

---

### S1 — A green gate proves nothing until it has been seen RED

```
WHAT BROKE   a check reported success without ever being able to report failure
COST         a defect shipped behind a passing test; the test was the reason nobody looked
CAUGHT BY    deliberately breaking the thing the check guards, and watching the check
RULE         before trusting any new check, break what it guards on purpose and confirm it
             goes red; a check never seen red is measuring nothing
GUARD        the build step "prove the gate fails" — run once per new gate
EVIDENCE     generalized. Common causes are a stubbed fixture, a viewport that never
             renders the element, the gate's own parser silently matching nothing, and a
             gate that SKIPS rather than fails. A gate that always skips is the same defect.
```

### S2 — Two halves, each correct, never joined

```
WHAT BROKE   a feature was built correctly on both ends and the two ends never met
COST         it read as wired from either side and carried nothing; found late, by a user
CAUGHT BY    following one real value end to end, rather than reviewing each side
RULE         before calling anything done, trace one real value across the joint — route to
             handler, caller to function, key written to key read, element id to element
GUARD        the seal question "which joint did I actually cross, with what value?"
EVIDENCE     generalized. The defining property is that it is SILENT: nothing errors, and
             the empty or default result looks like a legitimate answer.
```

### S3 — A reading carries the age of what it measured, not when you fetched it

```
WHAT BROKE   a value was labelled with the time it was retrieved, not the time it was true
COST         a decision made on data that was hours older than its own timestamp claimed
CAUGHT BY    asking of a displayed figure "when was THIS true?" instead of "when did I get it?"
RULE         stamp every reading with the age of the underlying thing; if you cannot
             establish that age, label it UNKNOWN rather than current
GUARD        every rendered figure carries a source and an as-of, or it is not rendered
EVIDENCE     generalized. Recurring shapes are "updated" meaning "checked", a delayed feed
             shown beside a live one, and a cache whose age nobody propagated.
```

### S4 — An unmeasured number must stay unknown

```
WHAT BROKE   a default or fallback value reached a screen and was read as a measurement
COST         someone acted on a number nobody had measured
CAUGHT BY    grepping for the fallback operators and asking what each one renders as
RULE         never let a default, a `or`/`??` fallback or a placeholder reach a surface a
             person acts on; render the absence explicitly instead
GUARD        a review pass over every default and fallback on a user-visible path
EVIDENCE     generalized. A missing number is recoverable; a confident wrong one is not.
```

### S5 — A label that outlived what it referred to

```
WHAT BROKE   a correct number sat under a word that had stopped describing it
COST         readers drew the wrong conclusion from data that was, in itself, right
CAUGHT BY    reading the label and the value together as a sentence, out loud
RULE         when a calculation changes, re-read every label over it; the number and its
             word are one claim, and only one of them was updated
GUARD        the review question "does this heading still name what is under it?"
EVIDENCE     generalized. Especially common after a metric is redefined but the column,
             chart title or variable name is left alone.
```

### S6 — One artifact living in several places

```
WHAT BROKE   a fix was made to a copy, while the authoritative version went unchanged
COST         the fix "did not take"; worse, the two copies drifted in opposite directions
CAUGHT BY    diffing the copies instead of trusting that a sync had run
RULE         name ONE authoritative copy and always edit there; a sync that only pulls in
             one direction leaks changes made at the other end
GUARD        before editing anything under an install, vendor, dist or synced directory,
             establish which copy is upstream
EVIDENCE     generalized. The dangerous case is a SAFETY routine that exists twice, because
             then only one of the two is actually protecting anything.
```

### S7 — The handed list is not the whole list

```
WHAT BROKE   the reported items were fixed and identical siblings elsewhere were left alone
COST         the same defect came back from a different file a week later
CAUGHT BY    grepping for the defect's shape after fixing the named instance
RULE         after closing a defect at one site, sweep the tree for siblings of the same
             shape and fix them in the same pass, without being asked
GUARD        the seal question "where else does this exact shape occur?"
EVIDENCE     generalized. A bug report is a sample, not a census.
```

### S8 — Verify the thing, not a proxy for it

```
WHAT BROKE   a check confirmed something adjacent to the claim rather than the claim itself
COST         a confident "done" that was not true — file written but never loaded, endpoint
             reachable but returning the wrong body
CAUGHT BY    writing down the literal claim, then asking what would prove exactly that
RULE         state the claim in one sentence, then verify that sentence; "the file exists"
             does not prove "the page uses it"
GUARD        every proof names the claim it proves, in the same line
EVIDENCE     generalized. Reading a file back proves the WRITE; it never proves durability,
             loading, or use.
```

---

## LEARNED SCARS

*(Yours. Appended from runs that went wrong, newest first. Empty until your first one.)*

**The three gates — most work produces no scar.** Record one only if it clears all three:

1. **It cost something** — rework, a wrong answer that got out, real time. "I noticed a
   thing" is not a scar.
2. **It would recur** — the same shape can happen on different work. A one-off quirk of one
   export is not a rule.
3. **The rule is actionable** — a future run can tell whether it followed it.

If none clear the gates, **"no scar" is the correct and common answer.**

**Format — six lines, every time.** The first three are the diary; the last three are what
make it a defence, and they are the three people skip. `RULE` is an instruction, not a
regret. `GUARD` names where the rule now lives — and an honest `GUARD: NONE` is better than
an invented one, because an invented guard reads as protected. `EVIDENCE` names what in
*this run* proved it.

**When three land in the same territory**, carve them into their own skill and delete them
from here — see the `carving-skill`. This file stays short because things graduate out of
it, not because nothing goes wrong.

**Back up before every change** — adding OR removing. Copy to `SCARS.prev.md` first, or, in
a git repo, commit each change with the reason in the message. Deletion needs the backup
more than addition does.
