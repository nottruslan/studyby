# Applying migrations to Supabase

If you see **"Could not find the table 'public.order_messages' in the schema cache"**, the chat migration has not been applied to your project.

## Option 1: SQL Editor (recommended)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Copy the contents of **`apply_chat_migration.sql`** and paste into the editor.
4. Click **Run**.

This creates the `order_messages` table, RLS policies, index, Realtime publication, and the `chat-attachments` storage bucket.

## Option 2: Supabase CLI

If the project is linked (`supabase link`):

```bash
supabase db push
```

This runs all files in `migrations/` in order. The chat migration is `20250308300000_order_messages_and_chat_storage.sql`.

## Feed (Studling) — таблица постов и 20 тестовых постов

1. В **SQL Editor** создай запрос.
2. Скопируй содержимое файла **`apply_feed_and_seed.sql`** и нажми **Run**.
3. Будет создана таблица `posts` (если её ещё нет) и добавлено 20 тестовых постов от первого пользователя из `profiles`. Если профилей нет — сначала зайди в приложение и зарегистрируйся, затем снова выполни скрипт.

## After applying

- In **Database → Realtime**, ensure `order_messages` is enabled for the `supabase_realtime` publication if you use live updates.
- Reload the app; the schema cache will include `order_messages` and the error should disappear.
