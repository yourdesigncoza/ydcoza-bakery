"use client";

import { useActionState, useId, useState } from "react";
import Image from "next/image";
import { placeOrder, type CheckoutState } from "@/app/actions";
import { BRAND } from "@/lib/brand";

interface CheckoutFormProps {
  /** The encoded design, passed straight back to the server action. */
  design: string;
  /** Earliest date the bakery can have this cake ready, `YYYY-MM-DD`. */
  earliestDate: string;
  leadDays: number;
  requiresQuote: boolean;
}

export function CheckoutForm({
  design,
  earliestDate,
  leadDays,
  requiresQuote,
}: CheckoutFormProps) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const [method, setMethod] = useState<"collection" | "delivery">("collection");
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formId = useId();

  async function uploadInspiration(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Upload failed");
      setInspirationUrl(payload.url);
    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="design" value={design} />
      <input type="hidden" name="inspirationUrl" value={inspirationUrl} />
      {/* The rendered preview is recovered server-side from the design hash. */}

      <Fieldset legend="Your details">
        <Field
          id={`${formId}-name`}
          name="name"
          label="Full name"
          autoComplete="name"
          error={state.fieldErrors?.name}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id={`${formId}-email`}
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            error={state.fieldErrors?.email}
            required
          />
          <Field
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            label="Mobile number"
            autoComplete="tel"
            placeholder="082 000 0000"
            error={state.fieldErrors?.phone}
            required
          />
        </div>
      </Fieldset>

      <Fieldset legend="When and where">
        <div>
          <span className="mb-2 block text-[12px] font-semibold text-ink">
            Collection or delivery
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["collection", "delivery"] as const).map((option) => (
              <label
                key={option}
                className={`tile-base cursor-pointer px-3 py-2.5 text-[13px] font-medium capitalize ${
                  method === option ? "tile-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={option}
                  checked={method === option}
                  onChange={() => setMethod(option)}
                  className="sr-only"
                />
                <span className="text-ink">{option}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-muted">
                  {option === "collection" ? BRAND.address : "Within greater Johannesburg"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {method === "delivery" ? (
          <Field
            id={`${formId}-address`}
            name="deliveryAddress"
            label="Delivery address"
            autoComplete="street-address"
            error={state.fieldErrors?.deliveryAddress}
            required
          />
        ) : null}

        <Field
          id={`${formId}-date`}
          name="requiredDate"
          type="date"
          label="Date you need it"
          min={earliestDate}
          defaultValue={earliestDate}
          hint={`This design needs ${leadDays} days' notice.`}
          error={state.fieldErrors?.requiredDate}
          required
        />
      </Fieldset>

      <Fieldset legend="Inspiration photo (optional)">
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadInspiration(file);
            }}
            className="block w-full text-[12px] text-body file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-accent hover:file:bg-note"
          />
          {uploading ? (
            <p className="mt-2 text-[11.5px] text-muted">Uploading…</p>
          ) : null}
          {uploadError ? (
            <p className="mt-2 text-[11.5px] text-accent">{uploadError}</p>
          ) : null}
          {inspirationUrl ? (
            <div className="mt-3 flex items-center gap-3">
              <Image
                src={inspirationUrl}
                alt="Your inspiration photo"
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setInspirationUrl("")}
                className="text-[12px] font-medium text-accent underline"
              >
                Remove
              </button>
            </div>
          ) : null}
          <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
            {BRAND.inspirationDisclaimer} Attaching one moves your order to a hand-written
            quote so a decorator can look at it first.
          </p>
        </div>
      </Fieldset>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-note px-3 py-2.5 text-[12.5px] text-accent">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || uploading}
        className="w-full rounded-xl bg-cocoa px-4 py-3.5 text-[14px] font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Placing your order…"
          : requiresQuote || inspirationUrl
            ? "Send quote request"
            : "Continue to payment"}
      </button>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-[20px] font-semibold text-ink">{legend}</legend>
      {children}
    </fieldset>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
}

function Field({ id, name, label, hint, error, ...input }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full rounded-lg border bg-card px-3 py-2.5 text-[13px] text-ink placeholder:text-muted focus:outline-none ${
          error ? "border-accent" : "border-rule focus:border-accent"
        }`}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[11.5px] text-accent">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11.5px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
