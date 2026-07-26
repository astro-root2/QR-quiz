import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/require-admin'
import { ButtonsAdminClient } from './buttons-admin-client'

export default async function AdminButtonsPage() {
  const admin = await requireAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-xl font-bold">ボタン管理</h1>
      <ButtonsAdminClient />
    </main>
  )
}
