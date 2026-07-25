import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { QuoteWithRelations, ListQuotesParams, CreateQuoteData, UpdateQuoteData } from '../types'

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

const quoteTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().nullable().optional(),
})

const quoteSchema = z.object({
  id: z.number(),
  content: z.string(),
  language: z.string(),
  stats: quoteStatsSchema.optional(),
  featured: z.boolean().optional(),
  author: quoteAuthorSchema.nullable().optional(),
  reference: quoteReferenceSchema.nullable().optional(),
  tags: z.array(quoteTagSchema).optional(),
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
}
