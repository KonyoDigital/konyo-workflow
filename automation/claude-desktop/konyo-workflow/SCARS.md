# SCARS

Mistakes that already happened, turned into rules that stop them happening again.

**Claude reads this file first, before Step 1.** It is the only thing in this skill
written by experience rather than by someone guessing in advance what would go
wrong — which is why it is worth more per line than the rest of the folder.

---

## How to add one

At the end of a run, Claude prints a scar block. Paste it below this line. Ten
seconds, and it is the whole reason this workflow gets better rather than just
staying the same.

**All five lines, every time.** The first four are a diary. `GUARD` is what makes it
a defence, and it is the one people skip:

- **RULE** must be an instruction you can tell whether you followed. *"Be more
  careful"* is not a rule — nothing can act on it.
- **GUARD** names where the rule now lives — a step, a checklist line, a question
  you now always ask. If there genuinely isn't one, write `GUARD: NONE` **honestly**.
  An honest NONE is a hazard you know about. An invented guard is worse than
  nothing, because it reads as protected.

---

## Format — this is an EXAMPLE, not a real scar

*Delete this block once you have a real one. It is here so the shape is obvious,
and it is labelled because an example mistaken for real history is its own bug.*

```
WHAT BROKE   the summary quoted a figure that was not in the source document
COST         it reached 40 people before anyone checked
CAUGHT BY    re-reading the source — not re-reading the summary
RULE         every figure in a summary is traced back to the sentence it came
             from, before the summary is called finished
GUARD        Step 3 checklist — "every number traced to source"
```

---

## Scars

*(none yet — this is the honest state of a skill nobody has used in anger.)*

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
