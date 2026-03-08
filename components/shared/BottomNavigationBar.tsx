"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav-items";

export function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav
      className="app-bottom-nav fixed left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background py-2 bottom-0"
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
