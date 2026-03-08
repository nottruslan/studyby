"use client";

import type { ReactNode } from "react";

type FeedScrollContainerProps = {
  children: ReactNode;
};

export function FeedScrollContainer({ children }: FeedScrollContainerProps) {
  return (
    <main
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-behavior-y:contain"
      role="feed"
      aria-label="Лента постов"
    >
      {children}
    </main>
  );
}
