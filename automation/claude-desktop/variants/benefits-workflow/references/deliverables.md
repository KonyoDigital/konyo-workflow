# The recurring deliverables — what each one needs before it ships

Read the block for whatever is being finished, at Step 3 and again at Step 6. The spine says
how to prove a round; this says what specifically has to be true for *this kind of work*, and
what has actually gone wrong on it before.

**No values are recorded here** — no carrier names, rates, dates or vendors. Those go stale
and become the contradicting document the spine tells you to hunt down. This file records
*what must be true*, *where the truth lives*, and *the trap that has already caught it once*.

Contents: [Benefits booklets](#benefits-booklets) · [Benefits Hub](#benefits-hub) ·
[Eligibility audit output](#eligibility-audit-output) ·
[Monthly invoice audit output](#monthly-invoice-audit-output) ·
[Rate tables and renewal work](#rate-tables-and-renewal-work) ·
[Contacts and plans workbook](#contacts-and-plans-workbook) ·
[Communications calendar](#communications-calendar) ·
[Open enrollment communications](#open-enrollment-communications) ·
[HR regional meeting materials](#hr-regional-meeting-materials) ·
[Reusable engines and skills](#reusable-engines-and-skills)

---

## Benefits booklets

Brand-level booklets (Summit, Sabal, Solaris, Frontline, Step Up, Infinite Care NY/NJ) plus
facility variants, built config-driven from HTML through WeasyPrint, with surgical PyMuPDF
edits on the rendered PDF.

**Where the truth lives:** the ICC Benefits Matrix for the current plan year, the PANDA
renewal workbook, and the facility guidebook packet. Not a prior booklet.

**Must be true before it ships:**
- Every plan fact cross-checked against the Matrix for **that facility**, across the whole
  facility set — not spot-checked. The last full pass covered all 58 with zero mismatches;
  that is the bar, and the count belongs in the seal.
- The plan year and OE window read correctly **on every page that states them**, not just the
  cover.
- Region-restricted content is present only where it applies — NY/NJ vs Florida differ on
  carrier and administrator, pharmacy, telehealth and pay cycle.
- Text extracted from the **rendered PDF**, not the config or the HTML.
- Correct brand: logo artwork, palette, facility name as the DBA spells it.

**Traps that have already caught this:**
- A carrier change mid-cycle leaves the prior name in any variant rebuilt from an older
  config. When one carrier changes, sweep every brand and every facility variant.
- A plan misdescribed by tier or type (basic vs. an account-based plan) reads plausibly and
  is wrong; check the plan *type*, not just the name.
- A vendor swapped for a different one across the suite — the replaced one survives in
  whichever variant nobody rebuilt.
- A wage-access / early-pay provider that differs between the guidebook and other sources.
  Reconcile before publishing; do not pick the one that looks right.
- A PyMuPDF edit reporting success on the wrong page. Re-open and look.

**Verdict trap:** a booklet is not SHIP because it rendered. It is SHIP when its facts were
read back out of the rendered file and matched the Matrix.

---

## Benefits Hub

The employee-facing HTML hub — region filter (All / NY–NJ / Florida), carrier portal grid,
open enrollment section.

**Must be true before it ships:**
- **Every filter option returns records**, and every tile and link resolves. A tile nobody
  can click, or a filter with nothing behind it, is worse than a missing one — nobody looks
  again.
- The filter is verified by **clicking it**, not by reading the JavaScript.
- The plan year and OE dates match the booklets and the calendar exactly. Two employee-facing
  documents disagreeing is worse than one being wrong.
- Carrier portal entries point at live portals, per region.

**Trap:** the hub is the fastest thing to change and the easiest to forget. Any booklet
change that touches a fact the hub also states makes the hub a stale claim in the same round.

---

## Eligibility audit output

The workbook from `benefits-eligibility-audit`. That skill is the method; this is the verdict
on what it produced.

**Must be true before you believe a clean facility:**
- **The population is complete.** Head-count in each system and the ID set-difference,
  reported. A union employee present in one system and absent from the other was never tested.
- The facility rule came from the PANDA UNION INFORMATION tab and was cross-checked against
  the confirmed matrix — and you know which facilities' rules were *read* vs *kept from the
  reference*.
- The engine did not raise, and no facility came back as NOT TESTED.
- The filter matched: the facility is spelled the way *that* system spells it.
- Violation counts and premium-at-risk stated per facility, with the exceptions named.

**Trap:** zero violations and a failed test look identical on the tab. A clean facility is
only meaningful with the population count next to it.

**Verdict trap:** this workbook is a compliance deliverable. A wrong PASS costs more than a
flagged uncertainty — when PANDA is silent or ambiguous, flag for HR confirmation rather than
inferring.

---

## Monthly invoice audit output

The workbook from `monthly-medical-audit` — APA statement against IPS scheduled deductions,
run monthly across the facilities on the plan.

**Must be true before it ships:**
- **The transcription foots to the printed statement** — current, adjustments, total due, and
  the tier counts. The engine now raises if it doesn't; the tie-out column is the visible proof.
- Tie-Out Diff is zero on **every** Summary row.
- Pay frequency resolved per facility and cross-checked against the pay schedule, with any
  disagreement resolved — not noted and worked around. Weekly vs biweekly is a factor of two
  on every premium at that facility.
- Reconciled rows carry no flag; only actionable rows are flagged. Anything that matched is
  not coloured like a problem.
- The scope limit is stated: this proves the two systems **agree**, never that the rate is
  right. A clean tab must never be read as "rates verified."

- **Coverage is part of the deliverable, not just accuracy.** A month is not complete because
  every uploaded statement reconciled. Check the audited facilities against the roster and say
  plainly which in-scope facilities have no statement — and, where payroll shows employees
  deducting for a facility whose statement never arrived, say that too. In July, `ORLANDO EAST`
  had 51 employees deducting and no invoice; that gap was invisible until the roster was checked.

**Trap:** a facility can be reported complete with no statement behind it. Invented lines foot
perfectly to an invented total, the tier counts match, and Tie-Out reads zero — every check passes.
Name the source file for each facility before configuring it. This happened to four facilities in
July 2026.

**Trap:** a facility whose name match silently failed looks exactly like a clean facility.
Never report clean without rows on each side, the matched count, and the largest single
difference.

**Trap:** a facility entered twice in the run config produces two identical tabs, doubles that
facility's exceptions and inflates every total — and every tie-out still reads zero, because each
copy ties out correctly. The facility count is the only tell. `build()` now raises on it; do not
remove that guard.

---

## Rate tables and renewal work

Reading rates out of the PANDA renewal workbook for a plan year.

**Must be true:**
- Only the intended columns are read — the bi-weekly and weekly employee columns — and you
  say which. A neighbouring column reads as a plausible rate.
- Every block type the workbook contains is covered: all-groups, facility-specific union
  blocks, carrier-specific blocks, income-banded blocks.
- Facility-to-carrier routing confirmed per facility. A facility routing to the carrier its
  region "usually" uses is an assumption, not a fact — some route elsewhere.
- Union blocks read against that facility's own rule, never a blanket one.

**Trap:** a rate that is wrong in the same direction everywhere reconciles perfectly and
still bills wrong. Re-derive one value by hand from the sheet.

---

## Contacts and plans workbook

The multi-sheet contacts and plan-assignment workbook.

**Must be true:** every sheet's formatting consistent with the house format; regional contact
assignments current; no sheet left with a prior period's structure; formulas computing on
real data including blanks and terminations; and the sheet count and names stated so a
missing tab is visible.

**Trap:** it is edited incrementally and nobody re-reads the sheets they didn't touch. When a
person or assignment changes, sweep every sheet that names them.

---

## Communications calendar

The unified NY/NJ + Florida benefits communications calendar for the plan year.

**Must be true:** dates consistent with the plan year and OE window as stated in the hub and
the booklets; nothing scheduled that references a fact a later round changed; regional
differences reflected where the two regions genuinely differ.

**Trap:** it is the document most likely to become a stale claim, because it describes things
that have not happened yet. Anything already scheduled and sent belongs in the seal's "what
this now contradicts" and "has any of it already gone out."

---

## Open enrollment communications

Anything employee-facing in the OE window, including the phased roadmap.

**Must be true:**
- Dates identical to the hub and the booklets. Check all three against each other, not each
  against your memory.
- The phase structure is stated the same way everywhere it appears.
- Written for someone with no HR background, and answerable without you present.
- Correct per region and per brand for whoever receives it.

**Verdict trap:** this is the highest-stakes category in the portfolio — irreversible once
sent, and the audience is thousands of people who will act on it. It is always MULTI, and
the strongest rung available (see `independence.md`). Never SHIP one on SOLO alone without
saying so in the seal.

---

## HR regional meeting materials

Agendas, printable planning documents, activity plans.

**Must be true:** session times internally consistent and consistent with the agenda PDF;
attendee count matched to quantities ordered; supplies and kits sourced and lead times
checked against the date; the printable actually paginating as intended.

**Trap:** quantities. An activity planned for one head-count and supplies ordered for another
is the failure mode here, and it is invisible until the day.

---

## Reusable engines and skills

The audit engines, the booklet generator, and the skills themselves — anything that will run
again next month.

**Must be true:**
- It **raises** on an input it does not recognise rather than passing it through. A silent
  skip becomes a clean result that was never tested.
- It ran on real data and you read the output file, not the log line.
- Edge rows exercised: blanks, duplicates, future-dated rows, terminations, per-diem, a
  category it has never seen.
- Paths resolve absolutely, so it behaves the same from any directory.
- The docs describe what it does **now**, including what it deliberately excludes. A skill
  whose description promises a check it no longer performs is a stale claim in the worst
  place, because it is what gets believed.
- Prior version preserved and the change recorded in session memory.

**Trap:** a guard removed because it seemed redundant. Every guard in these engines is there
because something shipped wrong once; if one looks unnecessary, find out which failure it was
written for before touching it.
