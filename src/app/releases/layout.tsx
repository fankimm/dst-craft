import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release Notes — Don't Craft Without Recipes",
  robots: { index: false, follow: false },
};

export default function ReleasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
