import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { MARKET } from "@/lib/market";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * What relative URLs in the metadata are resolved against.
 *
 * Each bakery is its own deployment on its own domain, so this cannot be a
 * constant — a British storefront whose social cards and canonical links point
 * at the South African demo is advertising somebody else's shop. Vercel names
 * the project's own production domain, which is what a share link should use
 * even when the page is being served from a preview URL. The fallback is the
 * demo this repository deploys.
 */
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://bakery.yourdesign.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — Build Your Cake`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Design your custom celebration cake step by step — choose the shape, flavour, " +
    "finish and finishing touches, see it rendered, and order it in minutes.",
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `Build Your Cake — ${BRAND.name}`,
    description:
      "Design your custom celebration cake step by step and order it in minutes.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={MARKET.locale}
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
