---
name: konyo-workflow
description: >
  The Konyo Workflow — ultimate shipping method for ANY coding LLM (Claude, Grok, etc.):
  agent army with one owner per file, lead gates every merge, third-eye pingpong with the
  SAME stack's agents (or a second model if available — not vendor-locked), ~7-round seal
  for a full version, version per round, autonomous chain with ONE final ping. Invoke for
  multi-round arcs, night runs, polish sweeps. Not Grok-only; not Claude-only.
---

# THE KONYO WORKFLOW

A battle-tested method for shipping large arcs of work with **whatever coding AI is driving this session**. Named and blessed by its inventor, Konyo.

**Engine rule:** pingpong / third-eye / army all use **this product’s agents and this model family** by default. You do **not** need Grok, SuperGrok, or a second vendor. A second model is a *bonus* for independence, never a requirement.

---

## The Laws

1. **Make a list first.** Create a visible task board (TodoWrite / TaskCreate / checklist) — one task per round, typically 5–9 rounds per arc. Check tasks off as they land. The user watches the board, not status spam.

2. **Agent army — ONE OWNER PER FILE.** Spawn parallel subagents for independent rounds. Each agent owns EXACTLY the file(s) named in its brief and may never touch anything else, never commit, never push, never restart shared services. Two agents must never own the same file at the same time. Ownership is PER-ARC: every grant dissolves when the arc seals.

3. **The lead gates every merge.** Agents report; the lead re-verifies (compile, test suite, lint/parse, live smoke where possible) BEFORE committing their work. Trust but verify — an agent's "done" is a claim, not a fact.

4. **Version per round.** Every round that ships gets a version stamp and its own commit with a story message: what broke, why, the fix. If version lives in multiple files, bump them together (parity test that fails on drift).

5. **Third-eye pingpong (host LLM).** Between build rounds, run an **independent** review leg:
   - Default: a **fresh subagent** on **this same product** (Claude↔Claude agents, Grok↔Grok agents, etc.) with a terse brief: "MAX N findings, ranked by severity, concrete only, no praise. Read the real code."
   - Optional upgrade: a **different model/CLI** or a human if available.
   - Gate findings: fix real ones immediately; log deferred ones. Never re-litigate a fixed issue without a new live failure.
   - **Do not block the arc because SuperGrok/Grok is missing.** The host LLM is enough.

6. **Seven-round seal (full version).** A full **version** levels up through **at least ~7 pingpong exchanges** on the host stack, for example:
   design → implement → back-pass (third-eye) → fix → re-verify → polish → seal.  
   Fewer than that = **draft**, not a sealed version (unless the user explicitly asked for a hotfix/spike). Log rounds in a dossier or ship log when the repo has one.

7. **Autonomous chain → ONE final ping.** Once the arc starts, run it end to end without asking permission for reversible steps. Brief status lines are fine; the deliverable is **ONE final ping**: a table of every round, what shipped, and how to verify each claim.

8. **Ping-pong dossiers.** When two AIs (or AI + human) trade a codebase, each leg appends to a dated debug dossier: symptom → root cause → fix → verify. The next leg re-runs the previous verify commands before trusting anything. Commit before handoff.

9. **Honesty rules.** Never claim green before the verdict (CI, suite, or live check). Failed steps are reported as failed, with output. If a lane is capped, sampled, or skipped — say so. UI lamps and status text must report *proven* state, never vibes.

10. **Live-session sanctity.** Never restart shared services or deploy-cycle while the user is ON AIR / in a live critical session unless they explicitly order it.

11. **Portable quality (any project).** Prefer these on every stack when they apply; if they don’t apply, say **N/A with evidence** (e.g. no UI → skip visual RINSE, don’t fake it):
    - TDD / tests for *this* change  
    - Security sanity (secrets, injection, authz)  
    - Patch discipline (no half-applies)  
    - Syntax/lint on touched files  
    - UX / interaction / visual checks when there is a UI  
    - Version + ledger/changelog  
    - Deploy preflight when deploying  
    - CI/hooks so gates are hard to skip  

---

## The Arc Shape

```
SCOUT   → read the code, find root causes, write them down
BOARD   → task list the rounds, dependencies noted
ARMY    → spawn owners for parallel rounds (law 2)
GATE    → verify + commit each landing round (laws 3, 4)
3RD EYE → host-LLM independent review; gate its verdict (laws 5–6)
SEAL    → stamps, full suites, push if appropriate, dossier row, final ping (laws 4, 6, 7)
```

---

## Round discipline

- A round = one coherent deliverable (a bug class killed, a feature slice, a polish sweep).
- Pre-verify bar per round: code compiles/parses + project test suite green + functional probe when feasible.
- Regressions found post-ship get logged (`BUGS.md` style: REG-NNN — symptom · caught-by · root cause · fix · prevention).

---

## When to use

Any request shaped like "build/fix/polish X properly" that will take more than ~3 distinct steps. For one-liners, skip the ceremony — this is for **arcs**, not errands.

---

## What this is NOT

- Not Grok-only / not Claude-only  
- Not a requirement to buy a second AI brand for pingpong  
- Not auto-deploy while ON AIR  
- No project-specific glue — bring your own tests and version scheme; the workflow adapts  

---

## Invoke

- Explicit: `/konyo-workflow`  
- Natural: “do this Konyo Workflow style” / “ship it with the full ceremony”
