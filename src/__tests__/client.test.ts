import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VerbatimsClient } from '../client'
import {
  VerbatimsError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  AuthError,
  ForbiddenError,
} from '../errors'

function mockResponse(data: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

const BASE_URL = 'http://localhost:8080/api/v1'

describe('VerbatimsClient', () => {
  let fetchFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchFn = vi.fn()
  })

  function createClient(opts?: Partial<ConstructorParameters<typeof VerbatimsClient>[1]>) {
    return new VerbatimsClient('vbt_test_key', {
      baseUrl: BASE_URL,
      retry: { maxRetries: 1, baseDelayMs: 5 },
      ...opts,
      fetch: fetchFn,
    })
  }

  describe('GET', () => {
    it('sends GET request with Bearer auth', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      await createClient().get('/test')

      expect(fetchFn).toHaveBeenCalledTimes(1)
      const [url, opts] = fetchFn.mock.calls[0]
      expect(url).toContain('/api/v1/test')
      expect(opts.method).toBe('GET')
      expect(opts.headers['Authorization']).toBe('Bearer vbt_test_key')
    })

    it('appends query parameters', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      await createClient().get('/quotes', { params: { page: 1, limit: 10, language: 'fr' } })

      const [url] = fetchFn.mock.calls[0]
      const parsed = new URL(url, 'http://localhost')
      expect(parsed.searchParams.get('page')).toBe('1')
      expect(parsed.searchParams.get('limit')).toBe('10')
      expect(parsed.searchParams.get('language')).toBe('fr')
    })

    it('skips undefined and null params', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      await createClient().get('/test', { params: { page: 1, limit: undefined, search: null } })

      const [url] = fetchFn.mock.calls[0]
      const parsed = new URL(url, 'http://localhost')
      expect(parsed.searchParams.get('page')).toBe('1')
      expect(parsed.searchParams.has('limit')).toBe(false)
      expect(parsed.searchParams.has('search')).toBe(false)
    })
  })

  describe('POST', () => {
    it('sends POST with JSON body and Content-Type', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      const body = { name: 'Test', author_id: 1 }
      await createClient().post('/quotes', body)

      const [url, opts] = fetchFn.mock.calls[0]
      expect(url).toContain('/api/v1/quotes')
      expect(opts.method).toBe('POST')
      expect(JSON.parse(opts.body)).toEqual(body)
      expect(opts.headers['Content-Type']).toBe('application/json')
    })

    it('omits Content-Type when body is empty', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      await createClient().post('/test', undefined)

      const [, opts] = fetchFn.mock.calls[0]
      expect(opts.headers['Content-Type']).toBeUndefined()
    })
  })

  describe('PUT', () => {
    it('sends PUT with JSON body', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      await createClient().put('/quotes/1', { name: 'Updated' })

      const [, opts] = fetchFn.mock.calls[0]
      expect(opts.method).toBe('PUT')
      expect(JSON.parse(opts.body)).toEqual({ name: 'Updated' })
    })
  })

  describe('DELETE', () => {
    it('sends DELETE without body', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      await createClient().delete('/quotes/1')

      const [, opts] = fetchFn.mock.calls[0]
      expect(opts.method).toBe('DELETE')
      expect(opts.body).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('throws ValidationError on 400', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: false, message: 'Bad request', errors: ['invalid'] }, 400))
      await expect(createClient().get('/test')).rejects.toThrow(ValidationError)
    })

    it('throws AuthError on 401', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: false }, 401))
      await expect(createClient().get('/test')).rejects.toThrow(AuthError)
    })

    it('throws ForbiddenError on 403', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: false }, 403))
      await expect(createClient().get('/test')).rejects.toThrow(ForbiddenError)
    })

    it('throws NotFoundError on 404', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: false, message: 'Not found' }, 404))
      await expect(createClient().get('/test')).rejects.toThrow(NotFoundError)
    })

    it('throws RateLimitError on 429 with headers', async () => {
      const now = Math.floor(Date.now() / 1000)
      fetchFn.mockResolvedValue(
        mockResponse({ success: false, message: 'Rate limited' }, 429, {
          'x-ratelimit-limit': '100',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(now + 30),
        }),
      )
      await expect(createClient({ retry: { maxRetries: 0, baseDelayMs: 5 } }).get('/test')).rejects.toThrow(RateLimitError)
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('throws VerbatimsError on unexpected status', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: false, message: 'Server error' }, 500))
      await expect(createClient().get('/test')).rejects.toThrow(VerbatimsError)
    })

    it('throws VerbatimsError on invalid JSON response', async () => {
      fetchFn.mockResolvedValue(new Response('not json', { status: 200 }))
      await expect(createClient().get('/test')).rejects.toThrow(VerbatimsError)
    })

    it('sets error message from response body', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: false, message: 'Custom error' }, 400))
      await expect(createClient().get('/test')).rejects.toMatchObject({
        message: 'Custom error',
      })
    })
  })

  describe('retry logic', () => {
    it('retries GET on network error', async () => {
      fetchFn
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce(mockResponse({ success: true }))

      await createClient({ retry: { maxRetries: 1, baseDelayMs: 5 } }).get('/test')
      expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('retries POST once on network error (maxRetries capped at 1 for non-GET)', async () => {
      fetchFn
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))

      await expect(
        createClient({ retry: { maxRetries: 3, baseDelayMs: 5 } }).post('/test', {}),
      ).rejects.toThrow()

      expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('retries PUT once on network error', async () => {
      fetchFn
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))

      await expect(createClient().put('/test', {})).rejects.toThrow()
      expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('retries DELETE once on network error', async () => {
      fetchFn
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))

      await expect(createClient().delete('/test')).rejects.toThrow()
      expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('retries on 429 and succeeds', async () => {
      const now = Math.floor(Date.now() / 1000)
      fetchFn
        .mockResolvedValueOnce(
          mockResponse({ success: false, message: 'Rate limited' }, 429, {
            'x-ratelimit-limit': '100',
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': String(now + 1),
          }),
        )
        .mockResolvedValueOnce(mockResponse({ success: true }))

      await createClient({ retry: { maxRetries: 1, baseDelayMs: 5 } }).get('/test')
      expect(fetchFn).toHaveBeenCalledTimes(2)
    })

    it('stops retrying after max retries exhausted', async () => {
      fetchFn.mockRejectedValue(new Error('network error'))

      await expect(
        createClient({ retry: { maxRetries: 2, baseDelayMs: 5 } }).get('/test'),
      ).rejects.toThrow()

      expect(fetchFn).toHaveBeenCalledTimes(3)
    })

    it('does not retry non-retryable VerbatimsError', async () => {
      fetchFn
        .mockResolvedValueOnce(mockResponse({ success: false }, 403))
        .mockResolvedValueOnce(mockResponse({ success: true }))

      await expect(createClient().get('/test')).rejects.toThrow(ForbiddenError)
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('custom fetch injection', () => {
    it('uses injected fetch function', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      const client = new VerbatimsClient('key', { fetch: fetchFn })
      await client.get('/test')
      expect(fetchFn).toHaveBeenCalled()
    })
  })

  describe('baseUrl', () => {
    it('defaults to /api/v1', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      const client = new VerbatimsClient('key', { fetch: fetchFn })
      await client.get('/quotes')
      const [url] = fetchFn.mock.calls[0]
      expect(url).toContain('/api/v1/quotes')
    })

    it('uses custom baseUrl', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      const client = new VerbatimsClient('key', { baseUrl: '/custom', fetch: fetchFn })
      await client.get('/quotes')
      const [url] = fetchFn.mock.calls[0]
      expect(url).toContain('/custom/quotes')
    })
  })

  describe('timeout', () => {
    it('throws on timeout', async () => {
      fetchFn.mockImplementation((_url: string, opts?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          if (opts?.signal) {
            ;(opts.signal as AbortSignal).addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted', 'AbortError'))
            })
          }
        })
      })
      const client = new VerbatimsClient('key', {
        fetch: fetchFn,
        baseUrl: BASE_URL,
        timeout: 50,
        retry: { maxRetries: 0, baseDelayMs: 5 },
      })
      await expect(client.get('/test')).rejects.toThrow()
    })
  })

  describe('schema validation', () => {
    it('throws VerbatimsError when Zod schema rejects data', async () => {
      fetchFn.mockResolvedValue(
        mockResponse({ success: true, data: { id: 'not-a-number' } }),
      )

      const { z } = await import('zod/v4')
      const schema = z.object({ success: z.literal(true), data: z.object({ id: z.number() }) })

      await expect(createClient().get('/test', {}, schema)).rejects.toThrow()
    })
  })
})
