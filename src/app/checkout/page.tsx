import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CakeSummary } from "@/components/CakeSummary";
import { CheckoutForm } from "@/components/CheckoutForm";
import { decodeConfig } from "@/lib/config-codec";
import { earliestCollectionDate, priceCake } from "@/lib/catalogue/pricing";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const params = await searchParams;
  const design = Array.isArray(params.d) ? params.d[0] : (params.d ?? "");
  const config = decodeConfig(design);
  const quote = priceCake(config);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Link href={`/?d=${design}`} className="text-[12.5px] text-accent hover:underline">
          ← Back to the builder
        </Link>

        <h1 className="mt-3 font-display text-[36px] font-semibold leading-none text-ink">
          {quote.requiresQuote ? "Request your quote" : "Almost there"}
        </h1>
        <p className="mt-2 text-[13px] text-body">
          {quote.requiresQuote
            ? "Tell us where to send your quote and we'll come back to you with a price."
            : "Tell us who you are and when you need your cake."}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="rounded-2xl border border-rule bg-card p-5 sm:p-7">
            <CheckoutForm
              design={design}
              earliestDate={earliestCollectionDate(config, new Date())}
              leadDays={quote.leadDays}
              requiresQuote={quote.requiresQuote}
            />
          </div>

          <aside className="lg:sticky lg:top-20">
            <CakeSummary config={config} quote={quote} />
            {quote.requiresQuote ? (
              <div className="mt-4 rounded-xl bg-note px-4 py-3 text-[11.5px] leading-relaxed text-body">
                <p className="font-semibold text-ink">Why this is a quote</p>
                <ul className="mt-1 space-y-0.5">
                  {quote.quoteReasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  The figure above is an estimate. We&rsquo;ll confirm the exact price
                  before anything is charged.
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </>
  );
}
