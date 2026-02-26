import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats — DST Crafting Guide",
  description: "Usage statistics and analytics for DST Crafting Guide.",
  robots: { index: false, follow: false },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
