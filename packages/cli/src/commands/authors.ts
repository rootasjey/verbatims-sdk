import type { Command } from 'commander'
import { text, isCancel, cancel } from '@clack/prompts'
import chalk from 'chalk'
import { getClient } from '../utils/client.js'
import { output, type Format } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'
import { browse } from '../utils/browse.js'
import { uploadImageFromPath } from '../utils/image.js'

function getFormat(program: Command): Format {
  return (program.opts().format ?? 'table') as Format
}

export function registerAuthorsCommand(program: Command) {
  const authors = program.command('authors').description('Manage authors')

  authors
    .command('list')
    .description('List authors')
    .option('--search <q>', 'Search authors')
    .option('--limit <n>', 'Number of results', '20')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, pagination } = await withSpinner('Fetching authors', () =>
        client.authors.list({ search: options.search, limit: Number(options.limit) }),
        format,
      )
      output(data, format)
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })

  authors
    .command('get <id>')
    .description('Get an author by ID')
    .action(async (id: string) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data } = await withSpinner('Fetching author', () => client.authors.get(Number(id)), format)
      output(data, format)
    })

  authors
    .command('create')
    .description('Create an author')
    .option('--name <name>', 'Author name')
    .option('--job <job>', 'Job title')
    .option('--description <text>', 'Description')
    .option('--image-url <url>', 'Image URL')
    .option('--image-path <path>', 'Local image file path')
    .option('--fictional', 'Mark as fictional')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const name = options.name ?? await text({ message: 'Author name', validate: (v) => !v ? 'Required' : undefined })
      if (isCancel(name)) cancel('Cancelled')

      let image_url: string | null = options.imageUrl || null
      const imagePath = options.imagePath
      if (imagePath) {
        image_url = await withSpinner('Uploading image', () => uploadImageFromPath(client, imagePath), format)
      }

      const { data } = await withSpinner('Creating author', () =>
        client.authors.create({
          name: name as string,
          job: options.job ?? null,
          description: options.description ?? null,
          image_url,
          fictional: options.fictional !== undefined ? true : undefined,
        }),
        format,
      )
      console.log(chalk.green(' Author created'))
      output(data, format)
    })

  authors
    .command('update <id>')
    .description('Update an author')
    .option('--name <name>', 'Author name')
    .option('--job <job>', 'Job title')
    .option('--description <text>', 'Description')
    .option('--image-url <url>', 'Image URL')
    .option('--image-path <path>', 'Local image file path')
    .option('--fictional', 'Mark as fictional')
    .option('--no-fictional', 'Mark as not fictional')
    .action(async (id: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)

      const data_: Record<string, unknown> = {}
      if (options.name) data_.name = options.name
      if (options.job !== undefined) data_.job = options.job || null
      if (options.description !== undefined) data_.description = options.description || null
      if (options.imageUrl !== undefined) data_.image_url = options.imageUrl || null
      const updateImagePath = options.imagePath
      if (updateImagePath !== undefined) {
        data_.image_url = await withSpinner('Uploading image', () => uploadImageFromPath(client, updateImagePath), format)
      }
      if (options.fictional !== undefined) data_.is_fictional = true
      if (options.noFictional !== undefined) data_.is_fictional = false

      const { data } = await withSpinner('Updating author', () => client.authors.update(Number(id), data_ as any), format)
      console.log(chalk.green(' Author updated'))
      output(data, format)
    })

  authors
    .command('delete <id>')
    .description('Delete an author')
    .option('--strategy <strategy>', 'Strategy if quotes exist: delete or anonymize')
    .option('--yes', 'Skip confirmation')
    .action(async (id: string, options: Record<string, string>) => {
      if (!options.yes) {
        const { confirm } = await import('@clack/prompts')
        const confirmed = await confirm({ message: `Delete author #${id}?` })
        if (isCancel(confirmed) || !confirmed) cancel('Cancelled')
      }

      const client = await getClient()
      await withSpinner('Deleting author', () => client.authors.delete(Number(id), options.strategy as 'delete' | 'anonymize' | undefined))
      console.log(chalk.green(` Author #${id} deleted`))
    })

  authors
    .command('browse')
    .description('Browse authors interactively')
    .option('--search <q>', 'Search authors')
    .action(async (options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      await browse(
        (page) => client.authors.list({ page, search: options.search }),
        format,
      )
    })
}
