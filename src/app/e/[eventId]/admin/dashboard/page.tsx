import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireOwner } from '@/lib/require-owner'
import { signOut } from '@/app/admin/login/actions'

export default async function EventAdminDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { eventId } = await params
  const sp = await searchParams
  const owner = await requireOwner(eventId)

  if (!owner) {
    redirect('/admin/login')
  }

  const navItems = [
    { href: `/e/${eventId}/admin/players`, label: 'プレイヤー管理', desc: '得点の付与と履歴' },
    { href: `/e/${eventId}/admin/buttons`, label: 'ボタン管理', desc: 'QR生成・配置名の編集' },
    { href: `/e/${eventId}/ranking`, label: 'ランキング（公開画面）', desc: '会場に映す用' },
  ]

  return (
    <main className="qz-page">
      <div className="qz-topbar">
        <div>
          <p className="qz-eyebrow">DASHBOARD</p>
          <h1 className="qz-h1">管理ダッシュボード</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="qz-muted text-sm hidden sm:inline">{owner.email}</span>
          <form action={signOut}>
            <button type="submit" className="qz-btn qz-btn-ghost">
              ログアウト
            </button>
          </form>
        </div>
      </div>

      <div className="qz-shell-wide w-full">
        {sp.error === 'button_generation_failed' && (
          <p style={{ color: 'var(--hot)' }} className="text-sm mb-4">
            ボタンの自動生成に失敗した。ボタン管理画面から手動で生成すること。
          </p>
        )}

        <Link href="/admin/events" className="qz-link text-sm">
          ← マイイベント一覧
        </Link>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="qz-card hover:border-[var(--buzzer-dim)] transition-colors">
              <p className="qz-h2">{item.label}</p>
              <p className="qz-muted text-sm mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

