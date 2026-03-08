import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-foreground">Доступ запрещён</h1>
      <p className="text-center text-muted-foreground">
        У вас нет прав для просмотра этой страницы.
      </p>
      <Link href="/feed" className={buttonVariants({ className: "rounded-3xl" })}>
        На главную
      </Link>
    </div>
  );
}
