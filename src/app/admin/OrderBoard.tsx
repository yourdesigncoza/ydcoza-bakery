import Image from "next/image";
import Link from "next/link";
import { formatRand } from "@/lib/catalogue/pricing";
import { resolve, resolveAddOns, sizesFor } from "@/lib/catalogue";
import { ORDER_STATUSES, STATUS_LABELS, type Order } from "@/lib/orders/types";
import { signOut, updateOrder } from "./actions";

/**
 * The production board.
 *
 * Each card is the complete brief a decorator needs — the whole point of the
 * builder is that nothing here had to be chased over WhatsApp.
 */
export function OrderBoard({ orders }: { orders: Order[] }) {
  const outstanding = orders.filter(
    (order) => !["collected", "cancelled"].includes(order.status),
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] font-semibold leading-none text-ink">
            Order board
          </h1>
          <p className="mt-2 text-[13px] text-body">
            {outstanding.length} open {outstanding.length === 1 ? "order" : "orders"} ·{" "}
            {orders.length} total
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-[12.5px] text-accent hover:underline">
            Sign out
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-xl border border-rule bg-card px-5 py-8 text-center text-[13px] text-muted">
          No orders yet. Designs placed through the builder land here.
        </p>
      ) : (
        <div className="mt-7 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.reference} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  const type = resolve("typeId", order.config.typeId);
  const size = sizesFor(order.config.typeId).find((entry) => entry.id === order.config.sizeId);
  const addOns = resolveAddOns(order.config.addOnIds);

  const brief: [string, string][] = [
    ["Cake", `${type.name} — ${size?.name} (${size?.servings})`],
    [
      "Sponge",
      `${resolve("flavourId", order.config.flavourId).name}, ${resolve(
        "fillingId",
        order.config.fillingId,
      ).name.toLowerCase()} filling`,
    ],
    [
      "Finish",
      `${resolve("finishId", order.config.finishId).name} in ${resolve(
        "paletteId",
        order.config.paletteId,
      ).name}`,
    ],
    ["Occasion", resolve("occasionId", order.config.occasionId).name],
    ["Presentation", resolve("presentationId", order.config.presentationId).name],
    ["Add-ons", addOns.length ? addOns.map((addOn) => addOn.name).join(", ") : "None"],
  ];

  if (order.config.inscription.trim()) {
    brief.push(["Wording", `"${order.config.inscription.trim()}"`]);
  }
  if (order.config.specialInstructions.trim()) {
    brief.push(["Notes", order.config.specialInstructions.trim()]);
  }

  const due = new Date(`${order.customer.requiredDate}T00:00:00`);
  const daysAway = Math.ceil((due.getTime() - Date.now()) / 86_400_000);

  return (
    <article className="rounded-2xl border border-rule bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-[22px] font-semibold leading-none text-ink">
              {order.reference}
            </h2>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-semibold text-accent">
              {STATUS_LABELS[order.status]}
            </span>
            {order.requiresQuote ? (
              <span className="rounded-full bg-note px-2.5 py-1 text-[10.5px] font-semibold text-body">
                Quote
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-[12px] text-body">
            {order.customer.name} · {order.customer.phone} ·{" "}
            <a href={`mailto:${order.customer.email}`} className="text-accent hover:underline">
              {order.customer.email}
            </a>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[20px] font-semibold text-ink">
            {formatRand(order.total)}
          </p>
          <p className="text-[11.5px] text-muted">
            {order.customer.method === "delivery" ? "Deliver" : "Collect"}{" "}
            {due.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
            {daysAway >= 0 ? ` · ${daysAway}d` : " · overdue"}
          </p>
        </div>
      </header>

      <div className="grid gap-5 pt-4 sm:grid-cols-[auto_1fr_auto]">
        {order.previewUrl || order.inspirationUrl ? (
          <div className="flex gap-2">
            {order.previewUrl ? (
              <Image
                src={order.previewUrl}
                alt="Approved impression"
                width={104}
                height={104}
                unoptimized
                className="h-26 w-26 rounded-lg border border-rule object-cover"
              />
            ) : null}
            {order.inspirationUrl ? (
              <a href={order.inspirationUrl} target="_blank" rel="noreferrer" title="Inspiration photo">
                <Image
                  src={order.inspirationUrl}
                  alt="Customer inspiration"
                  width={104}
                  height={104}
                  unoptimized
                  className="h-26 w-26 rounded-lg border-2 border-dashed border-accent object-cover"
                />
              </a>
            ) : null}
          </div>
        ) : null}

        <dl className="space-y-1 text-[12px]">
          {brief.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[86px_1fr] gap-2">
              <dt className="font-semibold text-ink">{label}:</dt>
              <dd className="text-body">{value}</dd>
            </div>
          ))}
          {order.customer.method === "delivery" ? (
            <div className="grid grid-cols-[86px_1fr] gap-2">
              <dt className="font-semibold text-ink">Address:</dt>
              <dd className="text-body">{order.customer.deliveryAddress}</dd>
            </div>
          ) : null}
        </dl>

        <form action={updateOrder} className="w-full space-y-2 sm:w-52">
          <input type="hidden" name="reference" value={order.reference} />
          <label className="sr-only" htmlFor={`status-${order.reference}`}>
            Status
          </label>
          <select
            id={`status-${order.reference}`}
            name="status"
            defaultValue={order.status}
            className="w-full rounded-lg border border-rule bg-card px-2.5 py-2 text-[12.5px] text-ink focus:border-accent focus:outline-none"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`notes-${order.reference}`}>
            Bakery notes
          </label>
          <textarea
            id={`notes-${order.reference}`}
            name="bakeryNotes"
            rows={2}
            defaultValue={order.bakeryNotes}
            placeholder="Internal notes…"
            className="w-full resize-none rounded-lg border border-rule bg-card px-2.5 py-2 text-[12px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-cocoa px-3 py-2 text-[12.5px] font-semibold text-white transition hover:bg-ink"
          >
            Save
          </button>
          <Link
            href={`/orders/${order.reference}`}
            className="block text-center text-[11.5px] text-accent hover:underline"
          >
            Customer view
          </Link>
        </form>
      </div>
    </article>
  );
}
