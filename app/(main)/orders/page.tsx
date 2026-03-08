import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { OrdersData } from "./OrdersData";
import { OrdersListSkeleton } from "@/components/skeletons/OrdersListSkeleton";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">Биржа заказов</h2>
        <Link
          href="/orders/new"
          prefetch={true}
          className="inline-flex items-center justify-center rounded-3xl h-9 px-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Создать заказ
        </Link>
      </div>

      <Suspense fallback={<OrdersListSkeleton />}>
        <OrdersData />
      </Suspense>
    </div>
  );
}
