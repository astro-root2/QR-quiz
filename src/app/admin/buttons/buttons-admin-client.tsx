'use client'

import { useEffect, useState } from 'react'

type ButtonRow = {
  id: string
  code: string
  location_name: string
  status: 'unused' | 'used'
  used_at: string | null
  players: { name: string } | null
}

export function ButtonsAdminClient() {
  const [buttons, setButtons] = useState<ButtonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [namesInput, setNamesInput] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/buttons')
    const data = await res.json()
    setButtons(data.buttons ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function createButtons() {
    const names = namesInput
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)

    if (names.length === 0) return

    await fetch('/api/admin/buttons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_names: names }),
    })

    setNamesInput('')
    await load()
  }

  const unusedCount = buttons.filter((b) => b.status === 'unused').length
  const usedCount = buttons.filter((b) => b.status === 'used').length

  if (loading) {
    return <p className="text-gray-500">読み込み中</p>
  }

  return (
    <div>
      <div className="mt-4 flex gap-6 text-sm text-gray-500">
        <span>未使用: {unusedCount}</span>
        <span>使用済み: {usedCount}</span>
        <span>合計: {buttons.length}</span>
      </div>

      <div className="mt-6">
        <textarea
          value={namesInput}
          onChange={(e) => setNamesInput(e.target.value)}
          placeholder={'配置場所名を1行ずつ入力（複数行で一括生成）\n例:\n受付前\nステージ横\n入口A'}
          className="w-full h-32 border rounded p-2 bg-transparent"
        />
        <button
          onClick={createButtons}
          className="mt-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded"
        >
          ボタンを生成
        </button>
      </div>

      <table className="w-full mt-6">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">配置場所</th>
            <th className="py-2">コード</th>
            <th className="py-2">状態</th>
            <th className="py-2">押したプレイヤー</th>
            <th className="py-2">URL</th>
          </tr>
        </thead>
        <tbody>
          {buttons.map((b) => (
            <tr key={b.id} className="border-b">
              <td className="py-2">{b.location_name}</td>
              <td className="py-2 font-mono text-sm">{b.code}</td>
              <td className="py-2">
                {b.status === 'used' ? '使用済み' : '未使用'}
              </td>
              <td className="py-2">{b.players?.name ?? '-'}</td>
              <td className="py-2 text-sm text-gray-500">/button/{b.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
