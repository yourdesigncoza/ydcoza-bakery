import { createHash } from "node:crypto";
import { head, put } from "@vercel/blob";
import type { CakeConfig } from "./catalogue/types";
import { previewCacheKey } from "./catalogue/prompt";

/**
 * Storage for rendered cake previews.
 *
 * Drawing a cake costs real money, so every render is filed under a hash of
 * the design that produced it. Two customers who build the same cake — or one
 * customer who returns to a saved link — are served the stored image instead
 * of paying to draw it again.
 *
 * Without a Blob token configured the store degrades to pass-through, which
 * keeps local development working without cloud credentials.
 */

const PREFIX = "previews";

export function previewPath(config: CakeConfig): string {
  const hash = createHash("sha256").update(previewCacheKey(config)).digest("hex").slice(0, 32);
  return `${PREFIX}/${hash}.jpg`;
}

function isConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** The URL of an already-rendered preview, or null if this design is new. */
export async function findPreview(config: CakeConfig): Promise<string | null> {
  if (!isConfigured()) return null;
  try {
    const blob = await head(previewPath(config));
    return blob.url;
  } catch {
    // `head` throws when the blob does not exist, which is the common path.
    return null;
  }
}

/** File a freshly rendered preview and return its public URL. */
export async function storePreview(config: CakeConfig, image: Buffer): Promise<string> {
  if (!isConfigured()) {
    return `data:image/jpeg;base64,${image.toString("base64")}`;
  }

  const blob = await put(previewPath(config), image, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    // Previews are immutable — the path already encodes the design.
    cacheControlMaxAge: 60 * 60 * 24 * 365,
    allowOverwrite: true,
  });
  return blob.url;
}
