import { CreaturePageContent, buildCreatureMetadata } from "@/components/seo/CreaturePageContent";
import { creatureSlugs } from "@/lib/creature-slug";
import type { Metadata } from "next";

export function generateStaticParams() {
  return creatureSlugs.allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildCreatureMetadata(slug, "ko");
}

export default async function CreaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CreaturePageContent slug={slug} lang="ko" />;
}
