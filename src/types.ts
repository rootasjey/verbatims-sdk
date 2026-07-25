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
