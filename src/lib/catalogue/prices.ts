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

  /**
   * United Kingdom. Researched 2026-08-19 from published price lists of UK
   * independent bakeries.
   *
   * Three entries are zero on purpose, and they are the reason this table
   * cannot be a multiplier. UK bakeries do not price fillings at all — the
   * flavour is the sponge-and-filling pairing — so the four filling surcharges
   * go. Cake boards and boxes are included in the price everywhere, and a
   * premium gift box or an acrylic display box is not something a UK bakery
   * sells. A hand-piped greeting is included, as is the first decorative
   * element, which is why a texture or a drip costs nothing and fondant, at
   * +£20, is the upcharge that actually matters.
   */
  gb: {
    basePrices: {
      "single-barrel": 70,
      "double-barrel": 135,
      bento: 25,
      cupcakes: 35,
      heart: 65,
      sheet: 85,
      wedding: 450,
      mini: 30,
    },
    surcharges: {
      // Flavour. Chocolate is free in the UK and already zero in the catalogue.
      "red-velvet": 5,
      carrot: 5,
      lemon: 5,
      "cookies-cream": 5,
      // Filling. Not priced separately in this market.
      "chocolate-ganache": 0,
      "salted-caramel": 0,
      "berry-compote": 0,
      "cream-cheese": 0,
      // Finish. One decorative element comes with the cake; the second is charged.
      fondant: 20,
      textured: 0,
      drip: 0,
      // Presentation. Included, and not sold as extras here.
      "gift-box": 0,
      "acrylic-box": 0,
      // Add-ons.
      "acrylic-topper": 7,
      "gold-leaf": 10,
      macarons: 15,
      "fresh-berries": 20,
      "edible-image": 7,
      candles: 6,
      "name-plaque": 3,
      "custom-message": 0,
    },
    quoteThreshold: 350,
  },

  /**
   * Australia. Researched 2026-08-19 from ~28 published price lists across all
   * states.
   *
   * Australian bakeries price height as a flat step separate from diameter,
   * which is why the gap between a single tall tier and a double barrel is
   * narrower here than the rand catalogue implies. Prices are GST-inclusive,
   * which is a legal requirement rather than a convention: s48 of the
   * Australian Consumer Law requires a single total price, and the ACCC has
   * said that adding GST at payment time may mislead.
   *
   * Note that `single-barrel` is not an Australian term. They say extended
   * height, tall, or double height. Renaming it for this market is outstanding.
   */
  au: {
    basePrices: {
      "single-barrel": 165,
      "double-barrel": 195,
      bento: 35,
      cupcakes: 60,
      heart: 130,
      sheet: 155,
      wedding: 800,
      mini: 55,
    },
    surcharges: {
      // Flavour. Scaled from the UK pattern; Australian lists price base
      // cakes thoroughly but rarely publish per-flavour surcharges.
      "red-velvet": 10,
      carrot: 10,
      lemon: 10,
      "cookies-cream": 10,
      // Filling. No Australian evidence of separate pricing either.
      "chocolate-ganache": 0,
      "salted-caramel": 0,
      "berry-compote": 0,
      "cream-cheese": 0,
      // Finish. Fondant runs +20-25% on the total.
      fondant: 40,
      textured: 0,
      drip: 10,
      // Presentation. Unlike the UK, a box can be a paid upgrade here — one
      // Canberra bakery charges $7.50 for a board and box on a bento.
      "gift-box": 10,
      "acrylic-box": 20,
      // Add-ons.
      "acrylic-topper": 20,
      "gold-leaf": 15,
      macarons: 20,
      "fresh-berries": 20,
      "edible-image": 15,
      candles: 10,
      "name-plaque": 15,
      "custom-message": 0,
    },
    quoteThreshold: 700,
  },
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
