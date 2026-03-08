"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

type ProfileMenuProps = {
  username: string | null;
  avatarUrl: string | null;
};

export function ProfileMenu({ username, avatarUrl }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={avatarUrl ?? undefined} alt={username ?? "Аватар"} />
          <AvatarFallback className="text-xs">
            {(username ?? "U").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{username ?? "—"}</p>
          </div>
          <Link
            href="/profile"
            className="block px-3 py-2 text-sm text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Профиль
          </Link>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
