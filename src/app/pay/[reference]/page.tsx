import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { currentOrigin } from "@/app/actions";
import { BRAND } from "@/lib/brand";
import { resolve } from "@/lib/catalogue";
import { formatMoney } from "@/lib/catalogue/pricing";
import { getOrderStore } from "@/lib/orders/store";
import { config as payfastConfig, paymentFields } from "@/lib/payfast";
import { AutoSubmit } from "./AutoSubmit";

export const metadata: Metadata = { title: "Payment" };

/**
 * Hands the customer over to PayFast.
 *
 * PayFast takes a signed form POST, so the fields are built on the server and
 * posted from the customer's browser.
 */
export default async function PayPage({ params }: PageProps<"/pay/[reference]">) {
  const { reference } = await params;
  const order = await getOrderStore().find(reference);
  if (!order) notFound();

  // Nothing to pay for once it is settled, or if it was always a quote.
  if (order.requiresQuote || order.status !== "awaiting_payment") {
    redirect(`/orders/${order.reference}`);
  }

  const settings = payfastConfig();
  const [firstName, ...rest] = order.customer.name.split(" ");
  const type = resolve("typeId", order.config.typeId);

  const fields = paymentFields({
    reference: order.reference,
    amount: order.total,
    itemName: `${type.name} ${order.reference}`,
    itemDescription: `Custom cake order from ${BRAND.name}`,
    firstName,
    lastName: rest.join(" ") || firstName,
    email: order.customer.email,
    origin: await currentOrigin(),
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16 text-center">
        <h1 className="font-display text-[32px] font-semibold leading-none text-ink">
          Taking you to PayFast
        </h1>
        <p className="mt-3 text-[13px] text-body">
          Order {order.reference} — {formatMoney(order.total)}
        </p>

        {!settings.live ? (
          <p className="mt-5 rounded-lg bg-note px-4 py-3 text-[11.5px] leading-relaxed text-body">
            <strong className="text-ink">Sandbox mode.</strong> This is PayFast&rsquo;s test
            environment — no real money moves. Use the sandbox card details PayFast shows
            on the next screen.
          </p>
        ) : null}

        <form method="post" action={settings.processUrl} className="mt-7">
          {fields.map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <button
            type="submit"
            className="w-full rounded-xl bg-cocoa px-4 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink"
          >
            Continue to PayFast
          </button>
          <AutoSubmit />
        </form>

        <p className="mt-4 text-[11.5px] text-muted">
          If nothing happens, use the button above.
        </p>
      </main>
    </>
  );
}
