-- 1) Apply feed posts table (same as 20250308400000_feed_posts.sql)
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

DROP POLICY IF EXISTS "posts_select_authenticated" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_select_authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2) Insert 20 test posts (uses first profile as author; safe to run multiple times — adds 20 more each time)
-- If you have no profiles yet, sign up once in the app, then run this again.
INSERT INTO public.posts (user_id, body)
SELECT p.id, v.body
FROM (SELECT id FROM public.profiles LIMIT 1) p
CROSS JOIN (VALUES
  ('Всем привет!'),
  ('Есть кто-нибудь?'),
  ('Кто-нибудь уже сдал лабу по матану?'),
  ('Где тут можно поесть недорого?'),
  ('Рекомендую пару на английский — супер преподаватель'),
  ('Кто идёт на концерт в субботу?'),
  ('Обменяю конспекты по физике на шпоры по химии'),
  ('Нашёл отличный разбор первой задачи из ДЗ'),
  ('Студсовет собирает идеи для ивента — пишите в комменты'),
  ('Опять дедлайн в понедельник, а я только открыл задание'),
  ('Кто записывался на курсовую к Иванову?'),
  ('В библиотеке сегодня тихо, рекомендую'),
  ('Есть ли у кого материалы к зачёту по истории?'),
  ('Собрались в кафе после пар — присоединяйтесь'),
  ('Напоминаю: завтра дедлайн по эссе'),
  ('Кто хочет в команду на хакатон?'),
  ('Лекция перенесли на четверг'),
  ('Сдал сессию — всем удачи, вы справитесь'),
  ('Где лучше готовиться к экзамену: дома или в универе?'),
  ('Первый пост в Studling, тестирую ленту')
) AS v(body);
