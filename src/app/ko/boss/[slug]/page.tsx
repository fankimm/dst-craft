import { bosses } from "@/data/bosses";
import { BossPageContent, buildBossMetadata } from "@/components/seo/BossPageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return bosses.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildBossMetadata(slug, "ko");
}

export default async function BossPageKo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BossPageContent slug={slug} lang="ko" />;
}
