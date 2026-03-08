-- Studling feed: posts table for student Twitter-style feed

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc
  ON public.posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at
  ON public.posts(user_id, created_at DESC);

-- RLS: any authenticated user can read; only author can insert/update/delete
CREATE POLICY "posts_select_authenticated"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "posts_insert_own"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_update_own"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete_own"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
