import { AppShell } from "@/components/AppShell";
import { SeoFooterLinks } from "@/components/SeoFooterLinks";
import type { Metadata } from "next";

const SITE_URL = "https://www.dstcraft.com";

export const metadata: Metadata = {
  title: "굶지마 제작 가이드 — Don't Starve Together 제작법 & 요리 레시피",
  description:
    "굶지마 투게더 제작법 가이드 — 모든 제작 레시피, 요리솥 레시피, 스킬트리 시뮬레이터를 한 곳에서. 재료, 제작대, 캐릭터별 아이템까지 빠르게 검색하세요.",
  keywords: [
    "굶지마 제작",
    "굶지마 제작법",
    "굶지마 투게더",
    "굶지마 투게더 제작",
    "굶지마 투게더 제작법",
    "굶지마 레시피",
    "굶지마 요리",
    "굶지마 요리솥",
    "굶지마 요리솥 레시피",
    "굶지마 스킬트리",
    "굶지마 가이드",
    "굶지마 아이템",
    "굶지마 보스",
    "DST 제작",
    "DST 제작법",
    "DST 제작 가이드",
    "DST 요리",
    "DST 레시피",
    "Don't Starve Together 제작",
    "Don't Starve Together 제작법",
    "Don't Starve Together 요리",
    "돈스타브 제작",
    "돈스타브 투게더",
  ],
  alternates: {
    canonical: `${SITE_URL}/ko`,
    languages: {
      en: SITE_URL,
      ko: `${SITE_URL}/ko`,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/ko`,
    title: "굶지마 제작 가이드 — Don't Starve Together 제작법 & 요리 레시피",
    description:
      "굶지마 투게더 제작법 가이드 — 모든 제작 레시피, 요리솥 레시피, 스킬트리 시뮬레이터를 한 곳에서.",
    siteName: "Don't Craft Without Recipes",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "굶지마 투게더 제작 & 요리 가이드",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "굶지마 제작 가이드 — Don't Starve Together 제작법",
    description:
      "굶지마 투게더 모든 제작 레시피, 요리솥 레시피, 스킬트리를 한 곳에서 검색하세요.",
    images: ["/og-image.png"],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "굶지마 투게더 제작법을 어디서 확인할 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Don't Craft Without Recipes에서 굶지마 투게더의 모든 제작법을 확인할 수 있습니다. 재료, 제작대, 캐릭터 전용 아이템까지 검색 가능하며, 요리솥 시뮬레이터와 스킬트리 시뮬레이터도 제공합니다.",
      },
    },
    {
      "@type": "Question",
      name: "굶지마 요리솥 레시피는 어떻게 검색하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "요리 탭에서 음식 이름으로 검색하거나, 재료를 넣어 어떤 요리가 만들어지는지 시뮬레이션할 수 있습니다. 체력, 허기, 정신력 회복량과 조리 조건을 한눈에 확인하세요.",
      },
    },
  ],
};

export default function HomeKo() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AppShell />
      <SeoFooterLinks />
    </>
  );
}
