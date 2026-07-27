import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../login/actions'
import { createEvent } from './actions'

const ERROR_MESSAGES: Record<string, string> = {
  name_required: '大会名を入力すること',
  create_failed: '作成に失敗した。もう一度試すこと',
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: events } = await supabase
    .from('events')
    .select('id, name, status, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">マイイベント</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm underline">
            ログアウト
          </button>
        </form>
      </div>
      <p className="mt-4 text-gray-500">ログイン中: {user.email}</p>

      {params.error && (
        <p className="mt-4 text-red-500 text-sm">
          {ERROR_MESSAGES[params.error] ?? params.error}
        </p>
      )}

      <form action={createEvent} className="mt-6 flex gap-2 max-w-md">
        <input
          name="name"
          type="text"
          required
          maxLength={50}
          placeholder="新しい大会名（例: 第3回社内クイズ大会）"
          className="flex-1 border rounded px-3 py-2 bg-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded whitespace-nowrap"
        >
          作成
        </button>
      </form>

      <ul className="mt-8 space-y-3 max-w-md">
        {(events ?? []).map((e) => (
          <li key={e.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <Link href={`/e/${e.id}/admin/dashboard`} className="underline font-bold">
                {e.name}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {e.status === 'active' ? '開催中' : 'アーカイブ済み'}
              </p>
            </div>
          </li>
        ))}
        {(events ?? []).length === 0 && (
          <p className="text-gray-500">まだ大会がない。上のフォームから作成すること。</p>
        )}
      </ul>
    </main>
  )
}

