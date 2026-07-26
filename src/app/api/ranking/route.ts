import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ ranking: [] })
  }

  const { data: players } = await supabase
    .from('players')
    .select('id, name')
    .eq('event_id', event.id)

  const { data: scores } = await supabase
    .from('scores')
    .select('player_id, delta')
    .eq('event_id', event.id)

  const totals = new Map<string, number>()
  for (const p of players ?? []) totals.set(p.id, 0)
  for (const s of scores ?? []) {
    totals.set(s.player_id, (totals.get(s.player_id) ?? 0) + s.delta)
  }

  const ranking = (players ?? [])
    .map((p) => ({ id: p.id, name: p.name, total: totals.get(p.id) ?? 0 }))
    .sort((a, b) => b.total - a.total)

  return NextResponse.json({ ranking })
}
