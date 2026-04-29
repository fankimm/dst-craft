import { bossSlugs } from "@/lib/slug";
import { BossPageContent, buildBossMetadata } from "@/components/seo/BossPageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return bossSlugs.allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildBossMetadata(slug, "en");
}

export default async function BossPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BossPageContent slug={slug} lang="en" />;
}
