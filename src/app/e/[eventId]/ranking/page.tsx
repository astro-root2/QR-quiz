import { RankingClient } from './ranking-client'

export default async function RankingPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  return (
    <main className="qz-page">
      <div className="qz-shell w-full">
        <p className="qz-eyebrow">LIVE RANKING</p>
        <h1 className="qz-h1 mt-1">ランキング</h1>
        <RankingClient eventId={eventId} />
      </div>
    </main>
  )
}

