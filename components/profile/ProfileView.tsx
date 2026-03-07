"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditProfileDialog } from "./EditProfileDialog";

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  university: string | null;
  balance: number;
  created_at?: string;
  updated_at?: string;
};

export function ProfileView({ profile }: { profile: Profile }) {
  const shortId = profile.id.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
        <Avatar className="h-20 w-20 rounded-full">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username ?? "Аватар"} />
          <AvatarFallback className="rounded-full bg-primary/20 text-lg">
            {(profile.username ?? "U").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{profile.username ?? "—"}</p>
          <p className="text-sm text-muted-foreground">ID: {shortId}</p>
          <p className="text-sm text-muted-foreground">
            Вуз: {profile.university ?? "—"}
          </p>
          <p className="text-sm font-medium">Баланс: {profile.balance}</p>
        </div>
        <EditProfileDialog profile={profile} />
      </div>
    </div>
  );
}
