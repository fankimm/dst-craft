import { ItemsCatalogContent, buildItemsCatalogMetadata } from "@/components/seo/ItemsCatalogContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildItemsCatalogMetadata("ko");

export default function ItemsPageKo() {
  return <ItemsCatalogContent lang="ko" />;
}
