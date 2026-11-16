import { CreaturesCatalogContent, buildCreaturesCatalogMetadata } from "@/components/seo/CreaturesCatalogContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildCreaturesCatalogMetadata("en");

export default function CreaturesPage() {
  return <CreaturesCatalogContent lang="en" />;
}
