import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerPlayer } from './actions'

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const { eventId } = await params
  const sp = await searchParams
  const redirectTo = sp.redirect ?? `/e/${eventId}/ranking`

  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('id, name')
    .eq('id', eventId)
    .maybeSingle()

  if (!event) {
    notFound()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-black p-8">
      <form action={registerPlayer} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">{event.name}</h1>
        <p className="text-gray-500">プレイヤー登録</p>
        {sp.error === 'name_required' && (
          <p className="text-red-500 text-sm">名前を入力すること</p>
        )}
        {sp.error === 'event_not_found' && (
          <p className="text-red-500 text-sm">この大会は見つからない</p>
        )}
        {sp.error === 'insert_failed' && (
          <p className="text-red-500 text-sm">登録に失敗した。もう一度試すこと</p>
        )}
        <input type="hidden" name="event_id" value={eventId} />
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

