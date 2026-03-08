"use client";

import React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  studentUsername: string | null;
  adminOnline: boolean;
  studentOnline: boolean;
  /** When true, the current viewer is the student (show "Вы" for student slot when useful). */
  isCurrentUserStudent?: boolean;
  className?: string;
};

export function ChatHeader({
  studentUsername,
  adminOnline,
  studentOnline,
  isCurrentUserStudent = false,
  className,
}: Props) {
  const studentLabel = studentUsername?.trim() || "Студент";

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
