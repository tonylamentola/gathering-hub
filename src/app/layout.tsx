import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thegatheringhub.biz"),
  title: "The Gathering Hub | Event Venue in Ithaca, MI",
  description: "The Gathering Hub is a private Ithaca, Michigan event venue with in-house homemade food, custom desserts, and rare food printing. 121 S Pine River St.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Gathering Hub | Event Venue in Ithaca, MI",
    description: "Private venue rental in downtown Ithaca with in-house homemade food, custom cakes, cookies, and event hosting help.",
    url: "https://thegatheringhub.biz",
    siteName: "The Gathering Hub",
    images: [
      {
        url: "/images/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "The Gathering Hub storefront in downtown Ithaca",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Gathering Hub | Event Venue in Ithaca, MI",
    description: "Private venue rental in downtown Ithaca with in-house homemade food, custom cakes, cookies, and event hosting help.",
    images: ["/images/hero-main.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
