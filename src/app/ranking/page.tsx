import { RankingClient } from './ranking-client'

export default function RankingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-xl font-bold">ランキング</h1>
      <RankingClient />
    </main>
  )
}
