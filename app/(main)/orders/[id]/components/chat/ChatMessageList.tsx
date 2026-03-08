"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ChatMessageBubble } from "./ChatMessageBubble";
import type { ChatMessageItem } from "./types";
import { isOptimisticMessage } from "./types";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 80;

type Props = {
  messages: ChatMessageItem[];
  currentUserId: string;
  isLoadingOlder?: boolean;
  hasOlder?: boolean;
  onLoadOlder?: () => void;
  onRetry?: (tempId: string) => void;
  /** After initial load or after user sent a message: list will scroll to bottom when this ref is true. */
  shouldScrollToBottomRef: React.MutableRefObject<boolean>;
  /** When user scrolls, list updates this so parent knows if user is at bottom (for realtime scroll). */
  setScrollToBottomOnNextMessage: (v: boolean) => void;
  scrollToBottomOnNextMessageRef: React.MutableRefObject<boolean>;
  /** Optional class for the scroll container. */
  className?: string;
  /** Ids of messages that just arrived (realtime) for entrance animation. */
  newMessageIds?: Set<string>;
};

export function ChatMessageList({
  messages,
  currentUserId,
  isLoadingOlder,
  hasOlder,
  onLoadOlder,
  onRetry,
  shouldScrollToBottomRef,
  setScrollToBottomOnNextMessage,
  scrollToBottomOnNextMessageRef,
  className,
  newMessageIds,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottomImpl = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      shouldScrollToBottomRef.current = false;
      scrollToBottomImpl();
    }
  }, [messages.length, shouldScrollToBottomRef, scrollToBottomImpl]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    const nearBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
    setScrollToBottomOnNextMessage(nearBottom);
  }, [setScrollToBottomOnNextMessage]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (scrollToBottomOnNextMessageRef.current) {
      scrollToBottomOnNextMessageRef.current = false;
      scrollToBottomImpl();
    }
  }, [messages.length, scrollToBottomOnNextMessageRef, scrollToBottomImpl]);

  return (
    <div
      ref={listRef}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto chat-message-list-scroll",
        className
      )}
      style={{ overscrollBehaviorY: "none" }}
      onScroll={handleScroll}
    >
      {hasOlder && (
        <div className="flex justify-center py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoadingOlder}
            onClick={onLoadOlder}
            className="rounded-3xl text-muted-foreground"
          >
            {isLoadingOlder ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Загрузить ранее"
            )}
          </Button>
        </div>
      )}
      <div className="flex flex-col py-2">
        {messages.map((msg) => (
          <ChatMessageBubble
            key={isOptimisticMessage(msg) ? msg.tempId : msg.id}
            message={msg}
            isCurrentUser={msg.sender_id === currentUserId}
            onRetry={onRetry}
            isNewMessage={
              !isOptimisticMessage(msg) &&
              (newMessageIds?.has(msg.id) ?? false)
            }
          />
        ))}
      </div>
      <div ref={bottomRef} aria-hidden />
    </div>
  );
}
