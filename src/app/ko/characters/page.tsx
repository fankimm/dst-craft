import { CharactersListContent, buildCharactersListMetadata } from "@/components/seo/CharactersListContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildCharactersListMetadata("ko");

export default function CharactersPageKo() {
  return <CharactersListContent lang="ko" />;
}
