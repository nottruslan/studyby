"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/lib/types/order";
import { workTypes } from "@/lib/validations/order";
import { updateOrderByStudent } from "../actions";

type Props = { order: Order; deadlineLocal: string };

export function EditOrderForm({ order, deadlineLocal }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(order.title);
  const [subject, setSubject] = useState(order.subject ?? "");
  const [work_type, setWorkType] = useState(order.work_type ?? "");
  const [deadline, setDeadline] = useState(deadlineLocal);
  const [description, setDescription] = useState(order.description ?? "");
  const [originality, setOriginality] = useState<string>(
    order.originality != null ? String(order.originality) : ""
  );
  const [plagiarismSystem, setPlagiarismSystem] = useState(
    order.plagiarism_system ?? ""
  );
  const [volume, setVolume] = useState(order.volume ?? "");
  const [university, setUniversity] = useState(order.university ?? "");
  const [professor, setProfessor] = useState(order.professor ?? "");
  const [keepFilePaths, setKeepFilePaths] = useState<string[]>(
    order.files ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const removeExisting = (path: string) => {
    setKeepFilePaths((prev) => prev.filter((p) => p !== path));
  };

  const addNewFiles = (list: FileList | null) => {
    if (!list?.length) return;
    setNewFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !work_type || !deadline) {
      toast.error("Заполните обязательные поля");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("subject", subject.trim());
    formData.set("work_type", work_type);
    formData.set("deadline", deadline);
    formData.set("description", description.trim());
    formData.set("originality", originality.trim());
    formData.set("plagiarism_system", plagiarismSystem.trim());
    formData.set("volume", volume.trim());
    formData.set("university", university.trim());
    formData.set("professor", professor.trim());
    formData.set("keepFilePaths", JSON.stringify(keepFilePaths));
    newFiles.forEach((f) => formData.append("newFiles", f));

    const result = await updateOrderByStudent(order.id, formData);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Заказ обновлён");
    router.push(`/orders/${order.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card-style rounded-3xl p-6 space-y-6">
      <div>
        <Label htmlFor="edit-title">Название заказа</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Курсовая по матану"
          className="mt-1.5 rounded-3xl"
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-subject">Предмет</Label>
        <Input
          id="edit-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Например: Математический анализ"
          className="mt-1.5 rounded-3xl"
          required
        />
      </div>
      <div>
        <Label>Тип работы</Label>
        <select
          value={work_type}
          onChange={(e) => setWorkType(e.target.value)}
          className="mt-1.5 flex h-10 w-full rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="">Выберите тип</option>
          {workTypes.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="edit-deadline">Срок сдачи</Label>
        <Input
          id="edit-deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1.5 rounded-3xl"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="edit-originality">Оригинальность (%) (необязательно)</Label>
          <Input
            id="edit-originality"
            type="number"
            min={0}
            max={100}
            value={originality}
            onChange={(e) => setOriginality(e.target.value)}
            className="mt-1.5 rounded-3xl"
          />
        </div>
        <div>
          <Label htmlFor="edit-volume">Объём / вариант (необязательно)</Label>
          <Input
            id="edit-volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="mt-1.5 rounded-3xl"
            placeholder="25–30 или 5 задач"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="edit-plagiarism">Система проверки (необязательно)</Label>
        <Input
          id="edit-plagiarism"
          value={plagiarismSystem}
          onChange={(e) => setPlagiarismSystem(e.target.value)}
          className="mt-1.5 rounded-3xl"
          placeholder="Антиплагиат.ВУЗ и т.д."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="edit-university">ВУЗ (необязательно)</Label>
          <Input
            id="edit-university"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="mt-1.5 rounded-3xl"
            placeholder="МГУ, СПбГУ"
          />
        </div>
        <div>
          <Label htmlFor="edit-professor">Преподаватель (необязательно)</Label>
          <Input
            id="edit-professor"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            className="mt-1.5 rounded-3xl"
            placeholder="Иванов И. И."
          />
        </div>
      </div>
      <div>
        <Label htmlFor="edit-description">Описание (необязательно)</Label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Дополнительные требования"
          rows={4}
          className="mt-1.5 flex w-full rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div>
        <Label>Файлы</Label>
        {keepFilePaths.length > 0 && (
          <ul className="mt-2 space-y-1">
            {keepFilePaths.map((path) => (
              <li key={path} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{path.split("/").pop() ?? path}</span>
                <button
                  type="button"
                  onClick={() => removeExisting(path)}
                  className="text-muted-foreground hover:text-destructive p-2 rounded-full"
                  aria-label="Удалить из заказа"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Label className="mt-2 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/30 py-6 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addNewFiles(e.target.files)}
          />
          <Upload className="h-8 w-8 text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground text-center">
            Добавить файлы
          </span>
        </Label>
        {newFiles.length > 0 && (
          <ul className="mt-2 space-y-1">
            {newFiles.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="text-muted-foreground hover:text-destructive p-2 rounded-full"
                  aria-label="Удалить"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="rounded-3xl" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Сохранить"
          )}
        </Button>
        <Link
          href={`/orders/${order.id}`}
          className={buttonVariants({ variant: "outline", className: "rounded-3xl" })}
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
