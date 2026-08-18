import { formatTable, type Format } from './format.js'
import type { PaginationMeta } from '@verbatims/sdk'

type PageFetcher = (page: number) => Promise<{
  data?: unknown[]
  pagination?: PaginationMeta
}>

export async function browse(fetchPage: PageFetcher, format: Format): Promise<void> {
  if (!process.stdin.isTTY) {
    console.error('Browse mode requires an interactive terminal.')
    process.exit(1)
  }

  let page = 1
  let hasMore = false

  process.stdin.setRawMode(true)
  process.stdin.resume()

  const render = async () => {
    const result = await fetchPage(page)
    const items = result.data ?? []
    const pagination = result.pagination
    hasMore = pagination?.hasMore ?? false

    console.clear()

    if (items.length === 0) {
      console.log('No results')
      return false
    }

    const allKeys = Object.keys(items[0] as Record<string, unknown>)
    const keyOrder = ['id', 'content', 'name', 'language', 'type', 'author', 'reference', 'source', 'attributions', 'sources', 'quotes_count']
    const columns = keyOrder
      .filter((k) => allKeys.includes(k))
      .map((k) => ({ key: k, label: k }))

    const table = formatTable(items as Record<string, unknown>[], columns)
    console.log(table)

    if (pagination) {
      console.log(`\nPage ${pagination.page}/${pagination.totalPages} — ${pagination.total} total`)
    }

    if (hasMore || page > 1) {
      const nav = []
      if (page > 1) nav.push('◀ p')
      if (hasMore) nav.push('n ▶')
      nav.push('q quit')
      console.log(`\n${nav.join('  │  ')}`)
    } else {
      console.log('\nq quit')
    }

    return true
  }

  await render()

  const onKey = async (key: string) => {
    if (key === 'q' || key === '\u001b') {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener('data', onData)
      console.log()
      return
    }

    if ((key === 'n' || key === ' ' || key === '\u001b[C') && hasMore) {
      page++
      await render()
    }

    if ((key === 'p' || key === '\u001b[D') && page > 1) {
      page--
      await render()
    }
  }

  const onData = (buf: Buffer) => {
    const key = buf.toString()
    onKey(key)
  }

  process.stdin.on('data', onData)
}
