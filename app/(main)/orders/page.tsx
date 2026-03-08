"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types/order";
import { StatusBadge, formatOrderDate } from "@/lib/orders/order-display";

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

export default function OrdersPage() {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const handleRetry = () => {
    setLoadError(false);
    setLoading(true);
    setRetryTrigger((t) => t + 1);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("orders")
        .select("id, student_id, title, subject, work_type, deadline, description, files, status, price, created_at")
        .eq("student_id", user.id)
        .eq("deleted_by_student", false)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) {
        setOrders([]);
        setLoadError(true);
      } else {
        setOrders((data as Order[]) ?? []);
        setLoadError(false);
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [retryTrigger]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) => HISTORY_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">Биржа заказов</h2>
        <Link
          href="/orders/new"
          className="inline-flex items-center justify-center rounded-3xl h-9 px-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Создать заказ
        </Link>
      </div>

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
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                className="inline-flex items-center justify-center rounded-3xl h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать заказ
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {activeOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
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
        )
      ) : historyOrders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="История пуста"
          description="Здесь появятся выполненные и отменённые заказы."
          action={
            <Link
              href="/orders/new"
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
