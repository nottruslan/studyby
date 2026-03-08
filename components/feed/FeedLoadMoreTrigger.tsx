"use client";

import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

type FeedLoadMoreTriggerProps = {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
};

export function FeedLoadMoreTrigger({
  onLoadMore,
  hasMore,
  loading = false,
}: FeedLoadMoreTriggerProps) {
  const { ref, inView } = useInView({
    rootMargin: "200px 0px",
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <div
      ref={ref}
      className="min-h-[100dvh] h-full w-full shrink-0 snap-start flex items-center justify-center"
      aria-hidden
    >
      {loading && (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      )}
    </div>
  );
}
