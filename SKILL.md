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

**Project language rule:** Do **not** rename or rebrand someone else’s repo. Keep their existing words for versions, tests, logs, tickets, and tools. Map Konyo ideas onto *their* terms (e.g. their CHANGELOG, their issue tracker, their CI job names). Never force foreign jargon into commits, UI copy, file names, or docs unless the human asked for that.

---

## The Laws

1. **Make a list first.** Visible task board — one task per round, typically 5–9 rounds per arc. Check tasks off as they land. The human watches the board, not status spam.

2. **Army — ONE OWNER PER FILE.** Parallel workers for independent rounds. Each worker owns EXACTLY the file(s) in its brief: no other files, no commit, no push, no restart of shared services. Two workers never own the same file at the same time. Ownership ends when the arc seals.

3. **The lead gates every merge.** Workers report; the lead re-verifies (compile, tests, lint/parse, live smoke when possible) BEFORE accepting the work. Trust but verify — “done” is a claim, not a fact.

4. **Version per round.** Every round that ships gets a version stamp and its own commit with a story: what broke, why, the fix. If version lives in multiple files, bump them together (parity check that fails on drift).

5. **Third-eye pingpong (same AI).** Between build rounds, run an **independent** review:
   - Default: a **fresh helper** on **this same AI** — brief: "MAX N findings, ranked by severity, concrete only, no praise. Read the real work."
   - Optional: another model or a human.
   - Fix real findings now; log deferred ones. Don’t re-litigate fixed issues without a new failure.
   - **Don’t stall waiting for a special model.** This AI is enough.

6. **Seven-round seal (full version).** A full **version** needs **at least ~7** exchanges, e.g.  
   design → implement → back-pass → fix → re-verify → polish → seal.  
   Fewer = **draft**, not a sealed version (unless the human asked for a hotfix/spike). Log rounds when the project has a ship log.

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
- Post-ship breakages → the project’s usual regression / bug log format (create one only if none exists and the human wants it).

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
