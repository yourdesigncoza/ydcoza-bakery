import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";

/**
 * PayFast payment initiation and Instant Transaction Notification handling.
 *
 * The demo runs against PayFast's sandbox, which accepts the published test
 * merchant credentials and never moves real money. Pointing at live PayFast is
 * a matter of setting `PAYFAST_LIVE=true` and supplying real credentials.
 *
 * @see https://developers.payfast.co.za/docs
 */

const SANDBOX = {
  process: "https://sandbox.payfast.co.za/eng/process",
  validate: "https://sandbox.payfast.co.za/eng/query/validate",
  /** PayFast's published sandbox merchant — safe to commit, moves no money. */
  merchantId: "10000100",
  merchantKey: "46f0cd694581a",
  /**
   * The sandbox merchant has a passphrase set, and signing without it is
   * rejected as a mismatch — which reads like a broken algorithm rather than a
   * missing credential, so it is defaulted here.
   */
  passphrase: "jt7NOE43FZPn",
};

const LIVE = {
  process: "https://www.payfast.co.za/eng/process",
  validate: "https://www.payfast.co.za/eng/query/validate",
};

/** Hosts PayFast sends notifications from; anything else is rejected. */
const NOTIFY_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

export function isLive(): boolean {
  return process.env.PAYFAST_LIVE === "true";
}

export function config() {
  const live = isLive();
  return {
    live,
    processUrl: live ? LIVE.process : SANDBOX.process,
    validateUrl: live ? LIVE.validate : SANDBOX.validate,
    merchantId: process.env.PAYFAST_MERCHANT_ID ?? SANDBOX.merchantId,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY ?? SANDBOX.merchantKey,
    passphrase: process.env.PAYFAST_PASSPHRASE ?? (live ? "" : SANDBOX.passphrase),
  };
}

/**
 * Encode exactly as PHP's `urlencode` does.
 *
 * PayFast builds its signature server-side in PHP, so anything encoded even
 * slightly differently — spaces, brackets, apostrophes — produces a mismatched
 * MD5 and the payment is rejected.
 */
function phpUrlencode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
}

/**
 * Sign a set of PayFast fields.
 *
 * Order matters: the signature is taken over the fields in the order given,
 * which for a payment request is the order PayFast documents, and for an ITN
 * is the order the fields arrived in.
 */
export function signature(fields: [string, string][], passphrase: string): string {
  const parts = fields
    .filter(([name, value]) => name !== "signature" && value !== "")
    .map(([name, value]) => `${name}=${phpUrlencode(value.trim())}`);

  if (passphrase) {
    parts.push(`passphrase=${phpUrlencode(passphrase.trim())}`);
  }

  return createHash("md5").update(parts.join("&")).digest("hex");
}

/**
 * Reduce free text to what PayFast will hash unchanged.
 *
 * PayFast sanitises `item_name` and `item_description` on its side before
 * regenerating the signature, so anything it strips — punctuation like em
 * dashes and ampersands — makes a correctly-computed signature look wrong.
 * Sending only plain ASCII keeps both sides hashing the same string.
 */
function plainText(value: string, maxLength: number): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s.,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export interface PaymentRequest {
  reference: string;
  amount: number;
  itemName: string;
  itemDescription: string;
  firstName: string;
  lastName: string;
  email: string;
  origin: string;
}

/**
 * The fields to POST to PayFast, signed and in the documented order.
 *
 * Returned rather than posted directly because the customer's browser has to
 * make the request — PayFast renders its own payment page.
 */
export function paymentFields(request: PaymentRequest): [string, string][] {
  const settings = config();

  // PayFast cannot reach a developer machine, so it is sent no notify_url
  // locally; the order is confirmed by hand from the board instead.
  const reachable = !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/.test(request.origin);

  const fields: [string, string][] = [
    ["merchant_id", settings.merchantId],
    ["merchant_key", settings.merchantKey],
    ["return_url", `${request.origin}/orders/${request.reference}?paid=1`],
    ["cancel_url", `${request.origin}/orders/${request.reference}?cancelled=1`],
    ...(reachable
      ? ([["notify_url", `${request.origin}/api/payfast/notify`]] as [string, string][])
      : []),
    ["name_first", plainText(request.firstName, 100)],
    ["name_last", plainText(request.lastName, 100)],
    ["email_address", request.email],
    ["m_payment_id", request.reference],
    ["amount", request.amount.toFixed(2)],
    ["item_name", plainText(request.itemName, 100)],
    ["item_description", plainText(request.itemDescription, 255)],
  ];

  fields.push(["signature", signature(fields, settings.passphrase)]);
  return fields;
}

/**
 * Check that a notification really came from PayFast and describes what we
 * expect, following the four checks PayFast requires before an order may be
 * treated as paid.
 */
export async function verifyNotification(
  body: string,
  expectedAmount: number,
  sourceIp: string | null,
): Promise<{ valid: boolean; reason?: string }> {
  const settings = config();
  const params = new URLSearchParams(body);
  const fields: [string, string][] = [...params.entries()];

  // 1. The signature must match the posted data.
  const provided = params.get("signature") ?? "";
  if (signature(fields, settings.passphrase) !== provided) {
    return { valid: false, reason: "signature mismatch" };
  }

  // 2. The notification must originate from PayFast.
  if (sourceIp && !(await isPayFastHost(sourceIp))) {
    return { valid: false, reason: `unrecognised source address ${sourceIp}` };
  }

  // 3. The amount paid must match what the order is for.
  const paid = Number.parseFloat(params.get("amount_gross") ?? "0");
  if (Math.abs(paid - expectedAmount) > 0.01) {
    return { valid: false, reason: `amount ${paid} does not match ${expectedAmount}` };
  }

  // 4. PayFast itself must confirm the notification is genuine.
  const confirmation = await fetch(settings.validateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const verdict = (await confirmation.text()).trim();
  if (!verdict.startsWith("VALID")) {
    return { valid: false, reason: `PayFast returned "${verdict}"` };
  }

  return { valid: true };
}

/** Resolve PayFast's notification hosts and check the caller is one of them. */
async function isPayFastHost(sourceIp: string): Promise<boolean> {
  const resolved = await Promise.all(
    NOTIFY_HOSTS.map((host) =>
      lookup(host, { all: true }).catch(() => [] as { address: string }[]),
    ),
  );
  return resolved.flat().some((entry) => entry.address === sourceIp);
}
