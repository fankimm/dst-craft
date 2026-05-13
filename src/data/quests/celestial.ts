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
  steps: [
    { id: "collection_moonglass",   titleKo: "충전된 달 파편", titleEn: "Infused Moon Shard",  icon: "moonglass_charged.png",   count: 30 },
    { id: "collection_moonlight",   titleKo: "달빛",          titleEn: "Moongleam",           icon: "moonstorm_spark.png",     count: 15 },
    { id: "collection_scrap",       titleKo: "고철더미",      titleEn: "Scrap",               icon: "wagpunk_bits.png",        count: 8  },
    { id: "moonstorm_static_item",  titleKo: "억제된 정전기", titleEn: "Restrained Static",   icon: "moonstorm_static_item.png" },
    {
      id: "craft_moon_device",
      titleKo: "달 공명추출기 제작",
      titleEn: "Craft Lunar Siphonator",
      icon: "moon_device_construction1.png",
      craftId: "moon_device_construction1",
      // recipes.lua 583: Recipe2("moon_device_construction1", wagpunk_bits 4 + moonstorm_spark 5 + transistor 2)
      substeps: [
        { id: "craft_mat_wagpunk_bits",    nameKo: "고철더미",  nameEn: "Scrap",      icon: "wagpunk_bits.png",    qty: 4 },
        { id: "craft_mat_moonstorm_spark", nameKo: "달빛",      nameEn: "Moongleam",  icon: "moonstorm_spark.png", qty: 5 },
        { id: "craft_mat_transistor",      nameKo: "전기 장치", nameEn: "Electrical Doodad", icon: "transistor.png", qty: 2, craftId: "transistor" },
      ],
    },
    {
      id: "upgrade_moon_device",
      titleKo: "달 공명추출기 업그레이드",
      titleEn: "Upgrade Lunar Siphonator",
      icon: "moon_device_construction1.png",
      // recipes.lua 1306·1307: 단계별 충전 자재
      substeps: [
        { id: "fill_construction1", nameKo: "1단계 자재", nameEn: "Stage 1 materials",
          icon: "wagpunk_bits.png",
          noteKo: "wagpunk_bits 4 + moonstorm_spark 10 + moonglass_charged 10",
          noteEn: "wagpunk_bits 4 + moonstorm_spark 10 + moonglass_charged 10" },
        { id: "fill_construction2", nameKo: "2단계 자재", nameEn: "Stage 2 materials",
          icon: "moonrockseed.png",
          noteKo: "moonstorm_static_item 1 + moonglass_charged 20 + moonrockseed 1",
          noteEn: "moonstorm_static_item 1 + moonglass_charged 20 + moonrockseed 1" },
      ],
    },
  ],
};
