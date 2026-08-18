# @verbatims/sdk

TypeScript SDK for the [Verbatims](https://verbatims.cc) quotes API.

Version 2 uses normalized quote provenance. The legacy quote-level author, reference, and source fields are no longer part of the SDK contract.

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
  provenance: {
    author_id: 1,
    source: {
      source_type: 'book',
      source_url: 'https://example.com/edition',
    },
  },
  language: 'en',
})

// Quote provenance is available on quote details
console.log(quote.data?.attributions, quote.data?.sources)

// Iterate through all pages
for await (const quote of vb.quotes.paginate({ language: 'fr' })) {
  console.log(quote.id, quote.name)
}
```

## Resources

| Resource | Methods |
|---|---|
| `vb.quotes` | `list`, `get`, `create`, `update`, `delete`, `submit`, `moderate`, `paginate` |
| `vb.authors` | `list`, `get`, `create`, `update`, `paginate` |
| `vb.references` | `list`, `get`, `create`, `update`, `paginate` |
| `vb.tags` | `list`, `paginate` |
| `vb.collections` | `create`, `addQuote`, `removeQuote` |
| `vb.search` | `query`, `paginate` |
| `vb.themes` | `list`, `get`, `create`, `update`, `delete`, `activate`, `setDefault`, `getActive`, `getFeed`, `paginate` |
| `vb.social` | `listPlatforms`, `listQueue`, `getQueueItem`, `addToQueue`, `addRandomToQueue`, `removeQueueItem`, `clearQueue`, `reorderQueueItem`, `runNow`, `requeueQueueItem`, `listPosts`, `paginateQueue` |

Quote details expose normalized provenance through `attributions` and `sources`. Attribution statuses are `unverified`, `manually_verified`, `externally_verified`, or `disputed`. Moderator/admin API keys can manage provenance with `listAttributions`, `createAttribution`, `updateAttribution`, `deleteAttribution`, and the corresponding source methods.

Quote creation and updates use `provenance` for author, reference, and source data.

## Social queue

Manage the auto-post queue of quotes on social platforms (x, bluesky, instagram, threads, facebook, pinterest).

```ts
// List platforms with queue stats
const { data } = await vb.social.listPlatforms()

// List queued items for a platform
const { data } = await vb.social.listQueue({ platform: 'bluesky', status: 'queued', limit: 20 })

// Enqueue approved quotes
const { data } = await vb.social.addToQueue({ quote_ids: [42, 57], platform: 'bluesky' })

// Enqueue 5 random approved quotes
const { data } = await vb.social.addRandomToQueue({ platform: 'x', count: 5, language: 'fr' })

// Publish the next eligible item immediately
const { data } = await vb.social.runNow({ platform: 'bluesky' })

// Iterate through all queue items
for await (const item of vb.social.paginateQueue({ platform: 'x' })) {
  console.log(item.id, item.quote_text)
}
```

Requires an API key with the `moderator`/`admin` role and the `social:read` / `social:write` permissions.

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
