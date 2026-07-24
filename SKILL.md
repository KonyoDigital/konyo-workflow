---
name: konyo-workflow
description: >
  The Konyo Workflow — ultimate shipper for any AI/LLM: plan, build in sealed rounds,
  prove each round, third-eye back-pass with the same AI, ~7-round seal for a full
  version, fail-closed ship/draft/blocked, ONE final ping. Use for multi-round arcs,
  night runs, polish sweeps.
---

# THE KONYO WORKFLOW

**Ultimate shipper** for large arcs — with **the AI/LLM in this session**. Named and blessed by its inventor, Konyo.

How it ships: plan → build round by round → **gate** (tests/checks/evidence) → **third-eye** back-pass → fix → seal a version → **ONE final ping**.  
Fail closed (**ship** / **draft** / **blocked**). A full version needs real iteration (~7 exchanges), not one lucky pass.

**Engine rule:** review and helpers use **this AI** by default. A second model is a *bonus*, never a requirement.

This is not a brand. It is **how an AI ships serious work**.

**Project language rule:** Do **not** rename or rebrand someone else’s repo. Keep their existing words for versions, tests, logs, tickets, and tools. Map Konyo ideas onto *their* terms. Never force foreign jargon into commits, UI copy, or renames unless the human asked.

**We did not strip the perfected system — only forced foreign filenames.**  
Outcomes below are **required**. Medium is **adaptive**.

---

## Required durable system (the bar that must stay)

These three tracks are **mandatory for a sealed ship**. They are *what* must exist, not *which brand of file*.

### 1) Versions go up (required — smart, committed)
- Every **sealed** round / version **bumps** the project’s version identity and **commits** it.
- Use whatever they already use: `package.json`, `VERSION`, `pyproject.toml`, git tags, app build number, multi-file stamps — **all kept in parity** if several exist.
- If they have **no** version system: add the **smallest** clear one (e.g. `VERSION` file or package field + tag) and use it going forward. Do **not** invent five different version schemes.
- Commits for seals should tell the story (what / why / fix), not empty “wip”.

### 2) Ship trail (required — what moved forward)
- Each sealed ship leaves a **durable record**: what version, what changed, how to verify.
- Prefer existing: CHANGELOG, release notes, Releases, existing ship log, good conventional commits + tags.
- If **nothing** exists: create a single simple **`CHANGELOG.md`** (or `SHIP_LOG.md` if they prefer that name) and append one entry per seal. That’s enough. Not Obsidian-only, not a second brain required.

### 3) Bug / regression log (required when things break — additive)
- Real breakages and post-ship bugs get logged **durably** so the next arc doesn’t forget: symptom → cause → fix → verify (or open ticket with those fields).
- Prefer existing: GitHub/GitLab Issues, Linear, Jira, existing `BUGS.md`, their tracker.
- If **nothing** exists and a bug is found: create a simple **`BUGS.md`** (or open issues if they already use a host) and append. Optional ID style (`BUG-001`) is fine; **don’t** force a foreign ID scheme if they have one.
- **Not required:** Obsidian vault, external memory product, or spinning up GitHub if the repo isn’t on GitHub — use what they have; only bootstrap a minimal in-repo log when the world is empty.

| Track | Required? | If project already has it | If project has nothing |
|-------|-----------|---------------------------|-------------------------|
| Version bumps on seal | **Yes** | Bump *their* scheme + commit | Add minimal VERSION / package version |
| Ship trail | **Yes** | Append to *their* changelog/log | Add `CHANGELOG.md` (or one ship log) |
| Bug log | **Yes when bugs** | Use *their* tracker/file | Add `BUGS.md` or host issues |
| Obsidian / special memory app | No | — | Don’t invent |
| Forced “RINSE / REG-NNN / PINGPONG_*” names | No | Only if already theirs | Never force |

**Like yours in spirit** (versions climb, ships leave a trail, bugs are remembered).  
**Not a clone of your filenames** unless this is your house repo that already uses them.

---

## The Laws

1. **Make a list first.** Visible task board — one task per round, typically 5–9 rounds per arc. Check tasks off as they land. The human watches the board, not status spam.

2. **Army — ONE OWNER PER FILE.** Parallel workers for independent rounds. Each worker owns EXACTLY the file(s) in its brief: no other files, no commit, no push, no restart of shared services. Two workers never own the same file at the same time. Ownership ends when the arc seals.

3. **The lead gates every merge.** Workers report; the lead re-verifies (compile, tests, lint/parse, live smoke when possible) BEFORE accepting the work. Trust but verify — “done” is a claim, not a fact.

4. **Version per round (required).** Every sealed round **bumps version** and **commits** with a story message: what broke, why, the fix. Keep multi-file version stamps in parity. See “Required durable system” above.

5. **Third-eye pingpong (same AI).** Between build rounds, run an **independent** review:
   - Default: a **fresh helper** on **this same AI** — brief: "MAX N findings, ranked by severity, concrete only, no praise. Read the real work."
   - Optional: another model or a human.
   - Fix real findings now; log deferred ones. Don’t re-litigate fixed issues without a new failure.
   - **Don’t stall waiting for a special model.** This AI is enough.

6. **Seven-round seal (full version).** A full **version** needs **at least ~7** exchanges, e.g.  
   design → implement → back-pass → fix → re-verify → polish → seal.  
   Fewer = **draft**, not a sealed version (unless the human asked for a hotfix/spike).  
   On seal: version bump + ship-trail entry (required).

7. **Autonomous chain → ONE final ping.** Once the arc starts, run reversible steps without asking. Brief status is fine; the deliverable is **ONE final ping**: table of rounds, what shipped, how to verify each claim.

8. **Ping-pong dossiers.** When two AIs (or AI + human) hand off work, each leg appends: symptom → root cause → fix → verify. Next leg re-runs the previous verify commands first. Commit before handoff.

9. **Honesty.** Never claim green before the real check (CI, suite, live probe). Failures reported as failures, with output. If something was sampled or skipped — say so. Status UI must show *proven* state, not vibes.

10. **Live-session sanctity.** Never restart shared services or deploy-cycle while the human is in a live / critical session unless they explicitly order it.

11. **Portable quality (any project).** Apply when relevant; if not, **N/A + evidence** (don’t fake UI checks on a library with no UI):
    - Tests for *this* change  
    - Security sanity  
    - Patch discipline (no half-applies)  
    - Syntax/lint on touched files  
    - UX / interaction / visual when there is a UI  
    - Version + ledger/changelog **using the project’s existing names**  
    - Deploy preflight when deploying  
    - Automated checks so gates are hard to skip  

12. **Speak the project’s language.** Commits, PRs, tickets, variable names, docs, and user-facing strings stay in **this repo’s voice**. The workflow is the *bar*; the project owns the *lingo*.

---

## The Arc Shape

```
SCOUT   → read the work, find root causes, write them down
BOARD   → list the rounds
ARMY    → parallel owners (law 2)
GATE    → verify + accept each round (laws 3, 4)
3RD EYE → same-AI independent review (laws 5–6)
SEAL    → stamps, full checks, dossier, ONE final ping (laws 4, 6, 7)
```

---

## Round discipline

- A round = one coherent deliverable.
- Pre-verify: parses/builds + project tests green + a real probe when feasible.
- On seal: **version up + commit** + **ship-trail line**.
- Post-ship / real bugs: append to **bug log** (existing tracker or minimal `BUGS.md`) — always move forward, never “fixed it in chat only.”

---

## When to use

Multi-step “build / fix / polish properly” arcs. Not for one-line errands.

---

## What this is NOT

- Not a specific AI product or vendor  
- Not a requirement for two different AIs  
- Not auto-deploy during live critical use  
- Not a license to rename their codebase or invent new house jargon  
- Not project glue — bring your own tests and version scheme  

---

## Invoke

- “Use the Konyo Workflow.”  
- “Ship it Konyo Workflow style.”  
- Skill name: `konyo-workflow`
