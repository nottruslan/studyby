"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Проверяет, зарегистрирован ли уже пользователь с таким email.
 * Используется только на сервере (Server Action).
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const normalized = email?.trim()?.toLowerCase();
  if (!normalized) return false;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers({
      perPage: 1000,
      page: 1,
    });
    if (error) {
      console.error("checkEmailExists:", error);
      return false;
    }
    const exists = data.users.some(
      (u) => u.email?.toLowerCase() === normalized
    );
    return exists;
  } catch (e) {
    console.error("checkEmailExists:", e);
    return false;
  }
}
