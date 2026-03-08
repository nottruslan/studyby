"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardList, LayoutDashboard } from "lucide-react";

const adminNavItems = [
  { href: "/admin/orders", icon: ClipboardList, label: "Заказы" },
  { href: "/feed", icon: LayoutDashboard, label: "В Studby" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card lg:z-30">
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <Link href="/admin/orders" prefetch={true} className="text-lg font-semibold text-foreground">
          Studby Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3" role="navigation">
        {adminNavItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/feed"
              ? pathname === "/feed"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { adminNavItems };
