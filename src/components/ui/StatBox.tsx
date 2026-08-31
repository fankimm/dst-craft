"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * 단일 stat 셀. 아이콘 좌측, 값 우측 상단(굵은 폰트), 라벨 우측 하단(작은 회색).
 * 요리 RecipeDetail의 stats 박스 + WX-78 현황 stat row 양쪽에서 공유.
 */
export function StatBox({
  iconSrc,
  iconNode,
  label,
  formatted,
  colorClass,
  divider,
  onClick,
}: {
  iconSrc?: string;
  /** 이미지 대신 React 노드(예: lucide 아이콘)로 표시할 때 */
  iconNode?: ReactNode;
  label: string;
  /** 표시할 값 — "+25", "−40°", "140" 등 사인/단위 포함 */
  formatted: string;
  /** Tailwind 색상 클래스 (statColor() 결과 또는 직접 지정). 없으면 muted. */
  colorClass?: string;
  divider?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      {iconSrc ? (
        <img src={iconSrc} alt={label} className="size-5 object-contain" loading="lazy" />
      ) : iconNode ? (
        <span className="size-5 inline-flex items-center justify-center text-muted-foreground">{iconNode}</span>
      ) : null}
      <div className="text-left">
        <div className={cn("text-sm font-semibold tabular-nums leading-tight", colorClass ?? "text-foreground")}>
          {formatted}
        </div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </div>
    </>
  );

  const baseClass = cn(
    "flex items-center gap-1.5 rounded-md transition-colors",
    divider && "border-l border-border pl-4",
    onClick && "cursor-pointer hover:bg-foreground/5 px-1 -mx-1",
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClass}>
        {inner}
      </button>
    );
  }
  return <div className={baseClass}>{inner}</div>;
}
