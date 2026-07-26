import { redirect } from 'next/navigation'
import { getPlayerToken } from '@/lib/player-token'
import { ButtonPressClient } from './button-press-client'

export default async function ButtonPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const token = await getPlayerToken()

  if (!token) {
    redirect(`/register?redirect=${encodeURIComponent(`/button/${code}`)}`)
  }

  return <ButtonPressClient code={code} />
}
