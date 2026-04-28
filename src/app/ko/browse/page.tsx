import { BrowseContent, buildBrowseMetadata } from "@/components/seo/BrowseContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildBrowseMetadata("ko");

export default function BrowsePageKo() {
  return <BrowseContent lang="ko" />;
}
