"use client";

/**
 * 탭 청크를 내려받는 동안 잠깐 보여주는 자리 (#91).
 *
 * 탭 본체는 `next/dynamic` 으로 쪼개져 있어서, 그 탭을 처음 열면 청크 요청이 한 번
 * 나간다. 대개 즉시 끝나지만(탭 버튼에 포인터가 닿는 순간 미리 받아둔다) 느린 회선에서
 * 빈 화면이 되지 않도록 최소한의 자리만 잡아둔다.
 *
 * 스피너를 돌리지 않는 이유: 대부분의 경우 한두 프레임 만에 사라지는데 그때마다
 * 애니메이션이 번쩍이면 오히려 느려 보인다.
 */
export function TabFallback() {
  return (
    <div className="h-full flex items-center justify-center" aria-busy="true">
      <span className="sr-only">Loading</span>
    </div>
  );
}
