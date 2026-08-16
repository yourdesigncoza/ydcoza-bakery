import { DEFAULT_CONFIG } from "./catalogue";
import type { CakeConfig } from "./catalogue/types";

/**
 * Carries a configured cake between pages in the URL.
 *
 * A design is nothing but catalogue ids and two short strings, so encoding it
 * into the link keeps the builder stateless — a customer can bookmark a design
 * or send it to someone else, and nothing needs storing until they order.
 *
 * The builder encodes links in the browser and pages decode them on the
 * server, so this uses `btoa`/`atob` and `TextEncoder`, which behave the same
 * in both. Node's `Buffer` does not exist in the browser bundle.
 */

const VERSION = "1";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const padded = encoded
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeConfig(config: CakeConfig): string {
  return `${VERSION}.${toBase64Url(JSON.stringify(config))}`;
}

/** Decode a design from a link, falling back to the default on anything unexpected. */
export function decodeConfig(encoded: string | undefined | null): CakeConfig {
  if (!encoded) return DEFAULT_CONFIG;

  const separator = encoded.indexOf(".");
  const version = encoded.slice(0, separator);
  const payload = encoded.slice(separator + 1);
  if (version !== VERSION || !payload) return DEFAULT_CONFIG;

  try {
    const parsed = JSON.parse(fromBase64Url(payload));
    // Merge over the default so a link written before a field existed still works.
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      addOnIds: Array.isArray(parsed.addOnIds) ? parsed.addOnIds.map(String) : [],
      inscription: String(parsed.inscription ?? ""),
      specialInstructions: String(parsed.specialInstructions ?? ""),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
