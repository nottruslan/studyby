import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInitialMessages } from "@/app/(main)/orders/[id]/actions";
import { OrderChatArea } from "@/app/(main)/orders/[id]/components/chat/OrderChatArea";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
    <div className="flex flex-col h-[100dvh] w-full bg-background">
      <header className="flex-shrink-0 flex items-center gap-2 border-b border-border px-4 py-3">
        <Link
          href={`/admin/orders/${id}/edit`}
          prefetch={true}
          className="inline-flex items-center gap-1 rounded-3xl px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground -m-1"
        >
          <ChevronLeft className="h-5 w-5" />
          К заказу
        </Link>
      </header>
      <div className="flex-1 min-h-0">
        <OrderChatArea
          orderId={id}
          currentUserId={user.id}
          initialMessages={initialMessages}
          studentUsername={studentUsername}
          isCurrentUserAdmin={true}
          fullScreen={true}
        />
      </div>
    </div>
  );
}
