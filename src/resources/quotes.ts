import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { QuoteWithRelations, ListQuotesParams, CreateQuoteData, UpdateQuoteData, ModerateQuoteData, AddQuoteTagData } from '../types'

const quoteStatsSchema = z.object({
  views: z.number(),
  likes: z.number(),
  shares: z.number().optional(),
})

const quoteAuthorSchema = z.object({
  id: z.number(),
  name: z.string(),
  fictional: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
})

const quoteReferenceSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
})

const provenanceStatusSchema = z.enum(['unverified', 'manually_verified', 'externally_verified', 'disputed'])

const quoteAttributionSchema = z.object({
  id: z.number(),
  quote_id: z.number(),
  author_id: z.number().nullable(),
  reference_id: z.number().nullable(),
  is_primary: z.boolean(),
  status: provenanceStatusSchema,
  verified_by: z.number().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  author: z.object({ id: z.number(), name: z.string() }).optional(),
  reference: z.object({ id: z.number(), name: z.string() }).optional(),
})

const quoteSourceSchema = z.object({
  id: z.number(),
  quote_id: z.number(),
  attribution_id: z.number().nullable(),
  source_type: z.string(),
  source_url: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  verification_status: provenanceStatusSchema,
  verified_by: z.number().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_primary: z.boolean(),
})

const quoteTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().nullable().optional(),
})

const quoteSchema = z.object({
  id: z.number(),
  content: z.string(),
  language: z.string(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
  stats: quoteStatsSchema.optional(),
  featured: z.boolean().optional(),
  author: quoteAuthorSchema.nullable().optional(),
  reference: quoteReferenceSchema.nullable().optional(),
  source: z.object({ type: z.string(), url: z.string().nullable().optional() }).nullable().optional(),
  attributions: z.array(quoteAttributionSchema).optional(),
  sources: z.array(quoteSourceSchema).optional(),
  tags: z.array(quoteTagSchema).optional(),
  user_id: z.number().optional(),
  moderator_id: z.number().nullable().optional(),
  moderated_at: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

const quoteListResponseSchema = apiResponseSchema(z.array(quoteSchema))
const quoteSingleResponseSchema = apiResponseSchema(quoteSchema)
const quoteDeleteResponseSchema = apiResponseSchema(z.undefined()).or(z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.unknown().optional(),
}))

const quoteTagListResponseSchema = apiResponseSchema(z.array(quoteTagSchema))
const quoteTagAddResponseSchema = apiResponseSchema(z.object({
  id: z.number(),
  name: z.string(),
}))

const quoteModerateResponseSchema = apiResponseSchema(z.object({
  id: z.number(),
  status: z.enum(['approved', 'rejected']),
  auto_tagging: z.object({
    matchedTagNames: z.array(z.string()),
    attachedCount: z.number(),
  }).nullable().optional(),
}))

type QuoteItem = z.infer<typeof quoteSchema>

export class QuotesResource {
  constructor(private client: VerbatimsClient) {}

  async list(params?: ListQuotesParams) {
    return this.client.get('/quotes', { params: params as Record<string, unknown> }, quoteListResponseSchema)
  }

  paginate(params?: ListQuotesParams): AsyncGenerator<QuoteItem> {
    return paginate<QuoteItem>((page) =>
      this.list({ ...params, page }).then(r => ({
        data: r.data,
        pagination: r.pagination,
      }))
    )
  }

  async get(id: number) {
    return this.client.get(`/quotes/${id}`, {}, quoteSingleResponseSchema)
  }

  async create(data: CreateQuoteData) {
    return this.client.post('/quotes', data, {}, quoteSingleResponseSchema)
  }

  async update(id: number, data: UpdateQuoteData) {
    return this.client.put(`/quotes/${id}`, data, {}, quoteSingleResponseSchema)
  }

  async delete(id: number) {
    return this.client.delete(`/quotes/${id}`, {}, quoteDeleteResponseSchema)
  }

  async submit(id: number) {
    return this.client.post(`/quotes/${id}/submit`, {}, {}, quoteSingleResponseSchema)
  }

  async moderate(id: number, data: ModerateQuoteData) {
    return this.client.post(`/quotes/${id}/moderate`, data, {}, quoteModerateResponseSchema)
  }

  async listTags(id: number) {
    return this.client.get(`/quotes/${id}/tags`, {}, quoteTagListResponseSchema)
  }

  async addTag(id: number, data: AddQuoteTagData) {
    return this.client.post(`/quotes/${id}/tags`, data, {}, quoteTagAddResponseSchema)
  }

  async removeTag(id: number, tagId: number) {
    return this.client.delete(`/quotes/${id}/tags/${tagId}`, {}, apiResponseSchema(z.undefined()))
  }
}
