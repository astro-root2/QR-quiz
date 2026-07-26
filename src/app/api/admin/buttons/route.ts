import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ buttons: [] })
  }

  const { data: buttons } = await supabase
    .from('buttons')
    .select('id, code, location_name, status, used_at, used_by, players:used_by(name)')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ buttons: buttons ?? [] })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const locationNames = body.location_names as string[]

  if (!Array.isArray(locationNames) || locationNames.length === 0) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ error: 'no_active_event' }, { status: 400 })
  }

  const rows = locationNames.map((name) => ({
    event_id: event.id,
    code: nanoid(12),
    location_name: name,
  }))

  const { data: inserted, error } = await supabase
    .from('buttons')
    .insert(rows)
    .select('id, code, location_name')

  if (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ buttons: inserted })
}
