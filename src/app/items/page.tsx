import { ItemsCatalogContent, buildItemsCatalogMetadata } from "@/components/seo/ItemsCatalogContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildItemsCatalogMetadata("en");

export default function ItemsPage() {
  return <ItemsCatalogContent lang="en" />;
}
