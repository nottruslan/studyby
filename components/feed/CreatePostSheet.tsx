"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createPost } from "@/app/(main)/feed/actions";

export function CreatePostSheet() {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createPost(body);
    if (result.ok) {
      setBody("");
      setOpen(false);
      startTransition(() => router.refresh());
    } else {
      alert(result.error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-3xl px-4 py-2 text-muted-foreground transition-colors touch-manipulation hover:text-foreground active:bg-muted/50"
          aria-label="Новый пост"
        >
          <Plus className="h-6 w-6 shrink-0" />
          <span>Пост</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Новый пост</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Что нового?"
            className="min-h-[120px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={500}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">Прикрепить фото/видео — позже</p>
          <Button type="submit" disabled={isPending || !body.trim()}>
            {isPending ? "Публикуем…" : "Опубликовать"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
