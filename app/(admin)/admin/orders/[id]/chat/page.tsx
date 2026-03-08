import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInitialMessages } from "@/app/(main)/orders/[id]/actions";
import { OrderChatArea } from "@/app/(main)/orders/[id]/components/chat/OrderChatArea";
import { ChatFullscreenShell } from "@/app/(main)/orders/[id]/components/chat/ChatFullscreenShell";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderChatPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    notFound();
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, student_id, deleted_by_admin")
    .eq("id", id)
    .single();

  if (error || !order || order.deleted_by_admin) {
    notFound();
  }

  const initialMessages = await getInitialMessages(id);

  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", order.student_id)
    .single();

  const studentUsername = studentProfile?.username ?? null;

  return (
    <ChatFullscreenShell>
      <OrderChatArea
        orderId={id}
        currentUserId={user.id}
        initialMessages={initialMessages}
        studentUsername={studentUsername}
        isCurrentUserAdmin={true}
        fullScreen={true}
        backHref={`/admin/orders/${id}/edit`}
        backLabel="К заказу"
      />
    </ChatFullscreenShell>
  );
}
