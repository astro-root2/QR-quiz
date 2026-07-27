import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerPlayer } from './actions'

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const { eventId } = await params
  const sp = await searchParams
  const redirectTo = sp.redirect ?? `/e/${eventId}/ranking`

  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('id, name')
    .eq('id', eventId)
    .maybeSingle()

  if (!event) {
    notFound()
  }

  return (
    <main className="qz-page items-center justify-center">
      <form action={registerPlayer} className="qz-shell w-full">
        <p className="qz-eyebrow text-center">参加登録</p>
        <h1 className="qz-h1 mt-1 text-center">{event.name}</h1>

        <div className="qz-card mt-6 flex flex-col gap-4">
          {sp.error === 'name_required' && (
            <p style={{ color: 'var(--hot)' }} className="text-sm">
              名前を入力すること
            </p>
          )}
          {sp.error === 'event_not_found' && (
            <p style={{ color: 'var(--hot)' }} className="text-sm">
              この大会は見つからない
            </p>
          )}
          {sp.error === 'insert_failed' && (
            <p style={{ color: 'var(--hot)' }} className="text-sm">
              登録に失敗した。もう一度試すこと
            </p>
          )}

          <input type="hidden" name="event_id" value={eventId} />
          <input type="hidden" name="redirect" value={redirectTo} />

          <div className="qz-field">
            <label className="qz-label" htmlFor="name">
              プレイヤー名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={30}
              placeholder="例: たなか"
              className="qz-input"
              autoFocus
            />
          </div>

          <button type="submit" className="qz-btn qz-btn-primary w-full">
            登録して参加する
          </button>
        </div>
      </form>
    </main>
  )
}

