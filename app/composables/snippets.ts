export const snippets: Record<string, string> = {
  install: `npm install @verbatims/sdk`,

  'quickstart': `import { VerbatimsClient } from '@verbatims/sdk'

const vb = new VerbatimsClient('vbt_your_api_key')

// List quotes
const { data } = await vb.quotes.list({ language: 'fr', limit: 10 })

// Get a single quote
const quote = await vb.quotes.get(42)

// Create a quote
const created = await vb.quotes.create({
  name: 'Life is what happens when you\'re busy making other plans.',
  author_id: 1,
  language: 'en',
})`,

  'nuxt-config': `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@verbatims/sdk/nuxt/module'],
})`,

  'nuxt-usage': `// Auto-imported composables
const { data } = await useQuotes({ language: 'fr', limit: 10 })
const results = await useSearchQuotes({ q: 'life', type: 'quotes' })`,

  'paginate': `// Iterate through all pages
for await (const quote of vb.quotes.paginate({ language: 'fr' })) {
  console.log(quote.id, quote.name)
}

for await (const author of vb.authors.paginate({ search: 'einstein' })) {
  console.log(author.name)
}

for await (const result of vb.search.paginate({ q: 'life', type: 'quotes' })) {
  console.log(result.name)
}`,

  'quotes-list': `const { data, pagination } = await vb.quotes.list({
  language: 'fr',
  limit: 20,
  page: 1,
  author_id: 42,
  tag: 'wisdom',
  sort_by: 'likes_count',
  sort_order: 'desc',
})`,

  'quotes-create': `const quote = await vb.quotes.create({
  name: 'The only true wisdom is in knowing you know nothing.',
  language: 'en',
  author_id: 1,
  tags: [1, 2],
})`,

  'authors': `// List authors
const { data } = await vb.authors.list({ search: 'einstein' })

// Get by ID
const author = await vb.authors.get(1)`,

  'search': `// Full-text search across quotes, authors, references
const { data } = await vb.search.query({
  q: 'life',
  type: 'quotes',
  limit: 10,
})`,

  'collections': `// Create a collection
const collection = await vb.collections.create({
  name: 'Favorites',
  is_public: true,
})

// Add a quote
await vb.collections.addQuote(collection.data.id, 42)

// Remove a quote
await vb.collections.removeQuote(collection.data.id, 42)`,

  'errors': `import {
  VerbatimsError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  AuthError,
  ForbiddenError,
} from '@verbatims/sdk'

try {
  const quote = await vb.quotes.get(999)
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log('Quote not found')
  } else if (err instanceof RateLimitError) {
    console.log(\`Rate limited, retry after \${err.retryAfter}s\`)
  } else if (err instanceof ValidationError) {
    console.log('Validation failed:', err.errors)
  }
}`,
}
