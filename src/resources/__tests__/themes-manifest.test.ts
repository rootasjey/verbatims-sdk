import { describe, expect, it, vi } from 'vitest'
import { VerbatimsClient } from '../../client'
import { parseThemeManifest, ThemesResource } from '../themes'

const manifest = {
  schema_version: 1,
  slug: 'quiet-courage',
  name: 'Quiet Courage',
  language: 'en',
  filters: [{ type: 'tag_name', value: 'courage' }],
}

describe('theme manifests', () => {
  it('normalizes manifest defaults and rejects duplicate filters', () => {
    expect(parseThemeManifest(manifest).filters[0]?.match_mode).toBe('any')
    expect(parseThemeManifest(manifest)).not.toHaveProperty('translations')
    expect(() => parseThemeManifest({
      ...manifest,
      filters: [{ type: 'tag_name', value: 'courage' }, { type: 'tag_name', value: 'Courage' }],
    })).toThrow()
  })

  it('preserves optional homepage copy in translations', () => {
    const parsed = parseThemeManifest({
      ...manifest,
      translations: [{ language: 'en', name: 'Quiet Courage', home_copy: { title: 'Small acts' } }],
    })
    expect(parsed.translations?.[0]?.home_copy).toEqual({ title: 'Small acts' })
  })

  it('posts a validated manifest and returns the create/update result', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      operation: 'updated',
      data: { id: 12, slug: manifest.slug, name: manifest.name, filters_count: 1, translations_count: 0 },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    const client = new VerbatimsClient('test_key', { baseUrl: '/api/v1', fetch: fetchFn, retry: { maxRetries: 0, baseDelayMs: 0 } })
    const themes = new ThemesResource(client)

    const result = await themes.apply(manifest)

    expect(fetchFn.mock.calls[0]?.[0]).toContain('/themes/apply')
    expect(fetchFn.mock.calls[0]?.[1]?.method).toBe('POST')
    expect(JSON.parse(fetchFn.mock.calls[0]?.[1]?.body)).toMatchObject({
      schema_version: 1,
      filters: [{ type: 'tag_name', value: 'courage', match_mode: 'any' }],
    })
    expect(result.operation).toBe('updated')
    expect(result.data.id).toBe(12)
  })
})
