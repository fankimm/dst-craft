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

/** `{key}` 자리표시자 채우기 — FAQ 문장 틀용 */
export const fillTemplate = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/**
 * 데이터 출처 문구 — AI 검색이 인용할 때 근거로 쓰는 문장 (GEO).
 * **실제로 게임 파일에서 뽑았거나 대조 검증한 페이지에만** 붙인다. characters·recipes·items 등
 * 손으로 관리하는 데이터 페이지에 붙이면 직접 쓴 설명이 "게임 원문"으로 인용된다 (#126 리뷰).
 * - extracted: 스크립트가 게임 파일에서 자동 생성 (farming.ts)
 * - verified: 수작업 데이터를 게임 소스와 스크립트로 대조 (스킬트리, verify-skill-trees.py)
 */
export type DataSourceKind = "extracted" | "verified";

export function dataSourceText(kind: DataSourceKind, lang: SeoLang): string {
  const { release, dataUpdatedAt } = DST_GAME_VERSION;
  if (kind === "extracted") {
    return lang === "ko"
      ? `데이터 출처: Don't Starve Together 게임 파일(릴리즈 ${release})에서 직접 추출 · 갱신일 ${dataUpdatedAt}`
      : `Data source: extracted directly from Don't Starve Together game files (release ${release}) · updated ${dataUpdatedAt}`;
  }
  return lang === "ko"
    ? `데이터 검증: Don't Starve Together 게임 소스(릴리즈 ${release})와 대조 · 갱신일 ${dataUpdatedAt}`
    : `Data checked against Don't Starve Together game source (release ${release}) · updated ${dataUpdatedAt}`;
}

export function DataSourceNote({ kind, lang }: { kind: DataSourceKind; lang: SeoLang }) {
  return <p className="text-xs text-muted-foreground">{dataSourceText(kind, lang)}</p>;
}
