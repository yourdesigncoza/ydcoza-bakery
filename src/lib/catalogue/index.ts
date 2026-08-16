import type { CakeConfig, CakeType, Option, Palette, Size } from "./types";

export * from "./types";

/**
 * The bakery's menu. This is the only place option names, prices, imagery and
 * lead times are written down — the builder, the pricing engine, the order
 * brief and the admin dashboard all read from here.
 *
 * Prices are in South African rand, inclusive of VAT.
 */

export const CAKE_TYPES: CakeType[] = [
  {
    id: "single-barrel",
    name: "Single Barrel Cake",
    tagline: "Tall & elegant single tier",
    basePrice: 680,
    image: "/catalogue/types/single-barrel.jpg",
    promptFragment:
      "a tall single-tier barrel cake with straight sharp sides, roughly twice as tall as it is wide",
    leadDays: 4,
  },
  {
    id: "double-barrel",
    name: "Double Barrel Cake",
    tagline: "Two-tier statement cake",
    basePrice: 1290,
    image: "/catalogue/types/double-barrel.jpg",
    promptFragment:
      "a dramatic double barrel cake — two unusually tall tiers with straight vertical " +
      "sides stacked directly on each other, the whole cake far taller than it is wide",
    leadDays: 5,
  },
  {
    id: "bento",
    name: "Bento Cake",
    tagline: "Mini cake in a lunch box",
    basePrice: 280,
    image: "/catalogue/types/bento.jpg",
    promptFragment:
      "a tiny bento cake for one or two people, presented in an open kraft lunch box",
    leadDays: 2,
    sizeIds: ["small"],
    servings: { small: "1–2 servings" },
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    tagline: "Box of handcrafted cupcakes",
    basePrice: 340,
    image: "/catalogue/types/cupcakes.jpg",
    promptFragment:
      "a boxed set of handcrafted cupcakes with tall swirled buttercream tops",
    leadDays: 2,
    servings: { small: "6 cupcakes", standard: "12 cupcakes", large: "24 cupcakes" },
  },
  {
    id: "heart",
    name: "Heart Cake",
    tagline: "Romantic heart-shaped cake",
    basePrice: 620,
    image: "/catalogue/types/heart.jpg",
    promptFragment:
      "a heart-shaped cake with a soft vintage piped border around the top edge",
    leadDays: 3,
  },
  {
    id: "sheet",
    name: "Sheet Cake",
    tagline: "Perfect for large celebrations",
    basePrice: 790,
    image: "/catalogue/types/sheet.jpg",
    promptFragment:
      "one whole uncut rectangular sheet cake — never a slice — shown from a high " +
      "three-quarter angle so its wide flat decorated top and square corners are visible",
    leadDays: 3,
    sizeIds: ["standard", "large"],
    servings: { standard: "20–24 servings", large: "40–50 servings" },
  },
  {
    id: "wedding",
    name: "Wedding Cake",
    tagline: "Multi-tier wedding cake",
    basePrice: 2850,
    image: "/catalogue/types/wedding.jpg",
    promptFragment:
      "an elegant three-tier wedding cake, each tier stacked flush and finished immaculately",
    leadDays: 21,
    sizeIds: ["standard", "large"],
    servings: { standard: "40–60 servings", large: "80–120 servings" },
    quoteOnly: true,
  },
  {
    id: "mini",
    name: "Mini Cake",
    tagline: "Personal-sized mini cake",
    basePrice: 240,
    image: "/catalogue/types/mini.jpg",
    promptFragment: "a small personal-sized celebration cake for one person",
    leadDays: 2,
    sizeIds: ["small"],
    servings: { small: "1–2 servings" },
  },
];

export const SIZES: Size[] = [
  { id: "small", name: "Small", servings: "6–8 servings", multiplier: 0.75 },
  { id: "standard", name: "Standard", servings: "12–16 servings", multiplier: 1 },
  { id: "large", name: "Large", servings: "20–26 servings", multiplier: 1.45 },
];

export const FLAVOURS: Option[] = [
  {
    id: "vanilla",
    name: "Vanilla",
    tagline: "Classic & timeless",
    surcharge: 0,
    image: "/catalogue/flavours/vanilla.jpg",
    promptFragment: "vanilla sponge",
  },
  {
    id: "chocolate",
    name: "Chocolate",
    tagline: "Rich & indulgent",
    surcharge: 0,
    image: "/catalogue/flavours/chocolate.jpg",
    promptFragment: "rich chocolate sponge",
  },
  {
    id: "red-velvet",
    name: "Red Velvet",
    tagline: "Soft & velvety",
    surcharge: 60,
    image: "/catalogue/flavours/red-velvet.jpg",
    promptFragment: "red velvet sponge",
  },
  {
    id: "carrot",
    name: "Carrot",
    tagline: "Warm & spiced",
    surcharge: 70,
    image: "/catalogue/flavours/carrot.jpg",
    promptFragment: "spiced carrot cake",
  },
  {
    id: "lemon",
    name: "Lemon",
    tagline: "Zesty & refreshing",
    surcharge: 40,
    image: "/catalogue/flavours/lemon.jpg",
    promptFragment: "lemon sponge",
  },
  {
    id: "cookies-cream",
    name: "Cookies & Cream",
    tagline: "Crunchy & creamy",
    surcharge: 55,
    image: "/catalogue/flavours/cookies-cream.jpg",
    promptFragment: "cookies and cream sponge",
  },
];

export const FILLINGS: Option[] = [
  {
    id: "buttercream",
    name: "Buttercream",
    tagline: "Smooth & creamy",
    surcharge: 0,
    image: "/catalogue/fillings/buttercream.jpg",
    promptFragment: "vanilla buttercream filling",
  },
  {
    id: "chocolate-ganache",
    name: "Chocolate Ganache",
    tagline: "Rich & decadent",
    surcharge: 55,
    image: "/catalogue/fillings/chocolate-ganache.jpg",
    promptFragment: "dark chocolate ganache filling",
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel",
    tagline: "Sweet & salty",
    surcharge: 65,
    image: "/catalogue/fillings/salted-caramel.jpg",
    promptFragment: "salted caramel filling",
  },
  {
    id: "berry-compote",
    name: "Berry Compote",
    tagline: "Fruity & vibrant",
    surcharge: 70,
    image: "/catalogue/fillings/berry-compote.jpg",
    promptFragment: "mixed berry compote filling",
  },
  {
    id: "cream-cheese",
    name: "Cream Cheese",
    tagline: "Tangy & smooth",
    surcharge: 60,
    image: "/catalogue/fillings/cream-cheese.jpg",
    promptFragment: "cream cheese filling",
  },
];

export const PALETTES: Palette[] = [
  { id: "ivory", name: "Ivory & Cream", hex: "#f1e2d0", promptFragment: "soft ivory and cream" },
  { id: "blush", name: "Blush Pink", hex: "#f2c2b7", promptFragment: "delicate blush pink" },
  { id: "berry", name: "Berry Rose", hex: "#c37778", promptFragment: "deep berry rose" },
  { id: "dusty-rose", name: "Dusty Rose", hex: "#d5ada4", promptFragment: "muted dusty rose" },
  { id: "sage", name: "Sage Green", hex: "#c1bea3", promptFragment: "soft sage green" },
  { id: "cocoa", name: "Rich Cocoa", hex: "#5b3722", promptFragment: "deep chocolate cocoa brown" },
];

export const FINISHES: Option[] = [
  {
    id: "smooth-buttercream",
    name: "Smooth Buttercream",
    tagline: "Clean & classic",
    surcharge: 0,
    image: "/catalogue/finishes/smooth-buttercream.jpg",
    promptFragment: "finished in flawlessly smooth buttercream with sharp clean edges",
  },
  {
    id: "fondant",
    name: "Fondant",
    tagline: "Sleek & polished",
    surcharge: 180,
    image: "/catalogue/finishes/fondant.jpg",
    promptFragment: "covered in immaculate satin fondant with a polished sheen",
  },
  {
    id: "textured",
    name: "Textured Finish",
    tagline: "Modern & artistic",
    surcharge: 90,
    image: "/catalogue/finishes/textured.jpg",
    promptFragment:
      "finished with vertical palette-knife texture ridges running up the sides",
  },
  {
    id: "drip",
    name: "Drip Finish",
    tagline: "Fun & trendy",
    surcharge: 120,
    image: "/catalogue/finishes/drip.jpg",
    promptFragment: "with a glossy ganache drip running down from the top edge",
  },
];

export const OCCASIONS: Option[] = [
  {
    id: "birthday",
    name: "Birthday",
    tagline: "Celebrate another year",
    surcharge: 0,
    promptFragment: "styled for a birthday celebration",
  },
  {
    id: "graduation",
    name: "Graduation",
    tagline: "Mark the achievement",
    surcharge: 0,
    promptFragment: "styled for a graduation, with a fondant graduation cap and scroll",
  },
  {
    id: "baby-shower",
    name: "Baby Shower",
    tagline: "Welcome the little one",
    surcharge: 0,
    promptFragment: "styled for a baby shower, soft and gentle",
  },
  {
    id: "wedding",
    name: "Wedding",
    tagline: "For the big day",
    surcharge: 0,
    promptFragment: "styled for a wedding, refined and understated",
  },
];

export const PRESENTATIONS: Option[] = [
  {
    id: "cake-board",
    name: "Cake Board",
    tagline: "Classic & elegant",
    surcharge: 0,
    image: "/catalogue/presentation/cake-board.jpg",
    promptFragment: "presented on a clean round cake board",
  },
  {
    id: "gift-box",
    name: "Gift Box",
    tagline: "Perfect for gifting",
    surcharge: 85,
    image: "/catalogue/presentation/gift-box.jpg",
    promptFragment: "presented inside an open premium gift box",
  },
  {
    id: "acrylic-box",
    name: "Acrylic Box",
    tagline: "Premium & clear window",
    surcharge: 160,
    image: "/catalogue/presentation/acrylic-box.jpg",
    promptFragment: "presented inside a clear acrylic display box",
  },
];

export const ADD_ONS: Option[] = [
  {
    id: "acrylic-topper",
    name: "Acrylic Topper",
    tagline: "Mirror-gold lettering",
    surcharge: 120,
    image: "/catalogue/addons/acrylic-topper.jpg",
    promptFragment: "a mirror-gold acrylic script topper standing on top",
  },
  {
    id: "gold-leaf",
    name: "Gold Leaf",
    tagline: "Hand-applied flecks",
    surcharge: 80,
    image: "/catalogue/addons/gold-leaf.jpg",
    promptFragment: "hand-applied edible gold leaf flecks scattered across the sides",
  },
  {
    id: "macarons",
    name: "Macarons",
    tagline: "Set of six",
    surcharge: 140,
    image: "/catalogue/addons/macarons.jpg",
    promptFragment: "French macarons arranged on top",
  },
  {
    id: "fresh-berries",
    name: "Fresh Berries",
    tagline: "Seasonal selection",
    surcharge: 100,
    image: "/catalogue/addons/fresh-berries.jpg",
    promptFragment: "fresh seasonal berries clustered on top",
  },
  {
    id: "edible-image",
    name: "Edible Image",
    tagline: "Printed on icing",
    surcharge: 120,
    image: "/catalogue/addons/edible-image.jpg",
    promptFragment: "a printed edible image panel on the front of the cake",
  },
  {
    id: "candles",
    name: "Candles",
    tagline: "Tall tapered set",
    surcharge: 60,
    image: "/catalogue/addons/candles.jpg",
    promptFragment: "slim tapered candles standing on top",
  },
  {
    id: "name-plaque",
    name: "Name Plaque",
    tagline: "Hand-lettered",
    surcharge: 80,
    image: "/catalogue/addons/name-plaque.jpg",
    promptFragment: "a small hand-lettered plaque resting against the base",
  },
  {
    id: "custom-message",
    name: "Custom Message",
    tagline: "Piped by hand",
    surcharge: 50,
    image: "/catalogue/addons/custom-message.jpg",
    promptFragment: "a short hand-piped message across the front",
  },
];

/** Orders above this total are quoted by hand rather than paid for online. */
export const QUOTE_THRESHOLD = 3500;

/** The bakery cannot take an order for collection sooner than this. */
export const MIN_LEAD_DAYS = 2;

/**
 * The cake a visitor starts with.
 *
 * The required choices default to the plainest option in each list, so the
 * price on screen is a real starting price rather than a blank. Add-ons are
 * deliberately empty: they are optional extras that cost money, and pre-ticking
 * them bills the customer for things they never chose.
 */
export const DEFAULT_CONFIG: CakeConfig = {
  typeId: "single-barrel",
  flavourId: "vanilla",
  fillingId: "buttercream",
  paletteId: "ivory",
  sizeId: "standard",
  finishId: "smooth-buttercream",
  occasionId: "birthday",
  presentationId: "cake-board",
  addOnIds: [],
  inscription: "",
  specialInstructions: "",
};

/** Every option list, keyed by the `CakeConfig` field that selects from it. */
const LOOKUPS = {
  typeId: CAKE_TYPES,
  flavourId: FLAVOURS,
  fillingId: FILLINGS,
  paletteId: PALETTES,
  sizeId: SIZES,
  finishId: FINISHES,
  occasionId: OCCASIONS,
  presentationId: PRESENTATIONS,
} as const;

type LookupKey = keyof typeof LOOKUPS;

/** Resolve a stored id back to its catalogue record, falling back to the first entry. */
export function resolve<K extends LookupKey>(
  key: K,
  id: string,
): (typeof LOOKUPS)[K][number] {
  const list = LOOKUPS[key] as readonly { id: string }[];
  const found = list.find((entry) => entry.id === id) ?? list[0];
  return found as (typeof LOOKUPS)[K][number];
}

/** Resolve the selected add-ons, in catalogue order. */
export function resolveAddOns(ids: string[]): Option[] {
  return ADD_ONS.filter((addOn) => ids.includes(addOn.id));
}

/** The sizes offered for a given cake type, with any per-type servings text applied. */
export function sizesFor(typeId: string): Size[] {
  const type = resolve("typeId", typeId);
  return SIZES.filter((size) => !type.sizeIds || type.sizeIds.includes(size.id)).map(
    (size) => ({ ...size, servings: type.servings?.[size.id] ?? size.servings }),
  );
}
