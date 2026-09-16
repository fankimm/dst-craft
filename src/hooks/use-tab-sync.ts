"use client";

import { useEffect, useRef } from "react";

/**
 * 탭 URL 이 바뀌는 모든 순간에 콜백을 부른다 (#105):
 *  - `popstate`   — 브라우저/제스처 뒤로·앞으로
 *  - `dst-tab-switch` — 탭바 클릭 (pushState 는 popstate 를 안 낸다, AppShell 이 발행)
 *  - `pageshow`(persisted) — bfcache 복원
 *
 * 탭은 한 번 열면 `display:none` 으로 계속 마운트되므로(#91) 각 탭이 스스로 URL 과 상태를
 * 맞춰야 한다. 예전엔 탭마다 popstate 리스너를 따로 두고 "내 탭이 아니면 return" 했는데,
 * 그러면 다른 탭으로 나간 뒤에도 시트가 열린 채 남아 스크롤 잠금이 잔존했다.
 *
 * 콜백에서는 **무조건 URL 을 다시 읽어 상태를 덮어쓴다**: `set(readUrlState())`.
 * `readUrlState()` 가 다른 탭 URL 에서 초기값을 돌려주면 탭을 떠날 때 자연히 닫힌다.
 * URL 에 없는 로컬 시트 상태(스킨·WX-78·피드백 보드)는 콜백에서 그냥 닫는다.
 */
export function useTabSync(onSync: () => void) {
  const ref = useRef(onSync);
  useEffect(() => {
    ref.current = onSync;
  });
  useEffect(() => {
    const run = () => ref.current();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) run();
    };
    window.addEventListener("popstate", run);
    window.addEventListener("dst-tab-switch", run);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", run);
      window.removeEventListener("dst-tab-switch", run);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
}
