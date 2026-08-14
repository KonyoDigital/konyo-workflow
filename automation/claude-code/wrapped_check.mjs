#!/usr/bin/env node
// THE SYNTAX GATE THAT ACTUALLY MATCHES THE ENGINE.
// `node --check konyo-workflow.js` is NOT a valid gate for a workflow script: on 2026-08-04 it
// passed a file containing an unescaped apostrophe inside a single-quoted meta string — a hard
// SyntaxError the engine could not parse. The script is neither a plain module nor a plain script
// (it has `export const meta` AND a top-level `return`), so node --check does not parse it the way
// the engine does. The engine strips the export and wraps the body in an async function. So does this.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { enginePath } from './engine_path.mjs'
const f = enginePath(process.argv[2])
const out = `/tmp/wrapped_check_${process.pid}.mjs`
writeFileSync(out, '(async () => {\n' + readFileSync(f, 'utf8').replace('export const meta', 'const meta') + '\n})()\n')
try {
  execFileSync(process.execPath, ['--check', out], { stdio: 'inherit' })
  console.log(`✅ ${f} parses the way the engine parses it`)
} catch { console.error(`❌ ${f} does NOT parse — see above`); process.exit(1) }
