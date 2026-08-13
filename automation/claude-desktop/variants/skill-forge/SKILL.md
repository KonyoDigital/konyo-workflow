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

Three gates. **All three, or it is not a skill yet.**

1. **It repeats.** You have done it at least three times, or you will do it monthly.
2. **It carries context you re-explain every time** — which systems, which spellings, which
   facilities, what "done" looks like, what usually goes wrong.
3. **A written version would have changed the outcome**, not just saved typing.

Two of three means: put it in `session-memory` as a note instead. A library of skills that
nobody triggers is worse than a short one that always fires — every unused skill makes the
useful ones harder to find.

### The other doorway: three scars in one territory

If the same *shape* of mistake has happened three times, that shape is a territory and it has
earned a skill. Sort by **failure shape, not by subject**:

| Not a territory | A territory |
|---|---|
| "three things went wrong in the invoice audit" | "a facility spelled differently in two systems, so a filter silently matched nothing" |
| "three booklet errors" | "a figure correct for last plan year, carried into this one" |

Two scars that look related are usually one scar written twice. Wait for the third.

---

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
