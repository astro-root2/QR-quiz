import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-8">
      <h1 className="text-2xl font-bold text-center">
        QRコード早押しクイズシステム
      </h1>
      <p className="mt-4 text-center text-gray-500">
        主催者は自分のアカウントで複数の大会を作成できる。
      </p>
      <div className="mt-6 flex gap-4">
        <Link
          href="/admin/login"
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded"
        >
          主催者ログイン
        </Link>
        <Link href="/admin/signup" className="px-4 py-2 border rounded">
          新規登録
        </Link>
      </div>
    </main>
  )
}

