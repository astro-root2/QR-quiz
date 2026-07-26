import QRCode from 'qrcode'
import sharp from 'sharp'
import { getNotoSansJpBase64 } from './qr-font'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function composeQrPng(url: string, label: string): Promise<Buffer> {
  const qrSize = 480
  const labelHeight = 80
  const totalHeight = qrSize + labelHeight

  const qrPng = await QRCode.toBuffer(url, { type: 'png', margin: 1, width: qrSize })
  const qrBase64 = qrPng.toString('base64')
  const fontBase64 = await getNotoSansJpBase64()

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${qrSize}" height="${totalHeight}">
  <defs>
    <style>
      @font-face {
        font-family: 'NotoSansJP';
        src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
      }
      text { font-family: 'NotoSansJP'; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="white"/>
  <image href="data:image/png;base64,${qrBase64}" x="0" y="0" width="${qrSize}" height="${qrSize}"/>
  <text x="${qrSize / 2}" y="${qrSize + 48}" font-size="32" text-anchor="middle" fill="black">${escapeXml(label)}</text>
</svg>
`.trim()

  return sharp(Buffer.from(svg)).png().toBuffer()
}

export async function composeQrSvg(url: string, label: string): Promise<string> {
  const qrSize = 480
  const labelHeight = 80
  const totalHeight = qrSize + labelHeight

  const qrSvgRaw = await QRCode.toString(url, { type: 'svg', margin: 1 })
  const innerMatch = qrSvgRaw.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/)
  const viewBox = innerMatch ? innerMatch[1] : `0 0 ${qrSize} ${qrSize}`
  const inner = innerMatch ? innerMatch[2] : ''
  const fontBase64 = await getNotoSansJpBase64()

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${qrSize}" height="${totalHeight}" viewBox="0 0 ${qrSize} ${totalHeight}">
  <defs>
    <style>
      @font-face {
        font-family: 'NotoSansJP';
        src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
      }
      text { font-family: 'NotoSansJP'; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="white"/>
  <svg x="0" y="0" width="${qrSize}" height="${qrSize}" viewBox="${viewBox}">${inner}</svg>
  <text x="${qrSize / 2}" y="${qrSize + 48}" font-size="32" text-anchor="middle" fill="black">${escapeXml(label)}</text>
</svg>
`.trim()
}
