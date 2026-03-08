import { z } from "zod";

const TEXT_WORKS = [
  "Дипломная",
  "Курсовая",
  "Реферат",
  "Эссе",
  "Магистерская",
  "Отчет по практике",
] as const;

const TECH_WORKS = [
  "Решение задач",
  "Чертеж",
  "Ответы на билеты",
  "Перевод",
] as const;

const workTypes = [
  ...TEXT_WORKS,
  ...TECH_WORKS,
  "Контрольная",
  "Другое",
] as const;

const plagiarismSystems = [
  "Антиплагиат.ВУЗ",
  "StrikePlagiarism",
  "Руконтекст",
  "ETXT",
  "Неважно",
] as const;

export const orderFormSchema = z.object({
  title: z.string().min(1, "Введите название заказа").max(200),
  subject: z.string().min(1, "Укажите предмет").max(100),
  work_type: z.enum(workTypes, { message: "Выберите тип работы" }),
  deadline: z.string().min(1, "Укажите срок").refine(
    (s) => new Date(s) > new Date(),
    "Срок должен быть в будущем"
  ),
  description: z.string().max(2000).optional(),
  files: z.array(z.instanceof(File)).optional().default([]),
  // Optional: text works (step 2)
  originality: z.number().min(0).max(100).optional(),
  plagiarism_system: z.string().max(100).optional(),
  volume: z.string().max(50).optional(),
  // Optional: step 3 accordion
  university: z.string().max(100).optional(),
  professor: z.string().max(200).optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export function isTextWork(workType: string): boolean {
  return (TEXT_WORKS as readonly string[]).includes(workType);
}

export function isTechWork(workType: string): boolean {
  return (TECH_WORKS as readonly string[]).includes(workType);
}

export {
  workTypes,
  TEXT_WORKS,
  TECH_WORKS,
  plagiarismSystems,
};
