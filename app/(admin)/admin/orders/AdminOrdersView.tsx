"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrderWithStudent, OrderStatus } from "@/lib/types/order";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "review", label: "На проверке" },
  { value: "waiting_payment", label: "Ожидает оплаты" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
];

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

function formatDate(dateStr: string | null): string {
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

function studentDisplay(order: OrderWithStudent): string {
  const p = order.profiles;
  if (!p) return order.student_id.slice(0, 8) + "…";
  const parts = [p.email ?? p.username ?? ""].filter(Boolean);
  if (p.username && p.email && p.username !== p.email?.split("@")[0]) {
    parts.unshift(p.username);
  }
  return parts.join(" / ") || order.student_id.slice(0, 8) + "…";
}

function StatusBadge({ status }: { status: OrderStatus }) {
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

type Props = { orders: OrderWithStudent[] };

export function AdminOrdersView({ orders: initialOrders }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const filtered = useMemo(() => {
    let list = initialOrders;
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const [sort] = sorting;
    if (sort) {
      list = [...list].sort((a, b) => {
        const aVal = sort.id === "created_at" ? (a.created_at ?? "") : (a.deadline ?? "");
        const bVal = sort.id === "created_at" ? (b.created_at ?? "") : (b.deadline ?? "");
        const cmp = aVal.localeCompare(bVal);
        return sort.desc ? -cmp : cmp;
      });
    }
    return list;
  }, [initialOrders, statusFilter, sorting]);

  const columns = useMemo<ColumnDef<OrderWithStudent>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.id.slice(0, 8)}…
          </span>
        ),
      },
      {
        accessorFn: (row) => studentDisplay(row),
        id: "student",
        header: "Студент",
        cell: ({ row }) => (
          <span className="max-w-[180px] truncate block">
            {studentDisplay(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "subject",
        header: "Предмет",
        cell: ({ row }) => row.original.subject ?? "—",
      },
      {
        accessorKey: "work_type",
        header: "Тип",
        cell: ({ row }) => row.original.work_type ?? "—",
      },
      {
        accessorKey: "deadline",
        id: "deadline",
        header: "Дедлайн",
        cell: ({ row }) => formatDate(row.original.deadline),
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "price",
        header: "Цена",
        cell: ({ row }) => {
          const p = row.original.price;
          return p != null ? `${p} ₽` : "—";
        },
      },
      {
        id: "actions",
        header: "Действия",
        cell: ({ row }) => (
          <Link
            href={`/admin/orders/${row.original.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "rounded-3xl" })}
          >
            Редактировать
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Статус:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] rounded-3xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block overflow-x-auto rounded-3xl border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Нет заказов
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Нет заказов</p>
        ) : (
          filtered.map((order) => (
            <Card key={order.id} className="rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {order.id.slice(0, 8)}…
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="font-medium truncate">{order.title}</p>
                <p className="text-sm text-muted-foreground">
                  {studentDisplay(order)}
                </p>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>Предмет: {order.subject ?? "—"}</p>
                <p>Тип: {order.work_type ?? "—"}</p>
                <p>Дедлайн: {formatDate(order.deadline)}</p>
                <p>Цена: {order.price != null ? `${order.price} ₽` : "—"}</p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/admin/orders/${order.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "w-full rounded-3xl" })}
                >
                  Редактировать
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
