/**
 * Shared shapes for the bakery catalogue.
 *
 * Every option the customer can pick is described by one of these records, and
 * every downstream concern — pricing, the order brief, the AI preview prompt,
 * the admin dashboard — reads from those records rather than restating them.
 */

/** An option the customer can select. `promptFragment` feeds the preview renderer. */
export interface Option {
  id: string;
  name: string;
  /** Short line shown under the option name in the builder. */
  tagline: string;
  /** Added to the order total when selected, in rand. */
  surcharge: number;
  /** Photograph shown on the option tile. */
  image?: string;
  /** Phrase describing this option to the image model. */
  promptFragment: string;
}

/** A cake size. Servings text can be overridden per cake type. */
export interface Size {
  id: string;
  name: string;
  servings: string;
  /** Multiplies the cake type's base price. */
  multiplier: number;
}

/** A colour the cake can be finished in. Rendered as a CSS swatch, not a photo. */
export interface Palette {
  id: string;
  name: string;
  /** Swatch fill. */
  hex: string;
  promptFragment: string;
}

export interface CakeType {
  id: string;
  name: string;
  tagline: string;
  /** Price at the Standard size before any other choice, in rand. */
  basePrice: number;
  image?: string;
  promptFragment: string;
  /** Working days the bakery needs before collection. */
  leadDays: number;
  /** Sizes offered for this type. Defaults to all sizes. */
  sizeIds?: string[];
  /** Per-size servings text, where this type differs from the default. */
  servings?: Record<string, string>;
  /** Complex builds are quoted by hand rather than sold at a listed price. */
  quoteOnly?: boolean;
}

/** A complete cake as configured by the customer. */
export interface CakeConfig {
  typeId: string;
  flavourId: string;
  fillingId: string;
  paletteId: string;
  sizeId: string;
  finishId: string;
  occasionId: string;
  presentationId: string;
  addOnIds: string[];
  /** Wording for a name plaque or piped message. */
  inscription: string;
  specialInstructions: string;
}
