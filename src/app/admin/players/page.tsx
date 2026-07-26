import { PlayersAdminClient } from './players-admin-client'

export default function AdminPlayersPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-xl font-bold">プレイヤー管理</h1>
      <PlayersAdminClient />
    </main>
  )
}
