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
    <main className="qz-page items-center justify-center">
      <form action={signUp} className="qz-shell w-full">
        <p className="qz-eyebrow text-center">ORGANIZER</p>
        <h1 className="qz-h1 mt-1 text-center">主催者アカウント新規登録</h1>

        <div className="qz-card mt-6 flex flex-col gap-4">
          {message && (
            <p style={{ color: 'var(--hot)' }} className="text-sm">
              {message}
            </p>
          )}

          <div className="qz-field">
            <label className="qz-label" htmlFor="email">
              メールアドレス
            </label>
            <input id="email" name="email" type="email" required className="qz-input" />
          </div>

          <div className="qz-field">
            <label className="qz-label" htmlFor="password">
              パスワード（6文字以上）
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="qz-input"
            />
          </div>

          <button type="submit" className="qz-btn qz-btn-primary w-full">
            登録する
          </button>

          <p className="qz-muted text-sm text-center">
            既にアカウントがある場合は{' '}
            <Link href="/admin/login" className="qz-link">
              ログイン
            </Link>
          </p>
        </div>
      </form>
    </main>
  )
}

