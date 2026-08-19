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

export type ProvenanceStatus = 'unverified' | 'manually_verified' | 'externally_verified' | 'disputed'

export interface QuoteAttribution {
  id: number
  quote_id: number
  author_id: number | null
  reference_id: number | null
  is_primary: boolean
  status: ProvenanceStatus
  verified_by?: number | null
  verified_at?: string | null
  notes?: string | null
  author_name?: string | null
  reference_name?: string | null
  author?: { id: number; name: string }
  reference?: { id: number; name: string }
}

export interface QuoteSource {
  id: number
  quote_id: number
  attribution_id: number
  source_type: string
  source_url?: string | null
  label?: string | null
  verification_status: ProvenanceStatus
  verified_by?: number | null
  verified_at?: string | null
  notes?: string | null
  is_primary: boolean
}

export interface CreateQuoteAttributionData {
  author_id?: number | null
  reference_id?: number | null
  is_primary?: boolean
  status?: ProvenanceStatus
  notes?: string | null
}

export type UpdateQuoteAttributionData = Partial<CreateQuoteAttributionData>

/** An attribution supplied while creating or replacing a quote's attributions. */
export interface QuoteAttributionInput {
  author_id?: number | null
  reference_id?: number | null
  is_primary: boolean
  status?: ProvenanceStatus
  notes?: string | null
}

export interface CreateQuoteSourceData {
  attribution_id: number
  source_type: string
  source_url?: string | null
  label?: string | null
  verification_status?: ProvenanceStatus
  notes?: string | null
  is_primary?: boolean
}

export type UpdateQuoteSourceData = Partial<CreateQuoteSourceData>

export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface QuoteStats {
  views: number
  likes: number
  shares?: number
}

export interface QuoteWithRelations {
  id: number
  content: string
  language: string
  status?: QuoteStatus
  stats?: QuoteStats
  featured?: boolean
  attributions?: QuoteAttribution[]
  sources?: QuoteSource[]
  tags?: Array<{ id: number; name: string; color?: string | null }>
  user_id?: number
  moderator_id?: number | null
  moderated_at?: string | null
  rejection_reason?: string | null
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
  quotes_count?: number
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
  quotes_count?: number
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
  q?: string
  tag?: string
  status?: QuoteStatus
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
  /** Complete attribution set. It must contain exactly one primary attribution. */
  attributions?: QuoteAttributionInput[]
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
  /** Complete replacement attribution set. It must contain exactly one primary attribution. */
  attributions?: QuoteAttributionInput[]
}

export interface ModerateQuoteData {
  action: 'approve' | 'reject'
  rejection_reason?: string | null
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
  config: string | Record<string, unknown> | null
  createdAt: string | null
  updatedAt: string | null
  filters_count?: number
  pending_suggestions_count?: number
}

export interface ThemeFilter {
  id?: number
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
  created_at: string | null
  views_count: number
  likes_count: number
  updated_at: string | null
  author?: { id: number; name: string }
  reference?: { id: number; name: string }
}

export interface ThemeFeedAuthor {
  id: number
  name: string
  job: string | null
  description: string | null
  image_url: string | null
  likes_count: number
}

export interface ThemeFeedReference {
  id: number
  name: string
  description: string | null
  primary_type: string
  image_url: string | null
  likes_count: number
}

export interface ThemeFeedTheme {
  slug: string
  name: string
  description: string | null
  config: string | Record<string, unknown> | null
  filters_count: number
}

export interface ThemeFeed {
  theme: ThemeFeedTheme
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
  config?: string | Record<string, unknown> | null
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

export interface AddQuoteTagData {
  tagId?: number
  name?: string
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

export interface UploadedImage {
  url: string
}

export interface ThemeSuggestionsQuery {
  ai?: boolean
  tags?: string
  language?: string
}

// --- Social queue / auto-post types ---

export type SocialPlatform = 'x' | 'bluesky' | 'instagram' | 'threads' | 'facebook' | 'pinterest'
export type SocialQueueStatus = 'queued' | 'processing' | 'posted' | 'failed'
export type SocialPostStatus = 'success' | 'failed'

export interface SocialQueueStats {
  queued: number
  processing: number
  posted: number
  failed: number
}

export interface SocialPlatformInfo {
  platform: SocialPlatform
  label: string
  enabled: boolean
  queue: SocialQueueStats
}

export interface SocialResolvedContent {
  source_type: string
  source_id: number
  primary_text: string | null
  secondary_text: string | null
  canonical_path: string | null
  title: string | null
  subtitle: string | null
  language: string | null
}

export interface SocialQueueItem {
  id: number
  quote_id: number
  source_type: string
  source_id: number
  platform: SocialPlatform
  status: SocialQueueStatus
  position: number
  scheduled_for: string | null
  created_at: string | null
  updated_at: string | null
  published_post_url: string | null
  published_external_post_id: string | null
  published_posted_at: string | null
  error_message: string | null
  quote_posts_count: number
  quote_text: string | null
  quote_language: string | null
  author_name: string | null
  reference_name: string | null
  resolved_content: SocialResolvedContent | null
}

export interface SocialPost {
  id: number
  quote_id: number
  source_type: string
  source_id: number
  queue_id: number | null
  platform: SocialPlatform
  status: SocialPostStatus
  post_text: string | null
  post_url: string | null
  external_post_id: string | null
  error_message: string | null
  posted_at: string | null
  created_at: string | null
}

export interface QueuedSocialItem {
  id: number
  quote_id: number
  source_type: string
  source_id: number
  position: number
  status?: SocialQueueStatus
}

export interface ListSocialQueueParams {
  page?: number
  limit?: number
  platform?: SocialPlatform
  status?: SocialQueueStatus | 'active'
  search?: string
}

export interface ListSocialPostsParams {
  page?: number
  limit?: number
  platform?: SocialPlatform
  status?: SocialPostStatus
}

export interface AddToSocialQueueData {
  quote_ids: number[]
  platform?: SocialPlatform
  scheduled_for?: string | null
}

export interface AddRandomToSocialQueueData {
  platform?: SocialPlatform
  count?: number
  language?: string
}

export interface ClearSocialQueueData {
  platform: SocialPlatform
  confirm: boolean
  scope?: 'all' | 'finished'
}

export interface ReorderSocialQueueData {
  id: number
  direction?: 'up' | 'down'
  before_id?: number | null
}

export interface RunSocialAutopostData {
  platform?: SocialPlatform
}

export interface SocialQueueListResult {
  queue: SocialQueueItem[]
  stats: SocialQueueStats
}
