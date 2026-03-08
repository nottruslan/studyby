"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, ExternalLink, Trash2, EyeOff, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderWithStudent, OrderStatus } from "@/lib/types/order";
import { updateOrderAdmin, getOrderFileUrls, deleteOrderByAdmin } from "../../actions";

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

type Props = { order: OrderWithStudent };

export function AdminOrderEditForm({ order }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [price, setPrice] = useState<string>(
    order.price != null ? String(order.price) : ""
  );
  const [originality, setOriginality] = useState<string>(
    order.originality != null ? String(order.originality) : ""
  );
  const [plagiarismSystem, setPlagiarismSystem] = useState<string>(
    order.plagiarism_system ?? ""
  );
  const [volume, setVolume] = useState<string>(order.volume ?? "");
  const [university, setUniversity] = useState<string>(order.university ?? "");
  const [professor, setProfessor] = useState<string>(order.professor ?? "");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fileUrls, setFileUrls] = useState<{ path: string; url: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    setStatus(order.status);
    setPrice(order.price != null ? String(order.price) : "");
    setOriginality(order.originality != null ? String(order.originality) : "");
    setPlagiarismSystem(order.plagiarism_system ?? "");
    setVolume(order.volume ?? "");
    setUniversity(order.university ?? "");
    setProfessor(order.professor ?? "");
  }, [order]);

  useEffect(() => {
    getOrderFileUrls(order.id)
      .then(setFileUrls)
      .finally(() => setLoadingFiles(false));
  }, [order.id]);

  const handleSave = async () => {
    setSaving(true);
    const priceNum = price.trim() === "" ? null : Number(price.trim());
    if (price.trim() !== "" && (Number.isNaN(priceNum) || (priceNum ?? 0) < 0)) {
      toast.error("Введите корректную цену");
      setSaving(false);
      return;
    }
    const originalityNum =
      originality.trim() === ""
        ? null
        : Number(originality.trim());
    const hasValidOriginality =
      originality.trim() === "" ||
      (!Number.isNaN(originalityNum) &&
        originalityNum != null &&
        originalityNum >= 0 &&
        originalityNum <= 100);
    if (!hasValidOriginality) {
      toast.error("Оригинальность: введите число от 0 до 100 или оставьте пустым");
      setSaving(false);
      return;
    }
    const result = await updateOrderAdmin(order.id, {
      status,
      price: priceNum,
      originality: originality.trim() === "" ? null : originalityNum ?? null,
      plagiarism_system: plagiarismSystem.trim() || null,
      volume: volume.trim() || null,
      university: university.trim() || null,
      professor: professor.trim() || null,
    });
    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Изменения сохранены");
    router.push("/admin/orders");
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
    router.push("/admin/orders");
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
    router.push("/admin/orders");
    router.refresh();
  };

  const busy = saving || cancelling || deleting;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/orders"
          prefetch={true}
          className="flex items-center gap-1 rounded-3xl p-1 -m-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад к заказам
        </Link>
        <Link
          href={`/admin/orders/${order.id}/chat`}
          prefetch={true}
          className={buttonVariants({ variant: "outline", size: "sm", className: "rounded-3xl" })}
        >
          <MessageCircle className="h-4 w-4 mr-1.5" />
          Чат
        </Link>
      </div>

      {order.deleted_by_student && (
        <div
          className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
          role="status"
        >
          <EyeOff className="h-4 w-4 shrink-0" />
          <span>Студент удалил этот заказ из своего списка</span>
        </div>
      )}

      <h2 className="text-xl font-semibold text-foreground">Редактирование заказа</h2>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
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
          {(order.originality != null || order.plagiarism_system || order.volume) && (
            <>
              {order.originality != null && (
                <p><span className="text-muted-foreground">Оригинальность:</span> {order.originality}%</p>
              )}
              {order.plagiarism_system && (
                <p><span className="text-muted-foreground">Система проверки:</span> {order.plagiarism_system}</p>
              )}
              {order.volume && (
                <p><span className="text-muted-foreground">Объём:</span> {order.volume}</p>
              )}
            </>
          )}
          {(order.university || order.professor) && (
            <>
              {order.university && (
                <p><span className="text-muted-foreground">ВУЗ:</span> {order.university}</p>
              )}
              {order.professor && (
                <p><span className="text-muted-foreground">Преподаватель:</span> {order.professor}</p>
              )}
            </>
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

        <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="edit-originality">Оригинальность (%)</Label>
            <Input
              id="edit-originality"
              type="number"
              min={0}
              max={100}
              value={originality}
              onChange={(e) => setOriginality(e.target.value)}
              className="rounded-3xl"
              placeholder="—"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-volume">Объём / вариант</Label>
            <Input
              id="edit-volume"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="rounded-3xl"
              placeholder="—"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-plagiarism">Система проверки</Label>
            <Input
              id="edit-plagiarism"
              value={plagiarismSystem}
              onChange={(e) => setPlagiarismSystem(e.target.value)}
              className="rounded-3xl"
              placeholder="—"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-university">ВУЗ</Label>
            <Input
              id="edit-university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="rounded-3xl"
              placeholder="—"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-professor">Преподаватель</Label>
            <Input
              id="edit-professor"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              className="rounded-3xl"
              placeholder="—"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={busy}
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
          {order.status !== "cancelled" && (
            <Button
              type="button"
              variant="outline"
              className="rounded-3xl text-destructive hover:text-destructive"
              onClick={handleCancelOrder}
              disabled={busy}
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Отменить заказ"
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-3xl text-muted-foreground hover:text-destructive"
            onClick={handleDeleteFromAdmin}
            disabled={busy}
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
        </div>
      </div>
    </div>
  );
}
