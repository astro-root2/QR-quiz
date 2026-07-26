import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlayerToken } from '@/lib/player-token'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const playerToken = await getPlayerToken()

  if (!playerToken) {
    return NextResponse.json({ error: 'not_registered' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('id, event_id, name')
    .eq('player_token', playerToken)
    .maybeSingle()

  if (playerError || !player) {
    return NextResponse.json({ error: 'invalid_player' }, { status: 401 })
  }

  const { data: button, error: buttonError } = await supabase
    .from('buttons')
    .update({
      status: 'used',
      used_by: player.id,
      used_at: new Date().toISOString(),
    })
    .eq('code', code)
    .eq('status', 'unused')
    .eq('event_id', player.event_id)
    .select('id, location_name')
    .maybeSingle()

  if (buttonError) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  if (!button) {
    const { data: existingButton } = await supabase
      .from('buttons')
      .select('status, event_id')
      .eq('code', code)
      .maybeSingle()

    if (!existingButton) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    if (existingButton.event_id !== player.event_id) {
      return NextResponse.json({ error: 'event_mismatch' }, { status: 409 })
    }
    return NextResponse.json({ error: 'already_used' }, { status: 409 })
  }

  await supabase.from('event_logs').insert({
    event_id: player.event_id,
    type: 'button_pressed',
    payload: { button_id: button.id, player_id: player.id, code },
  })

  return NextResponse.json({
    success: true,
    location_name: button.location_name,
    player_name: player.name,
  })
}
