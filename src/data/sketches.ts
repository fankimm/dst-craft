/**
 * 체스기물 조각상(chesspiece_*_builder) ↔ 도면(chesspiece_*_sketch) 매핑 + 도면 입수처.
 *
 * 인게임 근거:
 * - `prefabs/sketch.lua` SKETCHES — 조각상 1종당 도면 1종. 도면 아이템 이름은
 *   `STRINGS.NAMES.SKETCH` = "{item} Sketch" / "{item} 도면"에 조각상 이름(NAMES.<BUILDER>)을 넣어 만든다
 * - 보스 드롭: 각 보스 prefab의 loot 테이블 (bosses.ts 전리품과 동일)
 * - `prefabs/tumbleweed.lua` CHESS_LOOT — 폰·퀸·킹 도면 + 체스 장신구(trinket_15/16/28~31)
 * - `prefabs/statue_marble.lua` SKETCH_UNLOCKS — 대리석 조각상 채굴 시 퀸(type 1·2)·폰(type 4)
 * - `prefabs/statuemaxwell.lua` — 맥스웰 석상 채굴 시 킹 도면
 * - `prefabs/sculptures.lua` — 룩/나이트/비숍 대리석 조각상이 신월에 되살아날 때 도면 드롭
 * - `prefabs/trinkets.lua` TRADEFOR + `prefabs/pigking.lua` — 체스 장신구를 돼지왕에게 주면 도면
 * - `prefabs/vault_pillar_guard.lua` VAULT_LOOT_FINAL — 열쇠 방 마지막 수호탑
 * - 제작 가능한 도면 13종은 items.ts에 아이템으로 등록돼 있다 (생각 탱크·천상 제단·퍼드 공물)
 */
import { allItems } from "./items";
import { ko } from "./locales/ko";

export type SketchSource =
  /** 보스 전리품 — bosses.ts의 boss id. 클릭 시 보스탭 전리품 검색으로 이동 */
  | { kind: "boss"; bossId: string }
  /** 제작 가능한 도면 아이템 — items.ts의 id. 클릭 시 그 아이템 상세로 이동 */
  | { kind: "craft"; itemId: string }
  | { kind: "tumbleweed" }
  | { kind: "statue_marble" }
  | { kind: "statue_maxwell" }
  | { kind: "sculpture"; piece: "rook" | "knight" | "bishop" }
  /** 체스 장신구(하양/검정 한 쌍)를 돼지왕에게 교환 */
  | { kind: "pigking_trinket"; trinket: string; piece: "rook" | "knight" | "bishop" }
  | { kind: "vault_guard" };

const boss = (bossId: string): SketchSource => ({ kind: "boss", bossId });
const craft = (figure: string): SketchSource => ({ kind: "craft", itemId: `chesspiece_${figure}_sketch` });

/** key = 조각상 builder id → 도면 입수처 목록. 도면이 필요 없는 조각상(풍요의 뿔·방울 파이프)은 없음 */
export const figureSketchSources: Record<string, SketchSource[]> = {
  // 회전초 / 석상 채굴
  chesspiece_pawn_builder: [{ kind: "tumbleweed" }, { kind: "statue_marble" }],
  chesspiece_muse_builder: [{ kind: "tumbleweed" }, { kind: "statue_marble" }],
  chesspiece_formal_builder: [{ kind: "tumbleweed" }, { kind: "statue_maxwell" }],
  // 그림자 기물 — 장신구 교환 또는 신월 부활
  chesspiece_rook_builder: [{ kind: "pigking_trinket", trinket: "trinket_28", piece: "rook" }, { kind: "sculpture", piece: "rook" }],
  chesspiece_knight_builder: [{ kind: "pigking_trinket", trinket: "trinket_30", piece: "knight" }, { kind: "sculpture", piece: "knight" }],
  chesspiece_bishop_builder: [{ kind: "pigking_trinket", trinket: "trinket_15", piece: "bishop" }, { kind: "sculpture", piece: "bishop" }],
  // 보스 드롭
  chesspiece_deerclops_builder: [boss("deerclops")],
  chesspiece_bearger_builder: [boss("bearger")],
  chesspiece_moosegoose_builder: [boss("moose")],
  chesspiece_dragonfly_builder: [boss("dragonfly")],
  chesspiece_minotaur_builder: [boss("minotaur")],
  chesspiece_toadstool_builder: [boss("toadstool")],
  chesspiece_beequeen_builder: [boss("beequeen")],
  chesspiece_klaus_builder: [boss("klaus")],
  chesspiece_antlion_builder: [boss("antlion")],
  chesspiece_stalker_builder: [boss("stalker_atrium")],
  chesspiece_malbatross_builder: [boss("malbatross")],
  chesspiece_crabking_builder: [boss("crabking")],
  chesspiece_guardianphase3_builder: [boss("alterguardian_phase3")],
  chesspiece_eyeofterror_builder: [boss("eyeofterror")],
  chesspiece_twinsofterror_builder: [boss("twinsofterror")],
  chesspiece_daywalker_builder: [boss("daywalker")],
  chesspiece_daywalker2_builder: [boss("daywalker2")],
  chesspiece_deerclops_mutated_builder: [boss("mutateddeerclops")],
  chesspiece_warg_mutated_builder: [boss("mutatedwarg")],
  chesspiece_bearger_mutated_builder: [boss("mutatedbearger")],
  chesspiece_sharkboi_builder: [boss("sharkboi")],
  chesspiece_wormboss_builder: [boss("worm_boss")],
  chesspiece_wagboss_robot_builder: [boss("wagboss_robot")],
  chesspiece_wagboss_lunar_builder: [boss("alterguardian_phase4_lunarrift")],
  // 성소(볼트)
  chesspiece_vault_pillar_guard_builder: [{ kind: "vault_guard" }],
  // 제작 가능한 도면
  chesspiece_anchor_builder: [craft("anchor")],
  chesspiece_butterfly_builder: [craft("butterfly")],
  chesspiece_moon_builder: [craft("moon")],
  chesspiece_clayhound_builder: [craft("clayhound")],
  chesspiece_claywarg_builder: [craft("claywarg")],
  chesspiece_carrat_builder: [craft("carrat")],
  chesspiece_beefalo_builder: [craft("beefalo")],
  chesspiece_kitcoon_builder: [craft("kitcoon")],
  chesspiece_catcoon_builder: [craft("catcoon")],
  chesspiece_manrabbit_builder: [craft("manrabbit")],
  chesspiece_yotd_builder: [craft("yotd")],
  chesspiece_yoth_builder: [craft("yoth")],
  chesspiece_yots_builder: [craft("yots")],
};

/** 전용 아이콘(`chesspiece_*_sketch.png`)이 있는 도면. 나머지는 공용 `sketch.png` */
export const SKETCH_ICON_IDS = new Set([
  "chesspiece_anchor_sketch", "chesspiece_beefalo_sketch", "chesspiece_butterfly_sketch",
  "chesspiece_carrat_sketch", "chesspiece_catcoon_sketch", "chesspiece_clayhound_sketch",
  "chesspiece_claywarg_sketch", "chesspiece_crabking_sketch", "chesspiece_daywalker_sketch",
  "chesspiece_guardianphase3_sketch", "chesspiece_kitcoon_sketch", "chesspiece_malbatross_sketch",
  "chesspiece_manrabbit_sketch", "chesspiece_moon_sketch", "chesspiece_sharkboi_sketch",
  "chesspiece_wagboss_lunar_sketch", "chesspiece_wagboss_robot_sketch", "chesspiece_wormboss_sketch",
  "chesspiece_yotd_sketch", "chesspiece_yoth_sketch", "chesspiece_yots_sketch",
]);

/**
 * 조각 재료별 결과물 이미지 접미사 (`prefabs/chesspieces.lua` MATERIALS — inv_suffix).
 * 대리석은 접미사 없음.
 */
export const SCULPT_MATERIALS: { materialId: string; suffix: string }[] = [
  { materialId: "marble", suffix: "" },
  { materialId: "cutstone", suffix: "_stone" },
  { materialId: "moonglass", suffix: "_moonglass" },
];

/** 인게임엔 있으나 아직 아이콘을 추출하지 못한 결과물 변형 — 이미지 확보 전까지 표시 제외 */
const MISSING_VARIANT_IMAGES = new Set(["chesspiece_vault_pillar_guard_stone", "chesspiece_vault_pillar_guard_moonglass"]);

export function figureSketchId(builderId: string): string {
  return builderId.replace(/_builder$/, "_sketch");
}

export function sketchBuilderId(sketchId: string): string {
  return sketchId.replace(/_sketch$/, "_builder");
}

/** 도면 아이콘 파일명 (game-items 기준) */
export function sketchIcon(sketchId: string): string {
  return SKETCH_ICON_IDS.has(sketchId) ? `${sketchId}.png` : "sketch.png";
}

/** 조각상 결과물 3종 (재료 → 이미지 파일명). 이미지가 없는 변형은 제외 */
export function sculptResultImages(builderId: string): { materialId: string; image: string }[] {
  const item = allItems.find((i) => i.id === builderId);
  if (!item) return [];
  const base = item.image.replace(/\.png$/, "");
  return SCULPT_MATERIALS
    .map(({ materialId, suffix }) => ({ materialId, image: `${base}${suffix}.png` }))
    .filter(({ image }) => !MISSING_VARIANT_IMAGES.has(image.replace(/\.png$/, "")));
}

/**
 * 도면 표시 이름 — 인게임 named 컴포넌트와 동일하게 "{조각상 이름} 도면" / "{Figure} Sketch".
 * 조각상이 items.ts에 없으면 id를 그대로 돌려준다.
 */
export function sketchName(sketchId: string, locale: string): string {
  const builderId = sketchBuilderId(sketchId);
  const item = allItems.find((i) => i.id === builderId);
  if (!item) return sketchId.replace(/_/g, " ");
  if (locale === "ko") {
    const nameKo = ko.items[builderId]?.name ?? item.name;
    return `${nameKo} 도면`;
  }
  return `${item.name} Sketch`;
}

/**
 * 보스·제작 이외 입수처의 표시 문구. 보스는 bosses.ts 이름, 제작 도면은 items.ts 이름을 쓰므로 여기 없다.
 * 고유명사(회전초·대리석 조각상·맥스웰 석상·돼지왕·장신구)는 ko.po `STRINGS.NAMES.*` 기준.
 */
export function sketchSourceLabel(src: SketchSource, locale: string): string {
  const isKo = locale === "ko";
  const piece = { rook: isKo ? "룩" : "Rook", knight: isKo ? "나이트" : "Knight", bishop: isKo ? "비숍" : "Bishop" };
  switch (src.kind) {
    case "tumbleweed":
      return isKo ? "회전초에서 획득" : "Found in Tumbleweeds";
    case "statue_marble":
      return isKo ? "대리석 조각상 채굴" : "Mine a Marble Sculpture";
    case "statue_maxwell":
      return isKo ? "맥스웰 석상 채굴" : "Mine the Maxwell Statue";
    case "sculpture":
      return isKo
        ? `${piece[src.piece]} 대리석 조각상이 신월에 되살아날 때 드롭`
        : `Dropped when the ${piece[src.piece]} sculpture awakens on a new moon`;
    case "pigking_trinket":
      return isKo
        ? `하얀·검은 ${piece[src.piece]} 장신구를 돼지왕에게 교환`
        : `Trade a White or Black ${piece[src.piece]} trinket to the Pig King`;
    case "vault_guard":
      return isKo ? "성소 열쇠 방의 마지막 고대의 수호탑 파괴 시 드롭" : "Dropped by the last Ancient Guard Tower in the Sanctum key room";
    default:
      return "";
  }
}
