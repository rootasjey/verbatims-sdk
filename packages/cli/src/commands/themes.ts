import type { Command } from 'commander'
import { text, isCancel, cancel, confirm } from '@clack/prompts'
import chalk from 'chalk'
import { getClient } from '../utils/client.js'
import { output, type Format } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'

function getFormat(program: Command): Format {
  return (program.opts().format ?? 'table') as Format
}

export function registerThemesCommand(program: Command) {
  const themes = program.command('themes').description('Manage themes')

  themes
    .command('list')
    .description('List themes')
    .option('--search <q>', 'Search themes')
    .option('--sort-by <field>', 'Sort field (priority|name|slug)')
    .option('--sort-order <order>', 'Sort order (asc|desc)')
    .option('--limit <n>', 'Number of results', '20')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, pagination } = await withSpinner('Fetching themes', () =>
        client.themes.list({
          search: options.search,
          sort_by: options.sortBy as 'priority' | 'name' | 'slug' | undefined,
          sort_order: options.sortOrder as 'asc' | 'desc' | undefined,
          limit: Number(options.limit),
        }),
        format,
      )
      output(data, format)
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })

  themes
    .command('get <id>')
    .description('Get a theme by ID')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching theme', () => client.themes.get(Number(id)), format)
      output(data, format)
    })

  themes
    .command('create')
    .description('Create a theme')
    .option('--slug <slug>', 'URL-friendly slug')
    .option('--name <name>', 'Theme name')
    .option('--description <text>', 'Description')
    .option('--language <lang>', 'Language')
    .option('--active', 'Set as active')
    .option('--default', 'Set as default')
    .option('--priority <n>', 'Priority', '0')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const slug = options.slug ?? await text({ message: 'Theme slug', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(slug)) cancel('Cancelled')

      const name = options.name ?? await text({ message: 'Theme name', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(name)) cancel('Cancelled')

      const description = options.description ?? await text({ message: 'Description (optional)', initialValue: '' })
      if (isCancel(description)) cancel('Cancelled')

      const { data } = await withSpinner('Creating theme', () =>
        client.themes.create({
          slug: slug as string,
          name: name as string,
          description: (description as string) || null,
          language: options.language || null,
          is_active: options.active !== undefined ? true : undefined,
          is_default: options.default !== undefined ? true : undefined,
          priority: options.priority ? Number(options.priority) : undefined,
        }),
        format,
      )
      console.log(chalk.green(' Theme created'))
      output(data, format)
    })

  themes
    .command('update <id>')
    .description('Update a theme')
    .option('--slug <slug>', 'URL-friendly slug')
    .option('--name <name>', 'Theme name')
    .option('--description <text>', 'Description')
    .option('--language <lang>', 'Language')
    .option('--priority <n>', 'Priority')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const data_: Record<string, unknown> = {}
      if (options.slug) data_.slug = options.slug
      if (options.name) data_.name = options.name
      if (options.description !== undefined) data_.description = options.description || null
      if (options.language !== undefined) data_.language = options.language || null
      if (options.priority !== undefined) data_.priority = Number(options.priority)

      const { data } = await withSpinner('Updating theme', () => client.themes.update(Number(id), data_ as any), format)
      console.log(chalk.green(' Theme updated'))
      output(data, format)
    })

  themes
    .command('delete <id>')
    .description('Delete a theme')
    .option('--yes', 'Skip confirmation')
    .action(async (id: string, options: Record<string, unknown>) => {
      if (!options.yes) {
        const confirmed = await confirm({ message: `Delete theme #${id}?` })
        if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
      }

      const client = await getClient()
      await withSpinner('Deleting theme', () => client.themes.delete(Number(id)))
      console.log(chalk.green(` Theme #${id} deleted`))
    })

  themes
    .command('activate <id>')
    .description('Activate or deactivate a theme')
    .option('--active', 'Activate')
    .option('--inactive', 'Deactivate')
    .action(async (id: string, options: Record<string, unknown>) => {
      const active = options.active ?? !options.inactive
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Updating theme', () => client.themes.activate(Number(id), !!active), format)
      console.log(chalk.green(` Theme ${active ? 'activated' : 'deactivated'}`))
      output(data, format)
    })

  themes
    .command('default <id>')
    .description('Set or unset a theme as default')
    .option('--set', 'Set as default')
    .option('--unset', 'Unset as default')
    .action(async (id: string, options: Record<string, unknown>) => {
      const isDefault = options.set ?? !options.unset
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Updating theme', () => client.themes.setDefault(Number(id), !!isDefault), format)
      console.log(chalk.green(` Theme ${isDefault ? 'set as default' : 'unset as default'}`))
      output(data, format)
    })

  themes
    .command('active')
    .description('Get the currently active theme')
    .option('--language <lang>', 'Language')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching active theme', () =>
        client.themes.getActive({ language: options.language }),
        format,
      )
      if (!data) {
        console.log(chalk.dim('No active theme'))
        return
      }
      output(data, format)
    })

  themes
    .command('feed <slug>')
    .description('Get the curated feed for a theme')
    .option('--language <lang>', 'Language')
    .action(async (slug: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching theme feed', () =>
        client.themes.getFeed(slug, { language: options.language }),
        format,
      )
      if (!data) {
        console.log(chalk.dim('No feed data'))
        return
      }
      output(data, format)
    })

  themes
    .command('add-filter <id>')
    .description('Add a content filter to a theme')
    .option('--type <type>', 'Filter type (keyword|tag_name|author_name|reference_name|author_id|reference_id)')
    .option('--value <value>', 'Filter value')
    .option('--match-mode <mode>', 'Match mode (any|all)', 'any')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const type = options.type ?? await text({ message: 'Filter type', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(type)) cancel('Cancelled')

      const value = options.value ?? await text({ message: 'Filter value', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(value)) cancel('Cancelled')

      const { data } = await withSpinner('Adding filter', () =>
        client.themes.addFilter(Number(id), {
          type: type as string,
          value: value as string,
          match_mode: options.matchMode as 'any' | 'all' | undefined,
        }),
        format,
      )
      console.log(chalk.green(' Filter added'))
      output(data, format)
    })

  themes
    .command('remove-filter <id> <filterId>')
    .description('Remove a filter from a theme')
    .action(async (id: string, filterId: string) => {
      const confirmed = await confirm({ message: `Remove filter #${filterId} from theme #${id}?` })
      if (isCancel(confirmed) || !confirmed) cancel('Cancelled')

      const client = await getClient()
      await withSpinner('Removing filter', () => client.themes.removeFilter(Number(id), Number(filterId)))
      console.log(chalk.green(` Filter #${filterId} removed`))
    })

  themes
    .command('suggestions')
    .description('Generate theme suggestions')
    .option('--ai', 'Use AI generation')
    .option('--tags <tags>', 'Seed tags (comma-separated)')
    .option('--language <lang>', 'Language')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Generating suggestions', () =>
        client.themes.suggestions({
          ai: options.ai ? true : undefined,
          tags: options.tags,
          language: options.language,
        }),
        format,
      )
      output(data, format)
    })

  themes
    .command('filter-suggestions <q>')
    .description('Search filter values')
    .requiredOption('--type <type>', 'Filter type (tag_name|author_name|reference_name|keyword|language)')
    .action(async (q: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching suggestions', () =>
        client.themes.filterSuggestions({ q, type: options.type! }),
        format,
      )
      output(data, format)
    })

  themes
    .command('filter-recommendations')
    .description('Get filter recommendations based on existing filters')
    .option('--name <name>', 'Theme name')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Getting recommendations', () =>
        client.themes.filterRecommendations({ name: options.name }),
        format,
      )
      output(data, format)
    })

  themes
    .command('suggest-name <name>')
    .description('Generate an AI-powered theme name suggestion')
    .action(async (name: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Generating name suggestion', () =>
        client.themes.suggestName(name),
        format,
      )
      output(data, format)
    })
}
