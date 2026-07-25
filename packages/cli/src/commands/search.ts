import type { Command } from 'commander'
import chalk from 'chalk'
import { getClient } from '../utils/client.js'
import { output, type Format } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'

function getFormat(program: Command): Format {
  return (program.opts().format ?? 'table') as Format
}

export function registerSearchCommand(program: Command) {
  program
    .command('search <query>')
    .description('Search quotes, authors, or references')
    .option('--type <type>', 'Type to search: quotes|authors|references', 'quotes')
    .option('--limit <n>', 'Number of results', '20')
    .action(async (query: string, options: Record<string, string>) => {
      const client = await getClient()
      const format = getFormat(program)
      const { data, pagination } = await withSpinner('Searching', () =>
        client.search.query({ q: query, type: options.type as 'quotes' | 'authors' | 'references', limit: Number(options.limit) }),
        format,
      )
      output(data, format)
      if (pagination && format !== 'json') {
        console.log(chalk.dim(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`))
      }
    })
}
