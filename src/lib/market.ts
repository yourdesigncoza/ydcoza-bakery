/**
 * The market this deployment sells into.
 *
 * Every bakery running this storefront gets its own deployment, so exactly one
 * market is live at a time. It is picked at build time by `NEXT_PUBLIC_MARKET`
 * and never switched in the browser — there is no currency picker and nothing
 * anywhere converts between currencies. A market carries its own prices
 * (`catalogue/prices.ts`); a British cake is priced by a British baker, not by
 * running the rand figure through an exchange rate.
 *
 * Note that payment handover is PayFast, which is South African and settles in
 * rand only. A deployment outside South Africa needs its own gateway before it
 * can take money, whatever this file says.
 */

/**
 * Where the market's house style differs from what `Intl` produces for its
 * locale. Omit and the locale's own conventions stand.
 */
export interface MarketFormat {
  /** Thousands separator. */
  group?: string;
  /** Decimal separator. */
  decimal?: string;
  /** What sits between the currency symbol and the digits. */
  currencySpacing?: string;
}

export interface MarketTax {
  /** What the tax is called on a price — "VAT", "GST", "Tax". */
  label: string;
  /** Fraction of the price that is tax, e.g. `0.15`. Zero until the buyer sets it. */
  rate: number;
  /** True when the catalogue prices already contain the tax. */
  inclusive: boolean;
}

export interface Market {
  /** The value of `NEXT_PUBLIC_MARKET` that selects this market. */
  id: string;
  /** Formatting locale, used for both money and dates. */
  locale: string;
  /** ISO 4217 code the catalogue prices are quoted in. */
  currency: string;
  format?: MarketFormat;
  tax: MarketTax;
}

/**
 * Every market the storefront can be built for.
 *
 * Only South Africa carries a tax rate, because only South Africa has one
 * written down already — the catalogue prices were quoted VAT-inclusive from
 * the start. What tax a cake attracts elsewhere, and whether local practice is
 * to advertise prices with it in or out, are questions for the buyer and their
 * accountant. The fields are here to be filled in, not to hand out tax advice.
 */
export const MARKETS = {
  za: {
    id: "za",
    locale: "en-ZA",
    currency: "ZAR",
    /** Every menu in the country writes `R1 290.00`; CLDR's en-ZA does not. */
    format: { group: " ", decimal: ".", currencySpacing: "" },
    tax: { label: "VAT", rate: 0.15, inclusive: true },
  },
  gb: {
    id: "gb",
    locale: "en-GB",
    currency: "GBP",
    tax: { label: "VAT", rate: 0, inclusive: true },
  },
  ie: {
    id: "ie",
    locale: "en-IE",
    currency: "EUR",
    tax: { label: "VAT", rate: 0, inclusive: true },
  },
  au: {
    id: "au",
    locale: "en-AU",
    currency: "AUD",
    tax: { label: "GST", rate: 0, inclusive: true },
  },
  nz: {
    id: "nz",
    locale: "en-NZ",
    currency: "NZD",
    tax: { label: "GST", rate: 0, inclusive: true },
  },
  ca: {
    id: "ca",
    locale: "en-CA",
    currency: "CAD",
    tax: { label: "Tax", rate: 0, inclusive: true },
  },
} as const satisfies Record<string, Market>;

export type MarketId = keyof typeof MARKETS;

/** The market a deployment gets when `NEXT_PUBLIC_MARKET` says nothing. */
export const DEFAULT_MARKET_ID: MarketId = "za";

/**
 * Resolve the configured market.
 *
 * `NEXT_PUBLIC_MARKET` is inlined by Next at build time, so an unrecognised
 * value fails the build rather than quietly shipping a rand storefront to a
 * bakery in Cork.
 */
function selectMarket(): Market {
  const configured = process.env.NEXT_PUBLIC_MARKET?.trim().toLowerCase();
  if (!configured) {
    return MARKETS[DEFAULT_MARKET_ID];
  }
  if (!(configured in MARKETS)) {
    throw new Error(
      `NEXT_PUBLIC_MARKET is "${configured}", which is not a market. ` +
        `Use one of: ${Object.keys(MARKETS).join(", ")}.`,
    );
  }
  return MARKETS[configured as MarketId];
}

/** The one market this build sells into. */
export const MARKET: Market = selectMarket();
