import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireOwner } from '@/lib/require-owner'
import { ButtonsAdminClient } from './buttons-admin-client'

export default async function EventAdminButtonsPage({
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
    <main className="qz-page">
      <div className="qz-topbar">
        <div>
          <p className="qz-eyebrow">BUTTONS</p>
          <h1 className="qz-h1">ボタン管理</h1>
        </div>
        <Link href={`/e/${eventId}/admin/dashboard`} className="qz-btn qz-btn-ghost">
          ダッシュボードへ
        </Link>
      </div>
      <div className="qz-shell-wide w-full">
        <ButtonsAdminClient eventId={eventId} />
      </div>
    </main>
  )
}

