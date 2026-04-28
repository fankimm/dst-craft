import { allItems } from "@/data/items";
import { ItemPageContent, buildItemMetadata } from "@/components/seo/ItemPageContent";
import type { Metadata } from "next";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export function generateStaticParams() {
  return allItems.map((item) => ({ slug: idToSlug(item.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildItemMetadata(slug, "ko");
}

export default async function ItemPageKo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ItemPageContent slug={slug} lang="ko" />;
}
