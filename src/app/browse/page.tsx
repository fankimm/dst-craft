import { BrowseContent, buildBrowseMetadata } from "@/components/seo/BrowseContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildBrowseMetadata("en");

export default function BrowsePage() {
  return <BrowseContent lang="en" />;
}
