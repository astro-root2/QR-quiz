'use client'

import { useEffect, useState } from 'react'

type PlayerRow = { id: string; name: string; total: number }

export function PlayersAdminClient() {
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/players')
    const data = await res.json()
    setPlayers(data.players ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function addScore(playerId: string, delta: number) {
    await fetch('/api/admin/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, delta }),
    })
    await load()
  }

  if (loading) {
    return <p className="text-gray-500">読み込み中</p>
  }

  return (
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
  )
}
