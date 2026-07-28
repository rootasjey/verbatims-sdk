import { VerbatimsClient as BaseClient } from './client'
import { QuotesResource } from './resources/quotes'
import { AuthorsResource } from './resources/authors'
import { ReferencesResource } from './resources/references'
import { TagsResource } from './resources/tags'
import { CollectionsResource } from './resources/collections'
import { SearchResource } from './resources/search'
import { ThemesResource } from './resources/themes'

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
} from './types'

export class VerbatimsClient extends BaseClient {
  quotes: QuotesResource
  authors: AuthorsResource
  references: ReferencesResource
  tags: TagsResource
  collections: CollectionsResource
  search: SearchResource
  themes: ThemesResource

  constructor(apiKey: string, opts?: ConstructorParameters<typeof BaseClient>[1]) {
    super(apiKey, opts)
    this.quotes = new QuotesResource(this)
    this.authors = new AuthorsResource(this)
    this.references = new ReferencesResource(this)
    this.tags = new TagsResource(this)
    this.collections = new CollectionsResource(this)
    this.search = new SearchResource(this)
    this.themes = new ThemesResource(this)
  }
}
