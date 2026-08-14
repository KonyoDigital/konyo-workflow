/* ONE place that answers "which engine file are we proving?".

   WHY THIS EXISTS. Six proof scripts each hard-coded the author's own absolute path
   (`/Users/<author>/.claude/workflows/konyo-workflow.js`) as their default. On the author's
   machine that is invisible — every proof passes. On anyone ELSE's machine, and in a fresh
   clone of this repo, every one of them dies on ENOENT before testing anything. A proof
   that cannot run where the code is read is not a proof; it is a green light wired to the
   author's laptop.

   Fixing it at six call sites would be six chances to forget the seventh, so it lives here
   once. Resolution order, most-specific first:

     1. an explicit path passed as argv[2]        — a caller who knows, wins
     2. $KONYO_ENGINE                             — CI and scripted runs
     3. the copy sitting next to this file        — a fresh clone proves ITSELF
     4. ~/.claude/workflows/konyo-workflow.js     — an installed engine

   Step 3 before step 4 is deliberate: when you clone this repo and run the proofs, you
   almost certainly mean "prove the code I just cloned", not "prove whatever happens to be
   installed on this machine". Getting that backwards is how a proof passes against a file
   the reader has never seen. */

import { homedir } from 'node:os'
import { existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

export function enginePath (argvPath, file = 'konyo-workflow.js') {
  const candidates = [
    argvPath && resolve(argvPath),
    process.env.KONYO_ENGINE && resolve(process.env.KONYO_ENGINE),
    join(HERE, file),
    join(homedir(), '.claude', 'workflows', file),
  ].filter(Boolean)

  const found = candidates.find(p => existsSync(p))
  if (found) return found

  // Say WHERE we looked. A bare ENOENT sends the reader hunting for a typo that is not there.
  const err = new Error(
    `Cannot find ${file}. Looked in:\n` + candidates.map(p => `  · ${p}`).join('\n') +
    `\nPass a path as the first argument, or set KONYO_ENGINE.`)
  err.code = 'ENGINE_NOT_FOUND'
  throw err
}

export default enginePath
