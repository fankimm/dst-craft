import type { Quest } from "./types";

/**
 * 천상의 대변자(Celestial Champion / alterguardian_phase3) 진행 체인.
 *
 * Challenge Board의 collection_* 그룹 카운트(30/15/8)는 craft+upgrade 자재의 aggregate일 뿐이라
 * substep 레벨에서 craft·upgrade 각각의 정확한 소모량을 표시하고, 중복된 top-level aggregate step은 제거.
 *
 * 출처 검증 — recipes.lua:
 *  - 583: Recipe2("moon_device_construction1", wagpunk_bits 4 + moonstorm_spark 5 + transistor 2)  [TECH.LOST, 청사진 필요]
 *  - 1306: ["moon_device_construction1"] 자재 — wagpunk_bits 4 + moonstorm_spark 10 + moonglass_charged 10
 *  - 1307: ["moon_device_construction2"] 자재 — moonstorm_static_item 1 + moonglass_charged 20 + moonrockseed 1
 *  → 총 자원: wagpunk_bits 8 + moonstorm_spark 15 + moonglass_charged 30 + transistor 2 + static 1 + moonrockseed 1
 */
export const celestialQuest: Quest = {
  id: "alterguardian_phase3",
  titleKo: "천상의 대변자",
  titleEn: "Celestial Champion",
  iconPath: "/images/bosses/alterguardian_phase3.png",
  steps: [
    {
      id: "craft_moon_device",
      titleKo: "달 공명추출기 제작",
      titleEn: "Craft Lunar Siphonator",
      icon: "moon_device_construction1.png",
      craftId: "moon_device_construction1",
      required: true,
      // recipes.lua 583: Recipe2("moon_device_construction1", wagpunk_bits 4 + moonstorm_spark 5 + transistor 2)
      substeps: [
        { id: "craft_mat_wagpunk_bits",    nameKo: "고철더미",  nameEn: "Scrap",      icon: "wagpunk_bits.png",    qty: 4 },
        { id: "craft_mat_moonstorm_spark", nameKo: "달빛",      nameEn: "Moongleam",  icon: "moonstorm_spark.png", qty: 5 },
        { id: "craft_mat_transistor",      nameKo: "전기 장치", nameEn: "Electrical Doodad", icon: "transistor.png", qty: 2, craftId: "transistor" },
      ],
    },
    {
      id: "upgrade_moon_device_s1",
      titleKo: "달 공명추출기 업그레이드 1단계",
      titleEn: "Upgrade Lunar Siphonator (Stage 1)",
      icon: "moon_device_construction1.png",
      required: true,
      requires: ["craft_moon_device"],
      // recipes.lua 1306: wagpunk_bits 4 + moonstorm_spark 10 + moonglass_charged 10
      substeps: [
        { id: "upgrade_s1_wagpunk_bits",    nameKo: "고철더미",        nameEn: "Scrap",              icon: "wagpunk_bits.png",        qty: 4 },
        { id: "upgrade_s1_moonstorm_spark", nameKo: "달빛",            nameEn: "Moongleam",          icon: "moonstorm_spark.png",     qty: 10 },
        { id: "upgrade_s1_moonglass",       nameKo: "충전된 달 파편",  nameEn: "Infused Moon Shard", icon: "moonglass_charged.png",   qty: 10 },
      ],
    },
    {
      id: "upgrade_moon_device_s2",
      titleKo: "달 공명추출기 업그레이드 2단계",
      titleEn: "Upgrade Lunar Siphonator (Stage 2)",
      icon: "moon_device_construction1.png",
      required: true,
      requires: ["upgrade_moon_device_s1"],
      // recipes.lua 1307: moonstorm_static_item 1 + moonglass_charged 20 + moonrockseed 1
      substeps: [
        { id: "upgrade_s2_static",       nameKo: "억제된 정전기",  nameEn: "Restrained Static",  icon: "moonstorm_static_item.png", qty: 1 },
        { id: "upgrade_s2_moonglass",    nameKo: "충전된 달 파편", nameEn: "Infused Moon Shard", icon: "moonglass_charged.png",     qty: 20 },
        { id: "upgrade_s2_moonrockseed", nameKo: "천상의 구체",    nameEn: "Celestial Orb",      icon: "moonrockseed.png",          qty: 1 },
      ],
    },
  ],
};
