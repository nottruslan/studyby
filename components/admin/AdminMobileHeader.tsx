"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function AdminMobileHeader() {
  const pathname = usePathname();
  const isEditPage = pathname?.includes("/admin/orders/") && pathname?.includes("/edit");

  return (
    <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))]">
      <Link
        href={isEditPage ? "/admin/orders" : "/profile"}
        className="flex items-center gap-1 rounded-3xl p-1 -m-1 text-sm text-muted-foreground hover:text-foreground shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
        Назад
      </Link>
      <h1 className="absolute left-0 right-0 text-center text-xl font-semibold text-foreground pointer-events-none">
        {isEditPage ? "Редактирование" : "Заказы"}
      </h1>
    </div>
  );
}
