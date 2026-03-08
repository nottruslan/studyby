"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav-items";

export function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav
      className="app-bottom-nav flex items-center justify-around border-t border-border bg-background py-2"
      role="navigation"
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = href === "/profile" ? pathname.startsWith("/profile") : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            scroll={false}
            prefetch={true}
            className={cn(
              "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-3xl px-4 py-2 text-sm transition-colors touch-manipulation",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground active:bg-muted/50"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-6 w-6 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
