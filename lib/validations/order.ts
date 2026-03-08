import { z } from "zod";

const workTypes = [
  "Курсовая",
  "Реферат",
  "Диплом",
  "Контрольная",
  "Эссе",
  "Другое",
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
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
export { workTypes };
