import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOwner } from '@/lib/require-owner'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; id: string }> }
) {
  const { eventId, id } = await params
  const owner = await requireOwner(eventId)
  if (!owner) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const locationName = (body.location_name as string)?.trim()

  if (!locationName) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: button } = await supabase
    .from('buttons')
    .select('id, event_id')
    .eq('id', id)
    .maybeSingle()

  if (!button || button.event_id !== eventId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('buttons')
    .update({ location_name: locationName })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

