import { itemSlugs } from "@/lib/slug";
import { ItemPageContent, buildItemMetadata } from "@/components/seo/ItemPageContent";
import { CatalogItemPageContent, buildCatalogItemMetadata } from "@/components/seo/CatalogItemPageContent";
import { catalogItemSlugs, resolveCatalogItemSlug } from "@/lib/catalog-slug";
import type { Metadata } from "next";

export function generateStaticParams() {
  // 제작 아이템 + 제작 탭에 없는 스크랩북 아이템(#159). 슬러그는 서로 겹치지 않는다 (catalog-slug.ts)
  return [...itemSlugs.allSlugs, ...catalogItemSlugs.allSlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return resolveCatalogItemSlug(slug) ? buildCatalogItemMetadata(slug, "ko") : buildItemMetadata(slug, "ko");
}

export default async function ItemPageKo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (resolveCatalogItemSlug(slug)) return <CatalogItemPageContent slug={slug} lang="ko" />;
  return <ItemPageContent slug={slug} lang="ko" />;
}
