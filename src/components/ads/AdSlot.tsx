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

/** 자리별 Ezoic placeholder id — 대시보드 리포트 기준값, 변경 금지 */
export const AD_PLACEHOLDER_ID: Record<AdVariant, number> = {
  infeed: 101,
  sheet: 102,
  "rail-left": 103,
  "rail-right": 104,
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
  sheet: { mobile: "300x100", desktop: "300x100" },
  "rail-left": { mobile: "", desktop: "160x600" },
  "rail-right": { mobile: "", desktop: "160x600" },
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
 * 광고 크기를 코드로 못 박지 않고 자리의 최대 폭·최소 높이만 준다. 그러면 Ezoic이
 * 그 폭에 맞는 규격(예: 좁은 화면 320×100, 넓은 화면 728×90)을 알아서 채운다.
 * 최소 높이를 주는 이유는 광고가 늦게 도착할 때 컨텐츠가 밀리지 않게 하기 위함.
 */
const SLOT_BOX: Record<AdVariant, string> = {
  // 그리드 한 행을 통째로 — 모바일 320×100 ~ 데스크탑 728×90
  infeed: "w-full max-w-[728px] min-h-[100px] sm:min-h-[90px]",
  // 상세 시트 안 — 300×100 고정
  sheet: "w-[300px] min-h-[100px]",
  // 데스크탑 레일 — 1280~1600은 160폭, 1600 이상은 300폭 (그 아래 화면은 아예 미표시)
  "rail-left": "w-[160px] min-[1600px]:w-[300px] min-h-[600px]",
  "rail-right": "w-[160px] min-[1600px]:w-[300px] min-h-[600px]",
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

  // 레일 기본 규격은 실제 컨테이너 규칙(1600 이상은 300폭)을 그대로 따라간다
  const isWide = isDesktop && window.innerWidth >= 1600;
  const fallback = isDesktop
    ? variant.startsWith("rail") && isWide
      ? "300x600"
      : MOCK_DEFAULT[variant].desktop
    : MOCK_DEFAULT[variant].mobile;
  const key = sizeKey ?? fallback;
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
