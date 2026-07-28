import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VerbatimsClient } from '../../client'
import { QuotesResource } from '../quotes'
import { AuthorsResource } from '../authors'
import { ReferencesResource } from '../references'
import { TagsResource } from '../tags'
import { CollectionsResource } from '../collections'
import { SearchResource } from '../search'
import { ThemesResource } from '../themes'

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
        data: [{ id: 1, content: 'Test', language: 'fr', stats: { views: 0, likes: 0, shares: 0 }, created_at: '2024-01-01', updated_at: '2024-01-01' }],
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
      expect(result.data![0].content).toBe('Test')
    })
  })

  describe('get', () => {
    it('calls GET /quotes/:id', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: { id: 42, content: 'Quote 42', language: 'en', stats: { views: 10, likes: 5, shares: 2 }, created_at: '2024-01-01', updated_at: '2024-01-01' },
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
        data: { id: 1, content: 'New quote', language: 'en', stats: { views: 0, likes: 0, shares: 0 }, created_at: '2024-01-01', updated_at: '2024-01-01' },
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
        data: { id: 1, content: 'Updated', language: 'en', stats: { views: 0, likes: 0, shares: 0 }, created_at: '2024-01-01', updated_at: '2024-01-01' },
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

  describe('submit', () => {
    it('calls POST /quotes/:id/submit', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: { id: 1, content: 'Test', language: 'fr', status: 'pending', stats: { views: 0, likes: 0, shares: 0 }, created_at: '2024-01-01', updated_at: '2024-01-01' },
      }))

      const result = await quotes.submit(1)
      const [url, opts] = fetchFn.mock.calls[0]
      expect(url).toContain('/quotes/1/submit')
      expect(opts.method).toBe('POST')
      expect(result.data?.status).toBe('pending')
    })
  })

  describe('moderate', () => {
    it('calls POST /quotes/:id/moderate with approve', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: { id: 1, status: 'approved', auto_tagging: { matchedTagNames: ['life'], attachedCount: 1 } },
      }))

      const result = await quotes.moderate(1, { action: 'approve' })
      const [url, opts] = fetchFn.mock.calls[0]
      expect(url).toContain('/quotes/1/moderate')
      expect(opts.method).toBe('POST')
      expect(JSON.parse(opts.body)).toEqual({ action: 'approve' })
      expect(result.data?.status).toBe('approved')
    })

    it('calls POST /quotes/:id/moderate with reject and reason', async () => {
      fetchFn.mockResolvedValue(mockResponse({
        success: true,
        data: { id: 1, status: 'rejected', auto_tagging: null },
      }))

      const result = await quotes.moderate(1, { action: 'reject', rejection_reason: 'Not relevant' })
      const [, opts] = fetchFn.mock.calls[0]
      expect(JSON.parse(opts.body)).toEqual({ action: 'reject', rejection_reason: 'Not relevant' })
      expect(result.data?.status).toBe('rejected')
    })
  })

  describe('paginate', () => {
    it('yields items across pages', async () => {
      fetchFn
        .mockResolvedValueOnce(mockResponse({
          success: true,
          data: [{ id: 1, content: 'A', language: 'fr', stats: { views: 0, likes: 0, shares: 0 }, created_at: '2024-01-01', updated_at: '2024-01-01' }],
          pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true },
        }))
        .mockResolvedValueOnce(mockResponse({
          success: true,
          data: [{ id: 2, content: 'B', language: 'fr', stats: { views: 0, likes: 0, shares: 0 }, created_at: '2024-01-01', updated_at: '2024-01-01' }],
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
      data: [{ id: 1, name: 'Author', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' }],
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
      data: { id: 5, name: 'Author 5', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' },
    }))

    await authors.get(5)
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/authors/5')
  })

  it('create calls POST /authors', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'New Author', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' },
    }))

    await authors.create({ name: 'New Author', is_fictional: true })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body).is_fictional).toBe(true)
  })

  it('update calls PUT /authors/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'Updated', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' },
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
      data: [{ id: 1, name: 'Ref', type: 'book', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' }],
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
      data: { id: 3, name: 'Ref 3', type: 'book', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' },
    }))

    await references.get(3)
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/references/3')
  })

  it('create calls POST /references', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'New Ref', type: 'movie', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' },
    }))

    await references.create({ name: 'New Ref', primary_type: 'movie' })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
  })

  it('update calls PUT /references/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, name: 'Updated', type: 'book', stats: { views: 0, likes: 0 }, created_at: '2024-01-01' },
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
      data: [{ id: 1, name: 'wisdom', color: '#6C757D' }],
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
        data: [{ id: 1, name: 'tag1', color: '#6C757D' }],
        pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true },
      }))
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 2, name: 'tag2', color: '#6C757D' }],
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

describe('ThemesResource', () => {
  let fetchFn: ReturnType<typeof vi.fn>
  let themes: ThemesResource

  beforeEach(() => {
    const mock = createMockClient()
    fetchFn = mock.fetchFn
    themes = new ThemesResource(mock.client)
  })

  it('getActive calls GET /themes/active', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, slug: 'summer', name: 'Summer', description: null, language: 'en', isActive: true, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 0, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0 },
    }))

    const result = await themes.getActive({ language: 'en' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes/active')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('language')).toBe('en')
    expect(result.data?.slug).toBe('summer')
  })

  it('getFeed calls GET /themes/:id/feed', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { theme: { slug: 'summer', name: 'Summer', description: null, config: null, filters_count: 0 }, quotes: [], authors: [], references: [], total: 0 },
    }))

    await themes.getFeed(1, { language: 'fr' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes/1/feed')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('language')).toBe('fr')
  })

  it('list calls GET /themes with params', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ id: 1, slug: 'summer', name: 'Summer', description: null, language: 'en', isActive: true, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 0, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0 }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
    }))

    const result = await themes.list({ search: 'summer' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('search')).toBe('summer')
    expect(result.data).toHaveLength(1)
  })

  it('paginate yields themes across pages', async () => {
    fetchFn
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 1, slug: 'a', name: 'A', description: null, language: null, isActive: false, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 0, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0 }],
        pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true },
      }))
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 2, slug: 'b', name: 'B', description: null, language: null, isActive: false, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 0, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0 }],
        pagination: { page: 2, limit: 1, total: 2, totalPages: 2, hasMore: false },
      }))

    const results = []
    for await (const item of themes.paginate()) {
      results.push(item)
    }
    expect(results).toHaveLength(2)
  })

  it('get calls GET /themes/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 5, slug: 'test', name: 'Test', description: null, language: null, isActive: false, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 0, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0, filters: [], translations: [] },
    }))

    await themes.get(5)
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes/5')
  })

  it('create calls POST /themes', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, slug: 'new-theme', name: 'New Theme', description: null, language: 'en', isActive: false, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 0, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0 },
    }))

    await themes.create({ slug: 'new-theme', name: 'New Theme', language: 'en' })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body).slug).toBe('new-theme')
  })

  it('update calls PUT /themes/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, slug: 'updated', name: 'Updated', description: null, language: 'en', isActive: false, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 5, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0 },
    }))

    await themes.update(1, { priority: 5 })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('PUT')
  })

  it('delete calls DELETE /themes/:id', async () => {
    fetchFn.mockResolvedValue(mockResponse({ success: true }))
    await themes.delete(1)
    const [url, opts] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes/1')
    expect(opts.method).toBe('DELETE')
  })

  it('activate calls PUT /themes/:id/activate', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 1, slug: 'test', name: 'Test', description: null, language: null, isActive: true, isDefault: false, scheduledStart: null, scheduledEnd: null, priority: 0, config: null, createdAt: '2024-01-01', updatedAt: '2024-01-01', filters_count: 0 },
    }))

    await themes.activate(1, true)
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('PUT')
    expect(JSON.parse(opts.body)).toEqual({ is_active: true })
  })

  it('addFilter calls POST /themes/:id/filters', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { id: 10, themeId: 1, type: 'keyword', value: 'test', matchMode: 'any' },
    }))

    await themes.addFilter(1, { type: 'keyword', value: 'test' })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ type: 'keyword', value: 'test' })
  })

  it('removeFilter calls DELETE /themes/:id/filters/:fid', async () => {
    fetchFn.mockResolvedValue(mockResponse({ success: true }))
    await themes.removeFilter(1, 5)
    const [url, opts] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes/1/filters/5')
    expect(opts.method).toBe('DELETE')
  })

  it('filterSuggestions calls GET /themes/filter-suggestions', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ label: 'Test Tag', value: 'test' }],
    }))

    await themes.filterSuggestions({ q: 'test', type: 'tag_name' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes/filter-suggestions')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('q')).toBe('test')
    expect(parsed.searchParams.get('type')).toBe('tag_name')
  })

  it('filterRecommendations calls POST /themes/filter-recommendations', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ type: 'tag', value: 'wisdom', label: 'Wisdom' }],
    }))

    await themes.filterRecommendations({ name: 'Summer', filters: [{ type: 'keyword', value: 'sun' }] })
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body).name).toBe('Summer')
  })

  it('suggestName calls POST /themes/suggest-name', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: { name: 'Summer Vibes', slug: 'summer-vibes', description: 'A summer theme' },
    }))

    await themes.suggestName('summer')
    const [, opts] = fetchFn.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body).name).toBe('summer')
  })

  it('suggestions calls GET /themes/suggestions', async () => {
    fetchFn.mockResolvedValue(mockResponse({
      success: true,
      data: [{ type: 'tag', name: 'Summer', slug: 'summer', description: 'Summer theme', color_primary: '#FF0000', color_secondary: '#00FF00', filters: [{ type: 'keyword', value: 'summer', match_mode: 'any' }] }],
    }))

    await themes.suggestions({ ai: true, tags: 'summer,beach' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/themes/suggestions')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('ai')).toBe('true')
    expect(parsed.searchParams.get('tags')).toBe('summer,beach')
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
      data: [{ id: 1, content: 'Life is...', language: 'en', created_at: null }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
    }))

    const result = await search.query({ q: 'life', type: 'quotes' })
    const [url] = fetchFn.mock.calls[0]
    expect(url).toContain('/search')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.searchParams.get('q')).toBe('life')
    expect(parsed.searchParams.get('type')).toBe('quotes')
    expect(result.data![0].content).toBe('Life is...')
  })

  it('paginate searches across pages', async () => {
    fetchFn
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 1, content: 'A', language: 'en', created_at: null }],
        pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasMore: true },
      }))
      .mockResolvedValueOnce(mockResponse({
        success: true,
        data: [{ id: 2, content: 'B', language: 'en', created_at: null }],
        pagination: { page: 2, limit: 1, total: 2, totalPages: 2, hasMore: false },
      }))

    const results = []
    for await (const item of search.paginate({ q: 'life' })) {
      results.push(item)
    }
    expect(results).toHaveLength(2)
  })
})
