"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function PasswordSection() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setError("Пароли не совпадают.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setSuccess(true);
      setNewPassword("");
      setRepeatPassword("");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Не удалось сохранить пароль."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <h3 className="mb-3 font-medium">Пароль</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Установите пароль, чтобы входить с другого устройства по email и паролю.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="new-password">Новый пароль</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            className="mt-2 rounded-3xl"
          />
        </div>
        <div>
          <Label htmlFor="repeat-password">Повторите пароль</Label>
          <Input
            id="repeat-password"
            type="password"
            placeholder="••••••••"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            minLength={6}
            className="mt-2 rounded-3xl"
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Пароль сохранён.
          </p>
        )}
        <Button
          type="submit"
          className="rounded-3xl"
          disabled={loading}
        >
          {loading ? "Сохранение…" : "Сохранить пароль"}
        </Button>
      </form>
    </div>
  );
}
