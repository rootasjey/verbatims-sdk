import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'

const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().nullable().optional(),
  usage_count: z.number().optional(),
})

type TagItem = z.infer<typeof tagSchema>

const tagListResponseSchema = apiResponseSchema(z.array(tagSchema))

export class TagsResource {
  constructor(private client: VerbatimsClient) {}

  async list(params?: { page?: number; limit?: number }) {
    return this.client.get('/tags', { params: params as Record<string, unknown> }, tagListResponseSchema)
  }

  paginate(params?: { page?: number; limit?: number }): AsyncGenerator<TagItem> {
    return paginate<TagItem>((page) =>
      this.list({ ...params, page }).then(r => ({
        data: r.data,
        pagination: r.pagination,
      }))
    )
  }
}
