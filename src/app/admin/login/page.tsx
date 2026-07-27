import Link from 'next/link'
import { signIn } from './actions'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className="qz-page items-center justify-center">
      <form action={signIn} className="qz-shell w-full">
        <p className="qz-eyebrow text-center">ORGANIZER</p>
        <h1 className="qz-h1 mt-1 text-center">主催者ログイン</h1>

        <div className="qz-card mt-6 flex flex-col gap-4">
          {params.error === 'invalid_credentials' && (
            <p style={{ color: 'var(--hot)' }} className="text-sm">
              メールアドレスまたはパスワードが違う
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
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="qz-input"
            />
          </div>

          <button type="submit" className="qz-btn qz-btn-primary w-full">
            ログイン
          </button>

          <p className="qz-muted text-sm text-center">
            アカウントがない場合は{' '}
            <Link href="/admin/signup" className="qz-link">
              新規登録
            </Link>
          </p>
        </div>
      </form>
    </main>
  )
}

