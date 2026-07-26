import { NextResponse } from 'next/server'
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
    return NextResponse.json({ players: [] })
  }

  const { data: players } = await supabase
    .from('players')
    .select('id, name, created_at')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true })

  const { data: scores } = await supabase
    .from('scores')
    .select('player_id, delta')
    .eq('event_id', event.id)

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
