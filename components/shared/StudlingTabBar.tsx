"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePostSheet } from "@/components/feed/CreatePostSheet";

/** 3D-style tilted "S" for Studling — return to main app (shows main tab bar). */
function StudlingSIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center text-xl font-bold text-foreground",
        "select-none [-webkit-text-stroke:1px_hsl(var(--border))]",
        className
      )}
      style={{ transform: "rotate(-12deg) skewX(-8deg)" }}
      aria-hidden
    >
      S
    </span>
  );
}

/** Tab bar shown in Studling (feed): House = profile, S = back to main menu. */
export function StudlingTabBar() {
  const pathname = usePathname();
  const isProfile = pathname?.startsWith("/feed/profile");

  return (
    <nav
      className="app-bottom-nav flex items-center justify-around border-t border-border bg-background/95 px-4 py-2 backdrop-blur-sm"
      role="navigation"
    >
      <Link
        href="/feed/profile"
        scroll={false}
        prefetch={true}
        className={cn(
          "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-3xl px-4 py-2 text-sm transition-colors touch-manipulation",
          isProfile ? "text-primary" : "text-muted-foreground hover:text-foreground active:bg-muted/50"
        )}
        aria-current={isProfile ? "page" : undefined}
        aria-label="Профиль Studling"
      >
        <Home className="h-6 w-6 shrink-0" />
        <span>Профиль</span>
      </Link>
      <CreatePostSheet />
      <Link
        href="/orders"
        scroll={false}
        prefetch={true}
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-3xl px-4 py-2 text-sm text-muted-foreground transition-colors touch-manipulation hover:text-foreground active:bg-muted/50"
        aria-label="Вернуться в меню"
      >
        <span className="flex h-6 w-6 items-center justify-center">
          <StudlingSIcon className="text-lg" />
        </span>
        <span>В меню</span>
      </Link>
    </nav>
  );
}
