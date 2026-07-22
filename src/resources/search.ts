import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { SearchParams } from '../types'

const searchResultSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  match: z.string().optional(),
})

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
