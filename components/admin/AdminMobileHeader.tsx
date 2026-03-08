"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function AdminMobileHeader() {
  const pathname = usePathname();
  const isOrdersSubpage =
    pathname?.match(/^\/admin\/orders\/[^/]+/) ?? false;
  const isUsersSubpage =
    pathname?.match(/^\/admin\/users\/[^/]+/) ?? false;
  const isSubpage = isOrdersSubpage || isUsersSubpage;

  const backHref = isSubpage ? "/admin/orders" : "/profile";
  const backLabel = isSubpage ? "К заказам" : "Назад";

  const title = isUsersSubpage
    ? "Профиль"
    : isOrdersSubpage && pathname?.includes("/edit")
      ? "Редактирование"
      : isOrdersSubpage && pathname?.includes("/chat")
        ? "Чат"
        : "Заказы";

  return (
    <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))]">
      <Link
        href={backHref}
        className="flex items-center gap-1 rounded-3xl p-1 -m-1 text-sm text-muted-foreground hover:text-foreground shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
        {backLabel}
      </Link>
      <h1 className="absolute left-0 right-0 text-center text-xl font-semibold text-foreground pointer-events-none">
        {title}
      </h1>
    </div>
  );
}
