import type { Command } from 'commander'
import { text, isCancel, cancel, confirm, select } from '@clack/prompts'
import chalk from 'chalk'
import { getClient } from '../utils/client.js'
import { output, type Format } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'

function getFormat(program: Command): Format {
  return (program.opts().format ?? 'table') as Format
}

const PLATFORM_CHOICES = ['x', 'bluesky', 'instagram', 'threads', 'facebook', 'pinterest']

export function registerSocialCommand(program: Command) {
  const social = program.command('social').description('Manage the social auto-post queue')

  social
    .command('platforms')
    .description('List social platforms with their queue stats')
    .action(async () => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching platforms', () => client.social.listPlatforms(), format)
      output(data, format)
    })

  social
    .command('posts')
    .description('List published social posts (audit trail)')
    .option('--platform <platform>', 'Filter by platform')
    .option('--status <status>', 'Filter by status (success|failed)')
    .option('--limit <n>', 'Number of results', '20')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, pagination } = await withSpinner('Fetching posts', () =>
        client.social.listPosts({
          platform: options.platform as any,
          status: options.status as any,
          limit: Number(options.limit),
        }),
        format,
      )
      if (data) output(data.posts, format)
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })

  const queue = social.command('queue').description('Manage the social queue')

  queue
    .command('list')
    .description('List the social queue for a platform')
    .option('--platform <platform>', 'Platform (default: x)')
    .option('--status <status>', 'Filter by status (queued|processing|posted|failed|active)')
    .option('--search <q>', 'Search by quote text, author, reference, or source')
    .option('--limit <n>', 'Number of results', '20')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, pagination } = await withSpinner('Fetching queue', () =>
        client.social.listQueue({
          platform: options.platform as any,
          status: options.status as any,
          search: options.search,
          limit: Number(options.limit),
        }),
        format,
      )
      if (data) {
        if (format !== 'json') {
          const stats = data.stats
          console.log(chalk.dim(
            `Queued: ${stats.queued} · Processing: ${stats.processing} · Posted: ${stats.posted} · Failed: ${stats.failed}`,
          ))
        }
        output(data.queue, format)
      }
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })

  queue
    .command('get <id>')
    .description('Get a single queue item')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching queue item', () => client.social.getQueueItem(Number(id)), format)
      output(data, format)
    })

  queue
    .command('add <ids...>')
    .description('Add approved quotes to the queue')
    .option('--platform <platform>', 'Platform (default: x)')
    .option('--scheduled-for <iso>', 'Optional future publish time (ISO 8601)')
    .action(async (ids: string[], options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const quoteIds = ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)
      if (!quoteIds.length) {
        console.log(chalk.red(' Provide at least one quote ID'))
        process.exit(1)
      }

      const { data, count } = await withSpinner('Adding quotes to queue', () =>
        client.social.addToQueue({
          quote_ids: quoteIds,
          platform: options.platform as any,
          scheduled_for: options.scheduledFor || null,
        }),
        format,
      )
      console.log(chalk.green(` ${count ?? data?.length ?? 0} quote(s) queued`))
      output(data, format)
    })

  queue
    .command('random')
    .description('Enqueue N random approved quotes')
    .option('--platform <platform>', 'Platform (default: x)')
    .option('--count <n>', 'Number of quotes (default: 5, max 100)', '5')
    .option('--language <lang>', 'Filter by quote language')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, count } = await withSpinner('Enqueueing random quotes', () =>
        client.social.addRandomToQueue({
          platform: options.platform as any,
          count: Number(options.count),
          language: options.language,
        }),
        format,
      )
      console.log(chalk.green(` ${count ?? data?.length ?? 0} quote(s) queued`))
      output(data, format)
    })

  queue
    .command('remove <id>')
    .description('Remove a queue item')
    .option('--yes', 'Skip confirmation')
    .action(async (id: string, options: Record<string, unknown>) => {
      if (!options.yes) {
        const confirmed = await confirm({ message: `Remove queue item #${id}?` })
        if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
      }

      const client = await getClient()
      await withSpinner('Removing queue item', () => client.social.removeQueueItem(Number(id)))
      console.log(chalk.green(` Queue item #${id} removed`))
    })

  queue
    .command('requeue <id>')
    .description('Reset a failed queue item back to queued')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Requeueing item', () => client.social.requeueQueueItem(Number(id)), format)
      console.log(chalk.green(` Queue item #${id} requeued`))
      output(data, format)
    })

  queue
    .command('reorder <id>')
    .description('Reorder a queued item (relative to another item or up/down)')
    .option('--direction <dir>', 'Move direction (up|down)')
    .option('--before <id>', 'Place before this queue item ID (or "end" to move to the end)')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      let beforeId: number | null | undefined
      if (options.before !== undefined) {
        beforeId = options.before === 'end' ? null : Number(options.before)
      }

      const direction = (options.direction ?? '') as 'up' | 'down' | ''
      if (beforeId === undefined && direction !== 'up' && direction !== 'down') {
        console.log(chalk.red(' Provide --direction up|down or --before <id>'))
        process.exit(1)
      }

      const { data } = await withSpinner('Reordering queue item', () =>
        client.social.reorderQueueItem({
          id: Number(id),
          direction: direction || undefined,
          before_id: beforeId,
        }),
        format,
      )
      if (!data?.moved) {
        console.log(chalk.dim(' Item did not move'))
        return
      }
      console.log(chalk.green(` Queue item #${id} moved to position ${data.position}`))
    })

  queue
    .command('clear')
    .description('Clear the queue for a platform')
    .option('--platform <platform>', 'Platform', 'x')
    .option('--scope <scope>', 'Scope: all or finished (posted/failed)', 'all')
    .option('--yes', 'Skip confirmation')
    .action(async (options: Record<string, string>) => {
      const platform = options.platform ?? await select({
        message: 'Platform',
        options: PLATFORM_CHOICES.map((p) => ({ value: p, label: p })),
      })
      if (isCancel(platform)) cancel('Cancelled')

      const scope = (options.scope ?? 'all') as 'all' | 'finished'
      const label = scope === 'finished' ? 'finished items (posted/failed)' : 'entire queue'

      if (!options.yes) {
        const confirmed = await confirm({ message: `Clear the ${label} for ${String(platform)}? This cannot be undone.` })
        if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
      }

      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Clearing queue', () =>
        client.social.clearQueue({ platform: platform as string as any, confirm: true, scope }),
        format,
      )
      console.log(chalk.green(` ${data?.deletedCount ?? 0} item(s) cleared from ${data?.platform ?? String(platform)}`))
      output(data, format)
    })

  queue
    .command('run-now')
    .description('Immediately run the social autopost (throttled to 1 per minute)')
    .option('--platform <platform>', 'Target platform (all enabled if omitted)')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Running autopost', () =>
        client.social.runNow({ platform: options.platform as any }),
        format,
      )
      output(data, format)
    })
}
