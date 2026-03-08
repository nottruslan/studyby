import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types/order";

/** Формат даты без названий месяцев, чтобы совпадал на сервере и в браузере (нет hydration mismatch). */
export function formatOrderDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  review: "На проверке",
  waiting_payment: "Ожидает оплаты",
  in_progress: "В работе",
  completed: "Выполнен",
  cancelled: "Отменён",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  review: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  waiting_payment: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  in_progress: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  completed: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  cancelled: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLE[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
