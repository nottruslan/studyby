export function OrdersListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 rounded-2xl bg-muted" />
      <div className="flex gap-1 rounded-3xl bg-muted p-1 w-48">
        <div className="h-9 flex-1 rounded-3xl bg-background" />
        <div className="h-9 flex-1 rounded-3xl" />
      </div>
      <ul className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="rounded-3xl border border-border bg-card p-4">
            <div className="flex justify-between gap-2">
              <div className="h-5 w-48 rounded-lg bg-muted" />
              <div className="h-5 w-24 rounded-full bg-muted" />
            </div>
            <div className="mt-2 h-4 w-36 rounded-lg bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
