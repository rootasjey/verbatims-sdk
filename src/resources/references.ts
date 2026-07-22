import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { ListReferencesParams, CreateReferenceData, UpdateReferenceData } from '../types'

const referenceSchema = z.object({
  id: z.number(),
  name: z.string(),
  primary_type: z.string(),
  secondary_type: z.string().nullable().optional(),
  original_language: z.string().optional(),
  release_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  views_count: z.number(),
  likes_count: z.number(),
  shares_count: z.number(),
  quotes_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const referenceListResponseSchema = apiResponseSchema(z.array(referenceSchema))
const referenceSingleResponseSchema = apiResponseSchema(referenceSchema)

type ReferenceItem = z.infer<typeof referenceSchema>

export class ReferencesResource {
  constructor(private client: VerbatimsClient) {}

  async list(params?: ListReferencesParams) {
    return this.client.get('/references', { params: params as Record<string, unknown> }, referenceListResponseSchema)
  }

  paginate(params?: ListReferencesParams): AsyncGenerator<ReferenceItem> {
    return paginate<ReferenceItem>((page) =>
      this.list({ ...params, page }).then(r => ({
        data: r.data,
        pagination: r.pagination,
      }))
    )
  }

  async get(id: number) {
    return this.client.get(`/references/${id}`, {}, referenceSingleResponseSchema)
  }

  async create(data: CreateReferenceData) {
    return this.client.post('/references', data, {}, referenceSingleResponseSchema)
  }

  async update(id: number, data: UpdateReferenceData) {
    return this.client.put(`/references/${id}`, data, {}, referenceSingleResponseSchema)
  }
}
