import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { SearchParams } from '../types'

const searchAuthorRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  fictional: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
})

const searchQuoteRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
})

const searchQuoteItemSchema = z.object({
  id: z.number(),
  content: z.string(),
  language: z.string(),
  author: searchAuthorRefSchema.nullable().optional(),
  reference: searchQuoteRefSchema.nullable().optional(),
  created_at: z.string().nullable(),
})

const searchAuthorItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  image_url: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
  type: z.literal('author').optional(),
})

const searchReferenceItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
  image_url: z.string().nullable().optional(),
  entity_type: z.literal('reference').optional(),
})

const searchResultSchema = z.union([searchQuoteItemSchema, searchAuthorItemSchema, searchReferenceItemSchema])

type SearchResultItem = z.infer<typeof searchResultSchema>

const searchResponseSchema = apiResponseSchema(z.array(searchResultSchema))

export class SearchResource {
  constructor(private client: VerbatimsClient) {}

  async query(params: SearchParams) {
    return this.client.get('/search', { params: params as unknown as Record<string, unknown> }, searchResponseSchema)
  }

  paginate(params: SearchParams): AsyncGenerator<SearchResultItem> {
    return paginate<SearchResultItem>((page) =>
      this.query({ ...params, page }).then(r => ({
        data: r.data,
        pagination: r.pagination,
      }))
    )
  }
}
