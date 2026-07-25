import type { Command } from 'commander'
import { text, isCancel, cancel } from '@clack/prompts'
import chalk from 'chalk'
import { getClient } from '../utils/client.js'
import { output, type Format } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'

function getFormat(program: Command): Format {
  return (program.opts().format ?? 'plain') as Format
}

export function registerCollectionsCommand(program: Command) {
  const collections = program.command('collections').description('Manage collections')

  collections
    .command('create')
    .description('Create a collection')
    .option('--name <name>', 'Collection name')
    .option('--description <text>', 'Description')
    .option('--public', 'Make collection public')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const name = options.name ?? await text({ message: 'Collection name', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(name)) cancel('Cancelled')

      const { data } = await withSpinner('Creating collection', () =>
        client.collections.create({ name: name as string, description: options.description ?? null, is_public: Boolean(options.public) }),
        format,
      )
      console.log(chalk.green(' Collection created'))
      output(data, format)
    })

  collections
    .command('add <collection-id> <quote-id>')
    .description('Add a quote to a collection')
    .action(async (collectionId: string, quoteId: string) => {
      const client = await getClient()
      await withSpinner('Adding quote to collection', () => client.collections.addQuote(Number(collectionId), Number(quoteId)))
      console.log(chalk.green(` Quote #${quoteId} added to collection #${collectionId}`))
    })

  collections
    .command('remove <collection-id> <quote-id>')
    .description('Remove a quote from a collection')
    .action(async (collectionId: string, quoteId: string) => {
      const client = await getClient()
      await withSpinner('Removing quote from collection', () => client.collections.removeQuote(Number(collectionId), Number(quoteId)))
      console.log(chalk.green(` Quote #${quoteId} removed from collection #${collectionId}`))
    })
}
