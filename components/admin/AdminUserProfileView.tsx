"use client";

import { AvatarImageOptimized } from "@/components/ui/avatar-image-optimized";

export type AdminUserProfile = {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  university: string | null;
  balance: number;
  role?: string | null;
};

/** Read-only profile view for admin (e.g. student from chat). */
export function AdminUserProfileView({ profile }: { profile: AdminUserProfile }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center pt-2 pb-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-3xl text-primary">
            {(profile.username ?? profile.email ?? "U").slice(0, 1).toUpperCase()}
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
        {profile.email && (
          <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Вуз: {profile.university ?? "—"} · Баланс: {profile.balance}
        </p>
        {profile.role != null && profile.role !== "" && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Роль: {profile.role === "admin" ? "Админ" : "Студент"}
          </p>
        )}
      </div>
    </div>
  );
}
