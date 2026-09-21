/**
 * 농사 조합 계산 (#120) — 비료 없이 양분이 제자리로 돌아오는 작물 조합을 `src/data/farming.ts`에서 계산한다.
 *
 * 조합은 데이터로 저장하지 않는다. 게임 패치로 작물의 양분·제철이 바뀌면 결과도 따라 바뀐다.
 *
 * 규칙의 근거 (docs/farming-research.md 2장·4.1절):
 * - 작물은 성장 단계가 넘어갈 때마다 자기 양분을 소비하고, 소비한 총량을 소비하지 않는 양분에 균등 분배해 되돌린다.
 *   양분 교환은 타일 단위 → 한 타일 안의 순변화 합이 (0,0,0)이면 비료가 필요 없다.
 * - 과밀은 타일당 `overcrowdingMaxPlants` 포기 초과, 가족은 같은 작물 `familyMin` 포기(반경 1타일).
 */
import { FARM_CONSTANTS, FARM_CROPS, type FarmCrop, type FarmNutrients, type FarmSeason } from "@/data/farming";

/** 조합의 한 칸 = 양분 순변화가 같은 작물 묶음. 칸 안의 작물은 양분상 서로 대체할 수 있다 */
export interface FarmComboSlot {
  /** 서로 대체 가능한 작물 (일반 씨앗에서 흔한 순) */
  crops: FarmCrop[];
  /** 기약 비율 */
  ratio: number;
  /** 과밀 직전까지 채웠을 때 타일당 포기 수 */
  perTile: number;
}

export interface FarmCombo {
  id: string;
  season: FarmSeason;
  slots: FarmComboSlot[];
  plantsPerTile: number;
  /** 모든 칸이 타일 하나 안에서 가족(같은 작물 familyMin 포기)을 채우는가. 아니면 같은 구성의 타일을 붙여 심어야 한다 */
  familyInOneTile: boolean;
  /** 최악의 순서(소비가 전부 먼저 일어남)일 때 성장 단계 1회에 필요한 타일 양분 */
  demand: FarmNutrients;
  /** demand 가 새 밭의 최소 양분 이하인가 */
  safeOnFreshSoil: boolean;
  /** 새 밭 최소 양분보다 수요가 큰 양분의 인덱스 (0 성장 촉진제 · 1 퇴비 · 2 거름) */
  shortNutrients: number[];
}

const MAX_SLOTS = 3;
const MAX_RATIO_SUM = 9;

export function netNutrients(crop: FarmCrop): FarmNutrients {
  return [0, 1, 2].map((i) => crop.restore[i] - crop.consume[i]) as FarmNutrients;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** 일반 씨앗에서 각 작물이 나올 확률(0~1). 잡초 몫을 뺀 나머지를 가중치로 나누고, 제철이면 가중치에 seedWeightSeasonMod 를 곱한다 */
export function randomSeedChances(season: FarmSeason): Map<string, number> {
  const weight = (c: FarmCrop) => c.seedWeight * (c.seasons.includes(season) ? FARM_CONSTANTS.seedWeightSeasonMod : 1);
  const total = FARM_CROPS.reduce((sum, c) => sum + weight(c), 0);
  const cropShare = 1 - FARM_CONSTANTS.randomSeedWeedChance;
  return new Map(FARM_CROPS.map((c) => [c.id, (cropShare * weight(c)) / total]));
}

function* ratios(n: number, prefix: number[] = []): Generator<number[]> {
  if (prefix.length === n) {
    if (prefix.reduce(gcd) === 1) yield prefix;
    return;
  }
  const used = prefix.reduce((a, b) => a + b, 0);
  for (let c = 1; used + c + (n - prefix.length - 1) <= MAX_RATIO_SUM; c++) yield* ratios(n, [...prefix, c]);
}

function* subsets<T>(items: T[], n: number, start = 0, picked: T[] = []): Generator<T[]> {
  if (picked.length === n) {
    yield picked;
    return;
  }
  for (let i = start; i < items.length; i++) yield* subsets(items, n, i + 1, [...picked, items[i]]);
}

const isBalanced = (nets: FarmNutrients[], counts: number[]) =>
  [0, 1, 2].every((i) => nets.reduce((sum, net, k) => sum + net[i] * counts[k], 0) === 0);

/** 더 작은 균형 조합 둘의 합으로 쪼개지면 합성 조합이다 — 기본 조합에서 제외한다 */
function isPrimitive(nets: FarmNutrients[], counts: number[]): boolean {
  const total = counts.reduce((a, b) => a + b, 0);
  const walk = (k: number, part: number[]): boolean => {
    if (k === counts.length) {
      const sum = part.reduce((a, b) => a + b, 0);
      return sum > 0 && sum < total && isBalanced(nets, part);
    }
    for (let p = 0; p <= counts[k]; p++) if (walk(k + 1, [...part, p])) return true;
    return false;
  };
  return !walk(0, []);
}

/**
 * 그 계절이 제철인 작물만으로 만드는 기본 조합.
 * 정렬: ① 타일 하나로 끝나는 것 ② 작물 종류가 적은 것 ③ 일반 씨앗에서 흔한 작물이 든 것.
 */
export function farmCombos(season: FarmSeason): FarmCombo[] {
  const chances = randomSeedChances(season);
  const commonness = (c: FarmCrop) => chances.get(c.id) ?? 0;

  const profiles = new Map<string, FarmCrop[]>();
  for (const crop of FARM_CROPS) {
    if (!crop.seasons.includes(season)) continue;
    const key = netNutrients(crop).join(",");
    profiles.set(key, [...(profiles.get(key) ?? []), crop]);
  }
  for (const crops of profiles.values()) crops.sort((a, b) => commonness(b) - commonness(a));
  const keys = [...profiles.keys()].sort();

  const combos: FarmCombo[] = [];
  for (let n = 2; n <= MAX_SLOTS; n++) {
    for (const group of subsets(keys, n)) {
      const nets = group.map((k) => k.split(",").map(Number) as FarmNutrients);
      for (const counts of ratios(n)) {
        if (!isBalanced(nets, counts) || !isPrimitive(nets, counts)) continue;
        const ratioSum = counts.reduce((a, b) => a + b, 0);
        const mult = Math.floor(FARM_CONSTANTS.overcrowdingMaxPlants / ratioSum);
        const slots = group.map((k, i) => ({ crops: profiles.get(k)!, ratio: counts[i], perTile: counts[i] * mult }));
        const demand = [0, 1, 2].map((i) =>
          slots.reduce((sum, s) => sum + s.crops[0].consume[i] * s.perTile, 0),
        ) as FarmNutrients;
        const shortNutrients = [0, 1, 2].filter((i) => demand[i] > FARM_CONSTANTS.startingNutrientsMin);
        combos.push({
          id: slots.map((s) => `${s.crops[0].id}x${s.ratio}`).join("-"),
          season,
          slots,
          plantsPerTile: ratioSum * mult,
          familyInOneTile: slots.every((s) => s.perTile >= FARM_CONSTANTS.familyMin),
          demand,
          safeOnFreshSoil: shortNutrients.length === 0,
          shortNutrients,
        });
      }
    }
  }

  const best = (c: FarmCombo) => Math.min(...c.slots.map((s) => commonness(s.crops[0])));
  return combos.sort(
    (a, b) =>
      Number(b.familyInOneTile) - Number(a.familyInOneTile) ||
      a.slots.length - b.slots.length ||
      Number(b.safeOnFreshSoil) - Number(a.safeOnFreshSoil) ||
      best(b) - best(a),
  );
}

/** 조합에 그 작물이 (대체 작물로라도) 들어 있는가 */
export const comboHasCrop = (combo: FarmCombo, cropId: string) =>
  combo.slots.some((s) => s.crops.some((c) => c.id === cropId));

/** 그 양분만 채워 주는 비료가 필요한지 판단할 때: 작물이 소비하는 양분 인덱스 */
export const consumedNutrients = (crop: FarmCrop) => [0, 1, 2].filter((i) => crop.consume[i] > 0);
