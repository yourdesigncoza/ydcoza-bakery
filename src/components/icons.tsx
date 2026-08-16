/**
 * Line glyphs for the builder's column headers and occasion tiles.
 *
 * These are drawn rather than generated so they stay crisp at any size and add
 * nothing to the page weight.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

function Glyph({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function CakeIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 20h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" />
      <path d="M4 16h16" />
      <path d="M12 12V9" />
      <path d="M12 6.5c0-.8-1-1.3-1-2.2A1 1 0 0 1 12 3.3a1 1 0 0 1 1 1c0 .9-1 1.4-1 2.2z" />
    </Glyph>
  );
}

export function BowlIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3 11h18a9 9 0 0 1-9 9 9 9 0 0 1-9-9z" />
      <path d="M14.5 8c1.5-1 1.5-3 0-4" />
      <path d="M10.5 8c1.5-1 1.5-3 0-4" />
    </Glyph>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 3a9 9 0 0 0 0 18c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7z" />
      <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="1" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 11h16v9H4z" />
      <path d="M3 7.5h18V11H3z" />
      <path d="M12 7.5V20" />
      <path d="M12 7.5S10.8 4 8.8 4a2 2 0 0 0 0 3.5z" />
      <path d="M12 7.5S13.2 4 15.2 4a2 2 0 0 1 0 3.5z" />
    </Glyph>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </Glyph>
  );
}

export function GraduationIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.5 8.8 12 4.5l9.5 4.3L12 13z" />
      <path d="M6.5 10.8v4.6c0 1.6 2.5 2.8 5.5 2.8s5.5-1.2 5.5-2.8v-4.6" />
      <path d="M21.5 8.8v5.4" />
    </Glyph>
  );
}

export function OnesieIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M8.5 3.5 12 6l3.5-2.5L19 5.5l-1.8 3.2V19a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7.2 19V8.7L5.5 5.5z" />
      <path d="M9.8 20.5v-3.8h4.4v3.8" />
    </Glyph>
  );
}

export function RingsIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="9" cy="14.5" r="5" />
      <circle cx="15" cy="14.5" r="5" />
      <path d="M13 5.5h4l1.5 2.5" />
      <path d="M15 3.5 17 5.5" />
    </Glyph>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9z" />
      <path d="M18.5 16.5 19.2 19l2.3.7-2.3.8-.7 2.4-.8-2.4-2.3-.8 2.3-.7z" />
    </Glyph>
  );
}

/** Occasion id → glyph, so the catalogue stays free of presentation concerns. */
export const OCCASION_ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  birthday: CakeIcon,
  graduation: GraduationIcon,
  "baby-shower": OnesieIcon,
  wedding: RingsIcon,
};
