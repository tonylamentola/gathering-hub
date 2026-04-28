import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | The Gathering Hub — Ithaca, MI",
  description: "Browse catering menu options, homemade food, custom cakes, cookies, desserts, and event-friendly favorites from The Gathering Hub in Ithaca, Michigan.",
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
