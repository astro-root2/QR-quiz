import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlayerToken } from '@/lib/player-token'
import { ButtonPressClient } from './button-press-client'

export default async function ButtonPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = await createClient()

  const { data: button } = await supabase
    .from('buttons')
    .select('event_id')
    .eq('code', code)
    .maybeSingle()

  if (!button) {
    notFound()
  }

  const token = await getPlayerToken()
  let needsRegister = !token

  if (token) {
    // Cookieのplayer_tokenは端末単位。別の大会に既に登録済みの端末が
    // 今回のボタンを踏んだ場合、event_idが一致しないので再登録させる。
    const { data: player } = await supabase
      .from('players')
      .select('event_id')
      .eq('player_token', token)
      .maybeSingle()

    if (!player || player.event_id !== button.event_id) {
      needsRegister = true
    }
  }

  if (needsRegister) {
    redirect(
      `/e/${button.event_id}/register?redirect=${encodeURIComponent(`/button/${code}`)}`
    )
  }

  return <ButtonPressClient code={code} />
}

