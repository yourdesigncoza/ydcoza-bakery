import { resolve, resolveAddOns, sizesFor } from "@/lib/catalogue";
import type { CakeConfig } from "@/lib/catalogue/types";
import { formatMoney, type Quote } from "@/lib/catalogue/pricing";

/**
 * Every choice the customer made, as one readable brief.
 *
 * The builder, the checkout, the customer's confirmation email and the
 * bakery's production sheet all render this same component, so what the
 * customer approves is exactly what the decorator reads.
 */
export function CakeSummary({
  config,
  quote,
  showPricing = true,
}: {
  config: CakeConfig;
  quote: Quote;
  showPricing?: boolean;
}) {
  const type = resolve("typeId", config.typeId);
  const size = sizesFor(config.typeId).find((entry) => entry.id === config.sizeId);
  const addOns = resolveAddOns(config.addOnIds);

  const rows: [string, React.ReactNode][] = [
    ["Type", type.name],
    ["Flavour", resolve("flavourId", config.flavourId).name],
    ["Filling", resolve("fillingId", config.fillingId).name],
    ["Size", size ? `${size.name} (${size.servings})` : "—"],
    ["Finish", resolve("finishId", config.finishId).name],
    ["Colour", resolve("paletteId", config.paletteId).name],
    ["Occasion", resolve("occasionId", config.occasionId).name],
    ["Presentation", resolve("presentationId", config.presentationId).name],
  ];

  if (addOns.length > 0) {
    rows.push([
      "Add-ons",
      <ul key="add-ons" className="space-y-0.5">
        {addOns.map((addOn) => (
          <li key={addOn.id}>• {addOn.name}</li>
        ))}
      </ul>,
    ]);
  }

  if (config.inscription.trim()) {
    rows.push(["Wording", <q key="wording">{config.inscription.trim()}</q>]);
  }

  if (config.specialInstructions.trim()) {
    rows.push(["Notes", config.specialInstructions.trim()]);
  }

  return (
    <div className="rounded-xl border border-rule bg-page/60 p-3.5">
      <p className="section-label mb-2.5">Cake Summary</p>
      <dl className="space-y-1.5 text-[12px]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[86px_1fr] gap-2">
            <dt className="font-semibold text-ink">{label}:</dt>
            <dd className="text-body">{value}</dd>
          </div>
        ))}
      </dl>

      {showPricing ? (
        <div className="mt-3 flex items-baseline justify-between border-t border-rule pt-3">
          <span className="text-[13px] font-semibold text-ink">
            {quote.requiresQuote ? "Estimated Price" : "Total Price"}
          </span>
          <span className="font-display text-[22px] font-semibold text-ink">
            {formatMoney(quote.total)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
