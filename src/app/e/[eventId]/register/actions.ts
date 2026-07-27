'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PLAYER_TOKEN_COOKIE } from '@/lib/player-token'

export async function registerPlayer(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const eventId = formData.get('event_id') as string
  const redirectTo = (formData.get('redirect') as string) || `/e/${eventId}/ranking`

  if (!eventId) {
    redirect('/')
  }

  if (!name) {
    redirect(
      `/e/${eventId}/register?error=name_required&redirect=${encodeURIComponent(redirectTo)}`
    )
  }

  const supabase = await createClient()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle()

  if (eventError || !event) {
    redirect(
      `/e/${eventId}/register?error=event_not_found&redirect=${encodeURIComponent(redirectTo)}`
    )
  }

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ event_id: event.id, name })
    .select('player_token')
    .single()

  if (playerError || !player) {
    redirect(
      `/e/${eventId}/register?error=insert_failed&redirect=${encodeURIComponent(redirectTo)}`
    )
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

