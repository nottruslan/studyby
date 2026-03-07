"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
    text: "Войди по почте — без пароля. Мы отправим тебе ссылку или код.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLastSlide = step === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      setShowLogin(true);
    } else {
      setStep((s) => s + 1);
    }
  };

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
      if (err) {
        console.error("Supabase signInWithOtp:", err);
        throw err;
      }
      setSent(true);
    } catch (err: unknown) {
      console.error("Send OTP error:", err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Ошибка отправки. Проверь .env (NEXT_PUBLIC_SUPABASE_URL и ANON_KEY).";
      setError(message);
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
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {!showLogin ? (
          <motion.div
            key="slider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md text-center"
          >
            <p className="mb-6 text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                Войти
              </Link>
            </p>
            <div className="mb-8 overflow-hidden">
              <motion.div
                animate={{ x: `-${step * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex"
              >
                {SLIDES.map((slide, i) => (
                  <div
                    key={i}
                    className="min-w-full shrink-0 px-2"
                  >
                    <h2 className="mb-4 text-2xl font-bold">{slide.title}</h2>
                    <p className="text-muted-foreground">{slide.text}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="mb-4 flex justify-center gap-1">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Слайд ${i + 1}`}
                  className={`h-2 w-2 rounded-full transition-colors active:scale-95 ${
                    i === step ? "bg-primary" : "bg-muted"
                  }`}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>

            <Button
              className="w-full rounded-3xl"
              onClick={handleNext}
              size="lg"
            >
              {isLastSlide ? "Начать" : "Далее"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <h2 className="mb-6 text-center text-xl font-semibold">
              Вход по почте
            </h2>

            {!sent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2"
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
                  {loading ? "Отправка…" : "Отправить ссылку или код"}
                </Button>
              </form>
            ) : (
              <>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Проверь почту. Перейди по ссылке или введи 6-значный код ниже.
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Код из письма</Label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="mt-2 text-center text-lg tracking-widest"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full rounded-3xl"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? "Проверка…" : "Подтвердить"}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
