# SCARS

Two layers, and the difference between them is **authority**.

**Claude reads this file first, before Step 1.** It is the only thing in this
folder written by experience rather than by someone guessing in advance what would
go wrong — which is why it is worth more per line than the rest of it.

---

## FOUNDING RULES

**Yours. Written by hand, deliberately. Nothing learned may ever overwrite one.**

These are not lessons from a bug — they are the terms your work runs on. Write them
when you are thinking clearly, not when you are annoyed about something that just
broke. Three to six is plenty; a list of twenty is a list nobody reads.

*Replace these with your own. They are examples of the right shape and altitude,
not instructions:*

1. **Nothing goes to a client that I have not read end to end myself.**
2. **Every number is traced to the sentence it came from before it ships.**
3. **If I am not sure, the answer is "I'm checking" — never a confident guess.**

---

<!-- ===== LEARNED BELOW · appended from runs that went wrong ===== -->

## LEARNED SCARS

Lower authority than the founding rules, on purpose: a rule extracted from one bad
afternoon should not carry the same weight as one you chose while thinking clearly.

### How to add one

At the end of a run, Claude prints a scar block. Paste it below. Ten seconds, and it
is the entire reason this workflow gets better rather than just staying the same.

**All six lines, every time.** The first four are a diary. `GUARD` and `EVIDENCE`
are what make it a defence, and they are the two people skip:

- **RULE** must be an instruction you can tell whether you followed. *"Be more
  careful"* is not a rule — nothing can act on it.
- **GUARD** names where the rule now lives — a step, a checklist line, a question
  you now always ask. If there genuinely isn't one, write `GUARD: NONE`
  **honestly**. An honest NONE is a hazard you know about; an invented guard is
  worse than nothing, because it reads as protected.
- **EVIDENCE** names what in *that run* proved it. Not why it sounds sensible —
  what actually happened. Without this, a workflow slowly fills with confident
  restrictions nobody can trace, refusing things for reasons that were never true.

### Before you paste — keep the old version

Copy this file to `SCARS.prev.md` first, or keep the old text somewhere for a day.

A lesson drawn from one confusing afternoon can be **wrong**: wrong cause
identified, or the rule drawn too wide. A wrong rule is worse than no rule, because
you will actually follow it. Without a previous copy, a bad scar is permanent. With
one, undoing it takes ten seconds.

---

### Format — this is an EXAMPLE, not a real scar

*Delete this block once you have a real one. It is here so the shape is obvious,
and it is labelled because an example mistaken for real history is its own bug.*

```
WHAT BROKE   the summary quoted a figure that was not in the source document
COST         it reached 40 people before anyone checked
CAUGHT BY    re-reading the source — not re-reading the summary
RULE         every figure in a summary is traced back to the sentence it came
             from, before the summary is called finished
GUARD        Step 3 checklist — "every number traced to source"
EVIDENCE     the figure appeared in my draft and in no paragraph of the source;
             I searched all 14 pages before concluding that
```

---

### Scars

*(none yet — the honest state of a skill nobody has used in anger.)*

<!-- paste scar blocks below, newest first -->

---

## When to carve a new skill

When **three or more scars land in the same territory** — three about numbers, three
about client emails, three about one system — that area is not an occasional hazard.
It is a recurring kind of work, and it has earned its own skill.

Write it as a sibling folder with its own `SKILL.md`, move those rules into it as a
procedure rather than a list of warnings, keep a line on each rule naming the scar it
came from, and **delete those entries from here.**

This file is supposed to stay short. Not because things stop going wrong, but
because things keep graduating out of it.
