// WX-78 회로/스킬트리 시리즈는 GSC 28일 평균 순위 7.6위·검색 트래픽 견인 페이지군 (Issue #14).
// sitemap priority 격상 + 아이템 metadata description 키워드 강화에 공통으로 사용.

export const WX78_PRIORITY_ITEM_IDS = [
  "wx78_drone_zap_remote", // Zaptrocuter
  "wx78module_chess", // Chessmaster Circuit
  "wx78module_digestion", // Redigestion Circuit
  "wx78module_screech", // Sonic-Invoker Circuit
  "wx78module_stacksize", // Spatializer Circuit
  "wx78module_radar", // Rangebooster Circuit
] as const;

export const WX78_PRIORITY_BOSS_IDS = [
  "alterguardian_phase4_lunarrift", // Celestial Scion
] as const;

export const WX78_PRIORITY_SKILL_TREE_IDS = ["wx-78"] as const;

const WX78_PRIORITY_ITEM_SET: Set<string> = new Set(WX78_PRIORITY_ITEM_IDS);

export function isWx78PriorityItem(id: string): boolean {
  return WX78_PRIORITY_ITEM_SET.has(id);
}
