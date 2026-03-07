/**
 * Конфигурация Supabase из переменных окружения.
 * Локально: скопируй .env.example в .env.local и подставь anon-ключ (Supabase → Settings → API).
 * На Vercel: задай переменные в Project → Settings → Environment Variables.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnv(): { url: string; anonKey: string } {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase: не заданы NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Локально: скопируй .env.example в .env.local и вставь anon-ключ из Supabase Dashboard → Project Settings → API. " +
        "На Vercel: добавь переменные в Settings → Environment Variables."
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

/** Для middleware: не бросает ошибку, возвращает null, если переменных нет. */
export function getSupabaseEnvOptional(): { url: string; anonKey: string } | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
