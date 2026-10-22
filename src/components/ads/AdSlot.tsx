"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT, ADSENSE_TEST, type AdVariant } from "@/lib/adsense";

export type { AdVariant };

/**
 * Google AdSense 광고 자리 (#134 — Ezoic placeholder 방식에서 전환).
 *
 * `layout.tsx`가 `adsbygoogle.js`를 로드해 두므로, 여기서는 자리별 `<ins class="adsbygoogle">`
 * 를 그리고 `adsbygoogle.push({})`로 그 자리에 광고를 요청한다. AdSense는 **`<ins>` 하나에
 * 한 번만** 요청할 수 있다 — 같은 노드에 두 번 push하면 "All 'ins' elements … already have
 * ads in them" 오류가 난다. 그래서 자리가 숨겨지면 `<ins>`를 **DOM에서 아예 빼고**, 다시
 * 보일 때 새 노드를 그려 새로 요청한다 (Ezoic의 "destroy 없이 showAds" 규칙과 반대다).
 *
 * 탭은 전부 동시에 마운트돼 있고 비활성 탭은 `display:none`이다. 숨은 탭의 자리에 요청을
 * 보내면 아무도 못 보는 노출이 쌓이고(정책 위반), 폭 0인 `<ins>`는 AdSense가
 * "No slot size for availableWidth=0" 으로 거부한다. 그래서 **보이는 자리만** `<ins>`를 그린다
 * (아래 활성 판정).
 *
 * 목업 모드: `?admock=<자리>[:<규격>]` (쉼표로 복수). 실제 광고 대신 규격만큼의
 * 자리 표시 박스를 그린다. 자리를 옮기거나 규격을 비교할 때 쓴다.
 *   ?admock=all                      모든 자리 기본 규격
 *   ?admock=top:320x100,rail-left    상단 띠(320×100) + 왼쪽 레일(기본 규격)
 */

/**
 * 카드 안쪽 여백(`p-2`, 8px) 몫. 여백 없이 소재를 카드에 꽉 채우면 `rounded-xl` +
 * `overflow-hidden`이 소재 네 귀퉁이(AdChoices 아이콘 포함)를 잘라낸다 (#104 실측).
 */
const CARD_PAD = 16;
/** "AD" 라벨 줄 — 카드 안, 소재 **위**에 자기 줄을 갖는다. 높이가 고정이라 CLS에 안 잡힌다. */
const LABEL_H = 14;

/**
 * 상단 띠 규격 — **CSS로 고정**한다 (320×100 / `md` 이상 728×90).
 *
 * 띠는 컨텐츠 **위**에 있어서 높이가 뒤늦게 정해지면 목록이 통째로 밀린다(CLS, 유입의
 * 65%가 구글이라 순위에 직접 영향). AdSense 반응형 유닛은 도착 시점에 높이를 정하므로 띠에는
 * 못 쓴다 — Google이 문서화한 "CSS 미디어 쿼리로 규격 지정" 방식을 쓴다. 폭·높이를 CSS로 주면
 * AdSense는 **그 크기의 소재만** 보내고, 못 채워도(`data-ad-status="unfilled"`) 박스 크기는
 * 그대로라 전후 높이가 같다.
 *
 * 모바일 폭을 320으로 좁히는 게 핵심이다. 728까지 열어 두면 300×250 같은 사각형이 와서
 * 높이가 250까지 치솟는다 (#75 실측). 브레이크포인트가 `sm`이 아니라 `md`인 이유: SEO 상세
 * 페이지 본문은 640px이고 `AdBleed`가 `md` 이상에서만 728을 만들어 준다 — `sm`(640)에서 728을
 * 그리면 640~767 뷰포트에서 88px이 넘친다.
 */
const BAND_INS_CLASS = "block w-[320px] h-[100px] md:w-[728px] md:h-[90px]";
/** = 띠 placeholder 폭 + CARD_PAD. 바깥 폭은 항상 **소재 폭 + 16**이다 (`AdCard` 주석). */
const BAND_BOX_CLASS = "w-full max-w-[336px] md:max-w-[744px]";

/**
 * 레일 규격 — 반응형 세로(`data-ad-format="vertical"`).
 *
 * 레일은 컨텐츠 **옆**이라 늦게 도착해도 본문이 밀리지 않는다 → 높이를 예약하지 않고
 * AdSense가 폭(336)에 맞는 세로 소재(300×600·336×280·160×600 계열)를 고르게 둔다.
 * 반응형이 고정 규격보다 입찰 수요가 넓어 채움률이 낫다.
 *
 * 세로로 긴 소재가 뷰포트보다 길어지는 경우가 있어 래퍼에서 높이를 흡수한다
 * (AppShell의 `max-h-full overflow-y-auto` 참조). 잘라내기(`overflow:hidden`)는 쓰지 않는다 —
 * 광고를 일부 가리는 건 정책 위반이다.
 */
const RAIL_INS_CLASS = "block w-[336px]";
/** = 레일 placeholder 폭 + CARD_PAD */
const RAIL_BOX_CLASS = "w-[352px]";

const BOX_CLASS: Record<AdVariant, string> = {
  top: BAND_BOX_CLASS,
  "rail-left": RAIL_BOX_CLASS,
  "rail-right": RAIL_BOX_CLASS,
};

/** 표준 광고 규격 (IAB) — 목업에서 규격을 지정할 때 쓴다 */
const MOCK_SIZES: Record<string, { w: number; h: number }> = {
  "320x50": { w: 320, h: 50 },
  "320x100": { w: 320, h: 100 },
  "468x60": { w: 468, h: 60 },
  "728x90": { w: 728, h: 90 },
  "300x250": { w: 300, h: 250 },
  "336x280": { w: 336, h: 280 },
  "250x250": { w: 250, h: 250 },
  "200x200": { w: 200, h: 200 },
  "300x100": { w: 300, h: 100 },
  "160x600": { w: 160, h: 600 },
  "300x600": { w: 300, h: 600 },
};

/** 목업 기본 규격 (모바일 / 데스크탑) — 실제 띠 규격과 같게 둔다 */
const BAND_MOCK = { mobile: "320x100", desktop: "728x90" };
const MOCK_DEFAULT: Record<AdVariant, { mobile: string; desktop: string }> = {
  top: BAND_MOCK,
  "rail-left": { mobile: "", desktop: "300x600" },
  "rail-right": { mobile: "", desktop: "300x600" },
};

const MOCK_LABEL: Record<AdVariant, string> = {
  top: "목록 첫 줄",
  "rail-left": "왼쪽 레일",
  "rail-right": "오른쪽 레일",
};

const MOCK_DESKTOP_MIN_WIDTH = 768;

/**
 * "AD" 라벨 — 광고임을 밝히는 것이라 정책상으로도 권장된다. 콘텐츠로 오인하게 만드는
 * 형태는 금지되므로 라벨을 빼지 말 것. 실제 카드와 목업이 같은 위치에 그려야 하므로
 * 한 곳에서 정의한다.
 */
const AD_LABEL_CLASS = "flex items-center text-[10px] font-medium tracking-wide text-muted-foreground/50";

/** 이 `<ins>`에 실제 소재가 들어왔는가 — AdSense가 응답 뒤 `data-ad-status`를 `filled`/`unfilled`로 박는다 */
export function isAdFilled(el: Element): boolean {
  return el.getAttribute("data-ad-status") === "filled";
}

const warnedMissing = new Set<AdVariant>();

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
  const slot = ADSENSE_SLOT[variant];

  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // 자리가 **보이는 탭에서 화면 가까이 왔을 때만** 활성으로 친다.
  //
  // 판정은 교차 여부 + **레이아웃 박스 유무** 두 가지를 쓴다.
  //  - 교차함            → 활성 (화면에 왔다)
  //  - 안 교차 + 박스 있음 → 활성 유지 (그냥 스크롤로 벗어난 것 — 해제하면 다시 돌아올 때
  //                        새 `<ins>`로 새 노출이 발생해 노출을 부풀리게 된다)
  //  - 안 교차 + 박스 없음 → 비활성 (탭이 숨겨졌다 — `<ins>`를 내린다)
  useEffect(() => {
    if (isMock) return;
    const el = hostRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (e.isIntersecting) {
          setActive(true);
          return;
        }
        const laidOut = e.boundingClientRect.width > 0 || e.boundingClientRect.height > 0;
        if (!laidOut) setActive(false);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isMock]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !slot && !isMock && !warnedMissing.has(variant)) {
      warnedMissing.add(variant);
      console.warn(`[AdSlot] ${variant} 자리의 AdSense slot id가 비어 있다 — src/lib/adsense.ts의 ADSENSE_SLOT에 넣을 것`);
    }
  }, [slot, isMock, variant]);

  if (isMock) return <AdSlotMock variant={variant} sizeKey={mocks.get(variant) ?? null} className={className} />;

  return (
    <div ref={hostRef} className={`flex justify-center py-2 shrink-0 ${className}`} data-ad-slot={variant}>
      {/* **비활성일 때도 같은 껍데기를 그린다.** 빈 div만 두면 활성으로 바뀌는 순간 껍데기
          (라벨 줄 + 상하 패딩)가 새로 생겨 컨텐츠가 밀린다 — 백그라운드 탭에서 로드된 뒤
          포커스가 오면 IntersectionObserver가 그제야 돌아 그대로 CLS다 (#75 실측).
          `<ins>` 자체는 활성일 때만 둔다 (AdSense는 노드당 1회 요청, 위 주석). */}
      {/* key로 활성 전환마다 카드 상태(filled)를 새로 시작한다 — 새 `<ins>`에 옛 판정이 남지 않게.
          껍데기 레이아웃은 같아서 리마운트해도 높이가 안 바뀐다. */}
      <AdCard key={active ? "on" : "off"} variant={variant} slot={active ? slot : null} />
    </div>
  );
}

/**
 * 광고를 앱 카드 스타일로 감싸는 껍데기.
 *
 * 광고 소재 자체는 iframe 안에 완성된 이미지로 오므로 손댈 수 없다. 대신 주변을
 * 앱의 카드(둥근 모서리 + 카드 배경 + 여백)와 같은 언어로 맞춰 이질감을 줄인다.
 *
 * **높이를 만드는 것(사방 패딩·라벨 줄·띠의 고정 규격)은 `filled`와 무관하게 항상 그린다.**
 * 채워질 때만 붙이면 광고가 도착하는 순간 그만큼 컨텐츠가 밀린다 (#75). 빈 회색 카드로
 * 보이게 하는 장식(테두리·배경)과 라벨 글자만 `filled`에 걸어 둔다. 못 채운 띠는 그래서
 * 빈 여백으로 남는다 — 예약을 풀어 위로 당기는 것도 CLS다.
 */
function AdCard({ variant, slot }: { variant: AdVariant; slot: string | null }) {
  const insRef = useRef<HTMLModElement>(null);
  const [filled, setFilled] = useState(false);
  const isBand = variant === "top";
  // `<ins>`를 그리는 조건. slot이 비어 있으면 껍데기만 (요청할 유닛이 없다).
  const live = slot !== null && slot !== "";

  // 요청 — 노드당 정확히 한 번. `data-adsbygoogle-status`는 AdSense가 처리한 노드에 박는
  // 표식이라 (StrictMode 이중 실행 등으로) 같은 노드에 다시 오면 여기서 걸러진다.
  useEffect(() => {
    const el = insRef.current;
    if (!el || !live) return;
    if (el.getAttribute("data-adsbygoogle-status")) return;
    if (el.getBoundingClientRect().width === 0) return; // 폭 0은 AdSense가 거부한다 — 활성 판정이 막지만 이중 안전장치
    const w = window as unknown as { adsbygoogle?: unknown[] };
    (w.adsbygoogle = w.adsbygoogle || []).push({});
  }, [live]);

  // 채움 판정 — AdSense가 응답 뒤 `data-ad-status`를 쓴다. 속성 하나만 보면 되므로 subtree 관찰이 필요 없다.
  // 초기 상태는 다음 틱에 본다(effect 본문에서 동기 setState를 피한다 — 어차피 응답은 한참 뒤다).
  useEffect(() => {
    const el = insRef.current;
    if (!el || !live) return;
    const check = () => setFilled(isAdFilled(el));
    const mo = new MutationObserver(check);
    mo.observe(el, { attributes: true, attributeFilter: ["data-ad-status"] });
    const t = window.setTimeout(check, 0);
    return () => {
      mo.disconnect();
      clearTimeout(t);
    };
  }, [live]);

  return (
    <div className={`${BOX_CLASS[variant]} flex justify-center`}>
      <div
        className={`relative w-fit p-2 ${filled ? "overflow-hidden rounded-xl ring-1 ring-border/50 bg-muted/30" : ""}`}
      >
        <div className={`${AD_LABEL_CLASS} ${filled ? "" : "invisible"}`} style={{ height: LABEL_H }} aria-hidden={!filled}>
          AD
        </div>
        {live ? (
          <ins
            ref={insRef}
            className={`adsbygoogle ${isBand ? BAND_INS_CLASS : RAIL_INS_CLASS}`}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={slot}
            {...(isBand ? {} : { "data-ad-format": "vertical", "data-full-width-responsive": "false" })}
            {...(ADSENSE_TEST ? { "data-adtest": "on" } : {})}
          />
        ) : (
          // 자리만 잡는 상태 — 띠는 같은 크기의 빈 박스로 높이를 지킨다
          <div className={isBand ? BAND_INS_CLASS : RAIL_INS_CLASS} aria-hidden="true" />
        )}
      </div>
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
  if (!key) return null; // 규격이 비어 있는 건 의도된 것 — 레일은 모바일에 자리를 두지 않는다

  // 반면 규격 이름이 있는데 표에 없으면 실수다. 조용히 지우지 말고 눈에 띄게 알린다.
  const size = MOCK_SIZES[key];
  if (!size) {
    if (typeof console !== "undefined") {
      console.warn(`[AdSlotMock] 알 수 없는 규격 "${key}" (자리: ${variant}) — MOCK_SIZES에 추가할 것`);
    }
    return null;
  }

  return (
    <div
      className={`flex justify-center py-2 shrink-0 ${className}`}
      data-ad-slot={variant}
      data-ad-size={key}
      aria-hidden="true"
    >
      {/* 실제 광고와 같은 카드 껍데기 — 목업에서 최종 모습을 그대로 보기 위함 */}
      <div className="relative w-fit overflow-hidden rounded-xl ring-1 ring-border/50 bg-muted/30 p-2">
        <div className={AD_LABEL_CLASS} style={{ height: LABEL_H }}>
          AD
        </div>
        <div
          style={{ width: size.w, height: size.h }}
          className="flex flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 text-muted-foreground/70 select-none overflow-hidden"
        >
          <span className="text-[10px] font-bold tracking-widest uppercase">Advertisement</span>
          <span className="text-[10px]">{MOCK_LABEL[variant]}</span>
          <span className="text-[10px] tabular-nums opacity-70">{key}</span>
        </div>
      </div>
    </div>
  );
}

if (process.env.NODE_ENV !== "production") {
  // 바깥 폭 = 소재 폭 + CARD_PAD 불변식 — 숫자를 한쪽만 고치면 여기서 걸린다
  const pairs: Array<[string, string]> = [
    [BAND_INS_CLASS, BAND_BOX_CLASS],
    [RAIL_INS_CLASS, RAIL_BOX_CLASS],
  ];
  for (const [ins, box] of pairs) {
    const insW = [...ins.matchAll(/w-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    const boxW = [...box.matchAll(/w-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    const want = insW.map((n) => n + CARD_PAD);
    if (boxW.join() !== want.join()) {
      console.error(`[AdSlot] 바깥 폭 ${boxW} ≠ 소재 폭 + ${CARD_PAD} = ${want}`);
    }
  }
}
