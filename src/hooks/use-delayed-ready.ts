"use client";

import { useEffect, useState } from "react";

/**
 * 마운트 뒤 `ms`가 지나야 true — 모바일 고스트 클릭 방지용.
 * 재료 피커 등을 탭한 직후 그 자리에 새로 나타난 클릭 요소가 지연 터치 이벤트로 눌리는 걸 막는다
 * (요리솥 시뮬레이터 결과 카드·후보 목록). 내용이 바뀔 때마다 다시 기다려야 하면 호출한 컴포넌트에 `key`를 준다.
 */
export function useDelayedReady(ms = 350): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(timer);
  }, [ms]);
  return ready;
}
