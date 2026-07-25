import { VerbatimsClient } from '@verbatims/sdk'
import { loadConfig } from './config.js'

const DEFAULT_BASE_URL = 'https://verbatims.cc/api/v1'

export async function getClient(): Promise<VerbatimsClient> {
  const config = await loadConfig()
  const apiKey = process.env.VERBATIMS_API_KEY ?? config.apiKey

  if (!apiKey) {
    console.error('Missing API key. Set VERBATIMS_API_KEY env var or run `verbatims config init`.')
    process.exit(1)
  }

  return new VerbatimsClient(apiKey, {
    baseUrl: process.env.VERBATIMS_BASE_URL ?? config.baseUrl ?? DEFAULT_BASE_URL,
  })
}
