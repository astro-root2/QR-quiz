import { createClient } from '@/lib/supabase/server'

export default async function RankingPage() {
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!event) {
    return (
      <main className="min-h-screen bg-white dark:bg-black p-8">
        <h1 className="text-xl font-bold">ランキング</h1>
        <p className="mt-4 text-gray-500">開催中のイベントがない</p>
      </main>
    )
  }

  const { data: players } = await supabase
    .from('players')
    .select('id, name')
    .eq('event_id', event.id)

  const { data: scores } = await supabase
    .from('scores')
    .select('player_id, delta')
    .eq('event_id', event.id)

  const totals = new Map<string, number>()
  for (const p of players ?? []) totals.set(p.id, 0)
  for (const s of scores ?? []) {
    totals.set(s.player_id, (totals.get(s.player_id) ?? 0) + s.delta)
  }

  const ranking = (players ?? [])
    .map((p) => ({ id: p.id, name: p.name, total: totals.get(p.id) ?? 0 }))
    .sort((a, b) => b.total - a.total)

  return (
    <main className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-xl font-bold">ランキング</h1>
      <ol className="mt-4 space-y-2">
        {ranking.map((r, i) => (
          <li key={r.id} className="flex justify-between border-b py-2">
            <span>{i + 1}. {r.name}</span>
            <span className="font-bold">{r.total}</span>
          </li>
        ))}
      </ol>
    </main>
  )
}
