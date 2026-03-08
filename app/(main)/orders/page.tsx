import { Suspense } from "react";
import { OrdersData } from "./OrdersData";
import { OrdersListSkeleton } from "@/components/skeletons/OrdersListSkeleton";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Биржа заказов</h2>

      <Suspense fallback={<OrdersListSkeleton />}>
        <OrdersData />
      </Suspense>
    </div>
  );
}
