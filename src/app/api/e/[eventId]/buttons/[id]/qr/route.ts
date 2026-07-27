import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOwner } from '@/lib/require-owner'
import { composeQrPng, composeQrSvg } from '@/lib/qr-image'

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
  { params }: { params: Promise<{ eventId: string; id: string }> }
) {
  const { eventId, id } = await params
  const owner = await requireOwner(eventId)
  if (!owner) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const format = request.nextUrl.searchParams.get('format') === 'svg' ? 'svg' : 'png'
  const supabase = createAdminClient()

  const { data: button } = await supabase
    .from('buttons')
    .select('id, code, location_name, event_id')
    .eq('id', id)
    .maybeSingle()

  // ボタンが存在しない、または別イベントのものなら 404 として扱う
  // (別オーナーのイベントIDを差し替えて他人のボタンIDを推測されても漏れないようにする)
  if (!button || button.event_id !== eventId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const url = `${getBaseUrl(request)}/button/${button.code}`

  if (format === 'svg') {
    const svg = await composeQrSvg(url, button.location_name)
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${button.code}.svg"`,
      },
    })
  }

  const png = await composeQrPng(url, button.location_name)
  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${button.code}.png"`,
    },
  })
}

