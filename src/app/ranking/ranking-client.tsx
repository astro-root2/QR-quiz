'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type RankingRow = { id: string; name: string; total: number }

export function RankingClient() {
  const [ranking, setRanking] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [eventId, setEventId] = useState<string | null>(null)

  const loadRanking = useCallback(async (evId: string) => {
    const supabase = createClient()

    const { data: players } = await supabase
      .from('players')
      .select('id, name')
      .eq('event_id', evId)

    const { data: scores } = await supabase
      .from('scores')
      .select('player_id, delta')
      .eq('event_id', evId)

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
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (!event) {
        setLoading(false)
        return
      }

      setEventId(event.id)
      await loadRanking(event.id)

      channel = supabase
        .channel(`ranking-${event.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scores', filter: `event_id=eq.${event.id}` },
          () => loadRanking(event.id)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'players', filter: `event_id=eq.${event.id}` },
          () => loadRanking(event.id)
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [loadRanking])

  if (loading) {
    return <p className="mt-4 text-gray-500">読み込み中</p>
  }

  if (!eventId) {
    return <p className="mt-4 text-gray-500">開催中のイベントがない</p>
  }

  return (
    <ol className="mt-4 space-y-2">
      {ranking.map((r, i) => (
        <li key={r.id} className="flex justify-between border-b py-2">
          <span>{i + 1}. {r.name}</span>
          <span className="font-bold">{r.total}</span>
        </li>
      ))}
    </ol>
  )
}
