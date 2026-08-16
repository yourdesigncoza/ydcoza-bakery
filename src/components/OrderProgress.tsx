import { STATUS_LABELS, TRACKED_STATUSES, type OrderStatus } from "@/lib/orders/types";

/**
 * The four production stages, with everything up to the current one marked done.
 *
 * Orders that are cancelled, or still waiting on payment or a quote, sit
 * outside this sequence and are described in words instead.
 */
export function OrderProgress({ status }: { status: OrderStatus }) {
  const current = TRACKED_STATUSES.indexOf(status);
  if (current === -1) return null;

  return (
    <ol className="flex items-start gap-1">
      {TRACKED_STATUSES.map((stage, index) => {
        const done = index <= current;
        return (
          <li key={stage} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span
                className={`h-0.5 flex-1 ${index === 0 ? "bg-transparent" : done ? "bg-accent" : "bg-rule"}`}
              />
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] font-bold ${
                  done
                    ? "border-accent bg-accent text-white"
                    : "border-rule-strong bg-card text-muted"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <span
                className={`h-0.5 flex-1 ${
                  index === TRACKED_STATUSES.length - 1
                    ? "bg-transparent"
                    : index < current
                      ? "bg-accent"
                      : "bg-rule"
                }`}
              />
            </div>
            <span
              className={`text-center text-[10.5px] leading-tight ${
                done ? "font-semibold text-ink" : "text-muted"
              }`}
            >
              {STATUS_LABELS[stage]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
