import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const CONFIG_DIR = join(homedir(), '.config', 'verbatims')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')

export interface Config {
  apiKey?: string
  baseUrl?: string
}

export function getConfigPath(): string {
  return CONFIG_PATH
}

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(CONFIG_PATH, 'utf-8')
    return JSON.parse(raw) as Config
  } catch {
    return {}
  }
}

export async function saveConfig(config: Config): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true })
  }
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}
