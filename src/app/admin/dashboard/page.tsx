import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../login/actions'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">管理ダッシュボード</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm underline">ログアウト</button>
        </form>
      </div>
      <p className="mt-4 text-gray-500">ログイン中: {user?.email}</p>
      <nav className="mt-6 flex gap-4">
        <Link href="/admin/players" className="underline">プレイヤー管理</Link>
        <Link href="/admin/buttons" className="underline">ボタン管理</Link>
        <Link href="/ranking" className="underline">ランキング（公開画面）</Link>
      </nav>
    </main>
  )
}
