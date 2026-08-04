import { z } from 'zod/v4'
import type { VerbatimsClient } from '../client'
import { apiResponseSchema } from '../types'
import { paginate } from '../pagination'
import type {
  SocialQueueItem,
  ListSocialQueueParams,
  ListSocialPostsParams,
  AddToSocialQueueData,
  AddRandomToSocialQueueData,
  ClearSocialQueueData,
  ReorderSocialQueueData,
  RunSocialAutopostData,
} from '../types'

const socialQueueStatsSchema = z.object({
  queued: z.number(),
  processing: z.number(),
  posted: z.number(),
  failed: z.number(),
})

const socialResolvedContentSchema = z.object({
  source_type: z.string(),
  source_id: z.number(),
  primary_text: z.string().nullable(),
  secondary_text: z.string().nullable(),
  canonical_path: z.string().nullable(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  language: z.string().nullable(),
})

const socialQueueItemSchema = z.object({
  id: z.number(),
  quote_id: z.number(),
  source_type: z.string(),
  source_id: z.number(),
  platform: z.enum(['x', 'bluesky', 'instagram', 'threads', 'facebook', 'pinterest']),
  status: z.enum(['queued', 'processing', 'posted', 'failed']),
  position: z.number(),
  scheduled_for: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  published_post_url: z.string().nullable(),
  published_external_post_id: z.string().nullable(),
  published_posted_at: z.string().nullable(),
  error_message: z.string().nullable(),
  quote_posts_count: z.number(),
  quote_text: z.string().nullable(),
  quote_language: z.string().nullable(),
  author_name: z.string().nullable(),
  reference_name: z.string().nullable(),
  resolved_content: socialResolvedContentSchema.nullable(),
})

const socialPostSchema = z.object({
  id: z.number(),
  quote_id: z.number(),
  source_type: z.string(),
  source_id: z.number(),
  queue_id: z.number().nullable(),
  platform: z.enum(['x', 'bluesky', 'instagram', 'threads', 'facebook', 'pinterest']),
  status: z.enum(['success', 'failed']),
  post_text: z.string().nullable(),
  post_url: z.string().nullable(),
  external_post_id: z.string().nullable(),
  error_message: z.string().nullable(),
  posted_at: z.string().nullable(),
  created_at: z.string().nullable(),
})

const socialPlatformSchema = z.object({
  platform: z.enum(['x', 'bluesky', 'instagram', 'threads', 'facebook', 'pinterest']),
  label: z.string(),
  enabled: z.boolean(),
  queue: socialQueueStatsSchema,
})

const queuedItemSchema = z.object({
  id: z.number(),
  quote_id: z.number(),
  source_type: z.string(),
  source_id: z.number(),
  position: z.number(),
  status: z.enum(['queued', 'processing', 'posted', 'failed']).optional(),
})

const socialQueueListResponseSchema = apiResponseSchema(z.object({
  queue: z.array(socialQueueItemSchema),
  stats: socialQueueStatsSchema,
}))

const socialPostsListResponseSchema = apiResponseSchema(z.object({
  posts: z.array(socialPostSchema),
}))

const socialPlatformsResponseSchema = apiResponseSchema(z.array(socialPlatformSchema))

const enqueueResponseSchema = apiResponseSchema(z.array(queuedItemSchema)).extend({
  count: z.number().optional(),
})

const deleteQueueItemResponseSchema = apiResponseSchema(z.object({
  deleted: z.literal(true),
  id: z.number(),
  sourceType: z.string(),
  sourceId: z.number(),
}))

const clearQueueResponseSchema = apiResponseSchema(z.object({
  deleted: z.literal(true),
  platform: z.string(),
  deletedCount: z.number(),
  sourceTypes: z.array(z.object({
    sourceType: z.string(),
    count: z.number(),
  })),
}))

const reorderQueueResponseSchema = apiResponseSchema(z.object({
  moved: z.boolean(),
  id: z.number().optional(),
  sourceType: z.string().optional(),
  sourceId: z.number().optional(),
  position: z.number().optional(),
}))

const requeueQueueItemResponseSchema = apiResponseSchema(z.object({
  requeued: z.literal(true),
  id: z.number(),
}))

export class SocialResource {
  constructor(private client: VerbatimsClient) {}

  async listPlatforms() {
    return this.client.get('/social/platforms', {}, socialPlatformsResponseSchema)
  }

  async listQueue(params?: ListSocialQueueParams) {
    return this.client.get('/social/queue', { params: params as Record<string, unknown> }, socialQueueListResponseSchema)
  }

  paginateQueue(params?: ListSocialQueueParams): AsyncGenerator<SocialQueueItem> {
    return paginate<SocialQueueItem>((page) =>
      this.listQueue({ ...params, page }).then(r => ({
        data: r.data?.queue,
        pagination: r.pagination,
      }))
    )
  }

  async getQueueItem(id: number) {
    return this.client.get(`/social/queue/${id}`, {}, apiResponseSchema(socialQueueItemSchema))
  }

  async addToQueue(data: AddToSocialQueueData) {
    return this.client.post('/social/queue', data, {}, enqueueResponseSchema)
  }

  async addRandomToQueue(data: AddRandomToSocialQueueData) {
    return this.client.post('/social/queue/bulk-random', data, {}, enqueueResponseSchema)
  }

  async removeQueueItem(id: number) {
    return this.client.delete(`/social/queue/${id}`, {}, deleteQueueItemResponseSchema)
  }

  async clearQueue(data: ClearSocialQueueData) {
    return this.client.post('/social/queue/clear', data, {}, clearQueueResponseSchema)
  }

  async reorderQueueItem(data: ReorderSocialQueueData) {
    return this.client.post('/social/queue/reorder', data, {}, reorderQueueResponseSchema)
  }

  async runNow(data?: RunSocialAutopostData) {
    return this.client.post('/social/queue/run-now', data ?? {}, {}, apiResponseSchema(z.record(z.string(), z.unknown())))
  }

  async requeueQueueItem(id: number) {
    return this.client.post(`/social/queue/${id}/requeue`, {}, {}, requeueQueueItemResponseSchema)
  }

  async listPosts(params?: ListSocialPostsParams) {
    return this.client.get('/social/posts', { params: params as Record<string, unknown> }, socialPostsListResponseSchema)
  }
}

