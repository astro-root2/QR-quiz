'use client'

import { useState } from 'react'

type PressState =
  | { status: 'idle' }
  | { status: 'pressing' }
  | { status: 'success'; locationName: string; usedAt: string }
  | { status: 'error'; message: string }

const ERROR_MESSAGES: Record<string, string> = {
  already_used: 'このボタンは既に使用されている',
  not_found: 'このボタンは存在しない',
  event_mismatch: 'このボタンは現在のイベント対象外',
  not_registered: 'プレイヤー登録が必要',
  invalid_player: 'プレイヤー情報が確認できない',
  server_error: 'エラーが発生した。もう一度試すこと',
}

// サーバー(DB)が実際にロックした瞬間を表示する。
// 通信の往復時間ではなく、判定そのものに使われた時刻。
function formatCaptureTime(isoString: string) {
  const date = new Date(isoString)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

export function ButtonPressClient({ code }: { code: string }) {
  const [state, setState] = useState<PressState>({ status: 'idle' })

  async function handlePress() {
    setState({ status: 'pressing' })

    const res = await fetch(`/api/buttons/${code}/press`, { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setState({
        status: 'error',
        message: ERROR_MESSAGES[data.error] ?? '取得に失敗した',
      })
      return
    }

    setState({ status: 'success', locationName: data.location_name, usedAt: data.used_at })
  }

  return (
    <main className="qz-page items-center justify-center">
      <div className="qz-shell text-center flex flex-col items-center">
        {state.status === 'success' ? (
          <div className="qz-capture">
            <p className="qz-eyebrow">解答権 獲得</p>
            <p className="qz-capture-time mt-2">{formatCaptureTime(state.usedAt)}</p>
            <p className="qz-muted mt-3">{state.locationName}</p>
          </div>
        ) : (
          <>
            <p className="qz-eyebrow mb-2">タップして解答権を取得</p>
            <div className="qz-buzzer-wrap">
              <button
                onClick={handlePress}
                disabled={state.status === 'pressing'}
                className="qz-buzzer"
              >
                {state.status === 'pressing' ? '送信中' : '押す'}
              </button>
            </div>
          </>
        )}

        {state.status === 'error' && (
          <p className="mt-4" style={{ color: 'var(--hot)' }}>
            {state.message}
          </p>
        )}
      </div>
    </main>
  )
}

