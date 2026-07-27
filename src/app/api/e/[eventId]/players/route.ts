import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOwner } from '@/lib/require-owner'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const owner = await requireOwner(eventId)
  if (!owner) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: players } = await supabase
    .from('players')
    .select('id, name, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  const { data: scores } = await supabase
    .from('scores')
    .select('player_id, delta')
    .eq('event_id', eventId)

  const totals = new Map<string, number>()
  for (const p of players ?? []) totals.set(p.id, 0)
  for (const s of scores ?? []) {
    totals.set(s.player_id, (totals.get(s.player_id) ?? 0) + s.delta)
  }

  const result = (players ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    total: totals.get(p.id) ?? 0,
  }))

  return NextResponse.json({ players: result })
}

