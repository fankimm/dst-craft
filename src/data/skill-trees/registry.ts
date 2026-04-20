import type { CharacterSkillTree } from "./types";

// Character skill tree imports — add as data files are created
import { wilson } from "./wilson";
import { walter } from "./walter";
import { willow } from "./willow";
import { wendy } from "./wendy";
import { woodie } from "./woodie";
import { wathgrithr } from "./wathgrithr";
import { wormwood } from "./wormwood";
import { winona } from "./winona";
import { wortox } from "./wortox";
import { wurt } from "./wurt";
import { wolfgang } from "./wolfgang";
import { wx78 } from "./wx-78";

export const CHARACTERS_WITH_SKILLS: readonly string[] = [
  "wilson",
  "willow",
  "wendy",
  "woodie",
  "wigfrid",
  "wormwood",
  "winona",
  "wortox",
  "wurt",
  "walter",
  "wolfgang",
  "wx-78",
];

export const skillTrees: Record<string, CharacterSkillTree> = {
  wilson,
  willow,
  wendy,
  woodie,
  wigfrid: wathgrithr,
  wormwood,
  winona,
  wortox,
  wurt,
  walter,
  wolfgang,
  "wx-78": wx78,
};
