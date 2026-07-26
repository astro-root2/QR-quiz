import { registerPlayer } from './actions'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirect ?? '/ranking'

  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-black p-8">
      <form action={registerPlayer} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">プレイヤー登録</h1>
        {params.error === 'name_required' && (
          <p className="text-red-500 text-sm">名前を入力すること</p>
        )}
        {params.error === 'no_active_event' && (
          <p className="text-red-500 text-sm">開催中のイベントがない</p>
        )}
        {params.error === 'insert_failed' && (
          <p className="text-red-500 text-sm">登録に失敗した。もう一度試すこと</p>
        )}
        <input type="hidden" name="redirect" value={redirectTo} />
        <input
          name="name"
          type="text"
          required
          maxLength={30}
          placeholder="プレイヤー名"
          className="w-full border rounded px-3 py-2 bg-transparent"
        />
        <button
          type="submit"
          className="w-full bg-black text-white dark:bg-white dark:text-black rounded px-3 py-2"
        >
          登録
        </button>
      </form>
    </main>
  )
}
