import type { Command } from 'commander'
import { text, isCancel, cancel, confirm } from '@clack/prompts'
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
    .command('list')
    .description('List collections')
    .option('--page <n>', 'Page number', '1')
    .option('--limit <n>', 'Number of results', '20')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, pagination } = await withSpinner('Fetching collections', () =>
        client.collections.list({ page: Number(options.page), limit: Number(options.limit) }),
        format,
      )
      output(data, format)
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })

  collections
    .command('get <id>')
    .description('Get a collection and its quotes')
    .option('--page <n>', 'Quote page number', '1')
    .option('--limit <n>', 'Quotes per page', '20')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching collection', () =>
        client.collections.get(Number(id), { page: Number(options.page), limit: Number(options.limit) }),
        format,
      )
      output(data, format)
    })

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
    .command('update <id>')
    .description('Update a collection')
    .option('--name <name>', 'Collection name')
    .option('--description <text>', 'Description (use an empty value to clear)')
    .option('--public', 'Make collection public')
    .option('--private', 'Make collection private')
    .action(async (id: string, options: Record<string, string | boolean>) => {
      if (options.public && options.private) {
        throw new Error('Choose either --public or --private')
      }
      const data: { name?: string; description?: string | null; is_public?: boolean } = {}
      if (options.name) data.name = options.name as string
      if (options.description !== undefined) data.description = options.description ? options.description as string : null
      if (options.public) data.is_public = true
      if (options.private) data.is_public = false
      if (Object.keys(data).length === 0) {
        throw new Error('Provide at least one field to update')
      }

      const client = await getClient()
      const format = getFormat(program)
      const { data: updated } = await withSpinner('Updating collection', () =>
        client.collections.update(Number(id), data),
        format,
      )
      console.log(chalk.green(' Collection updated'))
      output(updated, format)
    })

  collections
    .command('delete <id>')
    .description('Delete a collection')
    .option('--yes', 'Skip confirmation')
    .action(async (id: string, options: { yes?: boolean }) => {
      if (!options.yes) {
        const confirmed = await confirm({ message: `Delete collection #${id}?` })
        if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
      }
      const client = await getClient()
      const format = getFormat(program)
      await withSpinner('Deleting collection', () => client.collections.delete(Number(id)), format)
      console.log(chalk.green(` Collection #${id} deleted`))
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
