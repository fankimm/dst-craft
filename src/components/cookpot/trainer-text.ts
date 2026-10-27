/**
 * 요리솥 트레이너 전용 문구 (#128).
 *
 * `src/lib/i18n.ts` 에 넣지 않는 이유: 그 파일은 홈(제작 탭) 번들에 들어간다(#91). 여기 문구는
 * 요리솥 청크를 받을 때만 필요하다. 재료·요리 이름은 `ingredientName`/`foodName`(ko.po)에서 온다.
 */
import type { Locale } from "@/lib/i18n";

type Text = { ko: string; en: string };

export const TRAINER_TEXT = {
  modeSim: { ko: "시뮬레이터", en: "Simulator" },
  modeTrainer: { ko: "트레이너", en: "Trainer" },

  title: { ko: "요리솥 트레이너", en: "Crock Pot Trainer" },
  intro: {
    ko: "랜덤 재료를 받아 제한 시간 안에 요리솥에 끓이거나, 모닥불에 굽거나, 그냥 먹어서 점수를 최대로 올리세요. 잔가지는 무제한입니다. 끝나면 최적 조합과 비교합니다.",
    en: "Get a random set of ingredients and maximize your score in time by cooking them in the pot, roasting them on a fire, or just eating them. Twigs are unlimited. At the end, compare with the optimal plan.",
  },

  // 설정
  optIngredients: { ko: "재료 수", en: "Ingredients" },
  optTime: { ko: "제한 시간", en: "Time limit" },
  optScoring: { ko: "채점", en: "Scoring" },
  optWarly: { ko: "월리 모드", en: "Warly mode" },
  timeNone: { ko: "무제한", en: "No limit" },
  seconds: { ko: "초", en: "s" },
  scoringHunger: { ko: "허기", en: "Hunger" },
  scoringBalanced: { ko: "균형", en: "Balanced" },
  scoringRandom: { ko: "랜덤 가중치", en: "Random weights" },
  scoringHungerDesc: { ko: "허기만 셉니다", en: "Only hunger counts" },
  scoringBalancedDesc: { ko: "허기·체력·정신력을 똑같이 더합니다", en: "Hunger, health and sanity count equally" },
  scoringRandomDesc: { ko: "라운드마다 가중치가 무작위로 정해집니다", en: "Weights are rolled each round" },
  warlyDesc: {
    ko: "생식 불가, 휴대용 요리솥 레시피 포함. 같은 요리를 또 먹으면 ×0.9 → 0.8 → 0.65 → 0.5 → 0.3",
    en: "No raw food, portable crock pot recipes included. Repeating a dish gives ×0.9 → 0.8 → 0.65 → 0.5 → 0.3",
  },
  warlyMaxNote: { ko: "월리 모드는 재료 16개까지", en: "Warly mode: up to 16 ingredients" },
  start: { ko: "시작", en: "Start" },

  // 플레이
  weights: { ko: "가중치", en: "Weights" },
  score: { ko: "점수", en: "Score" },
  timeLeft: { ko: "남은 시간", en: "Time left" },
  finish: { ko: "끝내기", en: "Finish" },
  pot: { ko: "요리솥", en: "Crock Pot" },
  cook: { ko: "요리하기", en: "Cook" },
  potHint: { ko: "재료를 눌러 요리솥에 넣으세요", en: "Tap an ingredient to add it to the pot" },
  tray: { ko: "남은 재료", en: "Ingredients" },
  eatRaw: { ko: "생으로 먹기", en: "Eat raw" },
  eatRawConfirm: { ko: "한 번 더 누르면 먹음", en: "Tap again to eat" },
  bestRecord: { ko: "최고 기록", en: "Best" },
  newRecord: { ko: "신기록!", en: "New record!" },
  cantEatRaw: { ko: "생으로 못 먹음", en: "Can't eat raw" },
  trayEmpty: { ko: "재료를 다 썼습니다", en: "All ingredients used" },
  log: { ko: "먹은 것", en: "Eaten" },
  logEmpty: { ko: "아직 아무것도 안 먹었습니다", en: "Nothing eaten yet" },
  randomPick: { ko: "랜덤 결과", en: "Random result" },
  inedible: { ko: "먹을 수 없음", en: "Inedible" },
  memory: { ko: "기억하는 요리", en: "Dishes in memory" },
  memoryNext: { ko: "다음", en: "next" },
  timeUp: { ko: "시간 종료!", en: "Time's up!" },
  cooking: { ko: "끓이는 중…", en: "Cooking…" },
  eatShort: { ko: "먹기", en: "Eat" },
  roastShort: { ko: "굽기", en: "Roast" },
  roastHint: { ko: "모닥불에 굽기 (되돌릴 수 없음)", en: "Roast on a fire (can't be undone)" },
  twigHint: { ko: "잔가지는 무제한으로 넣을 수 있어요", en: "Twigs are unlimited" },
  eatConfirmShort: { ko: "한 번 더", en: "Again?" },
  rank: { ko: "등급", en: "Rank" },
  tapPot: { ko: "재료 4개를 넣고 요리하세요", en: "Add 4 ingredients and cook" },
  removeHint: { ko: "솥의 재료를 누르면 뺍니다", en: "Tap an ingredient in the pot to remove it" },

  // 결과
  resultTitle: { ko: "결과", en: "Result" },
  ofOptimal: { ko: "최적 대비", en: "of optimal" },
  yours: { ko: "내 결과", en: "You" },
  optimal: { ko: "최적", en: "Optimal" },
  optimalPlan: { ko: "최적 플랜", en: "Optimal plan" },
  yourPlan: { ko: "내 플랜", en: "Your plan" },
  rawEaten: { ko: "그냥 먹음", en: "Eaten as is" },
  discarded: { ko: "안 씀", en: "Unused" },
  expected: { ko: "기대값", en: "expected" },
  retrySame: { ko: "같은 재료로 다시", en: "Retry same set" },
  newRound: { ko: "새 라운드", en: "New round" },
  backToSetup: { ko: "설정", en: "Settings" },
  perfect: { ko: "완벽해요!", en: "Perfect!" },
  great: { ko: "훌륭해요", en: "Great" },
  good: { ko: "괜찮아요", en: "Good" },
  tryAgain: { ko: "다시 도전해 보세요", en: "Try again" },
  seed: { ko: "라운드 번호", en: "Round #" },
  share: { ko: "결과 공유", en: "Share" },
  shareCopied: { ko: "같은 재료로 도전할 수 있는 링크를 복사했습니다", en: "Copied a link to challenge the same set" },
  challengeTitle: { ko: "공유받은 라운드", en: "Shared round" },
  challengeDesc: { ko: "같은 재료·같은 설정으로 도전합니다. 시작을 누르면 바로 시작돼요.", en: "Same ingredients and settings as the person who shared it. Press start to begin." },
  challengeDismiss: { ko: "내 설정으로", en: "Use my settings" },
  solving: { ko: "최적해 계산 중…", en: "Computing optimal…" },
} satisfies Record<string, Text>;

export type TrainerTextKey = keyof typeof TRAINER_TEXT;

export function tt(key: TrainerTextKey, locale: Locale): string {
  const entry = TRAINER_TEXT[key];
  return locale === "ko" ? entry.ko : entry.en;
}
