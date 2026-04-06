import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu & Gallery | The Gathering Hub — Ithaca, MI",
  description: "Browse our homemade menu and photo gallery. Fresh baked goods, soups, salads, subs, and catering for every event at The Gathering Hub in Ithaca, Michigan.",
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
