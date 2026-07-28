import type { Command } from 'commander'
import { text, isCancel, cancel } from '@clack/prompts'
import chalk from 'chalk'
import { getClient } from '../utils/client.js'
import { output, type Format } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'
import { browse } from '../utils/browse.js'

function getFormat(program: Command): Format {
  return (program.opts().format ?? 'table') as Format
}

export function registerReferencesCommand(program: Command) {
  const refs = program.command('references').description('Manage references')

  refs
    .command('list')
    .description('List references')
    .option('--type <type>', 'Filter by type')
    .option('--search <q>', 'Search references')
    .option('--limit <n>', 'Number of results', '20')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, pagination } = await withSpinner('Fetching references', () =>
        client.references.list({ type: options.type, search: options.search, limit: Number(options.limit) }),
        format,
      )
      output(data, format)
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })

  refs
    .command('get <id>')
    .description('Get a reference by ID')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching reference', () => client.references.get(Number(id)), format)
      output(data, format)
    })

  refs
    .command('create')
    .description('Create a reference')
    .option('--name <name>', 'Reference name')
    .option('--type <type>', 'Primary type')
    .option('--description <text>', 'Description')
    .option('--language <lang>', 'Original language')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const name = options.name ?? await text({ message: 'Reference name', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(name)) cancel('Cancelled')

      const primaryType = options.type ?? await text({ message: 'Primary type' })
      if (isCancel(primaryType)) cancel('Cancelled')

      const { data } = await withSpinner('Creating reference', () =>
        client.references.create({ name: name as string, type: primaryType as string, primary_type: primaryType as string, description: options.description ?? null, language: options.language, original_language: options.language }),
        format,
      )
      console.log(chalk.green(' Reference created'))
      output(data, format)
    })

  refs
    .command('update <id>')
    .description('Update a reference')
    .option('--name <name>', 'Reference name')
    .option('--description <text>', 'Description')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const data_: Record<string, unknown> = {}
      if (options.name) { data_.name = options.name }
      if (options.description !== undefined) data_.description = options.description

      const { data } = await withSpinner('Updating reference', () => client.references.update(Number(id), data_ as any), format)
      console.log(chalk.green(' Reference updated'))
      output(data, format)
    })

  refs
    .command('delete <id>')
    .description('Delete a reference')
    .option('--strategy <strategy>', 'Strategy if quotes exist: delete or anonymize')
    .option('--yes', 'Skip confirmation')
    .action(async (id: string, options: Record<string, string>) => {
      if (!options.yes) {
        const { confirm } = await import('@clack/prompts')
        const confirmed = await confirm({ message: `Delete reference #${id}?` })
        if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
      }

      const client = await getClient()
      await withSpinner('Deleting reference', () => client.references.delete(Number(id), options.strategy as 'delete' | 'anonymize' | undefined))
      console.log(chalk.green(` Reference #${id} deleted`))
    })

  refs
    .command('browse')
    .description('Browse references interactively')
    .option('--type <type>', 'Filter by type')
    .option('--search <q>', 'Search references')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      await browse(
        (page) => client.references.list({ page, type: options.type, search: options.search }),
        format,
      )
    })
}
