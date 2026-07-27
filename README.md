# QRコード早押しクイズシステム

## アーキテクチャ（マルチテナント化後）

- サインアップした人は誰でも「主催者」になれる（`admins`テーブルによる固定許可リスト方式は廃止）
- 1つのアカウントで複数の大会（イベント）を作成できる。`events.owner_id` がその所有者
- 管理画面・管理APIは「そのイベントの owner_id が自分か」で認可判定する（`src/lib/require-owner.ts`）
- URL構成:
  - `/admin/signup`, `/admin/login` : アカウント作成・ログイン
  - `/admin/events` : 自分の大会一覧・新規作成
  - `/e/[eventId]/admin/dashboard` `/players` `/buttons` : 大会ごとの管理画面
  - `/e/[eventId]/register` : その大会のプレイヤー登録
  - `/e/[eventId]/ranking` : その大会の公開ランキング
  - `/button/[code]` : QRコードが指す解答権取得ページ（コード自体がどの大会かを内包）

## セットアップ

1. `.env.example` を `.env.local` にコピーし、Supabaseプロジェクトの値を設定する
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. `supabase/migrations/` 配下のSQLをSupabaseプロジェクトのSQL Editorで **番号順に** 実行する
   - 特に `0006_multi_tenant.sql` が今回のマルチテナント化の本体（`events.owner_id` 追加、`admins`テーブル削除、オーナー用RLSポリシー追加）
   - 既存の `0003_seed.sql`（テストイベント）は owner_id が null のまま残るので、動作確認前に削除するか、SQL Editorで自分のユーザーIDを owner_id に手動セットしておく
3. Supabase Authの **Confirm email をオフ** にする（Authentication → Providers → Email → "Confirm email"）
   - オンのままだとサインアップ直後にログインできず、メール確認待ちになる
4. `npm run dev` で起動する

## 実装ステップ

- Step1: 初期構築（完了・動作確認済み）
- Step2: 認証（完了・動作確認済み）
- Step3: DB接続確認（完了・動作確認済み）
- Step4: API実装（完了）
- Step5: プレイヤー画面（実装済み・動作未確認）
- Step6: ボタン処理（同時押し制御）（実装済み・動作未確認）
- Step7: 管理画面（完了・動作確認済み）
- Step8: QRコード生成（完了・動作確認済み）
- Step9: 得点管理（実装済み・動作未確認）
- Step9.5: マルチテナント化（サインアップ即オーナー、大会ごとにURL分離）（実装完了・**動作未確認**）
- Step10: テスト（未着手）
- Step11: デプロイ（未着手）

## Step9.5（マルチテナント化）の動作確認手順

上記セットアップを終えたら、以下を実際に手で確認すること。ビルドが通ることと実際に動くことは別問題。

1. `/admin/signup` で新規アカウントを作成し、Confirm emailがオフなら即座に `/admin/events` に遷移するか
2. `/admin/events` で大会を1つ作成し、`/e/[eventId]/admin/dashboard` に遷移するか
3. 同じアカウントでもう1つ大会を作成し、`/admin/events` に2件表示されるか（複数大会対応の確認）
4. `/e/[eventId]/admin/buttons` でボタンを生成し、QRコード（PNG/SVG/ZIP/PDF）がその大会の `event_id` に紐づいているか
5. QR経由 `/button/[code]` にアクセス → 未登録なら `/e/[eventId]/register` にリダイレクトされるか
6. 登録後にボタンを押して解答権を取得できるか。2回目は弾かれるか（Step6の核心、まだ未確認）
7. 別ブラウザ（別Cookie）から同じボタンに同時アクセスし、片方だけ成功するか
8. 大会Aで登録済みの端末（Cookie保持）が、大会BのQRを踏んだときに再登録を求められるか（イベント跨ぎのplayer_token不一致チェック）
9. 自分が所有していない大会IDを `/e/[別人のeventId]/admin/dashboard` のようにURLで直接叩いて、`/admin/login` にリダイレクトされる（＝アクセス拒否される）か
10. `/api/e/[eventId]/...` 系APIに、Cookie無し・別オーナーのセッションでcurlし、401が返るか（これは前回から繰り返し指摘されている確認項目。今回も飛ばさないこと）

