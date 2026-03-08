"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomNavigationBar } from "./BottomNavigationBar";
import { StudlingTabBar } from "./StudlingTabBar";

/** Renders bottom nav: Studling tab bar on /feed, hidden on order chat, else main tab bar. */
export function BottomNavWithChatHide() {
  const pathname = usePathname();
  if (pathname?.match(/^\/orders\/[^/]+\/chat$/)) {
    return null;
  }
  const isStudling = pathname === "/feed" || pathname?.startsWith("/feed/");
  return (
    <div
      className={cn(
        "lg:hidden flex-shrink-0 border-t border-border bg-background",
        isStudling && "relative z-20"
      )}
    >
      {isStudling ? <StudlingTabBar /> : <BottomNavigationBar />}
    </div>
  );
}
