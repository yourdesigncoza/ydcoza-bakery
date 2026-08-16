import type { NewOrder, Order, OrderStatus } from "./types";

/**
 * Persistence for orders.
 *
 * Orders carry the customer's name, email, phone and delivery address, so they
 * need somewhere private — the project's Blob store is public and is only used
 * for rendered previews and reference photos.
 *
 * The rest of the application talks to this interface, so the backing store can
 * be swapped without touching the checkout, the payment handler or the admin
 * board.
 */
export interface OrderStore {
  create(order: NewOrder): Promise<Order>;
  find(reference: string): Promise<Order | null>;
  /** Newest first, for the bakery's board. */
  list(): Promise<Order[]>;
  update(
    reference: string,
    changes: Partial<Pick<Order, "status" | "paymentId" | "bakeryNotes" | "previewUrl">>,
  ): Promise<Order | null>;
}

/** A short reference the customer can read out over the phone. */
export function newReference(): string {
  // Excludes characters that are easily misheard or misread (0/O, 1/I, 5/S).
  const alphabet = "ABCDEFGHJKLMNPQRTUVWXYZ234679";
  let suffix = "";
  for (let index = 0; index < 5; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `BB-${suffix}`;
}

/** The status a new order opens in, depending on how it was placed. */
export function openingStatus(requiresQuote: boolean): OrderStatus {
  return requiresQuote ? "quote_requested" : "awaiting_payment";
}

/**
 * In-process store used until a database is configured.
 *
 * Orders live only as long as the server process, which is fine for local
 * development but loses data on every deploy — `getOrderStore` warns when this
 * is what production is running on.
 */
class MemoryOrderStore implements OrderStore {
  private orders = new Map<string, Order>();

  async create(order: NewOrder): Promise<Order> {
    const now = new Date().toISOString();
    const record: Order = {
      ...order,
      reference: newReference(),
      status: openingStatus(order.requiresQuote),
      paymentId: null,
      bakeryNotes: "",
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(record.reference, record);
    return record;
  }

  async find(reference: string): Promise<Order | null> {
    return this.orders.get(reference.toUpperCase()) ?? null;
  }

  async list(): Promise<Order[]> {
    return [...this.orders.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async update(
    reference: string,
    changes: Partial<Order>,
  ): Promise<Order | null> {
    const existing = this.orders.get(reference.toUpperCase());
    if (!existing) return null;

    const updated = { ...existing, ...changes, updatedAt: new Date().toISOString() };
    this.orders.set(updated.reference, updated);
    return updated;
  }
}

let store: OrderStore | null = null;

/** The configured order store, created once per process. */
export function getOrderStore(): OrderStore {
  if (store) return store;

  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "DATABASE_URL is not set — orders are being kept in memory and will be " +
          "lost when this instance recycles.",
      );
    }
    store = new MemoryOrderStore();
    return store;
  }

  // A Postgres-backed store is wired up in ./postgres-store once a database
  // has been provisioned for the project.
  throw new Error("DATABASE_URL is set but no database driver is configured yet");
}
