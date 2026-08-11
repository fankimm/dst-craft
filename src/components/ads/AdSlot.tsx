"use client";

import { useEffect, useState } from "react";

/**
 * Ezoic 광고 자리(placement) — #75.
 *
 * `layout.tsx`가 이미 Ezoic 본체 스크립트와 `ezstandalone.cmd` 큐를 준비해 두므로,
 * 여기서는 자리별 placeholder div를 그리고 `showAds(<id>)`로 그 자리에 광고를 요청한다.
 * 언마운트 시에는 `destroyPlaceholders`로 정리해야 SPA 전환 후 같은 번호를 다시 쓸 때
 * Ezoic이 빈 자리를 그대로 들고 있지 않는다.
 *
 * placeholder 번호는 Ezoic 대시보드 리포트와 1:1로 대응하므로 한 번 정하면 바꾸지 않는다.
 * 좌우 레일은 서로 다른 번호여야 한다 — 같은 번호를 두 곳에 쓰면 한쪽만 채워진다.
 *
 * 목업 모드: `?admock=<자리>[:<규격>]` (쉼표로 복수). 실제 광고 대신 규격만큼의
 * 자리 표시 박스를 그린다. 자리를 옮기거나 규격을 비교할 때 쓴다.
 *   ?admock=all                      모든 자리 기본 규격
 *   ?admock=infeed,sheet:250x250     인피드 + 시트(250×250)
 */
export type AdVariant = "infeed" | "sheet" | "rail-left" | "rail-right";

/**
 * 자리별 Ezoic placeholder id.
 *
 * **번호를 임의로 고르면 안 된다.** Ezoic 대시보드에는 위치 유형이 이미 정해진
 * placeholder가 등록돼 있고(101=top_of_page, 102=under_page_title, 103=bottom_of_page,
 * 104=sidebar, 105~108=sidebar 계열, 109~115=본문 계열, 100=Adhesion), 번호가 곧
 * "어떤 위치의 광고인지"다. 처음 101~104를 임의로 쓴 결과 왼쪽 레일(103=bottom_of_page)에
 * 970×105 가로 배너가 와서 옆 컨텐츠와 겹쳤다 (#75).
 *
 * 그래서 우리 자리의 실제 성격과 같은 유형의 번호를 골라 쓴다.
 * 번호를 바꾸면 대시보드 리포트의 연속성이 끊기므로 한 번 정한 뒤엔 유지한다.
 */
export const AD_PLACEHOLDER_ID: Record<AdVariant, number> = {
  infeed: 111, // mid_content — 본문 중간, 그리드 행 사이와 성격이 같다
  sheet: 115, // incontent_5 — 본문 안 독립 자리
  "rail-left": 107, // sidebar_floating_1 — 스크롤과 무관하게 옆에 붙어 있는 사이드바
  "rail-right": 108, // sidebar_floating_2
};

/** 표준 광고 규격 (IAB) — 목업에서 규격을 지정할 때 쓴다 */
const MOCK_SIZES: Record<string, { w: number; h: number }> = {
  "320x50": { w: 320, h: 50 },
  "320x100": { w: 320, h: 100 },
  "728x90": { w: 728, h: 90 },
  "300x250": { w: 300, h: 250 },
  "336x280": { w: 336, h: 280 },
  "250x250": { w: 250, h: 250 },
  "200x200": { w: 200, h: 200 },
  "300x100": { w: 300, h: 100 },
  "160x600": { w: 160, h: 600 },
  "300x600": { w: 300, h: 600 },
};

/** 목업 기본 규격 (모바일 / 데스크탑) — 실제 광고는 컨테이너 폭에 맞춰 Ezoic이 고른다 */
const MOCK_DEFAULT: Record<AdVariant, { mobile: string; desktop: string }> = {
  infeed: { mobile: "320x100", desktop: "728x90" },
  sheet: { mobile: "320x100", desktop: "728x90" },
  "rail-left": { mobile: "", desktop: "300x600" },
  "rail-right": { mobile: "", desktop: "300x600" },
};

const MOCK_LABEL: Record<AdVariant, string> = {
  infeed: "그리드 사이",
  sheet: "상세 시트 안",
  "rail-left": "왼쪽 레일",
  "rail-right": "오른쪽 레일",
};

/**
 * 자리별 컨테이너 규격.
 *
 * **Ezoic은 컨테이너 폭을 존중하지 않는다** — 160폭 자리에 300×250을 넣어 옆 컨텐츠와
 * 겹치는 것을 실측했다(#75, beta). 그래서 자리 폭은 "그 자리에 올 수 있는 광고 규격의
 * 최대치"로 잡는다. 잘라내기(overflow:hidden)는 쓰지 않는다 — 광고를 일부 가리는 건
 * 광고 정책 위반이라 계정이 위험해진다.
 *
 * 높이는 최소값만 준다. 예상보다 큰 규격이 와도 자리가 아래로 늘어나면 될 뿐이고,
 * 최소 높이가 있어야 광고가 늦게 도착할 때 컨텐츠가 튀지 않는다.
 */
const SLOT_BOX: Record<AdVariant, string> = {
  // 그리드 한 행 — 320×100 / 300×250 / 728×90 모두 폭 728 안에 들어온다
  infeed: "w-full max-w-[728px] min-h-[100px]",
  // 상세 시트 안 — 시트는 가로로 넓고 세로가 아까운 자리라 띠 형태가 맞다.
  // 폭을 336으로 좁혀 두면 336×280처럼 세로로 큰 광고가 와서 시트 아래를 잠식하고
  // 스크롤을 유발했다 (#75 실측). 인피드와 같은 폭을 주면 728×90 계열 띠가 온다.
  sheet: "w-full max-w-[728px] min-h-[100px]",
  // 데스크탑 레일 — 실측상 sidebar 자리에도 336폭(336×280 계열)이 배달되므로
  // 폭을 336으로 잡는다. 300으로 두면 36px씩 옆 컨텐츠를 침범했다.
  // 세로로 여러 유닛이 쌓여 뷰포트보다 길어지는 경우가 있어 래퍼에서 높이를 흡수한다
  // (AppShell의 `max-h-full overflow-y-auto` 참조).
  "rail-left": "w-[336px] min-h-[600px]",
  "rail-right": "w-[336px] min-h-[600px]",
};

const MOCK_DESKTOP_MIN_WIDTH = 768;

interface EzStandalone {
  cmd: Array<() => void>;
  showAds: (...ids: number[]) => void;
  destroyPlaceholders: (...ids: number[]) => void;
}

/** `?admock=` 파싱 — 자리 → 규격 오버라이드. 쿼리가 없으면 빈 맵(=실제 광고) */
function useAdMock(): Map<string, string | null> {
  const [mocks, setMocks] = useState<Map<string, string | null>>(() => new Map());

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("admock");
    if (!raw) return;
    const next = new Map<string, string | null>();
    for (const entry of raw.split(",")) {
      const [name, size] = entry.trim().split(":");
      if (name) next.set(name, size || null);
    }
    setMocks(next);
  }, []);

  return mocks;
}

export function AdSlot({ variant, className = "" }: { variant: AdVariant; className?: string }) {
  const mocks = useAdMock();
  const isMock = mocks.has(variant) || mocks.has("all");
  const id = AD_PLACEHOLDER_ID[variant];

  // 실제 광고 요청 — 목업 모드에서는 건너뛴다
  useEffect(() => {
    if (isMock) return;
    const ez = (window as unknown as { ezstandalone?: EzStandalone }).ezstandalone;
    if (!ez?.cmd) return;
    ez.cmd.push(() => ez.showAds(id));
    return () => {
      ez.cmd.push(() => ez.destroyPlaceholders(id));
    };
  }, [id, isMock]);

  if (isMock) return <AdSlotMock variant={variant} sizeKey={mocks.get(variant) ?? null} className={className} />;

  return (
    <div className={`flex justify-center py-2 shrink-0 ${className}`} data-ad-slot={variant}>
      <div id={`ezoic-pub-ad-placeholder-${id}`} className={SLOT_BOX[variant]} />
    </div>
  );
}

/** 목업 전용 자리 표시 박스 */
function AdSlotMock({
  variant,
  sizeKey,
  className,
}: {
  variant: AdVariant;
  sizeKey: string | null;
  className: string;
}) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOCK_DESKTOP_MIN_WIDTH}px)`);
    setIsDesktop(mq.matches);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (isDesktop === null) return null;

  const key = sizeKey ?? (isDesktop ? MOCK_DEFAULT[variant].desktop : MOCK_DEFAULT[variant].mobile);
  const size = MOCK_SIZES[key];
  if (!size) return null; // 레일은 모바일 기본 규격이 없다

  return (
    <div
      className={`flex justify-center py-2 shrink-0 ${className}`}
      data-ad-slot={variant}
      data-ad-size={key}
      aria-hidden="true"
    >
      <div
        style={{ width: size.w, height: size.h }}
        className="flex flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 text-muted-foreground/70 select-none overflow-hidden"
      >
        <span className="text-[10px] font-bold tracking-widest uppercase">Advertisement</span>
        <span className="text-[10px]">{MOCK_LABEL[variant]}</span>
        <span className="text-[10px] tabular-nums opacity-70">{key}</span>
      </div>
    </div>
  );
}
