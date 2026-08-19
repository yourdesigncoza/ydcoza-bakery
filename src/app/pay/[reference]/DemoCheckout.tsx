import { formatMoney } from "@/lib/catalogue/pricing";
import type { Order } from "@/lib/orders/types";
import { payDemoOrder } from "./actions";

/**
 * Card details as they are shown on this page: fixed, inert and obviously not
 * anyone's. 4242 4242 4242 4242 is the test number every processor publishes,
 * so a reader who knows cards at all recognises it on sight.
 */
const PLACEHOLDER_CARD: [string, string][] = [
  ["Card number", "4242 4242 4242 4242"],
  ["Name on card", "DEMONSTRATION ONLY"],
  ["Expiry", "12 / 34"],
  ["Security code", "123"],
];

/**
 * A simulated checkout for demonstration deployments.
 *
 * The point is to show the rest of the flow — payment, confirmation, tracking,
 * the bakery's board — in the market's own currency without a gateway behind
 * it. So it is plainly the bakery's own page: it carries no processor's name or
 * styling, because dressing it up as one would misrepresent a company nobody
 * here has an arrangement with, and a prospect's screenshot would imply an
 * integration that does not exist.
 *
 * The card fields are fixed and disabled on purpose. A realistic, typeable card
 * form on a public URL is phishing-shaped whatever it was meant for, and the
 * one thing worse than a demo that takes no money is a baker typing their own
 * card into it. Nothing here is submitted, read or stored — the button sends
 * the order reference and nothing else.
 *
 * The page is kept short so the notice and the button stay on screen together.
 * A warning the customer has to scroll away from to pay is not a warning.
 */
export function DemoCheckout({ order }: { order: Order }) {
  // The order's own lines, so the cake is described the way it was priced.
  const cake = order.lines.find((line) => line.group === "Cake") ?? order.lines[0];

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <p className="section-label">Order {order.reference}</p>
      <h1 className="mt-2 font-display text-[32px] font-semibold leading-none text-ink">
        Checkout
      </h1>
      <p className="mt-2.5 text-[13px] text-body">{cake?.label}</p>

      <div className="mt-5 rounded-xl border-2 border-accent bg-accent-soft px-4 py-3.5">
        <p className="text-[14px] font-semibold leading-snug text-ink">
          Demonstration only — no payment is taken and no card details are stored.
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-body">
          This storefront is being shown, not run. The card below is a fixed example
          that cannot be edited, and nothing on this page is sent anywhere.
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-rule bg-card p-3.5">
        <p className="section-label mb-2.5">Card (example)</p>
        <div className="grid grid-cols-2 gap-2.5">
          {PLACEHOLDER_CARD.map(([label, value], index) => (
            <label key={label} className={index < 2 ? "col-span-2 block" : "block"}>
              <span className="text-[11px] font-semibold text-muted">{label}</span>
              <input
                type="text"
                value={value}
                readOnly
                disabled
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-rule bg-page px-3 py-2 text-[13px] text-muted"
              />
            </label>
          ))}
        </div>
      </div>

      <form action={payDemoOrder} className="mt-5">
        <input type="hidden" name="reference" value={order.reference} />
        <div className="flex items-baseline justify-between border-t border-rule pt-3.5">
          <span className="text-[13px] font-semibold text-ink">To pay</span>
          <span className="font-display text-[22px] font-semibold text-ink">
            {formatMoney(order.total)}
          </span>
        </div>
        <button
          type="submit"
          className="mt-3.5 w-full rounded-xl bg-cocoa px-4 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink"
        >
          Pay {formatMoney(order.total)}
        </button>
      </form>

      <p className="mt-4 text-[11.5px] leading-relaxed text-muted">
        The button confirms the order so the rest of the flow can be followed. No money
        moves, and a bakery selling for real needs a payment gateway wired up first.
      </p>
    </main>
  );
}
