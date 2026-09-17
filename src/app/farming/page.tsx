import { FarmingContent, buildFarmingMetadata } from "@/components/seo/FarmingContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildFarmingMetadata("en");

export default function FarmingPage() {
  return <FarmingContent lang="en" />;
}
