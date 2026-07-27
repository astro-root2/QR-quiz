import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireOwner } from '@/lib/require-owner'
import { signOut } from '@/app/admin/login/actions'

export default async function EventAdminDashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const owner = await requireOwner(eventId)

  if (!owner) {
    redirect('/admin/login')
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">管理ダッシュボード</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm underline">
            ログアウト
          </button>
        </form>
      </div>
      <p className="mt-4 text-gray-500">ログイン中: {owner.email}</p>
      <nav className="mt-6 flex flex-wrap gap-4">
        <Link href="/admin/events" className="underline">
          マイイベント一覧
        </Link>
        <Link href={`/e/${eventId}/admin/players`} className="underline">
          プレイヤー管理
        </Link>
        <Link href={`/e/${eventId}/admin/buttons`} className="underline">
          ボタン管理
        </Link>
        <Link href={`/e/${eventId}/ranking`} className="underline">
          ランキング（公開画面）
        </Link>
      </nav>
    </main>
  )
}

