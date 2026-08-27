"use client";

import { useEffect, useRef } from "react";
import { hasCreative } from "./AdSlot";
import { useAuth } from "@/hooks/use-auth";
import { trackAdVisibility } from "@/lib/analytics";

/**
 * 광고가 이 방문자에게 **실제로 도달했는지**, 도달했다면 **얼마나 걸렸는지**를
 * 세션당 한 번 보고한다 (#85, 판정 방식 교정 #86).
 *
 * 왜 필요한가: Ezoic 대시보드는 **채워진 노출만** 보여준다. ePMV가 낮을 때 원인이
 * 재고가 안 붙어서(no-fill)인지 단가가 낮아서인지 가릴 수 없다. 우리 쪽에서
 * "요청은 나갔는데 소재가 안 왔다"를 직접 세면 그 구분이 선다.
 *
 * 이 자리가 **우리 트래킹은 살아 있고 광고만 죽은 세션**까지 잡을 수 있는 유일한
 * 지점이다 — 자체 트래킹은 이미 광고차단 필터를 피하는 경로(`/_t`)를 쓴다 (#34).
 *
 * 화면에는 아무것도 그리지 않는다.
 */

/**
 * **고정 시각에 판정하지 않는다** (#86).
 *
 * 처음에는 4초 체크포인트 한 번으로 판정했다. 근거는 "`AdSlot`의 배치 창 최대 1.5초 +
 * 입찰·렌더"라는 추정이었고 종단 시간을 재지 않았다. 이후 실측에서 첫 크리에이티브가
 * 데스크탑 콜드 4.1~5.4초(상단 띠는 4.9~5.9초), Fast3G 15~17초로 나왔다 — 4초는
 * 광고가 **오는 중인** 시점이라 그 표본이 통째로 no-fill로 잡혔다. 재고 부족과 단가를
 * 가르려고 만든 지표가 그 판정을 스스로 오염시키고 있었다.
 *
 * 그래서 도착을 **기다리지 않고 관측**한다. 소재가 붙는 순간 바로 보고하므로 6초가
 * 걸리든 17초가 걸리든 오판이 없고, 끝내 안 오는 세션만 데드라인까지 간다.
 */
/** 이 시각까지 소재가 없으면 재고 없음으로 판정. 3G 실측(15~17초)을 덮는 값. */
const DEADLINE_MS = 20000;

/** 세션당 1회. `dst:tracked`(페이지뷰)와 별개 — 판정 시점이 다르다. */
const SESSION_KEY = "dst:adstate";

/**
 * 미끼 엘리먼트에 붙일 클래스.
 *
 * EasyList/uBlock 계열이 코스메틱 규칙으로 숨기는 대표적인 이름들. 하나라도 숨겨지면
 * 이 브라우저에 광고 필터가 걸려 있다고 본다.
 */
const BAIT_CLASSES = "ad-banner ads adsbox doubleclick ad-placement textads banner-ads";

/**
 * 광고 필터가 걸려 있는가.
 *
 * 미끼에 **실제 크기를 줘야** 한다. 0×0으로 만들면 차단 여부와 무관하게 높이가 0이라
 * 아무것도 판정하지 못한다. 화면 밖으로 밀어내 사용자에게는 보이지 않게 한다.
 */
function detectAdFilter(): boolean {
  const bait = document.createElement("div");
  bait.className = BAIT_CLASSES;
  bait.setAttribute("aria-hidden", "true");
  bait.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none";
  document.body.appendChild(bait);
  try {
    const cs = getComputedStyle(bait);
    return (
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.clientHeight === 0 ||
      cs.display === "none" ||
      cs.visibility === "hidden"
    );
  } finally {
    bait.remove();
  }
}

/**
 * Ezoic 본체(`sa.min.js`)가 실제로 실행됐는가.
 *
 * **`ezstandalone`의 존재로 판정하면 안 된다.** 그 객체와 `cmd` 큐는 우리 부트스트랩
 * 인라인 스크립트가 항상 먼저 만든다(`layout.tsx`의 `adBootstrapScript`). 스크립트가
 * 차단돼도 껍데기는 남으므로 언제나 참이 된다. `showAds`는 본체만 정의한다.
 */
function adEngineReady(): boolean {
  const ez = (window as unknown as { ezstandalone?: { showAds?: unknown } }).ezstandalone;
  return typeof ez?.showAds === "function";
}

/**
 * 자리 중 하나라도 실제 소재가 들어왔는가.
 *
 * 판정은 `AdSlot`의 `hasCreative`를 그대로 쓴다 — 재고가 없어도 Ezoic이 18×18 뱃지를
 * 넣기 때문에, 자식 유무로 세면 no-fill이 통째로 노출로 잡혀 결과가 뒤집힌다.
 */
function anyCreativeRendered(): boolean {
  const nodes = document.querySelectorAll<HTMLElement>('[id^="ezoic-pub-ad-placeholder-"]');
  for (const el of nodes) {
    if (getComputedStyle(el).display !== "none" && hasCreative(el)) return true;
  }
  return false;
}

/** TCF CMP가 떠 있는가 — no-fill이 동의 거부 때문인지 가릴 때 쓴다. */
function cmpPresent(): boolean {
  return typeof (window as unknown as { __tcfapi?: unknown }).__tcfapi === "function";
}

export function AdVisibilityProbe() {
  const { isAdmin } = useAuth();

  // 관리자 여부는 인증이 끝나야 정해진다. 그걸 기다리느라 계측을 미루면 인증이 실패한
  // 세션이 통째로 표본에서 빠지므로, 관측은 바로 시작하고 **보내는 순간에** 읽는다.
  const isAdminRef = useRef(isAdmin);
  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  useEffect(() => {
    // 목업 모드(`?admock=`)는 실제 광고를 띄우지 않는다 — 표본에 섞이면 no-fill로 잡힌다.
    if (new URLSearchParams(window.location.search).has("admock")) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // 프라이빗 모드 등에서 sessionStorage가 막히면 중복 보고를 감수하고 계속한다.
    }

    let sent = false;

    /**
     * `elapsed` — navigationStart 기준 경과 ms.
     *
     * 이 값이 이번 교정의 핵심 산출물이다. 지연 조사는 전부 headless에서 나왔는데,
     * 기본 headless UA로는 Ezoic 계열 사이트가 전부 0% 충전됐다 — Ezoic이 클라이언트를
     * 분류한다는 뜻이라 실측 절대값이 실사용자와 다를 수 있다. 실사용자 도착 시각을
     * 직접 받아야 그 의심이 풀린다.
     */
    const send = (reason: "filled" | "deadline" | "early") => {
      if (sent) return;
      sent = true;
      cleanup();
      if (isAdminRef.current) return; // 관리자 방문은 표본에서 뺀다 (`trackEvent` 관례와 동일)
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* 위와 같음 */
      }
      const filled = reason === "filled";
      trackAdVisibility({
        adblock: detectAdFilter(),
        script: adEngineReady(),
        filled,
        cmp: cmpPresent(),
        // 이탈은 판정이 이르므로 별도 버킷으로 뺀다 — 버리지는 않는다. Ezoic도 이탈
        // 세션을 visit로 세므로, 빼면 우리 분모가 Ezoic 분모보다 작아져 비교가 깨진다.
        // 단 소재가 이미 왔다면 이탈이든 아니든 그 세션은 노출된 것이다.
        early: reason === "early",
        elapsed: Math.round(performance.now()),
      });
    };

    /**
     * 관측은 **폴링**으로 한다 — `MutationObserver`가 아니다.
     *
     * 판정이 `getComputedStyle` + `innerText` + `getBoundingClientRect`라 전부 강제
     * 레이아웃을 유발한다. 소재 도착을 놓치지 않으려면 관찰 범위가 `document.body`
     * subtree여야 하는데, 그러면 앱의 모든 리렌더가 콜백을 때려 데드라인까지 프레임마다
     * 리플로우가 걸린다 — 광고가 느린 걸 재려다 앱을 느리게 만드는 꼴이다.
     * (자리별 세밀한 감시는 `AdCard`가 이미 하고 있어 중복이기도 하다.)
     *
     * 폴링은 비용이 **상한이 있다**: 250ms × 20초 = 최대 80회. 도착 시각 분포를
     * 초 단위 구간으로 볼 것이므로 250ms 해상도면 충분하다.
     */
    const POLL_MS = 250;
    const poll = window.setInterval(() => {
      if (anyCreativeRendered()) send("filled");
    }, POLL_MS);

    const onHidden = () => {
      if (document.visibilityState === "hidden") send(anyCreativeRendered() ? "filled" : "early");
    };

    const timer = window.setTimeout(() => send("deadline"), DEADLINE_MS);
    document.addEventListener("visibilitychange", onHidden);

    function cleanup() {
      clearInterval(poll);
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHidden);
    }

    // 프로브가 늦게 마운트되면 소재가 이미 붙어 있을 수 있다 — 첫 관측을 즉시 한 번.
    if (anyCreativeRendered()) send("filled");

    return cleanup;
  }, []);

  return null;
}
