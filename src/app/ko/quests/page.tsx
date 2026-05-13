import {
  QuestsListContent,
  buildQuestsListMetadata,
} from "@/components/seo/QuestsListContent";
import type { Metadata } from "next";

export const metadata: Metadata = buildQuestsListMetadata("ko");

export default function QuestsPageKo() {
  return <QuestsListContent lang="ko" />;
}
