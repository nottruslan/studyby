"use server";

import { revalidatePath } from "next/cache";

export async function revalidateOrders() {
  revalidatePath("/orders");
}

/** Вызывать после создания заказа: инвалидирует кэш списка заказов и админки. */
export async function revalidateOrdersAndAdmin() {
  revalidatePath("/orders");
  revalidatePath("/admin/orders");
}
