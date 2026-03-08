"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "./ProfileView";

export function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [username, setUsername] = useState(profile.username ?? "");
  const [university, setUniversity] = useState(profile.university ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await supabase
        .from("profiles")
        .update({
          username: username || null,
          university: university || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      setSuccess(true);
      router.refresh();
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Avatar className="h-24 w-24 rounded-full border-2 border-border">
          <AvatarImage src={avatarUrl || undefined} alt={username || "Аватар"} />
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
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">Сохранено.</p>
      )}
      <Button
        type="submit"
        className="w-full rounded-3xl"
        disabled={loading}
      >
        {loading ? "Сохранение…" : "Сохранить"}
      </Button>
    </form>
  );
}
