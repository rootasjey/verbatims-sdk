import type { PaginationMeta } from './types'

export interface PageFetcher<T> {
  (page: number): Promise<{
    data?: T[]
    pagination?: PaginationMeta
  }>
}

export async function* paginate<T>(fetchPage: PageFetcher<T>): AsyncGenerator<T> {
  let page = 1

  while (true) {
    const result = await fetchPage(page)
    const items = result.data
    if (!items || items.length === 0) break

    for (const item of items) {
      yield item
    }

    if (!result.pagination?.hasMore) break
    page++
  }
}
