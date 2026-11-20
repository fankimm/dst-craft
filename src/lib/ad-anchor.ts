/**
 * 하단 고정(앵커) 광고 엘리먼트 셀렉터 — AppShell(`--ad-anchor-h` 계산)과
 * EnvDiagOverlay(진단 표시)가 공유한다. 후보를 전부 훑어 `position: fixed` 이면서 높이가
 * 있는 것을 고른다.
 *
 * AdSense 자동 광고의 앵커는 `<ins class="adsbygoogle adsbygoogle-noablate"
 * data-anchor-status="displayed" …>`로 `<body>` 직계에 `position: fixed`로 붙는다 (#134).
 * `data-anchor-status`로 한정하는 이유: 전면 광고(vignette)도 같은 클래스의 fixed `<ins>`인데
 * 그건 화면 전체를 덮는 것이라 앵커 높이로 빼면 앱이 0px가 된다.
 *
 * (Ezoic 시절 셀렉터 `#ezmobfooter`·`placeholder-100`·GPT Adhesion은 #134에서 제거.)
 */
export const ANCHOR_AD_SELECTOR = "ins.adsbygoogle[data-anchor-status]";
