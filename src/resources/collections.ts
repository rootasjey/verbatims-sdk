import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema, paginationMetaSchema } from '../types'
import { paginate } from '../pagination'
import type {
  CreateCollectionData,
  ListCollectionsParams,
  UpdateCollectionData,
} from '../types'

const collectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_public: z.boolean().optional(),
  quotes_count: z.number().optional(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

const collectionResponseSchema = apiResponseSchema(collectionSchema)
const collectionListResponseSchema = apiResponseSchema(z.array(collectionSchema))
const collectionActionResponseSchema = apiResponseSchema(z.undefined()).or(z.object({
  success: z.literal(true),
  message: z.string().optional(),
}))
const collectionQuoteSchema = z.object({
  id: z.number(),
  content: z.string(),
  language: z.string(),
  stats: z.object({ views: z.number(), likes: z.number(), shares: z.number() }),
  featured: z.boolean(),
  author: z.object({ id: z.number(), name: z.string() }).nullable(),
  reference: z.object({ id: z.number(), name: z.string() }).nullable(),
  attributions: z.array(z.object({
    id: z.number(),
    quote_id: z.number(),
    author_id: z.number().nullable(),
    reference_id: z.number().nullable(),
    is_primary: z.boolean(),
    status: z.enum(['unverified', 'manually_verified', 'externally_verified', 'disputed']),
  })),
  sources: z.array(z.object({
    id: z.number(),
    quote_id: z.number(),
    attribution_id: z.number(),
    source_type: z.string(),
    source_url: z.string().nullable(),
    label: z.string().nullable(),
    verification_status: z.enum(['unverified', 'manually_verified', 'externally_verified', 'disputed']),
    is_primary: z.boolean(),
  })),
  tags: z.array(z.object({ name: z.string(), color: z.string().nullable() })),
  added_at: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})
const collectionDetailSchema = collectionSchema.extend({
  quotes_count: z.number(),
  quotes: z.array(collectionQuoteSchema),
  pagination: paginationMetaSchema,
})
const collectionDetailResponseSchema = apiResponseSchema(collectionDetailSchema)
const collectionDeleteResponseSchema = apiResponseSchema(z.undefined()).or(z.object({
  success: z.literal(true),
  message: z.string().optional(),
}))

type CollectionItem = z.infer<typeof collectionSchema>

export class CollectionsResource {
  constructor(private client: VerbatimsClient) {}

  async list(params?: ListCollectionsParams) {
    return this.client.get('/collections', { params: params as Record<string, unknown> }, collectionListResponseSchema)
  }

  paginate(params?: ListCollectionsParams): AsyncGenerator<CollectionItem> {
    return paginate<CollectionItem>((page) =>
      this.list({ ...params, page }).then(r => ({
        data: r.data,
        pagination: r.pagination,
      }))
    )
  }

  async get(id: number, params?: ListCollectionsParams) {
    return this.client.get(`/collections/${id}`, { params: params as Record<string, unknown> }, collectionDetailResponseSchema)
  }

  async create(data: CreateCollectionData) {
    return this.client.post('/collections', data, {}, collectionResponseSchema)
  }

  async update(id: number, data: UpdateCollectionData) {
    return this.client.put(`/collections/${id}`, data, {}, collectionResponseSchema)
  }

  async delete(id: number) {
    return this.client.delete(`/collections/${id}`, {}, collectionDeleteResponseSchema)
  }

  async addQuote(collectionId: number, quoteId: number) {
    return this.client.post(
      `/collections/${collectionId}/quotes`,
      { quote_id: quoteId },
      {},
      collectionActionResponseSchema,
    )
  }

  async removeQuote(collectionId: number, quoteId: number) {
    return this.client.delete(
      `/collections/${collectionId}/quotes/${quoteId}`,
      {},
      collectionActionResponseSchema,
    )
  }
}
