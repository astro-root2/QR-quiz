-- マルチテナント化: イベントに所有者(owner_id)を持たせ、
-- 「admins 手動INSERT方式」を廃止して「サインアップ即オーナー」方式へ移行する。

alter table events add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- 既存の固定許可リスト方式(admins)は今後の認可判定に使わない。
-- scores.admin_id は admins への外部キーではないため、drop しても他テーブルへの影響はない。
drop table if exists admins;

-- イベントの作成・更新・削除は「ログイン済みかつ自分が owner_id であること」を要求する。
-- 参照(select)は既存の "public read events" ポリシーのまま(登録画面・ランキング・ボタン画面が
-- 未ログインで event を引ける必要があるため)。
create policy "owner insert events" on events
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "owner update events" on events
  for update to authenticated
  using (owner_id = auth.uid());

create policy "owner delete events" on events
  for delete to authenticated
  using (owner_id = auth.uid());

