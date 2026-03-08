"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Plus,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types/order";
import { StatusBadge, formatOrderDate } from "@/lib/orders/order-display";
import { revalidateOrders } from "./actions";

const ACTIVE_STATUSES = ["review", "waiting_payment", "in_progress"];
const HISTORY_STATUSES = ["completed", "cancelled"];

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

type Props = { orders: Order[]; loadError: boolean };

export function OrdersListClient({ orders, loadError }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"active" | "history">("active");

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [router]);

  const handleRetry = () => {
    revalidateOrders().then(() => router.refresh());
  };

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) => HISTORY_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 rounded-3xl bg-muted w-fit">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={cn(
            "rounded-3xl px-4 py-2 text-sm font-medium transition-colors",
            tab === "active"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Активные
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={cn(
            "rounded-3xl px-4 py-2 text-sm font-medium transition-colors",
            tab === "history"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          История
        </button>
      </div>

      {loadError ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Не удалось загрузить заказы
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Проверьте интернет и попробуйте снова.
          </p>
          <Button
            variant="outline"
            className="mt-6 rounded-3xl"
            onClick={handleRetry}
          >
            Повторить
          </Button>
        </div>
      ) : tab === "active" ? (
        activeOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Пока нет активных заказов"
            description="Создайте заказ — модератор назначит цену, после чего можно будет оплатить и начать работу."
            action={
              <Link
                href="/orders/new"
                prefetch={true}
                className="inline-flex items-center justify-center rounded-3xl h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать заказ
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            <Link
              href="/orders/new"
              prefetch={true}
              className="inline-flex items-center justify-center rounded-3xl h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать заказ
            </Link>
            <ul className="space-y-3">
            {activeOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  prefetch={true}
                  className="card-style flex flex-col gap-2 rounded-3xl p-4 transition-colors hover:bg-muted/30 block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground line-clamp-1">
                      {order.title}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  {order.deadline && (
                    <p className="text-sm text-muted-foreground">
                      Срок: {formatOrderDate(order.deadline)}
                    </p>
                  )}
                  {order.status === "waiting_payment" && order.price != null && (
                    <p className="text-sm font-medium text-foreground">
                      Цена: {order.price} ₽
                    </p>
                  )}
                </Link>
              </li>
            ))}
            </ul>
          </div>
        )
      ) : historyOrders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="История пуста"
          description="Здесь появятся выполненные и отменённые заказы."
          action={
            <Link
              href="/orders/new"
              prefetch={true}
              className="inline-flex items-center justify-center rounded-3xl h-10 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Создать заказ
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {historyOrders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                prefetch={true}
                className="card-style flex flex-col gap-2 rounded-3xl p-4 transition-colors hover:bg-muted/30 block"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-foreground line-clamp-1">
                    {order.title}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                {order.deadline && (
                  <p className="text-sm text-muted-foreground">
                    Срок: {formatOrderDate(order.deadline)}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
