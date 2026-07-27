import { NextRequest, NextResponse } from 'next/server'
import { ZipArchive } from 'archiver'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOwner } from '@/lib/require-owner'
import { composeQrPng } from '@/lib/qr-image'

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
  const archive = new ZipArchive({ zlib: { level: 9 } })
  const chunks: Buffer[] = []

  archive.on('data', (chunk: Buffer) => {
    chunks.push(chunk)
  })

  const done = new Promise<void>((resolve, reject) => {
    archive.on('end', () => resolve())
    archive.on('error', (err) => reject(err))
  })

  for (const button of buttons) {
    const url = `${baseUrl}/button/${button.code}`
    const png = await composeQrPng(url, button.location_name)
    const safeName = (button.location_name || button.code).replace(/[\\/:*?"<>|]/g, '_')
    archive.append(png, { name: `${safeName}_${button.code}.png` })
  }

  await archive.finalize()
  await done

  const zipBuffer = Buffer.concat(chunks)

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="qr_buttons.zip"',
    },
  })
}

