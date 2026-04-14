import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gathering-hub-cms.vercel.app"),
  title: "The Gathering Hub | Event Venue in Ithaca, MI",
  description: "The Gathering Hub is a private Ithaca, Michigan event venue with in-house homemade food, custom desserts, and rare food printing. 121 S Pine River St.",
  icons: {
    icon: "/images/gatheringhub-logo.jpg",
    shortcut: "/images/gatheringhub-logo.jpg",
    apple: "/images/gatheringhub-logo.jpg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Gathering Hub | Event Venue in Ithaca, MI",
    description: "Private venue rental in downtown Ithaca with in-house homemade food, custom cakes, cookies, and event hosting help.",
    url: "https://gathering-hub-cms.vercel.app",
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
