# QRコード早押しクイズシステム 設計ドキュメント（Step0: レビュー & 設計）

## 1. 要件レビューで指摘した問題点（サマリー）

| # | 問題点 | 対応方針 |
|---|---|---|
| 1 | プレイヤー名だけでは本人性を担保できない | ランダムな `player_token` をサーバー発行し Cookie で保持 |
| 2 | ボタンIDが連番だとURL推測攻撃が可能 | `code` はランダムトークン（nanoid）、場所名は別カラム |
| 3 | 「同時押しで一人だけ」の実装方法が未定義 | PostgreSQLの条件付き `UPDATE ... WHERE status='unused' RETURNING *` で atomic に保証 |
| 4 | 管理者権限の判定方法が未定義 | Supabase Auth + `admins` テーブル + RLS |
| 5 | CSRF対策とQR初回アクセスの相性が悪い | Cookie認証 + DB側一意性制約で防御する方針に変更 |
| 6 | 仕様が最初から全部盛りでビルドが壊れやすい | MVP優先。Phase1/2/3に分割 |

## 2. DB設計（Supabase / PostgreSQL）

```
events        (id, name, status, created_at)
players       (id, event_id, name, player_token UNIQUE, created_at)
buttons       (id, event_id, code UNIQUE, location_name,
               status ENUM('unused','used'),
               used_by UUID NULL REFERENCES players,
               used_at TIMESTAMPTZ NULL,
               created_at)
scores        (id, player_id, event_id, delta INT, reason TEXT,
               admin_id UUID, created_at)
admins        (id, email UNIQUE, role)
event_logs    (id, event_id, type, payload JSONB, created_at)
```

### ER関係（文章表現）
- 1つの `events` は複数の `players` を持つ（1:N）
- 1つの `events` は複数の `buttons` を持つ（1:N）
- 1つの `players` は1つの `buttons` を使用済みにできる（1:1、`used_by` 経由）
- 1つの `players` は複数の `scores` レコードを持つ（加点・減点履歴、1:N）
- 1つの `events` は複数の `event_logs` を持つ（1:N）

## 3. 同時押し制御（このシステムの核心）

```sql
UPDATE buttons
SET status = 'used', used_by = $player_id, used_at = now()
WHERE code = $code AND status = 'unused'
RETURNING *;
```

このUPDATE文はPostgreSQLの行ロックによりatomicに実行される。同時に多数のリクエストが来ても、`WHERE status = 'unused'` を満たすのは最初の1件のみで、残りは0行更新（＝取得失敗）となる。アプリケーション層で「先にSELECTしてから条件分岐」を行う実装は絶対に禁止。レースコンディションの温床になる。

## 4. URL設計

- `/register` プレイヤー名登録（初回のみ）
- `/button/[code]` QRコードが直接指すURL。codeはランダムトークン
- `/ranking` ランキング表示
- `/admin/login`
- `/admin/dashboard`
- `/admin/players`
- `/admin/buttons`
- `/admin/scores`
- `/admin/qrcodes`

## 5. API設計（Route Handlers）

| メソッド | パス | 概要 | 認証 |
|---|---|---|---|
| POST | /api/players | プレイヤー登録、player_token発行 | 不要 |
| POST | /api/buttons/[code]/press | 解答権取得（atomic UPDATE） | player_token(Cookie) |
| GET | /api/buttons/[code] | ボタン状態確認 | 不要 |
| GET | /api/ranking | ランキング取得 | 不要 |
| POST | /api/admin/scores | 加点・減点 | admin |
| POST | /api/admin/buttons | ボタン作成・一括生成 | admin |
| PATCH | /api/admin/buttons/[id] | ボタン編集・リセット | admin |
| DELETE | /api/admin/buttons/[id] | ボタン削除 | admin |
| GET | /api/admin/qrcodes/[id] | PNG/SVG生成 | admin |

## 6. 認証設計

- **プレイヤー**: 初回アクセス時にサーバーが `player_token`（UUID）を発行し、httpOnly Cookie（SameSite=Lax）に保存。以降はこのCookieで本人性を判定する。名前だけの識別は行わない。
- **管理者**: Supabase Auth（email/password）でログイン。`admins` テーブルに登録されたユーザーのみ管理画面・管理APIにアクセス可能。RLSで `admins` に存在しないユーザーからの書き込みをDBレベルで拒否する。

## 7. MVP方針（実装ステップの優先順位）

- **Phase 1（必須）**: 単一イベント、プレイヤー登録（token方式）、ボタン押下（atomic更新）、シンプルな管理画面（ランキング・加減点・ボタン一覧）
- **Phase 2**: 複数イベント対応、QRコード生成・一括ダウンロード
- **Phase 3**: リアルタイム更新（Supabase Realtimeでランキングをライブ反映）、演出強化

以降のステップは、この設計に基づいて `1. プロジェクト初期構築` から順に実装していく。
