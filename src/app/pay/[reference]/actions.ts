"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrderStore } from "@/lib/orders/store";
import { confirmPayment, paymentProvider } from "@/lib/payments";

/**
 * Settle an order from the simulated checkout.
 *
 * Confirming an order for free is only ever acceptable on a demonstration
 * deployment, so the provider is resolved again here rather than trusted from
 * the page that rendered the button — which also re-runs the check that no real
 * payment credentials are present.
 */
export async function payDemoOrder(formData: FormData): Promise<void> {
  if (paymentProvider() !== "demo") notFound();

  const reference = String(formData.get("reference") ?? "");
  const order = await getOrderStore().find(reference);
  if (!order) notFound();

  await confirmPayment(order, `demo-${order.reference}`);

  revalidatePath(`/orders/${order.reference}`);
  redirect(`/orders/${order.reference}`);
}
