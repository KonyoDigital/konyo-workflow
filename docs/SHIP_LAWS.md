# Konyo Ship Laws

Portable quality laws for the Konyo Workflow.
Each law is **PASS**, **FAIL**, or **N/A** (N/A requires evidence).

> LAW17 and LAW18 were each enforced on one host before either was written down here, so the
> canonical table disagreed with the shippers that read it. Both are now enforced in all four
> shippers — Claude Code (standard + MAX) and Grok (standard + MAX).

## Operating rules

| ID | Law | Notes |
|----|-----|--------|
| OR1 | Burst orders | Fold every part of the objective into the plan |
| OR2 | Army | Parallel workers; **one owner per file** |
| OR3 | Gate owner | Suites + syntax + eyes on evidence before merge |
| OR4 | Third-eye | Adversarial back-pass with the **same AI** (or a second model if available) |
| OR5 | Versioned ships | **Required:** version goes up on each sealed ship + committed |

## Ceremony laws

| ID | Law | Universal meaning |
|----|-----|-------------------|
| LAW01 | TDD / Tests | Tests or locks for **this** change |
| LAW02 | Review | Correctness, edges, error handling |
| LAW03 | Security | Secrets, injection, authz, unsafe defaults |
| LAW04 | Docs / Ops | README, changelog, operator notes |
| LAW05 | Rollback | Blast radius and reverse path |
| LAW06 | Patch discipline | No partial-applies; live anchors |
| LAW07 | Syntax / static | Parse/lint for touched languages |
| LAW08 | UX polish | Touched UI polished — or N/A if no UI |
| LAW09 | Interaction / e2e UX | Real interaction matrix — or N/A |
| LAW10 | Visual verification | Eyes on visuals — or N/A |
| LAW11 | Version stamps | **Required:** bump + commit; parity if multiple files; use their scheme |
| LAW12 | Ledger | **Required outcomes:** ship trail every seal; bug log when things break — use existing tools/files or bootstrap minimal CHANGELOG + BUGS |
| LAW13 | Deploy / live safety | Preflight; no reckless restart while live |
| LAW14 | Self-enforcing | CI/hooks so gates are hard to skip |
| LAW15 | Army / overlap | Zero path overlap; full objective coverage |
| LAW16 | Seven-round pingpong | ≥7 design→seal exchanges for full **ship** when strict (same AI/LLM) |
| LAW17 | Fat version bar | ONE version must package real work: **≥3 user-visible outcomes in one theme**, OR one structural bug with root cause + verification + prevention. A single toast/label/i18n key/CSS one-liner is a **blocker**, not a ship |
| LAW18 | Painted-UI proof | **CI first:** if the project gates UI in CI, read that verdict (`gh run list` / `gh run view --log-failed`) — only run a browser locally when there is no CI gate. Otherwise, if the project can drive its own UI, **run it** — boot without console errors, every visible control hit-testable, no raw `{placeholder}`/i18n keys rendered, page still responsive after idle; never bind a port the user's app uses and kill anything started. Failure **blocks**. N/A (`available:false`) only when there is genuinely no UI tooling — inventing a passing result or installing a framework unasked is itself a violation |
| LAW19 | Reachability | Every symbol the change ADDED must have a **caller AND a writer**. A slot read and cleared but never written, a handler wired to no element, a route with no requester, or a guard on a name declared NOWHERE are all dead — and dead code that a commit message calls a feature is worse than a missing feature, because nobody looks again. **Prefer execution to grep** (grep cannot tell a live cross-file reference from a dead one). If tests were added, prove they **RAN** — a suite count before and after, or the new names in verbose output; "the suite is green" is not evidence your tests are in it |

## Verdict rules

- Confirmed **blocker** → **blocked**, not ship
- Strict mode and rounds < `rounds_min` (default 7) → **draft**, not ship
- Missing evidence on a required gate → not green (fail closed)
- High on-air risk → do not recommend restart/deploy until clear

## Modes

| Mode | Behavior |
|------|----------|
| `strict: true` (default) | Full bar including LAW16 for `ship` |
| `strict: false` | Solid audit; round rule relaxed |
| `mode: plan-only` | Intake + inventory + plan only |
| `human_approve: true` | Pause when verdict is ship for human OK |
