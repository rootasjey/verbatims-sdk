import { describe, expect, it } from 'vitest'
import { VerbatimsClient } from '../client'

const apiKey = process.env.VERBATIMS_PROD_READ_KEY

describe.skipIf(!apiKey)('Verbatims production GET-only smoke tests', () => {
  const client = new VerbatimsClient(apiKey!, {
    baseUrl: 'https://verbatims.cc/api/v1',
    retry: { maxRetries: 0, baseDelayMs: 0 },
  })

  it('reads a page of quotes', async () => {
    const response = await client.get('/quotes', { params: { limit: 1 } })
    expect(response.success).toBe(true)
    expect(response.data).toEqual(expect.any(Array))
  })

  it('reads a page of authors', async () => {
    const response = await client.get('/authors', { params: { limit: 1 } })
    expect(response.success).toBe(true)
    expect(response.data).toEqual(expect.any(Array))
  })

  it('reads a page of references', async () => {
    const response = await client.get('/references', { params: { limit: 1 } })
    expect(response.success).toBe(true)
    expect(response.data).toEqual(expect.any(Array))
  })
})
