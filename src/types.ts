import { z } from 'zod/v4'

// --- Zod schemas for response validation ---

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
})

export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema.optional(),
    message: z.string().optional(),
    pagination: paginationMetaSchema.optional(),
  })
}

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  pagination?: PaginationMeta
}

// --- API entity types ---

export interface QuoteAuthor {
  id: number
  name: string
  fictional?: boolean
  image_url?: string | null
  description?: string | null
  job?: string | null
}

export interface QuoteReferenceInfo {
  id: number
  name: string
  type?: string
}

export interface QuoteStats {
  views: number
  likes: number
  shares?: number
}

export interface QuoteWithRelations {
  id: number
  content: string
  language: string
  stats?: QuoteStats
  featured?: boolean
  author?: QuoteAuthor | null
  reference?: QuoteReferenceInfo | null
  tags?: Array<{ id: number; name: string; color?: string | null }>
  created_at: string | null
  updated_at: string | null
}

export interface AuthorDates {
  birth?: string | null
  death?: string | null
  birth_location?: string | null
  death_location?: string | null
}

export interface AuthorStats {
  views: number
  likes: number
}

export interface Author {
  id: number
  name: string
  fictional?: boolean
  image_url?: string | null
  job?: string | null
  description?: string | null
  dates?: AuthorDates
  stats?: AuthorStats
  created_at: string | null
}

export interface ReferenceStats {
  views: number
  likes: number
}

export interface QuoteReference {
  id: number
  name: string
  type: string
  secondary_type?: string | null
  language?: string
  release_date?: string | null
  description?: string | null
  image_url?: string | null
  stats?: ReferenceStats
  created_at: string | null
}

// --- Parameter types for SDK methods ---

export interface ListQuotesParams {
  page?: number
  limit?: number
  language?: string
  author_id?: number
  reference_id?: number
  search?: string
  tag?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface ListAuthorsParams {
  page?: number
  limit?: number
  search?: string
}

export interface ListReferencesParams {
  page?: number
  limit?: number
  search?: string
  type?: string
}

export interface SearchParams {
  q: string
  type?: 'quotes' | 'authors' | 'references'
  page?: number
  limit?: number
}

export interface CreateQuoteData {
  content?: string
  name?: string
  language?: string
  author_id?: number
  reference_id?: number
  new_author?: {
    name: string
    is_fictional?: boolean
    job?: string | null
    description?: string | null
  }
  new_reference?: {
    name: string
    primary_type: string
    original_language?: string
    description?: string | null
    release_date?: string | null
  }
  tags?: number[]
}

export interface UpdateQuoteData {
  content?: string
  name?: string
  language?: string
  author_id?: number | null
  reference_id?: number | null
}

export interface CreateAuthorData {
  name: string
  fictional?: boolean
  is_fictional?: boolean
  job?: string | null
  description?: string | null
  birth_date?: string | null
  birth_location?: string | null
  death_date?: string | null
  death_location?: string | null
  image_url?: string | null
  socials?: Record<string, string> | null
}

export interface UpdateAuthorData {
  name?: string
  fictional?: boolean
  is_fictional?: boolean
  description?: string | null
  job?: string | null
  birth_date?: string | null
  birth_location?: string | null
  death_date?: string | null
  death_location?: string | null
  image_url?: string | null
  socials?: Record<string, string> | null
}

export interface CreateReferenceData {
  name: string
  type?: string
  primary_type?: string
  secondary_type?: string | null
  description?: string | null
  release_date?: string | null
  language?: string
  original_language?: string
  image_url?: string | null
  urls?: Record<string, string> | null
}

export interface UpdateReferenceData {
  name?: string
  type?: string
  primary_type?: string
  secondary_type?: string | null
  description?: string | null
  release_date?: string | null
  language?: string
  original_language?: string
  image_url?: string | null
  urls?: Record<string, string> | null
}

export interface CreateCollectionData {
  name: string
  description?: string | null
  is_public?: boolean
}

// --- Theme types ---

export interface Theme {
  id: number
  slug: string
  name: string
  description: string | null
  language: string | null
  isActive: boolean
  isDefault: boolean
  scheduledStart: string | null
  scheduledEnd: string | null
  priority: number
  config: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  filters_count: number
  pending_suggestions_count?: number
}

export interface ThemeFilter {
  id: number
  themeId: number
  type: string
  value: string
  matchMode: 'any' | 'all'
}

export interface ThemeTranslation {
  id: number
  themeId: number
  language: string
  name: string
  description: string | null
}

export interface ThemeSuggestion {
  id: number
  themeId: number
  enrichmentJobId: number | null
  type: 'tag' | 'author' | 'reference'
  suggestedValue: string
  context: string | null
  status: 'pending' | 'accepted' | 'rejected'
  createdBy: number | null
  reviewedBy: number | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ThemeFeedQuote {
  id: number
  name: string
  language: string
  created_at: string
  views_count: number
  likes_count: number
  updated_at: string
  author?: { id: number; name: string }
  reference?: { id: number; name: string }
}

export interface ThemeFeedAuthor {
  id: number
  name: string
  job: string
  description: string
  image_url: string
  likes_count: number
}

export interface ThemeFeedReference {
  id: number
  name: string
  description: string
  primary_type: string
  image_url: string
  likes_count: number
}

export interface ThemeFeed {
  theme: Theme
  quotes: ThemeFeedQuote[]
  authors: ThemeFeedAuthor[]
  references: ThemeFeedReference[]
  total: number
}

export interface ThemeWithDetails extends Theme {
  filters: ThemeFilter[]
  translations: ThemeTranslation[]
}

export interface ListThemesParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: 'priority' | 'name' | 'slug'
  sort_order?: 'asc' | 'desc'
}

export interface CreateThemeData {
  slug: string
  name: string
  description?: string | null
  language?: string | null
  translations?: Array<{ language: string; name: string; description?: string | null }>
  is_active?: boolean
  is_default?: boolean
  priority?: number
  scheduled_start?: string | null
  scheduled_end?: string | null
  config?: Record<string, unknown> | null
}

export interface UpdateThemeData {
  slug?: string
  name?: string
  description?: string | null
  language?: string | null
  is_active?: boolean
  is_default?: boolean
  priority?: number
  scheduled_start?: string | null
  scheduled_end?: string | null
  config?: Record<string, unknown> | string | null
  translations?: Array<{ language: string; name: string; description?: string | null }>
}

export interface AddFilterData {
  type: string
  value: string
  match_mode?: 'any' | 'all'
}

export interface FilterSuggestion {
  label: string
  value: string
}

export interface FilterRecommendationsData {
  name?: string
  filters?: Array<{ type: string; value: string }>
}

export interface FilterRecommendation {
  type: string
  value: string
  label: string
}

export interface ThemeNameSuggestion {
  name: string
  slug: string
  description: string
}

export interface ThemeSuggestionItem {
  type: 'tag' | 'author' | 'reference'
  name: string
  slug: string
  description: string
  color_primary: string
  color_secondary: string
  filters: Array<{ type: string; value: string; match_mode: 'any' }>
}

export interface ActiveThemeParams {
  language?: string
  theme?: string
}

export interface FeedParams {
  language?: string
}

export interface ThemeSuggestionsQuery {
  ai?: boolean
  tags?: string
  language?: string
}
