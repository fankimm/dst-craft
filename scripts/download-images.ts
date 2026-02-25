/**
 * Downloads item and material images from the DST Wiki.
 *
 * Usage: npx tsx scripts/download-images.ts
 *
 * This downloads PNG images for all items and materials defined in the data files.
 * Images are saved to public/images/items/ and public/images/materials/.
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const WIKI_BASE = "https://dontstarve.wiki.gg/images";
const ITEMS_DIR = join(process.cwd(), "public/images/items");
const MATERIALS_DIR = join(process.cwd(), "public/images/materials");

// Ensure directories exist
mkdirSync(ITEMS_DIR, { recursive: true });
mkdirSync(MATERIALS_DIR, { recursive: true });

// Map of image filename -> wiki URL path
// Some items have different wiki image names than our local names
const WIKI_IMAGE_MAP: Record<string, string> = {
  // Overrides for items whose wiki image name differs
};

async function downloadImage(
  filename: string,
  destDir: string
): Promise<boolean> {
  const destPath = join(destDir, filename);
  if (existsSync(destPath)) {
    console.log(`  SKIP ${filename} (already exists)`);
    return true;
  }

  const wikiName = WIKI_IMAGE_MAP[filename] || filename;
  // Wiki uses the format: https://dontstarve.wiki.gg/images/X/Xx/Filename.png
  // But the simpler thumb URL works: https://dontstarve.wiki.gg/images/thumb/X/Xx/Filename.png/64px-Filename.png
  // Actually, we can try the direct path first
  const firstChar = wikiName.charAt(0);
  const hashPrefix = `${firstChar}/${firstChar}${wikiName.charAt(1)}`;
  const url = `${WIKI_BASE}/${hashPrefix}/${wikiName}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  FAIL ${filename} (${response.status})`);
      return false;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(destPath, buffer);
    console.log(`  OK   ${filename}`);
    return true;
  } catch (error) {
    console.log(`  ERR  ${filename}: ${error}`);
    return false;
  }
}

async function main() {
  // Dynamically import the data to get all image filenames
  // Since these are TS files with path aliases, we'll hardcode the lists here

  const itemImages = [
    // Tools
    "Axe.png", "Pickaxe.png", "Shovel.png", "Hammer.png", "Pitchfork.png",
    "Razor.png", "Feather_Pencil.png", "Saddle_Horn.png", "Brush.png",
    "Golden_Axe.png", "Golden_Pickaxe.png", "Golden_Shovel.png", "Luxury_Axe.png",
    // Light
    "Campfire.png", "Fire_Pit.png", "Torch.png", "Miner_Hat.png",
    "Pumpkin_Lantern.png", "Lantern.png", "Endothermic_Fire.png",
    "Endothermic_Fire_Pit.png", "Mushroom_Light.png",
    // Prototypers
    "Science_Machine.png", "Alchemy_Engine.png", "Thermal_Measurer.png",
    "Rainometer.png", "Lightning_Rod.png", "Prestihatitator.png",
    "Shadow_Manipulator.png", "Potters_Wheel.png", "Think_Tank.png",
    "Cartography_Desk.png",
    // Refined
    "Boards.png", "Cut_Stone.png", "Rope.png", "Papyrus.png",
    "Purple_Gem.png", "Electrical_Doodad.png",
    // Weapons
    "Spear.png", "Ham_Bat.png", "Boomerang.png", "Blow_Dart.png",
    "Sleep_Dart.png", "Fire_Dart.png", "Tooth_Trap.png", "Bee_Mine.png",
    "Battle_Helm.png", "Dark_Sword.png", "Bat_Bat.png",
    "Weather_Pain.png", "Tail_o_Three_Cats.png",
    // Armor
    "Log_Suit.png", "Marble_Suit.png", "Football_Helmet.png",
    "Night_Armour.png", "Thulecite_Crown.png", "Thulecite_Suit.png",
    "Grass_Suit.png", "Bone_Helm.png", "Shelmet.png",
    // Clothing
    "Sewing_Kit.png", "Straw_Hat.png", "Beefalo_Hat.png", "Top_Hat.png",
    "Garland.png", "Walking_Cane.png", "Breezy_Vest.png", "Puffy_Vest.png",
    "Rain_Coat.png", "Rain_Hat.png", "Cat_Cap.png",
    // Healing
    "Healing_Salve.png", "Honey_Poultice.png", "Booster_Shot.png",
    "Life_Giving_Amulet.png", "Telltale_Heart.png",
  ];

  const materialImages = [
    "twigs.png", "cutgrass.png", "log.png", "rocks.png", "flint.png",
    "goldnugget.png", "cutstone.png", "boards.png", "rope.png",
    "papyrus.png", "nitre.png", "silk.png", "pigskin.png",
    "beefalo_wool.png", "nightmare_fuel.png", "living_log.png",
    "gears.png", "electrical_doodad.png", "marble.png", "thulecite.png",
    "moon_shard.png", "blue_gem.png", "red_gem.png", "purple_gem.png",
    "honeycomb.png", "stinger.png", "spider_gland.png", "mosquito_sack.png",
    "charcoal.png", "ash.png", "tentacle_spots.png", "bone_shards.png",
    "steel_wool.png", "shell.png", "kelp.png", "driftwood.png",
    "feather_crow.png", "feather_robin.png", "hound_tooth.png", "walrus_tusk.png",
  ];

  console.log("=== Downloading Item Images ===");
  let okCount = 0;
  let failCount = 0;
  for (const img of itemImages) {
    const ok = await downloadImage(img, ITEMS_DIR);
    if (ok) okCount++;
    else failCount++;
    // Rate limit
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`\nItems: ${okCount} OK, ${failCount} FAILED\n`);

  console.log("=== Downloading Material Images ===");
  okCount = 0;
  failCount = 0;
  for (const img of materialImages) {
    const ok = await downloadImage(img, MATERIALS_DIR);
    if (ok) okCount++;
    else failCount++;
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`\nMaterials: ${okCount} OK, ${failCount} FAILED`);
}

main().catch(console.error);
