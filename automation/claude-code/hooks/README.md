# Scar capture — the half that was missing outside the workflow

Inside the workflow, scars are captured every round and carve candidates are proposed at arc
end. In an ordinary Claude Code session **nothing was captured at all** — you correct the same
thing three times across three days and the third correction costs exactly what the first did.

These two hooks are the capture half, plus the counting. Neither of them carves.

| File | Event | Does |
|------|-------|------|
| `scar_capture.py` | `UserPromptSubmit` | records correction-shaped turns to `~/.konyo-workflow/SCARS.inbox.md` |
| `scar_cluster.py` | `SessionStart` | reports a territory that has been hit 3 times; silent otherwise |
| `scar_territory.py` | — | the clustering key, shared by both |

`install.sh` copies them to `~/.konyo-workflow/hooks/` **and registers them** in
`~/.claude/settings.json`. Copying alone is not an install: a hook nobody registers is a script
that never runs, and this repo already shipped that exact defect once.

## The split, and why it is a split

**Capture is automatic.** It is cheap, additive and reversible, and the cost of not doing it is
that every lesson evaporates when the session ends.

**Carving is not.** Carving prunes shared files that every future session loads, and a rule
written from three coincidences becomes a permanent instruction whose evidence has been deleted —
you cannot argue with it later. Three repetitions of a phrase are also not three distinct
failures. So the machine does the counting, which is the part humans are bad at, and the
judgement stays with you.

`SCARS.inbox.md` is deliberately **not** `SCARS.md`. The inbox is automatic, noisy and
unreviewed; `SCARS.md` is curated and is read by workflow builders at Preflight. Letting an
unreviewed heuristic put words in front of every future agent is the thing worth avoiding.

## ⚠ The safety law, inherited verbatim from the engine

**A scar narrows attention. It never suppresses a gate.** Nothing captured here may skip a
check, lower a bar, or mark anything already-judged. A scar that could silence a gate would be a
cache of a verdict, and a cached verdict has already bitten this repo once.

## Tuning

Detection is tuned to **under**-capture. A missed scar costs one repetition; a false one costs
every future session's attention. `Do not use tabs` in an opening brief is an instruction;
`no, I told you not to use tabs` is a scar.

| Env var | Default | Does |
|---------|---------|------|
| `KONYO_SCAR_INBOX` | `~/.konyo-workflow/SCARS.inbox.md` | where captures land |
| `KONYO_CARVE_FLOOR` | `3` | scars in one territory before it is reported |

The hooks never block, never edit your prompt, and exit 0 on every path including malformed
input. A capture layer that can break a turn is worse than no capture layer.

## Proof

```bash
node automation/claude-code/scar_hook_proof.mjs
```

Checks three things, each with a real failure mode:

1. **Parity.** `scarTerritory()` exists twice — JavaScript in `konyo-workflow.js` (a workflow
   script cannot import Python) and Python here (a hook cannot import the engine). Two copies of
   one algorithm is drift waiting to happen, so they are compared over a corpus.
2. **Capture, both directions.** It must fire on a correction *and* stay quiet on an
   instruction. A hook that fires on everything and one that fires on nothing look identical
   from outside — a quiet file.
3. **Cluster.** Silent below the floor, valid JSON at it.

> **Scar from building this (2026-08-15).** The proof was `import`ing the Python module and macOS
> python sets `sys.pycache_prefix=~/Library/Caches/com.apple.python`, so bytecode caches live in a
> **central directory** — `find . -name __pycache__` finds nothing. Cache invalidation compares
> mtime **and size**, so a mutation that was the same byte length (`[:5]` → `[:6]`) landing in the
> same second looked unchanged, and a stale `.pyc` kept being served. The gate spent four runs
> grading code that no longer existed. It now `exec`s the source text, which removes the class.
