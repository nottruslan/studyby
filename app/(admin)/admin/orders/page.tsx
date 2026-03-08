import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderWithStudent } from "@/lib/types/order";
import { AdminOrdersView } from "./AdminOrdersView";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const admin = createAdminClient();

  const { data: ordersData } = await admin
    .from("orders")
    .select("id, student_id, title, subject, work_type, deadline, description, files, status, price, created_at")
    .eq("deleted_by_admin", false)
    .order("created_at", { ascending: false });

  const orders = (ordersData ?? []) as Omit<OrderWithStudent, "profiles">[];

  const studentIds = Array.from(new Set(orders.map((o) => o.student_id)));
  let profilesMap: Record<string, { username: string | null; email: string | null }> = {};

  if (studentIds.length > 0) {
    const { data: profilesData } = await admin
      .from("profiles")
      .select("id, username, email")
      .in("id", studentIds);

    if (profilesData) {
      profilesMap = Object.fromEntries(
        profilesData.map((p) => [
          p.id,
          { username: p.username ?? null, email: p.email ?? null },
        ])
      );
    }
  }

  const ordersWithStudent: OrderWithStudent[] = orders.map((o) => ({
    ...o,
    profiles: profilesMap[o.student_id] ?? null,
  }));

  return (
    <div className="space-y-4">
      <h1 className="hidden lg:block text-xl font-semibold text-foreground">Заказы</h1>
      <AdminOrdersView orders={ordersWithStudent} />
    </div>
  );
}
