# The deliverables — what each kind of work needs before it ships

**Why this file exists.** The checks in SKILL.md are universal: they apply whether you are
writing a booklet, reconciling an invoice or shipping a script. But "done" is not universal.
A spreadsheet is done when its totals tie and its edge rows behave; a document is done when
every fact in it is traceable and nothing else still describes the old version. Holding both
in one list makes the list either too vague to catch anything or too long to read.

So the universal checks stay in SKILL.md, and this file answers a narrower question for each
artifact type: **what must be true before this specific thing leaves your hands.**

> **This idea came from a variant, not from the base.** a domain fork's benefits fork carried a
> `deliverables.md` naming what "done" means for each artifact she actually ships — booklets,
> the Hub, the monthly invoice audit, rate tables. The base had no equivalent, and its checks
> were correspondingly abstract. A variant improving on its parent is the system working;
> leaving the improvement in the variant is the system leaking. **Every variant should carry
> one of these, rewritten in its own artifact types.**

---

## How to use it

Find the row that matches what you are handing over. Run the universal checks from SKILL.md
first, then these. If your artifact is not listed, say so in the seal and name the checks you
ran instead — an unlisted type is a gap in this file, not permission to skip.

---

## Documents — reports, memos, briefs, booklets, anything a person reads

- Every fact traceable to a source you actually opened, not one you remember.
- Names, dates, figures and periods correct **for this instance** — this client, this region,
  this plan year — not carried over from the last one you worked on.
- The contents page promises nothing the document does not deliver.
- Nothing else still describes the superseded version: the summary, the covering email, the
  index, the previous month's copy.
- A reader who was not in the conversation can act on it without asking you a question.

## Spreadsheets and workbooks

- **Totals tie, and you say to what** — row counts on both sides, exceptions counted, and the
  exceptions named. "The reports match" is not evidence.
- **Edge rows behave**: the first, the last, an empty one, a duplicate, a zero, a negative, a
  future date. State what each did.
- Formulas survive a re-sort and a row insert.
- Every filter is real — a filter that matched nothing is the most common way a clean result
  is manufactured. Confirm the value is spelled the way that system spells it.
- Hidden rows, hidden sheets and filtered views are declared, not left for the reader to find.

## Scripts, engines and anything that will run again

- **Ran on real input**, not only on the example. Say which input and how many rows.
- **Fails loudly** — an error must not be indistinguishable from a clean run. A `try/except`
  that swallows is the defect, not the safety net.
- **Rerunnable**: running it twice does not double-apply, and the second run is a no-op or an
  honest update.
- **Paths and credentials** are not hard-coded to your machine.
- **Recorded**: what it did is written somewhere a person can read afterwards.
- The next person can run it from your description alone.

## Audits and reconciliations

- The population is stated: what was in scope, what was excluded, and why.
- Nothing came back untested and unremarked — an item that could not be checked is named,
  never silently dropped from the denominator.
- Exceptions are listed individually, not only counted.
- The comparison is against the source of record, not against a copy of it.

## Communications — email, announcements, calendar entries

- Audience is the one you meant, and the list was checked, not assumed.
- Dates and deadlines agree with every other place they appear.
- It says what the reader must DO, and by when.
- It survives being forwarded without you attached to explain it.
- Anything already sent that this supersedes is named, with how it will be corrected.

## Research and analysis

- Sources read, not just cited. A citation you did not open is a claim, not evidence.
- Contradictory findings are reported as contradictions, not averaged into a conclusion.
- The question actually asked is the one answered.
- What you could not establish is named as unknown — never rendered as a default that reads
  like a measurement.

---

## Adding a type

If you hand over something not listed here, add it: three to six lines, each one a thing that
must be TRUE, phrased so it can fail. A line that cannot fail is decoration.
