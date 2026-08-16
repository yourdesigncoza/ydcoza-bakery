import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Track an order" };

async function findOrder(formData: FormData) {
  "use server";
  const reference = String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase();
  redirect(`/orders/${encodeURIComponent(reference)}`);
}

export default function TrackOrderPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="font-display text-[34px] font-semibold leading-none text-ink">
          Track an order
        </h1>
        <p className="mt-2.5 text-[13px] text-body">
          Enter the reference from your confirmation, for example BB-7QK42.
        </p>

        <form action={findOrder} className="mt-7 space-y-3">
          <label htmlFor="reference" className="sr-only">
            Order reference
          </label>
          <input
            id="reference"
            name="reference"
            required
            placeholder="BB-XXXXX"
            autoComplete="off"
            className="w-full rounded-lg border border-rule bg-card px-3 py-3 text-center font-display text-[20px] tracking-[0.15em] text-ink uppercase placeholder:tracking-normal placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-cocoa px-4 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink"
          >
            Find my order
          </button>
        </form>

        <p className="mt-6 text-[12px] text-body">
          Lost your reference? Email{" "}
          <a href={`mailto:${BRAND.email}`} className="text-accent hover:underline">
            {BRAND.email}
          </a>{" "}
          and we&rsquo;ll look it up.
        </p>
      </main>
    </>
  );
}
