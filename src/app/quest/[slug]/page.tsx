import { questSlugs } from "@/lib/slug";
import {
  QuestPageContent,
  buildQuestMetadata,
} from "@/components/seo/QuestPageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return questSlugs.allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildQuestMetadata(slug, "en");
}

export default async function QuestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <QuestPageContent slug={slug} lang="en" />;
}
