"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { adminNavItems } from "./AdminSidebar";

export function AdminHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="hidden lg:flex sticky top-0 z-40 h-14 items-center justify-between border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))] lg:px-6">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col gap-4 pt-6">
              <span className="text-lg font-semibold">Studby Admin</span>
              <nav className="flex flex-col gap-0.5">
                {adminNavItems.map(({ href, icon: Icon, label }) => {
                  const isActive =
                    href === "/feed"
                      ? pathname === "/feed"
                      : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-lg font-semibold text-foreground lg:hidden">
          Admin
        </span>
      </div>
    </header>
  );
}
