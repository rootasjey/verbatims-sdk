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
    .option('--reference <id>', 'Filter by reference ID')
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
          reference_id: options.reference ? Number(options.reference) : undefined,
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
    .option('--source-type <type>', 'Source type')
    .option('--source-url <url>', 'Source URL')
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
        client.quotes.create({ content: name as string, name: name as string, language: language as string, author_id: authorId, reference_id: referenceId, source_type: options.sourceType, source_url: options.sourceUrl }),
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
    .option('--source-type <type>', 'Source type')
    .option('--source-url <url>', 'Source URL')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const data_: Record<string, unknown> = {}
      if (options.name) { data_.name = options.name; data_.content = options.name }
      if (options.language) data_.language = options.language
      if (options.authorId !== undefined) data_.author_id = options.authorId === 'null' ? null : Number(options.authorId)
      if (options.referenceId !== undefined) data_.reference_id = options.referenceId === 'null' ? null : Number(options.referenceId)
      if (options.sourceType !== undefined) data_.source_type = options.sourceType
      if (options.sourceUrl !== undefined) data_.source_url = options.sourceUrl

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
    .option('--reference <id>', 'Filter by reference ID')
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
          reference_id: options.reference ? Number(options.reference) : undefined,
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

  quotes
    .command('attributions <action> <quoteId> [attributionId]')
    .description('Manage quote attributions (moderator/admin API key required)')
    .option('--author-id <id>', 'Author ID')
    .option('--reference-id <id>', 'Reference ID')
    .option('--status <status>', 'Verification status')
    .option('--notes <text>', 'Internal notes')
    .option('--primary', 'Set as primary attribution')
    .option('--yes', 'Skip confirmation')
    .action(async (action: string, quoteId: string, attributionId: string | undefined, options: Record<string, any>) => {
      const client = await getClient()
      const format = getFormat(program)
      const id = Number(quoteId)

      if (action === 'list') {
        const { data } = await withSpinner('Fetching attributions', () => client.quotes.listAttributions(id), format)
        output(data, format)
        return
      }
      if (action === 'create') {
        const { data } = await withSpinner('Creating attribution', () => client.quotes.createAttribution(id, {
          author_id: options.authorId ? Number(options.authorId) : null,
          reference_id: options.referenceId ? Number(options.referenceId) : null,
          status: options.status,
          notes: options.notes,
          is_primary: options.primary,
        }), format)
        output(data, format)
        return
      }
      if (!attributionId) throw new Error('Attribution ID is required')
      const attribution = Number(attributionId)
      if (action === 'update') {
        const data_: Record<string, unknown> = {}
        if (options.authorId !== undefined) data_.author_id = Number(options.authorId)
        if (options.referenceId !== undefined) data_.reference_id = Number(options.referenceId)
        if (options.status !== undefined) data_.status = options.status
        if (options.notes !== undefined) data_.notes = options.notes
        if (options.primary !== undefined) data_.is_primary = options.primary
        const { data } = await withSpinner('Updating attribution', () => client.quotes.updateAttribution(id, attribution, data_), format)
        output(data, format)
        return
      }
      if (action === 'delete') {
        if (!options.yes) {
          const confirmed = await confirm({ message: `Delete attribution #${attribution} from quote #${id}?` })
          if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
        }
        await withSpinner('Deleting attribution', () => client.quotes.deleteAttribution(id, attribution), format)
        console.log(chalk.green(' Attribution deleted'))
        return
      }
      throw new Error('Action must be list, create, update, or delete')
    })

  quotes
    .command('sources <action> <quoteId> [sourceId]')
    .description('Manage quote sources (moderator/admin API key required)')
    .option('--attribution-id <id>', 'Attribution ID')
    .option('--source-type <type>', 'Source type')
    .option('--source-url <url>', 'Source URL')
    .option('--label <label>', 'Source label')
    .option('--status <status>', 'Verification status')
    .option('--notes <text>', 'Internal notes')
    .option('--primary', 'Set as primary source')
    .option('--yes', 'Skip confirmation')
    .action(async (action: string, quoteId: string, sourceId: string | undefined, options: Record<string, any>) => {
      const client = await getClient()
      const format = getFormat(program)
      const id = Number(quoteId)

      if (action === 'list') {
        const { data } = await withSpinner('Fetching sources', () => client.quotes.listSources(id), format)
        output(data, format)
        return
      }
      if (action === 'create') {
        if (!options.sourceType) throw new Error('--source-type is required')
        const { data } = await withSpinner('Creating source', () => client.quotes.createSource(id, {
          attribution_id: options.attributionId ? Number(options.attributionId) : null,
          source_type: options.sourceType,
          source_url: options.sourceUrl,
          label: options.label,
          verification_status: options.status,
          notes: options.notes,
          is_primary: options.primary,
        }), format)
        output(data, format)
        return
      }
      if (!sourceId) throw new Error('Source ID is required')
      const source = Number(sourceId)
      if (action === 'update') {
        const data_: Record<string, unknown> = {}
        if (options.attributionId !== undefined) data_.attribution_id = Number(options.attributionId)
        if (options.sourceType !== undefined) data_.source_type = options.sourceType
        if (options.sourceUrl !== undefined) data_.source_url = options.sourceUrl
        if (options.label !== undefined) data_.label = options.label
        if (options.status !== undefined) data_.verification_status = options.status
        if (options.notes !== undefined) data_.notes = options.notes
        if (options.primary !== undefined) data_.is_primary = options.primary
        const { data } = await withSpinner('Updating source', () => client.quotes.updateSource(id, source, data_), format)
        output(data, format)
        return
      }
      if (action === 'delete') {
        if (!options.yes) {
          const confirmed = await confirm({ message: `Delete source #${source} from quote #${id}?` })
          if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
        }
        await withSpinner('Deleting source', () => client.quotes.deleteSource(id, source), format)
        console.log(chalk.green(' Source deleted'))
        return
      }
      throw new Error('Action must be list, create, update, or delete')
    })

  const tags = quotes.command('tags').description('Manage quote tags')

  tags
    .command('list <id>')
    .description('List tags for a quote')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching tags', () => client.quotes.listTags(Number(id)), format)
      output(data, format)
    })

  tags
    .command('add <id>')
    .description('Add a tag to a quote (by tag ID or name)')
    .option('--tag-id <n>', 'Existing tag ID')
    .option('--name <name>', 'Tag name (creates new tag if admin)')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const tagId = options.tagId ? Number(options.tagId) : undefined
      const name = options.name || undefined

      if (!tagId && !name) {
        console.log(chalk.red(' Provide --tag-id or --name'))
        process.exit(1)
      }

      const { data } = await withSpinner('Adding tag', () =>
        client.quotes.addTag(Number(id), { tagId, name }),
        format,
      )
      console.log(chalk.green(' Tag added'))
      output(data, format)
    })

  tags
    .command('remove <id> <tagId>')
    .description('Remove a tag from a quote')
    .action(async (id: string, tagId: string) => {
      const confirmed = await confirm({ message: `Remove tag #${tagId} from quote #${id}?` })
      if (isCancel(confirmed) || !confirmed) cancel('Cancelled')

      const client = await getClient()
      await withSpinner('Removing tag', () => client.quotes.removeTag(Number(id), Number(tagId)))
      console.log(chalk.green(` Tag #${tagId} removed`))
    })
}
