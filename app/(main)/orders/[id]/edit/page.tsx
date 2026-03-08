import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types/order";
import { ChevronLeft } from "lucide-react";
import { EditOrderForm } from "./EditOrderForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditOrderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, student_id, title, subject, work_type, deadline, description, files, status")
    .eq("id", id)
    .single();

  if (error || !order || order.student_id !== user.id) notFound();
  if (order.status !== "review" && order.status !== "waiting_payment") {
    notFound();
  }

  const deadlineLocal = order.deadline
    ? (() => {
        const d = new Date(order.deadline);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const h = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${day}T${h}:${min}`;
      })()
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/orders/${id}`}
          className="inline-flex items-center gap-1 rounded-3xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground -m-1"
        >
          <ChevronLeft className="h-5 w-5" />
          К заказу
        </Link>
      </div>
      <h2 className="text-xl font-semibold text-foreground">Редактировать заказ</h2>
      <EditOrderForm
        order={order as Order}
        deadlineLocal={deadlineLocal ?? ""}
      />
    </div>
  );
}
