"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { OrderWithStudent, OrderStatus } from "@/lib/types/order";
import { updateOrderAdmin, getOrderFileUrls, deleteOrderByAdmin } from "./actions";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "review", label: "На проверке" },
  { value: "waiting_payment", label: "Ожидает оплаты" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
];

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

type Props = {
  order: OrderWithStudent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function OrderEditSheet({ order, open, onOpenChange, onSuccess }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [price, setPrice] = useState<string>(
    order.price != null ? String(order.price) : ""
  );
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fileUrls, setFileUrls] = useState<{ path: string; url: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    setStatus(order.status);
    setPrice(order.price != null ? String(order.price) : "");
  }, [order]);

  useEffect(() => {
    if (!open || !order.id) return;
    setLoadingFiles(true);
    getOrderFileUrls(order.id)
      .then(setFileUrls)
      .finally(() => setLoadingFiles(false));
  }, [open, order.id]);

  const handleSave = async () => {
    setSaving(true);
    const priceNum = price.trim() === "" ? null : Number(price.trim());
    if (price.trim() !== "" && (Number.isNaN(priceNum) || (priceNum ?? 0) < 0)) {
      toast.error("Введите корректную цену");
      setSaving(false);
      return;
    }
    const result = await updateOrderAdmin(order.id, {
      status,
      price: priceNum,
    });
    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Изменения сохранены");
    onSuccess();
    onOpenChange(false);
    router.refresh();
  };

  const handleCancelOrder = async () => {
    if (!confirm("Отменить заказ? Статус будет изменён на «Отменён».")) return;
    setCancelling(true);
    const result = await updateOrderAdmin(order.id, { status: "cancelled" });
    setCancelling(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Заказ отменён");
    onSuccess();
    onOpenChange(false);
    router.refresh();
  };

  const handleDeleteFromAdmin = async () => {
    if (!confirm("Удалить заказ из списка админки? У студента он по-прежнему будет виден.")) return;
    setDeleting(true);
    const result = await deleteOrderByAdmin(order.id);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Заказ удалён из списка админки");
    onSuccess();
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование заказа</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 py-4">
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">ID:</span> {order.id}</p>
            <p><span className="text-muted-foreground">Студент:</span> {studentDisplay(order)}</p>
            <p><span className="text-muted-foreground">Название:</span> {order.title}</p>
            <p><span className="text-muted-foreground">Предмет:</span> {order.subject ?? "—"}</p>
            <p><span className="text-muted-foreground">Тип:</span> {order.work_type ?? "—"}</p>
            <p><span className="text-muted-foreground">Дедлайн:</span> {formatDate(order.deadline)}</p>
            {order.description && (
              <p><span className="text-muted-foreground">Описание:</span> {order.description}</p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground">Файлы</Label>
            {loadingFiles ? (
              <p className="text-sm text-muted-foreground mt-1">Загрузка…</p>
            ) : fileUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-1">Нет файлов</p>
            ) : (
              <ul className="mt-1 space-y-1">
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

          <div className="space-y-2">
            <Label htmlFor="edit-status">Статус</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger id="edit-status" className="rounded-3xl">
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

          <div className="space-y-2">
            <Label htmlFor="edit-price">Цена (₽)</Label>
            <Input
              id="edit-price"
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-3xl"
              placeholder="Не указана"
            />
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-row flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-3xl text-muted-foreground hover:text-destructive w-full sm:w-auto order-last sm:order-none"
            onClick={handleDeleteFromAdmin}
            disabled={saving || cancelling || deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Удалить из списка админки
              </>
            )}
          </Button>
          {order.status !== "cancelled" && (
            <Button
              type="button"
              variant="outline"
              className="rounded-3xl text-destructive hover:text-destructive"
              onClick={handleCancelOrder}
              disabled={saving || cancelling || deleting}
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Отменить заказ"
              )}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || cancelling || deleting}
            className="rounded-3xl"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение…
              </>
            ) : (
              "Сохранить изменения"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
