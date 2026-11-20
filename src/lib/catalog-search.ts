/**
 * 제작 탭 검색이 함께 찾는 상세 페이지 색인 (#165) — `/catalog-search.json`(빌드 때 생성)의 항목과 검색.
 * 색인 생성은 `src/app/catalog-search.json/route.ts`. 이 파일은 클라이언트에서 쓰므로 데이터 모듈을 import 하지 않는다.
 */
export type CatalogSearchKind = "item" | "creature" | "ingredient";

export interface CatalogSearchEntry {
  k: CatalogSearchKind;
  en: string;
  ko: string;
  /** 로캘 접두 없는 경로 (예: `/item/spider-web`) */
  p: string;
  /** game-items 이미지 파일명 */
  i?: string;
}

/** 검색어가 모두 영문·한글 이름 어딘가에 들어 있는 항목. 이름이 검색어로 시작하는 것을 앞에 둔다 */
export function searchCatalog(index: CatalogSearchEntry[], queries: string[], limit = 24): CatalogSearchEntry[] {
  const qs = queries.map((q) => q.trim().toLowerCase()).filter(Boolean);
  if (qs.length === 0) return [];
  const hits = index.filter((e) => {
    const en = e.en.toLowerCase();
    return qs.every((q) => en.includes(q) || e.ko.includes(q));
  });
  const starts = (e: CatalogSearchEntry) => (qs.some((q) => e.en.toLowerCase().startsWith(q) || e.ko.startsWith(q)) ? 0 : 1);
  hits.sort((a, b) => starts(a) - starts(b));
  return hits.slice(0, limit);
}
