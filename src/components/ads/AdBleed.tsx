import type { ReactNode } from "react";

/**
 * 좁은 SEO 본문(`max-w-2xl`) 안에서 가로 띠 자리만 728px까지 넓히는 브레이크아웃 래퍼 (#83).
 *
 * SEO 상세 페이지의 본문은 `max-w-2xl px-4`라 컨텐츠 폭이 **640px**이다. `AdSlot`의 띠
 * 규격은 `sm:max-w-[728px]`까지 열려 있지만 부모가 640으로 눌러서 **728×90(leaderboard)이
 * 후보에서 통째로 빠진다.** 실측에서도 `/item/abigail-flower`의 placeholder #111이
 * 640×100으로 잡혀 있었다. 728×90은 띠 계열에서 채움률·단가가 가장 좋은 규격이라,
 * 하필 구글 유입이 가장 많은 상세 페이지들에서 그만큼을 놓치고 있었다.
 *
 * 좌우로 44px씩 빼서 `640 + 88 = 728`을 만든다.
 *
 * **`md`(768px) 이상에서만 적용한다.** 그보다 좁은 화면에서 88px을 벌리면 띠가 뷰포트를
 * 넘어 가로 스크롤이 생긴다. 768px에서도 좌우로 20px 여백이 남는다.
 *
 * 예약 높이는 건드리지 않는다 — 728×90은 90px이라 기존 `reserve`(100px) 안에 들어간다.
 * 폭이 늘었다고 더 큰 규격이 오지도 않는다. `BAND_BOX`의 `max-w-[728px]`이 상한이라
 * 970×250 같은 것은 애초에 후보가 아니다.
 *
 * 목록형 SEO 페이지(`max-w-4xl`, 컨텐츠 864px)에는 쓰지 않는다 — 거기는 728이 이미
 * 그대로 들어가므로 넓힐 이유가 없다.
 */
export function AdBleed({ children }: { children: ReactNode }) {
  return <div className="md:-mx-11">{children}</div>;
}
