/**
 * Renders the option tile photography for the cake builder.
 *
 * Every catalogue entry that declares an `image` path gets one generated
 * photograph, written to `public/` at that path. Existing files are skipped, so
 * this is safe to re-run after adding options to the menu; pass `--force` to
 * redraw everything, or an id prefix to redraw part of it.
 *
 *   npx tsx scripts/generate-catalogue-images.ts
 *   npx tsx scripts/generate-catalogue-images.ts --force flavours
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import {
  ADD_ONS,
  CAKE_TYPES,
  FILLINGS,
  FINISHES,
  FLAVOURS,
  PRESENTATIONS,
} from "../src/lib/catalogue/index";

const MODEL = "google/gemini-3.1-flash-image";
const PUBLIC_DIR = join(process.cwd(), "public");

/** Shared look, so the tiles read as one set rather than a stock-photo grab bag. */
const STYLE =
  "Editorial bakery product photograph on a plain warm-ivory background, soft " +
  "diffused studio light, subtle shadow, shallow depth of field, square crop, " +
  "subject centred and filling the frame. Photorealistic, appetising, no text, " +
  "no watermarks, no hands, no people.";

interface Job {
  image: string;
  prompt: string;
}

/** Turn each catalogue section into render jobs with a scene suited to it. */
function collectJobs(): Job[] {
  const jobs: Job[] = [];

  for (const type of CAKE_TYPES) {
    jobs.push({
      image: type.image!,
      prompt:
        `${STYLE} The subject is ${type.promptFragment}, finished in smooth ivory ` +
        `and blush-pink buttercream with restrained elegant decoration.`,
    });
  }

  for (const flavour of FLAVOURS) {
    jobs.push({
      image: flavour.image!,
      prompt:
        `${STYLE} The subject is a single wedge-shaped slice of ${flavour.name} cake ` +
        `standing on a small white plate, cut cleanly so the sponge colour and the ` +
        `cream layers between it are clearly visible.`,
    });
  }

  for (const filling of FILLINGS) {
    jobs.push({
      image: filling.image!,
      prompt:
        `${STYLE} The subject is a generous swirl of ${filling.name} filling in a ` +
        `small white ceramic dish, glossy and freshly made, shot close up.`,
    });
  }

  for (const finish of FINISHES) {
    jobs.push({
      image: finish.image!,
      prompt:
        `${STYLE} The subject is a plain undecorated ivory single-tier barrel cake ` +
        `${finish.promptFragment}, with no toppers or ornaments, so the finish ` +
        `itself is the only thing on show.`,
    });
  }

  for (const presentation of PRESENTATIONS) {
    jobs.push({
      image: presentation.image!,
      prompt:
        `${STYLE} The subject is an empty ${presentation.name.toLowerCase()} for a ` +
        `celebration cake, ${presentation.tagline.toLowerCase()}, shown on its own ` +
        `with no cake inside.`,
    });
  }

  for (const addOn of ADD_ONS) {
    jobs.push({
      image: addOn.image!,
      prompt:
        `${STYLE} The subject is ${addOn.name.toLowerCase()} for decorating a ` +
        `celebration cake — ${addOn.tagline.toLowerCase()} — arranged on its own ` +
        `as a product shot, not attached to a cake.`,
    });
  }

  return jobs;
}

async function renderImage(prompt: string): Promise<Buffer> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  const dataUrl = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl) {
    throw new Error(`No image returned: ${JSON.stringify(payload).slice(0, 400)}`);
  }
  return Buffer.from(dataUrl.split(",", 2)[1], "base64");
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const filter = args.find((arg) => !arg.startsWith("--"));

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  let jobs = collectJobs();
  if (filter) jobs = jobs.filter((job) => job.image.includes(filter));

  console.log(`${jobs.length} tile(s) to consider${filter ? ` matching "${filter}"` : ""}`);

  let rendered = 0;
  for (const [index, job] of jobs.entries()) {
    const target = join(PUBLIC_DIR, job.image);
    if (!force && (await exists(target))) {
      console.log(`  skip  ${job.image}`);
      continue;
    }

    process.stdout.write(`  [${index + 1}/${jobs.length}] ${job.image} … `);
    try {
      const raw = await renderImage(job.prompt);
      // Tiles render at roughly 90px, so 400px covers high-density screens.
      const optimised = await sharp(raw)
        .resize(400, 400, { fit: "cover" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();

      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, optimised);
      rendered += 1;
      console.log(`ok (${Math.round(optimised.length / 1024)}kb)`);
    } catch (error) {
      console.log(`FAILED — ${(error as Error).message}`);
    }
  }

  console.log(`\nRendered ${rendered} tile(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
