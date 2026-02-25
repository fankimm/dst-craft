export { toolItems } from "./tools";
export { lightItems } from "./light-sources";
export { prototyperItems } from "./prototypers";
export { refinedItems } from "./refined";
export { weaponItems } from "./weapons";
export { armorItems } from "./armor";
export { clothingItems } from "./clothing";
export { healingItems } from "./healing";

import { toolItems } from "./tools";
import { lightItems } from "./light-sources";
import { prototyperItems } from "./prototypers";
import { refinedItems } from "./refined";
import { weaponItems } from "./weapons";
import { armorItems } from "./armor";
import { clothingItems } from "./clothing";
import { healingItems } from "./healing";

import type { CraftingItem } from "@/lib/types";

export const allItems: CraftingItem[] = [
  ...toolItems,
  ...lightItems,
  ...prototyperItems,
  ...refinedItems,
  ...weaponItems,
  ...armorItems,
  ...clothingItems,
  ...healingItems,
];
