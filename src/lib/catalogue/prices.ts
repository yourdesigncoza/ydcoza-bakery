import { MARKET, type MarketId } from "../market";
import type { CakeType, Option } from "./types";

/**
 * What each market charges.
 *
 * The catalogue is written in rand. Another market's prices are not those
 * figures converted — a British bakery's price for a barrel cake comes from its
 * own ingredients, hours and high street, and has nothing to do with the rand
 * price at today's rate. So each market states its own numbers here, keyed by
 * the catalogue id they replace, and anything left out keeps the rand figure.
 */
export interface MarketPrices {
  /** Base price at Standard size, by cake type id. */
  basePrices?: Record<string, number>;
  /** Surcharge, by option id — flavours, fillings, finishes, presentation, add-ons. */
  surcharges?: Record<string, number>;
  /** Total above which the bakery quotes by hand rather than selling online. */
  quoteThreshold?: number;
}

/**
 * The price tables.
 *
 * Only the markets that have been researched appear. The figures for the United
 * Kingdom, Ireland, Australia, New Zealand and Canada are being gathered from
 * what bakeries in each country actually charge and will be filled in here; a
 * market with no entry falls back to the rand figures, which is visibly wrong
 * and meant to be.
 */
export const MARKET_PRICES: Partial<Record<MarketId, MarketPrices>> = {
  // za — the catalogue itself is the South African price list.
};

const PRICES: MarketPrices = MARKET_PRICES[MARKET.id as MarketId] ?? {};

/** Apply the market's base prices to a list of cake types. */
export function withMarketBasePrices(types: CakeType[]): CakeType[] {
  const overrides = PRICES.basePrices;
  if (!overrides) return types;
  return types.map((type) =>
    type.id in overrides ? { ...type, basePrice: overrides[type.id] } : type,
  );
}

/** Apply the market's surcharges to a list of options. */
export function withMarketSurcharges(options: Option[]): Option[] {
  const overrides = PRICES.surcharges;
  if (!overrides) return options;
  return options.map((option) =>
    option.id in overrides ? { ...option, surcharge: overrides[option.id] } : option,
  );
}

/** The market's quote threshold, falling back to the rand one. */
export function withMarketThreshold(rands: number): number {
  return PRICES.quoteThreshold ?? rands;
}
