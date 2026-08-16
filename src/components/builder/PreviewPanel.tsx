"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import type { CakeConfig } from "@/lib/catalogue/types";
import { formatRand, type Quote } from "@/lib/catalogue/pricing";
import { CakeSummary } from "@/components/CakeSummary";
import { SparkleIcon } from "@/components/icons";

/**
 * The right-hand column: notes, the running total, and an AI impression of the
 * cake the customer has designed.
 *
 * Rendering a preview costs real money, so it is only ever drawn on request,
 * and the button disables itself while the current design already matches
 * what is on screen.
 */
export function PreviewPanel({
  config,
  quote,
  onInstructionsChange,
}: {
  config: CakeConfig;
  quote: Quote;
  onInstructionsChange: (value: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string>("");
  /** The design the on-screen preview was drawn from. */
  const [previewOf, setPreviewOf] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const designKey = JSON.stringify(config);
  const isStale = preview !== null && previewOf !== designKey;

  useEffect(() => () => abortRef.current?.abort(), []);

  async function generate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Preview failed");

      setPreview(payload.url);
      setPreviewOf(designKey);
      setStatus("idle");
    } catch (caught) {
      if ((caught as Error).name === "AbortError") return;
      setError((caught as Error).message);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="special-instructions" className="section-label mb-2 block">
          Special Instructions
        </label>
        <textarea
          id="special-instructions"
          rows={3}
          maxLength={280}
          value={config.specialInstructions}
          onChange={(event) => onInstructionsChange(event.target.value)}
          placeholder="Share any special requests, colour preferences, or details we should know…"
          className="w-full resize-none rounded-lg border border-rule bg-card px-3 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-ink">
          {quote.requiresQuote ? "Estimated Total" : "Estimated Total"}
        </span>
        <span className="font-display text-[26px] font-semibold text-ink">
          {formatRand(quote.total)}
        </span>
      </div>

      {quote.requiresQuote ? (
        <div className="rounded-lg bg-note px-3 py-2.5 text-[11.5px] leading-relaxed text-body">
          <p className="font-semibold text-ink">This design is quoted by hand.</p>
          <ul className="mt-1 space-y-0.5">
            {quote.quoteReasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        onClick={generate}
        disabled={status === "loading" || (preview !== null && !isStale)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cocoa px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45"
      >
        <SparkleIcon className="h-4 w-4" />
        {status === "loading"
          ? "Rendering your cake…"
          : preview === null
            ? "Generate Cake Preview"
            : isStale
              ? "Update preview"
              : "Preview is up to date"}
      </button>

      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-rule bg-page">
        {preview ? (
          <Image
            src={preview}
            alt="Artistic impression of your cake"
            fill
            sizes="(max-width: 1024px) 100vw, 420px"
            className={`object-cover transition ${isStale ? "opacity-45 saturate-50" : ""}`}
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <p className="text-[12px] leading-relaxed text-muted">
              {status === "loading"
                ? "Drawing your cake — this takes about ten seconds."
                : "Your cake preview will appear here."}
            </p>
          </div>
        )}

        {status === "loading" ? (
          <div className="absolute inset-0 grid place-items-center bg-page/70 backdrop-blur-sm">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-rule-strong border-t-accent" />
          </div>
        ) : null}

        {isStale && status !== "loading" ? (
          <p className="absolute inset-x-0 bottom-0 bg-ink/85 px-3 py-1.5 text-center text-[11px] font-medium text-white">
            You&rsquo;ve changed the design since this was drawn
          </p>
        ) : null}
      </div>

      {status === "error" ? (
        <p role="alert" className="text-[11.5px] text-accent">
          {error}
        </p>
      ) : null}

      {preview ? (
        <p className="text-[10.5px] leading-relaxed text-muted">{BRAND.previewDisclaimer}</p>
      ) : null}

      <CakeSummary config={config} quote={quote} />
    </div>
  );
}
