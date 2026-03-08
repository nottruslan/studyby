"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  orderFormSchema,
  workTypes,
  isTextWork,
  isTechWork,
  plagiarismSystems,
  type OrderFormValues,
} from "@/lib/validations/order";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Предмет и тип" },
  { id: 2, label: "Детали и Срок" },
  { id: 3, label: "Описание и файлы" },
];

function getMinDatetimeLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function NewOrderPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema) as Resolver<OrderFormValues>,
    defaultValues: {
      title: "",
      subject: "",
      work_type: undefined as OrderFormValues["work_type"] | undefined,
      deadline: "",
      description: "",
      files: [],
      originality: undefined,
      plagiarism_system: "",
      volume: "",
      university: "",
      professor: "",
    },
    mode: "onChange",
  });

  const { register, watch, setValue, trigger, formState: { errors } } = form;

  const selectedWorkType = watch("work_type");
  const files = watch("files") ?? [];

  const validateStep = async (s: number): Promise<boolean> => {
    if (s === 1) {
      const ok = await trigger(["title", "subject", "work_type"]);
      if (!ok) toast.error("Заполните поля");
      return ok;
    }
    if (s === 2) {
      const ok = await trigger(["deadline"]);
      if (!ok) toast.error("Укажите срок сдачи");
      return ok;
    }
    return true;
  };

  const nextStep = async () => {
    const ok = await validateStep(step);
    if (!ok) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const onSubmit = async (data: OrderFormValues) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
          originality: data.originality ?? null,
          plagiarism_system: data.plagiarism_system || null,
          volume: data.volume || null,
          university: data.university || null,
          professor: data.professor || null,
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
      startTransition(() => {
        router.push("/orders");
        router.refresh();
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Ошибка создания заказа";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const newFiles = Array.from(list);
    setValue("files", [...files, ...newFiles], { shouldValidate: true });
  };

  const removeFile = (index: number) => {
    setValue(
      "files",
      files.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
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
              step === s.id
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card-style rounded-3xl p-6 space-y-6 border border-slate-200 dark:border-slate-800">
        {step === 1 && (
          <>
            <div>
              <Label htmlFor="title">Название заказа</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Например: Курсовая по матану"
                className="mt-1.5 rounded-3xl"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="subject">Предмет</Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="Например: Математический анализ"
                className="mt-1.5 rounded-3xl"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.subject.message}
                </p>
              )}
            </div>
            <div>
              <Label>Тип работы</Label>
              <select
                className="mt-1.5 flex h-10 w-full rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedWorkType ?? ""}
                onChange={(e) =>
                  setValue("work_type", e.target.value as OrderFormValues["work_type"], {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Выберите тип</option>
                {workTypes.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {errors.work_type && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.work_type.message}
                </p>
              )}
            </div>
            <Button type="button" className="rounded-3xl" onClick={nextStep}>
              Далее <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <AnimatePresence mode="wait">
              {selectedWorkType && isTextWork(selectedWorkType) && (
                <motion.div
                  key="text-works"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <Label htmlFor="originality">
                      Требуемая оригинальность (%)
                    </Label>
                    <Input
                      id="originality"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0–100"
                      className="mt-1.5 rounded-3xl"
                      {...register("originality", {
                        setValueAs: (v) =>
                          v === "" || v == null
                            ? undefined
                            : Number.isNaN(Number(v))
                              ? undefined
                              : Number(v),
                      })}
                    />
                    {errors.originality && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.originality.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Система проверки</Label>
                    <Select
                      value={watch("plagiarism_system") || ""}
                      onValueChange={(v) => setValue("plagiarism_system", v)}
                    >
                      <SelectTrigger className="mt-1.5 rounded-3xl">
                        <SelectValue placeholder="Выберите систему" />
                      </SelectTrigger>
                      <SelectContent>
                        {plagiarismSystems.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="volume">Объём страниц</Label>
                    <Input
                      id="volume"
                      {...register("volume")}
                      placeholder="25–30"
                      className="mt-1.5 rounded-3xl"
                    />
                    {errors.volume && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.volume.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
              {selectedWorkType && isTechWork(selectedWorkType) && (
                <motion.div
                  key="tech-works"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div>
                    <Label htmlFor="volume-tech">
                      Объём работы / Вариант
                    </Label>
                    <Input
                      id="volume-tech"
                      {...register("volume")}
                      placeholder="5 задач, 3 вариант"
                      className="mt-1.5 rounded-3xl"
                    />
                    {errors.volume && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.volume.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="deadline">Срок сдачи</Label>
              <Input
                id="deadline"
                type="datetime-local"
                min={getMinDatetimeLocal()}
                className="mt-1.5 rounded-3xl"
                {...register("deadline")}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.deadline.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-3xl"
                onClick={() => setStep(1)}
              >
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
                {...register("description")}
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
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
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

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="extra" className="border-none">
                <AccordionTrigger className="rounded-3xl py-2 text-left">
                  Дополнительные требования (для точной оценки)
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label htmlFor="university">
                      Ваш ВУЗ (аббревиатура){" "}
                      <span className="text-muted-foreground font-normal">
                        (необязательно)
                      </span>
                    </Label>
                    <Input
                      id="university"
                      {...register("university")}
                      placeholder="Например: МГУ, СПбГУ"
                      className="mt-1.5 rounded-3xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="professor">
                      ФИО преподавателя{" "}
                      <span className="text-muted-foreground font-normal">
                        (необязательно)
                      </span>
                    </Label>
                    <Input
                      id="professor"
                      {...register("professor")}
                      placeholder="Иванов И. И."
                      className="mt-1.5 rounded-3xl"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-3xl"
                onClick={() => setStep(2)}
              >
                Назад
              </Button>
              <Button
                type="button"
                className="rounded-3xl"
                disabled={loading || isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                {loading || isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Создать заказ"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
