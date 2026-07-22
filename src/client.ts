import { z } from 'zod/v4'
import { errorResponseSchema, paginationMetaSchema, apiResponseSchema } from './types'
import { VerbatimsError, NotFoundError, RateLimitError, ValidationError, AuthError, ForbiddenError } from './errors'

export interface ClientOptions {
  baseUrl?: string
  timeout?: number
  retry?: RetryConfig
  fetch?: typeof globalThis.fetch
}

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
}

const defaultRetry: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
}

interface RequestOptions {
  method?: string
  body?: unknown
  params?: Record<string, unknown>
  signal?: AbortSignal
}

export class VerbatimsClient {
  private baseUrl: string
  private apiKey: string
  private timeout: number
  private retry: RetryConfig
  private fetchFn: typeof globalThis.fetch

  constructor(apiKey: string, opts: ClientOptions = {}) {
    this.apiKey = apiKey
    this.baseUrl = opts.baseUrl ?? '/api/v1'
    this.timeout = opts.timeout ?? 15_000
    this.retry = opts.retry ?? defaultRetry
    this.fetchFn = opts.fetch ?? globalThis.fetch
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseUrl}${path}`, 'http://localhost')
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      }
    }
    return url.pathname + url.search
  }

  private async request<T>(
    path: string,
    opts: RequestOptions = {},
    schema: z.ZodType<T>,
  ): Promise<T> {
    const url = this.buildUrl(path, opts.params)
    const method = opts.method ?? 'GET'
    const body = opts.body ? JSON.stringify(opts.body) : undefined

    let lastError: Error | null = null
    const maxRetries = method === 'GET' ? this.retry.maxRetries : 1

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const signal = opts.signal
          ? anySignal([opts.signal, controller.signal])
          : controller.signal

        const response = await this.fetchFn(url, {
          method,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': body ? 'application/json' : undefined,
            'Accept': 'application/json',
          } as Record<string, string>,
          body,
          signal,
        })

        clearTimeout(timeoutId)

        const rateLimitHeaders = this.parseRateLimitHeaders(response.headers)
        const text = await response.text()
        let json: unknown
        try {
          json = JSON.parse(text)
        } catch {
          throw new VerbatimsError(`Invalid JSON response: ${text.slice(0, 200)}`, response.status)
        }

        if (!response.ok) {
          this.handleError(response.status, json, rateLimitHeaders)
        }

        const parsed = schema.parse(json)
        return parsed
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))

        if (err instanceof VerbatimsError) {
          if (err.statusCode === 429 && attempt < maxRetries) {
            const retryAfter = err instanceof RateLimitError ? err.retryAfter : 1
            await sleep(retryAfter * 1000)
            continue
          }
          throw err
        }

        if (attempt < maxRetries && isRetryableError(lastError)) {
          const delay = this.retry.baseDelayMs * Math.pow(2, attempt)
          await sleep(delay)
          continue
        }

        throw lastError
      }
    }

    throw lastError ?? new VerbatimsError('Request failed', 0)
  }

  private parseRateLimitHeaders(headers: Headers): {
    limit: number
    remaining: number
    reset: number
  } | null {
    const limit = headers.get('x-ratelimit-limit')
    const remaining = headers.get('x-ratelimit-remaining')
    const reset = headers.get('x-ratelimit-reset')
    if (limit && remaining && reset) {
      return {
        limit: Number(limit),
        remaining: Number(remaining),
        reset: Number(reset),
      }
    }
    return null
  }

  private handleError(status: number, json: unknown, rateLimit: { limit: number; remaining: number; reset: number } | null): never {
    const parsed = errorResponseSchema.safeParse(json)
    const message = parsed.data?.message ?? `HTTP ${status}`
    const errors = parsed.data?.errors

    switch (status) {
      case 400:
        throw new ValidationError(message, errors)
      case 401:
        throw new AuthError(message)
      case 403:
        throw new ForbiddenError(message)
      case 404:
        throw new NotFoundError(message)
      case 429:
        throw new RateLimitError(
          message,
          rateLimit?.reset ? rateLimit.reset - Math.floor(Date.now() / 1000) : 1,
          rateLimit?.limit ?? 0,
          rateLimit?.remaining ?? 0,
          rateLimit?.reset ?? 0,
        )
      default:
        throw new VerbatimsError(message, status)
    }
  }

  // --- HTTP helpers ---

  async get<T>(path: string, opts?: RequestOptions, schema?: z.ZodType<T>): Promise<T> {
    return this.request(path, { ...opts, method: 'GET' }, schema ?? z.unknown() as z.ZodType<T>)
  }

  async post<T>(path: string, body: unknown, opts?: RequestOptions, schema?: z.ZodType<T>): Promise<T> {
    return this.request(path, { ...opts, method: 'POST', body }, schema ?? z.unknown() as z.ZodType<T>)
  }

  async put<T>(path: string, body: unknown, opts?: RequestOptions, schema?: z.ZodType<T>): Promise<T> {
    return this.request(path, { ...opts, method: 'PUT', body }, schema ?? z.unknown() as z.ZodType<T>)
  }

  async delete<T>(path: string, opts?: RequestOptions, schema?: z.ZodType<T>): Promise<T> {
    return this.request(path, { ...opts, method: 'DELETE' }, schema ?? z.unknown() as z.ZodType<T>)
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }
  return controller.signal
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isRetryableError(err: Error): boolean {
  if (err instanceof VerbatimsError) return false
  return err.name === 'AbortError' || err.message.includes('network') || err.message.includes('fetch')
}
