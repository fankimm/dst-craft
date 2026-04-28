import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";
import { SkillTreePageContent, buildSkillTreeMetadata } from "@/components/seo/SkillTreePageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return CHARACTERS_WITH_SKILLS.map((id) => ({ slug: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildSkillTreeMetadata(slug, "ko");
}

export default async function SkillTreePageKo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SkillTreePageContent slug={slug} lang="ko" />;
}
