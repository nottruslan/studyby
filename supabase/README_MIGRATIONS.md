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

## After applying

- In **Database → Realtime**, ensure `order_messages` is enabled for the `supabase_realtime` publication if you use live updates.
- Reload the app; the schema cache will include `order_messages` and the error should disappear.
