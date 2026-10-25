import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { Author, ListAuthorsParams, CreateAuthorData, UpdateAuthorData } from '../types'

const authorStatsSchema = z.object({
  views: z.number(),
  likes: z.number(),
})

const authorDatesSchema = z.object({
  birth: z.string().nullable().optional(),
  death: z.string().nullable().optional(),
  birth_year: z.number().nullable().optional(),
  birth_era: z.enum(['bce', 'ce']).nullable().optional(),
  birth_month: z.number().nullable().optional(),
  birth_day: z.number().nullable().optional(),
  birth_is_approximate: z.boolean().nullable().optional(),
  birth_calendar: z.string().nullable().optional(),
  death_year: z.number().nullable().optional(),
  death_era: z.enum(['bce', 'ce']).nullable().optional(),
  death_month: z.number().nullable().optional(),
  death_day: z.number().nullable().optional(),
  death_is_approximate: z.boolean().nullable().optional(),
  death_calendar: z.string().nullable().optional(),
  birth_location: z.string().nullable().optional(),
  death_location: z.string().nullable().optional(),
})

const authorSchema = z.object({
  id: z.number(),
  name: z.string(),
  fictional: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  dates: authorDatesSchema.optional(),
  stats: authorStatsSchema.optional(),
  quotes_count: z.number().optional(),
  created_at: z.string().nullable(),
})

const authorListResponseSchema = apiResponseSchema(z.array(authorSchema))
const authorSingleResponseSchema = apiResponseSchema(authorSchema)

type AuthorItem = z.infer<typeof authorSchema>

export class AuthorsResource {
  constructor(private client: VerbatimsClient) {}

  async list(params?: ListAuthorsParams) {
    return this.client.get('/authors', { params: { ...params, include: 'quotes_count' } as Record<string, unknown> }, authorListResponseSchema)
  }

  paginate(params?: ListAuthorsParams): AsyncGenerator<AuthorItem> {
    return paginate<AuthorItem>((page) =>
      this.list({ ...params, page }).then(r => ({
        data: r.data,
        pagination: r.pagination,
      }))
    )
  }

  async get(id: number) {
    return this.client.get(`/authors/${id}`, {}, authorSingleResponseSchema)
  }

  async create(data: CreateAuthorData) {
    return this.client.post('/authors', data, {}, authorSingleResponseSchema)
  }

  async update(id: number, data: UpdateAuthorData) {
    return this.client.put(`/authors/${id}`, data, {}, authorSingleResponseSchema)
  }

  async delete(id: number, strategy?: 'delete' | 'anonymize') {
    return this.client.delete(`/authors/${id}`, strategy ? { body: { strategy } } : {}, apiResponseSchema(z.object({
      quotesAffected: z.number(),
      strategy: z.string().optional(),
    })))
  }
}
