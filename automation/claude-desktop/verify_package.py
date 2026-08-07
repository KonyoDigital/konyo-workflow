#!/usr/bin/env python3
"""Verify konyo-workflow.zip is a package Claude Desktop will actually accept.

Run before publishing: `python3 verify_package.py`

⚠ WHY THIS EXISTS AS A SCRIPT AND NOT A CHECKLIST. Every failure it checks for is
SILENT at authoring time — the zip builds fine, the markdown renders fine, and the
package is rejected (or worse, accepted and subtly broken) only at upload:

  · files loose in the zip root, or an extra wrapping folder -> rejected
  · a description over 1024 chars                            -> rejected
  · SKILL.md referencing SCARS.md while the zip omits it     -> accepted, and the
    skill then tells its user to read a file that is not there

`--self-test` proves each check can FAIL. A gate nobody has seen go red is not
known to be measuring anything.
"""
from __future__ import annotations
import io, re, sys, zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIMIT = 1024


def check(zf: zipfile.ZipFile) -> list[str]:
    fails, names = [], zf.namelist()
    md = zf.read("konyo-workflow/SKILL.md").decode()

    def want(cond, label):
        print(("  ok   · " if cond else "  FAIL · ") + label)
        if not cond:
            fails.append(label)

    roots = sorted({n.split("/")[0] for n in names})
    want(roots == ["konyo-workflow"],
         f"one root folder {roots} — loose files and double wrappers are the two "
         f"shapes Desktop rejects")
    want("konyo-workflow/SCARS.md" in names,
         "SCARS.md ships inside the package — the skill reads it before Step 1, so "
         "shipping the reference without the file is the 'guard names a missing "
         "file' bug this workflow exists to prevent")

    m = re.match(r"^---\n(.*?)\n---\n", md, re.S)
    want(bool(m), "frontmatter delimiters parse")
    fm = m.group(1) if m else ""
    nm = re.search(r"^name:\s*(.+)$", fm, re.M)
    ds = re.search(r"^description:\s*(.+)$", fm, re.M)
    want(bool(nm and ds), "frontmatter carries name and description")
    want(bool(nm) and re.fullmatch(r"[a-z0-9-]{1,64}", nm.group(1).strip()),
         f"name {nm.group(1).strip() if nm else None!r} is lowercase-hyphen, <=64 chars")
    d = ds.group(1).strip() if ds else ""
    want(len(d) <= LIMIT,
         f"description is {len(d)} chars (limit {LIMIT}) — over-long is rejected at "
         f"upload, never truncated")

    scars = zf.read("konyo-workflow/SCARS.md").decode() if \
        "konyo-workflow/SCARS.md" in names else ""
    want("grok" not in md.lower() and "grok" not in scars.lower(),
         "zero mentions of any second vendor — this build stands alone on Claude")
    want("Step 4b" in md and "MULTI" in md, "the SOLO/MULTI section is present")
    want("Step 7" in md and "SCARS" in md, "the scar / skill-carving step is present")

    # The two new steps are worthless if the seal does not demand them.
    if "## Step 6" in md and "## Step 7" in md:
        seal = md[md.index("## Step 6"):md.index("## Step 7")]
        want("SOLO or MULTI" in seal,
             "the SEAL requires naming the mode — describing modes elsewhere does "
             "not make anyone state which one they ran")
        want("scar" in seal.lower(),
             "the SEAL requires answering whether a scar was produced — without "
             "this the learning loop is skipped silently and forever")
    return fails


def _zip(files: dict) -> zipfile.ZipFile:
    b = io.BytesIO()
    with zipfile.ZipFile(b, "w") as z:
        for k, v in files.items():
            z.writestr(k, v)
    return zipfile.ZipFile(b)


def self_test() -> int:
    good = zipfile.ZipFile(HERE / "konyo-workflow.zip")
    files = {n: good.read(n) for n in good.namelist() if not n.endswith("/")}
    md = files["konyo-workflow/SKILL.md"].decode()
    bad = 0
    for label, mutate in [
        ("description over the limit",
         lambda f: {**f, "konyo-workflow/SKILL.md": re.sub(
             r"^description:.*$", "description: " + "x" * 1100, md, flags=re.M)}),
        ("SCARS.md missing from the zip",
         lambda f: {k: v for k, v in f.items() if "SCARS" not in k}),
        ("a second vendor named in the skill",
         lambda f: {**f, "konyo-workflow/SKILL.md": md + "\nAsk Grok to review.\n"}),
        ("files loose in the zip root",
         lambda f: {k.split("/")[-1]: v for k, v in f.items()}),
        ("the seal no longer demands the mode",
         lambda f: {**f, "konyo-workflow/SKILL.md": md.replace("SOLO or MULTI (Step 4b)", "—")}),
    ]:
        print(f"\n  RED PROOF — {label}")
        try:
            fails = check(_zip(mutate(files)))
        except Exception as e:            # a missing member is also a failure
            fails = [f"raised {type(e).__name__}"]
            print(f"  FAIL · raised {type(e).__name__}")
        if not fails:
            print(f"  ✗✗ THE GATE STAYED GREEN on {label!r} — it is not measuring this")
            bad += 1
    return bad


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        n = self_test()
        print()
        print("EVERY CHECK PROVEN RED." if not n
              else f"{n} CHECK(S) COULD NOT BE MADE TO FAIL — they measure nothing")
        raise SystemExit(1 if n else 0)
    print("konyo-workflow.zip")
    f = check(zipfile.ZipFile(HERE / "konyo-workflow.zip"))
    print()
    print("PACKAGE OK" if not f else f"{len(f)} FAILURE(S)")
    raise SystemExit(1 if f else 0)
