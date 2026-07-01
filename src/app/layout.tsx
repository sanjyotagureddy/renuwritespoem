import type { Metadata } from "next";
import { Playfair_Display, Inter, Geist, Noto_Sans_Devanagari } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SocialFloating from "@/components/social-floating";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: {
    default: "Renu Writes Poem - Poetry & Books",
    template: "%s | Renu Writes Poem",
  },
  description:
    "Discover heartfelt poetry and books by Renu. Explore poems on love, nature, life, spirituality, and more.",
  keywords: [
    "poetry",
    "poems",
    "books",
    "Renu",
    "love poems",
    "nature poetry",
    "spirituality",
    "Hindi poetry",
  ],
  authors: [{ name: "Renu" }],
  openGraph: {
    title: "Renu Writes Poem - Poetry & Books",
    description:
      "Discover heartfelt poetry and books by Renu. Explore poems on love, nature, life, spirituality, and more.",
    type: "website",
    siteName: "Renu Writes Poem",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Renu Writes Poem - Poetry & Books",
    description:
      "Discover heartfelt poetry and books by Renu. Explore poems on love, nature, life, spirituality, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${playfair.variable} ${inter.variable} ${notoDevanagari.variable} antialiased bg-neutral-950 text-white`}
      >
        <Header />
        <main className="min-h-screen pt-[72px]">{children}</main>
        <Footer />
        <SocialFloating />
        <Analytics />
      </body>
    </html>
  );
}
