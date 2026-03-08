"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Tab = "code" | "password";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("code");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Ошибка отправки."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (err) throw err;
      window.location.href = "/feed";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (err) throw err;
      window.location.href = "/feed";
    } catch (err: unknown) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Неверный email или пароль."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-semibold">Войти</h1>

        <div className="mb-4 flex gap-2 rounded-3xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("code")}
            className={`flex-1 rounded-3xl py-2 text-sm font-medium transition-colors ${
              tab === "code"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground"
            }`}
          >
            По коду
          </button>
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`flex-1 rounded-3xl py-2 text-sm font-medium transition-colors ${
              tab === "password"
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground"
            }`}
          >
            По паролю
          </button>
        </div>

        {tab === "code" ? (
          !sent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 rounded-3xl"
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-3xl"
                disabled={loading}
              >
                {loading ? "Отправка…" : "Отправить код"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Проверь почту и введи 8-значный код из письма.
              </p>
              <div>
                <Label htmlFor="login-code">Код из письма</Label>
                <Input
                  id="login-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="00000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 rounded-3xl text-center text-lg tracking-widest"
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-3xl"
                disabled={loading || code.length !== 8}
              >
                {loading ? "Проверка…" : "Подтвердить"}
              </Button>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email-pw">Email</Label>
              <Input
                id="login-email-pw"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 rounded-3xl"
              />
            </div>
            <div>
              <Label htmlFor="login-password">Пароль</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 rounded-3xl"
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full rounded-3xl"
              disabled={loading}
            >
              {loading ? "Вход…" : "Войти по паролю"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link
            href="/onboarding"
            className="font-medium text-primary underline underline-offset-4 hover:no-underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
