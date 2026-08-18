"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

/**
 * 정적 렌더(빌드 타임)에서는 useEffect, 브라우저에서는 useLayoutEffect.
 * useLayoutEffect를 서버에서 그대로 호출하면 React가 "does nothing on the server"
 * 경고를 찍기 때문에 갈라둔다.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** 원시값 / 얕은 객체 비교. 값이 같으면 불필요한 리렌더를 건너뛰기 위한 용도. */
function isSameState<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== "object" || a === null ||
    typeof b !== "object" || b === null
  ) {
    return false;
  }
  const av = a as Record<string, unknown>;
  const bv = b as Record<string, unknown>;
  const ak = Object.keys(av);
  if (ak.length !== Object.keys(bv).length) return false;
  return ak.every((k) => Object.is(av[k], bv[k]));
}

/**
 * URL 쿼리에서 읽어오는 화면 상태를 hydration-safe하게 초기화하는 훅.
 *
 * 사용법 — state 자체는 평범한 `useState(SSR_DEFAULT)`로 두고, 이 훅으로 마운트
 * 시점 동기화만 붙인다. (setter를 이 훅이 되돌려주면 React Compiler가 그것을
 * useState의 안정된 setter로 인식하지 못해 useCallback 메모이제이션이 깨진다.)
 *
 * ```ts
 * const [urlState, setUrlState] = useState(SSR_DEFAULT);
 * useUrlStateSync(readUrlState, setUrlState);
 * ```
 *
 * - **첫 렌더는 항상 `SSR_DEFAULT`** → 정적 export된 서버 HTML과 100% 일치하므로
 *   hydration mismatch가 발생하지 않는다. (useState lazy initializer 안에서
 *   `window.location.search`를 읽으면 딥링크 진입 시 트리 전체가 클라이언트에서
 *   재생성되면서 첫 페인트가 통째로 낭비된다 — #76)
 * - **커밋 직후 layout effect에서 URL을 읽어 즉시 setState** → 브라우저가 화면을
 *   그리기 전에 두 번째 렌더가 끝나므로, 딥링크로 들어와도 홈(카테고리 그리드)이
 *   깜빡였다가 상세로 바뀌는 플리커는 생기지 않는다.
 *
 * @param read URL을 읽어 상태를 만드는 함수 (마운트 시 1회만 호출)
 * @param setState 대상 state의 setter
 */
export function useUrlStateSync<T>(
  read: () => T,
  setState: Dispatch<SetStateAction<T>>,
) {
  // 마운트 시점 값만 쓰면 되므로 초기값으로 고정한다 (렌더 중 ref 갱신 금지).
  const readRef = useRef(read);
  const setStateRef = useRef(setState);

  useIsomorphicLayoutEffect(() => {
    const next = readRef.current();
    setStateRef.current((prev) => (isSameState(prev, next) ? prev : next));
  }, []);
}
