/**
 * 은둔자 거래·찻집·집 꾸미기 화면 전용 문구 (#142).
 *
 * `src/lib/i18n.ts`에 넣지 않는 이유는 농사(`farming-text.ts`)와 같다 — 그 파일은 홈 번들에 들어간다.
 * 게임에 원문이 있는 이름(품목·재료·건물)은 전부 `src/data/hermit-trades.ts`(ko.po/strings.lua)에서 오고,
 * 여기엔 **게임에 없는 말**(표 제목·열 이름·설명)만 둔다. 점수 항목 이름은 게임에 공식 라벨이 없어
 * (진주의 불평 대사만 있다) 소스의 PEARL_DECORATION_TYPES 키를 풀어 쓴 것이다.
 */
import type { HermitDecorKey, HermitTeaBuff } from "@/data/hermit-trades";
import type { Locale } from "@/lib/i18n";

type Txt = { ko: string; en: string };

export const HERMIT_TEXT = {
  sectionTitle: { ko: "은둔자 거래 · 집 꾸미기", en: "Hermit Trades & Home Decor" },
  sectionSummary: { ko: "병 교환 품목, 찻집 메뉴, 꾸미기 점수표", en: "Bottle Exchange, Tea Shop menu, decoration score" },
  viewTrades: { ko: "병 교환", en: "Bottle Exchange" },
  viewTeas: { ko: "찻집", en: "Tea Shop" },
  viewDecor: { ko: "집 꾸미기", en: "Home Decor" },

  tradesIntro: {
    ko: "빈 병을 주고 받는 품목. 친구 레벨은 은둔자 퀘스트를 하나 완료할 때마다 1씩 오르고(최대 10), 레벨에 따라 거래 품목이 늘어납니다.",
    en: "Items Pearl trades for Empty Bottles. Friendship rises by 1 per completed hermit quest (max 10), and each level adds trades.",
  },
  friendLevel: { ko: "친구 Lv", en: "Friendship Lv" },
  unlockHouse3Winter: { ko: "집 수리 3단계 완료 + 겨울 축제 기간", en: "Repair House stage 3 done + during Winter's Feast" },
  bottles: { ko: "빈 병", en: "Empty Bottle" },
  gives: { ko: "개 지급", en: "given" },
  tradeNoteRelocation: {
    ko: "거래가 아닌 '제작 도움' 품목도 있어요 — 염합기는 금 간 진주를 진주에게 돌려주면, 은둔자 이사기는 왁스태프 사건 뒤 진주가 좋은 지도를 받은 다음에 제작법을 알려 줍니다.",
    en: "Some recipes are taught rather than traded: the Combriner after you return the Cracked Pearl, and the Hermit Relocation Kit once Pearl has accepted a good map after the Wagstaff incident.",
  },

  teasIntro: {
    ko: "진주네 찻집(꾸미기 점수 25 이상에서 지음)에서 빈 병 1개 + 말린 재료로 끓입니다. 재료 수는 꾸미기 점수에 따라 줄어듭니다.",
    en: "Brewed at Pearl's Tea Shop (built at decoration score 25+) for 1 Empty Bottle + dried ingredients. Ingredient counts drop as the decoration score rises.",
  },
  teaUses: { ko: "한 잔에 {n}모금", en: "{n} sips per cup" },
  teaLevelHeader: { ko: "점수", en: "Score" },
  teaCommon: { ko: "일반 재료", en: "Common" },
  teaRare: { ko: "희귀 재료", en: "Rare" },
  teaOnDrink: { ko: "마실 때", en: "On drink" },
  teaBuff: { ko: "효과", en: "Effect" },
  sanity: { ko: "정신력", en: "Sanity" },
  health: { ko: "체력", en: "Health" },

  decorIntro: {
    ko: "진주의 섬 안에 둔 것들로 10초마다 다시 계산되는 점수(0~100). 90 이상이면 진주가 만족하고, 아래 표의 건물들이 점수에 따라 열리거나 다시 닫힙니다.",
    en: "Recounted every 10 s from everything on Pearl's island (0–100). At 90+ Pearl is happy, and the buildings below unlock or re-lock by score.",
  },
  decorUnlocksTitle: { ko: "점수로 열리는 것", en: "Unlocked by score" },
  decorUnlockAt: { ko: "{n}점 이상", en: "at {n}+" },
  decorRelock: { ko: "{n} 미만이면 잠김", en: "locks below {n}" },
  decorRequiresMax: { ko: "친구 Lv10 필요", en: "needs friendship Lv10" },
  decorHappyLine: {
    ko: "90점 이상: 진주가 칭찬하고, 온천에 30초 대신 60초 몸을 담급니다.",
    en: "90+: Pearl praises the place and soaks in the hot spring for 60 s instead of 30 s.",
  },
  decorHouse5Line: {
    ko: "집 5단계(장식 거는 집)는 친구 Lv10이면 점수와 상관없이 지을 수 있고(월석 유리 10 · 유목 10 · 비단 10), 그때 풍경 제작법(잔가지 1 · 슬러틀 껍질 조각 1)이 열립니다.",
    en: "The stage-5 home (hangs ornaments) only needs friendship Lv10 regardless of score (10 Moon Glass · 10 Driftwood · 10 Silk), and unlocks the Wind Charm recipe (1 Twigs · 1 Slurtle Shell).",
  },
  decorTableTitle: { ko: "점수표", en: "Score table" },
  decorItem: { ko: "항목", en: "Item" },
  decorPoints: { ko: "점수", en: "Points" },
  decorCap: { ko: "상한", en: "Cap" },
  decorNoCap: { ko: "없음", en: "none" },
  perEach: { ko: "개당", en: "each" },
  perTile: { ko: "칸당", en: "per tile" },
  perSlot: { ko: "칸당", en: "per slot" },
  perWeight: { ko: "무게 1당", en: "per weight" },
  decorWinterBonus: {
    ko: "겨울 축제 기간에는 축제 스킨(yule)을 입힌 건물과 진주 자신이 각각 +2.",
    en: "During Winter's Feast, each building with a Winter's Feast (yule) skin, and Pearl herself, add +2.",
  },
  decorTilesNote: { ko: "섬 안 최대 100칸까지 셉니다.", en: "Counts up to 100 tiles on the island." },
  gameValue: { ko: "게임 수치", en: "Game data" },
  seeInCrafting: { ko: "제작 탭에서 보기", en: "View in crafting tab" },
} satisfies Record<string, Txt>;

export const HERMIT_DECOR_LABEL: Record<HermitDecorKey, Txt> = {
  unique: { ko: "진주의 시설", en: "Pearl's facilities" },
  house5: { ko: "집 5단계", en: "Stage-5 home" },
  ornaments: { ko: "집에 건 장식", en: "Ornaments on the home" },
  tiles: { ko: "바닥", en: "Turf" },
  watertree: { ko: "그늘 나무", en: "Canopy tree" },
  critter: { ko: "반려동물", en: "Critters" },
  beebox: { ko: "벌통", en: "Bee Boxes" },
  flower: { ko: "꽃", en: "Flowers" },
  lightpost: { ko: "가로등", en: "Light Posts" },
  pickable: { ko: "채집 식물", en: "Pickable plants" },
  meatrack: { ko: "건조대", en: "Drying Racks" },
  chair: { ko: "의자", en: "Chairs" },
  trophyfish: { ko: "전시한 물고기", en: "Trophy fish" },
  pottedplant: { ko: "화분", en: "Potted plants" },
  dockpost: { ko: "부두 말뚝", en: "Dock Pilings" },
  table: { ko: "탁자", en: "Tables" },
  spawner: { ko: "몬스터 둥지", en: "Spawners" },
  junk: { ko: "쓰레기", en: "Junk" },
  fishing: { ko: "낚시터 막힘", en: "Blocked fishing spots" },
};

export function hermitLang(locale: Locale): "ko" | "en" {
  return locale === "ko" ? "ko" : "en";
}

export function ht(key: keyof typeof HERMIT_TEXT, lang: "ko" | "en", vars?: Record<string, string | number>): string {
  let s: string = HERMIT_TEXT[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export function formatTeaBuff(buff: HermitTeaBuff, lang: "ko" | "en"): string {
  const sec = (n: number) => (lang === "ko" ? `${n}초` : `${n}s`);
  switch (buff.kind) {
    case "sanity_tick": {
      const total = (buff.durationSec / buff.tickSec) * buff.perTick;
      const sign = buff.perTick > 0 ? "+" : "";
      return lang === "ko"
        ? `${sec(buff.durationSec)} 동안 ${buff.tickSec}초마다 정신력 ${sign}${buff.perTick} (합 ${sign}${total})`
        : `${sign}${buff.perTick} sanity every ${buff.tickSec}s for ${sec(buff.durationSec)} (${sign}${total} total)`;
    }
    case "health_tick": {
      const total = (buff.durationSec / buff.tickSec) * buff.perTick;
      return lang === "ko"
        ? `${sec(buff.durationSec)} 동안 ${buff.tickSec}초마다 체력 +${buff.perTick} (합 +${total})`
        : `+${buff.perTick} health every ${buff.tickSec}s for ${sec(buff.durationSec)} (+${total} total)`;
    }
    case "neg_aura": {
      const pct = Math.round((1 - buff.multiplier) * 100);
      return lang === "ko"
        ? `${sec(buff.durationSec)} 동안 주변의 정신력 감소 오라 ${pct}% 감소`
        : `Negative sanity auras reduced by ${pct}% for ${sec(buff.durationSec)}`;
    }
    case "temperature": {
      const sign = buff.delta > 0 ? "+" : "";
      return lang === "ko"
        ? `${sec(buff.durationSec)} 동안 체온 ${sign}${buff.delta}`
        : `Body temperature ${sign}${buff.delta} for ${sec(buff.durationSec)}`;
    }
    case "shadow_panic":
      return lang === "ko"
        ? `${sec(buff.durationSec)} 동안 나를 때린 그림자 생물이 ${sec(buff.panicSec)} 달아남`
        : `For ${sec(buff.durationSec)}, shadow creatures that hit you flee for ${sec(buff.panicSec)}`;
  }
}
