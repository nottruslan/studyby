"use client";

import React from "react";
import Link from "next/link";
import { Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  studentUsername: string | null;
  adminOnline: boolean;
  studentOnline: boolean;
  /** When true, the current viewer is the student (show "Вы" for student slot when useful). */
  isCurrentUserStudent?: boolean;
  /** Telegram-style: single header with back + interlocutor only. */
  fullScreen?: boolean;
  backHref?: string;
  backLabel?: string;
  /** For fullScreen: single name in center (e.g. "Studby" or student name). */
  interlocutorName?: string;
  /** For fullScreen: online status of the interlocutor. */
  interlocutorOnline?: boolean;
  /** For fullScreen: when set, the center name becomes a link to this href (e.g. admin viewing student profile). */
  interlocutorProfileHref?: string;
  className?: string;
};

export function ChatHeader({
  studentUsername,
  adminOnline,
  studentOnline,
  isCurrentUserStudent = false,
  fullScreen = false,
  backHref,
  backLabel,
  interlocutorName,
  interlocutorOnline = false,
  interlocutorProfileHref,
  className,
}: Props) {
  const studentLabel = studentUsername?.trim() || "Студент";

  if (fullScreen && backHref != null) {
    return (
      <div
        className={cn(
          "flex-shrink-0 flex items-center gap-2 border-b border-border bg-muted/30 px-2 py-2 min-h-[3rem]",
          className
        )}
      >
        <Link
          href={backHref}
          prefetch={true}
          className="inline-flex items-center gap-1 shrink-0 rounded-xl px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground -m-1"
        >
          <ChevronLeft className="h-5 w-5" />
          {backLabel ?? "Назад"}
        </Link>
        <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5">
          {interlocutorProfileHref ? (
            <Link
              href={interlocutorProfileHref}
              prefetch={true}
              className="inline-flex items-center gap-1.5 min-w-0 max-w-full rounded-xl px-2 py-1.5 -m-1 text-sm font-medium text-primary hover:bg-accent hover:text-primary/90 active:opacity-80"
              title="Открыть профиль"
            >
              <span className="relative flex shrink-0">
                <Circle
                  className={cn(
                    "h-2.5 w-2.5",
                    interlocutorOnline
                      ? "fill-emerald-500 text-emerald-500"
                      : "fill-muted-foreground/50 text-muted-foreground/50"
                  )}
                  aria-hidden
                />
              </span>
              <span className="truncate text-center">
                {interlocutorName ?? "Студент"}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </Link>
          ) : (
            <>
              <span className="relative flex shrink-0">
                <Circle
                  className={cn(
                    "h-2.5 w-2.5",
                    interlocutorOnline
                      ? "fill-emerald-500 text-emerald-500"
                      : "fill-muted-foreground/50 text-muted-foreground/50"
                  )}
                  aria-hidden
                />
              </span>
              <span className="text-sm font-medium text-foreground truncate text-center">
                {interlocutorName ?? "Чат"}
              </span>
            </>
          )}
        </div>
        <div className="w-[calc(theme(spacing.8)+2rem)] shrink-0" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-shrink-0 flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-3 py-2",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex shrink-0">
          <Circle
            className={cn(
              "h-2.5 w-2.5",
              adminOnline ? "fill-emerald-500 text-emerald-500" : "fill-muted-foreground/50 text-muted-foreground/50"
            )}
            aria-hidden
          />
        </span>
        <span className="text-sm font-medium text-foreground truncate">
          Studby
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {adminOnline ? "онлайн" : "не в сети"}
        </span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex shrink-0">
          <Circle
            className={cn(
              "h-2.5 w-2.5",
              studentOnline ? "fill-emerald-500 text-emerald-500" : "fill-muted-foreground/50 text-muted-foreground/50"
            )}
            aria-hidden
          />
        </span>
        <span className="text-sm font-medium text-foreground truncate">
          {isCurrentUserStudent ? "Вы" : studentLabel}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {studentOnline ? "онлайн" : "не в сети"}
        </span>
      </div>
    </div>
  );
}
