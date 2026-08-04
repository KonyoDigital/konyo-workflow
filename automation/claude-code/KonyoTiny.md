---
description: Konyo workflow at TINY — a ~15-minute wall-clock budget for a SMALL, ALREADY-KNOWN edit set. Cuts the PLANNING hops, keeps every ship gate. Requires an explicit items list and refuses without one.
argument-hint: [what you want done — then give the file+instruction per edit]
---

```
Workflow({
  scriptPath: '/Users/konyo/.claude/workflows/konyo-workflow.js',
  args: {
    task: '$ARGUMENTS',
    quality: 'tiny',
    apply: true,
    // REQUIRED. Tiny skips triage AND the architect, so the plan must already be here.
    // <=4 items, <=3 distinct files, one owner per file.
    items: [
      // { file: '/abs/path/to/file', instruction: 'the exact edit', risk: 'low' },
    ],
  }
})
```

**Why tiny is fast, and it is not "fewer agents".** Wall clock ≈ **serial hops × time per hop**.
The default chain is 11 phases deep and each hop is a full agent round-trip of 3-8 minutes, so
~45 minutes goes into *hops* before parallelism can help — and it cannot help, because the phases
are chained. Tiny is designed backwards from 15 minutes = **four hops**:

```
1 lock  →  2 build (one agent per FILE, parallel)  →  3 gates FAN OUT  →  4 stamp + push
```

Hop 3 is the trick: reachability and the render gate read the same finished diff and have no
dependency on each other, so they now run **concurrently** instead of queueing.

**What tiny CUTS — planning, never verification:** triage, the architect, the third-eye *plan* seat,
the completeness critic, and the synthesizer (tiny writes its own report from the same fields the
payload uses, so the headline cannot disagree with `blockers`).

**What tiny KEEPS — every gate that caught a real bug:** the 2-seat adversarial panel (a skeptic seat
caught a rarity remap painting basic items gold), LAW19 reachability (caught a dead function that a
"fix" had been applied *inside*), the render gate including the vision step (caught an item that was
never shipped at all), the blockers ledger, the agent ceiling, and the workspace lock.

**It REFUSES rather than degrading.** No `items`, an item missing `file`/`instruction`, more than 4
items, more than 3 files, two items owning one file, or a task phrased as *investigate / find out why
/ root-cause* — all bail with the exact re-run printed. A diagnosis is serial work; a fleet makes it
slower, not faster. For anything outside those bounds use `/KonyoLean`, which plans for you and is
honest about taking longer.

**Honest floor:** the repo's pre-push gate is ~2-3 minutes including its smoke run, and the render
gate needs a real browser (~30-60s). ~8 minutes is the floor; 15 is the budget; seconds is not on
offer.
