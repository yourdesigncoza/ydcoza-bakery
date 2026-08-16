import { NextResponse } from "next/server";
import sharp from "sharp";
import { DEFAULT_CONFIG } from "@/lib/catalogue";
import type { CakeConfig } from "@/lib/catalogue/types";
import { buildPreviewPrompt } from "@/lib/catalogue/prompt";
import { renderImage, OpenRouterError } from "@/lib/openrouter";
import { findPreview, storePreview } from "@/lib/preview-store";
import { callerKey, rateLimit, sweep } from "@/lib/rate-limit";

/** Renders take around ten seconds, so ask for headroom. */
export const maxDuration = 60;

const PREVIEWS_PER_HOUR = 12;
const HOUR_MS = 60 * 60 * 1000;

/** Trust only the catalogue ids we recognise; the prompt is built from them. */
function sanitise(input: unknown): CakeConfig {
  const raw = (input ?? {}) as Partial<CakeConfig>;
  return {
    ...DEFAULT_CONFIG,
    ...raw,
    addOnIds: Array.isArray(raw.addOnIds) ? raw.addOnIds.map(String).slice(0, 12) : [],
    inscription: String(raw.inscription ?? "").slice(0, 40),
    specialInstructions: String(raw.specialInstructions ?? "").slice(0, 280),
  };
}

export async function POST(request: Request) {
  const config = sanitise(await request.json().catch(() => null));

  // A design we have already drawn costs nothing to serve, so check before
  // spending either the customer's rate limit or the bakery's money.
  const cached = await findPreview(config);
  if (cached) {
    return NextResponse.json({ url: cached, cached: true });
  }

  sweep();
  const limit = rateLimit(callerKey(request), PREVIEWS_PER_HOUR, HOUR_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `That's ${PREVIEWS_PER_HOUR} previews this hour — please try again in ${Math.ceil(
          limit.retryAfter / 60,
        )} minutes.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const raw = await renderImage(buildPreviewPrompt(config), {
      referer: new URL(request.url).origin,
    });

    // Displayed at roughly 420px, so 900px covers high-density screens.
    const optimised = await sharp(raw)
      .resize(900, 900, { fit: "cover" })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();

    const url = await storePreview(config, optimised);
    return NextResponse.json({ url, cached: false });
  } catch (error) {
    const message =
      error instanceof OpenRouterError
        ? "We couldn't draw that one — please try again in a moment."
        : "Something went wrong rendering your preview.";
    console.error("preview render failed", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
