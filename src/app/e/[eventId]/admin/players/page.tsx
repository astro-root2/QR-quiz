import { redirect } from 'next/navigation'
import { requireOwner } from '@/lib/require-owner'
import { PlayersAdminClient } from './players-admin-client'

export default async function EventAdminPlayersPage({
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
      <h1 className="text-xl font-bold">プレイヤー管理</h1>
      <PlayersAdminClient eventId={eventId} />
    </main>
  )
}

