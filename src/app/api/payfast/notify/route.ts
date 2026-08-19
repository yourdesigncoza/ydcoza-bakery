import { getOrderStore } from "@/lib/orders/store";
import { verifyNotification } from "@/lib/payfast";
import { confirmPayment } from "@/lib/payments";

/**
 * PayFast Instant Transaction Notification endpoint.
 *
 * This — not the customer's return to the site — is what marks an order paid.
 * A customer can close the tab before being redirected back, and a redirect
 * can be forged, so the order status only ever moves on a notification PayFast
 * itself confirms.
 *
 * PayFast retries on any non-200, so the endpoint answers 200 for anything it
 * has finished dealing with, including notifications it deliberately ignored.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const reference = params.get("m_payment_id") ?? "";

  const store = getOrderStore();
  const order = await store.find(reference);
  if (!order) {
    console.warn(`payfast notify: unknown order ${reference}`);
    return new Response("OK", { status: 200 });
  }

  const sourceIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const verdict = await verifyNotification(body, order.total, sourceIp);

  if (!verdict.valid) {
    console.error(`payfast notify rejected for ${reference}: ${verdict.reason}`);
    // Answer 200 so PayFast stops retrying something we will never accept.
    return new Response("OK", { status: 200 });
  }

  const status = params.get("payment_status");
  if (status !== "COMPLETE") {
    console.info(`payfast notify: ${reference} reported ${status}`);
    return new Response("OK", { status: 200 });
  }

  await confirmPayment(order, params.get("pf_payment_id"));

  return new Response("OK", { status: 200 });
}
