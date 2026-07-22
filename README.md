# @verbatims/sdk

TypeScript SDK for the [Verbatims](https://verbatims.cc) quotes API.

## Install

```bash
npm install @verbatims/sdk
```

## Usage

```ts
import { VerbatimsClient } from '@verbatims/sdk'

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
})

// Iterate through all pages
for await (const quote of vb.quotes.paginate({ language: 'fr' })) {
  console.log(quote.id, quote.name)
}
```

## Resources

| Resource | Methods |
|---|---|
| `vb.quotes` | `list`, `get`, `create`, `update`, `delete`, `paginate` |
| `vb.authors` | `list`, `get`, `create`, `update`, `paginate` |
| `vb.references` | `list`, `get`, `create`, `update`, `paginate` |
| `vb.tags` | `list`, `paginate` |
| `vb.collections` | `create`, `addQuote`, `removeQuote` |
| `vb.search` | `query`, `paginate` |

## Nuxt module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@verbatims/sdk/nuxt/module'],
})
```

Composables `useVerbatimsClient`, `useQuotes`, `useSearchQuotes` are auto-imported.

## License

MIT
