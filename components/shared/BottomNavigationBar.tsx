"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/feed", icon: LayoutDashboard, label: "Лента" },
  { href: "/search", icon: Search, label: "Поиск" },
  { href: "/orders", icon: ShoppingBag, label: "Заказы" },
  { href: "/profile", icon: User, label: "Профиль" },
];

export function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
      role="navigation"
    >
      {items.map(({ href, icon: Icon, label }) => {
        const isActive = href === "/profile" ? pathname.startsWith("/profile") : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            scroll={false}
            prefetch={true}
            className={cn(
              "flex flex-col items-center gap-1 rounded-3xl px-4 py-2 text-sm transition-colors ",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
