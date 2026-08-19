import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CakeSummary } from "@/components/CakeSummary";
import { OrderProgress } from "@/components/OrderProgress";
import { BRAND } from "@/lib/brand";
import { formatMoney, priceCake } from "@/lib/catalogue/pricing";
import { MARKET } from "@/lib/market";
import { getOrderStore } from "@/lib/orders/store";
import { STATUS_DESCRIPTIONS, STATUS_LABELS } from "@/lib/orders/types";

export const metadata: Metadata = { title: "Your order" };

/** Show enough for the customer to recognise their own details, no more. */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}${"•".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/orders/[reference]">) {
  const { reference } = await params;
  const query = await searchParams;
  const order = await getOrderStore().find(reference);
  if (!order) notFound();

  const quote = priceCake(order.config, Boolean(order.inspirationUrl));
  const justPaid = "paid" in query;
  const cancelled = "cancelled" in query;
  const hasImagery = Boolean(order.previewUrl || order.inspirationUrl);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        {justPaid && order.status === "awaiting_payment" ? (
          <p className="mb-6 rounded-xl bg-note px-4 py-3 text-[12.5px] leading-relaxed text-body">
            Thanks — PayFast is confirming your payment. This page updates as soon as
            they do, usually within a minute.
          </p>
        ) : null}

        {cancelled ? (
          <p className="mb-6 rounded-xl bg-note px-4 py-3 text-[12.5px] text-body">
            Payment was cancelled. Your design is saved — you can{" "}
            <Link href={`/pay/${order.reference}`} className="font-semibold text-accent underline">
              try again
            </Link>
            .
          </p>
        ) : null}

        <p className="section-label">Order {order.reference}</p>
        <h1 className="mt-2 font-display text-[36px] font-semibold leading-none text-ink">
          {STATUS_LABELS[order.status]}
        </h1>
        <p className="mt-2.5 text-[13px] text-body">{STATUS_DESCRIPTIONS[order.status]}</p>

        <div className="mt-8">
          <OrderProgress status={order.status} />
        </div>

        {/* Without imagery there is nothing to put beside the details, so the
            page narrows to a single column rather than leaving a gap. */}
        <div
          className={`mt-9 grid gap-6 ${hasImagery ? "sm:grid-cols-2" : "max-w-sm"}`}
        >
          <div className="space-y-4 empty:hidden">
            {order.previewUrl ? (
              <figure>
                <Image
                  src={order.previewUrl}
                  alt="The impression you approved"
                  width={600}
                  height={600}
                  unoptimized
                  className="aspect-square w-full rounded-xl border border-rule object-cover"
                />
                <figcaption className="mt-2 text-[10.5px] leading-relaxed text-muted">
                  {BRAND.previewDisclaimer}
                </figcaption>
              </figure>
            ) : null}

            {order.inspirationUrl ? (
              <figure>
                <p className="section-label mb-2">Your inspiration photo</p>
                <Image
                  src={order.inspirationUrl}
                  alt="The reference photo you sent"
                  width={600}
                  height={600}
                  unoptimized
                  className="aspect-square w-full rounded-xl border border-rule object-cover"
                />
              </figure>
            ) : null}
          </div>

          <div className="space-y-4">
            <CakeSummary config={order.config} quote={quote} showPricing={false} />

            <div className="rounded-xl border border-rule bg-page/60 p-3.5 text-[12px]">
              <p className="section-label mb-2.5">Collection</p>
              <dl className="space-y-1.5">
                <Row label="For">
                  {new Date(`${order.customer.requiredDate}T00:00:00`).toLocaleDateString(
                    MARKET.locale,
                    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
                  )}
                </Row>
                <Row label="Method">
                  {order.customer.method === "delivery"
                    ? "Delivery"
                    : `Collect from ${BRAND.address}`}
                </Row>
                <Row label="Contact">{maskEmail(order.customer.email)}</Row>
              </dl>

              <div className="mt-3 flex items-baseline justify-between border-t border-rule pt-3">
                <span className="font-semibold text-ink">
                  {order.requiresQuote
                    ? "Estimate"
                    : order.status === "awaiting_payment"
                      ? "To pay"
                      : "Paid"}
                </span>
                <span className="font-display text-[20px] font-semibold text-ink">
                  {formatMoney(order.total)}
                </span>
              </div>
            </div>

            {order.status === "awaiting_payment" ? (
              <Link
                href={`/pay/${order.reference}`}
                className="block w-full rounded-xl bg-cocoa px-4 py-3 text-center text-[13.5px] font-semibold text-white transition hover:bg-ink"
              >
                Complete payment
              </Link>
            ) : null}
          </div>
        </div>

        <p className="mt-9 border-t border-rule pt-5 text-[12px] text-body">
          Questions about this order? Email{" "}
          <a href={`mailto:${BRAND.email}`} className="text-accent hover:underline">
            {BRAND.email}
          </a>{" "}
          or call {BRAND.phone}, quoting {order.reference}.
        </p>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-2">
      <dt className="font-semibold text-ink">{label}:</dt>
      <dd className="text-body">{children}</dd>
    </div>
  );
}
