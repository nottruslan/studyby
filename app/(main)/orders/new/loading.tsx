import { Skeleton } from "@/components/ui/skeleton";

export default function NewOrderLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-9 w-20 rounded-3xl" />
      <Skeleton className="h-7 w-32 rounded-2xl" />
      <div className="flex gap-1 rounded-3xl bg-muted p-1 w-full max-w-sm">
        <Skeleton className="h-9 flex-1 rounded-3xl" />
        <Skeleton className="h-9 flex-1 rounded-3xl" />
        <Skeleton className="h-9 flex-1 rounded-3xl" />
      </div>
      <div className="rounded-3xl border border-border p-6 space-y-4">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-10 w-full rounded-3xl" />
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-10 w-full rounded-3xl" />
        <Skeleton className="h-10 w-24 rounded-3xl" />
      </div>
    </div>
  );
}
