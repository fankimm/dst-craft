import { SkillTreesListContent, buildSkillTreesListMetadata } from "@/components/seo/SkillTreesListContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildSkillTreesListMetadata("en");

export default function SkillTreesPage() {
  return <SkillTreesListContent lang="en" />;
}
