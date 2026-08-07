# The Konyo Workflow

**The ultimate shipper for AI / LLMs.**

Not a chatbot vibe. A way an AI **actually ships**: plan → build in sealed rounds → prove each round (tests, checks, eyes on evidence) → independent back-pass → fix until it holds → stamp a version → **ONE final ping** when the arc is done.

Fail closed: **ship**, **draft**, or **blocked** — never “looks fine.”  
Full version means real iteration (about **seven** design → implement → review → fix → re-verify → polish → seal exchanges), not a single lucky pass.

Any model. Any chat that can use tools and helpers.  
**The AI running the session is the engine** — it reviews its own work (a second model is optional).

Battle-tested by Konyo across hundreds of shipped versions.

---

## Quick start

```bash
curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/install.sh | bash
```

Or clone / ZIP, then `./install.sh`.

Installs to **`~/.konyo-workflow/`**.

Give your AI the method:

- Attach or paste **`~/.konyo-workflow/SKILL.md`** (or the copy in this repo) as instructions.
- Tell it: *“Use the Konyo Workflow.”* / *“Ship this Konyo Workflow style.”*

That’s it.

---

## How it ships

| Stage | What happens |
|-------|----------------|
| **Plan** | Clear objective, checklist, success criteria |
| **Build in rounds** | One coherent deliverable per round — not a mega-dump |
| **Gate** | Prove it (tests, lint, smoke, evidence) before it counts |
| **Third-eye** | Independent back-pass — **SOLO** (same conversation) or **MULTI** (a reviewer that never saw you think) |
| **Seal** | Version stamp + ship log; **draft** if not enough rounds, **blocked** if gates fail |
| **Final ping** | One summary table for the human when the arc ends |
| **Scar** | Whatever went wrong becomes a rule the next run loads — and when rules cluster, they graduate into a skill of their own |

Under the hood the AI may use parallel helpers (one owner per surface) so work doesn’t thrash — that’s mechanics, not the pitch.  
**The pitch is the ship quality bar.**

Not a product. Not a vendor. **How an AI ships serious work.**

**Does not rewrite other people’s projects’ lingo** — but it **does** require a real ship system:

| Required outcome | Meaning |
|------------------|---------|
| **Versions go up** | Each sealed ship bumps version and commits (their scheme, or a minimal one if missing) |
| **Ship trail** | Durable “what shipped” record (their changelog/log, or a simple CHANGELOG) |
| **Bug log** | Breakages remembered (their issues/tracker, or a simple BUGS file) |

Not required: Obsidian, a new GitHub org, or foreign names. **Same spirit as a perfected house system — adaptive form.**

---

## Repo layout

| Path | What |
|------|------|
| `SKILL.md` | The method — give this to the AI |
| `install.sh` | Copies into `~/.konyo-workflow/` |
| `docs/SHIP_LAWS.md` | 19 ship laws |
| `automation/claude-desktop/` | **Claude Desktop skill** — upload the zip, no terminal, no second AI required |
| `automation/claude-code/` | Claude Code engine (`konyo-workflow.js`) + `/KonyoTiny` `/KonyoLean` `/KonyoMax` |
| `automation/workflows/` | Optional scripts if your setup can run them |

---

## No terminal? Use the Claude Desktop skill

### ⬇ Download

**[`konyo-workflow.skill`](https://github.com/KonyoDigital/konyo-workflow/raw/main/automation/claude-desktop/konyo-workflow.skill)** — then in Claude Desktop:
**Settings → Capabilities → enable "Code execution and file creation"**, then
**Customize → Skills → + → Create skill → Upload a skill**.

Free, Pro, Max, Team and Enterprise. MIT. It is **two markdown files** — no
scripts, no dependencies, nothing that runs. Inspect it before you install it;
that is a reasonable thing to want from anything you load into your assistant.


`automation/claude-desktop/konyo-workflow.zip` is the whole method as an uploadable
skill. **Nothing to install, no API keys, no second AI**, and it works on Free.

It runs at one of two settings, and the difference is independence, not effort:

- **SOLO** — one conversation, structured self-review across four separate lenses.
  The default, and honest about its ceiling: a model reviewing its own work has
  blind spots in the same places it just built.
- **MULTI** — the review happens in a **fresh conversation that never saw the
  building**, so it has to be convinced by the artifact rather than by your
  reasoning. Use it whenever being wrong is expensive. If you have a second AI, use
  that instead — different model family, different blind spots.

**And it knows when to stop.** Fix → re-prove is a loop, so it stops for one of
three stated reasons — **PASSED**, **CEILING** (still failing, but the failure kept
changing, so give it room) or **STALLED** (the same failure twice running — stop and
change the approach, don't raise the limit). Collapsing the last two into "didn't
work" is how an hour goes into the version that cannot work.

**And it learns.** Each run that goes wrong ends with a *scar block*: what broke,
what it cost, how it was caught, the rule that prevents it, where that rule now
lives, and **the evidence from that run that proves it** — the line separating a
rule from a superstition. You paste it into `SCARS.md`, which the skill reads before
every run. When three scars land in the same territory, that territory has earned
its own skill — the workflow carves a child skill and moves the rules into it.

`SCARS.md` has **two layers, and the difference is authority.** FOUNDING rules are
hand-written by you and nothing learned may overwrite them; LEARNED scars append
below, deliberately lower authority, because a rule extracted from one bad afternoon
should not outrank one you chose while thinking clearly. And you keep the previous
copy before pasting — a lesson can be *wrong*, and a wrong rule is worse than no
rule because you will follow it.

*(That structure is lifted from [Prime Intellect's Continual
Harness](https://github.com/PrimeIntellect-ai/prime-agent) — immutable base,
supplemental learned state, snapshots for rollback, evidence-backed updates.)*

That is the compounding part: a generic workflow is worth something; one shaped by
twenty of your own real mistakes is worth considerably more, and it can only be
grown. See `automation/claude-desktop/INSTALL.md`.

---

## Sandbox isolation (opt-in): `{isolate: true}`

By default every builder edits ONE shared working tree. That is why the fleet is capped in the low
teens — not a real ceiling, just fear of two agents in the same file, and this project has already
lost 25,000 lines to a single bad edit.

`{isolate: true}` (apply mode only) gives each builder its own git worktree AND adds the half that
makes isolation real: **the merge**. `isolation:'worktree'` on its own hands the agent a throwaway
copy and merges nothing back — switched on naively, every edit vanishes and the run still reports
success. So builders return their **patch**, and one merge agent applies the patches to the real
repo sequentially, `git apply --check` first, reporting conflicts instead of forcing them. The tree
never has more than one writer, and no work depends on a worktree surviving.

It is opt-in because a merge stage that goes wrong loses work. Without the flag, behaviour is
unchanged.

> **Model providers:** these harnesses run on whatever your host provides. If you drive an external
> harness (e.g. ByteDance's DeerFlow) alongside them, prefer a **Claude Code OAuth** provider over a
> metered API key — it uses the subscription you already pay for instead of billing per token.

## 19 ship laws (short)

1. TDD/tests for this change · 2. Review · 3. Security · 4. Docs/ops · 5. Rollback  
6. Patch discipline · 7. Syntax gates · 8. UX polish · 9. Interaction matrix · 10. Visual eyes  
11. Version stamps · 12. Ledger · 13. Deploy/live safety · 14. Self-enforcing checks  
15. Army zero-overlap · 16. **Seven-round pingpong**  
17. **Fat version bar** · 18. **Painted-UI proof** · 19. **Reachability**

Verdicts: **ship** | **draft** | **blocked** (fail closed).  
If a law doesn’t apply (e.g. no UI), mark **N/A + evidence** — don’t fake it, don’t skip silently.

Full list: **[docs/SHIP_LAWS.md](./docs/SHIP_LAWS.md)**

---

## Workspace lock (2026-08-03)

Both Claude Code shippers open with a **Preflight** phase that takes a lock on the working
tree before a single agent is bought. A second run in the same tree refuses immediately and
names the holder rather than queueing.

Why: two fleets editing one file silently overwrite each other and **both report green**.
Each builder reads a whole file and writes it back, so whichever finishes second erases the
other, and nothing in either diff or either final report reveals it.

- Lock dir `~/.claude/workflows/.locks/`, keyed on `pwd`. Both shippers share it, so they
  exclude each other — a lock only one workflow respects is not a lock.
- **TTL, not a promise to release.** A killed run never reaches its release, and a lock that
  outlives its holder locks you out of your own repo. Every lock carries `expires_epoch` and
  each acquirer purges dead ones first. Release is best-effort; the TTL is the guarantee.
- Compare expiry as **integers** (`[ "$EXP" -lt "$NOW" ]`). `[ a \< b ]` on ISO strings is
  invalid under zsh, fails silently, and leaves a dead lock forever — the one failure mode
  that makes a lock worse than none. Found by testing; called out in the prompt so it cannot
  be reintroduced.
- Overrides: `{ignoreLock:true}` only when the holder is genuinely dead, `{lockTtlMinutes:N}`.
  Deliberately **not** folded into `force:true` — force overrules *triage*, a far cheaper
  mistake than overwriting another fleet's work.

### Parity: this is 2 of the 4 shippers

The two Grok `.rhai` shippers do **not** have the lock. A Grok run and a Claude Code run can
still collide in one tree.

It is expressible there — `complete(#{...})` is the proven early exit, `phase`/`agent`/`log`
all exist, and `capability_mode: "execute"` can write the lock file. It is not shipped because
**there is no rhai parser on this machine**: no `cargo`, no rhai runner, and the Grok CLI has
no workflow validate/list subcommand. Shipping an unvalidated control-flow edit into a working
shipper risks killing it silently, which is worse than the gap it closes.

To finish it, validate on a machine that can parse rhai, or run it once against a scratch repo
and confirm the Preflight phase acquires and the run proceeds.

## Uninstall

```bash
rm -rf ~/.konyo-workflow
```

---

## License

MIT

---

**Konyo Workflow** — a doctrine for AI LLMs that ship.
