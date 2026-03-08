import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types/order";
import { OrderDetailContent } from "./OrderDetailContent";
import { getInitialMessages } from "./actions";

type Props = { params: Promise<{ id: string }> };

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, student_id, title, subject, work_type, deadline, description, files, status, price, created_at, deleted_by_student, originality, plagiarism_system, volume, university, professor")
    .eq("id", id)
    .single();

  if (error || !order || order.student_id !== user.id || order.deleted_by_student) {
    notFound();
  }

  const initialMessages = await getInitialMessages(id);

  return (
    <OrderDetailContent
      order={order as Order}
      currentUserId={user.id}
      initialChatMessages={initialMessages}
    />
  );
}
