'use server'

import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

const MAX_BUTTON_COUNT = 200

export async function createEvent(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const buttonCountRaw = formData.get('button_count') as string
  const buttonCount = Math.min(
    Math.max(parseInt(buttonCountRaw, 10) || 0, 0),
    MAX_BUTTON_COUNT
  )

  if (!name) {
    redirect('/admin/events?error=name_required')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({ name, owner_id: user.id })
    .select('id')
    .single()

  if (error || !event) {
    redirect('/admin/events?error=create_failed')
  }

  // ボタンの生成はRLSの対象外(サービスロール)で行う。
  // 個数指定のみで、場所名は仮名("ボタン1"など)。名前は後で管理画面から個別編集する想定。
  if (buttonCount > 0) {
    const adminSupabase = createAdminClient()
    const rows = Array.from({ length: buttonCount }, (_, i) => ({
      event_id: event.id,
      code: nanoid(12),
      location_name: `ボタン${i + 1}`,
    }))

    const { error: buttonsError } = await adminSupabase.from('buttons').insert(rows)

    if (buttonsError) {
      // イベント自体の作成は成功しているので、ボタン生成失敗は
      // 大会自体を消さずにダッシュボードへ進め、そこで手動生成させる。
      redirect(`/e/${event.id}/admin/dashboard?error=button_generation_failed`)
    }
  }

  redirect(`/e/${event.id}/admin/dashboard`)
}

