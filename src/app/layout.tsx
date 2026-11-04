import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter, Space_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { EVENT } from "@/lib/config/event";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-dna-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-dna-body", display: "swap" });
const serif = Bodoni_Moda({ subsets: ["latin"], variable: "--font-dna-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: `AI DNA · ${EVENT.name}`, template: `%s · AI DNA` },
  description: "Six questions. Sixty seconds. Discover your AI personality and collect your card.",
  metadataBase: EVENT.siteUrl ? new URL(EVENT.siteUrl) : undefined,
  openGraph: {
    title: "Discover Your AI DNA",
    description: `What kind of AI thinker are you? Find out at ${EVENT.name}.`,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060b1f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
