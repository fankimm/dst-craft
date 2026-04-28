import { characters } from "@/data/characters";
import { CharacterPageContent, buildCharacterMetadata } from "@/components/seo/CharacterPageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return characters.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildCharacterMetadata(slug, "ko");
}

export default async function CharacterPageKo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CharacterPageContent slug={slug} lang="ko" />;
}
