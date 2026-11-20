"use client";

import { useEffect, useState } from "react";
import { searchCatalog, type CatalogSearchEntry } from "@/lib/catalog-search";
import { assetPath } from "@/lib/asset-path";

let indexPromise: Promise<CatalogSearchEntry[]> | null = null;

function loadIndex(): Promise<CatalogSearchEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch(assetPath("/catalog-search.json"))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => {
        indexPromise = null; // 다음 검색 때 다시 시도
        return [];
      });
  }
  return indexPromise;
}

/**
 * 검색어로 도감 아이템·생물·요리솥 재료 상세 페이지를 찾는다 (#165).
 * 색인은 검색어가 처음 생길 때 한 번만 불러온다 — 검색을 안 하는 방문자는 받지 않는다.
 */
export function useCatalogSearch(queries: string[]): CatalogSearchEntry[] {
  const [hits, setHits] = useState<CatalogSearchEntry[]>([]);
  const key = queries.join("\0");
  useEffect(() => {
    if (!queries.some((q) => q.trim())) {
      setHits([]);
      return;
    }
    let alive = true;
    loadIndex().then((index) => {
      if (alive) setHits(searchCatalog(index, queries));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return hits;
}
