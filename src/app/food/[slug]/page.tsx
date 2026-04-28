import { cookingRecipes } from "@/data/recipes";
import { FoodPageContent, buildFoodMetadata } from "@/components/seo/FoodPageContent";
import type { Metadata } from "next";

function idToSlug(id: string) {
  return id.replaceAll("_", "-");
}

export function generateStaticParams() {
  return cookingRecipes.map((r) => ({ slug: idToSlug(r.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildFoodMetadata(slug, "en");
}

export default async function FoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FoodPageContent slug={slug} lang="en" />;
}
