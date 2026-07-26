'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PLAYER_TOKEN_COOKIE } from '@/lib/player-token'

export async function registerPlayer(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const redirectTo = (formData.get('redirect') as string) || '/ranking'

  if (!name) {
    redirect(`/register?error=name_required&redirect=${encodeURIComponent(redirectTo)}`)
  }

  const supabase = await createClient()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (eventError || !event) {
    redirect(`/register?error=no_active_event&redirect=${encodeURIComponent(redirectTo)}`)
  }

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ event_id: event.id, name })
    .select('player_token')
    .single()

  if (playerError || !player) {
    redirect(`/register?error=insert_failed&redirect=${encodeURIComponent(redirectTo)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(PLAYER_TOKEN_COOKIE, player.player_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect(redirectTo)
}
