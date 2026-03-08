"use client";

import React, { useEffect } from "react";

/**
 * Wraps the full-screen chat in a fixed viewport overlay so the chat is not
 * inside the layout's scroll. Locks body scroll while mounted so only the
 * message list scrolls (header and input stay fixed).
 */
export function ChatFullscreenShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-[env(safe-area-inset-top)]">
        {children}
      </div>
    </div>
  );
}
