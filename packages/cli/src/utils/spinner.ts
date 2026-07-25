import { spinner as clackSpinner } from '@clack/prompts'
import type { Format } from './format.js'

let silentMode = false

export function setSilent(silent: boolean) {
  silentMode = silent
}

export function isSilent(): boolean {
  return silentMode
}

export async function withSpinner<T>(label: string, fn: () => Promise<T>, format?: Format): Promise<T> {
  if (format === 'json' || silentMode) {
    return fn()
  }
  const s = clackSpinner()
  s.start(label)
  try {
    const result = await fn()
    s.stop('Done')
    return result
  } catch (err) {
    s.stop('Error')
    throw err
  }
}
