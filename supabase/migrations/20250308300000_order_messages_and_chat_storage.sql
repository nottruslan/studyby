-- Order-specific chat: messages table and chat-attachments storage

-- 1. Table order_messages
CREATE TABLE IF NOT EXISTS public.order_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  content text,
  file_url text,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- 2. Index for fast chronological fetch
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id_created_at
  ON public.order_messages(order_id, created_at);

-- 3. RLS: student who owns the order or admin
CREATE POLICY "order_messages_select"
  ON public.order_messages
  FOR SELECT
  USING (
    (auth.uid() = (SELECT student_id FROM public.orders WHERE id = order_id))
    OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "order_messages_insert"
  ON public.order_messages
  FOR INSERT
  WITH CHECK (
    (auth.uid() = (SELECT student_id FROM public.orders WHERE id = order_id))
    OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- Enable Realtime for order_messages (if publication exists; otherwise enable in Dashboard)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL; -- already added
END $$;

-- 4. Storage bucket chat-attachments (path: {order_id}/{filename})
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: allow SELECT/INSERT only for objects under an order the user can access
CREATE POLICY "chat_attachments_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND (
      (auth.uid() = (SELECT student_id FROM public.orders WHERE id = (string_to_array(name, '/'))[1]::uuid))
      OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "chat_attachments_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (
      (auth.uid() = (SELECT student_id FROM public.orders WHERE id = (string_to_array(name, '/'))[1]::uuid))
      OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );
