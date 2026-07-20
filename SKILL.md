---
name: konyo-workflow
description: The Konyo Workflow — a big-arc shipping method for Claude Code: agent army with one owner per file, the lead gates every merge, third-eye review rounds, a version per round, autonomous chain with ONE final ping. Invoke for any multi-round feature arc, night run, or polish sweep.
---

# 🏆 THE KONYO WORKFLOW

A battle-tested method for shipping large arcs of work with Claude Code — many rounds, many agents, zero chaos. Named and blessed by its inventor, Konyo.

## The Laws

1. **Make a list first.** Create a visible task board (TaskCreate) — one task per round, typically 5–9 rounds per arc. Check tasks off as they land. The user watches progress by the board, not by asking.

2. **Agent army — ONE OWNER PER FILE.** Spawn parallel subagents for independent rounds. Each agent owns EXACTLY the file(s) named in its brief and may never touch anything else, never commit, never push, never restart shared services. Two agents must never own the same file at the same time. Ownership is PER-ARC: every grant dissolves when the arc seals — between arcs the lead owns everything, and the next arc's briefs name fresh single owners with no inherited claims.

3. **The lead gates every merge.** Agents report; the lead re-verifies (compile, test suite, lint/parse, live smoke where possible) BEFORE committing their work. Trust but verify — an agent's "done" is a claim, not a fact.

4. **Version per round.** Every round that ships gets a version stamp and its own commit with a message that tells the story: what broke, why, the fix. If the project keeps version stamps in multiple files, bump them all together (add a parity test that fails on drift).

5. **Third-eye rounds.** Between build rounds, hand the diff to an independent reviewer (a different model/CLI, a review agent, or a human) with a terse brief: "MAX N findings, ranked by severity, concrete only, no praise." Gate its findings: fix the real ones immediately, log the deferred ones in a visible backlog. Never re-litigate a fixed issue without a new live failure.

6. **Autonomous chain → ONE final ping.** Once the arc starts, run it end to end without asking permission for reversible steps. Brief status lines are fine; the deliverable is ONE final ping: a table of every round, what shipped, and how to verify each claim.

7. **Ping-pong dossiers.** When two AIs (or AI + human) trade a codebase, each leg appends to a dated debug dossier in the repo: one row per ship — symptom → root cause → fix → verify. The next leg starts by re-running the previous leg's verify commands before trusting anything. Commit your work before handing off.

8. **Honesty rules.** Never claim green before the verdict (CI, suite, or live check). Failed steps are reported as failed, with output. If a lane is capped, sampled, or skipped — say so. UI lamps and status text must report *proven* state, never vibes.

## The Arc Shape

```
SCOUT   → read the code, find root causes, write them down
BOARD   → TaskCreate the rounds, dependencies noted
ARMY    → spawn owners for parallel rounds (law 2)
GATE    → verify + commit each landing round (laws 3, 4)
3RD EYE → independent review; gate its verdict (law 5)
SEAL    → bump stamps, full suites, push, dossier row, final ping (laws 4, 6, 7)
```

## Round discipline

- A round = one coherent deliverable (a bug class killed, a feature slice, a polish sweep).
- Pre-verify bar per round: code compiles/parses + the project's test suite green + a functional probe when feasible (drive the real app headlessly if you can).
- Regressions found post-ship get logged in the repo's regression file (`BUGS.md` style: REG-NNN — symptom · caught-by · root cause · fix · prevention).

## When to use

Any request shaped like "build/fix/polish X properly" that will take more than ~3 distinct steps. For one-liners, skip the ceremony — the workflow is for arcs, not errands.
