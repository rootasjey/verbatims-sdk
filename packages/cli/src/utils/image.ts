import fs from 'node:fs'
import path from 'node:path'
import type { VerbatimsClient } from '@verbatims/sdk'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
}

function detectMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'image/jpeg'
}

export async function uploadImageFromPath(client: VerbatimsClient, filePath: string): Promise<string> {
  const resolvedPath = path.resolve(filePath)
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`)
  }

  const stat = fs.statSync(resolvedPath)
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${resolvedPath}`)
  }

  const buffer = fs.readFileSync(resolvedPath)
  const mimeType = detectMimeType(resolvedPath)
  const blob = new Blob([buffer], { type: mimeType })

  const { data } = await client.uploadImage(blob)
  return data.url
}
