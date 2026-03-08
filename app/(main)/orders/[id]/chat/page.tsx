import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInitialMessages } from "../actions";
import { OrderChatArea } from "../components/chat/OrderChatArea";

type Props = { params: Promise<{ id: string }> };

export default async function OrderChatPage({ params }: Props) {
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
    .select("id, student_id")
    .eq("id", id)
    .single();

  if (error || !order) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";
  if (order.student_id !== user.id && !isAdmin) notFound();

  const initialMessages = await getInitialMessages(id);

  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", order.student_id)
    .single();

  const studentUsername = studentProfile?.username ?? null;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background pt-[env(safe-area-inset-top)]">
      <div className="flex-1 min-h-0 flex flex-col">
        <OrderChatArea
          orderId={id}
          currentUserId={user.id}
          initialMessages={initialMessages}
          studentUsername={studentUsername}
          isCurrentUserAdmin={isAdmin}
          fullScreen={true}
          backHref={`/orders/${id}`}
          backLabel="К заказу"
        />
      </div>
    </div>
  );
}
