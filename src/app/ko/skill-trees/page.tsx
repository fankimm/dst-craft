import { SkillTreesListContent, buildSkillTreesListMetadata } from "@/components/seo/SkillTreesListContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildSkillTreesListMetadata("ko");

export default function SkillTreesPageKo() {
  return <SkillTreesListContent lang="ko" />;
}
