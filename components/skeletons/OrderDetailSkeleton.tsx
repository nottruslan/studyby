import { Skeleton } from "@/components/ui/skeleton";

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-3xl" />
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Skeleton className="h-6 w-48 rounded-xl" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <dl className="grid gap-2 text-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-4 w-24 shrink-0 rounded" />
              <Skeleton className="h-4 flex-1 max-w-xs rounded" />
            </div>
          ))}
        </dl>
        <div>
          <Skeleton className="h-4 w-20 mb-2 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Skeleton className="h-10 w-28 rounded-3xl" />
          <Skeleton className="h-10 w-24 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
