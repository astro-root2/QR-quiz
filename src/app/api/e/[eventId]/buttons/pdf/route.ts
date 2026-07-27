import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import PDFDocument from 'pdfkit'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOwner } from '@/lib/require-owner'
import { getNotoSansJpPath } from '@/lib/qr-font'

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return request.nextUrl.origin
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const owner = await requireOwner(eventId)
  if (!owner) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: buttons } = await supabase
    .from('buttons')
    .select('code, location_name')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (!buttons || buttons.length === 0) {
    return NextResponse.json({ error: 'no_buttons' }, { status: 400 })
  }

  const baseUrl = getBaseUrl(request)

  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  doc.registerFont('NotoSansJP', getNotoSansJpPath())
  doc.font('NotoSansJP')

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  const done = new Promise<void>((resolve, reject) => {
    doc.on('end', () => resolve())
    doc.on('error', (err) => reject(err))
  })

  const margin = 40
  const pageWidth = doc.page.width
  const pageHeight = doc.page.height
  const cols = 2
  const rows = 3
  const perPage = cols * rows
  const cellWidth = (pageWidth - margin * 2) / cols
  const cellHeight = (pageHeight - margin * 2) / rows
  const qrSize = Math.min(cellWidth, cellHeight) - 60

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i]
    const posInPage = i % perPage
    if (i > 0 && posInPage === 0) {
      doc.addPage()
    }

    const col = posInPage % cols
    const row = Math.floor(posInPage / cols)
    const cellX = margin + col * cellWidth
    const cellY = margin + row * cellHeight

    const url = `${baseUrl}/button/${button.code}`
    const qrPng = await QRCode.toBuffer(url, { type: 'png', margin: 1, width: 400 })

    const qrX = cellX + (cellWidth - qrSize) / 2
    const qrY = cellY + 20

    doc.image(qrPng, qrX, qrY, { width: qrSize, height: qrSize })

    doc.font('NotoSansJP').fontSize(14).fillColor('black').text(
      button.location_name,
      cellX,
      qrY + qrSize + 10,
      { width: cellWidth, align: 'center' }
    )
  }

  doc.end()
  await done

  const pdfBuffer = Buffer.concat(chunks)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="qr_buttons.pdf"',
    },
  })
}

