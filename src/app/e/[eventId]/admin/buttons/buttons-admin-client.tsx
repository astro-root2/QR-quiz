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

export function ButtonsAdminClient({ eventId }: { eventId: string }) {
  const [buttons, setButtons] = useState<ButtonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [namesInput, setNamesInput] = useState('')
  const [zipLoading, setZipLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/e/${eventId}/buttons`)
    const data = await res.json()
    setButtons(data.buttons ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  async function createButtons() {
    const names = namesInput
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)

    if (names.length === 0) return

    await fetch(`/api/e/${eventId}/buttons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_names: names }),
    })

    setNamesInput('')
    await load()
  }

  async function downloadPdf() {
    const res = await fetch(`/api/e/${eventId}/buttons/pdf`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr_buttons.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadZip() {
    setZipLoading(true)
    try {
      const res = await fetch(`/api/e/${eventId}/buttons/zip`)
      if (!res.ok) {
        setZipLoading(false)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qr_buttons.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setZipLoading(false)
    }
  }

  async function renameButton(id: string) {
    const trimmed = editingValue.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }
    await fetch(`/api/e/${eventId}/buttons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_name: trimmed }),
    })
    setEditingId(null)
    await load()
  }

  const unusedCount = buttons.filter((b) => b.status === 'unused').length
  const usedCount = buttons.filter((b) => b.status === 'used').length

  if (loading) {
    return <p className="qz-muted mt-6">読み込み中</p>
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="flex gap-6 qz-mono text-sm">
        <span className="qz-muted">
          未使用 <span className="text-[var(--text)] font-bold">{unusedCount}</span>
        </span>
        <span className="qz-muted">
          使用済み <span className="text-[var(--text)] font-bold">{usedCount}</span>
        </span>
        <span className="qz-muted">
          合計 <span className="text-[var(--text)] font-bold">{buttons.length}</span>
        </span>
      </div>

      <div className="qz-card">
        <label className="qz-label">配置場所名を1行ずつ入力（追加で一括生成）</label>
        <textarea
          value={namesInput}
          onChange={(e) => setNamesInput(e.target.value)}
          placeholder={'例:\n受付前\nステージ横\n入口A'}
          className="qz-input mt-2 h-28 resize-none"
        />
        <button onClick={createButtons} className="qz-btn qz-btn-primary mt-3">
          追加で生成
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={downloadZip}
          disabled={zipLoading || buttons.length === 0}
          className="qz-btn qz-btn-ghost"
        >
          {zipLoading ? 'ZIP作成中...' : 'QR一括ダウンロード(ZIP)'}
        </button>
        <button
          onClick={downloadPdf}
          disabled={buttons.length === 0}
          className="qz-btn qz-btn-ghost"
        >
          QR一括ダウンロード(PDF・A4/6面)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[40rem]">
          <thead>
            <tr className="text-left qz-muted border-b border-[var(--line)]">
              <th className="py-2 pr-3 font-normal">配置場所</th>
              <th className="py-2 pr-3 font-normal">コード</th>
              <th className="py-2 pr-3 font-normal">状態</th>
              <th className="py-2 pr-3 font-normal">押したプレイヤー</th>
              <th className="py-2 pr-3 font-normal">URL</th>
              <th className="py-2 font-normal">QR</th>
            </tr>
          </thead>
          <tbody>
            {buttons.map((b) => (
              <tr key={b.id} className="border-b border-[var(--line)]">
                <td className="py-2 pr-3">
                  {editingId === b.id ? (
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => renameButton(b.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameButton(b.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="qz-input py-1 w-32"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(b.id)
                        setEditingValue(b.location_name)
                      }}
                      className="qz-link text-left"
                      title="クリックして名前を変更"
                    >
                      {b.location_name}
                    </button>
                  )}
                </td>
                <td className="py-2 pr-3 qz-mono text-xs qz-muted">{b.code}</td>
                <td className="py-2 pr-3">
                  <span
                    className="qz-mono text-xs px-2 py-0.5 rounded-full border"
                    style={
                      b.status === 'used'
                        ? { borderColor: 'var(--hot-dim)', color: 'var(--hot)' }
                        : { borderColor: 'var(--buzzer-dim)', color: 'var(--buzzer)' }
                    }
                  >
                    {b.status === 'used' ? '使用済み' : '未使用'}
                  </span>
                </td>
                <td className="py-2 pr-3">{b.players?.name ?? '-'}</td>
                <td className="py-2 pr-3 qz-muted text-xs">/button/{b.code}</td>
                <td className="py-2 space-x-2 text-xs">
                  <a
                    href={`/api/e/${eventId}/buttons/${b.id}/qr?format=png`}
                    className="qz-link"
                  >
                    PNG
                  </a>
                  <a
                    href={`/api/e/${eventId}/buttons/${b.id}/qr?format=svg`}
                    className="qz-link"
                  >
                    SVG
                  </a>
                </td>
              </tr>
            ))}
            {buttons.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 qz-muted text-center">
                  まだボタンがない
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

