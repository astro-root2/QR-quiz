import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOwner } from '@/lib/require-owner'

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

  const { data: history } = await supabase
    .from('scores')
    .select('id, delta, reason, admin_email, created_at, players:player_id(name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ history: history ?? [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const owner = await requireOwner(eventId)
  if (!owner) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const playerId = body.player_id as string
  const delta = Number(body.delta)
  const reason = (body.reason as string) || null

  if (!playerId || !Number.isInteger(delta) || delta === 0) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('id, event_id')
    .eq('id', playerId)
    .maybeSingle()

  if (playerError || !player || player.event_id !== eventId) {
    return NextResponse.json({ error: 'player_not_found' }, { status: 404 })
  }

  const { error: insertError } = await supabase.from('scores').insert({
    player_id: player.id,
    event_id: eventId,
    delta,
    reason,
    admin_id: owner.userId,
    admin_email: owner.email,
  })

  if (insertError) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

