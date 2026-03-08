"use client";

import { useTransition } from "react";
import { AvatarImageOptimized } from "@/components/ui/avatar-image-optimized";
import { User, Lock, ChevronRight, LogOut, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  university: string | null;
  balance: number;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
};

const rowClass =
  "flex w-full items-center gap-3 px-4 py-3 text-left bg-transparent border-0 rounded-none text-foreground hover:bg-muted/50 transition-colors";

export function ProfileView({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    startTransition(() => {
      router.push("/onboarding");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Верхний блок: аватар и имя, как в Telegram */}
      <div className="flex flex-col items-center pt-2 pb-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-3xl text-primary">
            {(profile.username ?? "U").slice(0, 1).toUpperCase()}
          </div>
          {profile.avatar_url && (
            <AvatarImageOptimized
              src={profile.avatar_url}
              alt={profile.username ?? "Аватар"}
              size={96}
              priority
              className="absolute inset-0 h-full w-full rounded-full"
            />
          )}
        </div>
        <p className="mt-3 text-xl font-semibold">{profile.username ?? "—"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Вуз: {profile.university ?? "—"} · Баланс: {profile.balance}
        </p>
      </div>

      {/* Карточка пунктов, как в Telegram */}
      <div className="overflow-hidden rounded-2xl bg-card border border-border">
        <Link
          href="/profile/edit"
          prefetch={true}
          className={rowClass}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <User className="h-5 w-5" />
          </div>
          <span className="flex-1 font-medium">Редактировать профиль</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </Link>
        <Link
          href="/profile/confidentiality"
          prefetch={true}
          className={`${rowClass} border-t border-border`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <span className="flex-1 font-medium">Конфиденциальность</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </Link>
        {profile.role === "admin" && (
          <Link
            href="/admin/orders"
            prefetch={true}
            className={`${rowClass} border-t border-border`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="flex-1 font-medium">Админка</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className={`${rowClass} border-t border-border text-destructive hover:bg-destructive/10 disabled:opacity-70`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          </div>
          <span className="flex-1 font-medium">Выйти из аккаунта</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </button>
      </div>
    </div>
  );
}
