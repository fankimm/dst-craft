"use client";

import { ItemSlot } from "@/components/ui/ItemSlot";
import { t, type Locale } from "@/lib/i18n";
import type { CatalogSearchEntry, CatalogSearchKind } from "@/lib/catalog-search";

const KIND_LABEL = {
  item: "catalogKindItem",
  creature: "catalogKindCreature",
  ingredient: "catalogKindIngredient",
} as const satisfies Record<CatalogSearchKind, string>;

/**
 * 제작 탭 검색 결과 아래의 "도감" 섹션 (#165) — 제작법이 없는 도감 아이템·생물·요리솥 재료의 상세 페이지 링크.
 * 상세 페이지는 앱 밖 정적 페이지라 패널이 아니라 링크로 연다.
 */
export function CatalogSearchResults({ hits, locale }: { hits: CatalogSearchEntry[]; locale: Locale }) {
  if (hits.length === 0) return null;
  const prefix = locale === "ko" ? "/ko" : "";
  const kinds = (["item", "creature", "ingredient"] as const).filter((k) => hits.some((h) => h.k === k));
  return (
    <section className="px-3 sm:px-4 pb-6 max-w-4xl mx-auto w-full space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground border-t border-border pt-3">
        {t(locale, "catalogSearchResults")}
      </h2>
      {kinds.map((k) => (
        <div key={k} className="space-y-2">
          <h3 className="text-xs text-muted-foreground">{t(locale, KIND_LABEL[k])}</h3>
          <div className="flex flex-wrap gap-3">
            {hits
              .filter((h) => h.k === k)
              .map((h) => (
                <a key={h.p} href={`${prefix}${h.p}`} className="w-16 text-center">
                  <ItemSlot icon={h.i} label={locale === "ko" ? h.ko : h.en} />
                </a>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
