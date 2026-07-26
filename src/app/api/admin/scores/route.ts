import { NextRequest, NextResponse } from 'next/server'
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
    return NextResponse.json({ history: [] })
  }

  const { data: history } = await supabase
    .from('scores')
    .select('id, delta, reason, admin_email, created_at, players:player_id(name)')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ history: history ?? [] })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
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

  if (playerError || !player) {
    return NextResponse.json({ error: 'player_not_found' }, { status: 404 })
  }

  const { error: insertError } = await supabase.from('scores').insert({
    player_id: player.id,
    event_id: player.event_id,
    delta,
    reason,
    admin_id: admin.userId,
    admin_email: admin.email,
  })

  if (insertError) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
