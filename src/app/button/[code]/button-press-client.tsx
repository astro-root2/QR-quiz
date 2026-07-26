'use client'

import { useState } from 'react'

type PressState =
  | { status: 'idle' }
  | { status: 'pressing' }
  | { status: 'success'; locationName: string }
  | { status: 'error'; message: string }

const ERROR_MESSAGES: Record<string, string> = {
  already_used: 'このボタンは既に使用されている',
  not_found: 'このボタンは存在しない',
  event_mismatch: 'このボタンは現在のイベント対象外',
  not_registered: 'プレイヤー登録が必要',
  invalid_player: 'プレイヤー情報が確認できない',
  server_error: 'エラーが発生した。もう一度試すこと',
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

    setState({ status: 'success', locationName: data.location_name })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-8">
      {state.status === 'success' ? (
        <div className="text-center">
          <p className="text-3xl font-bold text-green-500">解答権を獲得した</p>
          <p className="mt-2 text-gray-500">{state.locationName}</p>
        </div>
      ) : (
        <button
          onClick={handlePress}
          disabled={state.status === 'pressing'}
          className="h-48 w-48 rounded-full bg-red-500 text-white text-2xl font-bold active:scale-95 disabled:opacity-50"
        >
          {state.status === 'pressing' ? '送信中' : '押す'}
        </button>
      )}
      {state.status === 'error' && (
        <p className="mt-4 text-red-500">{state.message}</p>
      )}
    </main>
  )
}
