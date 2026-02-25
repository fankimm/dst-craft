export { toolItems } from "./tools";
export { lightItems } from "./light-sources";
export { prototyperItems } from "./prototypers";
export { refinedItems } from "./refined";
export { weaponItems } from "./weapons";
export { armorItems } from "./armor";
export { clothingItems } from "./clothing";
export { healingItems } from "./healing";
export { magicItems } from "./magic";
export { decorationItems } from "./decorations";
export { structureItems } from "./structures";
export { storageItems } from "./storage";
export { cookingItems } from "./cooking";
export { foodGardeningItems } from "./food-gardening";
export { fishingItems } from "./fishing";
export { seafaringItems } from "./seafaring";
export { beefaloItems } from "./beefalo";
export { winterItems } from "./winter";
export { summerItems } from "./summer";
export { rainItems } from "./rain";
export { survivorItems } from "./survivor";

import { toolItems } from "./tools";
import { lightItems } from "./light-sources";
import { prototyperItems } from "./prototypers";
import { refinedItems } from "./refined";
import { weaponItems } from "./weapons";
import { armorItems } from "./armor";
import { clothingItems } from "./clothing";
import { healingItems } from "./healing";
import { magicItems } from "./magic";
import { decorationItems } from "./decorations";
import { structureItems } from "./structures";
import { storageItems } from "./storage";
import { cookingItems } from "./cooking";
import { foodGardeningItems } from "./food-gardening";
import { fishingItems } from "./fishing";
import { seafaringItems } from "./seafaring";
import { beefaloItems } from "./beefalo";
import { winterItems } from "./winter";
import { summerItems } from "./summer";
import { rainItems } from "./rain";
import { survivorItems } from "./survivor";

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
  ...magicItems,
  ...decorationItems,
  ...structureItems,
  ...storageItems,
  ...cookingItems,
  ...foodGardeningItems,
  ...fishingItems,
  ...seafaringItems,
  ...beefaloItems,
  ...winterItems,
  ...summerItems,
  ...rainItems,
  ...survivorItems,
];
