import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type {
  Theme,
  ThemeFilter,
  ThemeSuggestion,
  ThemeFeed,
  ThemeWithDetails,
  ListThemesParams,
  CreateThemeData,
  UpdateThemeData,
  AddFilterData,
  FilterSuggestion,
  FilterRecommendationsData,
  FilterRecommendation,
  ThemeNameSuggestion,
  ThemeSuggestionItem,
  ActiveThemeParams,
  FeedParams,
  ThemeSuggestionsQuery,
} from '../types'

const themeSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  scheduledStart: z.string().nullable(),
  scheduledEnd: z.string().nullable(),
  priority: z.number(),
  config: z.union([z.string(), z.record(z.string(), z.unknown())]).nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  filters_count: z.number().optional(),
  pending_suggestions_count: z.number().optional(),
})

const themeListResponseSchema = apiResponseSchema(z.array(themeSchema))
const themeSingleResponseSchema = apiResponseSchema(themeSchema)

const themeFilterSchema = z.object({
  id: z.number().optional(),
  themeId: z.number(),
  type: z.string(),
  value: z.string(),
  matchMode: z.enum(['any', 'all']),
})

const themeSuggestionSchema = z.object({
  id: z.number(),
  themeId: z.number(),
  enrichmentJobId: z.number().nullable(),
  type: z.enum(['tag', 'author', 'reference']),
  suggestedValue: z.string(),
  context: z.string().nullable(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  createdBy: z.number().nullable(),
  reviewedBy: z.number().nullable(),
  reviewedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const themeFeedThemeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  config: z.union([z.string(), z.record(z.string(), z.unknown())]).nullable(),
  filters_count: z.number(),
})

const themeFeedSchema = z.object({
  theme: themeFeedThemeSchema,
  quotes: z.array(z.object({
    id: z.number(),
    name: z.string(),
    language: z.string(),
    created_at: z.string().nullable(),
    views_count: z.number(),
    likes_count: z.number(),
    updated_at: z.string().nullable(),
    author: z.object({ id: z.number(), name: z.string() }).optional(),
    reference: z.object({ id: z.number(), name: z.string() }).optional(),
  })),
  authors: z.array(z.object({
    id: z.number(),
    name: z.string(),
    job: z.string().nullable(),
    description: z.string().nullable(),
    image_url: z.string().nullable(),
    likes_count: z.number(),
  })),
  references: z.array(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    primary_type: z.string(),
    image_url: z.string().nullable(),
    likes_count: z.number(),
  })),
  total: z.number(),
})

type ThemeItem = z.infer<typeof themeSchema>

export class ThemesResource {
  constructor(private client: VerbatimsClient) {}

  async getActive(params?: ActiveThemeParams) {
    return this.client.get('/themes/active', { params: params as Record<string, unknown> }, apiResponseSchema(themeSchema.nullable()))
  }

  async getFeed(id: number, params?: FeedParams) {
    return this.client.get(`/themes/${id}/feed`, { params: params as Record<string, unknown> }, apiResponseSchema(themeFeedSchema.nullable()))
  }

  async list(params?: ListThemesParams) {
    return this.client.get('/themes', { params: params as Record<string, unknown> }, themeListResponseSchema)
  }

  paginate(params?: ListThemesParams): AsyncGenerator<ThemeItem> {
    return paginate<ThemeItem>((page) =>
      this.list({ ...params, page }).then(r => ({
        data: r.data,
        pagination: r.pagination,
      }))
    )
  }

  async get(id: number) {
    return this.client.get(`/themes/${id}`, {}, apiResponseSchema(themeSchema.and(z.object({
      filters: z.array(themeFilterSchema),
      translations: z.array(z.object({
        id: z.number(),
        themeId: z.number(),
        language: z.string(),
        name: z.string(),
        description: z.string().nullable(),
      })),
    }))))
  }

  async create(data: CreateThemeData) {
    return this.client.post('/themes', data, {}, themeSingleResponseSchema)
  }

  async update(id: number, data: UpdateThemeData) {
    return this.client.put(`/themes/${id}`, data, {}, themeSingleResponseSchema)
  }

  async delete(id: number) {
    return this.client.delete(`/themes/${id}`, {}, apiResponseSchema(z.undefined()))
  }

  async activate(id: number, isActive: boolean) {
    return this.client.put(`/themes/${id}/activate`, { is_active: isActive }, {}, themeSingleResponseSchema)
  }

  async setDefault(id: number, isDefault: boolean) {
    return this.client.put(`/themes/${id}/default`, { is_default: isDefault }, {}, themeSingleResponseSchema)
  }

  async addFilter(id: number, data: AddFilterData) {
    return this.client.post(`/themes/${id}/filters`, data, {}, apiResponseSchema(themeFilterSchema))
  }

  async removeFilter(id: number, filterId: number) {
    return this.client.delete(`/themes/${id}/filters/${filterId}`, {}, apiResponseSchema(z.undefined()))
  }

  async getFilters(id: number) {
    return this.client.get(`/themes/${id}/filters`, {}, apiResponseSchema(z.array(themeFilterSchema)))
  }

  async listSuggestions(id: number) {
    return this.client.get(`/themes/${id}/suggestions`, {}, apiResponseSchema(z.array(themeSuggestionSchema)))
  }

  async reviewSuggestion(id: number, suggestionId: number, action: 'accepted' | 'rejected') {
    return this.client.put(`/themes/${id}/suggestions/${suggestionId}`, { action }, {}, apiResponseSchema(themeSuggestionSchema))
  }

  async filterSuggestions(params: { q: string; type: string }) {
    return this.client.get('/themes/filter-suggestions', { params: params as Record<string, unknown> }, apiResponseSchema(z.array(z.object({
      label: z.string(),
      value: z.string(),
    }))))
  }

  async filterRecommendations(data: FilterRecommendationsData) {
    return this.client.post('/themes/filter-recommendations', data, {}, apiResponseSchema(z.array(z.object({
      type: z.string(),
      value: z.string(),
      label: z.string(),
    }))))
  }

  async suggestName(name: string) {
    return this.client.post('/themes/suggest-name', { name }, {}, apiResponseSchema(z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string(),
    })))
  }

  async suggestions(params?: ThemeSuggestionsQuery) {
    return this.client.get('/themes/suggestions', { params: params as Record<string, unknown> }, apiResponseSchema(z.array(z.object({
      type: z.enum(['tag', 'author', 'reference']),
      name: z.string(),
      slug: z.string(),
      description: z.string(),
      color_primary: z.string(),
      color_secondary: z.string(),
      filters: z.array(z.object({
        type: z.string(),
        value: z.string(),
        match_mode: z.literal('any'),
      })),
    }))))
  }
}
