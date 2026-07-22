import { describe, it, expect, vi } from 'vitest'
import { paginate } from '../pagination'

describe('paginate', () => {
  it('yields items from a single page', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1, hasMore: false },
    })

    const results: Array<{ id: number }> = []
    for await (const item of paginate(fetchPage)) {
      results.push(item)
    }

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ id: 1 })
    expect(results[1]).toEqual({ id: 2 })
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(fetchPage).toHaveBeenCalledWith(1)
  })

  it('iterates through multiple pages', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }],
        pagination: { page: 1, limit: 1, total: 3, totalPages: 3, hasMore: true },
      })
      .mockResolvedValueOnce({
        data: [{ id: 2 }],
        pagination: { page: 2, limit: 1, total: 3, totalPages: 3, hasMore: true },
      })
      .mockResolvedValueOnce({
        data: [{ id: 3 }],
        pagination: { page: 3, limit: 1, total: 3, totalPages: 3, hasMore: false },
      })

    const results: Array<{ id: number }> = []
    for await (const item of paginate(fetchPage)) {
      results.push(item)
    }

    expect(results).toHaveLength(3)
    expect(fetchPage).toHaveBeenCalledTimes(3)
    expect(fetchPage).toHaveBeenNthCalledWith(1, 1)
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2)
    expect(fetchPage).toHaveBeenNthCalledWith(3, 3)
  })

  it('stops when data is empty', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false },
    })

    const results: Array<{ id: number }> = []
    for await (const item of paginate(fetchPage)) {
      results.push(item)
    }

    expect(results).toHaveLength(0)
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('stops when data is undefined', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: undefined,
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false },
    })

    const results: Array<{ id: number }> = []
    for await (const item of paginate(fetchPage)) {
      results.push(item)
    }

    expect(results).toHaveLength(0)
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('handles multiple items per page', async () => {
    const fetchPage = vi.fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 2, total: 4, totalPages: 2, hasMore: true },
      })
      .mockResolvedValueOnce({
        data: [{ id: 3 }, { id: 4 }],
        pagination: { page: 2, limit: 2, total: 4, totalPages: 2, hasMore: false },
      })

    const results: Array<{ id: number }> = []
    for await (const item of paginate(fetchPage)) {
      results.push(item)
    }

    expect(results).toHaveLength(4)
    expect(results[0].id).toBe(1)
    expect(results[3].id).toBe(4)
  })
})
