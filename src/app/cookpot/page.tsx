import { CookpotContent, buildCookpotMetadata } from "@/components/seo/CookpotContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildCookpotMetadata("en");

export default function CookpotPage() {
  return <CookpotContent lang="en" />;
}
