import { CharactersListContent, buildCharactersListMetadata } from "@/components/seo/CharactersListContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildCharactersListMetadata("en");

export default function CharactersPage() {
  return <CharactersListContent lang="en" />;
}
