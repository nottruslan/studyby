"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  getInitialMessages,
  getOlderMessages,
  sendOrderMessage,
  type OrderMessageRow,
} from "../../actions";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputArea } from "./ChatInputArea";
import { ChatHeader } from "./ChatHeader";
import type { ChatMessageItem, OptimisticMessage } from "./types";
import { isOptimisticMessage } from "./types";
import { cn } from "@/lib/utils";

type Props = {
  orderId: string;
  currentUserId: string;
  initialMessages: OrderMessageRow[];
  /** Student's profile username (order owner). */
  studentUsername: string | null;
  /** True when the current user is an admin (Studby). */
  isCurrentUserAdmin?: boolean;
  /** True when rendered on the full-screen chat route (mobile); use h-[100dvh] and hide split. */
  fullScreen?: boolean;
};

function rowToItem(row: OrderMessageRow): ChatMessageItem {
  return {
    id: row.id,
    order_id: row.order_id,
    sender_id: row.sender_id,
    content: row.content,
    file_url: row.file_url,
    file_type: row.file_type,
    created_at: row.created_at,
    is_read: row.is_read,
  };
}

export function OrderChatArea({
  orderId,
  currentUserId,
  initialMessages,
  studentUsername,
  isCurrentUserAdmin = false,
  fullScreen = false,
}: Props) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(() =>
    initialMessages.map(rowToItem)
  );
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(initialMessages.length >= 50);
  const [adminOnline, setAdminOnline] = useState(false);
  const [studentOnline, setStudentOnline] = useState(false);
  const shouldScrollToBottomRef = useRef(true);
  const scrollToBottomOnNextMessageRef = useRef(false);

  const setScrollToBottomOnNextMessage = useCallback((v: boolean) => {
    scrollToBottomOnNextMessageRef.current = v;
  }, []);

  useEffect(() => {
    shouldScrollToBottomRef.current = true;
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-messages:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newRow = payload.new as OrderMessageRow;
          setMessages((prev) => {
            const next = [...prev];
            if (newRow.sender_id === currentUserId) {
              const optIndex = next.findIndex(
                (m) => isOptimisticMessage(m) && !m.sendFailed
              );
              if (optIndex !== -1) {
                next[optIndex] = rowToItem(newRow);
                return next;
              }
            }
            next.push(rowToItem(newRow));
            return next;
          });
          if (newRow.sender_id !== currentUserId) {
            scrollToBottomOnNextMessageRef.current = true;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, currentUserId]);

  useEffect(() => {
    const supabase = createClient();
    const presenceChannel = supabase.channel(`order-presence:${orderId}`, {
      config: { presence: { key: currentUserId } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        let admin = false;
        let student = false;
        Object.values(state).forEach((presences) => {
          (presences as { role?: string }[]).forEach((p) => {
            if (p.role === "admin") admin = true;
            if (p.role === "student") student = true;
          });
        });
        setAdminOnline(admin);
        setStudentOnline(student);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: currentUserId,
            role: isCurrentUserAdmin ? "admin" : "student",
          });
        }
      });

    return () => {
      presenceChannel.untrack().then(() => {
        supabase.removeChannel(presenceChannel);
      });
    };
  }, [orderId, currentUserId, isCurrentUserAdmin]);

  const handleSend = useCallback(
    async (content: string | null, fileUrl: string | null, fileType: string | null) => {
      const tempId = `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: OptimisticMessage = {
        id: tempId,
        order_id: orderId,
        sender_id: currentUserId,
        content,
        file_url: fileUrl,
        file_type: fileType,
        created_at: new Date().toISOString(),
        is_read: false,
        tempId,
        isOptimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      shouldScrollToBottomRef.current = true;

      const result = await sendOrderMessage(orderId, content, fileUrl, fileType);

      if ("error" in result) {
        setMessages((prev) =>
          prev.map((m) =>
            isOptimisticMessage(m) && m.tempId === tempId
              ? { ...m, sendFailed: true }
              : m
          )
        );
        toast.error(result.error);
      }
    },
    [orderId, currentUserId]
  );

  const handleRetry = useCallback(
    (tempId: string) => {
      const msg = messages.find(
        (m): m is OptimisticMessage =>
          isOptimisticMessage(m) && m.tempId === tempId && m.sendFailed === true
      );
      if (!msg) return;
      setMessages((prev) =>
        prev.map((m) =>
          isOptimisticMessage(m) && m.tempId === tempId
            ? { ...m, sendFailed: false }
            : m
        )
      );
      handleSend(msg.content, msg.file_url, msg.file_type);
    },
    [messages, handleSend]
  );

  const handleLoadOlder = useCallback(async () => {
    const first = messages[0];
    if (!first || isOptimisticMessage(first)) return;
    setIsLoadingOlder(true);
    try {
      const older = await getOlderMessages(orderId, first.created_at);
      if (older.length > 0) {
        setMessages((prev) => [...older.map(rowToItem), ...prev]);
      }
      setHasOlder(older.length >= 50);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [orderId, messages]);

  const containerClass = fullScreen
    ? "h-full flex flex-col w-full bg-background min-h-0"
    : "h-[calc(100vh-80px)] flex flex-col min-h-0";

  return (
    <div className={cn(containerClass)}>
      <ChatHeader
        studentUsername={studentUsername}
        adminOnline={adminOnline}
        studentOnline={studentOnline}
        isCurrentUserStudent={!isCurrentUserAdmin}
      />
      <ChatMessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoadingOlder={isLoadingOlder}
        hasOlder={hasOlder}
        onLoadOlder={handleLoadOlder}
        onRetry={handleRetry}
        shouldScrollToBottomRef={shouldScrollToBottomRef}
        setScrollToBottomOnNextMessage={setScrollToBottomOnNextMessage}
        scrollToBottomOnNextMessageRef={scrollToBottomOnNextMessageRef}
      />
      <ChatInputArea
        orderId={orderId}
        onSend={handleSend}
        disabled={false}
        fullScreen={fullScreen}
      />
    </div>
  );
}
