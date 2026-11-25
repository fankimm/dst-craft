import Link from "next/link";
import { assetPath } from "@/lib/asset-path";

/**
 * SEO 페이지의 전리품 한 칸 — 보스 페이지(전리품·보관함)와 생물 상세 페이지(#175)가 같이 쓴다.
 * 아이콘 + 개수 배지, 이름(+ 다른 언어 이름), 확률 줄, 선택 메모. href 가 있으면 링크.
 */
export function LootCard({
  name,
  sub,
  image,
  href,
  count,
  chanceLabel,
  chanceHighlight,
  badge,
  note,
}: {
  name: string;
  sub?: string | null;
  image?: string;
  href?: string;
  count?: number;
  chanceLabel: string;
  /** 확률 대신 "1개 선택" 같은 안내를 강조색으로 */
  chanceHighlight?: boolean;
  /** 확률 옆 강조 배지 (예: 설계도) */
  badge?: string;
  note?: string;
}) {
  const inner = (
    <>
      <div className="relative shrink-0 size-10">
        {image && <img src={assetPath(image)} alt={name} className="size-10 object-contain" loading="lazy" />}
        {count != null && count > 1 && (
          <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
            {count}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground leading-tight truncate">{name}</p>
        {sub && sub !== name && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[10px] ${chanceHighlight ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
          >
            {chanceLabel}
          </span>
          {badge && <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">{badge}</span>}
        </div>
        {note && <p className="text-[10px] text-muted-foreground truncate">{note}</p>}
      </div>
    </>
  );
  const cls = "flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2";
  return href ? (
    <Link href={href} className={`${cls} hover:border-ring transition-colors`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** 0~1 확률 → "100%" / "33%" / "12.5%" (정수가 아니면 소수 한 자리까지) */
export function chancePercent(chance: number): string {
  return chance >= 1 ? "100%" : `${+(chance * 100).toFixed(1)}%`;
}
