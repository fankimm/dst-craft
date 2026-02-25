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
    "Trap.png", "Bird_Trap.png", "Bug_Net.png", "Watering_Can.png",
    "Pick_Axe.png", "Regal_Shovel.png",
    // Light
    "Campfire.png", "Fire_Pit.png", "Torch.png", "Miner_Hat.png",
    "Pumpkin_Lantern.png", "Lantern.png", "Endothermic_Fire.png",
    "Endothermic_Fire_Pit.png", "Mushroom_Light.png", "Glowcap.png",
    "Wall_Lantern.png",
    // Prototypers
    "Science_Machine.png", "Alchemy_Engine.png", "Thermal_Measurer.png",
    "Rainometer.png", "Lightning_Rod.png", "Prestihatitator.png",
    "Shadow_Manipulator.png", "Potter's_Wheel.png", "Think_Tank.png",
    "Cartography_Desk.png", "Celestial_Altar.png",
    "Ancient_Pseudoscience_Station.png",
    // Refined
    "Boards.png", "Cut_Stone.png", "Rope.png", "Papyrus.png",
    "Purple_Gem.png", "Electrical_Doodad.png", "Wax_Paper.png",
    "Moon_Glass.png", "Thulecite_Fragments.png",
    // Weapons
    "Spear.png", "Ham_Bat.png", "Boomerang.png", "Blow_Dart.png",
    "Sleep_Dart.png", "Fire_Dart.png", "Tooth_Trap.png", "Bee_Mine.png",
    "Battle_Helm.png", "Dark_Sword.png", "Bat_Bat.png",
    "Weather_Pain.png", "Tail_o'_Three_Cats.png", "Glass_Cutter.png",
    "Thulecite_Club.png", "Morning_Star.png", "Electric_Dart.png",
    "Gunpowder.png",
    // Armor
    "Log_Suit.png", "Marble_Suit.png", "Football_Helmet.png",
    "Night_Armour.png", "Thulecite_Crown.png", "Thulecite_Suit.png",
    "Grass_Suit.png", "Bone_Helm.png", "Shelmet.png", "Beekeeper_Hat.png",
    "Snurtle_Shell_Armor.png", "Scalemail.png",
    // Clothing
    "Sewing_Kit.png", "Straw_Hat.png", "Beefalo_Hat.png", "Top_Hat.png",
    "Garland.png", "Walking_Cane.png", "Breezy_Vest.png", "Puffy_Vest.png",
    "Rain_Coat.png", "Rain_Hat.png", "Cat_Cap.png", "Dapper_Vest.png",
    "Hibearnation_Vest.png", "Desert_Goggles.png", "Fashion_Goggles.png",
    "Summer_Frest.png", "Flower_Hat.png", "Ice_Cube.png",
    // Healing
    "Healing_Salve.png", "Honey_Poultice.png", "Booster_Shot.png",
    "Life_Giving_Amulet.png", "Telltale_Heart.png", "Reviver.png",
    // Magic
    "Meat_Effigy.png", "Night_Light.png", "One-man_Band.png",
    "Nightmare_Amulet.png", "Chilled_Amulet.png", "Fire_Staff.png",
    "Ice_Staff.png", "Telelocator_Staff.png", "Telelocator_Focus.png",
    "Shadow_Logger.png", "Shadow_Miner.png", "Shadow_Digger.png",
    "Shadow_Duelist.png", "Pan_Flute.png", "Construction_Amulet.png",
    "The_Lazy_Explorer.png", "Star_Caller%27s_Staff.png",
    "Deconstruction_Staff.png", "Lazy_Forager.png", "Shadow_Thurible.png",
    "Belt_of_Hunger.png", "Old_Bell.png", "Moon_Caller%27s_Staff.png",
    "Moon_Glass_Axe.png", "Bath_Bomb.png",
    // Decorations
    "Potted_Fern.png", "Potted_Succulent.png", "Sculptured_Hedge.png",
    "Lawn_Ornament.png", "Berry_Bush.png", "Marble_Shrub.png", "Sign.png",
    "Potter_Sculpture.png", "Potted_Tree.png", "Directional_Sign.png",
    // Structures
    "Birdcage.png", "Hay_Wall.png", "Wood_Wall.png", "Stone_Wall.png",
    "Pig_House.png", "Rabbit_Hutch.png", "Chest.png", "Scaled_Chest.png",
    "Tent.png", "Siesta_Lean-to.png", "Flingomatic.png", "Wood_Fence.png",
    "Wood_Gate.png", "Scaled_Furnace.png", "Scarecrow.png",
    "Cobblestones.png", "Carpeted_Flooring.png", "Mini_Sign.png",
    "End_Table.png", "Moon_Rock_Wall.png", "Thulecite_Wall.png",
    "Ocuvigil.png",
    // Storage
    "Ice_Box.png", "Salt_Box.png", "Backpack.png", "Piggyback.png",
    "Bundling_Wrap.png", "Insulated_Pack.png",
    // Cooking
    "Crock_Pot.png", "Drying_Rack.png", "Portable_Crock_Pot.png",
    "Portable_Grinding_Mill.png",
    // Food & Gardening
    "Basic_Farm.png", "Garden_Hoe.png", "Garden_Digamajig.png",
    "Bee_Box.png", "Mushroom_Planter.png", "Compost_Wrap.png",
    "Improved_Farm.png", "Tree_Planter.png",
    // Fishing
    "Fishing_Rod.png", "Ocean_Fishing_Rod.png", "Tackle_Receptacle.png",
    "Spinnerbait.png", "Spinner.png", "Bobber.png",
    "Garden_Rigamajig.png", "Wobbler.png", "Rain_Fisher.png",
    "Heavy_Weighted_Lure.png",
    // Seafaring
    "Boat_Kit.png", "Oar.png", "Driftwood_Oar.png", "Mast.png",
    "Anchor_Kit.png", "Steering_Wheel_Kit.png", "Tin_Fishin_Bin.png",
    "Boat_Patch.png", "Plank.png", "Winged_Sail.png",
    "Feathery_Canvas.png", "Grass_Raft_Kit.png", "Log_Raft_Kit.png",
    "Kelp_Bumper.png", "Shell_Bumper.png", "Cookie_Cutter_Cap.png",
    "Cannon_Kit.png", "Cannonball.png", "Dock_Kit.png", "Pylon.png",
    "Sea_Fishing_Rod.png", "Deck_Illuminator.png",
    "Lightning_Conductor.png", "Fire_Pump.png",
    "Steering_Wheel_Stand.png",
    // Beefalo
    "Saddle.png", "War_Saddle.png", "Glossamer_Saddle.png",
    "Beefalo_Bell.png", "Salt_Lick.png",
    // Winter
    "Thermal_Stone.png", "Winter_Hat.png", "Rabbit_Earmuffs.png",
    "Heat_Stone.png",
    // Summer
    "Umbrella.png", "Whirly_Fan.png", "Luxury_Fan.png",
    "Fashion_Melon.png", "Floral_Shirt.png",
    // Rain
    "Eyebrella.png", "Pretty_Parasol.png",
    // Character
    "Bernie.png", "Gym.png", "Dumbbell.png", "GoldenDumbbell.png",
    "Gembell.png", "Sisturn.png", "Birds_of_the_World.png",
    "Applied_Horticulture.png", "Sleepytime_Stories.png",
    "On_Tentacles.png", "Codex_Umbra.png", "Shadow_Worker.png",
    "Shadow_Duellist.png", "Battle_Spear.png", "Webby_Whistle.png",
    "Chef_Pouch.png", "Bramble_Husk.png", "Bramble_Trap.png",
    "Winona_Catapult.png", "Winona_Spotlight.png", "Winona_Generator.png",
    "Trusty_Slingshot.png", "Pebbles.png", "Gold_Rounds.png",
    "Freeze_Rounds.png", "Backtrek_Watch.png", "Alarming_Clock.png",
    "Rift_Watch.png", "Ageless_Watch.png",
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
    "reeds.png", "honey.png", "rot.png", "meat.png", "petals.png",
    "fireflies.png", "pumpkin.png", "light_bulb.png", "shroom_skin.png",
    "straw_hat.png", "top_hat.png", "rabbit.png", "compass.png",
    "bee.png", "batilisk_wing.png", "down_feather.png", "beefalo_horn.png",
    "koalefant_trunk.png", "winter_koalefant_trunk.png", "moleworm.png",
    "coontail.png", "beard_hair.png", "seeds.png", "dragonfly_scales.png",
    "salt_crystals.png", "wax_paper.png", "butterfly_wings.png",
    "watermelon.png", "cactus_flower.png", "poop.png",
    "deerclops_eyeball.png", "berry.png", "pickaxe.png", "spear.png",
    "egg.png", "green_gem.png", "orange_gem.png", "yellow_gem.png",
    "iridescent_gem.png", "cookie_cutter_shell.png",
    "malbatross_feather.png", "palmcone_scale.png", "grass_gecko_hide.png",
    "thulecite_fragments.png", "moon_rock.png", "moon_glass.png",
    "slurtle_slime.png", "mandrake.png", "gunpowder.png", "beeswax.png",
    "thick_fur.png", "desert_stone.png", "ice.png", "cut_stone.png",
    "feather_robin_winter.png", "tentacle_spots_cooked.png", "phlegm.png",
    "dorsal_fin.png", "walking_cane.png", "glommer_goop.png",
    "log_suit.png",
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
