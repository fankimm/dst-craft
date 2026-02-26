"use client";

import { X } from "lucide-react";
import { assetPath } from "@/lib/asset-path";

const mockTags = {
  characterOnly: [
    { text: "윌슨", portrait: "wilson" },
    { text: "위그프리드", portrait: "wigfrid" },
    { text: "왈리", portrait: "warly" },
    { text: "웜우드", portrait: "wormwood" },
  ],
  general: ["곡괭이", "도끼", "나뭇가지", "도구", "갑옷"],
};

// --- Style A: 캐릭터만 구분 (amber) ---
function StyleA() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        방법 A: 캐릭터만 구분
      </h3>
      <p className="text-xs text-muted-foreground">
        캐릭터 태그 = amber + 초상화 / 나머지 = 기존 스타일 동일
      </p>
      <div className="flex flex-wrap gap-1.5">
        {mockTags.characterOnly.map((tag) => (
          <span
            key={tag.text}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <img
              src={assetPath(
                `/images/category-icons/characters/${tag.portrait}.png`
              )}
              alt={tag.text}
              className="size-4 object-contain"
            />
            {tag.text}
            <button className="rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        ))}
        {mockTags.general.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
          >
            {tag}
            <button className="rounded-full hover:bg-primary/20 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Style B: 전부 분류 (캐릭터=amber, 카테고리=blue, 재료=green, 텍스트=기본) ---
function StyleB() {
  const categoryTags = ["도구", "갑옷"];
  const materialTags = ["나뭇가지"];
  const textTags = ["곡괭이", "도끼"];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        방법 B: 전부 분류 (캐릭터/카테고리/재료/텍스트)
      </h3>
      <p className="text-xs text-muted-foreground">
        캐릭터 = amber + 초상화 / 카테고리 = blue / 재료 = green / 텍스트 =
        기본
      </p>
      <div className="flex flex-wrap gap-1.5">
        {mockTags.characterOnly.map((tag) => (
          <span
            key={tag.text}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <img
              src={assetPath(
                `/images/category-icons/characters/${tag.portrait}.png`
              )}
              alt={tag.text}
              className="size-4 object-contain"
            />
            {tag.text}
            <button className="rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        ))}
        {categoryTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-300"
          >
            {tag}
            <button className="rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        ))}
        {materialTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-green-300 bg-green-50 text-green-800 dark:border-green-700/60 dark:bg-green-950/40 dark:text-green-300"
          >
            {tag}
            <button className="rounded-full hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        ))}
        {textTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
          >
            {tag}
            <button className="rounded-full hover:bg-primary/20 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Comparison: Side by side in a search bar context ---
function MockSearchBar({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <div className="space-y-1.5 rounded-lg border border-border bg-surface p-3">
        <div className="relative">
          <div className="h-8 w-full rounded-md border border-input bg-surface px-3 py-1.5 text-sm text-muted-foreground flex items-center">
            검색어 입력...
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">{children}</div>
      </div>
    </div>
  );
}

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            태그 스타일 비교
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            검색 태그에서 캐릭터 고유 아이템을 구분하는 방식 비교
          </p>
        </div>

        <hr className="border-border" />

        {/* Style A */}
        <StyleA />

        <hr className="border-border" />

        {/* Style B */}
        <StyleB />

        <hr className="border-border" />

        {/* In-context mock: A */}
        <MockSearchBar label="검색바 컨텍스트 — 방법 A">
          {mockTags.characterOnly.slice(0, 2).map((tag) => (
            <span
              key={tag.text}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <img
                src={assetPath(
                  `/images/category-icons/characters/${tag.portrait}.png`
                )}
                alt={tag.text}
                className="size-4 object-contain"
              />
              {tag.text}
              <button className="rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors p-0.5 -mr-0.5">
                <X className="size-3" />
              </button>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            도구
            <button className="rounded-full hover:bg-primary/20 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            나뭇가지
            <button className="rounded-full hover:bg-primary/20 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        </MockSearchBar>

        {/* In-context mock: B */}
        <MockSearchBar label="검색바 컨텍스트 — 방법 B">
          {mockTags.characterOnly.slice(0, 2).map((tag) => (
            <span
              key={tag.text}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <img
                src={assetPath(
                  `/images/category-icons/characters/${tag.portrait}.png`
                )}
                alt={tag.text}
                className="size-4 object-contain"
              />
              {tag.text}
              <button className="rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors p-0.5 -mr-0.5">
                <X className="size-3" />
              </button>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-300">
            도구
            <button className="rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-green-300 bg-green-50 text-green-800 dark:border-green-700/60 dark:bg-green-950/40 dark:text-green-300">
            나뭇가지
            <button className="rounded-full hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors p-0.5 -mr-0.5">
              <X className="size-3" />
            </button>
          </span>
        </MockSearchBar>

        <hr className="border-border" />

        {/* Current style for reference */}
        <MockSearchBar label="현재 스타일 (참고)">
          {["윌슨", "위그프리드", "도구", "나뭇가지", "곡괭이"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
            >
              {tag}
              <button className="rounded-full hover:bg-primary/20 transition-colors p-0.5 -mr-0.5">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </MockSearchBar>
      </div>
    </div>
  );
}
