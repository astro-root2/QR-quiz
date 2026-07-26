import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/require-admin'
import { PlayersAdminClient } from './players-admin-client'

export default async function AdminPlayersPage() {
  const admin = await requireAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-xl font-bold">プレイヤー管理</h1>
      <PlayersAdminClient />
    </main>
  )
}
