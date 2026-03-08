import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-7 w-24 rounded-2xl" />
      <Skeleton className="h-4 w-full max-w-md rounded-xl" />
      <Skeleton className="h-4 w-3/4 max-w-sm rounded-xl" />
    </div>
  );
}
