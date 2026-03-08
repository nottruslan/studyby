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
  /** Скрыт из списка студента (мягкое удаление студентом) */
  deleted_by_student?: boolean;
  /** Скрыт из списка админки (мягкое удаление админом) */
  deleted_by_admin?: boolean;
};

/** Order with joined profile for admin list */
export type OrderWithStudent = Order & {
  profiles?: { username: string | null; email: string | null } | null;
};
