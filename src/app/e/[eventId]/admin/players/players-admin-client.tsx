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
    return <p className="text-gray-500">読み込み中</p>
  }

  return (
    <div>
      <div className="mt-4">
        <label className="text-sm text-gray-500">得点理由（任意・次の操作に適用）</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例: 早押し正解、誤答による減点"
          className="w-full border rounded p-2 bg-transparent mt-1"
        />
      </div>

      <table className="w-full mt-4">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">プレイヤー名</th>
            <th className="py-2">得点</th>
            <th className="py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {players
            .slice()
            .sort((a, b) => b.total - a.total)
            .map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.name}</td>
                <td className="py-2 font-bold">{p.total}</td>
                <td className="py-2 space-x-2">
                  <button
                    onClick={() => addScore(p.id, 1)}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => addScore(p.id, -1)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    -1
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <h2 className="text-lg font-bold mt-8">得点履歴</h2>
      <table className="w-full mt-2">
        <thead>
          <tr className="text-left border-b text-sm text-gray-500">
            <th className="py-2">日時</th>
            <th className="py-2">プレイヤー</th>
            <th className="py-2">増減</th>
            <th className="py-2">理由</th>
            <th className="py-2">操作者</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b text-sm">
              <td className="py-2 text-gray-500">
                {new Date(h.created_at).toLocaleString('ja-JP')}
              </td>
              <td className="py-2">{historyPlayerName(h)}</td>
              <td className={`py-2 font-bold ${h.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {h.delta > 0 ? `+${h.delta}` : h.delta}
              </td>
              <td className="py-2 text-gray-500">{h.reason ?? '-'}</td>
              <td className="py-2 text-gray-500">{h.admin_email ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

