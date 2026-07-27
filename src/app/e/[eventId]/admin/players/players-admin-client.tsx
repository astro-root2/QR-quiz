'use client'

import { useEffect, useState } from 'react'

type PlayerRow = { id: string; name: string; total: number }
type HistoryRow = {
  id: string
  delta: number
  reason: string | null
  admin_email: string | null
  created_at: string
  players: { name: string } | { name: string }[] | null
}

function historyPlayerName(row: HistoryRow): string {
  if (!row.players) return '-'
  if (Array.isArray(row.players)) return row.players[0]?.name ?? '-'
  return row.players.name
}

export function PlayersAdminClient({ eventId }: { eventId: string }) {
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')

  async function load() {
    setLoading(true)
    const [playersRes, historyRes] = await Promise.all([
      fetch(`/api/e/${eventId}/players`),
      fetch(`/api/e/${eventId}/scores`),
    ])
    const playersData = await playersRes.json()
    const historyData = await historyRes.json()
    setPlayers(playersData.players ?? [])
    setHistory(historyData.history ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  async function addScore(playerId: string, delta: number) {
    await fetch(`/api/e/${eventId}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, delta, reason: reason || null }),
    })
    setReason('')
    await load()
  }

  if (loading) {
    return <p className="qz-muted mt-6">読み込み中</p>
  }

  if (players.length === 0) {
    return <p className="qz-muted mt-6">まだ参加者がいない。登録用URLを共有すること。</p>
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="qz-field max-w-md">
        <label className="qz-label">得点理由（任意・次の操作に適用）</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例: 早押し正解、誤答による減点"
          className="qz-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        {players
          .slice()
          .sort((a, b) => b.total - a.total)
          .map((p) => (
            <div key={p.id} className="qz-panel-row flex-wrap">
              <span className="min-w-0 truncate">{p.name}</span>
              <div className="flex items-center gap-3 ml-auto">
                <span className="qz-rank-score">{p.total}</span>
                <button
                  onClick={() => addScore(p.id, 1)}
                  className="qz-btn qz-btn-primary px-3 py-1.5"
                >
                  +1
                </button>
                <button
                  onClick={() => addScore(p.id, -1)}
                  className="qz-btn px-3 py-1.5"
                  style={{ background: 'var(--hot)', color: 'var(--ink)' }}
                >
                  -1
                </button>
              </div>
            </div>
          ))}
      </div>

      <div>
        <h2 className="qz-h2">得点履歴</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left qz-muted border-b border-[var(--line)]">
                <th className="py-2 pr-3 font-normal">日時</th>
                <th className="py-2 pr-3 font-normal">プレイヤー</th>
                <th className="py-2 pr-3 font-normal">増減</th>
                <th className="py-2 pr-3 font-normal">理由</th>
                <th className="py-2 font-normal">操作者</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-[var(--line)]">
                  <td className="py-2 pr-3 qz-muted qz-mono whitespace-nowrap">
                    {new Date(h.created_at).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-2 pr-3">{historyPlayerName(h)}</td>
                  <td
                    className="py-2 pr-3 font-bold qz-mono"
                    style={{ color: h.delta > 0 ? 'var(--buzzer)' : 'var(--hot)' }}
                  >
                    {h.delta > 0 ? `+${h.delta}` : h.delta}
                  </td>
                  <td className="py-2 pr-3 qz-muted">{h.reason ?? '-'}</td>
                  <td className="py-2 qz-muted">{h.admin_email ?? '-'}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 qz-muted text-center">
                    まだ得点操作の履歴がない
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

