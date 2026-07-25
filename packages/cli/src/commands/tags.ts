import type { Command } from 'commander'
import { getClient } from '../utils/client.js'
import { output } from '../utils/format.js'
import { withSpinner } from '../utils/spinner.js'

export function registerTagsCommand(program: Command) {
  program
    .command('tags')
    .description('Manage tags')
    .command('list')
    .description('List tags')
    .action(async () => {
      const client = await getClient()
      const format = (program.opts().format ?? 'table') as 'table' | 'json' | 'plain'
      const { data } = await withSpinner('Fetching tags', () => client.tags.list(), format)
      output(data, format)
    })
}
