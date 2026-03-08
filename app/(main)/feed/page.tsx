import { Suspense } from "react";
import { FeedSkeleton } from "@/components/skeletons/FeedSkeleton";

function FeedContent() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Лента</h2>
      <p className="mt-2 text-muted-foreground">
        Здесь будет лента постов. Пока заглушка.
      </p>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedContent />
    </Suspense>
  );
}
