import { ButtonsAdminClient } from './buttons-admin-client'

export default function AdminButtonsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-xl font-bold">ボタン管理</h1>
      <ButtonsAdminClient />
    </main>
  )
}
