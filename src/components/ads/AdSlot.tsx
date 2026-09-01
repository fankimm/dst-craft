"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ezoic 광고 자리(placement) — #75.
 *
 * `layout.tsx`가 이미 Ezoic 본체 스크립트와 `ezstandalone.cmd` 큐를 준비해 두므로,
 * 여기서는 자리별 placeholder div를 그리고 `showAds(<id>)`로 그 자리에 광고를 요청한다.
 * 같은 번호를 쥔 자리가 바뀔 때는 `destroyPlaceholders` 없이 `showAds`만 다시 부른다 —
 * destroy는 지목하지 않은 다른 자리의 광고까지 비운다 (`flushAdQueue` 주석 참조).
 * 자리가 화면에서 아예 사라질 때만 해제한다.
 *
 * placeholder 번호는 Ezoic 대시보드 리포트와 1:1로 대응하므로 한 번 정하면 바꾸지 않는다.
 * 좌우 레일은 서로 다른 번호여야 한다 — 같은 번호를 두 곳에 쓰면 한쪽만 채워진다.
 *
 * **번호는 탭이 아니라 "자리 역할"(상단 띠 / 시트 / 레일) 단위로 공유한다.**
 * 탭은 전부 동시에 마운트돼 있지만, 아래 활성 판정 덕분에 **보이는 탭의 자리만** id를
 * 가진 div를 그린다. 그래서 문서 안에 같은 번호가 둘 이상 존재하는 일이 없다.
 * (탭마다 번호를 따로 쓰면 탭이 늘어날 때마다 번호가 고갈된다 — 대시보드에 등록된
 * 본문 계열 번호는 109~115뿐이다.)
 *
 * 목업 모드: `?admock=<자리>[:<규격>]` (쉼표로 복수). 실제 광고 대신 규격만큼의
 * 자리 표시 박스를 그린다. 자리를 옮기거나 규격을 비교할 때 쓴다.
 *   ?admock=all                      모든 자리 기본 규격
 *   ?admock=infeed,sheet:250x250     인피드 + 시트(250×250)
 */
export type AdVariant = "top" | "sheet" | "rail-left" | "rail-right";

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
  // 목록 맨 위 (검색바 바로 아래) — 모든 탭이 한 번호를 공유한다.
  // 102(under_page_title)·109(under_first_paragraph)는 beta 실측에서 계속 비어 있었다.
  // 같은 조건에서 110~113(본문 계열)은 잘 채워졌으므로 그쪽을 쓴다 (#75).
  top: 111, // mid_content — 실측에서 가장 안정적으로 채워졌다
  // 상세 시트는 한 번에 하나만 열린다.
  // 115(incontent_5)는 300×600·336×280 같은 세로로 긴 소재를 배달해 시트를 잡아먹었다
  // (#75, 사용자 지적). 103(bottom_of_page)은 실측에서 970×105 가로 띠가 왔고, 시트
  // 본문 끝이라는 위치 성격과도 맞아 이쪽으로 옮겼다.
  sheet: 103, // bottom_of_page — 가로 띠 계열
  // 데스크탑 레일은 AppShell에 한 쌍만 있다
  "rail-left": 107, // sidebar_floating_1
  "rail-right": 108, // sidebar_floating_2
};

/**
 * 가로 띠 자리 공통 규격.
 *
 * **모바일 폭을 320으로 좁히는 게 핵심.** 폭을 728까지 열어 두면 모바일에서도 Ezoic이
 * 300×250·336×280 같은 사각형을 넣어 높이가 250~280까지 치솟는다 (#75 실측, 사용자
 * 지적). 320으로 좁히면 320×100·320×50 계열 띠가 온다.
 *
 * 폭과 최소 높이를 분리해 두는 이유는 `AdCard` 주석 참조 (폭은 항상, 높이는 채워졌을 때만).
 */
const BAND_BOX = {
  w: "w-full max-w-[320px] sm:max-w-[728px]",
  minH: "min-h-[50px]",
  // 예약 높이는 **띠 계열 소재 중 가장 높은 것**에 맞춘다 = 320×100의 100px.
  // 50px로 잡았더니 728×90이 도착할 때마다 40px씩 밀렸고, 데스크탑만 90px로 좁혔더니
  // 이번엔 데스크탑에 320×100이 와서 10px 밀렸다 (실측 `measure-cls`). 브레이크포인트를
  // 나눠 봐야 10px 아끼고 시프트를 만드는 꼴이라 100px 하나로 고정한다.
  reserve: "min-h-[100px]",
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

/** 목업 기본 규격 (모바일 / 데스크탑) — 실제 광고는 컨테이너 폭에 맞춰 Ezoic이 고른다 */
const BAND_MOCK = { mobile: "320x50", desktop: "468x60" };
const MOCK_DEFAULT: Record<AdVariant, { mobile: string; desktop: string }> = {
  top: BAND_MOCK,
  sheet: BAND_MOCK,
  "rail-left": { mobile: "", desktop: "300x600" },
  "rail-right": { mobile: "", desktop: "300x600" },
};

const MOCK_LABEL: Record<AdVariant, string> = {
  top: "목록 첫 줄",
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
/**
 * `reserve` — 광고가 오기 전에도 비워 둘 최소 높이.
 *
 * 가로 띠는 컨텐츠 **위**에 있어서, 광고가 늦게 도착하면 목록이 통째로 아래로 밀린다
 * (CLS). 유입의 65%가 구글이라 순위에 직접 영향이 있으므로 미리 비워 둔다.
 *
 * **예약 높이는 광고가 도착한 뒤에도 그대로 유지한다.** 채워졌을 때만 `minH`로 줄이면,
 * 100px 예약한 자리에 320×50이 오는 순간 컨텐츠가 위로 50px 당겨진다 — 위로 당기는
 * 것도 CLS로 잡히므로 예약해 놓고 예약을 무효로 만드는 꼴이다 (#75).
 * 같은 이유로 카드 껍데기(AD 라벨 + 상하 패딩)도 `filled`와 무관하게 항상 그린다.
 * 그래서 이 값은 "그 폭에 올 수 있는 가장 높은 소재" 하나로 고정한다.
 *
 * 레일은 컨텐츠 **옆**이라 늦게 도착해도 본문이 밀리지 않는다 → 예약하지 않는다.
 */
const SLOT_BOX: Record<AdVariant, { w: string; minH: string; reserve?: string }> = {
  // 목록 맨 위 한 행 (검색바 바로 아래) — 길고 얇은 띠
  top: BAND_BOX,
  // 상세 시트 안 — 시트는 가로로 넓고 세로가 아까운 자리라 띠 형태가 맞다.
  // 폭을 336으로 좁혀 두면 336×280처럼 세로로 큰 광고가 와서 시트 아래를 잠식하고
  // 스크롤을 유발했다 (#75 실측).
  // 넓은 화면에서 970까지 열어 두는 건 103(bottom_of_page)이 970×105 띠를 배달하기
  // 때문이다 — 728로 묶어 두면 그 규격이 자리를 삐져나온다.
  // 시트 광고는 본문 아래라 밀릴 컨텐츠가 없다 → 예약 불필요
  sheet: { w: "w-full max-w-[320px] sm:max-w-[728px] lg:max-w-[970px]", minH: "min-h-[50px]" },
  // 데스크탑 레일 — 실측상 sidebar 자리에도 336폭(336×280 계열)이 배달되므로
  // 폭을 336으로 잡는다. 300으로 두면 36px씩 옆 컨텐츠를 침범했다.
  // 세로로 여러 유닛이 쌓여 뷰포트보다 길어지는 경우가 있어 래퍼에서 높이를 흡수한다
  // (AppShell의 `max-h-full overflow-y-auto` 참조).
  "rail-left": { w: "w-[336px]", minH: "min-h-[600px]" },
  "rail-right": { w: "w-[336px]", minH: "min-h-[600px]" },
};

const MOCK_DESKTOP_MIN_WIDTH = 768;

interface EzStandalone {
  cmd: Array<() => void>;
  showAds: (...ids: number[]) => void;
  destroyPlaceholders: (...ids: number[]) => void;
}

/**
 * Ezoic 동작 설정(`config()`)은 여기가 아니라 `layout.tsx`의 인라인 스크립트에 있다.
 *
 * 예전에는 첫 배치를 내보내기 직전에 밀어 넣었다. 우리 `showAds`보다는 앞이지만,
 * Ezoic 본체는 head에서 async로 먼저 떠서 **자동 유닛(anchor·vignette·video)과 초기
 * 쿠키 싱크를 그 전에 이미 시작**한다. 마운트 → 교차 판정 → 250ms 디바운스를 기다리는
 * 위치라 `limitCookies` 같은 초기 픽셀 대상 옵션이 늦어 안 먹었다 (#75).
 * `cmd` 큐를 만드는 자리 바로 뒤가 유일하게 확실한 시점이다.
 */

/**
 * 광고 요청 배칭 (#75).
 *
 * **자리마다 따로 `showAds(id)`를 부르면 안 된다.** Ezoic은 한 번의 요청을 입찰→렌더
 * 사이클로 처리하는데, 그 사이클이 도는 중에 들어온 다음 `showAds`는 그냥 흘려버린다.
 * 레일은 마운트 즉시, 목록 첫 줄 띠는 IntersectionObserver가 걸린 뒤 — 이렇게 시점이
 * 어긋난 탓에 어느 쪽이든 늦게 들어온 자리가 빈 채로 남았다 (사용자 지적: "양옆이
 * 언젠 뜨고 언젠 안 뜨고", "상단 가로 긴 게 뜨다 안 뜨다").
 *
 * 그래서 같은 틱에 생긴 요청을 한 번의 `showAds(...ids)`로 모은다. 사이클이 한 번만
 * 돌기 때문에 자리가 누락되지 않고, 광고가 붙는 시점도 빨라진다.
 * 해제도 같은 배치에서 먼저 처리한다 — Ezoic 문서가 권하는 SPA 패턴(destroy 후 show).
 */
/**
 * 번호마다 **어느 자리(컴포넌트 인스턴스)가 그 번호를 쥐고 있는지**를 추적한다.
 *
 * 단순히 "이 번호를 쓰는 자리가 있는가"만 세면 탭 전환에서 광고가 죽는다. 상단 띠는
 * 모든 탭이 같은 번호를 쓰므로, 탭을 바꾸면 A탭의 placeholder div가 언마운트되고
 * B탭의 새 div가 마운트된다. 참조 수는 계속 1이라 아무 요청도 안 나가고, Ezoic은
 * 이미 DOM에서 사라진 옛 div에 광고를 들고 있는 상태가 된다 — 새 자리는 영영 비고,
 * 그 상태에서 다음 사이클이 돌면 레일 광고까지 함께 날아갔다 (#75 beta 실측).
 *
 * 그래서 주인이 바뀌면 `destroy → show`로 그 번호를 새 div에 다시 붙인다.
 * 해제는 **자기가 주인일 때만** 반영하므로, 언마운트(해제)가 새 자리의 요청보다
 * 늦게 도착해도 방금 잡은 자리를 빼앗지 않는다.
 */
type SlotToken = { id: number };
const desiredOwner = new Map<number, SlotToken>();
/** 지금 Ezoic이 광고를 붙여 둔 주인 — 같은 주인이면 다시 요청하지 않는다 (노출 부풀리기 방지) */
const shownOwner = new Map<number, SlotToken>();
let flushScheduled = false;

function flushAdQueue() {
  flushScheduled = false;
  const ez = (window as unknown as { ezstandalone?: EzStandalone }).ezstandalone;
  if (!ez?.cmd) return;
  const show: number[] = [];
  const destroy: number[] = [];
  const ids = new Set([...desiredOwner.keys(), ...shownOwner.keys()]);
  for (const id of ids) {
    const want = desiredOwner.get(id);
    const have = shownOwner.get(id);
    if (want && want !== have) {
      // 주인이 바뀐 자리(탭 전환·목록 전환) — destroy 없이 show만 부른다.
      // Ezoic이 새 div를 찾아 다시 채운다.
      show.push(id);
      shownOwner.set(id, want);
    } else if (!want && have) {
      // 자리가 아예 사라졌다 (시트 닫힘, 광고 자리 없는 탭) — 이때만 해제한다.
      // 안 지우면 화면에서 사라진 자리에 리프레시가 계속 걸려 유령 노출이 쌓인다.
      destroy.push(id);
      shownOwner.delete(id);
    }
  }
  if (!show.length && !destroy.length) return;

  // **배치가 나가면 지목하지 않은 자리의 광고까지 비워진다.** 그래서 배치를 낼 때는
  // 살아 있는 자리를 **전부** 함께 요청한다.
  //
  // #75에서는 이 현상을 `destroy` 전용으로 봤고(`destroy(111); showAds(111)` 한 번에
  // 레일 두 개가 빈 div가 됐다), 그래서 해제가 낀 배치에서만 나머지를 재요청했다.
  // 그 전제가 틀렸다 — **`showAds` 단독으로도 같은 일이 일어난다** (#94 실측).
  // 상세 시트를 열면 `#111`의 주인이 바뀌어 배치가 `showAds(111)` 하나만 내보내는데,
  // 그 호출에 레일 `#107`·`#108`이 높이 0인 빈 div가 됐다. destroy가 없으니 위 복구
  // 로직도 안 타서 **시트를 닫아도 돌아오지 않았다** — 그 세션 동안 레일은 영구 사망이고,
  // 레일은 최근 7일 수익의 13%다(`docs/ezoic-decision.md`).
  //
  // 이미 채워진 자리를 다시 요청하는 비용이 생기지만, 배치 자체는 `shownOwner` 비교로
  // 변화가 있을 때만 나가므로 유휴 상태에서 반복 요청이 돌지는 않는다. 자리가 죽은 채로
  // 남는 것보다 재요청이 낫다.
  for (const [id, owner] of desiredOwner) {
    if (!show.includes(id)) {
      show.push(id);
      shownOwner.set(id, owner);
    }
  }
  ez.cmd.push(() => {
    if (destroy.length) ez.destroyPlaceholders(...destroy);
    if (show.length) ez.showAds(...show);
  });
}

/**
 * 배치 창 — 한 번의 화면 전환에서 생기는 해제·요청을 **한 배치로** 묶는다.
 *
 * 0ms로 두면 안 된다. 화면 안에서 자리가 옮겨갈 때(카테고리 → 목록) 옛 자리의 해제는
 * React 커밋에서, 새 자리의 요청은 그다음 프레임의 IntersectionObserver 콜백에서 온다.
 * 두 틱으로 갈리면 배치가 두 번 나가고, 그때마다 살아 있는 다른 자리(레일)까지 다시
 * 요청돼 노출이 헛돈다 (#75 실측: `destroy(111) / show(107,108) / show(107,108,111)`).
 *
 * 250ms면 그 간극을 덮으면서 광고 표시가 늦어지는 체감은 없다. 변화가 계속 들어오면
 * 창을 미루되, 첫 예약으로부터 `FLUSH_MAX_WAIT_MS`가 지나면 굶지 않도록 그대로 내보낸다.
 */
const FLUSH_DEBOUNCE_MS = 250;
/**
 * 해제만 쌓인 상태는 더 기다린다.
 *
 * 화면 안에서 자리가 옮겨갈 때(카테고리 → 목록, 검색 결과 전환) 옛 자리의 해제가
 * 먼저 오고 새 자리의 요청은 렌더·교차 판정을 거쳐 한참 뒤에 온다. 250ms 안에 못 들어오면
 * 배치가 둘로 갈리고, 그 사이 살아 있는 레일까지 다시 요청돼 노출이 헛돈다
 * (#75 실측: 검색에서 `destroy(111) / show(107,108) / show(107,108,111)`).
 *
 * 어차피 그 순간 화면에는 그 자리가 없으므로 해제를 조금 늦춰도 사용자에겐 차이가 없다.
 */
const FLUSH_RELEASE_ONLY_MS = 900;
const FLUSH_MAX_WAIT_MS = 1500;
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let firstScheduledAt = 0;

/** 새로 자리를 잡으려는 요청이 하나라도 있는가 (해제만 남은 상태와 구분) */
function hasPendingClaim(): boolean {
  for (const [id, want] of desiredOwner) {
    if (shownOwner.get(id) !== want) return true;
  }
  return false;
}

function scheduleAdFlush() {
  const now = performance.now();
  if (!flushScheduled) {
    flushScheduled = true;
    firstScheduledAt = now;
  } else {
    clearTimeout(flushTimer);
  }
  const base = hasPendingClaim() ? FLUSH_DEBOUNCE_MS : FLUSH_RELEASE_ONLY_MS;
  const remaining = FLUSH_MAX_WAIT_MS - (now - firstScheduledAt);
  flushTimer = setTimeout(flushAdQueue, Math.max(0, Math.min(base, remaining)));
}

function requestAd(token: SlotToken) {
  desiredOwner.set(token.id, token);
  scheduleAdFlush();
}

function releaseAd(token: SlotToken) {
  // 이미 다른 자리가 이 번호를 가져갔다면 건드리지 않는다
  if (desiredOwner.get(token.id) === token) desiredOwner.delete(token.id);
  scheduleAdFlush();
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

  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // 자리가 **보이는 탭에서 화면 가까이 왔을 때만** 활성으로 친다.
  //
  // 탭은 전부 동시에 마운트돼 있고 비활성 탭은 `display:none`이다. 무조건 요청하면
  // 아무도 볼 수 없는 노출이 쌓이고(광고 정책 위반), 같은 번호의 placeholder div가
  // 문서에 여러 개 생겨 Ezoic이 엉뚱한(숨은) 쪽을 채운다.
  //
  // 판정은 교차 여부 + **레이아웃 박스 유무** 두 가지를 쓴다.
  //  - 교차함            → 활성 (화면에 왔다)
  //  - 안 교차 + 박스 있음 → 활성 유지 (그냥 스크롤로 벗어난 것 — 해제하면 다시 돌아올 때
  //                        새 노출이 발생해 노출을 부풀리게 된다)
  //  - 안 교차 + 박스 없음 → 비활성 (탭이 숨겨졌다 — 자리를 반납한다)
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

  // 실제 광고 요청 — 목업 모드에서는 건너뛴다.
  // 개별 호출이 아니라 배치 큐를 거친다 (위 `requestAd` 주석 참조).
  useEffect(() => {
    if (isMock || !active) return;
    // effect마다 새 토큰 = "이번에 그려진 placeholder div"의 신분증.
    // 같은 번호라도 div가 새로 생기면 토큰이 달라져 destroy → show가 나간다.
    const token = { id };
    requestAd(token);
    return () => releaseAd(token);
  }, [id, isMock, active]);

  if (isMock) return <AdSlotMock variant={variant} sizeKey={mocks.get(variant) ?? null} className={className} />;

  const box = SLOT_BOX[variant];

  return (
    <div ref={hostRef} className={`flex justify-center py-2 shrink-0 ${className}`} data-ad-slot={variant}>
      {/* **비활성일 때도 같은 껍데기를 그린다.** 예전에는 빈 div만 뒀는데, 그러면
          활성으로 바뀌는 순간 껍데기(라벨 줄 + 상하 패딩 ≈27px)가 새로 생겨 컨텐츠가
          밀린다. 활성 전환이 첫 페인트보다 늦는 경우 — 백그라운드 탭에서 로드된 뒤
          포커스가 오면 IntersectionObserver가 그제야 돈다 — 그대로 CLS다
          (#75, beta 실측: 116px → 143px).
          id는 활성일 때만 붙인다. 그래야 숨은 탭까지 포함해 문서에 같은 번호가
          둘 이상 생기지 않는다 — 자리 자체는 그리되 Ezoic 눈에는 안 띈다. */}
      <AdCard placeholderId={active ? id : null} box={box} />
    </div>
  );
}

/**
 * 광고를 앱 카드 스타일로 감싸는 껍데기.
 *
 * 광고 소재 자체는 iframe 안에 완성된 이미지로 오므로 손댈 수 없다. 대신 주변을
 * 앱의 카드(둥근 모서리 + 카드 배경 + 여백)와 같은 언어로 맞춰 이질감을 줄인다.
 * "AD" 라벨은 광고임을 밝히는 것이라 정책상으로도 권장된다 — 콘텐츠로 오인하게
 * 만드는 형태는 금지되므로 라벨을 빼지 말 것.
 *
 * 광고가 안 오면 Ezoic이 placeholder를 `display:none`으로 접는다. 그때 껍데기만 남아
 * 빈 카드가 보이면 안 되므로, 채워졌는지 직접 감시해서 그때만 카드 옷을 입힌다.
 */

/**
 * 자리에 **실제 소재**가 들어왔는지 판정한다.
 *
 * "자식이 하나라도 있으면 채워진 것"으로 보면 안 된다 — 재고가 안 붙어도(no-fill) Ezoic은
 * 규격만큼 공간을 잡고 18×18 자사 뱃지 이미지 하나만 넣는다. 그 상태를 채워진 것으로
 * 오판해서 카드 옷을 입히는 바람에, 사용자 화면에 **텅 빈 회색 "AD" 박스**가 728×90,
 * 336×250 크기로 그려졌다 (#75 beta 실측).
 *
 * 그래서 소재로 볼 만한 것 — iframe, 뱃지보다 큰 이미지, 텍스트 — 이 있을 때만 채워진
 * 것으로 친다.
 *
 * `AdVisibilityProbe`(#85)가 노출률 계측에서 같은 판정을 쓴다. no-fill을 노출로 오판하면
 * 차단율이 실제보다 낮게 나오므로, 판정 기준은 반드시 한 곳에서만 정의한다.
 */
export function hasCreative(el: HTMLElement): boolean {
  if (el.querySelector("iframe")) return true;
  if (el.innerText.trim().length > 0) return true;
  const BADGE_MAX = 40; // Ezoic 뱃지는 18×18
  return [...el.querySelectorAll("img")].some((img) => img.getBoundingClientRect().width > BADGE_MAX);
}
function AdCard({
  placeholderId,
  box,
}: {
  /** `null`이면 자리만 잡는 상태 — id를 안 붙여 Ezoic이 이 div를 못 찾는다 */
  placeholderId: number | null;
  box: { w: string; minH: string; reserve?: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || placeholderId === null) return;
    const check = () => {
      setFilled(getComputedStyle(el).display !== "none" && hasCreative(el));
    };
    // 판정 자체가 `getComputedStyle` + `innerText` + `getBoundingClientRect`라 전부
    // 강제 레이아웃을 유발한다. mutation마다 동기로 돌리면 광고 렌더 한 번에 수십~수백
    // 번씩 리플로우가 걸리고, 넓은 화면에서는 자리 네 곳이 동시에 그걸 한다 (INP 악화).
    // 프레임당 한 번으로 모은다 — 판정 결과는 달라지지 않는다.
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        check();
      });
    };
    // Ezoic은 스타일과 자식을 여러 번에 걸쳐 갈아끼운다 (입찰 → 렌더 → 리프레시).
    // 소재는 placeholder 바로 아래가 아니라 몇 겹 안쪽에 들어오므로 subtree까지 본다.
    const mo = new MutationObserver(schedule);
    mo.observe(el, { attributes: true, attributeFilter: ["style", "class"], childList: true, subtree: true });
    check();
    // 이미지 소재는 로드 전 크기가 0이라 첫 판정에서 놓친다 — 몇 번 더 확인한다
    const timers = [300, 1000, 2500, 5000].map((ms) => window.setTimeout(check, ms));
    // 같은 placeholder id가 문서에 둘 이상 있으면 Ezoic이 어느 쪽을 채울지 예측할 수
    // 없다(Ezoic 문서 명시). 지금은 "보이는 자리만 렌더" 규칙으로 막고 있지만, 탭이나
    // 화면이 하나 늘 때 조용히 깨진다 — 개발 빌드에서 실제 DOM을 세어 즉시 드러낸다.
    // 전환 도중 옛 자리와 새 자리가 한 프레임 겹칠 수 있어 잠시 뒤에 센다.
    if (process.env.NODE_ENV !== "production") {
      timers.push(
        window.setTimeout(() => {
          const n = document.querySelectorAll(`[id="ezoic-pub-ad-placeholder-${placeholderId}"]`).length;
          if (n > 1) {
            console.error(
              `[AdSlot] placeholder ${placeholderId} 가 문서에 ${n}개 있다 — 같은 자리가 한 화면에 둘 이상 보인다`,
            );
          }
        }, 600),
      );
    }
    return () => {
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [placeholderId]);

  // **폭은 광고가 오기 전에도 반드시 유지해야 한다.** 카드 옷을 입힐 때만 폭을 주면
  // 미충전 상태에서 자리 폭이 0으로 붕괴하고, Ezoic은 폭 0인 자리에 광고를 넣지 못해
  // 영원히 안 채워진다 (#75에서 top 자리가 이 상태로 죽어 있었다).
  //
  // 바깥(자리)은 폭을 잡아 두고, 카드 옷은 안쪽에서 `w-fit`으로 실제 광고 크기에만
  // 맞춘다. 카드를 자리 폭 전체로 그리면 728 광고 주위로 카드가 864까지 벌어져 헐렁하다.
  //
  // **높이를 만드는 것(상하 패딩 + AD 라벨 줄)은 `filled`와 무관하게 항상 그린다.**
  // 채워질 때만 붙이면 광고가 도착하는 순간 그 높이만큼 컨텐츠가 밀린다 — 예약 높이를
  // 올려도 이 몫은 그대로 남아 CLS가 사라지지 않았다 (#75). 빈 회색 카드로 보이게 하는
  // 장식(테두리·배경)과 라벨 글자만 `filled`에 걸어 둔다.
  const bodyH = box.reserve ?? (filled ? box.minH : "");
  return (
    <div className={`${box.w} flex justify-center`}>
      <div
        className={`pb-1 pt-1 ${
          filled ? "w-fit overflow-hidden rounded-xl ring-1 ring-border/50 bg-muted/30" : "w-full"
        }`}
      >
        <div
          className={`px-2 pb-1 text-[10px] font-medium tracking-wide text-muted-foreground/50 ${
            filled ? "" : "invisible"
          }`}
          aria-hidden={!filled}
        >
          AD
        </div>
        <div
          ref={ref}
          id={placeholderId === null ? undefined : `ezoic-pub-ad-placeholder-${placeholderId}`}
          className={filled ? bodyH : `w-full ${bodyH}`}
        />
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

  // 반면 규격 이름이 있는데 표에 없으면 실수다. 예전에 기본값만 468×60으로 바꾸고 표에
  // 항목을 안 넣어 데스크탑 띠 목업이 통째로 사라진 적이 있다 (#75, bf9bbf07).
  // 조용히 지우지 말고 눈에 띄게 알린 뒤 최소 크기로라도 그린다.
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
      <div className="overflow-hidden rounded-xl ring-1 ring-border/50 bg-muted/30 pb-1 pt-1">
        <div className="px-2 pb-1 text-[10px] font-medium tracking-wide text-muted-foreground/50">
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
