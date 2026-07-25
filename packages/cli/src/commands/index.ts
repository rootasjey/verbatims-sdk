import type { Command } from 'commander'
import { registerQuotesCommand } from './quotes.js'
import { registerAuthorsCommand } from './authors.js'
import { registerReferencesCommand } from './references.js'
import { registerTagsCommand } from './tags.js'
import { registerCollectionsCommand } from './collections.js'
import { registerSearchCommand } from './search.js'
import { registerConfigCommand } from './config.js'

export function registerCommands(program: Command) {
  registerQuotesCommand(program)
  registerAuthorsCommand(program)
  registerReferencesCommand(program)
  registerTagsCommand(program)
  registerCollectionsCommand(program)
  registerSearchCommand(program)
  registerConfigCommand(program)
}
