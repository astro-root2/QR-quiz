import { createClient } from '@/lib/supabase/server'

/**
 * ログイン済みユーザーを取得するだけの軽量チェック。
 * /admin/events のようにイベントに紐付かない画面で使う。
 */
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return { userId: user.id, email: user.email ?? null }
}

/**
 * 「ログイン済み」かつ「そのイベントの owner_id が自分であること」を確認する。
 * admins テーブル方式(固定許可リスト)は廃止し、イベントごとの所有者チェックに置き換えた。
 */
export async function requireOwner(eventId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('id, owner_id')
    .eq('id', eventId)
    .maybeSingle()

  if (error || !event || event.owner_id !== user.id) {
    return null
  }

  return { userId: user.id, email: user.email ?? null, eventId: event.id }
}

