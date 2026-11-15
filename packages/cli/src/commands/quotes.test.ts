import { describe, expect, it, vi } from 'vitest'
import { Command } from 'commander'
import { createQuoteWithOptionalSource } from './quotes.js'
import { registerQuotesCommand } from './quotes.js'
import { registerThemesCommand } from './themes.js'

const quote = {
  name: 'A line',
  language: 'en',
  attributions: [{ author_id: 3, is_primary: true }],
}

describe('createQuoteWithOptionalSource', () => {
  it('creates the quote first and then attaches the source to the primary attribution', async () => {
    const create = vi.fn().mockResolvedValue({ data: { id: 12, attributions: [{ id: 7, is_primary: true }] } })
    const createSource = vi.fn().mockResolvedValue({ success: true })
    const client = { quotes: { create, createSource } } as never

    await createQuoteWithOptionalSource(client, quote, { source_type: 'book' })

    expect(create).toHaveBeenCalledWith(quote)
    expect(createSource).toHaveBeenCalledWith(12, expect.objectContaining({ attribution_id: 7, source_type: 'book' }))
  })

  it('reports that the quote exists when source creation fails', async () => {
    const create = vi.fn().mockResolvedValue({ data: { id: 12, attributions: [{ id: 7, is_primary: true }] } })
    const createSource = vi.fn().mockRejectedValue(new Error('409 Conflict'))
    const client = { quotes: { create, createSource } } as never

    await expect(createQuoteWithOptionalSource(client, quote, { source_type: 'book' }))
      .rejects.toThrow('Quote #12 was created, but its source could not be created: 409 Conflict')
  })
})

describe('themes CLI routes', () => {
  it('does not expose commands for routes absent from the API', () => {
    const program = new Command()
    registerThemesCommand(program)
    const themes = program.commands[0]
    const names = themes?.commands.map(command => command.name()) ?? []

    expect(names).not.toContain('active')
    expect(names).not.toContain('suggestions')
    expect(names).not.toContain('suggest-name')
  })
})

describe('quotes CLI options', () => {
  it('exposes API-supported quote filters without an unsupported status filter', () => {
    const program = new Command()
    registerQuotesCommand(program)
    const list = program.commands[0]?.commands.find(command => command.name() === 'list')

    expect(list?.options.map(option => option.long)).toContain('--sort-by')
    expect(list?.options.map(option => option.long)).not.toContain('--status')
  })
})
