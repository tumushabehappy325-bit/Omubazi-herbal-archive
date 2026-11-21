import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const display = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Omubazi — Herbal Knowledge Archive",
  description:
    "A digital archive preserving traditional herbal medicinal knowledge from Southwestern Uganda, with an AI safety-reasoning layer that never invents remedies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} min-h-screen bg-parchment font-body text-parchment-ink antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#ebe4d4_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#e8c4b033_0%,_transparent_40%)]" />
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-forest/10 py-6">
            <div className="mx-auto max-w-5xl px-5 sm:px-8">
              <p className="font-body text-xs leading-relaxed text-moss">
                Omubazi is a hackathon demo. Seed entries are illustrative —
                not interviewed healer records. Not medical advice.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
