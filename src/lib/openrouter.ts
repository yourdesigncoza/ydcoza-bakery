/**
 * Image rendering through OpenRouter.
 *
 * One place knows the model, the request shape and how to dig the image out of
 * the response, so the preview endpoint and the catalogue asset script cannot
 * drift apart.
 */

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Gemini Flash Image: fast, photoreal, roughly R1.30 a render. */
export const IMAGE_MODEL = "google/gemini-3.1-flash-image";

export class OpenRouterError extends Error {}

export async function renderImage(
  prompt: string,
  { signal, referer }: { signal?: AbortSignal; referer?: string } = {},
): Promise<Buffer> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new OpenRouterError("Image rendering is not configured");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Attribution headers OpenRouter uses for its dashboard breakdown.
      ...(referer ? { "HTTP-Referer": referer, "X-Title": "Bloom & Batter Cake Builder" } : {}),
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new OpenRouterError(`Image service returned ${response.status}: ${detail.slice(0, 200)}`);
  }

  const payload = await response.json();
  const dataUrl: string | undefined =
    payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!dataUrl?.includes(",")) {
    throw new OpenRouterError("Image service returned no image");
  }

  return Buffer.from(dataUrl.split(",", 2)[1], "base64");
}
