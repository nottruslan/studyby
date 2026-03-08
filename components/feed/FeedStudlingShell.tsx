"use client";

import { useCallback, useState } from "react";
import { FeedScrollContainer } from "./FeedScrollContainer";
import { TweetCard } from "./TweetCard";
import { FeedLoadMoreTrigger } from "./FeedLoadMoreTrigger";
import { loadMoreFeedPosts } from "@/app/(main)/feed/actions";
import type { FeedPost } from "@/lib/types/feed";

type FeedStudlingShellProps = {
  initialPosts: FeedPost[];
  initialCursor: string | null;
};

const PAGE_SIZE = 5;

export function FeedStudlingShell({
  initialPosts,
  initialCursor,
}: FeedStudlingShellProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const hasMore = cursor !== null;

  const onLoadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const { posts: nextPosts, nextCursor } = await loadMoreFeedPosts(
        cursor,
        PAGE_SIZE
      );
      setPosts((prev) => [...prev, ...nextPosts]);
      setCursor(nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  return (
    <div className="fixed inset-0 z-10 h-[100dvh] lg:left-56 lg:top-14 lg:h-[calc(100vh-3.5rem)]">
      <FeedScrollContainer>
        {posts.length === 0 ? (
          <div className="h-[100dvh] w-full shrink-0 snap-start flex flex-col justify-center items-center gap-4 px-4 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
            <p className="text-center text-slate-400 text-lg">
              Пока нет постов. Будь первым!
            </p>
          </div>
        ) : (
          posts.map((post) => <TweetCard key={post.id} post={post} />)
        )}
        <FeedLoadMoreTrigger
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          loading={loading}
        />
      </FeedScrollContainer>
    </div>
  );
}
