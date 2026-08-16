import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { BRAND } from "@/lib/brand";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://bakery.yourdesign.co.za"),
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
      lang="en-ZA"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
