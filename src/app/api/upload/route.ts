import { NextResponse } from "next/server";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { callerKey, rateLimit, sweep } from "@/lib/rate-limit";

/** Vercel caps a request body at 4.5MB, so stay under it with room to spare. */
const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/**
 * Accepts a customer's inspiration photo.
 *
 * The image is re-encoded rather than stored as uploaded, which strips EXIF
 * (including any location the phone recorded) and caps the dimensions.
 */
export async function POST(request: Request) {
  sweep();
  const limit = rateLimit(`upload:${callerKey(request)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads — please try again later." },
      { status: 429 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Uploads are not configured." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image was received." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is over 4MB — please choose a smaller one." },
      { status: 413 },
    );
  }

  if (!ACCEPTED.includes(file.type)) {
    return NextResponse.json(
      { error: "Please upload a JPEG, PNG or WebP image." },
      { status: 415 },
    );
  }

  try {
    const normalised = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate() // honour EXIF orientation before it is discarded
      .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    // A random suffix keeps a customer's photo from being guessable.
    const blob = await put("inspiration/photo.jpg", normalised, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("inspiration upload failed", error);
    return NextResponse.json({ error: "We couldn't read that image." }, { status: 400 });
  }
}
