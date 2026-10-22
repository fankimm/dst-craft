/**
 * Google AdSense 연동 상수 (#134 — Ezoic → AdSense 전환).
 *
 * 광고망 전환의 배경은 `docs/ezoic-decision.md`. 계약서 §2 독점 조항 때문에 **production에는
 * 2026-11-19(Ezoic 계약 종료) 이후에만** 이 코드가 올라간다. beta 빌드는 그 전에도 올릴 수
 * 있도록 **테스트 광고 모드**로 고정한다 — 노출·클릭이 집계되지 않고 수익도 없어 "광고
 * 인벤토리를 다른 데 판다"는 상황이 성립하지 않는다.
 */

export type AdVariant = "top" | "rail-left" | "rail-right";

/** 게시자 ID — `layout.tsx`의 `google-adsense-account` 메타 태그(#100)와 같은 값이어야 한다. */
export const ADSENSE_CLIENT = "ca-pub-4567930429443718";

const IS_BETA_BUILD = process.env.NEXT_PUBLIC_DEPLOY_ENV === "beta";

/**
 * 테스트 광고 모드.
 *
 * **beta 빌드는 항상 켠다** — 별도 환경변수로 두지 않는 이유는 둘이다. (1) main 빌드에 테스트
 * 플래그가 섞여 들어갈 경로를 아예 없앤다. (2) 전환 뒤에도 beta에서 우리가 광고를 눌러 보는
 * 일이 잦은데, 그게 실광고면 무효 트래픽으로 계정이 위험하다.
 *
 * 켜지면: 모든 `<ins>`에 `data-adtest="on"`이 붙고(Google이 "Test Ad" 표시 소재를 보낸다),
 * 자동 광고(앵커·전면)는 로드하지 않는다 — 자동 광고에는 테스트 플래그가 없어서 켜면 곧
 * 실광고다.
 */
export const ADSENSE_TEST = IS_BETA_BUILD;

/**
 * 자리별 광고 단위(slot) id.
 *
 * AdSense 콘솔 → 광고 → 광고 단위별 → **디스플레이 광고**로 만든다. 유닛 규격은 콘솔에서
 * "반응형"으로 두고, 실제 규격은 아래 `AdSlot`이 CSS로 정한다(콘솔 규격은 생성되는 코드
 * 조각에만 영향을 준다). id는 공개 정보(HTML에 그대로 노출)라 환경변수가 아니라 여기 둔다 —
 * 맥미니 빌드 환경에 변수를 따로 심을 필요가 없다.
 *
 * 비어 있으면 그 자리는 껍데기만 그리고 광고를 요청하지 않는다 (개발 빌드에서 경고).
 */
export const ADSENSE_SLOT: Record<AdVariant, string> = {
  top: "",
  "rail-left": "",
  "rail-right": "",
};

/**
 * 로더 주소.
 *
 * `?client=`가 붙으면 Google이 콘솔의 **자동 광고 설정**(앵커·전면·사이드레일 등)을 그 페이지에
 * 적용한다. 테스트 모드에선 떼서 자동 광고를 막고 수동 유닛만 테스트 소재로 띄운다.
 *
 * 자동 광고의 포맷 선택은 코드가 아니라 콘솔(사이트별 설정)에서 한다 — 권장값은
 * `docs/ui.md` AdSlot 절 참조 (앵커·전면만 켜고 페이지 내 자동 삽입은 끈다: 우리 자리는 예약
 * 높이로 CLS를 막고 있는데 자동 삽입은 그걸 우회한다).
 */
export const ADSENSE_SCRIPT_SRC = ADSENSE_TEST
  ? "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  : `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/** `adsbygoogle.js` 본체가 실행됐는가 — 큐 배열의 존재가 아니라 본체가 세우는 `loaded` 플래그로 본다. */
export function adsenseLoaded(): boolean {
  const q = (window as unknown as { adsbygoogle?: { loaded?: boolean } }).adsbygoogle;
  return q?.loaded === true;
}
