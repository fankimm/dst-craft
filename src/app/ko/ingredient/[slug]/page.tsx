import { ingredientSlugs } from "@/lib/ingredient-slug";
import { IngredientPageContent, buildIngredientMetadata } from "@/components/seo/IngredientPageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return ingredientSlugs.allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildIngredientMetadata(slug, "ko");
}

export default async function IngredientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <IngredientPageContent slug={slug} lang="ko" />;
}
