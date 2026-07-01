"use client";

import { LegalDoc, type LegalDocContent } from "@/components/ui/LegalDoc";
import { useSettings } from "@/hooks/use-settings";

const CONTACT = "balocoding@gmail.com";

const CONTENT: { ko: LegalDocContent; en: LegalDocContent } = {
  ko: {
    title: "이용약관",
    updated: "2026-07-01",
    intro:
      "dstcraft.com(이하 “서비스”)은 Don't Starve Together 공략을 제공하는 비영리 팬 사이트입니다. 서비스를 이용함으로써 본 약관에 동의하는 것으로 간주됩니다.",
    sections: [
      {
        h: "1. 서비스의 성격",
        body: [
          "본 서비스는 팬이 자발적으로 제작한 비공식·비영리 가이드입니다. 게임 개발사인 Klei Entertainment와 제휴·후원·승인 관계가 없습니다.",
        ],
      },
      {
        h: "2. 지적재산권",
        body: [
          "“Don't Starve Together” 및 게임 내 명칭·수치·아이콘·이미지 등 모든 게임 콘텐츠의 저작권은 Klei Entertainment에 있으며, 본 서비스는 이를 공략 안내 목적으로만 인용·표시합니다.",
          "일부 이미지는 dontstarve.wiki.gg에서 CC BY-SA 라이선스로 제공되는 자료를 사용합니다. 출처와 라이선스는 해당 자료 제공처를 따릅니다.",
          "서비스의 자체 코드·디자인·데이터 편집물은 위 게임 자산과 별개이며, 무단 복제·재배포를 금합니다.",
        ],
      },
      {
        h: "3. 정보의 정확성과 면책",
        body: [
          "서비스의 모든 정보는 게임 데이터를 참고해 최대한 정확히 정리하나, 완전성·정확성을 보증하지 않습니다. 게임 업데이트로 실제와 달라질 수 있습니다.",
          "서비스 이용으로 발생한 어떠한 손해에 대해서도 운영자는 책임을 지지 않습니다.",
        ],
      },
      {
        h: "4. 이용자의 의무",
        body: [
          "서비스에 과도한 부하를 주는 자동 수집(대량 크롤링 등)이나 서비스 운영을 방해하는 행위를 하지 않아야 합니다.",
          "피드백 등에 타인의 권리를 침해하거나 불법·부적절한 내용을 게시하지 않아야 합니다.",
        ],
      },
      {
        h: "5. 광고",
        body: [
          "서비스는 운영 비용 충당을 위해 향후 광고를 게재할 수 있습니다. 광고 도입 시 개인정보처리방침에 관련 고지를 반영합니다.",
        ],
      },
      {
        h: "6. 약관의 변경",
        body: [
          "본 약관은 필요에 따라 개정될 수 있으며, 개정 시 본 페이지에 갱신 일자를 표시합니다.",
        ],
      },
      {
        h: "7. 문의",
        body: [`문의: ${CONTACT}`],
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updated: "2026-07-01",
    intro:
      "dstcraft.com (the “Service”) is a non-commercial fan site providing Don't Starve Together guides. By using the Service, you agree to these terms.",
    sections: [
      {
        h: "1. Nature of the Service",
        body: [
          "This Service is an unofficial, non-commercial guide made by fans. It is not affiliated with, sponsored by, or endorsed by Klei Entertainment, the game's developer.",
        ],
      },
      {
        h: "2. Intellectual Property",
        body: [
          "“Don't Starve Together” and all in-game names, stats, icons, and images are copyright Klei Entertainment. The Service cites and displays them solely for the purpose of providing guides.",
          "Some images use material provided under the CC BY-SA license from dontstarve.wiki.gg. Attribution and licensing follow the original source.",
          "The Service's own code, design, and compiled data are separate from the above game assets; unauthorized copying or redistribution is prohibited.",
        ],
      },
      {
        h: "3. Accuracy and Disclaimer",
        body: [
          "Information is compiled as accurately as possible from game data, but completeness and accuracy are not guaranteed. Game updates may cause discrepancies.",
          "The operator is not liable for any damages arising from use of the Service.",
        ],
      },
      {
        h: "4. User Obligations",
        body: [
          "You must not perform automated collection that places excessive load on the Service (e.g. mass crawling) or otherwise disrupt its operation.",
          "You must not post content in feedback that infringes others' rights or is illegal or inappropriate.",
        ],
      },
      {
        h: "5. Advertising",
        body: [
          "The Service may display advertising in the future to cover operating costs. Any such introduction will be reflected in the Privacy Policy.",
        ],
      },
      {
        h: "6. Changes to These Terms",
        body: [
          "These terms may be updated as needed. The updated date is shown on this page.",
        ],
      },
      {
        h: "7. Contact",
        body: [`Contact: ${CONTACT}`],
      },
    ],
  },
};

export default function TermsPage() {
  const { resolvedLocale } = useSettings();
  const doc = resolvedLocale === "ko" ? CONTENT.ko : CONTENT.en;
  return <LegalDoc doc={doc} locale={resolvedLocale} />;
}
