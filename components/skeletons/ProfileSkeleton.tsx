export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col items-center pt-2 pb-4">
        <div className="h-24 w-24 rounded-full bg-muted" />
        <div className="mt-3 h-6 w-32 rounded-xl bg-muted" />
        <div className="mt-1 h-4 w-48 rounded-lg bg-muted" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-14 rounded-t-2xl bg-muted/50" />
        <div className="h-14 border-t border-border bg-muted/30" />
        <div className="h-14 border-t border-border bg-muted/30" />
      </div>
    </div>
  );
}
