---
name: skill-forge
description: "Make, grow and package a Claude skill. Use when a task keeps repeating, when a mistake happens a third time, when asking should this be its own skill, or when packaging or updating one."
---

# Skill forge

**When to reach for this:** you have done the same job a third time and re-explained the same
context each time. Or something went wrong in a way that has now gone wrong twice before. Or
you have a skill and need to update, package or send it.

This is deliberately a **separate skill** from the workflow that does the work. Skills load by
their description, and "how do I turn this into a skill?" is a different question from "finish
this booklet properly" — guidance about making skills, kept inside a skill about doing benefits
work, would never load at the moment you need it.

---

## 1. Does this deserve to be a skill?

**The bar is evidence, not convenience.** "I have done this three times and keep
re-explaining it" is a reason to write a note in `session-memory`. It is not, by itself, a
reason to make a skill. A skill is a claim that these rules should be loaded and followed,
and that claim has to be paid for by something that actually went wrong.

### Carve when ALL THREE hold

1. **Three or more real failures share a territory.** Three is the floor, because two is a
   coincidence — two failures that look related are usually one failure written twice. A
   "failure" means it went wrong, or would have if nobody had caught it, and it cost
   something: a reissued booklet, a wrong number in front of an employee, an hour spent
   re-deriving what you already knew.
2. **The territory has a name a person would recognise** — "facility names spelled
   differently between systems", "the monthly invoice reconciliation", "open enrollment
   comms". If you cannot say it in a noun phrase, you have a pile, not a territory.
3. **There is standing guidance to give** — how to DO the thing, not only what to avoid. A
   skill that is nothing but a list of don'ts belongs in the scars list, not in its own file.

### The territory test, applied literally

Two failures are in the same territory when **the same one sentence, read beforehand, would
have prevented both.** Write that sentence out. Then check each failure against it. If you
have to widen the sentence to make the third one fit, it is probably not the same territory
— and a rule widened until it covers everything advises nothing.

Sort by **failure shape, never by subject or location**:

| Not a territory | A territory |
|---|---|
| "three things went wrong in the invoice audit" | "a facility spelled differently in two systems, so a filter silently matched nothing" |
| "three booklet errors" | "a figure correct for last plan year, carried into this one" |
| "three problems with the Hub" | "a correction typed into a page that is regenerated from a workbook" |

### Do NOT make a skill out of

- **Anything that is always loaded today.** If a rule lives in `session-memory`'s profile —
  read at the start of every session, unconditionally — moving it into a skill **demotes
  it**, because a skill loads only when its description matches. That is a silent downgrade
  of the rule you were most sure about. This is the single most common way a tidy-up makes
  things worse.
- **Fewer than three failures.** Wait. A notes list is allowed to have loose entries.
- **A grouping by WHERE rather than by WHAT WENT WRONG.** "Three problems in the August
  workbook" is not a territory; that workbook holds unrelated failures.
- **Something a checklist already enforces.** If a row in `benefits-workflow`'s tables
  already catches it every time, writing it into prose somewhere else **weakens** it — now
  there are two statements of one rule and only one of them is checked. Point at the check
  instead.
- **Anything Claude reliably does anyway.** A skill's credibility is spent every time it
  says something obvious.

### After carving — two steps people skip

- **Prune the source.** Whatever the new skill now holds, remove from where it used to live,
  and leave one line pointing at the skill. If nothing got shorter, nothing graduated — you
  just made a second copy, and copies drift.
- **Prove it loads.** Writing the file is not the end. Confirm it actually appears and fires
  on the words you would really type. **An unloaded skill is strictly worse than the notes
  it replaced**, because the notes at least got read.

## 2. What goes in it

A skill is not a summary of what you know. It is **the things that must be true, written so
they can fail**, plus the context you would otherwise re-explain.

- **The trigger conditions, in the description.** This is the part people get wrong. The
  description decides whether the skill ever loads. Put the real words in it — the ones you
  would actually type — not a subject heading. `"Benefits booklets"` will not fire.
  `"booklets, the Hub, eligibility and invoice audits, rate tables, OE comms"` will.
- **The failure modes.** Two or three ways this specific work goes wrong. This is what makes
  it feel written for you rather than about the topic.
- **What "done" means**, per artifact type, each line phrased so it can FAIL. A line that
  cannot fail is decoration.
- **The evidence behind each rule.** A rule you cannot trace is one you will eventually
  follow for a reason that stopped being true.
- **Where it is thin.** Say so. A skill built on three real failures carries their authority;
  do not spend that credibility on padding.

**Leave out:** anything Claude already knows, anything the source file itself says, and
anything that changes more often than you will update the skill.

---

## 3. Packaging — the rules that actually reject uploads

These are not style preferences. Each one has already broken a real upload.

| Rule | Why |
|---|---|
| `description` **≤ 200 characters** | Over 200 is rejected on upload. This has caught four files, including the base skill everyone is told to copy. |
| `name` **must equal the folder name** | A mismatch fails silently or installs under the wrong name. |
| **No `: ` in an unquoted description** | YAML reads a colon-space as a new key and refuses the file — *"mapping values are not allowed here"*. Quote the description, or avoid the colon. A skill that fails to parse sits there doing nothing and tells you nothing. |
| **The skill folder is the archive root** | Files loose in the zip root, or an extra wrapping folder, both fail. |
| **Every `references/*.md` you cite must exist** | A pointer into another skill's folder is a dangling reference from this one's point of view. |

```bash
cd <where the folder lives>
zip -rq <name>.zip <name> -x "*.DS_Store"
```

**Validate before sending:**

```bash
python3 - <<'PY'
import io, re, os, sys
d = "<name>"
s = io.open(os.path.join(d, "SKILL.md"), encoding="utf-8").read()
fm = re.match(r"^---\n(.*?)\n---\n", s, re.S).group(1)
name = re.search(r"^name:\s*(.+)$", fm, re.M).group(1).strip()
desc = re.search(r"^description:\s*(.+)$", fm, re.M).group(1).strip().strip('"')
print("name", name, "== folder", d, "->", name == d)
print("desc", len(desc), "/200 ->", "OK" if len(desc) <= 200 else "TOO LONG")
for r in sorted(set(re.findall(r"references/[a-z_]+\.md", s))):
    print(("OK  " if os.path.isfile(os.path.join(d, r)) else "MISSING"), r)
PY
```

---

## 4. Growing one that already exists

- **Add to it when it fails you**, not when you think of something. The trigger for editing a
  skill is a job where it should have helped and did not.
- **Update the description whenever the scope moves.** A skill that stopped firing usually
  had its content grow past its description.
- **Prune what never fires.** If a section has never once changed what you did, cut it.
- **When one skill starts covering two territories, split it.** The tell is that its
  description needs an "and" that has nothing to do with the first half.

⚠ **Re-upload after editing.** On Desktop the skill is the uploaded copy, not the file on
your machine. An edit you did not re-upload is an edit that does not exist — and everything
will behave exactly as though you never made it.

---

## 5. Where a skill's memory lives

Skills are static once uploaded. Anything that changes — current state, open items, the
scars list — belongs in `session-memory`, not baked into the skill. The rule that keeps the
two straight:

> **The skill holds what is always true. The store holds what is true right now.**

A carrier's name is skill material. Which facilities are still outstanding this month is
store material. Putting the second kind in a skill is how a skill starts confidently telling
you last month's truth.
