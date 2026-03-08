"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVE_STATUSES = ["review", "waiting_payment", "in_progress"];
const HISTORY_STATUSES = ["completed", "cancelled"];

export type OrderStatus =
  | "review"
  | "waiting_payment"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Order = {
  id: string;
  student_id: string;
  title: string;
  subject: string | null;
  work_type: string | null;
  deadline: string | null;
  description: string | null;
  files: string[] | null;
  status: OrderStatus;
  price: number | null;
  created_at?: string;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month}, ${hours}:${minutes} (МСК)`;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const labels: Record<OrderStatus, string> = {
    review: "На проверке",
    waiting_payment: "Ожидает оплаты",
    in_progress: "В работе",
    completed: "Выполнен",
    cancelled: "Отменён",
  };
  const style: Record<OrderStatus, string> = {
    review: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
    waiting_payment: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
    in_progress: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    completed: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    cancelled: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        style[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

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
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) {
        setOrders([]);
      } else {
        setOrders((data as Order[]) ?? []);
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) => HISTORY_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">Биржа заказов</h2>
        <Button asChild className="rounded-3xl" size="sm">
          <Link href="/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать заказ
          </Link>
        </Button>
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

      {loading ? (
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
              <Button asChild className="rounded-3xl">
                <Link href="/orders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать заказ
                </Link>
              </Button>
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
                      Срок: {formatDate(order.deadline)}
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
            <Button asChild variant="outline" className="rounded-3xl">
              <Link href="/orders/new">Создать заказ</Link>
            </Button>
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
                    Срок: {formatDate(order.deadline)}
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
