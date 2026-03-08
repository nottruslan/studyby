"use client";

import React, { useEffect, useRef } from "react";

const VVH_VAR = "--chat-vvh";
const VV_TOP_VAR = "--chat-vv-top";

/**
 * Syncs visual viewport (keyboard-aware) to CSS variables so the chat shell
 * exactly covers the visible area. Uses both height and offsetTop so the
 * input bar stays at the bottom of the visible viewport (just above keyboard).
 */
function useVisualViewportHeight() {
  const rafRef = useRef<number | null>(null);
  const scheduledRef = useRef(false);

  useEffect(() => {
    const setVV = () => {
      const vv = typeof window !== "undefined" ? window.visualViewport : null;
      const h = vv?.height ?? window.innerHeight;
      const top = vv?.offsetTop ?? 0;
      document.documentElement.style.setProperty(VVH_VAR, `${Math.round(h)}px`);
      document.documentElement.style.setProperty(VV_TOP_VAR, `${Math.round(top)}px`);
    };

    const schedule = () => {
      if (scheduledRef.current) return;
      scheduledRef.current = true;
      rafRef.current = requestAnimationFrame(() => {
        scheduledRef.current = false;
        rafRef.current = null;
        setVV();
      });
    };

    setVV();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);

    return () => {
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);
}

/**
 * Wraps the full-screen chat in a fixed viewport overlay so the chat is not
 * inside the layout's scroll. Uses VisualViewport so the shell height follows
 * the keyboard (smooth resize like Telegram). Locks body scroll while mounted.
 */
export function ChatFullscreenShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useVisualViewportHeight();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-50 flex flex-col bg-background overflow-hidden chat-fullscreen-shell"
      style={{
        top: "var(--chat-vv-top, 0px)",
        height: "var(--chat-vvh, 100dvh)",
      }}
    >
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-[env(safe-area-inset-top)]">
        {children}
      </div>
    </div>
  );
}
