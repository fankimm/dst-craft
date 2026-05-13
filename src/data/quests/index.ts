import { hermitQuest } from "./hermit";
import { celestialQuest } from "./celestial";
import { fuelweaverQuest } from "./fuelweaver";
import type { Quest, QuestId } from "./types";

export type { Quest, QuestId, QuestStep } from "./types";

/** 표시 순서 — 난이도/콘텐츠 흐름 기준 */
export const quests: Quest[] = [hermitQuest, celestialQuest, fuelweaverQuest];

export const questById: Record<QuestId, Quest> = {
  hermit: hermitQuest,
  celestial: celestialQuest,
  fuelweaver: fuelweaverQuest,
};
