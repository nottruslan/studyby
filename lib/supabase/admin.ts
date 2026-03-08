import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/** Fetch без кэша Next.js, чтобы данные из админки всегда были актуальными. */
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

/**
 * Supabase client with service_role. Use only in Server Actions or API routes.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 * Uses cache: 'no-store' so router.refresh() and reload always see fresh DB data.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it in .env.local (Supabase Dashboard → API → service_role)."
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}
