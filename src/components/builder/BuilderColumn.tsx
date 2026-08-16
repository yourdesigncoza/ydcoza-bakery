interface BuilderColumnProps {
  step: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

/**
 * One of the builder's five numbered steps.
 *
 * The header stays put while the options scroll beneath it, which keeps the
 * customer's place visible on a long column like Cake Type.
 */
export function BuilderColumn({ step, title, icon, children }: BuilderColumnProps) {
  return (
    <section className="column-card min-h-0" aria-label={`Step ${step}: ${title}`}>
      <header className="flex items-center gap-2.5 border-b border-rule px-4 py-3.5">
        <span className="text-accent" aria-hidden>
          {icon}
        </span>
        <h2 className="font-display text-[19px] font-semibold leading-none text-ink">
          <span className="tabular-nums">{step}.</span> {title}
        </h2>
      </header>
      <div className="column-scroll flex-1 space-y-5 px-3.5 py-4">{children}</div>
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
