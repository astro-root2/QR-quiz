'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type RankingRow = { id: string; name: string; total: number }

export function RankingClient({ eventId }: { eventId: string }) {
  const [ranking, setRanking] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadRanking = useCallback(async () => {
    const supabase = createClient()

    const { data: players } = await supabase
      .from('players')
      .select('id, name')
      .eq('event_id', eventId)

    const { data: scores } = await supabase
      .from('scores')
      .select('player_id, delta')
      .eq('event_id', eventId)

    const totals = new Map<string, number>()
    for (const p of players ?? []) totals.set(p.id, 0)
    for (const s of scores ?? []) {
      totals.set(s.player_id, (totals.get(s.player_id) ?? 0) + s.delta)
    }

    const result = (players ?? [])
      .map((p) => ({ id: p.id, name: p.name, total: totals.get(p.id) ?? 0 }))
      .sort((a, b) => b.total - a.total)

    setRanking(result)
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    const supabase = createClient()

    loadRanking()

    const channel = supabase
      .channel(`ranking-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores', filter: `event_id=eq.${eventId}` },
        () => loadRanking()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `event_id=eq.${eventId}` },
        () => loadRanking()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, loadRanking])

  if (loading) {
    return <p className="mt-4 text-gray-500">読み込み中</p>
  }

  return (
    <ol className="mt-4 space-y-2">
      {ranking.map((r, i) => (
        <li key={r.id} className="flex justify-between border-b py-2">
          <span>
            {i + 1}. {r.name}
          </span>
          <span className="font-bold">{r.total}</span>
        </li>
      ))}
    </ol>
  )
}

