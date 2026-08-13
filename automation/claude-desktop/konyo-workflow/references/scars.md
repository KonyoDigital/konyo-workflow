# Scars — format, gates, and where they live

Read this at the start of a session to load the scars, when a run produced one, or when
setting the file up for the first time. This file is the whole mechanism — the spine only
asks, at the seal, whether a scar applied and whether this run earned one.

**Why it exists.** Everything in `SKILL.md` improves *this* work. This is the only part that
improves the **next** work: a conversation ends and everything it learned dies with it, and
notes don't help because nobody re-reads their notes before starting. A scar is a mistake
converted into a rule that gets re-read at the start of a run — from the file, not
remembered from a conversation.

⚠ Nothing "loads itself." The only mechanism is that the file gets read before Step 1, which
is discipline — the same kind that makes notes fail. What makes it different is that it is
*one short file, in a fixed place, read at a fixed point.* That is a real difference and a
small one, and claiming more would be exactly the unearned promise this skill exists to
catch.

---

## Where the file lives

`SCARS.md` in the **`your-org/claude-memory`** repo, alongside the session-context
records. Read it through the GitHub connector before Step 1; commit updates at the end of a
run.

Two reasons it is there and not in the skill folder: a file inside a skill only survives if
the skill is re-packaged, and the repo is already the durable place. And `session-memory`
carries **state** — what was built, what is pending — while scars carry **rules**. Keep them
separate; a rule buried in a status note is a rule nobody re-reads.

If the connector is unavailable this run, say so plainly, print any scar block in the seal so
it can be pasted by hand, and proceed on the skill's steps. **Do not claim the file was
read.**

### First-time setup

The file has three sections in this order:

```markdown
# SCARS

## FOUNDING RULES
(yours — written by hand. Nothing learned may overwrite one.)

## LEARNED SCARS
(appended from runs that went wrong, newest first)
```

Nothing else. No candidate block, no placeholder rules — an invented founding rule carries
your authority without your judgement behind it, which is the exact failure the EVIDENCE line
exists to prevent. Until you write some, **FOUNDING RULES is legitimately empty** and every
run proceeds on the skill's steps alone. Say that once, plainly.

---

## Two layers, and the difference is authority

**FOUNDING RULES are yours** — written by hand, deliberately, at the top of the file. Not
lessons from a bug but the terms your work runs on ("nothing goes out that I haven't read end
to end in the form the recipient sees it"). **Nothing learned may ever overwrite one, and
Claude must never write one for you.**

**LEARNED SCARS append below**, at lower authority on purpose: a rule extracted from one bad
afternoon shouldn't weigh the same as one you chose while thinking clearly.

Until you ratify founding rules that section is legitimately empty and runs proceed on the
skill's steps alone. Say that once, plainly, rather than letting anything read as though
rules are in force.

---

## The format — six lines, every time

```
WHAT BROKE   the document named a vendor that only applies in the other region
COST         two variants were rendered and one had already gone to an administrator
CAUGHT BY    re-reading the rendered output, not the config that produced it
RULE         every value that varies by region is confirmed against that instance's
             own source before the build, not after
GUARD        Step 3 — "check the artifact, not the source that made it"
EVIDENCE     the name appeared on page 6 of both renders; the source lists it for one
             region only, and I checked all four variants before concluding that
```

The first three lines are the diary. The last three are what make it a defence, and they are
the three people skip.

- **RULE is an instruction, not a regret.** "Be more careful with vendors" is not a rule —
  nothing can follow it. "Confirm every region-restricted value against that instance's own
  source before the build" is, because you can tell whether you did it.
- **GUARD names where the rule now lives.** A step here, a checklist line, a rule in a script
  — or **a question you now always ask, which is a real guard and not a lesser one.** If you edited nothing, say so; an invented "added to Step 4" reads as stronger than
  the truth, which is exactly the incentive to avoid. If there genuinely is no guard, write
  `GUARD: NONE` honestly. An honest NONE is a hazard you know about; an invented guard reads
  as protected and is worse than nothing.
  - ⚠ **A question only guards a run that continues.** If the run ends when you answer, the
    honest GUARD is `NONE`, followed by the durable place the rule belongs and who can put it
    there. **The scar block you print IS that handoff** — the guard exists when it is
    committed, not when it is written.

⚠ **A long session has no seal, so record at the failure, not at the end.** The scar question
lives at the seal, and a long run — dozens of turns, no natural stopping point — never reaches
one. The trigger is sound and simply never fires. When a failure costs something, write the
scar THEN; the seal's question then becomes "did I record the ones I hit?" rather than "should
I invent one now?"
- **EVIDENCE names what in *this run* proved it** — what happened, not why it sounds
  sensible. This is the difference between a rule and a superstition. Without it the file
  fills with confident restrictions nobody can trace.

---

## The three gates — most work produces no scar

A scar is about the **run**, not about you. The trigger is not "I made a mistake," it is
"this run hit something that will happen again." Finding a trap in a workbook someone else
built is a scar when it nearly worked — and "nearly" has to be earned: name what it would
have cost, and why the next ordinary check would not have caught it. Checking work you did not
write is the most common real use of this skill, so a trigger phrased as self-blame silently
excludes it.

**Record one only if it clears all three:**

1. **It cost something** — rework, a wrong answer that got out, real time. "I noticed a
   thing" is not a scar. The cost may sit in someone else's file — a wrong figure already in a
   document somebody has — but then name *whose* cost and how you know, because this is the
   easiest of the three to talk yourself past.
2. **It would recur** — the same shape can happen on different work. A one-off quirk of one
   export is not a rule.
3. **The rule is actionable** — a future run can tell whether it followed it.

If several describe the **same** failure, write the most expensive framing. **One per
distinct failure, not one per run** — a long session that hit four earns four. If none
clear the gates, **"no scar" is the correct and common answer.**

---

## Backup discipline

**Copy `SCARS.md` to `SCARS.prev.md` before every change — adding a scar OR removing one.** A
lesson from one confusing afternoon can have the wrong cause or a rule drawn too wide, and a
wrong rule is worse than no rule because it gets followed. In a git repo the history already
does this, so a commit per change with the reason in the message is the backup.

⚠ **Deletion needs the backup more than addition does.** A bad scar is recoverable by
deleting it; deleting a good one loses the evidence that produced it, and nothing left in the
file will say it was ever there. **When you remove one, say in that run's seal which scar went
and why** — a scar that vanishes with no record looks identical to one never written.

**If you already edited the file without snapshotting first: leave `SCARS.prev.md` alone.** It
is now one version behind instead of zero, and one behind is a smaller loss than none.
Copying the current file over it makes the diff empty and destroys the record of the edit you
just made — the repair is strictly worse than the mistake.

**Founding rules are untouched by any of this.** They change only by hand.

---

## Getting the scar recorded — do all three, in order

Do not try to work out which environment you are in; the classification is not decidable from
inside a run.

1. **Print the block in the seal**, formatted and ready to paste. This is the only version
   that survives if everything about the file handling goes wrong, and it costs almost
   nothing.
2. **Write the updated file and commit it to the repo** — or hand it over if you cannot.
   ⚠ **"Cannot" includes "may not."** If you named the files this run may touch, that list
   governs the scar file too. Step 1 already preserved it, so not writing costs nothing.
3. **Say plainly that durability is unverified**, in one sentence, every time.

⚠ **Reading the file back proves the WRITE, never the DURABILITY.** A write into a workspace
discarded at the end of the session succeeds, reads back correctly and persists nothing. **Never
say a scar was saved** — say it was printed and written, and that committing it is yours to
confirm.

---

## Ratifying the founding rules — the conversation

Founding rules cannot be written from first principles, by you or by Claude. A rule invented
in advance is a guess about what will go wrong; the ones that hold come from things that
already did. So the conversation is about your past, not your intentions. **Four questions:**

1. **What went out wrong in the last year — and what did it cost?** Not near-misses.
   Something that reached another person — an employee, an administrator, a carrier, leadership. One or two is plenty.
2. **What did you find out afterwards that you could have checked before?** This is where the
   rule lives. "I could have opened the source" is a rule. "I should have been more
   careful" is not.
3. **What do you already always do, that you would be annoyed to see skipped?** These are
   founding rules never written down, and usually the strongest — you have been following them
   long enough to trust them.
4. **What would you refuse to do even under deadline?** A rule that bends when you are busy is
   a preference, and it belongs lower.

Then **three to six, in your own words**, each with the thing that produced it. Three is
plenty; twenty is a list nobody reads, which is the failure this whole file is built against.

⚠ **Claude must not write these for you.** It can ask the questions, push back on a rule that
is not actionable, and draft wording **from answers you gave** — that is editing, and it is
welcome. Inventing the answers is not: a founding rule carries your authority, and one you did
not choose will be followed by every future run as though you had.

---

## When a territory has earned its own skill

Watch for **three or more scars in the same territory** — not the same mistake three times
but the same *area*: three about figures, three about how a name is spelled across systems, three
about one recurring report. That area is recurring work and has earned its own
instructions:

1. **Write a sibling skill** named for the territory.
2. **Put the rules in as procedure**, not warnings: steps, order, specific checks, the trap
   that keeps catching you. Scars are raw material; the skill is the finished procedure.
3. **Name the scar each rule came from.** A rule without a recorded origin gets deleted by
   the first person tidying up, and then it happens again.
4. **Leave a pointer** so this skill loads the child in that territory.
5. **Delete those entries from `SCARS.md`.** Not housekeeping — the file stays short *because*
   things graduate out of it.

That loop is how the workflow gets better at **her** job rather than at jobs in general:
work produces scars → scars accumulate into a territory → the territory becomes a skill →
the skill makes that work reliable. Nobody can hand you that version; it can only be grown.
