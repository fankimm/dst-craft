import { CookpotContent, buildCookpotMetadata } from "@/components/seo/CookpotContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildCookpotMetadata("ko");

export default function CookpotPageKo() {
  return <CookpotContent lang="ko" />;
}
