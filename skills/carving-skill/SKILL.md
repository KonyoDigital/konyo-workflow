---
name: carving-skill
description: Graduate a cluster of scars into a skill of its own. Use when a SCARS.md has three or more learned scars in the same territory, when SCARS.md has grown long enough that nobody reads it to the end, or when asked to carve/extract/graduate scars into a skill. Detects the cluster, names the territory, writes the new skill with every scar's evidence intact, prunes the source, and proves the result actually loads.
---

# Carving — how a scar graduates into a skill

A `SCARS.md` is a queue, not a library. Every entry is a mistake that cost something,
converted into a rule. The file works because it is read at Step 0 of every run — and it
only stays read if it stays **short**.

> **When three land in the same territory, carve them into their own skill and delete
> them from here. This file should stay short because things graduate out of it, not
> because nothing goes wrong.**

That rule used to live as two sentences inside `SCARS.md` itself — which is the one place
a rule about graduation should not live, because it is the file that gets skimmed once it
grows. This skill is that rule, extracted.

**Read a successful carve before writing your first one.** In a mature project the carved
skills sit in `.claude/skills/`; the best reference is whichever one holds a subsystem's
standing rules rather than a list of past bugs. If you have none yet, §7 describes what
"done" looks like.

---

## 1. When to carve — and when NOT to

**Carve when all three hold:**

1. **Three or more learned scars share a territory.** Three is the floor because two is a
   coincidence. Two scars that look related are usually one scar written twice.
2. **The territory has a name a person would recognise** — "the console's visual
   language", "how this repo's fixtures must be isolated", "browser automation on this
   machine". If you cannot name it in a noun phrase, you have a pile, not a territory.
3. **There is standing guidance to give**, not just failures to avoid. A skill says *how
   to do the thing*; a scar says *what went wrong once*. If the carve would be nothing but
   a list of don'ts, leave it in SCARS.

**Do NOT carve:**

- **Founding rules. Ever.** They are hand-written constitution, deliberately at the top,
  explicitly outranking anything learned. Carving one would demote it — a skill loads
  *sometimes*, a founding rule is read *every time*. Moving it down the authority ladder
  is a silent downgrade of the thing that was most deliberately chosen.
- **Fewer than three scars.** Wait. The file is allowed to have loose entries.
- **By FILE rather than by FAILURE MODE.** "Three scars that touched `page.py`" is not a
  territory — `page.py` is thousands of lines and holds unrelated failures. "Three scars
  about CSS specificity" is a territory. Sort by *what went wrong*, never by *where*.
- **A scar whose guard is a live test.** If `guard: tests/test_x.py` holds it, the scar is
  already enforced by something that runs. Carving it into prose *weakens* it. Reference
  the guard from the new skill instead, and leave the scar where the tooling can audit it.

---

## 2. The territory test

Two scars are in the same territory when **the same rule would have prevented both**.

Apply it literally. Write the candidate rule as one sentence, then check each scar: would
this exact sentence, read beforehand, have stopped it? If you need to widen the sentence
to cover the third scar, it is probably not the same territory — and a rule widened until
it covers everything advises nothing.

Sort by failure mode, not by symptom or location:

| Not a territory | A territory |
|---|---|
| "three bugs in `page.py`" | "CSS specificity: the last declaration wins, so editing the first match is inert" |
| "three flaky tests" | "a gate that has never been seen RED is measuring nothing" |
| "three browser problems" | "driving a browser on this machine: which debug port is already taken, and modal dialogs freeze the driver" |

---

## 3. The procedure

**Step 0 — snapshot before you delete anything.** Carving removes entries from a file
whose whole value is that it is append-only in spirit. If the project has scar tooling
with a snapshot/rollback path, use it. Otherwise copy the file first. A wrong rule is
worse than no rule, because you will follow it.

**Step 1 — read the whole SCARS file and cluster.** Every learned scar, by failure mode.
Print the clusters and their sizes before deciding. Clusters of one and two are a normal,
healthy result — say so rather than forcing a carve.

**Step 2 — name the territory** in a noun phrase a person would recognise six months from
now. This becomes the skill name.

**Step 3 — write the skill.** Non-negotiable contents:

- **Every carved scar's EVIDENCE travels with its rule.** This is the heart of the whole
  method: *a rule you cannot trace is a rule you will eventually follow for a reason that
  was never true.* Strip the evidence and you have opinions.
- **Every `guard:` is named**, with its path. A guard that stops being referenced stops
  being maintained.
- **Standing guidance, not just prohibitions** — how to do the thing right, with the
  failures as the reason.
- **State honestly where the skill is uncertain or thin.** A carved skill inherits the
  authority of three real failures; it must not spend that credibility on padding.

**Step 4 — write a `description` that makes it LOAD.** This is where carving most often
fails, and the failure is invisible: the rules move out of the file everyone reads into a
file nobody opens. The description must name the *trigger conditions* — the tasks, file
paths and words that should pull it in — not just the subject matter. Compare:

- ✗ `description: The console's visual language.`
- ✓ `description: The console's visual language — its real tokens, type scale … **Use
  when changing anything visible under the console's source directory.**`

**Step 5 — prune the source.** Delete the carved scars from `SCARS.md` and leave one line
pointing at the new skill. The file must get *shorter*; if it did not, nothing graduated.

**Step 6 — prove it loads.** Carving is not done when the file is written. Verify the skill
is discoverable — it appears in the skills listing, and its description matches how the
work actually gets described. If the project has a skills index or a memory pointer file,
add the line. **An unloaded skill is strictly worse than the scars it replaced**, because
the scars at least got read at Step 0.

---

## 4. The failure this skill exists to prevent

**From a real run.** A session surveyed a reference site, extracted its design tokens off
the live DOM, wrote them into a project spec as the contract, and launched fourteen agents
to build against it. Only then did an existing **carved** skill surface — one holding the
project's real tokens and, worse, a rule that directly inverted the brief: *at high
density, generic card containers are banned*. Four agents had already been told to build a
grid of boxed metric cards. It was caught only because someone asked about the carving
mechanism by name.

Two lessons, and they pull in opposite directions — hold both:

1. **A carved skill carries three failures' worth of authority.** It outranks anything you
   derive yourself from one afternoon of research. Read the project's `.claude/skills/`
   *before* writing a brief, not after.
2. **Carving moved those rules somewhere they could be missed.** In `SCARS.md` they were
   read at Step 0 unconditionally. That is the tax carving charges, and Step 4 is how you
   pay it. If you cannot write a description that reliably triggers, **do not carve** —
   the rules are safer where they are.

---

## 5. Retiring one — the half this file never had

Carving moves rules OUT of `SCARS.md`. Nothing here ever moved them out of a SKILL, so the
set only grows. A library that only grows stops being read, which is the same end state as
never carving at all.

**Retire when any of these holds:**

- **It has not LOADED in months.** Not "you forgot about it" — check whether it actually
  fired. A skill that never triggers is a scar you deleted.
- **Its territory moved.** The subsystem was rewritten, the constant was retuned, the guard
  was replaced. A skill describing last quarter's tree answers confidently and wrongly, and
  it outranks your own reading of the current code because it looks authoritative.
- **A live guard now enforces it.** Same rule as §1's do-NOT list, one step later: once
  `tests/test_x.py` holds the invariant, the prose copy is a second statement of one rule
  with only one of them checked. Point at the guard; delete the prose.

**How, in order — step 2 is the one that gets skipped:**

1. **Grep for what still points at it** — other skills' `[[links]]`, memory index files,
   project instruction files. A pointer to a skill that no longer exists is worse than no
   pointer.
2. **Move anything still true to somewhere that IS read.** Usually back into `SCARS.md`, or
   into the skill that absorbed it. Retiring is only safe because of this step.
3. **Delete the directory, and remove the index line.**
4. **Record what went and why, with the date**, in the same place the carve was recorded. A
   skill that vanished silently gets re-derived from scratch by the next session.

⚠ **Rarely-used is not the same as dead.** A skill that fires twice a year and is right both
times is doing its job. The test is whether it is still TRUE, never how often it is read.
⚠ **Founding rules are never retired, for the same reason they are never carved.**

## 6. Prove it — the check that catches a silent skill

Writing the file is not the end (§3, Step 6). This is that step, runnable:

```bash
python3 - <<'EOF'
import io, os, re, glob
bad = 0
for p in glob.glob(os.path.expanduser("~/.claude/skills/*/SKILL.md")) + glob.glob(".claude/skills/*/SKILL.md"):
    d = os.path.basename(os.path.dirname(p))
    s = io.open(p, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n", s, re.S)
    if not m:
        print("✗ %-28s no frontmatter" % d); bad += 1; continue
    fm = m.group(1)
    try:
        import yaml; y = yaml.safe_load(fm)
    except Exception as e:
        print("✗ %-28s YAML REFUSES IT: %s" % (d, str(e).split("\n")[0][:60])); bad += 1; continue
    name, desc = y.get("name"), y.get("description") or ""
    if name != d: print("✗ %-28s name=%r != folder" % (d, name)); bad += 1
    if not desc: print("✗ %-28s empty description — it will never load" % d); bad += 1
    for ref in sorted(set(re.findall(r"references/[a-z_]+\.md", s))):
        if not os.path.isfile(os.path.join(os.path.dirname(p), ref)):
            print("✗ %-28s dangling %s" % (d, ref)); bad += 1
print("all skills parse and resolve" if not bad else "%d problem(s)" % bad)
EOF
```

⚠ **The failure this catches is SILENT.** A description containing a colon-space is a plain
YAML scalar with a second key in it; the loader answers *"mapping values are not allowed
here"* and the skill simply never loads. Nothing warns you — it looks exactly like a skill
that had nothing to say. This was caught in the wild in a skill written minutes earlier.

## 7. What a carve looks like when it is done

- `SCARS.md` is shorter, and the carved entries are gone — not commented out.
- One pointer line remains where they were.
- A new skill exists whose every rule carries the evidence that produced it.
- Every `guard:` path from the carved scars is still named somewhere that is read.
- The skill's description names its trigger conditions, and you have seen it load.
- Founding rules are untouched. If you moved one, undo it.
