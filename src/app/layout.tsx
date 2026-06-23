import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import SocialFloating from "@/components/social-floating";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Renu Writes Poem - Poetry & Books",
  description:
    "Discover heartfelt poetry and books by Renu. Explore poems on love, nature, life, spirituality, and more.",
  openGraph: {
    title: "Renu Writes Poem - Poetry & Books",
    description:
      "Discover heartfelt poetry and books by Renu. Explore poems on love, nature, life, spirituality, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        {children}
        <SocialFloating />
      </body>
    </html>
  );
}
