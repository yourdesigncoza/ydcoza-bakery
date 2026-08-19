import type { CakeConfig } from "../catalogue/types";
import type { LineItem } from "../catalogue/pricing";

/**
 * Where an order sits in the bakery's workflow.
 *
 * Paid orders and quote requests enter at different points but share the rest
 * of the pipeline, so the board and the customer's tracking page read one list.
 */
export const ORDER_STATUSES = [
  "awaiting_payment",
  "quote_requested",
  "quoted",
  "confirmed",
  "in_production",
  "ready",
  "collected",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  quote_requested: "Quote requested",
  quoted: "Quote sent",
  confirmed: "Confirmed",
  in_production: "In the kitchen",
  ready: "Ready for collection",
  collected: "Collected",
  cancelled: "Cancelled",
};

/** What the customer sees on the tracking page for each status. */
export const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  awaiting_payment: "We're holding your design until payment comes through.",
  quote_requested: "Our decorator is pricing your design and will be in touch.",
  quoted: "We've sent your quote — reply to accept and we'll book it in.",
  confirmed: "Booked in. We'll start baking closer to your date.",
  in_production: "Your cake is being made right now.",
  ready: "Your cake is finished and waiting for you.",
  collected: "Collected — we hope it was wonderful.",
  cancelled: "This order was cancelled.",
};

/** The stages shown on the customer's progress tracker, in order. */
export const TRACKED_STATUSES: OrderStatus[] = [
  "confirmed",
  "in_production",
  "ready",
  "collected",
];

export type FulfilmentMethod = "collection" | "delivery";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  method: FulfilmentMethod;
  /** ISO date, `YYYY-MM-DD`. */
  requiredDate: string;
  /** Required when the method is delivery. */
  deliveryAddress: string;
}

export interface Order {
  /** Short human reference the customer quotes, e.g. `BB-7QK42`. */
  reference: string;
  status: OrderStatus;
  config: CakeConfig;
  customer: CustomerDetails;
  lines: LineItem[];
  total: number;
  /** True when the build was routed to a hand-written quote rather than sold. */
  requiresQuote: boolean;
  /** Blob URL of the rendered impression, when one was generated. */
  previewUrl: string | null;
  /** Blob URL of a reference photo the customer attached. */
  inspirationUrl: string | null;
  /** The gateway's payment id, once a payment has been confirmed. */
  paymentId: string | null;
  /** Free-text notes the bakery adds while working the order. */
  bakeryNotes: string;
  createdAt: string;
  updatedAt: string;
}

/** Everything needed to open an order, before a reference has been assigned. */
export type NewOrder = Omit<
  Order,
  "reference" | "status" | "paymentId" | "bakeryNotes" | "createdAt" | "updatedAt"
>;
