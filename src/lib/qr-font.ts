import { readFile } from 'fs/promises'
import path from 'path'

let cachedFontBase64: string | null = null

export async function getNotoSansJpBase64(): Promise<string> {
  if (cachedFontBase64) return cachedFontBase64
  const fontPath = path.join(process.cwd(), 'src/fonts/NotoSansJP-Regular.ttf')
  const buf = await readFile(fontPath)
  cachedFontBase64 = buf.toString('base64')
  return cachedFontBase64
}

export function getNotoSansJpPath(): string {
  return path.join(process.cwd(), 'src/fonts/NotoSansJP-Regular.ttf')
}
