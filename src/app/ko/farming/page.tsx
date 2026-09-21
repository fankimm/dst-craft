import { FarmingContent, buildFarmingMetadata } from "@/components/seo/FarmingContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildFarmingMetadata("ko");

export default function FarmingPageKo() {
  return <FarmingContent lang="ko" />;
}
