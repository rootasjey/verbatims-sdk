import type { Command } from 'commander'
import { intro, outro, text, isCancel, cancel } from '@clack/prompts'
import chalk from 'chalk'
import { loadConfig, saveConfig, getConfigPath } from '../utils/config.js'

export function registerConfigCommand(program: Command) {
  program
    .command('config')
    .description('Manage configuration')
    .alias('cfg')
    .option('--api-key <key>', 'Set API key')
    .option('--base-url <url>', 'Set base URL')
    .option('--show', 'Show current config')
    .action(async (options: Record<string, unknown>) => {
      if (options.show) {
        const config = await loadConfig()
        const key = config.apiKey
          ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
          : chalk.dim('not set')
        console.log(`API key : ${key}`)
        console.log(`Base URL: ${config.baseUrl ?? chalk.dim('default')}`)
        console.log(`Config  : ${getConfigPath()}`)
        return
      }

      const flags: Record<string, string> = {}
      if (options.apiKey) flags.apiKey = options.apiKey as string
      if (options.baseUrl) flags.baseUrl = options.baseUrl as string

      if (Object.keys(flags).length > 0) {
        const existing = await loadConfig()
        await saveConfig({ ...existing, ...flags })
        console.log(chalk.green('✓ Config updated'))
        return
      }

      intro(chalk.bold('Verbatims Config'))

      const existing = await loadConfig()

      const apiKey = await text({
        message: 'API key',
        placeholder: 'vbt_xxx...',
        defaultValue: existing.apiKey ?? '',
      })
      if (isCancel(apiKey)) cancel('Cancelled')

      const baseUrl = await text({
        message: 'Base URL (optional)',
        placeholder: 'https://api.verbatims.com/v1',
        defaultValue: existing.baseUrl ?? '',
      })
      if (isCancel(baseUrl)) cancel('Cancelled')

      await saveConfig({
        apiKey: apiKey as string,
        baseUrl: (baseUrl as string) || undefined,
      })

      outro(chalk.green('Config saved'))
    })
}
