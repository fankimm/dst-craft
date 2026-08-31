import { assetPath, bossThumbPath } from "./asset-path";

/**
 * 퀘스트/스텝 아이콘 경로 해석 (#88).
 *
 * `QuestsApp` · `QuestPageContent` · `QuestsListContent` 세 곳에 같은 함수가 복사돼 있었다.
 * 셋 다 `iconPath` 우선, 없으면 `icon`을 게임 아이템 경로로 조립하는 동일 로직인데
 * SEO 쪽 둘은 `assetPath`를 빠뜨려 `NEXT_PUBLIC_BASE_PATH`가 설정되면 깨지는 상태였다.
 * 한 곳으로 모으면서 그 차이도 함께 없앤다.
 *
 * 보스 이미지가 퀘스트 아이콘으로 쓰이므로(`src/data/quests/*.ts`의 `iconPath`) 축소본으로
 * 바꿔 준다 — 실측에서 홈이 로드하던 보스 PNG 9장 중 절반이 이 경로였다.
 */
export function resolveIconPath(item: { icon?: string; iconPath?: string }): string | null {
  if (item.iconPath) return assetPath(bossThumbPath(item.iconPath));
  if (item.icon) return assetPath(`/images/game-items/${item.icon}`);
  return null;
}
