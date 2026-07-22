import { VerbatimsClient as BaseClient } from './client'
import { QuotesResource } from './resources/quotes'
import { AuthorsResource } from './resources/authors'
import { ReferencesResource } from './resources/references'
import { TagsResource } from './resources/tags'
import { CollectionsResource } from './resources/collections'
import { SearchResource } from './resources/search'

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
  QuoteWithRelations,
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
  CreateAuthorData,
  UpdateAuthorData,
  CreateReferenceData,
  UpdateReferenceData,
  CreateCollectionData,
} from './types'

export class VerbatimsClient extends BaseClient {
  quotes: QuotesResource
  authors: AuthorsResource
  references: ReferencesResource
  tags: TagsResource
  collections: CollectionsResource
  search: SearchResource

  constructor(apiKey: string, opts?: ConstructorParameters<typeof BaseClient>[1]) {
    super(apiKey, opts)
    this.quotes = new QuotesResource(this)
    this.authors = new AuthorsResource(this)
    this.references = new ReferencesResource(this)
    this.tags = new TagsResource(this)
    this.collections = new CollectionsResource(this)
    this.search = new SearchResource(this)
  }
}
