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

// --- API entity types (subset of shared types, inlined for portability) ---

export interface QuoteAuthor {
  id: number
  name: string
  is_fictional?: boolean
  image_url?: string | null
  description?: string | null
}

export interface QuoteReferenceInfo {
  id: number
  name: string
  primary_type?: string
}

export interface QuoteWithRelations {
  id: number
  name: string
  language: string
  author_id?: number
  reference_id?: number
  status: string
  views_count: number
  likes_count: number
  shares_count: number
  is_featured?: boolean
  created_at: string
  updated_at: string
  author?: QuoteAuthor
  reference?: QuoteReferenceInfo
  tags?: Array<{ id?: number; name: string; color?: string | null }>
}

export interface Author {
  id: number
  name: string
  is_fictional?: boolean
  image_url?: string | null
  job?: string | null
  description?: string | null
  birth_date?: string | null
  birth_location?: string | null
  death_date?: string | null
  death_location?: string | null
  views_count: number
  likes_count: number
  shares_count: number
  quotes_count?: number
  created_at: string
  updated_at: string
}

export interface QuoteReference {
  id: number
  name: string
  primary_type: string
  secondary_type?: string | null
  original_language?: string
  release_date?: string | null
  description?: string | null
  image_url?: string | null
  views_count: number
  likes_count: number
  shares_count: number
  quotes_count?: number
  created_at: string
  updated_at: string
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
  name: string
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
  name?: string
  language?: string
  author_id?: number | null
  reference_id?: number | null
}

export interface CreateAuthorData {
  name: string
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

export interface CreateReferenceData {
  name: string
  primary_type: string
  secondary_type?: string | null
  description?: string | null
  release_date?: string | null
  original_language?: string
  image_url?: string | null
  urls?: Record<string, string> | null
}

export interface UpdateReferenceData {
  name?: string
  primary_type?: string
  secondary_type?: string | null
  description?: string | null
  release_date?: string | null
  original_language?: string
  image_url?: string | null
  urls?: Record<string, string> | null
}

export interface CreateCollectionData {
  name: string
  description?: string | null
  is_public?: boolean
}
