"use client";

import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { FeedPost } from "@/lib/types/feed";

type TweetCardProps = {
  post: FeedPost;
};

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "только что";
  if (sec < 3600) return `${Math.floor(sec / 60)} мин`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ч`;
  return `${Math.floor(sec / 86400)} д`;
}

export function TweetCard({ post }: TweetCardProps) {
  const author = post.author;
  const nickname = author?.username ?? "Пользователь";

  return (
    <article
      className="h-[100dvh] min-h-full w-full shrink-0 snap-start snap-always flex flex-col justify-center items-center relative bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900"
      data-post-id={post.id}
    >
      {/* Top: author strip */}
      <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-10">
        <Avatar className="h-8 w-8 border-2 border-white/20">
          <AvatarImage src={author?.avatar_url ?? undefined} alt={nickname} />
          <AvatarFallback className="bg-slate-600 text-slate-200 text-xs">
            {nickname.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-slate-300 truncate">{nickname}</span>
        <span className="text-xs text-slate-500 ml-1">{formatTimeAgo(post.created_at)}</span>
      </div>

      {/* Center: post content */}
      <div className="max-w-[80%] text-center px-2">
        <p className="text-2xl font-bold text-slate-100 leading-snug">{post.body}</p>
      </div>

      {/* Floating action bar (right side, like Reels) */}
      <div
        className="absolute right-4 bottom-20 flex flex-col gap-6 z-10"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          type="button"
          className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-white transition-colors touch-manipulation"
          aria-label="Нравится"
        >
          <Heart className="h-8 w-8" />
          <span className="text-xs">0</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-white transition-colors touch-manipulation"
          aria-label="Комментарии"
        >
          <MessageCircle className="h-8 w-8" />
          <span className="text-xs">0</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-white transition-colors touch-manipulation"
          aria-label="Репост"
        >
          <Repeat2 className="h-8 w-8" />
          <span className="text-xs">0</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-white transition-colors touch-manipulation"
          aria-label="Поделиться"
        >
          <Share className="h-8 w-8" />
        </button>
      </div>
    </article>
  );
}
