"use client";

import { useEffect, useRef } from "react";
import { hasCreative } from "./AdSlot";
import { useAuth } from "@/hooks/use-auth";
import { trackAdVisibility } from "@/lib/analytics";

/**
 * 광고가 이 방문자에게 **실제로 도달했는지**를 세션당 한 번 보고한다 (#85).
 *
 * 왜 필요한가: Ezoic 대시보드의 `Visits`와 우리 자체 UV가 어긋나는데, 그 차이를
 * 봇·중국 도달 불가·세션 정의만으로 설명할 수 있는지 확인할 방법이 없었다. 더 중요한 건
 * ePMV가 낮을 때 그 원인이 **재고가 안 붙어서(no-fill)** 인지 **단가가 낮아서**인지
 * 가릴 수 없다는 점이다 — 대시보드는 채워진 노출만 보여주기 때문이다.
 * 우리 쪽에서 "요청은 나갔는데 소재가 안 왔다"를 직접 세면 그 구분이 선다.
 *
 * 이 자리가 **우리 트래킹은 살아 있고 광고만 죽은 세션**까지 잡을 수 있는 유일한 지점이다.
 * 자체 트래킹은 이미 광고차단 필터를 피하는 경로(`/_t`)를 쓰기 때문이다 (#34).
 *
 * 화면에는 아무것도 그리지 않는다. 광고 요청을 늦추지도, 레이아웃을 건드리지도 않는다.
 */

/**
 * 판정 시각.
 *
 * `AdSlot`의 배치 창이 최대 1.5초(`FLUSH_MAX_WAIT_MS`)이고 그 뒤에 입찰→렌더가 붙는다.
 * 4초는 그 전체가 끝나고도 여유가 있는 지점이다. 더 짧게 잡으면 아직 도착 중인 광고를
 * no-fill로 오판해 차단율이 부풀려진다.
 */
const CHECKPOINT_MS = 4000;

/** 세션당 1회. `dst:tracked`(페이지뷰)와 별개로 둔다 — 판정 시점이 다르다. */
const SESSION_KEY = "dst:adstate";

/**
 * 미끼 엘리먼트에 붙일 클래스.
 *
 * EasyList/uBlock 계열 필터가 코스메틱 규칙으로 숨기는 대표적인 이름들이다.
 * 하나라도 숨겨지면 이 브라우저에 광고 필터가 걸려 있다고 본다.
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
  // 세션이 통째로 표본에서 빠지므로, 타이머는 바로 걸고 **보내는 순간에** 읽는다.
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
     * `early` — 체크포인트 전에 이탈한 세션.
     *
     * 이 표본을 버리면 안 된다. 이탈 세션도 Ezoic은 visit로 세므로, 빼버리면 우리 분모가
     * Ezoic 분모보다 작아져 비교가 성립하지 않는다. 그렇다고 같이 섞으면 "아직 도착
     * 중이던 광고"가 no-fill로 잡혀 비율이 망가진다. 그래서 **별도 버킷으로 분리**한다.
     */
    const send = (early: boolean) => {
      if (sent) return;
      sent = true;
      cleanup();
      if (isAdminRef.current) return; // 관리자 방문은 표본에서 뺀다 (`trackEvent` 관례와 동일)
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* 위와 같음 */
      }
      trackAdVisibility({
        adblock: detectAdFilter(),
        script: adEngineReady(),
        filled: anyCreativeRendered(),
        cmp: cmpPresent(),
        early,
      });
    };

    const onHidden = () => {
      if (document.visibilityState === "hidden") send(true);
    };

    const timer = window.setTimeout(() => send(false), CHECKPOINT_MS);
    document.addEventListener("visibilitychange", onHidden);

    function cleanup() {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHidden);
    }

    return cleanup;
  }, []);

  return null;
}
