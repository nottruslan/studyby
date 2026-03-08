import { Suspense } from "react";
import { getFeedPosts } from "./actions";
import { FeedStudlingShell } from "@/components/feed/FeedStudlingShell";
import { FeedSkeleton } from "@/components/skeletons/FeedSkeleton";

const PAGE_SIZE = 5;

async function FeedContent() {
  const { posts, nextCursor } = await getFeedPosts(null, PAGE_SIZE);
  return (
    <FeedStudlingShell initialPosts={posts} initialCursor={nextCursor} />
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedContent />
    </Suspense>
  );
}
