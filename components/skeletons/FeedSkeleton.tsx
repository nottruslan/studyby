export function FeedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-32 rounded-2xl bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-full max-w-md rounded-xl bg-muted" />
        <div className="h-4 w-3/4 max-w-sm rounded-xl bg-muted" />
      </div>
    </div>
  );
}
