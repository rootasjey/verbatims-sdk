import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { SearchParams } from '../types'

const searchAuthorSchema = z.object({
  id: z.number(),
  name: z.string(),
  fictional: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
})

const searchReferenceSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
})

const searchQuoteSchema = z.object({
  id: z.number(),
  content: z.string(),
  language: z.string(),
  author: searchAuthorSchema.nullable().optional(),
  reference: searchReferenceSchema.nullable().optional(),
  created_at: z.string().nullable(),
})

type SearchResultItem = z.infer<typeof searchQuoteSchema>

const searchResponseSchema = apiResponseSchema(z.array(searchQuoteSchema))

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
