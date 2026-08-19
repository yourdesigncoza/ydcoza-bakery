import { getOrderStore } from "./orders/store";
import type { Order } from "./orders/types";
import { liveCredentials } from "./payfast";

/**
 * Which payment step this deployment runs, chosen by `PAYMENT_PROVIDER`.
 *
 * PayFast is South African and settles in rand only, so a demonstration built
 * for a bakery in Cork or Brisbane cannot hand a customer over to it — the
 * prospect would land on a South African gateway quoting rands at the moment
 * the demo is meant to be convincing. `PAYMENT_PROVIDER=demo` swaps the
 * handover for a simulated checkout of our own, which walks the whole flow
 * (design, price, pay, confirmation, tracking, order board) in the market's
 * own currency and talks to nobody.
 *
 * The demo provider is a stand-in for a real gateway, not a discount on
 * building one: a deployment that takes money needs a proper integration.
 */
export type PaymentProvider = "payfast" | "demo";

/**
 * Resolve the configured provider, refusing the demo one where real money
 * could move.
 *
 * A simulated checkout on a deployment holding live credentials is the one
 * combination that must never render — either the demo is reachable on a real
 * storefront, or an order the bakery believes is paid never was. An
 * unrecognised value fails the same way rather than quietly falling back to
 * PayFast.
 */
export function paymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (!configured || configured === "payfast") return "payfast";

  if (configured !== "demo") {
    throw new Error(
      `PAYMENT_PROVIDER is "${configured}", which is not a payment provider. ` +
        `Use "payfast" or "demo".`,
    );
  }

  const conflicts = [...liveCredentials(), ...stripeSecrets()];
  if (conflicts.length > 0) {
    throw new Error(
      `PAYMENT_PROVIDER=demo cannot run on a deployment carrying payment ` +
        `credentials — found ${conflicts.join(", ")}. The demo checkout takes ` +
        `no money and confirms orders on a button press, so it must never sit ` +
        `on a storefront wired to a real gateway. Unset the credentials or run ` +
        `the real provider.`,
    );
  }

  return "demo";
}

/**
 * Names of any Stripe secret key in the environment.
 *
 * Stripe is the gateway a buyer outside South Africa is most likely to be
 * given, and the demo checkout must be gone before that goes in. Values are
 * matched as well as names, so a key hidden behind a house name is still found.
 */
function stripeSecrets(): string[] {
  return Object.entries(process.env)
    .filter(([name, value]) => {
      const secret = (value ?? "").trim();
      if (!secret) return false;
      return (
        /^(sk|rk)_(live|test)_/.test(secret) ||
        (/stripe/i.test(name) && /secret|restricted/i.test(name))
      );
    })
    .map(([name]) => name);
}

/**
 * Move a paid order to confirmed.
 *
 * Both providers finish here, so the guard lives in one place: a payment may
 * only ever advance an order that is still waiting for one. PayFast notifies
 * more than once for the same payment, and confirming twice is harmless, but
 * neither it nor the demo checkout may drag an order the bakery has already
 * taken further back to "confirmed".
 */
export async function confirmPayment(order: Order, paymentId: string | null) {
  if (order.status !== "awaiting_payment") return;

  await getOrderStore().update(order.reference, { status: "confirmed", paymentId });
}
