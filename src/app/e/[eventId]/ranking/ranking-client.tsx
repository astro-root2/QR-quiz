'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type RankingRow = { id: string; name: string; total: number }

export function RankingClient({ eventId }: { eventId: string }) {
  const [ranking, setRanking] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set())
  const prevTotals = useRef<Map<string, number>>(new Map())

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

    const changed = new Set<string>()
    for (const row of result) {
      const prev = prevTotals.current.get(row.id)
      if (prev !== undefined && prev !== row.total) {
        changed.add(row.id)
      }
    }
    if (changed.size > 0) {
      setFlashIds(changed)
      setTimeout(() => setFlashIds(new Set()), 900)
    }
    prevTotals.current = totals

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
    return <p className="qz-muted mt-6 text-center">読み込み中</p>
  }

  if (ranking.length === 0) {
    return <p className="qz-muted mt-6 text-center">まだ参加者がいない</p>
  }

  return (
    <ol className="mt-6 flex flex-col gap-2">
      {ranking.map((r, i) => (
        <li
          key={r.id}
          className={`qz-rank-row ${i === 0 ? 'is-top' : ''} ${
            flashIds.has(r.id) ? 'qz-flash-pulse' : ''
          }`}
        >
          <span className="qz-rank-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="truncate">{r.name}</span>
          <span className="qz-rank-score">{r.total}</span>
        </li>
      ))}
    </ol>
  )
}

