"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { orderFormSchema, workTypes, type OrderFormValues } from "@/lib/validations/order";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Предмет и тип" },
  { id: 2, label: "Срок" },
  { id: 3, label: "Описание и файлы" },
];

function getMinDatetimeLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<OrderFormValues>>({
    title: "",
    subject: "",
    work_type: undefined,
    deadline: "",
    description: "",
    files: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormValues, string>>>({});

  const update = useCallback((patch: Partial<OrderFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(patch) as (keyof OrderFormValues)[]) next[k] = undefined;
      return next;
    });
  }, []);

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      const r = orderFormSchema.pick({ title: true, subject: true, work_type: true }).safeParse(form);
      if (!r.success) {
        const flat = r.error.flatten().fieldErrors;
        const e: Partial<Record<keyof OrderFormValues, string>> = {};
        const t = flat?.title?.[0]; if (t) e.title = t;
        const sub = flat?.subject?.[0]; if (sub) e.subject = sub;
        const wt = flat?.work_type?.[0]; if (wt) e.work_type = wt;
        setErrors((prev) => ({ ...prev, ...e }));
        return false;
      }
    }
    if (s === 2) {
      const r = orderFormSchema.pick({ deadline: true }).safeParse(form);
      if (!r.success) {
        const msg = r.error.flatten().fieldErrors?.deadline?.[0] ?? "Укажите срок";
        setErrors((prev) => ({ ...prev, deadline: msg }));
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      toast.error("Заполните поля");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleSubmit = async () => {
    const parsed = orderFormSchema.safeParse({
      ...form,
      deadline: form.deadline || undefined,
      files: form.files ?? [],
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        title: flat.title?.[0],
        subject: flat.subject?.[0],
        work_type: flat.work_type?.[0],
        deadline: flat.deadline?.[0],
        description: flat.description?.[0],
      });
      toast.error("Проверьте поля формы");
      return;
    }
    const data = parsed.data;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Войдите в аккаунт");
        router.push("/onboarding");
        return;
      }
      const { data: order, error: createErr } = await supabase
        .from("orders")
        .insert({
          student_id: user.id,
          title: data.title,
          subject: data.subject,
          work_type: data.work_type,
          deadline: new Date(data.deadline).toISOString(),
          description: data.description || null,
          files: [],
          status: "review",
        })
        .select("id")
        .single();
      if (createErr) throw createErr;
      const orderId = order.id;
      const filePaths: string[] = [];
      if (data.files?.length) {
        for (let i = 0; i < data.files.length; i++) {
          const file = data.files[i];
          const safeName = `${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const path = `${orderId}/${safeName}`;
          const { error: upErr } = await supabase.storage
            .from("order-files")
            .upload(path, file, { upsert: false });
          if (!upErr) filePaths.push(path);
        }
        if (filePaths.length > 0) {
          await supabase
            .from("orders")
            .update({ files: filePaths })
            .eq("id", orderId);
        }
      }
      toast.success("Заказ создан и отправлен на проверку");
      router.push("/orders");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка создания заказа";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const newFiles = Array.from(list);
    setForm((prev) => ({
      ...prev,
      files: [...(prev.files ?? []), ...newFiles],
    }));
  };

  const removeFile = (index: number) => {
    setForm((prev) => ({
      ...prev,
      files: (prev.files ?? []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 rounded-3xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground -m-1"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад
        </Link>
      </div>
      <h2 className="text-xl font-semibold text-foreground">Новый заказ</h2>

      <div className="flex gap-1 p-1 rounded-3xl bg-muted w-fit">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={cn(
              "rounded-3xl px-4 py-2 text-sm font-medium transition-colors",
              step === s.id ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card-style rounded-3xl p-6 space-y-6">
        {step === 1 && (
          <>
            <div>
              <Label htmlFor="title">Название заказа</Label>
              <Input
                id="title"
                value={form.title ?? ""}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Например: Курсовая по матану"
                className="mt-1.5 rounded-3xl"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="subject">Предмет</Label>
              <Input
                id="subject"
                value={form.subject ?? ""}
                onChange={(e) => update({ subject: e.target.value })}
                placeholder="Например: Математический анализ"
                className="mt-1.5 rounded-3xl"
              />
              {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
            </div>
            <div>
              <Label>Тип работы</Label>
              <select
                value={form.work_type ?? ""}
                onChange={(e) => update({ work_type: e.target.value as OrderFormValues["work_type"] })}
                className="mt-1.5 flex h-10 w-full rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Выберите тип</option>
                {workTypes.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              {errors.work_type && <p className="mt-1 text-sm text-red-500">{errors.work_type}</p>}
            </div>
            <Button type="button" className="rounded-3xl" onClick={nextStep}>
              Далее <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <Label htmlFor="deadline">Срок сдачи</Label>
              <Input
                id="deadline"
                type="datetime-local"
                min={getMinDatetimeLocal()}
                value={form.deadline ?? ""}
                onChange={(e) => update({ deadline: e.target.value })}
                className="mt-1.5 rounded-3xl"
              />
              {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-3xl" onClick={() => setStep(1)}>
                Назад
              </Button>
              <Button type="button" className="rounded-3xl" onClick={nextStep}>
                Далее <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <Label htmlFor="description">Описание (необязательно)</Label>
              <textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Дополнительные требования, объём страниц и т.д."
                rows={4}
                className="mt-1.5 flex w-full rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <Label>Файлы (необязательно)</Label>
              <label className="mt-1.5 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/30 py-8 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center">
                  Перетащите файлы сюда или нажмите для выбора
                </span>
              </label>
              {(form.files?.length ?? 0) > 0 && (
                <ul className="mt-2 space-y-1">
                  {(form.files ?? []).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-full"
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
              <Button type="button" variant="outline" className="rounded-3xl" onClick={() => setStep(2)}>
                Назад
              </Button>
              <Button
                type="button"
                className="rounded-3xl"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать заказ"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
