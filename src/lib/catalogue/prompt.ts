import { resolve, resolveAddOns } from "./index";
import type { CakeConfig } from "./types";

/** House photographic style, so every preview looks like it came from one shoot. */
const HOUSE_STYLE =
  "Professional bakery product photograph, editorial food photography, soft warm " +
  "natural window light, neutral out-of-focus background, shallow depth of field, " +
  "square crop, the cake centred and shot slightly above eye level. " +
  "Photorealistic, no text overlays, no watermarks, no people.";

/**
 * Describe a configured cake to an image model.
 *
 * The wording is assembled from the catalogue's `promptFragment` values, so
 * adding an option to the menu teaches the renderer about it at the same time.
 */
export function buildPreviewPrompt(config: CakeConfig): string {
  const type = resolve("typeId", config.typeId);
  const palette = resolve("paletteId", config.paletteId);
  const finish = resolve("finishId", config.finishId);
  const occasion = resolve("occasionId", config.occasionId);
  const presentation = resolve("presentationId", config.presentationId);
  const addOns = resolveAddOns(config.addOnIds);

  const sentences = [
    `${HOUSE_STYLE}`,
    `The subject is ${type.promptFragment}, ${finish.promptFragment}, ` +
      `in ${palette.promptFragment}, ${occasion.promptFragment}, ` +
      `${presentation.promptFragment}.`,
  ];

  if (addOns.length > 0) {
    sentences.push(`Decorated with ${joinWords(addOns.map((a) => a.promptFragment))}.`);
  }

  // Only mention wording when the customer asked for something that carries it.
  const carriesWording = config.addOnIds.some((id) =>
    ["acrylic-topper", "name-plaque", "custom-message"].includes(id),
  );
  if (carriesWording && config.inscription.trim()) {
    sentences.push(
      `The wording reads exactly "${config.inscription.trim()}", spelled correctly ` +
        `in elegant script.`,
    );
  }

  if (config.specialInstructions.trim()) {
    sentences.push(`Additional direction: ${config.specialInstructions.trim()}.`);
  }

  return sentences.join(" ");
}

/** Join a list into readable prose: "a, b and c". */
function joinWords(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * A stable key for a configuration, used to reuse an already-rendered preview
 * instead of paying the image model to draw the same cake twice.
 */
export function previewCacheKey(config: CakeConfig): string {
  const parts = [
    config.typeId,
    config.paletteId,
    config.finishId,
    config.occasionId,
    config.presentationId,
    [...config.addOnIds].sort().join("+"),
    config.inscription.trim().toLowerCase(),
    config.specialInstructions.trim().toLowerCase(),
  ];
  return parts.join("|");
}
