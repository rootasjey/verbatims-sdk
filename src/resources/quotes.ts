import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { QuoteWithRelations, ListQuotesParams, CreateQuoteData, UpdateQuoteData } from '../types'

const quoteSchema = z.object({
  id: z.number(),
  name: z.string(),
  language: z.string(),
  author_id: z.number().optional(),
  reference_id: z.number().optional(),
  status: z.string(),
  views_count: z.number(),
  likes_count: z.number(),
  shares_count: z.number(),
  is_featured: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  author: z.object({
    id: z.number(),
    name: z.string(),
    is_fictional: z.boolean().optional(),
    image_url: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  }).optional(),
  reference: z.object({
    id: z.number(),
    name: z.string(),
    primary_type: z.string().optional(),
  }).optional(),
  tags: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    color: z.string().nullable().optional(),
  })).optional(),
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
