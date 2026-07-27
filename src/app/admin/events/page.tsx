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
    <main className="qz-page">
      <div className="qz-topbar">
        <div>
          <p className="qz-eyebrow">ORGANIZER</p>
          <h1 className="qz-h1">マイイベント</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="qz-muted text-sm hidden sm:inline">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="qz-btn qz-btn-ghost">
              ログアウト
            </button>
          </form>
        </div>
      </div>

      <div className="qz-shell-wide w-full">
        {params.error && (
          <p style={{ color: 'var(--hot)' }} className="text-sm mb-4">
            {ERROR_MESSAGES[params.error] ?? params.error}
          </p>
        )}

        <form
          action={createEvent}
          className="qz-card flex flex-wrap gap-3 items-end"
        >
          <div className="qz-field flex-1 min-w-[14rem]">
            <label className="qz-label" htmlFor="name">
              新しい大会名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={50}
              placeholder="例: 第3回社内クイズ大会"
              className="qz-input"
            />
          </div>
          <div className="qz-field w-28">
            <label className="qz-label" htmlFor="button_count">
              ボタン数
            </label>
            <input
              id="button_count"
              name="button_count"
              type="number"
              min={0}
              max={200}
              defaultValue={10}
              className="qz-input qz-mono"
            />
          </div>
          <button type="submit" className="qz-btn qz-btn-primary">
            大会を作成
          </button>
          <p className="qz-muted text-xs w-full">
            「ボタン1」「ボタン2」…として自動生成される。名前はあとで管理画面から変更できる。
          </p>
        </form>

        <div className="mt-8 flex flex-col gap-3">
          {(events ?? []).map((e) => (
            <Link
              key={e.id}
              href={`/e/${e.id}/admin/dashboard`}
              className="qz-panel-row hover:border-[var(--buzzer-dim)] transition-colors"
            >
              <div>
                <p className="qz-h2">{e.name}</p>
                <p className="qz-muted text-xs mt-1">
                  {e.status === 'active' ? '開催中' : 'アーカイブ済み'}
                </p>
              </div>
              <span className="qz-muted text-sm">管理画面へ →</span>
            </Link>
          ))}
          {(events ?? []).length === 0 && (
            <p className="qz-muted text-center py-8">
              まだ大会がない。上のフォームから作成すること。
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

