import { itemSlugs } from "@/lib/slug";
import { ItemPageContent, buildItemMetadata } from "@/components/seo/ItemPageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return itemSlugs.allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildItemMetadata(slug, "en");
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ItemPageContent slug={slug} lang="en" />;
}
