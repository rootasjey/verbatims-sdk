import type { Command } from 'commander'
import { text, isCancel, cancel, confirm, select } from '@clack/prompts'
import chalk from 'chalk'
import { getClient } from '../utils/client.js'
import { output, type Format } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'
import { browse } from '../utils/browse.js'

function getFormat(program: Command): Format {
  return (program.opts().format ?? 'table') as Format
}

export function registerQuotesCommand(program: Command) {
  const quotes = program.command('quotes').description('Manage quotes')

  quotes
    .command('list')
    .description('List quotes')
    .option('--language <lang>', 'Filter by language')
    .option('--limit <n>', 'Number of results', '20')
    .option('--author <id>', 'Filter by author ID')
    .option('--tag <name>', 'Filter by tag')
    .option('--search <q>', 'Search in quote text')
    .option('--status <status>', 'Filter by status (draft|pending|approved|rejected)')
    .option('--sort-by <field>', 'Sort field')
    .option('--sort-order <order>', 'Sort order (asc|desc)')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const { data, pagination } = await withSpinner('Fetching quotes', () =>
        client.quotes.list({
          language: options.language,
          limit: Number(options.limit),
          author_id: options.author ? Number(options.author) : undefined,
          tag: options.tag,
          search: options.search,
          q: options.search,
          status: options.status as any,
          sort_by: options.sortBy,
          sort_order: options.sortOrder as 'asc' | 'desc',
        }),
        format,
      )

      if (data) output(data, format)
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })

  quotes
    .command('get <id>')
    .description('Get a quote by ID')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching quote', () => client.quotes.get(Number(id)), format)
      output(data, format)
    })

  quotes
    .command('create')
    .description('Create a quote')
    .option('--name <text>', 'Quote text')
    .option('--language <lang>', 'Language')
    .option('--author-id <id>', 'Author ID')
    .option('--reference-id <id>', 'Reference ID')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const name = options.name ?? await text({ message: 'Quote text', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(name)) cancel('Cancelled')

      const language = options.language ?? await text({ message: 'Language', initialValue: 'fr' })
      if (isCancel(language)) cancel('Cancelled')

      const authorId = options.authorId ? Number(options.authorId) : undefined
      const referenceId = options.referenceId ? Number(options.referenceId) : undefined

      const { data } = await withSpinner('Creating quote', () =>
        client.quotes.create({ content: name as string, name: name as string, language: language as string, author_id: authorId, reference_id: referenceId }),
        format,
      )
      console.log(chalk.green(' Quote created'))
      output(data, format)
    })

  quotes
    .command('update <id>')
    .description('Update a quote')
    .option('--name <text>', 'Quote text')
    .option('--language <lang>', 'Language')
    .option('--author-id <id>', 'Author ID')
    .option('--reference-id <id>', 'Reference ID')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const data_: Record<string, unknown> = {}
      if (options.name) { data_.name = options.name; data_.content = options.name }
      if (options.language) data_.language = options.language
      if (options.authorId !== undefined) data_.author_id = options.authorId === 'null' ? null : Number(options.authorId)
      if (options.referenceId !== undefined) data_.reference_id = options.referenceId === 'null' ? null : Number(options.referenceId)

      const { data } = await withSpinner('Updating quote', () => client.quotes.update(Number(id), data_ as any), format)
      console.log(chalk.green(' Quote updated'))
      output(data, format)
    })

  quotes
    .command('delete <id>')
    .description('Delete a quote')
    .option('--yes', 'Skip confirmation')
    .action(async (id: string, options: Record<string, unknown>) => {
      if (!options.yes) {
        const confirmed = await confirm({ message: `Delete quote #${id}?` })
        if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
      }

      const client = await getClient()
      await withSpinner('Deleting quote', () => client.quotes.delete(Number(id)))
      console.log(chalk.green(` Quote #${id} deleted`))
    })

  quotes
    .command('submit <id>')
    .description('Submit a draft quote for review (draft → pending)')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Submitting quote', () => client.quotes.submit(Number(id)), format)
      console.log(chalk.green(' Quote submitted for review'))
      output(data, format)
    })

  quotes
    .command('moderate <id>')
    .description('Moderate a pending quote (pending → approved|rejected)')
    .option('--action <action>', 'Action to take: approve or reject')
    .option('--reason <reason>', 'Rejection reason (required when rejecting)')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const action = options.action ?? await select({
        message: 'Action',
        options: [
          { value: 'approve', label: 'Approve' },
          { value: 'reject', label: 'Reject' },
        ],
      })
      if (isCancel(action)) cancel('Cancelled')

      let rejection_reason: string | undefined | null
      if (action === 'reject') {
        rejection_reason = options.reason ?? await text({ message: 'Rejection reason' }) as string
        if (isCancel(rejection_reason)) cancel('Cancelled')
      }

      const { data } = await withSpinner('Moderating quote', () =>
        client.quotes.moderate(Number(id), { action: action as 'approve' | 'reject', rejection_reason }),
        format,
      )
      console.log(chalk.green(` Quote ${action === 'approve' ? 'approved' : 'rejected'}`))
      output(data, format)
    })

  quotes
    .command('browse')
    .description('Browse quotes interactively')
    .option('--language <lang>', 'Filter by language')
    .option('--author <id>', 'Filter by author ID')
    .option('--tag <name>', 'Filter by tag')
    .option('--search <q>', 'Search in quote text')
    .option('--status <status>', 'Filter by status (draft|pending|approved|rejected)')
    .option('--sort-by <field>', 'Sort field')
    .option('--sort-order <order>', 'Sort order (asc|desc)')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      await browse(
        (page) => client.quotes.list({
          page,
          language: options.language,
          author_id: options.author ? Number(options.author) : undefined,
          tag: options.tag,
          search: options.search,
          q: options.search,
          status: options.status as any,
          sort_by: options.sortBy,
          sort_order: options.sortOrder as 'asc' | 'desc',
        }),
        format,
      )
    })
}
