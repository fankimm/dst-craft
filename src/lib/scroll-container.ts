/**
 * 패널(바텀시트)이 잠가야 할 스크롤 컨테이너 찾기 (#105).
 *
 * `document.querySelector("[data-scroll-container]")` 는 쓰면 안 된다 — #91 이후 한 번 연
 * 탭은 `display:none` 으로 계속 마운트되므로 문서의 첫 번째 매치는 언제나 제작 탭이다.
 * 보스·요리·스킨 시트가 제작 탭 컨테이너를 잠갔고, 그 시트가 숨은 탭에 열린 채 남으면
 * 제작 탭 스크롤이 죽었다 (docs/mistakes.md "querySelector 다중 탭 마운트 함정").
 *
 * 대신 패널 자신의 DOM 위치에서 출발한다:
 *  1. 패널이 컨테이너 **안** 에 있으면(설정 탭 피드백 보드) `closest` 로 그 컨테이너.
 *  2. 형제 배치(제작·요리·보스 등)면 조상을 한 단계씩 올라가며 그 아래에서 찾는다.
 *     한 단계에 여러 개면 보이는 것을 우선한다 (상호배타 뷰가 같은 레벨에 있을 때).
 *  3. 탭 루트(`[data-tab-root]`)를 넘지 않는다 — 넘으면 다른 탭 컨테이너를 잡는다.
 */
export function findScrollContainerFor(from: Element | null): {
  container: HTMLElement | null;
  /** AppShell 탭 안인지. 밖(단독 페이지 /stats 등)이면 body 가 스크롤 주체다 */
  insideShell: boolean;
} {
  const tabRoot = from?.closest<HTMLElement>("[data-tab-root]") ?? null;
  const insideShell = tabRoot !== null;
  if (!from) return { container: null, insideShell };

  const inside = from.closest<HTMLElement>("[data-scroll-container]");
  if (inside) return { container: inside, insideShell };

  const isVisible = (el: HTMLElement) => el.getClientRects().length > 0;
  for (let el = from.parentElement; el; el = el.parentElement) {
    const list = el.querySelectorAll<HTMLElement>("[data-scroll-container]");
    if (list.length > 0) {
      const arr = Array.from(list);
      return { container: arr.find(isVisible) ?? arr[0], insideShell };
    }
    if (el === tabRoot) break;
  }
  return { container: null, insideShell };
}
