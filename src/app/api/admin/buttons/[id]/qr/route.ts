import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/require-admin'
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
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const format = request.nextUrl.searchParams.get('format') === 'svg' ? 'svg' : 'png'
  const supabase = createAdminClient()

  const { data: button } = await supabase
    .from('buttons')
    .select('id, code, location_name')
    .eq('id', (await params).id)
    .maybeSingle()

  if (!button) {
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
