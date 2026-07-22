import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type { Author, ListAuthorsParams, CreateAuthorData, UpdateAuthorData } from '../types'

const authorSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_fictional: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  birth_location: z.string().nullable().optional(),
  death_date: z.string().nullable().optional(),
  death_location: z.string().nullable().optional(),
  views_count: z.number(),
  likes_count: z.number(),
  shares_count: z.number(),
  quotes_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const authorListResponseSchema = apiResponseSchema(z.array(authorSchema))
const authorSingleResponseSchema = apiResponseSchema(authorSchema)

type AuthorItem = z.infer<typeof authorSchema>

export class AuthorsResource {
  constructor(private client: VerbatimsClient) {}

  async list(params?: ListAuthorsParams) {
    return this.client.get('/authors', { params: params as Record<string, unknown> }, authorListResponseSchema)
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
}
