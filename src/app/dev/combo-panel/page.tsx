"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";
import { ItemSlot } from "@/components/ui/ItemSlot";
import { cookpotIngredients, ingredientImage } from "@/data/cookpot-ingredients";

// ---------------------------------------------------------------------------
// Mock data — 인기 조합 샘플
// ---------------------------------------------------------------------------

interface ComboEntry {
  ingredients: { id: string; count: number }[];
  count: number; // 시뮬 횟수
}

const mockCombos: ComboEntry[] = [
  { ingredients: [{ id: "kelp", count: 3 }, { id: "monstermeat", count: 1 }], count: 127 },
  { ingredients: [{ id: "froglegs", count: 2 }, { id: "monstermeat", count: 2 }], count: 89 },
  { ingredients: [{ id: "drumstick", count: 1 }, { id: "berries", count: 2 }, { id: "ice", count: 1 }], count: 64 },
  { ingredients: [{ id: "meat", count: 1 }, { id: "monstermeat", count: 1 }, { id: "berries", count: 1 }, { id: "ice", count: 1 }], count: 41 },
  { ingredients: [{ id: "froglegs", count: 1 }, { id: "berries", count: 3 }], count: 23 },
  { ingredients: [{ id: "monstermeat", count: 1 }, { id: "kelp", count: 1 }, { id: "berries", count: 2 }], count: 15 },
  { ingredients: [{ id: "drumstick", count: 1 }, { id: "monstermeat", count: 1 }, { id: "ice", count: 2 }], count: 8 },
];

const ingMap = new Map(cookpotIngredients.map(i => [i.id, i]));

function getIngredientInfo(id: string) {
  const ing = ingMap.get(id);
  return {
    image: ing ? ingredientImage(ing) : undefined,
    name: ing?.nameKo ?? ing?.name ?? id,
  };
}

// ---------------------------------------------------------------------------
// Mock recipe header (미트볼)
// ---------------------------------------------------------------------------

function RecipeHeader() {
  return (
    <div className="flex items-start gap-4">
      <img
        src={assetPath("/images/game-items/meatballs.png")}
        alt="미트볼"
        className="size-16 object-contain shrink-0"
      />
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="text-base font-semibold">미트볼</h3>
        <p className="text-sm text-muted-foreground">Meatballs</p>
        <div className="flex items-center justify-around rounded-lg border border-border bg-surface px-3 py-2 mt-2">
          {[
            { icon: "ui/health.png", label: "체력", value: "+3", color: "text-green-600 dark:text-green-400" },
            { icon: "ui/hunger.png", label: "배고픔", value: "+62.5", color: "text-green-600 dark:text-green-400" },
            { icon: "ui/sanity.png", label: "정신력", value: "+5", color: "text-green-600 dark:text-green-400" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1">
              <img src={assetPath(`/images/${s.icon}`)} alt="" className="size-4" />
              <span className={cn("text-sm font-semibold tabular-nums", s.color)}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Combo Row — 조합 한 줄
// ---------------------------------------------------------------------------

function ComboRow({ combo }: { combo: ComboEntry }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
        {combo.count}회
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {combo.ingredients.map((ing, i) => {
          const info = getIngredientInfo(ing.id);
          return (
            <ItemSlot
              key={i}
              icon={info.image}
              label={info.name}
              badge={ing.count > 1 ? `${ing.count}` : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Design A: 하단 스크롤 추가 방식
// ---------------------------------------------------------------------------

function DesignScroll() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? mockCombos : mockCombos.slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-card max-h-[80dvh] overflow-y-auto">
      <div className="p-4 pt-3 space-y-4">
        <RecipeHeader />

        {/* 필요 재료 (간략) */}
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">필요 재료</span>
          <div className="flex flex-wrap items-center gap-4">
            <ItemSlot icon="meat.png" label="고기" badge="≥0.5" />
            <ItemSlot icon="monstermeat.png" label="괴물" variant="excluded" />
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-border" />

        {/* 인기 조합 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              유저 인기 조합
            </span>
            <span className="text-[10px] text-muted-foreground">
              총 {mockCombos.reduce((s, c) => s + c.count, 0)}회 시뮬
            </span>
          </div>
          <div className="space-y-3">
            {visible.map((combo, i) => (
              <ComboRow key={i} combo={combo} />
            ))}
          </div>
          {mockCombos.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors"
            >
              {expanded ? "접기" : `더보기 (${mockCombos.length - 3}개)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Design B: 탭 + 스와이프 방식
// ---------------------------------------------------------------------------

function DesignTabs() {
  const [activeTab, setActiveTab] = useState<"detail" | "combos">("detail");

  return (
    <div className="rounded-xl border border-border bg-card max-h-[80dvh] overflow-y-auto">
      <div className="p-4 pt-3 space-y-4">
        <RecipeHeader />

        {/* 탭 */}
        <div className="flex rounded-lg border border-border bg-surface p-0.5">
          <button
            onClick={() => setActiveTab("detail")}
            className={cn(
              "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
              activeTab === "detail"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            상세정보
          </button>
          <button
            onClick={() => setActiveTab("combos")}
            className={cn(
              "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
              activeTab === "combos"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            인기 조합
            <span className="ml-1 text-[10px] text-muted-foreground">{mockCombos.length}</span>
          </button>
        </div>

        {/* 탭 인디케이터 */}
        <div className="flex justify-center gap-1.5">
          <div className={cn("size-1.5 rounded-full transition-colors", activeTab === "detail" ? "bg-foreground" : "bg-muted-foreground/30")} />
          <div className={cn("size-1.5 rounded-full transition-colors", activeTab === "combos" ? "bg-foreground" : "bg-muted-foreground/30")} />
        </div>

        {/* 콘텐츠 */}
        {activeTab === "detail" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium">필요 재료</span>
              <div className="flex flex-wrap items-center gap-4">
                <ItemSlot icon="meat.png" label="고기" badge="≥0.5" />
                <ItemSlot icon="monstermeat.png" label="괴물" variant="excluded" />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">사용 불가</span>
              <div className="flex flex-wrap gap-4">
                <ItemSlot icon="tallbirdegg.png" label="알" variant="excluded" />
                <ItemSlot icon="twigs.png" label="못먹는것" variant="excluded" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                인기순
              </span>
              <span className="text-[10px] text-muted-foreground">
                총 {mockCombos.reduce((s, c) => s + c.count, 0)}회
              </span>
            </div>
            <div className="space-y-3">
              {mockCombos.map((combo, i) => (
                <ComboRow key={i} combo={combo} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Design C: 빈 데이터 상태
// ---------------------------------------------------------------------------

function DesignEmpty() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-4 pt-3 space-y-4">
        <RecipeHeader />
        <div className="border-t border-border" />
        <div className="space-y-3">
          <span className="text-xs text-muted-foreground font-medium">유저 인기 조합</span>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <p className="text-sm">아직 조합 데이터가 없습니다</p>
            <p className="text-xs mt-1">요리솥 시뮬레이터에서 레시피를 만들어보세요!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ComboPanel() {
  return (
    <div className="min-h-dvh bg-background text-foreground p-4 pb-20 space-y-8 max-w-md mx-auto">
      <h1 className="text-lg font-bold">인기 조합 패널 디자인 비교</h1>

      {/* Design A */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          A. 하단 스크롤 추가 (기존 패널에 섹션 추가)
        </h2>
        <p className="text-xs text-muted-foreground">
          상세정보 아래 구분선 + 인기 조합 섹션. 기본 3개, 더보기로 확장.
        </p>
        <DesignScroll />
      </section>

      {/* Design B */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          B. 탭 전환 (헤더 고정 + 콘텐츠 탭)
        </h2>
        <p className="text-xs text-muted-foreground">
          헤더(이미지/이름/스탯)는 고정, 아래 콘텐츠를 탭으로 전환. 점 인디케이터 포함.
        </p>
        <DesignTabs />
      </section>

      {/* Empty state */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          C. 빈 데이터 상태
        </h2>
        <p className="text-xs text-muted-foreground">
          조합 데이터가 없을 때 표시되는 안내 문구.
        </p>
        <DesignEmpty />
      </section>
    </div>
  );
}
