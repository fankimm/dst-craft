"use client";

import { LegalDoc, type LegalDocContent } from "@/components/ui/LegalDoc";
import { useSettings } from "@/hooks/use-settings";

const CONTACT = "balocoding@gmail.com";

const CONTENT: { ko: LegalDocContent; en: LegalDocContent } = {
  ko: {
    title: "개인정보처리방침",
    updated: "2026-07-01",
    intro:
      "dstcraft.com(이하 “서비스”)은 Don't Starve Together 공략을 제공하는 비영리 팬 사이트입니다. 본 방침은 서비스가 어떤 정보를 수집하고 어떻게 이용하는지 설명합니다.",
    sections: [
      {
        h: "1. 수집하는 정보",
        body: [
          "자동 수집(방문 통계): IP 주소, IP 기반 추정 국가, 브라우저·기기·운영체제 종류(User-Agent), 유입 경로(referrer), 방문한 페이지와 시각. 방문 추이 분석과 서비스 개선에 사용합니다.",
          "로그인 시(선택): Google 계정으로 로그인하면 이메일 주소를 받아 즐겨찾기·스킬트리 빌드를 저장·동기화하는 데만 사용합니다. 로그인은 선택이며, 하지 않아도 대부분의 기능을 이용할 수 있습니다.",
          "피드백 제출 시: 입력한 내용과 함께 IP·국가가 기록됩니다(스팸·악용 방지 목적).",
          "브라우저 로컬 저장소: 언어·표시 설정, 비로그인 상태의 즐겨찾기 등은 이용자 기기(localStorage)에만 저장되며 서버로 전송되지 않습니다.",
        ],
      },
      {
        h: "2. 쿠키 및 유사 기술",
        body: [
          "서비스는 로그인 세션 유지와 설정 저장을 위해 쿠키·로컬 저장소를 사용합니다.",
          "향후 광고를 도입하는 경우, 광고 제공사가 광고 노출·측정을 위해 쿠키를 사용할 수 있으며, 그 시점에 본 방침을 갱신하고 관련 고지를 추가합니다.",
        ],
      },
      {
        h: "3. 제3자 서비스",
        body: [
          "Google Identity Services — 로그인 인증(이메일). Google의 개인정보처리방침이 함께 적용됩니다.",
          "Cloudflare — CDN·보안·트래픽 라우팅. 접속 과정에서 IP 등 기술 정보가 처리될 수 있습니다.",
          "Ko-fi — 후원 결제. 결제 정보는 Ko-fi가 처리하며 서비스는 카드·계좌 정보를 저장하지 않습니다.",
          "(향후) 광고 네트워크 — 광고를 도입하면 해당 제공사가 쿠키 기반으로 광고를 제공·측정할 수 있습니다.",
        ],
      },
      {
        h: "4. 보관 및 파기",
        body: [
          "방문 통계는 집계·분석 목적에 필요한 기간 동안 보관합니다. 로그인 계정 정보(이메일)와 즐겨찾기·빌드는 계정이 유지되는 동안 보관하며, 삭제 요청 시 지체 없이 파기합니다.",
        ],
      },
      {
        h: "5. 이용자의 권리",
        body: [
          `본인 정보의 열람·정정·삭제를 요청할 수 있습니다. 아래 문의처로 연락하시면 처리해 드립니다: ${CONTACT}`,
          "로컬 저장소에 보관된 설정·즐겨찾기는 브라우저 데이터 삭제로 언제든 지울 수 있습니다.",
        ],
      },
      {
        h: "6. 아동의 개인정보",
        body: [
          "서비스는 만 13세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 고의로 수집하지 않습니다.",
        ],
      },
      {
        h: "7. 방침의 변경",
        body: [
          "본 방침은 서비스 변경이나 법령에 따라 개정될 수 있으며, 개정 시 본 페이지에 갱신 일자를 표시합니다.",
        ],
      },
      {
        h: "8. 문의",
        body: [`개인정보 관련 문의: ${CONTACT}`],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "2026-07-01",
    intro:
      "dstcraft.com (the “Service”) is a non-commercial fan site providing Don't Starve Together guides. This policy explains what information the Service collects and how it is used.",
    sections: [
      {
        h: "1. Information We Collect",
        body: [
          "Automatically collected (analytics): IP address, approximate country inferred from IP, browser / device / OS type (User-Agent), referrer, and the pages and times you visit. Used to understand traffic trends and improve the Service.",
          "When you sign in (optional): Signing in with Google provides your email address, used only to save and sync your favorites and skill-tree builds. Sign-in is optional; most features work without it.",
          "When you submit feedback: Your message is stored along with your IP and country (to prevent spam and abuse).",
          "Browser local storage: Language / display settings and favorites (while signed out) are stored only on your device (localStorage) and are not sent to our servers.",
        ],
      },
      {
        h: "2. Cookies and Similar Technologies",
        body: [
          "The Service uses cookies and local storage to keep you signed in and to remember your settings.",
          "If advertising is introduced in the future, ad providers may use cookies to serve and measure ads. This policy will be updated with the relevant disclosures at that time.",
        ],
      },
      {
        h: "3. Third-Party Services",
        body: [
          "Google Identity Services — sign-in authentication (email). Google's own privacy policy also applies.",
          "Cloudflare — CDN, security, and traffic routing. Technical data such as IP may be processed during access.",
          "Ko-fi — donation payments. Payment details are handled by Ko-fi; the Service does not store card or bank information.",
          "(Future) Ad networks — if ads are introduced, the provider may serve and measure ads using cookies.",
        ],
      },
      {
        h: "4. Retention and Deletion",
        body: [
          "Analytics are retained for as long as needed for aggregation and analysis. Account information (email) and favorites / builds are kept while your account exists and are deleted promptly upon request.",
        ],
      },
      {
        h: "5. Your Rights",
        body: [
          `You may request access to, correction of, or deletion of your information by contacting: ${CONTACT}`,
          "Settings and favorites stored in local storage can be cleared at any time by clearing your browser data.",
        ],
      },
      {
        h: "6. Children's Privacy",
        body: [
          "The Service is not directed to children under 13 and does not knowingly collect their personal information.",
        ],
      },
      {
        h: "7. Changes to This Policy",
        body: [
          "This policy may be updated to reflect changes to the Service or legal requirements. The updated date is shown on this page.",
        ],
      },
      {
        h: "8. Contact",
        body: [`Privacy inquiries: ${CONTACT}`],
      },
    ],
  },
};

export default function PrivacyPage() {
  const { resolvedLocale } = useSettings();
  const doc = resolvedLocale === "ko" ? CONTENT.ko : CONTENT.en;
  return <LegalDoc doc={doc} locale={resolvedLocale} />;
}
