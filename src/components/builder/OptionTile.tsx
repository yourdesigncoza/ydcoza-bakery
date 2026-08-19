import Image from "next/image";
import { formatMoney } from "@/lib/catalogue/pricing";

interface OptionTileProps {
  name: string;
  tagline?: string;
  image?: string;
  /** Shown as `+R120.00` when non-zero. */
  surcharge?: number;
  selected: boolean;
  onSelect: () => void;
  /**
   * `row` puts the thumbnail beside the label, `grid` stacks it above.
   * `compact` is a small label-only tile for sizes and occasions.
   */
  layout?: "row" | "grid" | "compact";
  /** Renders a check bubble instead of a border-only selected state. */
  toggle?: boolean;
  /** Replaces the thumbnail, used for colour swatches and occasion glyphs. */
  ornament?: React.ReactNode;
}

/**
 * One selectable option in the builder.
 *
 * Every column uses this, so the selected treatment, spacing and pricing
 * suffix stay identical across all five steps.
 */
export function OptionTile({
  name,
  tagline,
  image,
  surcharge = 0,
  selected,
  onSelect,
  layout = "row",
  toggle = false,
  ornament,
}: OptionTileProps) {
  const compact = layout === "compact";
  const thumbnail =
    ornament ??
    (image ? (
      <Image
        src={image}
        alt=""
        width={layout === "grid" ? 200 : 96}
        height={layout === "grid" ? 200 : 96}
        className={
          layout === "grid"
            ? "h-20 w-full rounded-lg object-cover"
            : "h-11 w-11 shrink-0 rounded-lg object-cover"
        }
      />
    ) : null);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`tile-base ${selected ? "tile-selected" : ""} ${
        layout === "grid"
          ? "flex flex-col gap-2 p-2 text-center"
          : layout === "compact"
            ? "flex flex-col items-center gap-1.5 px-2 py-3 text-center"
            : "flex items-center gap-3 p-2.5"
      }`}
    >
      {thumbnail}

      <span className={layout === "row" ? "min-w-0 flex-1" : "block w-full"}>
        {/* Compact tiles are narrow, so their labels wrap rather than clip. */}
        <span
          className={
            compact
              ? "block text-[11.5px] font-semibold leading-tight text-ink"
              : `block truncate font-semibold text-ink ${layout === "grid" ? "text-[12px]" : "text-[13px]"}`
          }
        >
          {name}
        </span>
        {tagline ? (
          <span
            className={
              compact
                ? "mt-0.5 block text-[10px] leading-tight text-muted"
                : "mt-0.5 block truncate text-[11px] text-muted"
            }
          >
            {tagline}
          </span>
        ) : null}
        {surcharge > 0 ? (
          <span className="mt-0.5 block text-[11px] font-medium text-accent">
            +{formatMoney(surcharge)}
          </span>
        ) : null}
      </span>

      {toggle ? (
        <span
          aria-hidden
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
            selected ? "border-accent bg-accent text-white" : "border-rule-strong bg-card"
          }`}
        >
          {selected ? (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}
