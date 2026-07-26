import { cookies } from 'next/headers'

export const PLAYER_TOKEN_COOKIE = 'player_token'

export async function getPlayerToken() {
  const cookieStore = await cookies()
  return cookieStore.get(PLAYER_TOKEN_COOKIE)?.value ?? null
}
