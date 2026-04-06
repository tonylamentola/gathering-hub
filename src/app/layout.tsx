import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Gathering Hub | Event Venue in Ithaca, MI",
  description: "The Gathering Hub is Ithaca Michigan's premier event venue for birthdays, baby showers, bridal showers, corporate events, and more. 121 S Pine River St.",
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
