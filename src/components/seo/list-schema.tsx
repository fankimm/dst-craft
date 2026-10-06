import { DST_GAME_VERSION } from "@/data/game-version";
import type { SeoLang } from "./labels";

/**
 * 목록(허브) 페이지용 schema.org 헬퍼 + 데이터 출처 표기 (#126).
 *
 * 상세 페이지는 각자 FAQ/WebPage를 직접 만들지만, 목록 페이지 5종은 모양이 같아서 여기로 모았다.
 * FAQ 답변은 반드시 게임 데이터에서 계산한 문장만 넣는다 — 자체 창작 수치 금지.
 */

const SITE_URL = "https://www.dstcraft.com";

export interface ListEntry {
  name: string;
  /** 사이트 내 경로 (`/ko/...` 포함) */
  path: string;
  image?: string;
}

export function itemListLd(name: string, path: string, entries: ListEntry[], lang: SeoLang) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${SITE_URL}${path}`,
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `${SITE_URL}${e.path}`,
      ...(e.image ? { image: `${SITE_URL}${e.image}` } : {}),
    })),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqLd(faq: FaqEntry[], lang: SeoLang) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    mainEntity: faq.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

/** 화면에 보이는 FAQ — 구조화 데이터와 같은 문장을 HTML에도 둬야 구글이 인정한다 */
export function FaqSection({ title, faq }: { title: string; faq: FaqEntry[] }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">
        {faq.map((q, i) => (
          <div key={i}>
            <h3 className="text-sm font-medium text-foreground">{q.question}</h3>
            <p className="text-sm text-foreground/80 leading-relaxed mt-1">{q.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** "어느 게임 빌드 기준 데이터인지" — AI 검색이 인용할 때 근거로 쓰는 문장 (GEO) */
export function dataSourceText(lang: SeoLang): string {
  const { release, dataUpdatedAt } = DST_GAME_VERSION;
  return lang === "ko"
    ? `데이터 출처: Don't Starve Together 게임 파일(빌드 ${release})에서 직접 추출 · 갱신일 ${dataUpdatedAt}`
    : `Data source: extracted directly from Don't Starve Together game files (build ${release}) · updated ${dataUpdatedAt}`;
}

export function DataSourceNote({ lang }: { lang: SeoLang }) {
  return <p className="text-xs text-muted-foreground">{dataSourceText(lang)}</p>;
}
