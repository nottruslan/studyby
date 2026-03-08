import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types/order";
import { OrdersListClient } from "./OrdersListClient";

export async function OrdersData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <OrdersListClient orders={[]} loadError={true} />;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, student_id, title, subject, work_type, deadline, description, files, status, price, created_at, originality, plagiarism_system, volume, university, professor")
    .eq("student_id", user.id)
    .eq("deleted_by_student", false)
    .order("created_at", { ascending: false });

  const orders = (data as Order[] | null) ?? [];
  const loadError = !!error;

  return <OrdersListClient orders={orders} loadError={loadError} />;
}
