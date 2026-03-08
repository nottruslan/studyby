"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/types/order";

const BUCKET = "order-files";
const SIGNED_URL_EXPIRES = 3600;

export type SignedFile = { path: string; url: string };

export async function getOrderFileUrlsForStudent(
  orderId: string
): Promise<SignedFile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: order } = await supabase
    .from("orders")
    .select("student_id, files")
    .eq("id", orderId)
    .single();

  if (!order || order.student_id !== user.id) return [];

  const paths = (order.files as string[] | null) ?? [];
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

export type OrderActionResult = { success: true } | { error: string };

export async function approveOrderPrice(
  orderId: string
): Promise<OrderActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: order } = await supabase
    .from("orders")
    .select("student_id, status")
    .eq("id", orderId)
    .single();

  if (!order || order.student_id !== user.id) return { error: "Заказ не найден" };
  if (order.status !== "waiting_payment") return { error: "Неверный статус заказа" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "in_progress" as OrderStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function rejectOrder(orderId: string): Promise<OrderActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: order } = await supabase
    .from("orders")
    .select("student_id, status")
    .eq("id", orderId)
    .single();

  if (!order || order.student_id !== user.id) return { error: "Заказ не найден" };
  if (order.status !== "waiting_payment") return { error: "Неверный статус заказа" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" as OrderStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function cancelOrderByStudent(
  orderId: string
): Promise<OrderActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: order } = await supabase
    .from("orders")
    .select("student_id, status")
    .eq("id", orderId)
    .single();

  if (!order || order.student_id !== user.id) return { error: "Заказ не найден" };
  if (order.status !== "review" && order.status !== "waiting_payment") {
    return { error: "Отменить можно только заказ на проверке или ожидающий оплаты" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" as OrderStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

/** Скрыть заказ из списка студента (в админке остаётся). */
export async function deleteOrderByStudent(
  orderId: string
): Promise<OrderActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: order } = await supabase
    .from("orders")
    .select("student_id")
    .eq("id", orderId)
    .single();

  if (!order || order.student_id !== user.id) return { error: "Заказ не найден" };

  const { error } = await supabase
    .from("orders")
    .update({ deleted_by_student: true })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function updateOrderByStudent(
  orderId: string,
  formData: FormData
): Promise<OrderActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: order } = await supabase
    .from("orders")
    .select("student_id, status")
    .eq("id", orderId)
    .single();

  if (!order || order.student_id !== user.id) return { error: "Заказ не найден" };
  if (order.status !== "review" && order.status !== "waiting_payment") {
    return { error: "Редактировать можно только заказ на проверке или ожидающий оплаты" };
  }

  const title = (formData.get("title") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const work_type = (formData.get("work_type") as string)?.trim();
  const deadline = (formData.get("deadline") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const originalityRaw = (formData.get("originality") as string)?.trim();
  const originality =
    originalityRaw === ""
      ? null
      : (() => {
          const n = Number(originalityRaw);
          return Number.isNaN(n) || n < 0 || n > 100 ? null : n;
        })();
  const plagiarism_system = (formData.get("plagiarism_system") as string)?.trim() || null;
  const volume = (formData.get("volume") as string)?.trim() || null;
  const university = (formData.get("university") as string)?.trim() || null;
  const professor = (formData.get("professor") as string)?.trim() || null;
  const keepFilePathsRaw = formData.get("keepFilePaths") as string;
  const keepFilePaths: string[] = keepFilePathsRaw
    ? (JSON.parse(keepFilePathsRaw) as string[])
    : [];

  if (!title || !subject || !work_type || !deadline) {
    return { error: "Заполните обязательные поля" };
  }

  const filePaths = [...keepFilePaths];
  const newFiles = formData.getAll("newFiles") as File[];
  if (newFiles?.length) {
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (file.size === 0) continue;
      const safeName = `${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const path = `${orderId}/${safeName}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (!upErr) filePaths.push(path);
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      title,
      subject,
      work_type,
      deadline: new Date(deadline).toISOString(),
      description,
      files: filePaths,
      originality,
      plagiarism_system,
      volume,
      university,
      professor,
    })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}
