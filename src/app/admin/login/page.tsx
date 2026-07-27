import Link from 'next/link'
import { signIn } from './actions'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-black p-8">
      <form action={signIn} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">主催者ログイン</h1>
        {params.error === 'invalid_credentials' && (
          <p className="text-red-500 text-sm">メールアドレスまたはパスワードが違う</p>
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="メールアドレス"
          className="w-full border rounded px-3 py-2 bg-transparent"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="パスワード"
          className="w-full border rounded px-3 py-2 bg-transparent"
        />
        <button
          type="submit"
          className="w-full bg-black text-white dark:bg-white dark:text-black rounded px-3 py-2"
        >
          ログイン
        </button>
        <p className="text-sm text-gray-500">
          アカウントがない場合は
          <Link href="/admin/signup" className="underline ml-1">
            新規登録
          </Link>
        </p>
      </form>
    </main>
  )
}

