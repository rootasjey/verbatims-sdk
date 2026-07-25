#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const entry = resolve(__dirname, '../src/index.ts')
const require = createRequire(import.meta.url)
const tsxEsm = require.resolve('tsx/esm')

const child = spawn(
  process.execPath,
  ['--import', tsxEsm, entry, ...process.argv.slice(2)],
  { stdio: 'inherit' },
)

child.on('exit', (code) => process.exit(code ?? 1))
