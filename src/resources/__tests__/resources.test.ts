import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VerbatimsClient } from '../../client'
import { QuotesResource } from '../quotes'
import { AuthorsResource } from '../authors'
import { ReferencesResource } from '../references'
import { TagsResource } from '../tags'
import { CollectionsResource } from '../collections'
import { SearchResource } from '../search'

function mockResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockClient() {
  const fetchFn = vi.fn()
  const client = new VerbatimsClient('test_key', {
    baseUrl: '/api/v1',
    fetch: fetchFn,
    retry: { maxRetries: 0, baseDelayMs: 5 },
  })
  return { fetchFn, client }
}

describe('QuotesResource', () => {
  let fetchFn: ReturnType<typeof vi.fn>
  let quotes: QuotesResource

  beforeEach(() => {
    const mock = createMockClient()
    fetchFn = mock.fetchFn
    quotes = new QuotesResource(mock.client)
  })

  describe('list', () => {
    it('calls GET /quotes with params', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: [{ id: 1, name: 'Test', language: 'fr', status: 'published', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
      }))

      const result = await quotes.list({ language: 'fr', limit: 10 })
      expect(fetchFn).toHaveBeenCalledTimes(1)

      const [url] = fetchFn.mock.calls[0]
      expect(url).toContain('/quotes')
      const parsed = new URL(url, 'http://localhost')
      expect(parsed.searchParams.get('language')).toBe('fr')
      expect(parsed.searchParams.get('limit')).toBe('10')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].name).toBe('Test')
    })
  })

  describe('get', () => {
    it('calls GET /quotes/:id', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: { id: 42, name: 'Quote 42', language: 'en', status: 'published', views_count: 10, likes_count: 5, shares_count: 2, created_at: '2024-01-01', updated_at: '2024-01-01' },
      }))

      const result = await quotes.get(42)
      const [url] = fetchFn.mock.calls[0]
      expect(url).toContain('/quotes/42')
      expect(result.data!.id).toBe(42)
    })
  })

  describe('create', () => {
    it('calls POST /quotes with body', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: { id: 1, name: 'New quote', language: 'en', status: 'published', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
      }))

      await quotes.create({ name: 'New quote', language: 'en' })
      const [, opts] = fetchFn.mock.calls[0]
      expect(opts.method).toBe('POST')
      expect(JSON.parse(opts.body)).toEqual({ name: 'New quote', language: 'en' })
    })
  })

  describe('update', () => {
    it('calls PUT /quotes/:id with body', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: { id: 1, name: 'Updated', language: 'en', status: 'published', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
      }))

      await quotes.update(1, { name: 'Updated' })
      const [, opts] = fetchFn.mock.calls[0]
      expect(opts.method).toBe('PUT')
      expect(JSON.parse(opts.body)).toEqual({ name: 'Updated' })
    })
  })

  describe('delete', () => {
    it('calls DELETE /quotes/:id', async () => {
      fetchFn.mockResolvedValue(mockResponse({ success: true }))
      await quotes.delete(1)
      const [url, opts] = fetchFn.mock.calls[0]
      expect(url).toContain('/quotes/1')
      expect(opts.method).toBe('DELETE')
    })
  })

  describe('paginate', () => {
    it('yields items across pages', async () => {
      fetchFn
        .mockResolvedValueOnce(mockResponse({
          success: true,
          data: [{ id: 1, name: 'A', language: 'fr', status: 'published', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' }],
          pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true },
        }))
        .mockResolvedValueOnce(mockResponse({
          success: true,
          data: [{ id: 2, name: 'B', language: 'fr', status: 'published', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' }],
          pagination: { page: 2, limit: 1, total: 2, totalPages: 2, hasMore: false },
        }))

      const results = []
      for await (const item of quotes.paginate({ language: 'fr' })) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(results[0].id).toBe(1)
      expect(results[1].id).toBe(2)
      expect(fetchFn).toHaveBeenCalledTimes(2)
    })
  })
})

describe('AuthorsResource', () => {
  let fetchFn: ReturnType<typeof vi.fn>
  let authors: AuthorsResource

  beforeEach(() => {
    const mock = createMockClient()
    fetchFn = mock.fetchFn
    authors = new AuthorsResource(mock.client)
  })

  it('list calls GET /authors', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ id: 1, name: 'Author', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
    }))

    const result = await authors.list({ search: 'test' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/authors')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('search')).toBe('test')
    expect(result.data).toHaveLength(1)
  })

  it('get calls GET /authors/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 5, name: 'Author 5', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
    }))

    await authors.get(5)
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/authors/5')
  })

  it('create calls POST /authors', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'New Author', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
    }))

    await authors.create({ name: 'New Author', is_fictional: true })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body).is_fictional).toBe(true)
  })

  it('update calls PUT /authors/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'Updated', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
    }))

    await authors.update(1, { name: 'Updated' })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('PUT')
  })
})

describe('ReferencesResource', () => {
  let fetchFn: ReturnType<typeof vi.fn>
  let references: ReferencesResource

  beforeEach(() => {
    const mock = createMockClient()
    fetchFn = mock.fetchFn
    references = new ReferencesResource(mock.client)
  })

  it('list calls GET /references', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ id: 1, name: 'Ref', primary_type: 'book', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
    }))

    await references.list({ type: 'book' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/references')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('type')).toBe('book')
  })

  it('get calls GET /references/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 3, name: 'Ref 3', primary_type: 'book', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
    }))

    await references.get(3)
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/references/3')
  })

  it('create calls POST /references', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'New Ref', primary_type: 'movie', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
    }))

    await references.create({ name: 'New Ref', primary_type: 'movie' })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
  })

  it('update calls PUT /references/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'Updated', primary_type: 'book', views_count: 0, likes_count: 0, shares_count: 0, created_at: '2024-01-01', updated_at: '2024-01-01' },
    }))

    await references.update(1, { name: 'Updated' })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('PUT')
  })
})

describe('TagsResource', () => {
  let fetchFn: ReturnType<typeof vi.fn>
  let tags: TagsResource

  beforeEach(() => {
    const mock = createMockClient()
    fetchFn = mock.fetchFn
    tags = new TagsResource(mock.client)
  })

  it('list calls GET /tags', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ id: 1, name: 'wisdom' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
    }))

    const result = await tags.list()
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/tags')
    expect(result.data![0].name).toBe('wisdom')
  })

  it('paginate yields tags across pages', async () => {
    fetchFn
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 1, name: 'tag1' }],
        pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true },
      }))
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 2, name: 'tag2' }],
        pagination: { page: 2, limit: 1, total: 2, totalPages: 2, hasMore: false },
      }))

    const results = []
    for await (const item of tags.paginate()) {
      results.push(item)
    }
    expect(results).toHaveLength(2)
  })
})

describe('CollectionsResource', () => {
  let fetchFn: ReturnType<typeof vi.fn>
  let collections: CollectionsResource

  beforeEach(() => {
    const mock = createMockClient()
    fetchFn = mock.fetchFn
    collections = new CollectionsResource(mock.client)
  })

  it('create calls POST /collections', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'My Collection', created_at: '2024-01-01', updated_at: '2024-01-01' },
    }))

    await collections.create({ name: 'My Collection', is_public: true })
    const [url, opts] = fetchFn.mock.calls[0]
    expect(url).toContain('/collections')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body).name).toBe('My Collection')
  })

  it('addQuote calls POST /collections/:id/quotes', async () => {
    fetchFn.mockResolvedValue(mockResponse({ success: true }))
    await collections.addQuote(1, 42)
    const [url, opts] = fetchFn.mock.calls[0]
    expect(url).toContain('/collections/1/quotes')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body).quote_id).toBe(42)
  })

  it('removeQuote calls DELETE /collections/:id/quotes/:quoteId', async () => {
    fetchFn.mockResolvedValue(mockResponse({ success: true }))
    await collections.removeQuote(1, 42)
    const [url, opts] = fetchFn.mock.calls[0]
    expect(url).toContain('/collections/1/quotes/42')
    expect(opts.method).toBe('DELETE')
  })
})

describe('SearchResource', () => {
  let fetchFn: ReturnType<typeof vi.fn>
  let search: SearchResource

  beforeEach(() => {
    const mock = createMockClient()
    fetchFn = mock.fetchFn
    search = new SearchResource(mock.client)
  })

  it('query calls GET /search with q param', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ id: 1, type: 'quote', name: 'Life is...' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
    }))

    const result = await search.query({ q: 'life', type: 'quotes' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/search')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('q')).toBe('life')
    expect(parsed.searchParams.get('type')).toBe('quotes')
    expect(result.data![0].name).toBe('Life is...')
  })

  it('paginate searches across pages', async () => {
    fetchFn
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 1, type: 'quote', name: 'A' }],
        pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true },
      }))
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 2, type: 'quote', name: 'B' }],
        pagination: { page: 2, limit: 1, total: 2, totalPages: 2, hasMore: false },
      }))

    const results = []
    for await (const item of search.paginate({ q: 'life' })) {
      results.push(item)
    }
    expect(results).toHaveLength(2)
  })
})
