# Konyo Ship Laws

Portable quality laws for the Konyo Workflow.
Each law is **PASS**, **FAIL**, or **N/A** (N/A requires evidence).

## Operating rules

| ID | Law | Notes |
|----|-----|--------|
| OR1 | Burst orders | Fold every part of the objective into the plan |
| OR2 | Army of agents | Parallel work; **one owner per file** |
| OR3 | Gate owner | Suites + syntax + eyes on evidence before merge |
| OR4 | Third-eye | Adversarial back-pass with session agents (or a second model if available) |
| OR5 | Versioned ships | Prefer one sealed version per arc |

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
| LAW09 | Interaction / RINSE-class | Real interaction matrix — or N/A |
| LAW10 | Visual verification | Eyes on visuals — or N/A |
| LAW11 | Version stamps | Consistent version identity |
| LAW12 | Ledger | Ship log / changelog / bug register |
| LAW13 | Deploy / live safety | Preflight; no reckless restart while live |
| LAW14 | Self-enforcing | CI/hooks so gates are hard to skip |
| LAW15 | Army / overlap | Zero path overlap; full objective coverage |
| LAW16 | Seven-round pingpong | ≥7 design→seal exchanges for full **ship** when strict (using the session LLM) |

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
