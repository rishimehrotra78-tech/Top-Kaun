import type { Metadata, Viewport } from "next";
import { SiteFooter, SiteHeader } from "@/components/Chrome";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eknumber.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "eknumber.in — India's sponsored leaderboard", template: "%s · eknumber.in" },
  description: "Indian brands rank by total ad spend, and every one of them offers you an exclusive deal.",
  openGraph: {
    title: "eknumber.in — Ek number brands, ek number deals",
    description: "India's sponsored leaderboard. Exclusive deals from every brand on the list.",
    siteName: "eknumber.in",
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#C4161C", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
