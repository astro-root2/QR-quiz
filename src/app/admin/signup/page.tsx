import Link from 'next/link'
import { signUp } from '../login/actions'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_input: 'メールアドレスとパスワードを入力すること',
  confirm_email_required:
    '確認メールを送信した。メール内のリンクから確認後、ログインすること',
}

export default async function AdminSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const message = params.error ? (ERROR_MESSAGES[params.error] ?? params.error) : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-black p-8">
      <form action={signUp} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">主催者アカウント新規登録</h1>
        {message && <p className="text-red-500 text-sm">{message}</p>}
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
          minLength={6}
          placeholder="パスワード（6文字以上）"
          className="w-full border rounded px-3 py-2 bg-transparent"
        />
        <button
          type="submit"
          className="w-full bg-black text-white dark:bg-white dark:text-black rounded px-3 py-2"
        >
          登録する
        </button>
        <p className="text-sm text-gray-500">
          既にアカウントがある場合は
          <Link href="/admin/login" className="underline ml-1">
            ログイン
          </Link>
        </p>
      </form>
    </main>
  )
}

