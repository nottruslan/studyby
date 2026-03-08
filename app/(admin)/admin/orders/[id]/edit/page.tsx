import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderWithStudent } from "@/lib/types/order";
import { AdminOrderEditForm } from "./AdminOrderEditForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderEditPage({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, student_id, title, subject, work_type, deadline, description, files, status, price, created_at, deleted_by_student, deleted_by_admin")
    .eq("id", id)
    .single();

  if (orderError || !order || order.deleted_by_admin) {
    notFound();
  }

  const orderWithStudent = order as Omit<OrderWithStudent, "profiles">;
  let profilesMap: Record<string, { username: string | null; email: string | null }> = {};

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username, email")
    .eq("id", order.student_id)
    .single();

  if (profile) {
    profilesMap[order.student_id] = {
      username: profile.username ?? null,
      email: profile.email ?? null,
    };
  }

  const fullOrder: OrderWithStudent = {
    ...orderWithStudent,
    profiles: profilesMap[order.student_id] ?? null,
  };

  return <AdminOrderEditForm order={fullOrder} />;
}
