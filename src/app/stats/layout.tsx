import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats — Don't Craft Without Recipes",
  description: "Usage statistics and analytics for Don't Craft Without Recipes.",
  robots: { index: false, follow: false },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
