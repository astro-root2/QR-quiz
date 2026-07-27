import Link from 'next/link'

export default function Home() {
  return (
    <main className="qz-page items-center justify-center">
      <div className="qz-shell text-center flex flex-col items-center">
        <p className="qz-eyebrow">QRコード解答権システム</p>
        <h1 className="qz-h1 mt-3">
          会場のどこかにある
          <br />
          ボタンを、いちばん早く。
        </h1>
        <p className="qz-muted mt-4 leading-relaxed">
          QRコードを踏んだ瞬間がそのまま解答権になる早押しクイズ運営ツール。
          <br />
          主催者は大会を作り、参加者はスマホで名前を登録するだけ。
        </p>

        <div className="mt-8 flex gap-3 flex-wrap justify-center">
          <Link href="/admin/signup" className="qz-btn qz-btn-primary">
            主催者として始める
          </Link>
          <Link href="/admin/login" className="qz-btn qz-btn-ghost">
            ログイン
          </Link>
        </div>

        <div className="qz-mono text-xs qz-muted mt-10 tracking-wide">
          01 大会を作る → 02 QRを配置 → 03 早押し開始
        </div>
      </div>
    </main>
  )
}

