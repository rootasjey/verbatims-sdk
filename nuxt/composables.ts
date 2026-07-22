import { VerbatimsClient } from '../src/index'
import type { ListQuotesParams, SearchParams } from '../src/types'

let _client: VerbatimsClient | null = null

export function useVerbatimsClient(): VerbatimsClient {
  if (_client) return _client

  const config = useRuntimeConfig()
  const apiKey = config.verbatimsApiKey as string
  const baseUrl = (config.public as Record<string, unknown>)?.verbatimsApiBaseUrl as string ?? '/api/v1'

  _client = new VerbatimsClient(apiKey, { baseUrl })
  return _client
}

export async function useQuotes(filters?: ListQuotesParams) {
  const client = useVerbatimsClient()
  return client.quotes.list(filters)
}

export async function useSearchQuotes(params: SearchParams) {
  const client = useVerbatimsClient()
  return client.search.query(params)
}

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    _client = null
  })
}
