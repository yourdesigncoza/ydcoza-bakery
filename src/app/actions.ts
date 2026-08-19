"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { decodeConfig } from "@/lib/config-codec";
import { priceCake } from "@/lib/catalogue/pricing";
import { resolve } from "@/lib/catalogue";
import { MARKET } from "@/lib/market";
import { getOrderStore } from "@/lib/orders/store";
import { findPreview } from "@/lib/preview-store";
import type { CustomerDetails, FulfilmentMethod } from "@/lib/orders/types";

export interface CheckoutState {
  error?: string;
  /** Field-level messages keyed by input name. */
  fieldErrors?: Record<string, string>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Turn a completed checkout form into an order.
 *
 * The price is recalculated here from the design rather than trusted from the
 * form, so a tampered total cannot reach PayFast.
 */
export async function placeOrder(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const design = String(formData.get("design") ?? "");
  const config = decodeConfig(design);

  const inspirationUrl = String(formData.get("inspirationUrl") ?? "").trim() || null;

  // Previews are filed under a hash of the design, so if the customer rendered
  // one in the builder it can be recovered here rather than passed through the
  // form where it could be swapped for any other URL.
  const previewUrl = await findPreview(config);

  const customer: CustomerDetails = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    method: String(formData.get("method") ?? "collection") as FulfilmentMethod,
    requiredDate: String(formData.get("requiredDate") ?? ""),
    deliveryAddress: String(formData.get("deliveryAddress") ?? "").trim(),
  };

  const quote = priceCake(config, Boolean(inspirationUrl));

  const fieldErrors: Record<string, string> = {};
  if (customer.name.length < 2) fieldErrors.name = "Please give us your name.";
  if (!EMAIL_PATTERN.test(customer.email)) fieldErrors.email = "That email doesn't look right.";
  if (customer.phone.replace(/\D/g, "").length < 9) {
    fieldErrors.phone = "Please give us a number we can reach you on.";
  }
  if (customer.method === "delivery" && customer.deliveryAddress.length < 8) {
    fieldErrors.deliveryAddress = "We need a delivery address.";
  }

  // The bakery cannot bake faster than the cake's lead time.
  const earliest = new Date();
  earliest.setHours(0, 0, 0, 0);
  earliest.setDate(earliest.getDate() + quote.leadDays);
  const requested = new Date(`${customer.requiredDate}T00:00:00`);

  if (Number.isNaN(requested.getTime())) {
    fieldErrors.requiredDate = "Please choose a date.";
  } else if (requested < earliest) {
    const type = resolve("typeId", config.typeId);
    fieldErrors.requiredDate =
      `${type.name} orders need ${quote.leadDays} days — the earliest we can manage is ` +
      earliest.toLocaleDateString(MARKET.locale, { day: "numeric", month: "long" });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, error: "Please check the highlighted fields." };
  }

  const order = await getOrderStore().create({
    config,
    customer,
    lines: quote.lines,
    total: quote.total,
    requiresQuote: quote.requiresQuote,
    previewUrl,
    inspirationUrl,
  });

  // Quote requests wait for the bakery; priced orders go straight to payment.
  redirect(quote.requiresQuote ? `/orders/${order.reference}` : `/pay/${order.reference}`);
}

/** The origin the customer reached us on, used to build PayFast return URLs. */
export async function currentOrigin(): Promise<string> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
