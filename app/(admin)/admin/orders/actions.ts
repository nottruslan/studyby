"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/types/order";

export type UpdateOrderAdminResult = { success: true } | { error: string };

export async function updateOrderAdmin(
  orderId: string,
  data: { status?: OrderStatus; price?: number | null }
): Promise<UpdateOrderAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Не авторизован" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Доступ запрещён" };
  }

  const admin = createAdminClient();
  const updates: { status?: OrderStatus; price?: number | null } = {};
  if (data.status !== undefined) updates.status = data.status;
  if (data.price !== undefined) updates.price = data.price;

  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  const { error } = await admin
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

/** Скрыть заказ из списка админки (у студента остаётся). */
export async function deleteOrderByAdmin(
  orderId: string
): Promise<UpdateOrderAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Доступ запрещён" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ deleted_by_admin: true })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  return { success: true };
}

const BUCKET = "order-files";
const SIGNED_URL_EXPIRES = 3600;

export type SignedFile = { path: string; url: string };

export async function getOrderFileUrls(orderId: string): Promise<SignedFile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return [];

  const { data: order } = await supabase
    .from("orders")
    .select("files")
    .eq("id", orderId)
    .single();

  const paths = (order?.files as string[] | null) ?? [];
  if (paths.length === 0) return [];

  const admin = createAdminClient();
  const results = await Promise.all(
    paths.map(async (path) => {
      const { data } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_EXPIRES);
      return { path, url: data?.signedUrl ?? "" };
    })
  );
  return results.filter((r) => r.url);
}
