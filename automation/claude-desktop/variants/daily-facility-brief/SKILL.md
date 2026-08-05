---
name: daily-facility-brief
description: Turn a day of email into a prioritised action list grouped by facility. Sorts into HIGH/MEDIUM/LOW, separates what needs you from FYI, and never guesses a facility or a deadline. Run at 14:30 ET.
---

# Daily Facility Brief — 14:30 ET

Turn today's inbox into **one page he can act from**: what must be done, for which
facility, by when, and what he can safely ignore.

Multi-site operators lose things in two ways — an urgent item buried under sixty
routine ones, and an item that *looks* routine because it landed without the word
"urgent" in it. This exists to make both harder.

---

## How he gives you the mail

Outlook has no direct connector, so he pastes. In Outlook: select today's messages →
**Ctrl+A** in the reading list is not enough (it copies subjects only) — better,
**forward the day's mail to himself as attachments**, or copy the message list plus
open each flagged one. Whatever arrives, work with it and **say what you were given**
at the top of the report: how many emails, and the time range they cover.

**If something is unreadable or truncated, say so.** Do not summarise an email you
could only half see.

---

## The facility registry

Five organisations, ~70 sites.

**Infinite Care** — Corporate (Upstate) · Sarah Neuman · Del Mar · Golden Hill ·
Ten Broeck · Corporate (Downstate) · Buena Vida · Red Bank · Hudson Hills ·
Yonkers Center · Forest Hill · Clove Lake

**Solaris ICC** — Regional Admin · Lely Palms · East Orlando · Apopka · Celebration ·
College Park · Waterman · Forest Lake · Zephyr Hills · Osceola · Lake Zephyr

**Summit** — Corporate · Century · Lakeside · Madison · North Bank · Sandy Ridge ·
Santa Rosa · Blountstown · Seven Hills · Northbrook · TimberRidge · Diamond Ridge ·
Lake Bennet · Ocala · Ocala ALF · Ocala IL · Valencia Hills · Palatka ·
Springs at Lake Point · Sarasota (Hawthorne) · Ybor · Lakeland (Hawthorne) ·
Scott Lake · Palmer Ranch · Surrey Place · Tampa Lakes · Boca Ciega · Brandon ·
Brandon ALF · Brandon IL · Brighton · Trinity

**Solaris Legacy** — BP Bayonet Point · CH Charlotte Harbor · CC Coconut Creek ·
DB Daytona Beach · IM Imperial · LC Lake City · MI Merritt Island · NN North Naples ·
PW Parkway · PE Pensacola · PC Plant City · WI Windermere

**Sabal** — Corporate · Pinecrest · Tamarac · Boca Pointe

---

## Routing rules — these exist because the names collide

**1. LONGEST MATCH WINS.** Always. Check the longest facility name first.

> "Ocala" appears inside "Ocala ALF" and "Ocala IL". "Brandon" appears inside
> "Brandon ALF" and "Brandon IL". A naive search for the short name **steals the
> longer site's mail**, and the mistake is invisible — the email lands somewhere
> plausible. If an email says "Ocala ALF", it is Ocala ALF, never Ocala.

**2. Two-letter codes only count as STANDALONE, UPPERCASE tokens.**

> `BP CH CC DB IM LC MI NN PW PE PC WI` are real facility codes and also fragments of
> ordinary words. In one normal sentence — *"Please review the important claim and
> confirm PC compliance in Michigan"* — **CH, IM, MI and PC all falsely match.**
> So: only match a code when it stands alone as its own uppercase word (`PC` yes,
> `Michigan` no, `pc` no). **Prefer the full name** — "Plant City" beats "PC".
> A bare code with no other signal is weak evidence: prefer UNASSIGNED over a guess.

**3. "Corporate" alone never routes anywhere.** It exists in Infinite Care (Upstate
*and* Downstate), Summit (several), and Sabal. It needs an organisation with it. If
an email says only "Corporate", it goes to **UNASSIGNED** unless the sender or thread
makes the organisation unambiguous — and if you use the sender to decide, **say so**.

**4. "Hawthorne" alone is ambiguous** — both Sarasota (Hawthorne) and Lakeland
(Hawthorne) exist. Needs the city.

**5. Watch these confusable pairs** — read carefully, they are different sites:
Forest Hill (Infinite Care) vs Forest Lake · Lake Zephyr vs Zephyr Hills ·
Lakeside vs Lake Bennet vs Scott Lake vs Tampa Lakes vs Lakeland.

**6. "Sarah Neuman" is a FACILITY**, not a person, even though it reads like a name.
If the context is clearly a human being addressed or signing off, say you are unsure
rather than filing it as a site.

**7. NEVER GUESS.** An email you cannot place with confidence goes in **UNASSIGNED**
with the reason. A wrong facility is worse than no facility — it hides the item from
the site that needed it, and it hides it *convincingly*.

**8. One email may touch several facilities.** List it under each, and say so, rather
than picking one.

---

## Priority

Judge by **consequence of delay**, not by how the sender phrased it. Senders mark
their own mail urgent; that is not evidence.

### 🔴 HIGH — today
- State/regulatory: survey, citation, plan of correction, agency request, licensing
- Resident safety, incident, injury, elopement, abuse allegation
- Legal: litigation, subpoena, notice, anything from counsel
- **Any explicit deadline within 48 hours**, or already passed
- Staffing failure that leaves a shift or a building uncovered
- Payroll, and anything blocking someone getting paid
- An escalated family complaint, or anything already escalated once
- Admissions/census holds, and anything stopping revenue today

### 🟡 MEDIUM — this week
- A stated deadline this week
- Routine compliance and documentation with a due date
- Vendors, contracts, purchase approvals
- Budget, AP/AR queries
- Meetings needing preparation
- Follow-ups where **he** is the blocker

### 🟢 LOW — when there is time
- FYI, newsletters, broadcast announcements
- Threads where he is CC'd and someone else clearly owns it
- Scheduling with flexible dates
- Anything already handled by someone else

**Escalation rules:** a repeat of an item from a previous day moves up one level —
it has been waiting. Anything mentioning a regulator, a lawyer, or a resident's
safety is HIGH regardless of how casually it is written.

**Deadlines: only report a date the email actually states.** If none is stated, write
"no date given". Never infer one, never round one, never invent "by Friday" because
it feels right. An invented deadline is worse than no deadline — he will plan around
it.

---

## The report

```
DAILY FACILITY BRIEF — <date>, 14:30 ET
Read <N> emails, <earliest time> to <latest time>.

──────────────────────────────────────────────
🔴 HIGH — needs you today  (<count>)

  1. <FACILITY>  ·  <what he must actually DO, as a verb>
     Why now: <the consequence of it slipping>
     Due:     <stated date, or "no date given">
     From:    <sender> — "<subject>"

──────────────────────────────────────────────
🟡 MEDIUM — this week  (<count>)
     <same shape>

──────────────────────────────────────────────
🟢 LOW / FYI  (<count>)
     <one line each, grouped, no detail needed>

──────────────────────────────────────────────
BY FACILITY
  Ocala ALF ........ 2 items (1 high)
  Brandon .......... 1 item
  <only facilities with something today>

──────────────────────────────────────────────
⚠️  UNASSIGNED — tell me where these belong  (<count>)
     <email> — why it could not be placed

──────────────────────────────────────────────
WAITING ON OTHERS — he is not the blocker
     <item> — waiting on <who> since <when>

──────────────────────────────────────────────
NOT CHECKED
     <anything unreadable, truncated, or outside the paste>
```

**Every email lands somewhere.** If the counts do not add up to the number received,
say so — a silently dropped email is the one failure this tool cannot have.

Write actions as **verbs he can do**: "Approve the Ocala ALF agency invoice", not
"Ocala ALF invoice update". He should be able to work the list without reopening the
mail.

---

## Rules

- **Never invent** a deadline, a name, a facility, or an amount. If it is not in the
  email, it does not appear in the brief.
- **Quote the source** (sender + subject) on every actionable item so he can find it
  in two seconds.
- **Separate "needs you" from "FYI".** This is the whole productivity win — most of a
  day's mail needs nothing from him, and the value is in saying so with confidence.
- If a thread has many replies, report **the current state**, not each message.
- **Say what you could not check.** Same rule as everything else: the honest boundary
  is part of the output.

---

## ⚠️ Before this is used on real mail — a compliance question, asked once

These are skilled nursing, assisted living and independent living facilities. Their
email will contain **resident names, conditions, incidents and other PHI**, which in
the US is regulated under HIPAA.

Pasting that into an AI assistant means it leaves their environment. Before this runs
on real mail, someone should confirm with their compliance officer or IT that it is
permitted, and whether it requires a Business Associate Agreement or an
enterprise-tier account.

**This is not a reason to abandon the tool** — it is a five-minute conversation that
is far easier to have now than after a year of daily use. If the answer is no, the
brief still works on de-identified summaries: he can strip resident names and it will
sort every operational item just as well.
