// WX-78 회로 모듈 정의
// 인게임 소스: scripts/wx78_moduledefs.lua + tuning.lua + scripts/strings.lua
// 한글명: 한글모드 ko.po (chess만 자체 번역)

export type CircuitType = "alpha" | "beta" | "gamma";

// 정량 가능한 스탯 종류 (현황 패널에서 합산)
export type StatKind =
  | "maxHealth"        // +값
  | "maxSanity"
  | "maxHunger"
  | "moveSpeed"        // 누적 인덱스 → CHIPBOOSTS 배열
  | "lightRadius"      // 누적 합산
  | "minTempUp"        // 추위 저항 (분당 °C)
  | "maxTempDown"      // 더위 저항
  | "dryRate"          // 건조 속도 보너스
  | "viewDistance"     // 카메라 거리 보너스
  | "regenPerTick"     // 피해받았을 때 회복
  | "sanityAuraPerSec" // 음악 유발 정신력 오라
  | "dapperness"       // 정신력/초
  | "tendRange"        // 음악 농작물 범위
  | "armorPct"         // 데미지 감소율 (per 모듈)
  | "shieldPctOfHP"    // 빈부스터 보호막 (체력의 %)
  | "shieldRegenPerSec"
  | "hungerSlowMult"   // 허기 소모 비율 (1=기본)
  | "freezeResistMult" // 얼리기 저항 배수
  | "fireDmgScaleMult" // 불 데미지 배수 (음수면 감소)
  | "follower"         // 최대 추종자 수
  | "spoiledFoodLessNeeded"
  | "extraInventorySlot";

export type StatEffect = {
  kind: StatKind;
  value: number;
  // moveSpeed의 경우 인덱스 누적 — value는 1로 두고 누적치 계산은 패널에서 처리
};

// 한글/영문 자유 텍스트로만 표현 가능한 능력
export type Capability = {
  id: string; // 식별자
  ko: string;
  en: string;
};

// 스킬 활성 시 추가/변경되는 효과
export type CircuitBuff = {
  skill: string; // skill node id
  // 추가되는 정량 스탯 (per 모듈 또는 한 번)
  stats?: StatEffect[];
  // 추가/변경되는 능력 텍스트
  caps?: Capability[];
};

export type CircuitModule = {
  id: string;       // "wx78module_<name>"
  name: string;     // "maxhealth"
  type: CircuitType;
  slots: number;
  nameI18n: { ko: string; en: string };
  desc: { ko: string; en: string };
  scanFrom?: string[];
  // 항상 적용 효과
  stats?: StatEffect[];
  caps?: Capability[];
  // 스킬에 의해 강화되는 효과
  buffs?: CircuitBuff[];
};

// ── TUNING 값 (인게임 tuning.lua에서 발췌) ────────────────────────
export const WX78_TUNING = {
  MAXHEALTH_BOOST: 40,
  MAXHEALTH2_MULT: 2.5,        // maxhealth2 = 40 * 2.5 = 100
  MAXSANITY1_BOOST: 40,
  MAXSANITY_BOOST: 100,
  MAXHUNGER1_BOOST: 40,
  MAXHUNGER_BOOST: 100,
  MAXHUNGER_SLOWPERCENT: 0.80, // 허기 소모 80%
  MOVESPEED_CHIPBOOSTS: [0.0, 0.25, 0.4, 0.5], // 0/1/2/3+ chip
  LIGHT_RADIUS_PER_MODULE: 1.25,
  HEATERTEMPPERMODULE: 25,
  MINTEMPCHANGEPERMODULE: 20,
  TASERDAMAGE: 20,
  RADAR_EXTRA_VIEW_DIST: 5,
  MUSIC_RANGE: 12,
  MUSIC_DAPPERNESS: 100 / (480 * 4.5), // = 0.0463 sanity/sec, day_time=480s
  MUSIC_SANITYAURA: 100 / (480 * 4.5),
  BEE_HEALTHPERTICK: 5.0,
  BEE_TICKPERIOD_SEC: 30, // seg_time
  DIGESTION_SPOILED_NEEDED: 5,
  MODULE_USES: 4, // 충전 횟수
  INITIAL_MAXSLOTS: 6,
  MAXSLOTS_WITH_SKILL: 7,
  // SKILLS.WX78
  HALF_MODULE_CONSUMPTION: 0.5,
  FASTER_CHARGE_MULTIPLIER: 2.5,
  MAXHEALTH_ARMOR_ALPHABUFF_2: 0.025,
  MAXHEALTH2_ARMOR_MULT: 2,
  MAXHUNGER_SLOWPERCENT_ALPHABUFF: 0.75,
  MAXHUNGER_SLOWPERCENT_ALPHABUFF_2: 0.70,
  MAXHUNGER1_SLOWPERCENT_ALPHABUFF: 0.95,
  MAXHUNGER1_SLOWPERCENT_ALPHABUFF_2: 0.90,
  MAXSANITY1_SANITY_MOD_ALPHABUFF: 0.8,
  MAXSANITY_SANITY_MOD_ALPHABUFF: 0.5,
  MAXSANITY1_DAPPERNESS_MULT: 0.10,
  MAXSANITY_DAPPERNESS_MULT: 0.30,
  BEE_SHIELD_REGEN_PER_SECOND: 0.25,
  BEE_SHIELDPERCENT: 0.2,
  COLD_FIRE_DAMAGE_SCALE: 0.5,
  HEAT_FREEZE_RESISTANCE: 2,
  MUSIC_MAXFOLLOWERS: 10,
  TASER_BUILDUP_DAMAGE: 50,
  TASER_BUILDUP_RADIUS: 2,
  TASER_BUILDUP_RADIUS_PER_MODULE: 1,
} as const;

// ── 모듈 정의 ─────────────────────────────────────────────────
export const WX78_CIRCUITS: CircuitModule[] = [
  // ── ALPHA ────────────────────────────────────────────────
  {
    id: "wx78module_maxhealth",
    name: "maxhealth",
    type: "alpha",
    slots: 1,
    nameI18n: { ko: "체력 증진 회로", en: "Hardy Circuit" },
    desc: { ko: "로봇 신체를 좀 더 튼튼하게.", en: "Make your robotic body a bit more robust." },
    scanFrom: ["spider"],
    stats: [{ kind: "maxHealth", value: 40 }],
    buffs: [
      {
        skill: "wx78_circuitry_alphabuffs_2",
        stats: [{ kind: "armorPct", value: 0.025 }],
      },
    ],
  },
  {
    id: "wx78module_maxhealth2",
    name: "maxhealth2",
    type: "alpha",
    slots: 2,
    nameI18n: { ko: "체력 초증진 회로", en: "Super-Hardy Circuit" },
    desc: { ko: "로봇 신체를 훨씬 더 튼튼하게.", en: "Make your robotic body much more robust." },
    scanFrom: ["spider_healer"],
    stats: [{ kind: "maxHealth", value: 100 }], // 40 * 2.5
    buffs: [
      {
        skill: "wx78_circuitry_alphabuffs_2",
        stats: [{ kind: "armorPct", value: 0.05 }], // 0.025 * 2 (MAXHEALTH2_ARMOR_MULT)
      },
    ],
  },
  {
    id: "wx78module_maxsanity1",
    name: "maxsanity1",
    type: "alpha",
    slots: 1,
    nameI18n: { ko: "연산 회로", en: "Processing Circuit" },
    desc: { ko: "연산 능력을 조금만 늘려도 기계 정신이 안정화됩니다.", en: "A little extra processing power helps to ease the mechanical mind." },
    scanFrom: ["butterfly", "moonbutterfly"],
    stats: [{ kind: "maxSanity", value: 40 }],
    buffs: [
      {
        skill: "wx78_circuitry_alphabuffs_2",
        caps: [{ id: "maxsanity1_dapperness", ko: "정신력 회복 장비(태머 센터, 계몽 왕관 등) 효율 +10%, 적의 정신력 감소 오라 −20%", en: "Sanity-restore gear (Tam, Crown, etc.) +10% effective; hostile sanity-drain aura −20%" }],
      },
    ],
  },
  {
    id: "wx78module_maxsanity",
    name: "maxsanity",
    type: "alpha",
    slots: 2,
    nameI18n: { ko: "초연산 회로", en: "Super-Processing Circuit" },
    desc: { ko: "연산 능력을 크게 올리면 정말로 생각이 잘 굴러갑니다.", en: "A big boost of processing power will really get those gears turning." },
    scanFrom: ["crawlinghorror", "crawlingnightmare", "terrorbeak", "nightmarebeak", "oceanhorror", "ruinsnightmare"],
    stats: [
      { kind: "maxSanity", value: 100 },
      { kind: "dapperness", value: 100 / (480 * 10) }, // 0.0208 sanity/sec
    ],
    buffs: [
      {
        skill: "wx78_circuitry_alphabuffs_2",
        caps: [{ id: "maxsanity_dapperness", ko: "정신력 회복 장비 효율 +30%, 적의 정신력 감소 오라 −50%", en: "Sanity-restore gear +30% effective; hostile sanity-drain aura −50%" }],
      },
    ],
  },
  {
    id: "wx78module_maxhunger1",
    name: "maxhunger1",
    type: "alpha",
    slots: 1,
    nameI18n: { ko: "소화기 확장 회로", en: "Gastrogain Circuit" },
    desc: { ko: "연료 탱크를 조금 늘립니다.", en: "Add a bit of room to your fuel tank." },
    scanFrom: ["hound"],
    stats: [{ kind: "maxHunger", value: 40 }],
    buffs: [
      {
        skill: "wx78_circuitry_alphabuffs_1",
        stats: [{ kind: "hungerSlowMult", value: 0.95 }],
      },
      {
        skill: "wx78_circuitry_alphabuffs_2",
        stats: [{ kind: "hungerSlowMult", value: 0.90 }],
      },
    ],
  },
  {
    id: "wx78module_maxhunger",
    name: "maxhunger",
    type: "alpha",
    slots: 2,
    nameI18n: { ko: "소화기 초확장 회로", en: "Super-Gastrogain Circuit" },
    desc: { ko: "가장 만족할 줄 모르는 자동기계의 식욕도 담아낼 수 있습니다.", en: "Capable of containing even the most insatiable automaton's appetite." },
    scanFrom: ["bearger", "slurper"],
    stats: [
      { kind: "maxHunger", value: 100 },
      { kind: "hungerSlowMult", value: 0.80 },
    ],
    buffs: [
      {
        skill: "wx78_circuitry_alphabuffs_1",
        stats: [{ kind: "hungerSlowMult", value: 0.75 }],
      },
      {
        skill: "wx78_circuitry_alphabuffs_2",
        stats: [{ kind: "hungerSlowMult", value: 0.70 }],
      },
    ],
  },
  {
    id: "wx78module_bee",
    name: "bee",
    type: "alpha",
    slots: 3,
    nameI18n: { ko: "빈부스터 모듈", en: "Beanbooster Circuit" },
    desc: { ko: "몸과 마음에 강력한 퍼텐셜을 붕붕!", en: "Get your brain and body buzzing with powerful potential!" },
    scanFrom: ["beequeen"],
    stats: [
      { kind: "maxSanity", value: 100 }, // bee 에서 maxsanity_activate 호출
      { kind: "dapperness", value: 100 / (480 * 10) },
      { kind: "regenPerTick", value: 5 }, // 30초 주기로 5 HP (피해 받은 상태)
    ],
    caps: [{ id: "bee_regen_note", ko: "체력이 깎였을 때 30초마다 +5 HP 회복", en: "+5 HP every 30s while below max health" }],
    buffs: [
      {
        skill: "wx78_circuitry_alphabuffs_2",
        stats: [
          { kind: "shieldPctOfHP", value: 0.2 }, // 모듈당 최대체력의 20%
          { kind: "shieldRegenPerSec", value: 0.25 },
        ],
        caps: [{ id: "bee_alphabuff2", ko: "정신력 회복 장비 효율 +30%, 적의 정신력 감소 오라 −50%", en: "Sanity-restore gear +30% effective; hostile sanity-drain aura −50%" }],
      },
    ],
  },

  // ── BETA ─────────────────────────────────────────────────
  {
    id: "wx78module_movespeed",
    name: "movespeed",
    type: "beta",
    slots: 6,
    nameI18n: { ko: "가속 회로", en: "Acceleration Circuit" },
    desc: { ko: "급조한 가속 부스터. 개선의 여지가 있습니다.", en: "A hastily designed speed booster. It could use some improvement." },
    scanFrom: ["rabbit"],
    stats: [{ kind: "moveSpeed", value: 1 }], // 누적 인덱스 +1 → CHIPBOOSTS 적용
  },
  {
    id: "wx78module_movespeed2",
    name: "movespeed2",
    type: "beta",
    slots: 2,
    nameI18n: { ko: "초가속 회로", en: "Super-Acceleration Circuit" },
    desc: { ko: "완벽해진 이동 가속기로 엔진에 기어비를 높여보세요.", en: "A perfected speed booster to kick your engine into high gear." },
    scanFrom: ["minotaur", "rook", "rook_nightmare"],
    stats: [{ kind: "moveSpeed", value: 1 }],
  },
  {
    id: "wx78module_heat",
    name: "heat",
    type: "beta",
    slots: 3,
    nameI18n: { ko: "발열 회로", en: "Thermal Circuit" },
    desc: { ko: "열 좀 올려봅시다.", en: "Things are about to get heated." },
    scanFrom: ["firehound", "cave_vent_mite", "dragonfly"],
    stats: [
      { kind: "minTempUp", value: 20 },   // MINTEMPCHANGEPERMODULE
      { kind: "dryRate", value: 0.1 },
    ],
    caps: [{ id: "heat_freeze_immune", ko: "발열 회로 2개 끼면 얼리기 면역", en: "Two heat circuits = freeze immunity" }],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_1",
        stats: [{ kind: "freezeResistMult", value: 2 }],
      },
    ],
  },
  {
    id: "wx78module_cold",
    name: "cold",
    type: "beta",
    slots: 3,
    nameI18n: { ko: "냉각 회로", en: "Refrigerant Circuit" },
    desc: { ko: "동체를 이동식 냉동기로 만듭니다.", en: "Turn your chassis into a portable freezer." },
    scanFrom: ["icehound", "deerclops"],
    stats: [{ kind: "maxTempDown", value: 20 }],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_1",
        stats: [{ kind: "fireDmgScaleMult", value: -0.5 }],
      },
    ],
  },
  {
    id: "wx78module_nightvision",
    name: "nightvision",
    type: "beta",
    slots: 4,
    nameI18n: { ko: "광전자 회로", en: "Optoelectronic Circuit" },
    desc: { ko: "광학 센서를 야간 투시에 맞게 조율합니다.", en: "Recalibrate your optic sensors for night vision." },
    scanFrom: ["mole"],
    caps: [{ id: "nightvision_at_night", ko: "어둠에서도 시야 확보 (두더지 비전과 비슷한 색 반전 화면, 만월 밤은 제외)", en: "See in the dark (mole-hat-style inverted view; doesn't trigger on full-moon nights)" }],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_1",
        caps: [{ id: "nightvision_clear", ko: "야간 시야의 색 반전 효과 제거 — 일반 낮처럼 선명하게 보임", en: "Removes the inverted-color filter — clear daytime-like view" }],
      },
    ],
  },
  {
    id: "wx78module_taser",
    name: "taser",
    type: "beta",
    slots: 2,
    nameI18n: { ko: "전격 회로", en: "Electrification Circuit" },
    desc: { ko: "덤비는 놈들은 전부 짜릿짜릿해질 겁니다.", en: "Anything that attacks you will get a shocking surprise." },
    scanFrom: ["lightninggoat"],
    caps: [
      { id: "taser_retaliate", ko: "맞을 때 공격자 감전 — 20 피해 + 주변 체인 스턴", en: "On hit: shocks attacker for 20 dmg + chain stun nearby" },
      { id: "taser_insulated", ko: "번개·전기 피해 무효", en: "Immune to lightning/electric damage" },
    ],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_2",
        caps: [
          { id: "taser_buildup", ko: "맞을수록 전기가 충전됨 — 가득 차면 주변 전기 폭발 (50 피해, 반경 2m + 모듈당 1m)", en: "Builds up charge from hits — full charge triggers nearby blast (50 dmg, 2m radius + 1m/module)" },
        ],
      },
    ],
  },
  {
    id: "wx78module_light",
    name: "light",
    type: "beta",
    slots: 3,
    nameI18n: { ko: "발광 회로", en: "Illumination Circuit" },
    desc: { ko: "존재만으로 공간을 밝힙니다.", en: "Light up a room with your presence." },
    scanFrom: ["fireflies"],
    stats: [{ kind: "lightRadius", value: 1.25 }],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_2",
        caps: [{ id: "light_beam", ko: "빛이 향한 방향으로 더 멀리 비추는 빔으로 변경", en: "Light becomes a directional beam, reaching farther" }],
      },
    ],
  },
  {
    id: "wx78module_light2",
    name: "light2",
    type: "beta",
    slots: 1,
    nameI18n: { ko: "초발광 회로", en: "Super-Illumination Circuit" },
    desc: { ko: "그들에게... 조명을 비추어 보세요.", en: "Let them see the light... you." },
    scanFrom: ["squid", "worm", "lightflier"],
    stats: [{ kind: "lightRadius", value: 1.25 }],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_2",
        caps: [{ id: "light_beam", ko: "빛이 향한 방향으로 더 멀리 비추는 빔으로 변경", en: "Light becomes a directional beam, reaching farther" }],
      },
    ],
  },
  {
    id: "wx78module_radar",
    name: "radar",
    type: "beta",
    slots: 1,
    nameI18n: { ko: "시야 확장 회로", en: "Rangebooster Circuit" },
    desc: { ko: "시야를 넓히세요.", en: "Expand your horizons." },
    scanFrom: ["crow", "robin", "robin_winter", "puffin", "canary"],
    stats: [{ kind: "viewDistance", value: 5 }],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_1",
        caps: [{ id: "radar_drone_range", ko: "정찰·감전 드론과 스캐너 사거리 강화", en: "Boosts scout/zap drone range and scanner reach" }],
      },
    ],
  },
  {
    id: "wx78module_music",
    name: "music",
    type: "beta",
    slots: 3,
    nameI18n: { ko: "음악상자 회로", en: "Chorusbox Circuit" },
    desc: { ko: "예나 지금이나 모든 기계는 조율이 중요합니다.", en: "Every machine needs a tune-up now and then." },
    scanFrom: ["crabking", "hermitcrab"],
    stats: [
      { kind: "sanityAuraPerSec", value: 100 / (480 * 4.5) },
      { kind: "dapperness", value: 100 / (480 * 4.5) },
      { kind: "tendRange", value: 12 },
    ],
    caps: [{ id: "music_tend_farm", ko: "주변 12m 농작물 자동 보살핌 (모듈당 범위 +12m)", en: "Auto-tends farm plants within 12m (per module)" }],
    buffs: [
      {
        skill: "wx78_circuitry_betabuffs_1",
        stats: [{ kind: "follower", value: 10 }],
        caps: [{ id: "music_followers", ko: "근처 인어가 동료가 되어 농작물 보살핌을 도움", en: "Nearby Merms become helpers and tend plants too" }],
      },
    ],
  },
  {
    id: "wx78module_stacksize",
    name: "stacksize",
    type: "beta",
    slots: 1,
    nameI18n: { ko: "공간 확장 회로", en: "Spatializer Circuit" },
    desc: { ko: "인벤토리 마지막 칸이 한 종류 아이템 100개 보관 가능한 통으로 변함.", en: "Last inventory slot becomes a 100-stack container (single item type)." },
    scanFrom: ["krampus"],
    stats: [{ kind: "extraInventorySlot", value: 1 }],
  },

  // ── GAMMA ────────────────────────────────────────────────
  {
    id: "wx78module_screech",
    name: "screech",
    type: "gamma",
    slots: 3,
    nameI18n: { ko: "음파 발진 회로", en: "Sonic-Invoker Circuit" },
    desc: { ko: "영혼 없는 자동기계의 무시무시한 함성을 외칩니다!", en: "Unleash the fearsome battlecry of the soulless automaton!" },
    scanFrom: ["molebat"],
    caps: [{ id: "screech_action", ko: "비명 행동 사용 가능 — 사용 시 주변 적·중립 몹이 공포로 도주", en: "Adds Screech action — fears nearby hostile/neutral mobs into fleeing" }],
  },
  {
    id: "wx78module_digestion",
    name: "digestion",
    type: "gamma",
    slots: 2,
    nameI18n: { ko: "재소화 회로", en: "Redigestion Circuit" },
    desc: { ko: "상한 음식도 다시 보자!", en: "Give spoiled food a second chance!" },
    scanFrom: ["catcoon"],
    caps: [
      { id: "digestion_eat_spoiled", ko: "상한 음식을 깎임 없이 먹을 수 있음", en: "Can eat spoiled food without penalty" },
      { id: "digestion_brick", ko: "상한 음식 5개 먹으면 푸드브릭 생성 (회로 1개 추가마다 −1, 최소 3개)", en: "Eat 5 spoiled foods → produces foodbrick (−1 per extra circuit, min 3)" },
    ],
    buffs: [
      {
        skill: "wx78_circuitry_gammabuffs_1",
        caps: [{ id: "digestion_perm", ko: "회로를 빼도 상한 음식 섭취 능력 유지", en: "Spoiled-food eating persists even after unequipping" }],
      },
    ],
  },
  {
    id: "wx78module_spin",
    name: "spin",
    type: "gamma",
    slots: 3,
    nameI18n: { ko: "회전기 회로", en: "Spin-Cycle Circuit" },
    desc: { ko: "도끼·곡괭이를 들면 회전 광역 공격이 가능해집니다.", en: "Hold an axe or pickaxe to perform spin AOE attacks." },
    scanFrom: ["mossling"],
    caps: [{ id: "spin_aoe", ko: "도끼·곡괭이를 들면 회전 광역 공격 가능 (도구 효율적 사용도 자동 적용)", en: "Hold an axe or pickaxe to spin-attack (efficient tool use auto-applied)" }],
  },
  {
    id: "wx78module_shielding",
    name: "shielding",
    type: "gamma",
    slots: 4,
    nameI18n: { ko: "방어 회로", en: "Blocking Circuit" },
    desc: { ko: "스스로를 지키세요!", en: "Protect yourself!" },
    scanFrom: ["rocky", "slurtle", "snurtle"],
    caps: [{ id: "shielding_action", ko: "방어 자세 토글 가능 — 켜면 못 움직이지만 받는 피해 감소", en: "Toggle blocking stance — can't move but reduces damage taken" }],
    buffs: [
      {
        skill: "wx78_circuitry_gammabuffs_2",
        caps: [{ id: "shielding_buff", ko: "방어 자세 시 피해 감소량 강화", en: "Stronger damage reduction while blocking" }],
      },
    ],
  },
  {
    id: "wx78module_chess",
    name: "chess",
    type: "gamma",
    slots: 1,
    nameI18n: { ko: "체스마스터 회로", en: "Chessmaster Circuit" },
    desc: { ko: "시계태엽 기계를 감전시키지 않아도 톱니바퀴를 줘서 우리편으로 만들 수 있음.", en: "Recruit Clockworks with gears — no need to shock-stun them first." },
    scanFrom: ["knight", "knight_nightmare", "knight_yoth"],
    caps: [
      { id: "chess_follower", ko: "시계태엽 추종자 최대치 +1 (모듈당)", en: "+1 max Clockwork follower per module" },
      { id: "chess_no_stun", ko: "감전(기절)시키지 않아도 톱니바퀴를 줘서 우리편 만들 수 있음", en: "Recruit Clockworks with gears without stunning them first" },
    ],
    buffs: [
      {
        skill: "wx78_circuitry_gammabuffs_1",
        caps: [{ id: "chess_no_aggro", ko: "원래 선공인 시계태엽이 가까이 가도 공격하지 않음", en: "Hostile Clockworks no longer aggro when you approach" }],
      },
    ],
  },
];

export const WX78_CIRCUITS_BY_ID: Record<string, CircuitModule> =
  Object.fromEntries(WX78_CIRCUITS.map((c) => [c.id, c]));

// 회로 타입 색상 (인게임 회로판 바 색상과 매칭)
export const TYPE_COLORS: Record<CircuitType, string> = {
  alpha: "#ef4444",
  beta: "#3b82f6",
  gamma: "#eab308",
};

// 회로 타입 라벨 — 표시 시 항상 이 함수 사용
export const TYPE_LABEL: Record<CircuitType, { ko: string; en: string }> = {
  alpha: { ko: "알파", en: "Alpha" },
  beta: { ko: "베타", en: "Beta" },
  gamma: { ko: "감마", en: "Gamma" },
};

export function typeLabel(type: CircuitType, locale: string): string {
  return locale === "ko" ? TYPE_LABEL[type].ko : TYPE_LABEL[type].en;
}

// 스캔 대상 prefab → 한글명 (ko.po STRINGS.NAMES.<UPPER> 기준)
export const SCAN_PREFAB_KO: Record<string, string> = {
  spider: "거미",
  spider_healer: "간호사 거미",
  butterfly: "나비",
  moonbutterfly: "달 나방",
  crawlinghorror: "기어다니는 공포",
  crawlingnightmare: "기어다니는 악몽",
  terrorbeak: "공포부리",
  nightmarebeak: "악몽부리",
  oceanhorror: "공포집게",
  ruinsnightmare: "도사리는 악몽",
  hound: "사냥개",
  bearger: "곰소리",
  slurper: "후루기",
  beequeen: "여왕벌",
  crabking: "대게왕",
  hermitcrab: "게팍한 은둔자",
  minotaur: "고대의 수호자",
  rook: "시계태엽 룩",
  rook_nightmare: "망가진 룩",
  rabbit: "토끼",
  firehound: "화염 사냥개",
  cave_vent_mite: "지열개미",
  dragonfly: "용파리",
  icehound: "얼음 사냥개",
  deerclops: "외눈사슴",
  lightninggoat: "번개 염소",
  fireflies: "반딧불이",
  mole: "두더지렁이",
  crow: "까마귀",
  robin: "홍관조",
  robin_winter: "눈새",
  puffin: "바다오리",
  canary: "카나리아",
  molebat: "벌거숭이두더박쥐",
  catcoon: "캣쿤",
  mossling: "모슬링",
  rocky: "돌가재",
  slurtle: "슬러틀",
  snurtle: "스너틀",
  knight: "시계태엽 나이트",
  knight_nightmare: "망가진 나이트",
  knight_yoth: "금박 나이트",
  squid: "날쌘징어",
  worm: "동굴지렁이",
  lightflier: "전구벌레",
  krampus: "크람푸스",
};

// 영문명 (대시보드 일관성용 — 인게임 STRINGS.NAMES 기반)
export const SCAN_PREFAB_EN: Record<string, string> = {
  spider: "Spider",
  spider_healer: "Spider Nurse",
  butterfly: "Butterfly",
  moonbutterfly: "Moon Moth",
  crawlinghorror: "Crawling Horror",
  crawlingnightmare: "Crawling Nightmare",
  terrorbeak: "Terrorbeak",
  nightmarebeak: "Nightmarebeak",
  oceanhorror: "Ocean Horror",
  ruinsnightmare: "Ruins Nightmare",
  hound: "Hound",
  bearger: "Bearger",
  slurper: "Slurper",
  beequeen: "Bee Queen",
  crabking: "Crab King",
  hermitcrab: "Hermit Crab",
  minotaur: "Ancient Guardian",
  rook: "Clockwork Rook",
  rook_nightmare: "Damaged Rook",
  rabbit: "Rabbit",
  firehound: "Red Hound",
  cave_vent_mite: "Lava Mite",
  dragonfly: "Dragonfly",
  icehound: "Blue Hound",
  deerclops: "Deerclops",
  lightninggoat: "Volt Goat",
  fireflies: "Fireflies",
  mole: "Mole",
  crow: "Crow",
  robin: "Redbird",
  robin_winter: "Snowbird",
  puffin: "Puffin",
  canary: "Canary",
  molebat: "Molebat",
  catcoon: "Catcoon",
  mossling: "Mossling",
  rocky: "Rock Lobster",
  slurtle: "Slurtle",
  snurtle: "Snurtle",
  knight: "Clockwork Knight",
  knight_nightmare: "Damaged Knight",
  knight_yoth: "Gilded Knight",
  squid: "Rockjaw",
  worm: "Depths Worm",
  lightflier: "Light Bug",
  krampus: "Krampus",
};

// ── 헬퍼 ──────────────────────────────────────────────────────
// 인게임은 알파/베타/감마 각각 별도의 슬롯 바를 가지며, 각 바마다 6칸(스킬 학습 시 7칸)
export function getMaxSlots(activatedSkills: Set<string>): number {
  return activatedSkills.has("wx78_circuitry_slot_1")
    ? WX78_TUNING.MAXSLOTS_WITH_SKILL
    : WX78_TUNING.INITIAL_MAXSLOTS;
}

export function getUsedSlotsByType(
  equippedCounts: Record<string, number>,
  type: CircuitType,
): number {
  let total = 0;
  for (const [id, count] of Object.entries(equippedCounts)) {
    const m = WX78_CIRCUITS_BY_ID[id];
    if (m && m.type === type) total += m.slots * count;
  }
  return total;
}

export function circuitsByType(type: CircuitType): CircuitModule[] {
  return WX78_CIRCUITS.filter((c) => c.type === type);
}
