/**
 * 하단 고정(앵커) 광고 엘리먼트 후보 셀렉터 — AppShell(`--ez-anchor-h` 계산)과
 * EnvDiagOverlay(진단 표시)가 공유한다. 후보를 전부 훑어 `position: fixed` 이면서 높이가
 * 있는 것을 고른다 (첫 매치는 static 인 placeholder 일 수 있다 — #97).
 *
 * - `#ezmobfooter` / `.ezmob-footer` / `placeholder-100`: Ezoic 자체 앵커
 * - `ins[id^='gpt_unit_'][id*='/Adhesion/']`: Ezoic 이 앵커를 GPT out-of-page(Adhesion)로
 *   서빙할 때의 엘리먼트. `<body>` 가 아니라 **`<html>` 직계 자식** 으로 붙는다 (#105 실측) —
 *   그래서 MutationObserver 는 `document.documentElement` 를 관찰해야 한다.
 */
export const ANCHOR_AD_SELECTOR =
  "#ezmobfooter, .ezmob-footer, [id^='ezoic-pub-ad-placeholder-100'], ins[id^='gpt_unit_'][id*='/Adhesion/']";
