import {
  QuestsListContent,
  buildQuestsListMetadata,
} from "@/components/seo/QuestsListContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildQuestsListMetadata("en");

export default function QuestsPage() {
  return <QuestsListContent lang="en" />;
}
