import Link from "next/link";
import { BRAND } from "@/lib/brand";

/** Slim top bar carried across the storefront. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-page/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1560px] items-center justify-between px-4">
        <Link href="/" className="font-display text-[19px] font-semibold text-ink">
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-5 text-[13px] text-body">
          <Link href="/" className="transition hover:text-accent">
            Build a cake
          </Link>
          <Link href="/orders" className="transition hover:text-accent">
            Track an order
          </Link>
        </nav>
      </div>
    </header>
  );
}
