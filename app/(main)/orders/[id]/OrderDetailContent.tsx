"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeft, Loader2, ExternalLink, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/lib/types/order";
import { StatusBadge, formatOrderDate } from "@/lib/orders/order-display";
import {
  getOrderFileUrlsForStudent,
  approveOrderPrice,
  rejectOrder,
  cancelOrderByStudent,
  deleteOrderByStudent,
} from "./actions";
import type { OrderMessageRow } from "./actions";
import { OrderChatArea } from "./components/chat/OrderChatArea";

type Props = {
  order: Order;
  currentUserId: string;
  initialChatMessages: OrderMessageRow[];
  studentUsername: string | null;
};

export function OrderDetailContent({
  order,
  currentUserId,
  initialChatMessages,
  studentUsername,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileUrls, setFileUrls] = useState<{ path: string; url: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    getOrderFileUrlsForStudent(order.id)
      .then(setFileUrls)
      .finally(() => setLoadingFiles(false));
  }, [order.id]);

  const handleApprove = async () => {
    setActionLoading("approve");
    const result = await approveOrderPrice(order.id);
    setActionLoading(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Цена одобрена, заказ в работе");
    router.refresh();
  };

  const handleReject = async () => {
    setActionLoading("reject");
    const result = await rejectOrder(order.id);
    setActionLoading(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Заказ отклонён");
    router.refresh();
  };

  const handleCancel = async () => {
    if (!confirm("Отменить заказ? Это действие нельзя отменить.")) return;
    setActionLoading("cancel");
    const result = await cancelOrderByStudent(order.id);
    setActionLoading(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Заказ отменён");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Удалить заказ из списка?")) return;
    setActionLoading("delete");
    const result = await deleteOrderByStudent(order.id);
    setActionLoading(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Заказ удалён из вашего списка");
    startTransition(() => {
      router.push("/orders");
      router.refresh();
    });
  };

  const canEditOrCancel =
    order.status === "review" || order.status === "waiting_payment";
  const isWaitingPayment = order.status === "waiting_payment";
  const isOverdue =
    order.deadline && new Date(order.deadline) < new Date();

  const orderContent = (
    <>
      <div className="flex items-center gap-2">
        <Link
          href="/orders"
          prefetch={true}
          className="inline-flex items-center gap-1 rounded-3xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground -m-1"
        >
          <ChevronLeft className="h-4 w-4" />
          К заказам
        </Link>
      </div>

      <div className="card-style rounded-3xl p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-xl font-semibold text-foreground">{order.title}</h1>
          <StatusBadge status={order.status} />
        </div>

        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Предмет</dt>
            <dd>{order.subject ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Тип работы</dt>
            <dd>{order.work_type ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Дедлайн</dt>
            <dd className={isOverdue ? "text-destructive font-medium" : ""}>
              {formatOrderDate(order.deadline)}
              {isOverdue && " (просрочено)"}
            </dd>
          </div>
          {order.price != null && (
            <div>
              <dt className="text-muted-foreground">Цена</dt>
              <dd className="font-medium">{order.price} ₽</dd>
            </div>
          )}
          {order.description && (
            <div>
              <dt className="text-muted-foreground">Описание</dt>
              <dd className="whitespace-pre-wrap">{order.description}</dd>
            </div>
          )}
          {order.originality != null && (
            <div>
              <dt className="text-muted-foreground">Оригинальность</dt>
              <dd>{order.originality}%</dd>
            </div>
          )}
          {order.plagiarism_system && (
            <div>
              <dt className="text-muted-foreground">Система проверки</dt>
              <dd>{order.plagiarism_system}</dd>
            </div>
          )}
          {order.volume && (
            <div>
              <dt className="text-muted-foreground">Объём</dt>
              <dd>{order.volume}</dd>
            </div>
          )}
          {order.university && (
            <div>
              <dt className="text-muted-foreground">ВУЗ</dt>
              <dd>{order.university}</dd>
            </div>
          )}
          {order.professor && (
            <div>
              <dt className="text-muted-foreground">Преподаватель</dt>
              <dd>{order.professor}</dd>
            </div>
          )}
        </dl>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Файлы</h3>
          {loadingFiles ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загрузка…
            </p>
          ) : fileUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет прикреплённых файлов</p>
          ) : (
            <ul className="space-y-1">
              {fileUrls.map(({ path, url }) => (
                <li key={path}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {path.split("/").pop() ?? path}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(isWaitingPayment || canEditOrCancel) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {isWaitingPayment && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={!!actionLoading}
                  className="rounded-3xl"
                >
                  {actionLoading === "approve" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Одобрить цену"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={!!actionLoading}
                  className="rounded-3xl"
                >
                  {actionLoading === "reject" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Отклонить"
                  )}
                </Button>
              </>
            )}
            {canEditOrCancel && (
              <>
                <Link
                  href={`/orders/${order.id}/edit`}
                  prefetch={true}
                  className={buttonVariants({ variant: "outline", className: "rounded-3xl" })}
                >
                  Редактировать
                </Link>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={!!actionLoading}
                  className="rounded-3xl text-destructive hover:text-destructive"
                >
                  {actionLoading === "cancel" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Отменить заказ"
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={!!actionLoading || isPending}
            className="rounded-3xl text-muted-foreground hover:text-destructive"
          >
            {actionLoading === "delete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Удалить из моих заказов
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile: link to full-screen chat */}
      <div className="md:hidden">
        <Link
          href={`/orders/${order.id}/chat`}
          prefetch={true}
          className={buttonVariants({ variant: "outline", className: "rounded-3xl w-full" })}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Чат
        </Link>
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-4 md:gap-6 min-h-0">
      <div className="space-y-6 min-w-0">{orderContent}</div>
      <div className="hidden md:flex flex-col min-h-0 rounded-3xl border border-border overflow-hidden card-style">
        <OrderChatArea
          orderId={order.id}
          currentUserId={currentUserId}
          initialMessages={initialChatMessages}
          studentUsername={studentUsername}
          isCurrentUserAdmin={false}
          fullScreen={false}
        />
      </div>
    </div>
  );
}
