import { hermitQuest } from "./hermit";
import { fuelweaverQuest } from "./fuelweaver";
import { celestialQuest } from "./celestial";
import { scionQuest } from "./scion";
import type { Quest, QuestId } from "./types";

export type { Quest, QuestId, QuestStep, QuestMaterial } from "./types";

/** 표시 순서 — 난이도/콘텐츠 진행 흐름 */
export const quests: Quest[] = [hermitQuest, fuelweaverQuest, celestialQuest, scionQuest];

export const questById: Record<QuestId, Quest> = {
  hermit: hermitQuest,
  stalker_atrium: fuelweaverQuest,
  alterguardian_phase3: celestialQuest,
  alterguardian_phase4_lunarrift: scionQuest,
};
