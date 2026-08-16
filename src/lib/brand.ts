/**
 * The bakery this storefront belongs to.
 *
 * Kept apart from the catalogue so the same builder can be dropped in for a
 * different bakery by editing one file. Bloom & Batter is a fictional studio
 * used for this demonstration build.
 */
export const BRAND = {
  name: "Bloom & Batter",
  longName: "Bloom & Batter Cake Studio",
  tagline: "Design something beautiful. Made just for you.",
  blurb:
    "A small-batch cake studio specialising in barrel cakes and statement " +
    "celebration bakes, made to order in Johannesburg.",
  email: "hello@bloomandbatter.co.za",
  phone: "+27 11 555 0182",
  address: "14 Grant Avenue, Norwood, Johannesburg",
  hours: "Tuesday to Saturday, 9am – 4pm",
  currency: "ZAR",
  /** Shown wherever the customer is told what a preview image is and isn't. */
  previewDisclaimer:
    "Previews are an artistic impression used to guide the decorator. Your cake " +
    "is handmade in our studio and will differ in the details.",
  inspirationDisclaimer:
    "Inspiration images are used as a guide. The final cake is made in our own " +
    "style and will not be an exact copy.",
} as const;
