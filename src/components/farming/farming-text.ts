/**
 * 농사 탭·`/farming` 페이지 전용 문구 (#120).
 *
 * `src/lib/i18n.ts` 에 넣지 않는 이유: 그 파일은 홈(제작 탭) 번들에 들어간다(#91). 여기 문구는
 * 농사 청크를 받을 때만 필요하다. 게임에 원문이 있는 이름·라벨은 전부 `src/data/farming.ts`
 * (ko.po)에서 오고, 이 파일에는 **게임에 없는 말**만 둔다 — 그래서 표·숫자 위주로 짧게 쓴다.
 *
 * 스트레스 7항목은 게임에 공식 라벨이 없다(살펴볼 때의 캐릭터 대사만 있다). 이름은 커뮤니티에서
 * 통용되는 나무위키식 표기를 쓰고, 인게임 대사(`FARM_STRESSORS[].quote`)를 곁들인다.
 */
import { FARM_CONSTANTS, type FarmStressGradeId, type FarmStressorId, type FarmText } from "@/data/farming";
import type { Locale } from "@/lib/i18n";

const C = FARM_CONSTANTS;
const tiles = (units: number) => units / C.unitsPerTile;

export const FARM_TEXT = {
  header: { ko: "농사", en: "Farming" },
  subheader: { ko: "계절별 무비료 조합과 작물·비료 수치", en: "No-fertilizer crop combos and farming numbers" },
  viewCombos: { ko: "계절별 조합", en: "Combos" },
  viewCrops: { ko: "작물", en: "Crops" },
  viewGuide: { ko: "참고표", en: "Reference" },

  gameValue: { ko: "게임 수치", en: "Game data" },
  computedValue: { ko: "계산값", en: "Calculated" },

  comboIntro: {
    ko: "한 타일 안에서 양분이 제자리로 돌아와 비료가 필요 없는 조합. 숫자는 타일당 포기 수, 같은 칸의 작물은 서로 바꿔 심어도 됩니다.",
    en: "Combos whose nutrients net to zero within one tile, so no fertilizer is needed. Numbers are plants per tile; crops in the same cell are interchangeable.",
  },
  comboComputedNote: {
    ko: "조합·포기 수·양분 수요는 게임 수치로 dstcraft가 계산한 값입니다.",
    en: "Combos, plant counts and nutrient demand are calculated by dstcraft from game data.",
  },
  giantWarning: {
    ko: "일반 씨앗에서 자란 작물은 거대 작물이 될 수 없습니다. 거대 작물을 노린다면 작물 씨앗으로 심으세요.",
    en: "Plants grown from generic Seeds can never become giant. Plant crop-specific seeds if you want giant crops.",
  },
  badgeOneTile: { ko: "타일 1개로 충분", en: "One tile is enough" },
  badgeAdjacent: { ko: "같은 구성의 타일을 붙여 심기", en: "Place identical tiles side by side" },
  badgeAdjacentHint: {
    ko: `가족(같은 작물 ${C.familyMin}포기, 반경 ${tiles(C.familyRadius)}타일)을 한 타일로는 못 채웁니다.`,
    en: `One tile cannot satisfy Family (${C.familyMin} of the same crop within ${tiles(C.familyRadius)} tile).`,
  },
  badgeSafe: { ko: "새 밭에서 안전", en: "Safe on fresh soil" },
  badgeFertilize: { ko: "비료 1회 권장", en: "Fertilize once" },
  demand: { ko: "최악 순서 수요", en: "Worst-case demand" },
  demandHint: {
    ko: `새 밭의 양분은 각각 ${C.startingNutrientsMin}~${C.startingNutrientsMax}. 수요가 ${C.startingNutrientsMin}을 넘으면 첫 단계에서 모자랄 수 있습니다.`,
    en: `Fresh soil starts at ${C.startingNutrientsMin}–${C.startingNutrientsMax} of each nutrient. Demand above ${C.startingNutrientsMin} can run short on the first stage.`,
  },
  filterLabel: { ko: "이 작물이 들어간 조합", en: "Combos with this crop" },
  filterAll: { ko: "전체", en: "All" },
  noCombos: { ko: "이 계절에는 해당 작물이 들어간 기본 조합이 없습니다.", en: "No basic combo includes this crop in this season." },
  perTile: { ko: "타일당", en: "per tile" },

  perStage: { ko: "성장 단계마다", en: "Per growth stage" },
  perSecond: { ko: "/초 (성장 중일 때만)", en: "/s (only while growing)" },
  drinkLevel: { low: { ko: "저", en: "Low" }, med: { ko: "중", en: "Med" }, high: { ko: "고", en: "High" } },
  giantCrop: { ko: "거대 작물", en: "Giant crop" },
  crop: { ko: "작물", en: "Crop" },
  randomSeedChance: { ko: "일반 씨앗에서 나올 확률", en: "Chance from generic Seeds" },
  randomSeedWeeds: { ko: "잡초", en: "Weeds" },
  matchingFertilizers: { ko: "맞는 비료", en: "Matching fertilizers" },
  showCombos: { ko: "이 작물이 들어간 조합 보기", en: "Show combos with this crop" },
  growTime: { ko: "성장 시간", en: "Grow time" },
  growTimeValue: {
    ko: "발아 {g0}~{g1}일 + 성장 {f0}~{f1}일 (제철이면 ×0.5)",
    en: "Germination {g0}–{g1} d + growth {f0}–{f1} d (×0.5 in season)",
  },
  days: { ko: "일", en: "d" },

  uses: { ko: "사용 횟수", en: "Uses" },
  tendTools: { ko: "돌보기 도구", en: "Tending tools" },
  tendRadius: { ko: "반경 (타일)", en: "Radius (tiles)" },
  watering: { ko: "급수", en: "Watering" },
  waterAmount: { ko: "수분", en: "Moisture" },
  waterNote: {
    ko: "타일 수분은 0~100. 얼음은 바닥에서 다 녹을 때 개당 적용됩니다.",
    en: "Tile moisture ranges 0–100. Ice applies per piece when it fully melts on the ground.",
  },
  weeds: { ko: "잡초", en: "Weeds" },
  weedNote: {
    ko: `세 양분을 ${C.consumeLow}씩 소비하고 되돌리지 않습니다. 일반 씨앗의 ${C.randomSeedWeedChance * 100}%가 잡초입니다.`,
    en: `Consume ${C.consumeLow} of every nutrient and restore nothing. ${C.randomSeedWeedChance * 100}% of generic Seeds grow into weeds.`,
  },
  stressTitle: { ko: "스트레스 7항목", en: "The 7 stressors" },
  stressNote: {
    ko: "성장 단계가 넘어갈 때마다(4번) 걸린 항목당 1점, 최대 28점.",
    en: "Checked at each of the 4 stage changes; 1 point per failed stressor, 28 max.",
  },
  harvestTitle: { ko: "스트레스 합계 → 수확물", en: "Total stress → harvest" },
  stressPoints: { ko: "점", en: "pts" },
} as const;

/** 스트레스 항목 이름 (나무위키식) + 판정 규칙. 규칙의 수치는 FARM_CONSTANTS 에서 온다 */
export const FARM_STRESSOR_TEXT: Record<FarmStressorId, { name: FarmText; rule: FarmText }> = {
  nutrients: {
    name: { ko: "영양분", en: "Nutrients" },
    rule: { ko: "타일의 양분이 이 작물의 소비량보다 적음", en: "Tile has less of a nutrient than the crop consumes" },
  },
  moisture: {
    name: { ko: "수분", en: "Moisture" },
    rule: {
      ko: `직전 단계 이후 젖은 땅에 있던 시간이 ${C.droughtTolerance * 100}% 미만`,
      en: `Soil was wet for under ${C.droughtTolerance * 100}% of the time since the last stage`,
    },
  },
  killjoys: {
    name: { ko: "분위기 파괴자", en: "Killjoys" },
    rule: {
      ko: `반경 ${tiles(C.killjoyRadius)}타일 안에 잡초·썩은 작물·텃밭 쓰레기가 있음`,
      en: `A weed, rotten plant or Garden Detritus within ${tiles(C.killjoyRadius)} tiles`,
    },
  },
  season: {
    name: { ko: "제철", en: "Season" },
    rule: { ko: "지금 계절이 이 작물의 제철이 아님", en: "Current season is not one of the crop's seasons" },
  },
  family: {
    name: { ko: "가족", en: "Family" },
    rule: {
      ko: `반경 ${tiles(C.familyRadius)}타일 안에 같은 작물이 자신 포함 ${C.familyMin}포기 미만`,
      en: `Fewer than ${C.familyMin} of the same crop (itself included) within ${tiles(C.familyRadius)} tile`,
    },
  },
  overcrowding: {
    name: { ko: "과밀", en: "Overcrowding" },
    rule: {
      ko: `같은 타일에 작물·잡초가 ${C.overcrowdingMaxPlants}포기 초과`,
      en: `More than ${C.overcrowdingMaxPlants} plants and weeds on the same tile`,
    },
  },
  happiness: {
    name: { ko: "행복", en: "Happiness" },
    rule: { ko: "직전 단계 이후 한 번도 돌보기를 받지 못함", en: "Was not tended since the last stage" },
  },
};

/** 등급별 수확물 (prefabs/farm_plants.lua SetupLoot). 아이템 이름은 화면에서 작물 데이터로 채운다 */
export const FARM_HARVEST: Record<FarmStressGradeId, { crop: number; seeds: number; giant: boolean }> = {
  none: { crop: 0, seeds: 0, giant: true },
  low: { crop: 1, seeds: 2, giant: false },
  moderate: { crop: 1, seeds: 1, giant: false },
  high: { crop: 1, seeds: 0, giant: false },
};

export const ft = (text: FarmText, locale: Locale | string) => (locale === "ko" ? text.ko : text.en);

/** 게임 파일명이 prefab id 와 다른 작물 이미지 */
const CROP_IMAGE: Record<string, string> = { onion: "quagmire_onion.png" };
export const cropImage = (id: string) => CROP_IMAGE[id] ?? `${id}.png`;
