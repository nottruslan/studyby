"use client";

import React from "react";
import Image from "next/image";
import { FileText, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessageItem } from "./types";
import { isOptimisticMessage } from "./types";
import { cn } from "@/lib/utils";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function isImageType(fileType: string | null): boolean {
  return fileType != null && IMAGE_TYPES.includes(fileType);
}

type Props = {
  message: ChatMessageItem;
  isCurrentUser: boolean;
  onRetry?: (tempId: string) => void;
  /** When true, play entrance animation (realtime message). */
  isNewMessage?: boolean;
};

function ChatMessageBubbleComponent({
  message,
  isCurrentUser,
  onRetry,
  isNewMessage = false,
}: Props) {
  const isFailed = isOptimisticMessage(message) && message.sendFailed;
  const showRetry =
    isFailed && onRetry && "tempId" in message && message.tempId;

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 px-2 py-1",
        isCurrentUser ? "items-end" : "items-start",
        isNewMessage &&
          "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-3 py-2 max-w-[85%] flex flex-col gap-1.5",
          isCurrentUser
            ? "bg-indigo-600 text-white rounded-br-sm ml-auto"
            : "bg-slate-800 text-slate-100 rounded-bl-sm mr-auto",
          isOptimisticMessage(message) && !message.sendFailed && "opacity-70"
        )}
      >
        {message.file_url && (
          <div className="rounded-lg overflow-hidden min-w-0">
            {isImageType(message.file_type) ? (
              <div className="relative w-full max-w-[240px] aspect-square">
                <Image
                  src={message.file_url}
                  alt=""
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                  sizes="240px"
                />
              </div>
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                  isCurrentUser
                    ? "text-indigo-100 hover:bg-indigo-500/50"
                    : "text-slate-300 hover:bg-slate-700/50"
                )}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[180px]">
                  {message.file_url.split("/").pop() ?? "Файл"}
                </span>
              </a>
            )}
          </div>
        )}
        {message.content != null && message.content.trim() !== "" && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "text-[10px]",
              isCurrentUser ? "text-indigo-200" : "text-slate-400"
            )}
          >
            {isOptimisticMessage(message) && !message.sendFailed
              ? "Отправка…"
              : new Date(message.created_at).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </span>
          {isFailed && (
            <>
              <AlertCircle className="h-3 w-3 text-red-300 shrink-0" />
              {showRetry && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-[10px] text-red-200 hover:text-white hover:bg-red-500/30"
                  onClick={() => onRetry(message.tempId)}
                >
                  <RotateCcw className="h-3 w-3 mr-0.5" />
                  Повторить
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatMessageBubble = React.memo(ChatMessageBubbleComponent);
