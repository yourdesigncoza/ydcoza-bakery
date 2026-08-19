import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { getOrderStore } from "@/lib/orders/store";
import { paymentProvider } from "@/lib/payments";
import { DemoCheckout } from "./DemoCheckout";
import { PayFastHandover } from "./PayFastHandover";

export const metadata: Metadata = { title: "Payment" };

/**
 * Takes payment for an order, however this deployment is set up to take it.
 *
 * `PAYMENT_PROVIDER` decides: PayFast for the South African storefront, the
 * simulated checkout for a demonstration in a market PayFast cannot serve.
 */
export default async function PayPage({ params }: PageProps<"/pay/[reference]">) {
  const { reference } = await params;
  const order = await getOrderStore().find(reference);
  if (!order) notFound();

  // Nothing to pay for once it is settled, or if it was always a quote.
  if (order.requiresQuote || order.status !== "awaiting_payment") {
    redirect(`/orders/${order.reference}`);
  }

  return (
    <>
      <SiteHeader />
      {paymentProvider() === "demo" ? (
        <DemoCheckout order={order} />
      ) : (
        <PayFastHandover order={order} />
      )}
    </>
  );
}
