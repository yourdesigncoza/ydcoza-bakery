import { MARKET } from "../market";
import {
  QUOTE_THRESHOLD,
  resolve,
  resolveAddOns,
  sizesFor,
} from "./index";
import type { CakeConfig } from "./types";

export interface LineItem {
  /** Which part of the build this charge came from, e.g. "Finish". */
  group: string;
  label: string;
  amount: number;
}

export interface Quote {
  lines: LineItem[];
  total: number;
  /** True when the build is too complex to sell at a listed price. */
  requiresQuote: boolean;
  /** Why a quote is needed, empty when the cake can be ordered outright. */
  quoteReasons: string[];
  /** Working days the bakery needs before this cake can be collected. */
  leadDays: number;
}

const MONEY = new Intl.NumberFormat(MARKET.locale, {
  style: "currency",
  currency: MARKET.currency,
});

/**
 * Format an amount in the market's currency, e.g. `R1 290.00` in South Africa
 * or `£1,290.00` in the United Kingdom.
 *
 * `Intl` supplies the symbol, its placement and the digits, so a new market
 * needs no code here. Its separators are then swapped for the market's own
 * where the two disagree: CLDR writes en-ZA as `R 1 290,00`, while every price
 * list in the country writes `R1 290.00`.
 */
export function formatMoney(amount: number): string {
  const { group, decimal, currencySpacing } = MARKET.format ?? {};
  return MONEY.formatToParts(amount)
    .map((part) => {
      if (part.type === "group" && group !== undefined) return group;
      if (part.type === "decimal" && decimal !== undefined) return decimal;
      if (part.type === "literal" && currencySpacing !== undefined) return currencySpacing;
      return part.value;
    })
    .join("");
}

/**
 * Price a configured cake.
 *
 * Everything chargeable becomes a line item, so the builder summary, the
 * checkout total, the customer's confirmation and the bakery's production
 * brief are all rendered from one calculation.
 *
 * @param hasInspirationImage whether the customer attached a reference photo,
 *   which always routes the order to a hand-written quote.
 */
export function priceCake(config: CakeConfig, hasInspirationImage = false): Quote {
  const type = resolve("typeId", config.typeId);
  const flavour = resolve("flavourId", config.flavourId);
  const filling = resolve("fillingId", config.fillingId);
  const finish = resolve("finishId", config.finishId);
  const presentation = resolve("presentationId", config.presentationId);
  const addOns = resolveAddOns(config.addOnIds);

  // A type only offers some sizes, so fall back rather than trusting the id.
  const sizes = sizesFor(config.typeId);
  const size = sizes.find((entry) => entry.id === config.sizeId) ?? sizes[0];

  const lines: LineItem[] = [
    {
      group: "Cake",
      label: `${type.name} — ${size.name} (${size.servings})`,
      amount: Math.round(type.basePrice * size.multiplier),
    },
  ];

  const extras: [string, { name: string; surcharge: number }][] = [
    ["Flavour", flavour],
    ["Filling", filling],
    ["Finish", finish],
    ["Presentation", presentation],
  ];
  for (const [group, option] of extras) {
    if (option.surcharge > 0) {
      lines.push({ group, label: option.name, amount: option.surcharge });
    }
  }

  for (const addOn of addOns) {
    lines.push({ group: "Add-on", label: addOn.name, amount: addOn.surcharge });
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  const quoteReasons: string[] = [];
  if (type.quoteOnly) {
    quoteReasons.push(`${type.name} orders are quoted individually`);
  }
  if (total > QUOTE_THRESHOLD) {
    quoteReasons.push(`Orders over ${formatMoney(QUOTE_THRESHOLD)} are confirmed by the bakery`);
  }
  if (hasInspirationImage) {
    quoteReasons.push("An inspiration image needs a decorator to review it");
  }

  return {
    lines,
    total,
    requiresQuote: quoteReasons.length > 0,
    quoteReasons,
    leadDays: type.leadDays,
  };
}

/** The earliest date the bakery can have this cake ready, as `YYYY-MM-DD`. */
export function earliestCollectionDate(config: CakeConfig, from: Date): string {
  const type = resolve("typeId", config.typeId);
  const date = new Date(from);
  date.setDate(date.getDate() + type.leadDays);
  return date.toISOString().slice(0, 10);
}
