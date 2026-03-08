"use server";

import { revalidatePath } from "next/cache";

export async function revalidateOrders() {
  revalidatePath("/orders");
}
