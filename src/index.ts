import { z } from 'zod/v4'
import { VerbatimsClient as BaseClient } from './client'
import { QuotesResource } from './resources/quotes'
import { AuthorsResource } from './resources/authors'
import { ReferencesResource } from './resources/references'
import { TagsResource } from './resources/tags'
import { CollectionsResource } from './resources/collections'
import { SearchResource } from './resources/search'
import { ThemesResource } from './resources/themes'
import { SocialResource } from './resources/social'
import type { UploadedImage } from './types'
import { apiResponseSchema } from './types'

export type { ClientOptions } from './client'
export { paginate } from './pagination'
export type { PageFetcher } from './pagination'

export {
  VerbatimsError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  AuthError,
  ForbiddenError,
} from './errors'

export type {
  QuoteStatus,
  QuoteWithRelations,
  QuoteAttribution,
  QuoteSource,
  ProvenanceStatus,
  QuoteStats,
  CreateQuoteAttributionData,
  UpdateQuoteAttributionData,
  CreateQuoteSourceData,
  UpdateQuoteSourceData,
  Author,
  QuoteReference,
  PaginationMeta,
  ApiResponse,
  ListQuotesParams,
  ListAuthorsParams,
  ListReferencesParams,
  SearchParams,
  CreateQuoteData,
  UpdateQuoteData,
  ModerateQuoteData,
  CreateAuthorData,
  UpdateAuthorData,
  CreateReferenceData,
  UpdateReferenceData,
  CreateCollectionData,
  Theme,
  ThemeFilter,
  ThemeTranslation,
  ThemeSuggestion,
  ThemeFeed,
  ThemeFeedTheme,
  ThemeFeedQuote,
  ThemeFeedAuthor,
  ThemeFeedReference,
  AddQuoteTagData,
  ThemeWithDetails,
  ListThemesParams,
  CreateThemeData,
  UpdateThemeData,
  AddFilterData,
  FilterSuggestion,
  FilterRecommendationsData,
  FilterRecommendation,
  ThemeNameSuggestion,
  ThemeSuggestionItem,
  ActiveThemeParams,
  FeedParams,
  ThemeSuggestionsQuery,
  UploadedImage,
  SocialPlatform,
  SocialQueueStatus,
  SocialPostStatus,
  SocialPlatformInfo,
  SocialQueueStats,
  SocialResolvedContent,
  SocialQueueItem,
  SocialPost,
  QueuedSocialItem,
  SocialQueueListResult,
  ListSocialQueueParams,
  ListSocialPostsParams,
  AddToSocialQueueData,
  AddRandomToSocialQueueData,
  ClearSocialQueueData,
  ReorderSocialQueueData,
  RunSocialAutopostData,
} from './types'

export class VerbatimsClient extends BaseClient {
  quotes: QuotesResource
  authors: AuthorsResource
  references: ReferencesResource
  tags: TagsResource
  collections: CollectionsResource
  search: SearchResource
  themes: ThemesResource
  social: SocialResource

  constructor(apiKey: string, opts?: ConstructorParameters<typeof BaseClient>[1]) {
    super(apiKey, opts)
    this.quotes = new QuotesResource(this)
    this.authors = new AuthorsResource(this)
    this.references = new ReferencesResource(this)
    this.tags = new TagsResource(this)
    this.collections = new CollectionsResource(this)
    this.search = new SearchResource(this)
    this.themes = new ThemesResource(this)
    this.social = new SocialResource(this)
  }

  async uploadImage(file: Blob) {
    const uploadSchema = apiResponseSchema(z.object({ url: z.string() }))
    return this.uploadFile('/upload/image', file, 'image', uploadSchema) as Promise<{ success: boolean; data: UploadedImage }>
  }
}
