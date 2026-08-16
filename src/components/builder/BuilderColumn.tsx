interface BuilderColumnProps {
  step: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

/**
 * One of the builder's five numbered steps.
 *
 * The page itself scrolls — the columns are not their own scroll containers.
 * Nesting scrollers here traps the wheel and the finger over whichever column
 * is under the cursor, which is worse than a long page. On desktop the numbered
 * heading sticks to the top instead, so the customer keeps their place.
 */
export function BuilderColumn({ step, title, icon, children }: BuilderColumnProps) {
  return (
    <section className="column-card" aria-label={`Step ${step}: ${title}`}>
      <header className="column-heading flex items-center gap-2.5 border-b border-rule px-4 py-3.5">
        <span className="text-accent" aria-hidden>
          {icon}
        </span>
        <h2 className="font-display text-[19px] font-semibold leading-none text-ink">
          <span className="tabular-nums">{step}.</span> {title}
        </h2>
      </header>
      <div className="flex-1 space-y-5 px-3.5 py-4">{children}</div>
    </section>
  );
}

/** A labelled group of options inside a column, e.g. "Choose Flavour". */
export function OptionGroup({
  label,
  children,
  className = "space-y-2",
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div>
      {label ? <p className="section-label mb-2.5">{label}</p> : null}
      <div className={className}>{children}</div>
    </div>
  );
}
