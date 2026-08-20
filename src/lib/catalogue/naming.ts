import { MARKET, type MarketId } from "../market";
import { withOverrides } from "./overrides";
import type { CakeType } from "./types";

/**
 * What each market calls things.
 *
 * The catalogue names cakes the way a South African bakery does. Elsewhere the
 * same cake can go by a different word, and the name on the tile is the first
 * thing a customer reads — a cake they do not recognise is one they do not
 * order. A market states only the names it changes, keyed by catalogue id.
 *
 * Wording only. Ids, images, prompt fragments and prices are untouched, so a
 * renamed cake is still the same cake everywhere downstream — in the order
 * brief, the admin board and the price tables.
 */
export const MARKET_TYPE_NAMES: Partial<Record<MarketId, Record<string, string>>> = {
  /**
   * Australia. "Barrel" is not the Australian word for a single tall tier;
   * bakeries there say extended height, tall, or double height. "Double barrel"
   * *is* used and understood, so it stays as it is. Researched 2026-08-19
   * across published price lists in every state.
   */
  au: {
    "single-barrel": "Extended Height Cake",
  },
};

/** Apply the market's names to a list of cake types. */
export function withMarketTypeNames(types: CakeType[]): CakeType[] {
  return withOverrides(types, "name", MARKET_TYPE_NAMES[MARKET.id as MarketId]);
}
