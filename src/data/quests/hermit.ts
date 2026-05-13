import type { Quest } from "./types";

/**
 * 은둔자(Pearl) 퀘스트 17개.
 *
 * 출처:
 *  - Challenge Board challenge_defs.lua ITEMS hermit_task_1..18 (13 결번)
 *  - Challenge Board locales/ko.po·en.po UI:TASK_* (한국어/영어 그대로 사용)
 *  - hermithouse 재료: 인게임 recipes.lua 1300-1302의 ["hermithouse_construction1/2/3"]
 *  - 한국어 재료명: 한글모드 ko.po (STRINGS.NAMES.*)
 */
export const hermitQuest: Quest = {
  id: "hermit",
  titleKo: "은둔자 퀘스트",       // UI:HERMIT_QUEST (ko)
  titleEn: "Hermit Quests",       // UI:HERMIT_QUEST (en)
  icon: "hermitcrab_shell.png",
  summaryKo: "펄(소라게)의 친밀도 퀘스트 17가지.",
  summaryEn: "Pearl the Hermit Crab's 17 friendship quests.",
  steps: [
    {
      id: "hermit_task_1",
      titleKo: "집 수리 1단계",
      titleEn: "Repair House (Stage 1)",
      icon: "hermitcrab_lightpost.png",
      count: 3,
      // recipes.lua 1300
      materials: [
        { id: "cookiecuttershell", nameKo: "과자틀소라 조가비", nameEn: "Cookie Cutter Shell", icon: "cookiecuttershell.png", qty: 10 },
        { id: "boards", nameKo: "나무 판자", nameEn: "Boards", icon: "boards.png", qty: 10 },
        { id: "fireflies", nameKo: "반딧불이", nameEn: "Fireflies", icon: "fireflies.png", qty: 1 },
      ],
    },
    {
      id: "hermit_task_2",
      titleKo: "집 수리 2단계",
      titleEn: "Repair House (Stage 2)",
      icon: "hermitcrab_lightpost.png",
      count: 3,
      // recipes.lua 1301
      materials: [
        { id: "marble", nameKo: "대리석", nameEn: "Marble", icon: "marble.png", qty: 10 },
        { id: "cutstone", nameKo: "석재", nameEn: "Cut Stone", icon: "cutstone.png", qty: 5 },
        { id: "lightbulb", nameKo: "전구근", nameEn: "Light Bulb", icon: "lightbulb.png", qty: 3 },
      ],
    },
    {
      id: "hermit_task_3",
      titleKo: "집 수리 3단계",
      titleEn: "Repair House (Stage 3)",
      icon: "hermitcrab_teashop.png",
      count: 3,
      // recipes.lua 1302
      materials: [
        { id: "moonrocknugget", nameKo: "월석", nameEn: "Moon Rock", icon: "moonrocknugget.png", qty: 10 },
        { id: "rope", nameKo: "밧줄", nameEn: "Rope", icon: "rope.png", qty: 5 },
        { id: "turf_carpetfloor", nameKo: "카펫 깔린 바닥", nameEn: "Carpeted Flooring", icon: "turf_carpetfloor.png", qty: 5 },
      ],
    },
    { id: "hermit_task_4",  titleKo: "꽃 심기",            titleEn: "Plant Flowers",        icon: "petals.png",                count: 10 },
    { id: "hermit_task_5",  titleKo: "바다 쓰레기 제거",   titleEn: "Remove Sea Junk",      icon: "wetgoop.png",                count: 10 },
    { id: "hermit_task_6",  titleKo: "베리 덤불 심고 거름주기", titleEn: "Plant & Fertilize Berries", icon: "berries.png",      count: 8 },
    { id: "hermit_task_7",  titleKo: "건조대에 음식 걸기",  titleEn: "Hang Meat on Racks",   icon: "meatrack.png",               count: 6 },
    { id: "hermit_task_8",  titleKo: "큰 물고기 주기",     titleEn: "Give a Big Fish",      icon: "oceanfish_medium_8_inv.png", count: 5 },
    { id: "hermit_task_9",  titleKo: "구근 식물 제거",     titleEn: "Remove the Lureplant", icon: "lureplantbulb.png" },
    { id: "hermit_task_10", titleKo: "우산 가져다주기",    titleEn: "Give an Umbrella",     icon: "umbrella.png" },
    { id: "hermit_task_11", titleKo: "겨울 코트 가져다주기", titleEn: "Give a Winter Coat",  icon: "trunkvest_winter.png" },
    { id: "hermit_task_12", titleKo: "샐러드 배달하기",    titleEn: "Deliver a Salad",      icon: "flowersalad.png" },
    { id: "hermit_task_14", titleKo: "겨울 물고기 배달하기", titleEn: "Deliver a Winter Fish", icon: "oceanfish_medium_8_inv.png" },
    { id: "hermit_task_15", titleKo: "여름 물고기 배달하기", titleEn: "Deliver a Summer Fish", icon: "oceanfish_small_8_inv.png" },
    { id: "hermit_task_16", titleKo: "봄 물고기 배달하기",   titleEn: "Deliver a Spring Fish", icon: "oceanfish_small_7_inv.png" },
    { id: "hermit_task_17", titleKo: "가을 물고기 배달하기", titleEn: "Deliver an Autumn Fish", icon: "oceanfish_small_6_inv.png" },
    { id: "hermit_task_18", titleKo: "의자 만들기",         titleEn: "Make a Chair",         icon: "wood_chair.png" },
  ],
};
