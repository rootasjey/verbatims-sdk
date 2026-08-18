import chalk from 'chalk'

export type Format = 'table' | 'json' | 'plain'

const stripAnsi = (s: string) => s.replace(/\x1B\[[0-?9;]*[mK]/g, '')

function padVisual(s: string, max: number): string {
  const padLen = Math.max(0, max - stripAnsi(s).length)
  return s + ' '.repeat(padLen)
}

function wordWrap(s: string, max: number): string[] {
  if (stripAnsi(s).length <= max) return [s]
  const lines: string[] = []
  let current = ''
  for (const word of s.split(' ')) {
    const cleanWord = stripAnsi(word)
    const cleanCurrent = stripAnsi(current)
    if (cleanCurrent.length + cleanWord.length + (cleanCurrent.length > 0 ? 1 : 0) > max) {
      if (cleanCurrent.length > 0) {
        lines.push(current)
        current = word
      } else {
        lines.push(word)
        current = ''
      }
    } else {
      current += (current ? ' ' : '') + word
    }
  }
  if (current) lines.push(current)
  return lines
}

function terminalWidth(): number {
  return process.stdout.columns ?? 100
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return chalk.dim('—')
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if ('name' in obj && typeof obj.name === 'string') return obj.name
    if ('views' in obj && 'likes' in obj) {
      const v = obj.views ?? 0
      const l = obj.likes ?? 0
      return `${chalk.dim('👁')} ${v} ${chalk.dim('❤')} ${l}`
    }
    if (Array.isArray(value)) {
      return value.map((item) => {
        if (typeof item === 'object' && item && 'name' in item) return (item as { name: string }).name
        return String(item)
      }).join(', ') || chalk.dim('—')
    }
    return chalk.dim('…')
  }
  if (typeof value === 'boolean') return value ? chalk.green('✓') : chalk.dim('✗')
  return String(value)
}

const FIXED = ['id', 'language', 'featured', 'stats']

export function formatTable<T extends Record<string, unknown>>(
  items: T[],
  columns: { key: keyof T; label: string }[],
): string {
  if (items.length === 0) return chalk.dim('No results')

  const colSizes = columns.map((col) => {
    return Math.max(
      col.label.length,
      ...items.map((item) => stripAnsi(formatCell(item[col.key])).length),
    )
  })

  const total = colSizes.reduce((a, b) => a + b + 3, 0) + 1
  const terminal = terminalWidth()

  if (total > terminal) {
    const overflow = total - terminal
    const contentIdx = columns.findIndex((c) => c.key === 'content' || c.key === 'name')
    if (contentIdx !== -1) {
      colSizes[contentIdx] = Math.max(24, colSizes[contentIdx]! - overflow)
    }
  }

  const secondTotal = colSizes.reduce((a, b) => a + b + 3, 0) + 1
  if (secondTotal > terminal) {
    const overflow2 = secondTotal - terminal
    const flexIdxs = columns
      .map((c, i) => ({ key: c.key as string, i }))
      .filter((c) => !FIXED.includes(c.key) && c.key !== 'content' && c.key !== 'name')
    const flexTotal = flexIdxs.reduce((s, { i }) => s + colSizes[i]!, 0)
    if (flexTotal > 0) {
      for (const { i } of flexIdxs) {
        colSizes[i] = Math.max(3, colSizes[i]! - Math.round(overflow2 * colSizes[i]! / flexTotal))
      }
    }
  }

  const sep = (left: string, mid: string, right: string) =>
    left + columns.map((col, i) => '─'.repeat(colSizes[i]! + 2) + (i < columns.length - 1 ? mid : '')).join('') + right

  const cell = (vals: string[]) =>
    '│' + vals.map((v, i) => ` ${padVisual(v, colSizes[i]!)} │`).join('')

  const headerLine = cell(columns.map((col, i) => chalk.bold(padVisual(col.label, colSizes[i]!))))

  const rowParts = items.map((item) => {
    const cellLines = columns.map((col, i) => wordWrap(formatCell(item[col.key]), colSizes[i]!))
    const maxLines = Math.max(...cellLines.map((l) => l.length), 1)
    const lines: string[] = []
    for (let line = 0; line < maxLines; line++) {
      const vals = columns.map((_col, i) => cellLines[i]![line] ?? '')
      lines.push(cell(vals))
    }
    return lines.join('\n')
  })

  const top = sep('┌', '┬', '┐')
  const mid = sep('├', '┼', '┤')
  const bot = sep('└', '┴', '┘')

  return [top, headerLine, mid, ...rowParts, bot].join('\n')
}

export function output(data: unknown, format: Format): void {
  if (format === 'json') {
    console.log(JSON.stringify(data, null, 2))
    return
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log(chalk.dim('No results'))
      return
    }

    const allKeys = Object.keys(data[0] as Record<string, unknown>)
    const keyOrder = ['id', 'content', 'name', 'language', 'type', 'author', 'reference', 'source', 'attributions', 'sources', 'quotes_count', 'platform', 'label', 'enabled', 'status', 'position', 'quote_text', 'quote_language', 'author_name', 'reference_name', 'post_text', 'post_url', 'posted_at', 'error_message']
    const columns = keyOrder
      .filter((k) => allKeys.includes(k))
      .map((k) => ({ key: k, label: k }))

    if (format === 'table') {
      console.log(formatTable(data as Record<string, unknown>[], columns))
    } else {
      for (const item of data) {
        console.log(formatItem(item as Record<string, unknown>))
        console.log()
      }
    }
    return
  }

  if (typeof data === 'object' && data !== null) {
    if (format === 'table') {
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.log(formatItem(data as Record<string, unknown>))
    }
    return
  }

  console.log(String(data))
}

function formatItem(item: Record<string, unknown>): string {
  return Object.entries(item)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${chalk.bold(k)}: ${formatCell(v)}`)
    .join('\n')
}
