import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import type { CreateCollectionData } from '../types'

const collectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_public: z.boolean().optional(),
  quote_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const collectionResponseSchema = apiResponseSchema(collectionSchema)
const collectionActionResponseSchema = apiResponseSchema(z.undefined()).or(z.object({
  success: z.literal(true),
  message: z.string().optional(),
}))

export class CollectionsResource {
  constructor(private client: VerbatimsClient) {}

  async create(data: CreateCollectionData) {
    return this.client.post('/collections', data, {}, collectionResponseSchema)
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
