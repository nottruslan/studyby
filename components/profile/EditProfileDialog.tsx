"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "./ProfileView";

type EditProfileDialogProps = {
  profile: Profile;
  trigger?: React.ReactNode;
};

export function EditProfileDialog({ profile, trigger }: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(profile.username ?? "");
  const [university, setUniversity] = useState(profile.university ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setUsername(profile.username ?? "");
    setUniversity(profile.university ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile.username, profile.university, profile.avatar_url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          username: username || null,
          university: university || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      router.refresh();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const path = `${profile.id}/avatar`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
      setAvatarUrl(publicUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="rounded-3xl">
            Редактировать
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24 rounded-full">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="rounded-full bg-muted text-2xl">
                {(username || "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-3xl"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
            >
              Загрузить аватар
            </Button>
          </div>
          <div>
            <Label htmlFor="edit-username">Имя пользователя</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 rounded-3xl"
            />
          </div>
          <div>
            <Label htmlFor="edit-university">Вуз</Label>
            <Input
              id="edit-university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="mt-2 rounded-3xl"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-3xl"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" className="rounded-3xl" disabled={loading}>
              {loading ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
