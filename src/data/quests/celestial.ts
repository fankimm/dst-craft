import type { Quest } from "./types";

/**
 * 천상의 대변자(Celestial Champion / alterguardian_phase3) 진행 체인.
 *
 * Challenge Board inline_group_alterguardian_phase3 = {
 *  collection_moonglass(×30), collection_moonlight(×15), collection_scrap(×8),
 *  moonstorm_static_item, task_moon_device
 * } + 보스 alterguardian_phase3 처치.
 *
 * 출처 검증 — recipes.lua:
 *  - 583: Recipe2("moon_device_construction1", wagpunk_bits 4 + moonstorm_spark 5 + transistor 2)  [TECH.LOST, 청사진 필요]
 *  - 1306: ["moon_device_construction1"] 자재 — wagpunk_bits 4 + moonstorm_spark 10 + moonglass_charged 10
 *  - 1307: ["moon_device_construction2"] 자재 — moonstorm_static_item 1 + moonglass_charged 20 + moonrockseed 1
 *  → 총 자원: wagpunk_bits 8 + moonstorm_spark 15 + moonglass_charged 30 + transistor 2 + static 1 + moonrockseed 1
 *  → Challenge Board의 그룹 카운트 (30/15/8)와 일치
 */
export const celestialQuest: Quest = {
  id: "alterguardian_phase3",
  titleKo: "천상의 대변자",
  titleEn: "Celestial Champion",
  iconPath: "/images/bosses/alterguardian_phase3.png",
  summaryKo: "달의 진영 엔드게임. 자원을 모아 달 공명추출기를 가동하고 3페이즈 보스 처치.",
  summaryEn: "Lunar endgame. Gather resources, fire up the Lunar Siphonator, then defeat the 3-phase boss.",
  steps: [
    {
      id: "collection_moonglass",
      titleKo: "충전된 달 파편",
      titleEn: "Infused Moon Shard",
      icon: "moonglass_charged.png",
      count: 30,
      descKo: "달 폭풍에서 채집한 달 파편(moonglass)을 정전기 캐처(static catcher)로 충전. 공명추출기 1단계 10개 + 2단계 20개.",
      descEn: "Charge moonglass via a static catcher during a moon storm. Used 10 in stage 1 + 20 in stage 2 of the siphonator.",
    },
    {
      id: "collection_moonlight",
      titleKo: "달빛",
      titleEn: "Moongleam",
      icon: "moonstorm_spark.png",
      count: 15,
      descKo: "달 폭풍 안의 정전기에서 채집. 공명추출기 1차 제작 5 + 1단계 자재 10.",
      descEn: "Harvest from moonstorm static. Used 5 (initial craft) + 10 (stage 1) of the siphonator.",
    },
    {
      id: "collection_scrap",
      titleKo: "고철더미",
      titleEn: "Scrap",
      icon: "wagpunk_bits.png",
      count: 8,
      descKo: "와그펑크 작업장 콘텐츠에서 회수. 공명추출기 1차 제작 4 + 1단계 자재 4.",
      descEn: "Loot from Wagpunk content. Used 4 (initial craft) + 4 (stage 1) of the siphonator.",
    },
    {
      id: "moonstorm_static_item",
      titleKo: "억제된 정전기",
      titleEn: "Restrained Static",
      icon: "moonstorm_static_item.png",
      descKo: "공명추출기 2단계 자재.",
      descEn: "Stage 2 ingredient of the Lunar Siphonator.",
    },
    {
      id: "task_moon_device",
      titleKo: "달 공명추출기 설치",
      titleEn: "Install Lunar Siphonator",
      icon: "moon_device_construction1.png",
      descKo: "총 3단계 (1차 제작 → 1단계 자재 추가 → 2단계 자재 추가). 청사진은 와그펑크 작업장에서 받음.",
      descEn: "3 steps total (initial craft → stage 1 fill → stage 2 fill). Blueprint from the Wagpunk Workstation.",
      substeps: [
        { id: "craft_construction1", nameKo: "1차 제작 (moon_device_construction1)", nameEn: "Initial craft (moon_device_construction1)",
          icon: "moon_device_construction1.png",
          noteKo: "wagpunk_bits 4 + moonstorm_spark 5 + transistor 2 — TECH.LOST 청사진 필요",
          noteEn: "wagpunk_bits 4 + moonstorm_spark 5 + transistor 2 — requires TECH.LOST blueprint" },
        { id: "fill_construction1", nameKo: "1단계 자재 충전",                 nameEn: "Stage 1 fill",
          icon: "wagpunk_bits.png",
          noteKo: "wagpunk_bits 4 + moonstorm_spark 10 + moonglass_charged 10",
          noteEn: "wagpunk_bits 4 + moonstorm_spark 10 + moonglass_charged 10" },
        { id: "fill_construction2", nameKo: "2단계 자재 충전",                 nameEn: "Stage 2 fill",
          icon: "moonrockseed.png",
          noteKo: "moonstorm_static_item 1 + moonglass_charged 20 + moonrockseed 1",
          noteEn: "moonstorm_static_item 1 + moonglass_charged 20 + moonrockseed 1" },
      ],
    },
    {
      id: "alterguardian_phase3",
      titleKo: "천상의 대변자 처치",
      titleEn: "Defeat the Celestial Champion",
      iconPath: "/images/bosses/alterguardian_phase3.png",
      descKo: "3페이즈 보스전. 처치 시 계몽의 조각(Enlightened Shard) 보상.",
      descEn: "3-phase boss fight. Drops Enlightened Shards.",
    },
  ],
};
