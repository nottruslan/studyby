"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const SLIDES = [
  {
    title: "Добро пожаловать в Studby",
    text: "Твоё пространство для учёбы и общения с однокурсниками.",
  },
  {
    title: "Студ-Твиттер",
    text: "Публикуй посты, делитесь мыслями и следи за лентой сокурсников.",
  },
  {
    title: "База шпор",
    text: "Полезные материалы и шпаргалки в одном месте.",
  },
  {
    title: "Биржа заказов",
    text: "Заказывай работы у проверенных исполнителей или зарабатывай сам.",
  },
  {
    title: "Начни прямо сейчас",
    text: "Войди или зарегистрируйся справа — без пароля.",
  },
];

type AuthTab = "login" | "register";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<AuthTab>("register");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFormState = () => setError(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
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
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Ошибка отправки.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Левая колонка — слайды */}
      <section className="flex-1 flex flex-col justify-center px-6 py-10 lg:py-16 lg:pl-16 lg:pr-12 border-b lg:border-b-0 lg:border-r border-border/50">
        <div className="w-full max-w-md mx-auto lg:max-w-lg">
          <div className="overflow-hidden min-w-full">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              {SLIDES[step].title}
            </h2>
            <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
              {SLIDES[step].text}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-8">
            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Слайд ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === step
                      ? "bg-primary w-6"
                      : "bg-muted w-2 hover:bg-muted-foreground/30"
                  }`}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Назад
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-full"
                onClick={() => setStep((s) => Math.min(SLIDES.length - 1, s + 1))}
                disabled={step === SLIDES.length - 1}
              >
                Далее
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Правая колонка — вход и регистрация */}
      <section className="flex-1 flex flex-col justify-center px-6 py-10 lg:py-16 lg:pr-16 lg:pl-12 bg-muted/30">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex gap-1 p-1 rounded-3xl bg-muted mb-6">
            <button
              type="button"
              onClick={() => {
                setTab("register");
                resetFormState();
              }}
              className={`flex-1 py-2.5 rounded-3xl text-sm font-medium transition-colors ${
                tab === "register"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Регистрация
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("login");
                resetFormState();
              }}
              className={`flex-1 py-2.5 rounded-3xl text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Вход
            </button>
          </div>

          {!sent ? (
            <form
              onSubmit={tab === "register" ? handleRegisterSubmit : handleLoginSubmit}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5 rounded-3xl"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-3xl"
                disabled={loading}
              >
                {loading
                  ? "Отправка…"
                  : tab === "register"
                    ? "Зарегистрироваться"
                    : "Отправить код"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Проверь почту. Введи 8-значный код из письма.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <Label htmlFor="auth-code">Код</Label>
                  <Input
                    id="auth-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="00000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 text-center text-lg tracking-widest rounded-3xl"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-3xl"
                  disabled={loading || code.length !== 8}
                >
                  {loading ? "Проверка…" : "Подтвердить"}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setError(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Ввести другой email
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {tab === "register" ? (
              <>
                Уже есть аккаунт?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                >
                  Войдите
                </button>
              </>
            ) : (
              <>
                Нет аккаунта?{" "}
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                >
                  Зарегистрируйтесь
                </button>
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
