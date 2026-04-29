import { foodSlugs } from "@/lib/slug";
import { FoodPageContent, buildFoodMetadata } from "@/components/seo/FoodPageContent";
import type { Metadata } from "next";

export function generateStaticParams() {
  return foodSlugs.allSlugs.map((slug) => ({ slug }));
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
