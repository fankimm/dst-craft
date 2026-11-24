import { t } from "@/lib/i18n";
import type { Locale, TranslationKey } from "@/lib/i18n";

/**
 * 음식 유형(게임 FOODTYPE, 소문자) → 라벨 키 + 아이콘. 요리탭 칩·검색 서제스천·태그 클릭이 같이 쓴다 (#173).
 * 아이콘은 그 유형의 대표 음식 — 꿀은 게임에서 GENERIC이라 간식(GOODIES) 아이콘으로 쓰지 않는다.
 */
export const FOOD_TYPE_META: Record<string, { key: TranslationKey; image: string }> = {
  meat:     { key: "foodtype_meat",     image: "game-items/meat.png" },
  veggie:   { key: "foodtype_veggie",   image: "game-items/carrot.png" },
  goodies:  { key: "foodtype_goodies",  image: "game-items/taffy.png" },
  generic:  { key: "foodtype_generic",  image: "game-items/wetgoop.png" },
  seeds:    { key: "foodtype_seeds",    image: "game-items/seeds.png" },
  roughage: { key: "foodtype_roughage", image: "game-items/cutlichen.png" },
  monster:  { key: "foodtype_monster",  image: "game-items/monstermeat.png" },
  nonfood:  { key: "foodtype_nonfood",  image: "game-items/batnosehat.png" },
};

export function foodTypeLabel(foodType: string, locale: Locale): string {
  const meta = FOOD_TYPE_META[foodType];
  return meta ? t(locale, meta.key) : foodType;
}

export function foodTypeIcon(foodType: string): string | undefined {
  return FOOD_TYPE_META[foodType]?.image;
}
