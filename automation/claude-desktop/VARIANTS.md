# Making a job-tailored variant

One workflow, many jobs. A developer, an accountant, a lawyer and a copywriter all
need the same *discipline* and completely different *checks*. This is how to make a
version that fits someone's actual work without watering it down.

**Repo:** `github.com/KonyoDigital/konyo-workflow` →
`automation/claude-desktop/` (base) and `automation/claude-desktop/variants/`.

---

## The rule that makes this safe: SPINE vs SKIN

### 🔒 The SPINE — never change this, in any variant

If a variant weakens any of these, it is not a Konyo Workflow any more. It is the
same tool with the safety removed, which is worse than not using one, because the
person still believes it was checked.

1. **One verdict, three words** — SHIP / DRAFT / BLOCKED, and it fails closed.
2. **Missing evidence is not a pass.** `N/A` requires a stated reason. "It looks
   fine" is a FAIL wearing a friendly face.
3. **The adversarial back-pass** — a deliberate attempt to break the work, read as
   if someone else made it.
4. **Analysis, not agreement** — and equally, no manufacturing problems to look
   useful.
5. **Name what you could NOT check**, at the end, every time. That list is the
   honest boundary of the tool's confidence.
6. **The same-model warning** — this is Claude reviewing Claude, blind spots are
   correlated, get independent eyes when it matters.
7. **Proportionality** — ceremony matched to stakes, or people stop using it.
8. **Quick never means agreeable.** Speed reduces how much you examine, never how
   honestly you report.

### 🎨 The SKIN — change all of this per job

| Slot | What goes in it |
|---|---|
| **Job name** | "financial reporting", "front-end development", "contract review" |
| **What "done" means** | filed / merged / signed / published / sent to the client |
| **The checks table** | 5-10 checks a competent professional in that job would run |
| **Failure modes** | the specific ways *this* job's work goes wrong |
| **Vocabulary** | their words — reconcile, deploy, engross, brief, ship |
| **Output language** | if they work in Hebrew, French, etc., say so explicitly |
| **Worked example** | one realistic mistake from that job, and how the workflow catches it |

---

## The recipe

1. Copy `konyo-workflow/SKILL.md` to `variants/konyo-workflow-<job>/SKILL.md`.
2. Change `name:` to `konyo-workflow-<job>`. **The folder name must match `name:`.**
3. Rewrite `description:` for the job — **≤200 characters**, and it decides whether
   the skill triggers, so put the job's real words in it.
4. Replace the **"Applies to code and technical work"** table with that job's
   checks. Leave the universal table alone.
5. Add a **failure modes** section — the two or three ways work in that job most
   often goes wrong. This is what makes it feel written *for* them.
6. If they work in another language, add: *"Write all output in <language>. The
   verdict words SHIP / DRAFT / BLOCKED stay in English so they are unambiguous."*
7. Leave every SPINE item byte-for-byte.

### Package it

```bash
cd variants
zip -rq konyo-workflow-<job>.zip konyo-workflow-<job> -x "*.DS_Store"
```

The skill folder must be the **root of the archive** — files loose in the zip root,
or an extra wrapping folder, both fail.

### Validate before sending

```bash
python3 -c "
import io,re,sys
s=io.open('konyo-workflow-<job>/SKILL.md',encoding='utf-8').read()
fm=re.match(r'^---\n(.*?)\n---\n',s,re.S).group(1)
n=re.search(r'^name:\s*(.+)$',fm,re.M).group(1).strip()
d=re.search(r'^description:\s*(.+)$',fm,re.M).group(1).strip()
print('name',len(n),'/64','OK' if len(n)<=64 else 'TOO LONG')
print('desc',len(d),'/200','OK' if len(d)<=200 else 'TOO LONG')
"
```

*(A description over 200 chars is rejected on upload. This has already caught one.)*

### Install

Claude Desktop → **Settings → Capabilities → enable "Code execution and file
creation"** → **Customize → Skills** → **Add → Upload a skill** → pick the zip.

---

## Writing a good checks table

The test of a check is: **could a competent professional answer it with evidence,
and would getting it wrong actually matter?**

Bad: "Is it high quality?" — unanswerable, so it always passes.
Good: "Does every figure trace to a source document?" — answerable, and its failure
is concrete.

Aim for 5-10. Twenty checks get skimmed, which is the same as none.

## One warning

A variant should be reviewed by **someone who actually does that job** before it is
relied on. These are written from general practice, not from professional
qualification in that field. The workflow's own rule applies to the workflow itself:
say what you could not verify.
