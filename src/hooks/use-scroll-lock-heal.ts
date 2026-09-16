"use client";

import { useEffect } from "react";

/**
 * 잔존 스크롤 잠금 자가 복구 (#105).
 *
 * `DetailPanel` 은 열릴 때 자기 탭의 `[data-scroll-container]` 에 인라인 `overflow:hidden` 을
 * 걸고 닫힐 때 지운다. 어떤 경로로든 시트 없이 잠금만 남으면 그 탭은 "화면은 멀쩡한데
 * 스크롤이 안 되는" 상태가 된다 — 제보된 증상 그대로. 확인된 원인은 고쳤지만, 같은 부류의
 * 미지 경로를 위해 탭 전환·앱 복귀 시점에 다음 조건의 잠금을 지운다:
 *  - 문서 어디에도 열린 시트(`[data-detail-open="true"]`)가 없는데 잠금이 있다
 *  - 잠긴 컨테이너가 화면에 없다(숨은 탭) — 그 탭이 다시 보일 때 시트가 없으면 죽는다
 *
 * 쓰기는 "인라인 overflow 제거" 하나뿐이라 정상 상태를 해칠 수 없다. 폴링은 하지 않는다.
 */
export function useScrollLockHeal(activeTab: string) {
  useEffect(() => {
    const heal = () => {
      const anyOpen = document.querySelector('[data-detail-open="true"]') !== null;
      for (const c of document.querySelectorAll<HTMLElement>("[data-scroll-container]")) {
        if (!c.style.overflow) continue;
        if (!anyOpen || c.getClientRects().length === 0) c.style.overflow = "";
      }
    };
    heal();
    const onVisible = () => {
      if (document.visibilityState === "visible") heal();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", heal);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", heal);
    };
  }, [activeTab]);
}
