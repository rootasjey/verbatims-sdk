#!/usr/bin/env node

import { Command } from 'commander'
import { registerCommands } from './commands/index.js'
import { setSilent } from './utils/spinner.js'
import pkg from '../package.json' with { type: 'json' }

process.on('unhandledRejection', (err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})

const program = new Command()

program
  .name('verbatims')
  .description('CLI for the Verbatims quotes API')
  .version(pkg.version)
  .option('--api-key <key>', 'API key (overrides config and env)')
  .option('--format <type>', 'Output format: table|json|plain', 'table')
  .showHelpAfterError()
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals()
    if (opts.format === 'json') setSilent(true)
  })

registerCommands(program)

program.parse()
