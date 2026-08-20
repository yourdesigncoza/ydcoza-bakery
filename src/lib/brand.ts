import { MARKET, type MarketId } from "./market";

/**
 * The bakery this storefront belongs to.
 *
 * Kept apart from the catalogue so the same builder can be dropped in for a
 * different bakery by editing one file. Bloom & Batter is a fictional studio
 * used for this demonstration build.
 *
 * Currency, locale and tax are not here: they belong to the market the
 * deployment sells into rather than to the bakery, and live in `market.ts` so
 * there is one place to edit and no way for the two to disagree.
 */
export interface Brand {
  name: string;
  longName: string;
  tagline: string;
  blurb: string;
  email: string;
  phone: string;
  address: string;
  /** Where the bakery delivers, shown against the delivery option. */
  deliveryArea: string;
  /** Example mobile number, shown greyed in the field. */
  mobilePlaceholder: string;
  hours: string;
  /** Shown wherever the customer is told what a preview image is and isn't. */
  previewDisclaimer: string;
  inspirationDisclaimer: string;
}

const BLOOM_AND_BATTER: Brand = {
  name: "Bloom & Batter",
  longName: "Bloom & Batter Cake Studio",
  tagline: "Design something beautiful. Made just for you.",
  blurb:
    "A small-batch cake studio specialising in barrel cakes and statement " +
    "celebration bakes, made to order in Johannesburg.",
  email: "hello@bloomandbatter.co.za",
  phone: "+27 11 555 0182",
  address: "14 Grant Avenue, Norwood, Johannesburg",
  deliveryArea: "Within greater Johannesburg",
  mobilePlaceholder: "082 000 0000",
  hours: "Tuesday to Saturday, 9am – 4pm",
  previewDisclaimer:
    "Previews are an artistic impression used to guide the decorator. Your cake " +
    "is handmade in our studio and will differ in the details.",
  inspirationDisclaimer:
    "Inspiration images are used as a guide. The final cake is made in our own " +
    "style and will not be an exact copy.",
};

/**
 * Where the demonstration bakery stands in each market.
 *
 * A real buyer has one address and one phone number, and edits them above.
 * This exists because *Bloom & Batter* is fictional and gets shown to bakers in
 * several countries: a British baker reading "collect from Norwood,
 * Johannesburg" beside a price in pounds stops reading, and rightly so. It is
 * a demonstration concern, not a product one.
 *
 * The numbers are drawn from the ranges each regulator reserves for fiction —
 * Ofcom's 01632 and 07700 900xxx, the ACMA's 5550 xxxx — so no real telephone
 * can ever ring. The street addresses are invented.
 */
export const MARKET_BRAND: Partial<Record<MarketId, Partial<Brand>>> = {
  gb: {
    blurb:
      "A small-batch cake studio specialising in barrel cakes and statement " +
      "celebration bakes, made to order in Harrogate.",
    email: "hello@bloomandbatter.co.uk",
    phone: "+44 1632 960182",
    address: "14 Bramble Lane, Harrogate",
    deliveryArea: "Within 15 miles of Harrogate",
    mobilePlaceholder: "07700 900000",
  },
  au: {
    blurb:
      "A small-batch cake studio specialising in extended-height cakes and " +
      "statement celebration bakes, made to order in Melbourne.",
    email: "hello@bloomandbatter.com.au",
    phone: "+61 3 5550 0182",
    address: "14 Bramble Lane, Fitzroy, Melbourne",
    deliveryArea: "Within greater Melbourne",
    mobilePlaceholder: "0400 000 000",
  },
};

export const BRAND: Brand = {
  ...BLOOM_AND_BATTER,
  ...MARKET_BRAND[MARKET.id as MarketId],
};
