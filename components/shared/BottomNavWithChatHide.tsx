"use client";

import { usePathname } from "next/navigation";
import { BottomNavigationBar } from "./BottomNavigationBar";

/** Renders bottom nav only when not on order chat route (so chat view has no tab bar). */
export function BottomNavWithChatHide() {
  const pathname = usePathname();
  if (pathname?.match(/^\/orders\/[^/]+\/chat$/)) {
    return null;
  }
  return (
    <div className="lg:hidden flex-shrink-0 border-t border-border bg-background">
      <BottomNavigationBar />
    </div>
  );
}
