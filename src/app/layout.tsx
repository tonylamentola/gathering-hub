import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "The Gathering Hub | Event Venue in Ithaca, MI";
const siteDescription =
  "The Gathering Hub is a private Ithaca, Michigan event venue with in-house homemade food, custom desserts, and rare food printing. 121 S Pine River St.";
const socialImage = {
  url: "/images/gatheringhub-logo.jpg",
  width: 2048,
  height: 2047,
  alt: "The Gathering Hub logo",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thegatheringhub.biz"),
  applicationName: "The Gathering Hub",
  title: {
    default: siteTitle,
    template: "%s | The Gathering Hub",
  },
  description: siteDescription,
  keywords: [
    "The Gathering Hub",
    "Ithaca Michigan event venue",
    "Ithaca MI catering",
    "baby shower venue",
    "bridal shower venue",
    "private event space",
  ],
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
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "The Gathering Hub",
    images: [socialImage],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage.url],
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
