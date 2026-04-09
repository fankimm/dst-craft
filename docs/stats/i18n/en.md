# Item Stats — English

## blueprint_craftingset_ruins_builder
- Type: Craftable
- usage:
  - Grants 3 floor blueprints when crafted

## blueprint_craftingset_ruinsglow_builder
- Type: Craftable
- usage:
  - Same pattern
  - Glowing floor

## eyeturret_item
- Type: Structure
- usage:
  - HP 1000
  - Regeneration 12/sec
  - Attack 65
  - Range 15
  - Attack period 3s
  - Cannot be hammered

## shadow_forge_kit
- Type: Deploy Kit
- usage:
  - Deploy → Shadow Atelier (Shadow Crafting Lv2)
  - 4 hammer hits

## thulecite
- Type: Material
- Stack: 20
- usage:
  - Thulecite repair material (restores 100 HP, 1.5 work efficiency)
  - Elemental diet (Hunger +3) — however players cannot eat it (NPC only: Dust Moths/Moleworms/Snurtle)
  - Moleworm bait

## wall_ruins_item
- Type: Wall
- usage:
  - HP 800 (50% when placed)
  - 3 hammer hits
  - Repairable with Thulecite

## armorgrass
- armor_hp: 157.5 (150x1.5x0.7)
- absorption: 0.6
- usage:
  - Can be used as fuel
  - `[pvp]` Beaver form (Woodie) extra damage vulnerability (+17)

## armorwood
- armor_hp: 315 (150x3x0.7)
- absorption: 0.8
- usage:
  - Can be used as fuel
  - `[pvp]` Beaver form (Woodie) extra damage vulnerability (+17)

## armormarble
- armor_hp: 735 (150x7x0.7)
- absorption: 0.95
- speed_mult: 0.7 (30% movement speed reduction)

## armor_bramble
- armor_hp: 525 (150x5x0.7)
- absorption: 0.8
- usage:
  - Thorn retaliation ~22.7 damage when hit
  - `[character]` Wormwood exclusive
  - Can be used as fuel
  - `[pvp]` Beaver form (Woodie) extra damage vulnerability (+17)

## armordragonfly
- armor_hp: 945 (150x9x0.7)
- absorption: 0.7
- dapperness: 0.0278
- usage:
  - Full immunity to fire damage (100% reduction)
  - Ignites attacker when hit

## armor_sanity
- armor_hp: 525 (150x5x0.7)
- absorption: 0.95
- dapperness: -0.1042/sec (per min -6.25, per day -50)
- usage:
  - Continuous Sanity drain when equipped (per min -6.25)
  - 10% of damage taken reduces Sanity when hit
  - Shadow level 2

## armordreadstone
- armor_hp: 840 (150x8x0.7)
- absorption: 0.9
- planar_def: 5
- usage:
  - Auto-regeneration of durability when Sanity is low (per second, rate interpolated based on Sanity)
  - Sanity drain during regeneration (per min -12.5, per day -100)
  - Shadow attribute resistance 90%
  - Shadow level 2
  - `[set]` Dreadstone set bonus (regeneration x1.5)

## armorruins
- armor_hp: 1260 (150x12x0.7)
- absorption: 0.9
- dapperness: 0.0347
- usage:
  - Shadow level 2

## armorwagpunk
- armor_hp: 730 (150x6x0.7 + 20x5 = 630+100)
- absorption: 0.85
- planar_def: 5
- usage:
  - Electricity immunity
  - Gradual movement speed increase while tracking target (10%→15%→20%→30%, hits per stage: 10/16/20)
  - Target sync with W.B.S. Headgear
  - `[repair]` Repairable with Auto-repair-0 (Wagpunk Repair Kit) (restores 100% durability)

## armor_lunarplant
- armor_hp: 830 (150x6x0.7 + 20x10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - Planar reflection 10 when hit (20 vs shadow enemies)
  - Lunar attribute resistance 90%
  - `[set]` Brightshade set bonus (additional lunar resistance)
  - `[repair]` Repairable with Lunar Plant Repair Kit (restores 100% durability)
  - `[character]` Wormwood gains additional thorn effect when equipped (`[skill tree]` linked)

## armor_voidcloth
- armor_hp: 830 (150x6x0.7 + 20x10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - Shadow attribute resistance 90%
  - Shadow level 3
  - `[set]` Voidcloth set bonus (additional shadow resistance + planar damage accumulation: +4 per hit up to +24 (6 hits), full reset after 3s without hitting)
  - `[repair]` Repairable with Voidcloth Repair Kit (restores 100% durability)

## footballhat
- armor_hp: 315 (150x3x0.7)
- absorption: 0.8
- waterproof: 0.2

## woodcarvedhat
- armor_hp: 262.5 (150x2.5x0.7)
- absorption: 0.7
- usage:
  - Can be used as fuel
  - Hit resistance
  - `[pvp]` Beaver form (Woodie) extra damage vulnerability (+17)

## beehat
- armor_hp: 1050 (150x10x0.7)
- absorption: 0.8
- waterproof: 0.2
- insulation: 60
- dapperness: 0.0111
- fuel_time: 2400 (5 days)
- usage:
  - Defense applies only to bee attacks

## cookiecutterhat
- armor_hp: 525 (150x5x0.7)
- absorption: 0.7
- waterproof: 0.35

## wathgrithrhat
- armor_hp: 525 (150x5x0.7)
- absorption: 0.8
- waterproof: 0.2
- usage:
  - `[character]` Wigfrid exclusive

## wathgrithr_improvedhat
- armor_hp: 682.5 (150x6.5x0.7)
- absorption: 0.8
- waterproof: 0.35
- insulation: 60
- usage:
  - `[character]` Wigfrid exclusive
  - `[skill tree]` "Sturdy Helmet I/II": durability consumption reduced by 10%/20%
  - `[skill tree]` "Commander's Helmet Enhancement I": planar defense +8
  - `[skill tree]` "Commander's Helmet Enhancement II": auto-repair through combat at max HP

## ruinshat
- armor_hp: 840 (150x8x0.7)
- absorption: 0.9
- usage:
  - 33% chance to activate force field (lasts 4s, cooldown 5s)
  - 5% of damage taken reduces Sanity during force field
  - Shadow level 2

## dreadstonehat
- armor_hp: 840 (150x8x0.7)
- absorption: 0.9
- planar_def: 5
- waterproof: 0.2
- usage:
  - Auto-regeneration of durability when Sanity is low (per second, same logic as Dreadstone Armor)
  - Sanity drain during regeneration (per min -12.5, per day -100)
  - Shadow attribute resistance 90%
  - Shadow level 2
  - `[set]` Dreadstone set bonus

## lunarplanthat
- armor_hp: 830 (150x6x0.7 + 20x10 = 830)
- absorption: 0.8
- planar_def: 10
- waterproof: 0.35
- usage:
  - Lunar attribute resistance 90%
  - `[set]` Brightshade set bonus (when active, planar damage accumulation: +4 per hit up to +24 (6 hits), full reset after 3s without hitting)
  - `[repair]` Repairable with Lunar Plant Repair Kit (restores 100% durability)

## voidclothhat
- armor_hp: 830 (150x6x0.7 + 20x10 = 830)
- absorption: 0.8
- planar_def: 10
- usage:
  - Shadow attribute resistance 90%
  - Shadow level 3
  - `[set]` Voidcloth set bonus
  - `[repair]` Repairable with Voidcloth Repair Kit (restores 100% durability)

## wagpunkhat
- armor_hp: 730 (150x6x0.7 + 20x5 = 730)
- absorption: 0.85
- planar_def: 5
- usage:
  - Electricity immunity
  - Gradual movement speed increase while tracking target (5%→10%→15%→20%)
  - Target sync with W.B.S. Armor
  - `[repair]` Repairable with Auto-repair-0 (Wagpunk Repair Kit) (restores 100% durability)

## wathgrithr_shield
- armor_hp: 420 (150x4x0.7)
- absorption: 0.85
- damage: 51 (34x1.5)
- usage:
  - `[character]` Wigfrid exclusive
  - Parry capable (178 degree arc, 1s duration)
  - Successful parry reduces cooldown by 70%
  - Cooldown 10s (2s when equipped)
  - Parry consumes 3 armor durability
  - `[skill tree]` Parry bonus damage can be enhanced

## beefalo_groomer
- Type: Structure
- usage:
  - 6 hammer hits
  - Beefalo tethering + skin change

## saddle_basic
- Type: Equipment
- usage:
  - Durability 5
  - Movement speed x1.4
  - Bonus damage +0

## saddle_race
- Type: Equipment
- usage:
  - Durability 8
  - Movement speed x1.55
  - Bonus damage +0

## saddle_war
- Type: Equipment
- usage:
  - Durability 8
  - Movement speed x1.25
  - Bonus damage +16

## saltlick
- Type: Structure
- usage:
  - 3 hammer hits
  - 240 licks (15 days)
  - Beefalo domestication acceleration

## saltlick_improved
- Type: Structure
- usage:
  - 3 hammer hits
  - 480 licks (30 days)
  - Repairable with salt materials

## bathbomb
- Type: Consumable
- Stack: 20
- usage:
  - Hot spring activation
  - Moon glass conversion during full moon

## carpentry_blade_moonglass
- Type: Carpentry Part
- usage:
  - Unlocks Carpentry Lv3

## chesspiece_butterfly_sketch
- Type: Blueprint
- usage:
  - Unlocks sculpture recipe

## chesspiece_moon_sketch
- Type: Blueprint
- usage:
  - Unlocks sculpture recipe

## lunar_forge_kit
- Type: Deploy Kit
- usage:
  - Deploy → Lunar Forge (Lunar Smelting Lv2)
  - 4 hammer hits

## multiplayer_portal_moonrock_constr_plans
- Type: Construction Plans
- usage:
  - Portal Moon Rock upgrade construction plans

## turf_fungus_moon
- Type: Flooring
- Stack: 20

## turf_meteor
- Type: Flooring
- Stack: 20

## waxwelljournal
- Nightmare Fuel type fuel 720, -36 fuel per spell cast (max 20 casts)
- 4 spell types: Worker / Guardian / Trap / Pillar
- -15 Sanity per spell (except Worker and Guardian)
- Materials: Papyrus x2 + Nightmare Fuel x2 + 50 HP
- usage: Maxwell exclusive shadow clone summoning integrated item

## slingshotammo_container
- 6-slot ammo-only bag
- usage: Walter exclusive ammo carrying capacity expansion

## walter_rope
- Craft rope from 2 grass (normal requires 3)
- Stack: 20
- usage: Walter exclusive efficient recipe

## woby_treat
- 1 Dried Monster Meat → produces 2
- Woby hunger recovery x3
- Stack: 40
- usage: Walter exclusive Woby food

## pocketwatch_heal
- Reverses 8 years of age + restores 20 HP
- Cooldown: 120s
- usage: Wanda age management + recovery

## pocketwatch_parts
- Materials: Thulecite Fragments x8 + Nightmare Fuel x2
- usage: Crafting material for other watches (no function)

## pocketwatch_portal
- Location marking → Portal opening (10s)
- Travel cost: -20 Sanity
- usage: Wanda portal creation

## pocketwatch_recall
- Location marking → Teleportation
- Cooldown: 480s (1 day)
- Cave ↔ Surface travel possible
- usage: Wanda long-distance travel

## pocketwatch_revive
- Self-resurrection (ghost → original state) + revive others
- Cooldown: 240s
- usage: Wanda resurrection method

## pocketwatch_warp
- Teleport to past location (distance by age: young 8 / middle 4 / old 2)
- Cooldown: 2s
- usage: Wanda short-range dodge

## portablecookpot_item
- Deployable, 20% faster cooking speed (cooking time multiplier 0.8)
- 2 hammer hits to dismantle
- usage: Warly portable Crock Pot

## portableblender_item
- Deployable, ingredient processing prototyper
- 2 hammer hits to dismantle
- usage: Warly exclusive ingredient processor

## portablespicer_item
- Deployable, seasoning + cooking
- 2 hammer hits to dismantle
- usage: Warly seasoning application cooking

## spicepack
- BODY slot bag with 6 slots
- Spoilage prevention
- usage: Warly ingredient/seasoning storage

## armor_lunarplant_husk
- Durability: 830, Absorption: 80%, Planar defense: 10, Lunar damage resistance: 90%
- Planar reflection 10 when hit (shadow +20), thorn effect
- usage: Wormwood exclusive (included in Wathgrithr data)

## saddle_wathgrithr
- Uses: 6, Movement speed: 1.3, Damage +5, Absorption 40%
- usage: Wathgrithr exclusive, skill tree linked

## spider_healer_item
- Webber HP +8
- Nearby spiders HP +80 (radius 5)
- Stack: 20
- usage: Webber exclusive self + spider healing

## spidereggsack
- Deploys spider den when placed
- Stack 10, Fuel 180
- usage: Webber exclusive spider den placement

## abigail_flower
- Summon/dismiss toggle, spell wheel commands, elixir target
- usage: Wendy exclusive Abigail summoning tool

## ghostflowerhat
- dapperness: +0.056, perish: 4800 (10 days)
- Elixir effect application
- usage: Wendy exclusive, skill tree linked

## elixir_container
- 3x3 container
- usage: Wendy exclusive elixir storage

## graveurn
- Gravestone relocation tool
- usage: Wendy exclusive, skill tree linked

## sisturn
- Structure, 4 flower slots
- Sanity aura +200/day (with skill +320)
- usage: Wendy exclusive, skill tree linked

## wendy_resurrectiongrave
- Resurrection structure, -40 HP linked cost
- usage: Wendy exclusive resurrection altar

## balloon
- Hand slot equip, 9 random shapes
- usage: Wes exclusive performance item

## balloonparty
- Sanity recovery when popped (proportional to party size, 2s tick)
- usage: Wes exclusive Sanity recovery

## balloonspeed
- Movement speed 1.0 → 1.3 (proportional to fuel), Fuel: 120s
- usage: Wes exclusive movement buff balloon

## bookstation
- Structure, 20-slot book only
- Restores 1% durability every 30s (x2 speed near Wickerbottom)
- Book crafting prototyper
- usage: Wickerbottom exclusive book storage and durability recovery

## bernie_inactive
- Hand equip, dapperness: +0.033, insulation: 60
- Fuel: 2400 (effective 15 days)
- Transforms when insane (HP 1000, attack 50)
- usage: Willow exclusive insanity guardian item

## lighter
- Weapon damage: 17, ignite chance: 50%
- Fuel: 600 (1.25 days), cooking capable
- usage: Willow exclusive ignition + melee weapon

## winona_battery_low
- Fuel: 180s, consumption rate: 0.375 (effective 480s = 1 day)
- Supply range: 6.6
- usage: Winona exclusive power supply (small)

## winona_battery_high
- Fuel: 2880s (6 days), gem recharge, overload protection
- usage: Winona exclusive power supply (large)

## winona_spotlight
- Power consumption: 0.5 (on) / 0.05 (off)
- Radius: 4.27 ~ 24
- usage: Winona exclusive long-range lighting

## winona_storage_robot
- Work radius: 15, movement speed: 5, fuel: 480s (1 day)
- usage: Winona exclusive auto-transport robot

## winona_teleport_pad_item
- Standby power: 0.05, teleport cost variable
- usage: Winona exclusive team travel station

## mighty_gym
- Structure, exercise efficiency by weight quality: LOW 4 / MED 6.67 / HIGH 10 mightiness/hit
- Hunger consumption: 4 / 11 / 22
- usage: Wolfgang exclusive strength training

## wolfgang_whistle
- Coaching buff x2, inspiration time 7s, buff duration 10s
- usage: Wolfgang exclusive team coaching

## livinglog
- Resource, fuel: 45, boat repair: 37.5
- Stack: 20
- usage: Woodie exclusive resource (obtainable during transformation)

## compostwrap
- Fertilizer: 1800, soil cycle: 20, nutrients: {24, 32, 24}
- Wormwood healing: 2HP/2s
- Stack: 40
- usage: Wormwood exclusive farming fertilizer + self-healing

## mosquitobomb
- Damage: 59.5, range: 3, summons 4 mosquitoes (6 with skill)
- Stack: 20
- usage: Wormwood exclusive throwable bomb

## mosquitofertilizer
- Fertilizer: 300, soil cycle: 10, nutrients: {12, 12, 12}
- Stack: 20
- usage: Wormwood exclusive small fertilizer

## mosquitomermsalve
- Wurt HP +16, Merm HP +100
- Stack: 40
- usage: Wormwood exclusive (Wurt synergy healing)

## mosquitomusk
- Mosquito non-aggression (peace effect), perish: 3840 (8 days)
- usage: Wormwood exclusive mosquito neutralization

## wormwood_berrybush
- Deployable plant, 3-day cycle, 3~4 harvests
- usage: Wormwood exclusive plant deployment

## wormwood_berrybush2
- Same (same cycle as berry bush)
- usage: Wormwood exclusive

## wormwood_juicyberrybush
- 9-day cycle, 3~4 harvests
- usage: Wormwood exclusive

## wormwood_sapling
- Moonlight sapling deployment, 4-day cycle
- usage: Wormwood exclusive

## wormwood_reeds
- 3-day cycle, 4~6 harvests
- usage: Wormwood exclusive

## wormwood_lureplant
- HP: 300, spawns Eyeplants
- usage: Wormwood exclusive defense plant

## wormwood_carrat
- HP: 25, lifespan: 3 days, max 4
- usage: Wormwood exclusive plant creature

## wormwood_lightflier
- HP: 25, lifespan: 2.5 days, max 6, glowing
- usage: Wormwood exclusive lighting plant creature

## wormwood_fruitdragon
- HP: 600 (900 with skill), damage: 40, lifespan: 2 days, max 2
- usage: Wormwood exclusive combat plant creature

## wortox_reviver
- Resurrection item, perish: 10 days
- usage: Wortox exclusive, skill tree linked

## wortox_souljar
- Soul storage, leaks every 30s (stops with skill)
- Max souls +5
- usage: Wortox exclusive soul storage

## merm_armory
- Grants Merm armor and hat, 4 hammer hits
- usage: Wurt exclusive Merm military equipment

## merm_armory_upgraded
- Grants superior hat
- usage: Wurt exclusive

## merm_toolshed
- Grants Merm tools
- usage: Wurt exclusive

## merm_toolshed_upgraded
- Grants superior tools
- usage: Wurt exclusive

## mermhouse_crafted
- Spawns 1 Merm, respawn: 2 days
- usage: Wurt exclusive Merm spawning

## mermthrone_construction
- Construction material input → Merm King summoning
- usage: Wurt exclusive Merm King summoning

## mermwatchtower
- Spawns guard, respawn: 0.5 day (x12 in winter)
- usage: Wurt exclusive Merm guard post

## offering_pot
- Merm rally + feeding, range: 7
- usage: Wurt exclusive Merm gathering + feeding

## offering_pot_upgraded
- Superior version
- usage: Wurt exclusive

## wurt_swampitem_shadow
- Shadow swamp conversion (3 tiles), cooldown: 480s, -20 Sanity
- usage: Wurt exclusive terrain conversion

## wurt_swampitem_lunar
- Lunar swamp conversion, same structure
- usage: Wurt exclusive terrain conversion

## wurt_turf_marsh
- Crafts 4 marsh turf tiles
- usage: Wurt exclusive marsh flooring

## backpack
- slots: 8

## piggyback
- slots: 12
- speed_mult: 0.9 (10% movement speed reduction)

## icepack
- slots: 8
- perishable_mod: 0.5 (50% spoilage rate reduction, refrigeration effect)

## seedpouch
- slots: 14
- perishable_mod: 0.5 (50% spoilage rate reduction, preservation effect)

## balloonhat
- dapperness: +0.022/s
- fuel_time: 480s (1 day)
- waterproofness: 0.2
- usage:
  - Lightning damage immunity
  - Pops when hit (pop → destroyed)

## beefalohat
- insulation: 240
- waterproofness: 0.2
- fuel_time: 4800s (10 days)
- usage:
  - Beefalo non-aggression

## catcoonhat
- insulation: 60
- dapperness: +0.056/s
- fuel_time: 4800s (10 days)

## deserthat
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 4800s (10 days)
- usage:
  - Grants goggles effect

## earmuffshat
- insulation: 60
- fuel_time: 2400s (5 days)

## eyebrellahat
- waterproofness: 1.0 (fully waterproof)
- summer_insulation: 240
- fuel_time: 4320s (9 days)
- usage:
  - Lightning damage immunity
  - Grants umbrella effect

## featherhat
- dapperness: +0.033/s
- fuel_time: 3840s (8 days)

## flowerhat
- dapperness: +0.022/s
- fuel_time: 2880s (6 days)
- usage:
  - Reversal effect on Merms (hostile → non-hostile)

## goggleshat
- dapperness: +0.056/s
- fuel_time: 4800s (10 days)
- usage:
  - Grants goggles effect (no protection effect)

## icehat
- summer_insulation: 240
- speed_mult: 0.9 (10% movement speed reduction)
- perish: 3840s (8 days)
- usage:
  - Cooling -40 while worn (body temperature decrease)
  - Wetness +1/s (max 49%)
  - Repairable with ice

## inspectacleshat
- usage:
  - Detects nearby game signals, refreshes every 5s
  - Requires Winona exclusive skill

## kelphat
- dapperness: -0.022/s (reversed when worn by Merms)
- perish: 2880s (6 days)

## mermhat
- dapperness: -0.022/s
- perish: 7200s (15 days)
- usage:
  - Merm non-aggression

## blue_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% reduction)
- perish: 2880s (6 days)
- usage:
  - Emits blue spores while worn

## green_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% reduction)
- perish: 2880s (6 days)
- usage:
  - Emits green spores while worn

## red_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% reduction)
- perish: 2880s (6 days)
- usage:
  - Emits red spores while worn

## moon_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (25% reduction)
- perish: 2880s (6 days)
- usage:
  - Emits moon spores (1.5s interval, faster than regular mushroom hats)
  - Releases 3 additional moon spores when hit
  - Grants moon spore protection effect

## moonstorm_goggleshat
- dapperness: +0.056/s
- waterproofness: 0.2
- fuel_time: 480s (1 day)
- usage:
  - Grants goggles effect
  - Moonstorm detection function

## nutrientsgoggleshat
- summer_insulation: 60
- shadowlevel: 1
- usage:
  - Plant inspection function
  - Soil nutrient visualization

## polly_rogershat
- waterproofness: 0.35
- fuel_time: 2880s (6 days)
- usage:
  - Summons Polly Rogers (parrot) when equipped — auto-picks up nearby items
  - Parrot revives after 1 day upon death
  - Parrot persists across server migration

## pumpkinhat
- waterproofness: 0.2
- perish: 3840s (8 days, 7200s during Halloween event)
- usage:
  - Immunity to Sanity drain from darkness
  - Ghost damage immunity

## rainhat
- waterproofness: 0.7
- fuel_time: 4800s (10 days)
- usage:
  - Lightning damage immunity

## roseglasseshat
- dapperness: +0.022/s
- usage:
  - Winona exclusive
  - Skill tree linked (close-range inspection / wormhole tracking)

## strawhat
- summer_insulation: 60
- waterproofness: 0.2
- fuel_time: 2400s (5 days)
- usage:
  - Can be used as fuel

## tophat
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 3840s (8 days)

## tophat_magician
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 3840s (8 days)
- shadowlevel: 2
- usage:
  - Provides shadow storage space

## walterhat
- summer_insulation: 60
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 4800s (10 days)
- usage:
  - Walter exclusive — 50% Sanity damage reduction

## watermelonhat
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: -0.033/s
- perish: 1440s (3 days)
- usage:
  - Cooling -55 while worn (body temperature decrease)
  - Wetness +0.5/s

## winterhat
- insulation: 120
- dapperness: +0.022/s
- fuel_time: 4800s (10 days)

## bushhat
- usage:
  - Hide function — undetectable by enemies

## armorslurper
- hunger_rate: 0.6 (40% reduction)
- dapperness: +0.033/s
- fuel_time: 3840s (8 days)
- shadowlevel: 2
- usage:
  - No defense effect

## beargervest
- insulation: 240
- dapperness: +0.074/s
- hunger_rate: 0.75 (25% reduction)
- fuel_time: 3360s (7 days)

## hawaiianshirt
- summer_insulation: 240
- dapperness: +0.056/s
- perish: 7200s (15 days)

## onemanband
- dapperness: -0.033/s (base; additional reduction per follower)
- fuel_time: 180s
- shadowlevel: 1
- usage:
  - Follower detection range: 12
  - Max followers: 10

## raincoat
- waterproofness: 1.0 (fully waterproof)
- insulation: 60
- fuel_time: 4800s (10 days)
- usage:
  - Lightning damage immunity

## reflectivevest
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 3840s (8 days)

## sweatervest
- insulation: 60
- dapperness: +0.056/s
- fuel_time: 4800s (10 days)

## trunkvest_summer
- summer_insulation: 60
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 7200s (15 days)

## trunkvest_winter
- insulation: 240
- dapperness: +0.033/s
- fuel_time: 7200s (15 days)

## featherfan
- uses: 15
- usage:
  - Cooling -50 degrees within range 7 (minimum body temperature 2.5 degrees)
  - Can extinguish fires within range

## grass_umbrella
- waterproofness: 0.5
- summer_insulation: 120
- dapperness: +0.033/s
- perish: 960s (2 days)
- usage:
  - Can be used as fuel

## minifan
- damage: 17
- fuel_time: 90s
- usage:
  - Active only while moving: cooling -55 + heat dissipation +60
  - Cooling/heat dissipation inactive when stationary

## umbrella
- waterproofness: 0.9
- summer_insulation: 120
- fuel_time: 2880s (6 days)

## voidcloth_umbrella
- waterproofness: 1.0 (fully waterproof)
- summer_insulation: 240
- dapperness: -0.056/s
- fuel_time: 7200s (15 days)
- shadowlevel: 3
- usage:
  - Acid rain / moon hail damage immunity
  - Dome function: radius 16 area protection (1.5x durability consumption when used)
  - Repairable when broken
  - Repairable with dedicated repair kit

## winona_telebrella
- waterproofness: 0.35
- fuel_time: 7200s (15 days, battery charge method)
- usage:
  - Teleport function (consumes 1 day worth of fuel)
  - Winona exclusive
  - Skill tree linked

## balloonvest
- fuel_time: 480s (1 day)
- usage:
  - Drowning prevention
  - Pops when hit (pop → destroyed)

## cookbook
- Function: Opens cookbook popup
- Fuel Duration: 45s

## cookpot
- Type: Structure
- Slots: 4
- Base cooking time: ~20s (recipe-specific multiplier applied)
- Hammer hits: 4

## meatrack
- Type: Structure
- Slots: 3 (dryable items only)
- Drying time: 0.5~2 days (varies by item)
- Note: Stops during rain
- Hammer hits: 4

## spice_chili
- Stack: 40
- Buff: Attack power x1.2, duration 240s
- Body temperature: +40

## spice_garlic
- Stack: 40
- Buff: Damage absorption 33.3%, duration 240s

## spice_salt
- Stack: 40
- Effect: HP recovery +25% (instant application, no buff)

## spice_sugar
- Stack: 40
- Buff: Work efficiency x2, duration 240s

## wintersfeastoven
- Type: Structure
- Note: Winter's Feast event exclusive
- Base cooking time: ~20s
- Crafting station: Prototyper (WINTERSFEASTCOOKING)
- Hammer hits: 4

## portablefirepit_item
- Reference: character.md

## critter_dragonling_builder
- Summon pet: dragonling
- Movement: Flying
- Favorite food: Spicy Chili

## critter_eyeofterror_builder
- Summon pet: eyeofterror
- Movement: Flying
- Favorite food: Bacon and Eggs

## critter_glomling_builder
- Summon pet: glomling
- Movement: Flying
- Favorite food: Taffy

## critter_kitten_builder
- Summon pet: kitten
- Movement: Ground
- Favorite food: Fishsticks

## critter_lamb_builder
- Summon pet: lamb
- Movement: Ground
- Favorite food: Guacamole

## critter_lunarmothling_builder
- Summon pet: lunarmothling
- Movement: Flying
- Favorite food: Flower Salad

## critter_perdling_builder
- Summon pet: perdling
- Movement: Ground
- Favorite food: Trail Mix

## critter_puppy_builder
- Summon pet: puppy
- Movement: Ground
- Favorite food: Monster Lasagna

## wall_hay_item
- Type: Wall (deployable)
- Stack: 20
- Max HP: 100
- HP when placed: 50
- Hammer hits: 3
- Repair Material: Grass (approx. 16.7 restored per unit)
- Hammer Loot: Grass (proportional to HP, max 2)
- Flammable: Yes

## wall_wood_item
- Type: Wall (deployable)
- Stack: 20
- Max HP: 200
- HP when placed: 100
- Hammer hits: 3
- Repair Material: Logs (approx. 33.3 restored per unit)
- Hammer Loot: Logs (proportional to HP, max 2)
- Flammable: Yes

## wall_stone_item
- Type: Wall (deployable)
- Stack: 20
- Max HP: 400
- HP when placed: 200
- Hammer hits: 3
- Repair Material: Rocks (approx. 66.7 restored per unit)
- Hammer Loot: Rocks (proportional to HP, max 2)
- Flammable: Fire immune

## wall_moonrock_item
- Type: Wall (deployable)
- Stack: 20
- Max HP: 600
- HP when placed: 300
- Hammer hits: 25
- Repair Material: Moon Rock Nuggets (100 restored per unit)
- Hammer Loot: Moon Rock Nuggets (proportional to HP, max 2)
- Flammable: Fire immune
- usage:
  - 75% player damage reduction

## wall_dreadstone_item
- Type: Wall (deployable)
- Stack: 20
- Max HP: 800
- HP when placed: 400
- Hammer hits: 25
- Repair Material: Dreadstone (320 restored per unit)
- Hammer Loot: Dreadstone (proportional to HP, max 2)
- Flammable: Fire immune
- usage:
  - 75% player damage reduction

## wall_scrap_item
- Type: Wall (deployable)
- Stack: 20
- Max HP: 600
- HP when placed: 300
- Hammer hits: 10
- Repair Material: Gears (320 restored per unit)
- Hammer Loot: Wagpunk Parts (proportional to HP, max 1)
- Flammable: Fire immune
- usage:
  - 75% player damage reduction

## fence_item
- Type: Wall (deployable)
- Stack: 20
- HP when placed: 1 (absorbs all damage)
- Hammer hits: 3
- usage:
  - Movement blocking and pathfinding wall function

## fence_gate_item
- Type: Wall (deployable)
- Stack: 20
- HP when placed: 1 (absorbs all damage)
- Hammer hits: 3
- usage:
  - Gate that players can open and close
  - Movement blocking and pathfinding wall function when closed

## turf_road
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, road
- usage:
  - 30% movement speed increase

## turf_cotl_brick
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, road
- usage:
  - 30% movement speed increase

## turf_dragonfly
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, flooring
- usage:
  - Complete fire spread prevention

## turf_carpetfloor
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, flooring

## turf_carpetfloor2
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, flooring

## turf_checkerfloor
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, Flooring

## turf_cotl_gold
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, Flooring

## turf_woodfloor
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, Flooring

## turf_beard_rug
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, Flooring

## turf_mosaic_blue
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, Flooring

## turf_mosaic_grey
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, Flooring

## turf_mosaic_red
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground, Flooring

## turf_archive
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_vault
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_rocky
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_underrock
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_vent
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_ruinsbrick
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_ruinsbrick_glow
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_ruinstiles
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_ruinstiles_glow
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_ruinstrim
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_ruinstrim_glow
- Type: Floor Tile
- Stack: 20
- Ground: Hard ground

## turf_grass
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_forest
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_savanna
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_deciduous
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_desertdirt
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_marsh
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_cave
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_fungus
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_fungus_green
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_fungus_red
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_fungus_moon
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_mud
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_sinkhole
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_pebblebeach
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_shellbeach
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_meteor
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## turf_monkey_ground
- Type: Floor Tile
- Stack: 20
- Ground: Soft ground

## wood_chair
- Type: Structure
- Hammer hits: 1
- usage:
  - Character can sit on it
- Flammable: Yes

## wood_stool
- Type: Structure
- Hammer hits: 1
- usage:
  - Character can sit on it
- Flammable: Yes

## stone_chair
- Type: Structure
- Hammer hits: 1
- usage:
  - Character can sit on it
- Flammable: Fire immune

## stone_stool
- Type: Structure
- Hammer hits: 1
- usage:
  - Character can sit on it
- Flammable: Fire immune

## hermit_chair_rocking
- Type: Structure
- Hammer hits: 1
- usage:
  - Character can sit on it (rocking chair)
- Flammable: Yes

## wood_table_round
- Type: Structure
- Hammer hits: 5
- usage:
  - Can place 1 tabletop decoration
- Flammable: Yes

## wood_table_square
- Type: Structure
- Hammer hits: 5
- usage:
  - Can place 1 tabletop decoration
- Flammable: Yes

## stone_table_round
- Type: Structure
- Hammer hits: 5
- usage:
  - Can place 1 tabletop decoration
- Flammable: Fire immune

## stone_table_square
- Type: Structure
- Hammer hits: 5
- usage:
  - Can place 1 tabletop decoration
- Flammable: Fire immune

## endtable
- Type: Structure
- Hammer hits: 4
- usage:
  - Flower arrangement: inserting a fresh flower emits light (radius 1.5, intensity 0.5), Sanity +5
  - Flowers wilt after 4800s (10 days)
- Flammable: Yes

## wardrobe
- Type: Structure
- Hammer hits: 4
- usage:
  - Character skin change
- Flammable: Yes

## sewing_mannequin
- Type: Structure
- Hammer hits: 6
- usage:
  - Equipment display stand: can equip items in head/body/hand slots
  - Giving an item auto-equips it; if slot is occupied, it swaps
  - Hammering drops all equipped items
- Flammable: Yes

## homesign
- Type: Structure
- Hammer hits: 4
- usage:
  - Can write text
- Flammable: Yes

## arrowsign_post
- Type: Structure
- Hammer hits: 4
- usage:
  - Can write text
  - 8-direction rotation
- Flammable: Yes

## minisign_item
- Type: Inventory item (deployable)
- Stack: 10
- usage:
  - After placing, can draw item images with a feather pencil
  - Retrieved with shovel (DIG action, not hammer)
- Flammable: Yes

## pottedfern
- Type: Structure
- Hammer hits: 1
- usage:
  - Purely decorative (random appearance, 1~10 variants)
- Flammable: Yes

## succulent_potted
- Type: Structure
- Hammer hits: 1
- usage:
  - Purely decorative (random appearance, 1~5 variants)
- Flammable: Yes

## ruinsrelic_bowl
- Type: Inventory item (tabletop decoration)
- Hammer hits: 1
- usage:
  - Can be placed on tables

## ruinsrelic_chair
- Type: Structure
- Hammer hits: 1
- usage:
  - Character can sit on it (uncomfortable chair)
  - Can lure Shadelings in ruins

## ruinsrelic_chipbowl
- Type: Inventory item (tabletop decoration)
- Hammer hits: 1
- usage:
  - Can be placed on tables

## ruinsrelic_plate
- Type: Inventory item (tabletop decoration)
- Hammer hits: 1
- usage:
  - Can be placed on tables

## ruinsrelic_table
- Type: Structure
- Hammer hits: 1
- usage:
  - Decorative table (physics radius 0.5)

## ruinsrelic_vase
- Type: Inventory item (tabletop decoration)
- Hammer hits: 1
- usage:
  - Can be placed on tables

## vaultrelic_bowl
- Type: Inventory item (tabletop decoration)
- Hammer hits: 1
- usage:
  - Can be placed on tables

## vaultrelic_planter
- Type: Inventory item (tabletop decoration)
- Hammer hits: 1
- usage:
  - Can be placed on tables

## vaultrelic_vase
- Type: Inventory item (tabletop decoration)
- Hammer hits: 1
- usage:
  - Can be placed on tables
  - Flower arrangement: inserting a fresh flower emits light (radius 1.5, intensity 0.5)

## decor_centerpiece
- Type: Inventory item (tabletop decoration)
- usage:
  - Can be placed on tables
  - Purely decorative
- Flammable: Yes

## decor_flowervase
- Type: Inventory item (tabletop decoration)
- usage:
  - Can be placed on tables
  - Flower arrangement: inserting a fresh flower emits light (radius 1.5, intensity 0.5)
  - Flowers wilt after 4800s (10 days)
- Flammable: Yes

## decor_lamp
- Type: Inventory item (tabletop decoration)
- fuel: 468s (CAVE type fuel, uses Light Bulb)
- usage:
  - Can be placed on tables
  - Fuel-based lighting: light radius 2~4 depending on fuel level (intensity 0.4~0.6)
  - Toggle on/off
  - Auto-lights when placed on ground, auto-extinguishes when put in inventory
- Flammable: Yes

## decor_pictureframe
- Type: Inventory item (tabletop decoration)
- usage:
  - Can be placed on tables
  - Can draw item images with a feather pencil
- Flammable: Yes

## decor_portraitframe
- Type: Inventory item (tabletop decoration)
- usage:
  - Can be placed on tables
  - Purely decorative
- Flammable: Yes

## chesspiece_anchor_sketch
- Type: Inventory item (blueprint)
- usage:
  - Unlocks Anchor sculpture recipe at Potter's Wheel
  - Consumed on use

## chesspiece_butterfly_sketch
- Type: Inventory item (blueprint)
- usage:
  - Unlocks Moon Moth sculpture recipe at Potter's Wheel
  - Consumed on use

## chesspiece_moon_sketch
- Type: Inventory item (blueprint)
- usage:
  - Unlocks "Moon" sculpture recipe at Potter's Wheel
  - Consumed on use

## chesspiece_hornucopia_builder
- Type: Inventory item (heavy object)
- speed_mult: 0.15 (85% movement speed reduction)
- Hammer hits: 1
- usage:
  - Heavy item - cannot be stored in containers, equips in BODY slot
  - Gym weight: 3 (Wolfgang exclusive gym)
  - Returns materials when hammered

## chesspiece_pipe_builder
- Type: Inventory item (heavy object)
- speed_mult: 0.15 (85% movement speed reduction)
- Hammer hits: 1
- usage:
  - Heavy item - cannot be stored in containers, equips in BODY slot
  - Gym weight: 3 (Wolfgang exclusive gym)
  - Returns materials when hammered

## phonograph
- Type: Inventory item (also a structure)
- Hammer hits: 1
- usage:
  - Insert record to play music (64 seconds)
  - Crop tending effect within radius 8 during playback
  - Can be placed on tables
  - Playback stops when carried in inventory

## record
- Type: Inventory item
- usage:
  - Insert into phonograph to play music
  - Variants: default, balatro, etc.

## pirate_flag_pole
- Type: Structure
- Hammer hits: 3
- usage:
  - Purely decorative (random flag appearance, 1~4 variants)
- Flammable: Yes

## winter_treestand
- Type: Structure
- Hammer hits: 1
- usage:
  - Planter pot for Winter's Feast tree saplings
  - Planting a sapling removes the structure and grows into a Winter's Feast tree
  - Tree growth stages: sapling (0.5 days) > young (1 day) > medium (1 day) > large (1 day)
  - Large tree provides decoration container slots
- Flammable: Yes

## chum
- Stack: 20
- Effect: Spawns fish for 20s when thrown into ocean
- Lure radius: 16

## bobber_ball
- Stack: 40
- Casting distance: 9
- Accuracy: 0.80~1.20
- Angle deviation: +/-20 degrees

## bobber_oval
- Stack: 40
- Casting distance: 11
- Accuracy: 0.80~1.20
- Angle deviation: +/-20 degrees

## bobber_crow
- Stack: 40
- Casting distance: 9
- Accuracy: 0.85~1.15
- Angle deviation: +/-15 degrees

## bobber_robin
- Stack: 40
- Casting distance: 9
- Accuracy: 0.85~1.15
- Angle deviation: +/-15 degrees

## bobber_robin_winter
- Stack: 40
- Casting distance: 9
- Accuracy: 0.85~1.15
- Angle deviation: +/-15 degrees

## bobber_canary
- Stack: 40
- Casting distance: 9
- Accuracy: 0.85~1.15
- Angle deviation: +/-15 degrees

## bobber_goose
- Stack: 40
- Casting distance: 13
- Accuracy: 0.95~1.05
- Angle deviation: +/-5 degrees

## bobber_malbatross
- Stack: 40
- Casting distance: 13
- Accuracy: 0.95~1.05
- Angle deviation: +/-5 degrees

## lure_hermit_drowsy
- Stack: 40
- Lure radius: 3
- Charm: 0.1
- Reel speed: +0.3
- Casting distance: +1
- Condition: All weather
- Note: Consumes HP

## lure_hermit_heavy
- Stack: 40
- Lure radius: 5
- Charm: 0.5
- Reel speed: 0
- Casting distance: +1
- Condition: All weather
- Note: Extra charm for heavy fish (80%+)

## lure_hermit_rain
- Stack: 40
- Lure radius: 5
- Charm: 0.3
- Reel speed: +0.5
- Casting distance: +1
- Condition: Rain only

## lure_hermit_snow
- Stack: 40
- Lure radius: 5
- Charm: 0.3
- Reel speed: +0.5
- Casting distance: +1
- Condition: Snow only

## lure_spinner_blue
- Stack: 40
- Lure radius: 5
- Charm: 0.4
- Reel speed: +0.4
- Casting distance: +2
- Condition: Night specialized

## lure_spinner_green
- Stack: 40
- Lure radius: 5
- Charm: 0.4
- Reel speed: +0.4
- Casting distance: +2
- Condition: Dusk specialized

## lure_spinner_red
- Stack: 40
- Lure radius: 5
- Charm: 0.4
- Reel speed: +0.4
- Casting distance: +2
- Condition: Day specialized

## lure_spoon_blue
- Stack: 40
- Lure radius: 4
- Charm: 0.2
- Reel speed: +0.3
- Casting distance: +1
- Condition: Night specialized

## lure_spoon_green
- Stack: 40
- Lure radius: 4
- Charm: 0.2
- Reel speed: +0.3
- Casting distance: +1
- Condition: Dusk specialized

## lure_spoon_red
- Stack: 40
- Lure radius: 4
- Charm: 0.2
- Reel speed: +0.3
- Casting distance: +1
- Condition: Day specialized

## trophyscale_fish
- Type: Structure
- Hammer hits: 4
- Function: Measures and records fish weight

## beebox
- Type: Structure
- Max honey: 6
- Bees: 4
- Bee regeneration: 120s
- Hammer: 4 hits

## birdcage
- Type: Structure
- Bird storage
- Conversion: Meat > Egg, Seeds > Seeds
- Hammer: 4 hits

## compostingbin
- Type: Structure
- Capacity: 6 ingredients
- Output: 1 compost / 240~480s
- Hammer: 4 hits

## farm_plow_item
- Type: Tool
- Uses: 4
- Effect: Converts tile to farm soil
- Dig time: 15s

## fertilizer
- Type: Tool
- Uses: 10
- Effect: Fertilizer 300s
- Nutrients: Compost 0 / Growth Formula 0 / Manure 16

## mushroom_farm
- Type: Structure
- Harvests: 4
- Growth time: 1800s
- Repair Material: Living Log
- Hammer: 3 hits

## ocean_trawler_kit
- Type: Water structure
- Slots: 4
- Auto catch: 12.5% / 0.75s
- With bait: 2x catch rate
- Preservation: 10x

## soil_amender
- Type: Fermentation item (3 stages)
- Fresh: Nutrients Compost 8 / Growth Formula 0 / Manure 0
- Aged: Nutrients Compost 16 / Growth Formula 0 / Manure 0
- Fermented: Nutrients Compost 32 / Growth Formula 0 / Manure 0
- Uses: 5 (after fermentation)

## treegrowthsolution
- Type: Tool
- Stack: 10
- Effect: Fertilizer + tree growth + boat repair 20 HP
- Nutrients: Compost 8 / Growth Formula 32 / Manure 8

## trophyscale_oversizedveggies
- Type: Structure
- Effect: Measures oversized crop weight
- Keeps high score record
- Hammer: 4 hits

## bandage
- HP: +30 HP (instant heal)
- Uses: 1 (single use)
- Stack: 40

## bedroll_straw
- Stack: 10
- Sleep effect (per second):
  - HP: +0.5/s
  - Sanity: +0.667/s
  - Hunger: -1/s
- Temperature control: None

## bedroll_furry
- Uses: 3
- Sleep effect (per second):
  - HP: +1/s
  - Sanity: +1/s
  - Hunger: -1/s
- Cold protection: Maintains temperature 30~45 degrees C

## healingsalve
- HP: +20 HP (instant heal)
- Uses: 1 (single use)
- Stack: 40

## healingsalve_acid
- HP: +20 HP (instant heal)
- Uses: 1 (single use)
- Stack: 40
- Additional effect: 240s acid rain immunity after use

## lifeinjector
- Effect: Removes 25% max HP penalty
- Uses: 1 (single use)
- Stack: 40

## reviver
- Effect: Resurrects ghost-state player
- Resurrection Sanity: +80 SAN for resurrected player
- Penalty: 25% max HP penalty applied to resurrected target
- Uses: 1 (single use)

## tillweedsalve
- HP: +8 HP (instant) + +1 HP/3s x 60s = +20 HP (over time), total +28 HP
- Uses: 1 (single use)
- Stack: 40

## lantern
- Equip Slot: Hand
- Fuel Duration: 468s (cave fuel type)
- Light Radius: 3~5 (proportional to fuel level)
- Fuel refill: Yes

## molehat
- Equip Slot: Head
- Fuel type: Worm Light
- Fuel Duration: 720s (1.5 days)
- Effect: Night vision
- On depletion: Item removed

## mushroom_light
- Type: Structure
- Slots: 4 (Light Battery only)
- Light Radius: 2.5~5.5 (proportional to number of batteries inserted)
- Spoil rate: 25% (compared to normal)
- Hammer hits: 3

## mushroom_light2
- Type: Structure
- Slots: 4 (Light Battery + Spore only)
- Light Radius: 2.5~5.5
- Spore slot: Can change color
- Spoil rate: 25% (compared to normal)
- Hammer hits: 3

## pumpkin_lantern
- Light condition: Emits light only at night/dusk
- Light Radius: 1.5
- Perish Time: 4800s (19200s during Halloween event)
- Perish: Only perishes when placed on ground

## torch
- Equip Slot: Hand
- Fuel Duration: 75s
- Light Radius: 2 (up to 5 with skill)
- damage: 17 (50% of base attack)
- Ignite rate: 100% (ignites enemies)
- Non-consumable multiplier: 1.5x (fire-related skills)
- Waterproof: 20%
- Throwable: Yes

## beargerfur_sack
- Type: Container
- usage:
  - Extends food Perish Time by 20x inside (spoil rate x0.05)

## deerclopseyeball_sentryward_kit
- Type: Structure
- usage:
  - Hammer 4 hits
  - Map reveal
  - Fixes ambient temperature to -10 degrees within radius 35 (regardless of season)
  - 6 Ice every 7~12 days

## lunarplant_kit
- Type: Repair kit
- usage:
  - Lunar Plant material repair kit

## blueamulet
- fuel: 360s (MAGIC)
- dapperness: +0.033/s
- usage:
  - When equipped, cools the wearer (heat source -20, reduces body temperature in summer)
  - On hit, applies cold to attacker (cold +0.67) + consumes 3% fuel

## greenamulet
- uses: 5
- dapperness: +0.033/s
- usage:
  - Crafting consumes only 50% materials

## orangeamulet
- uses: 225
- dapperness: +0.033/s
- usage:
  - Auto-collects items within radius 4 every 0.33s
  - Repairable with Nightmare Fuel (restores 50 durability per unit)

## purpleamulet
- fuel: 192s (MAGIC), constant drain when equipped
- dapperness: -0.056/s (-3.3 per minute, -26.7 per day)
- usage:
  - When equipped, forces Sanity display to 0 - actual Sanity is maintained, only the check/UI shows 0
  - This triggers insanity state - Shadow Creatures appear/attack
  - On unequip, Sanity value restores to actual level (however, the Sanity drain effect during wear reduces actual Sanity, so prolonged wear results in lower Sanity upon removal)

## yellowamulet
- fuel: 480s (Nightmare Fuel type), constant drain when equipped
- speed_mult: 1.2 (+20% movement speed)
- dapperness: +0.033/s
- usage:
  - Emits light (radius 2, golden glow)
  - Can insert Nightmare Fuel while equipped to extend duration (other amulets cannot)

## greenstaff
- uses: 5
- usage:
  - Deconstructs structures/items with recipes - returns materials proportional to remaining durability % (minimum 1 guaranteed, gem-type materials not returned)
  - Sanity -20 per use

## orangestaff
- uses: 20
- damage: 17
- speed_mult: 1.25 (+25% movement speed)
- usage:
  - Blink (teleportation)
  - Sanity -15 per blink
  - No durability loss on attack

## telestaff
- uses: 5
- usage:
  - Teleports target to random location or Telelocator Focus
  - Cannot teleport in caves (only produces a minor tremor)
  - Sanity -50 per use
  - Adds +500 to world precipitation gauge per use - can trigger rain (world precipitation, not player wetness)

## yellowstaff
- uses: 20
- usage:
  - Summons a Dwarf Star at target location (lasts 1680s = 3.5 days):
  - Sanity -20 per use

## nightlight
- Type: Structure
- Hammer hits: 4
- Fuel: Nightmare Fuel type
- Max fuel: 540s
- usage:
  - Sanity aura -0.05/s when lit

## nightmare_timepiece
- Type: Inventory item
- usage:
  - Displays Nightmare Phase status in UI

## nightmarefuel
- Type: Consumable
- Stack: 40
- usage:
  - Can be used as Nightmare Fuel type fuel (fuel value 180s, for Dark Lantern/Night Light etc.)
  - Lazy Forager repair material (restores 50 durability per unit). Pure Horror can also repair the same target (restores 100 durability per unit). Currently only the Lazy Forager is a valid repair target in source code.

## purplegem
- Type: Inventory item
- Stack: 40
- usage:
  - Crafting material

## researchlab3
- Type: Structure (crafting station)
- Crafting station: MAGIC_TWO
- Materials: Living Log x3, Purple Gem x1, Nightmare Fuel x7

## researchlab4
- Type: Structure (crafting station)
- Crafting station: MAGIC_ONE
- Materials: Rabbit x4, Boards x4, Top Hat x1

## resurrectionstatue
- Type: Structure
- Hammer hits: 4
- usage:
  - Sets resurrection point
  - Linked: max HP -40

## telebase
- Type: Structure
- Hammer hits: 4
- usage:
  - Insert 3 Purple Gems to set as teleport destination

## townportal
- Type: Structure
- Hammer hits: 4
- usage:
  - Bidirectional teleportation
  - Sanity -15 immediately when channeling starts
  - Sanity -0.667/s during channeling
  - Sanity -50 for teleport user

## moondial
- Type: Structure
- Hammer hits: 4
- usage:
  - Lighting changes based on moon phase

## moonrockidol
- Type: Inventory item
- usage:
  - Glows when within radius 8 of Moon Portal
  - Key for activating Moon Gate

## leif_idol
- Type: Consumable
- Stack: 10
- Fuel: 180s
- usage:
  - Awakens Treeguards within radius 20
  - Converts 2 trees into Treeguards within radius 10

## magician_chest
- Type: Structure
- Hammer hits: 2
- usage:
  - Shared storage with Maxwell's shadow dimension

## punchingbag_lunar
- Type: Structure
- Hammer hits: 6
- HP: 10009 (instantly regenerates)
- alignment: Lunar alignment
- usage:
  - Can equip gear (for damage testing)

## punchingbag_shadow
- Type: Structure
- Hammer hits: 6
- HP: 10009 (instantly regenerates)
- alignment: Shadow alignment
- usage:
  - Can equip gear (for damage testing)

## waxwelljournal
- Fuel: Nightmare Fuel type 720s
- usage:
  - Maxwell exclusive
  - Consumes -36 fuel per spell cast (max 20 casts)
  - 4 spell types: Worker / Guardian / Trap / Pillar

## wereitem_beaver
- Type: Food
- Stack: 10
- Hunger: 25
- HP: -20 (0 with Curse Mastery skill)
- Sanity: -15 (0 with Curse Mastery skill)
- usage:
  - Woodie exclusive
  - Skill tree linked (Curse Mastery)

## wereitem_goose
- Type: Food
- Stack: 10
- Hunger: 25
- HP: -20 (0 with Curse Mastery skill)
- Sanity: -15 (0 with Curse Mastery skill)
- usage:
  - Woodie exclusive
  - Skill tree linked (Curse Mastery)

## wereitem_moose
- Type: Food
- Stack: 10
- Hunger: 25
- HP: -20 (0 with Curse Mastery skill)
- Sanity: -15 (0 with Curse Mastery skill)
- usage:
  - Woodie exclusive
  - Skill tree linked (Curse Mastery)

## carpentry_station
- Type: Structure
- Tech level: CARPENTRY=2 (3 with blade inserted)
- Dismantle: Hammer 2 hits

## cartographydesk
- Type: Structure
- Tech level: CARTOGRAPHY=2
- Dismantle: Hammer 4 hits
- Function: Map erasing

## madscience_lab
- Type: Structure
- Tech level: MADSCIENCE=1
- Dismantle: Hammer 4 hits
- Function: Halloween event potion crafting

## researchlab
- Type: Structure
- Tech level: SCIENCE=1, MAGIC=1
- Dismantle: Hammer 4 hits
- Active radius: 4
- Function: Wardrobe

## researchlab2
- Type: Structure
- Tech level: SCIENCE=2, MAGIC=1
- Dismantle: Hammer 4 hits
- Active radius: 4
- Function: Wardrobe

## sculptingtable
- Type: Structure
- Tech level: SCULPTING=1 (dynamic based on material)
- Dismantle: Hammer 4 hits
- Function: Sketch learning

## seafaring_prototyper
- Type: Structure
- Tech level: SEAFARING=2
- Dismantle: Hammer 4 hits

## tacklestation
- Type: Structure
- Tech level: FISHING=1
- Dismantle: Hammer 4 hits
- Function: Fishing sketch learning

## turfcraftingstation
- Type: Structure
- Tech level: TURFCRAFTING=2, MASHTURFCRAFTING=2
- Dismantle: Hammer 4 hits

## perdshrine
- Type: Structure
- Tech level: PERDOFFERING=3
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Berry Bushes

## pigshrine
- Type: Structure
- Tech level: PIGOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Meat

## wargshrine
- Type: Structure
- Tech level: WARGOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Torch (20% fuel consumption reduction)

## yot_catcoonshrine
- Type: Structure
- Tech level: CATCOONOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Bird Feather

## yotb_beefaloshrine
- Type: Structure
- Tech level: BEEFOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Beefalo Wool

## yotc_carratshrine
- Type: Structure
- Tech level: CARRATOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Carrot / Seeds

## yotd_dragonshrine
- Type: Structure
- Tech level: DRAGONOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Charcoal

## yoth_knightshrine
- Type: Structure
- Tech level: KNIGHTOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Gears / Frayed Wires / Electrical Doodad

## yotr_rabbitshrine
- Type: Structure
- Tech level: RABBITOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made; during Rabbit festival event, summons 9 Bunnymen
- Offering: Carrot

## yots_snakeshrine
- Type: Structure
- Tech level: WORMOFFERING=3, PERDOFFERING=1
- Dismantle: Hammer 4 hits
- Function: Trade only when empty, crafting station activates when offering is made
- Offering: Monster Meat

## lightning_rod
- Type: Structure
- usage:
  - Hammer 4 hits
  - Absorbs lightning, 3 charges
  - WX78 battery
  - Emits light when charged

## minerhat
- Type: Hat
- usage:
  - Fuel 468s (cave fuel)
  - Waterproof 0.2
  - Head-mounted light emission

## rainometer
- Type: Structure
- usage:
  - Hammer 4 hits
  - Displays precipitation probability meter

## bearger_fur
- Type: Material
- Stack: 10
- Special: None

## beeswax
- Type: Material
- Stack: 40
- Special: Melts near fire

## boards
- Type: Material
- Stack: 10
- Fuel: 180s
- Repair: 50 HP (wood material)
- Wood diet - only Cookie Cutters can eat it

## cutstone
- Type: Material
- Stack: 10
- Repair: 50 HP (stone material)
- Moleworm bait
- Rock tribute: 3

## malbatross_feathered_weave
- Type: Material
- Stack: 20
- Fuel: 15s

## marblebean
- Type: Material
- Stack: 40
- Moleworm bait
- Grows into marble sapling when planted

## moonrockcrater
- Type: Material
- Stack: Single (non-stackable)
- Repair: 80 HP + 4 work efficiency (Moon Rock material)
- Gem socket support

## papyrus
- Type: Material
- Stack: 40
- Fuel: 15s
- Cat toy

## refined_dust
- Type: Material
- Stack: 40
- Elemental diet, Hunger +1 (NPC only)
- Bait
- Rock tribute: 1

## rope
- Type: Material
- Stack: 20
- Fuel: 45s
- Cat toy

## transistor
- Type: Material
- Stack: 10
- Special: None

## waxpaper
- Type: Material
- Stack: 40
- Fuel: 15s
- Low ignition point

## woodie_boards
- Type: Material (= boards)
- Note: Recipe variant where Woodie can craft boards using Lucy the Axe with 2 logs

## seafaring_prototyper
- Type: Crafting station
- Provided tech: SEAFARING Tier 2
- Hammer hits: 4

## boat_grass_item
- Type: Boat kit (water deployable)
- Deploy radius: 3
- Hull HP: 200
- Repair Material: Grass
- Note: Does not leak, auto-degrades over time (5)

## boat_item
- Type: Boat kit (water deployable)
- Deploy radius: 4
- Hull HP: 200
- Max hull damage: 70
- Repair Material: Wood

## boatpatch_kelp
- Stack: 20
- Repair amount: 30
- Repair Material: Kelp
- Perish Time: 4800s
- Edible: Hunger 28.125, HP -3, Sanity -55

## boatpatch
- Stack: 20
- Repair amount: 100
- Repair Material: Wood
- Fuel value: Medium fuel x2

## oar
- Damage: 17 (50% of base damage)
- Durability: 500 uses
- Rowing force: 0.3
- Max speed contribution: 2
- Attack wear: 25
- Failure wear: 25
- Fuel type: Wood (medium fuel)

## oar_driftwood
- Damage: 17 (50% of base damage)
- Durability: 400 uses
- Rowing force: 0.5
- Max speed contribution: 3.5
- Attack wear: 25
- Failure wear: 25
- Waterproof: Yes
- Fuel type: Wood (medium fuel)

## balloonvest
- Equip Slot: Body
- Flotation device: Auto-inflation prevention when falling into water
- Fuel type: Magic
- Fuel amount: 480s (1 day)
- Usage:
  - Consumed while equipped
  - Inflates and breaks when hit
  - Prevents drowning damage

## anchor_item
- Type: Boat attachment kit
- Drag: 2
- Max speed multiplier: 0.15
- Sail force dampening: 0.8
- Hammer hits: 3
- Fuel value: Large fuel

## steeringwheel_item
- Type: Boat attachment kit
- Placement spacing: Medium
- Hammer hits: 3
- Fuel value: Large fuel
- Usage:
  - Allows steering the boat

## boat_rotator_kit
- Type: Boat attachment kit
- Placement spacing: Narrow
- Hammer hits: 3
- Fuel value: Large fuel
- Usage:
  - Automatically rotates/corrects boat direction

## mast_item
- Type: Boat attachment kit
- Max speed contribution: 2.5
- Sail force: 0.6
- Rudder turn drag: 0.23
- Upgrades: Deck illumination, lightning conductor mountable
- Hammer hits: 3
- Fuel value: Large fuel

## mast_malbatross_item
- Type: Boat attachment kit
- Max speed contribution: 4
- Sail force: 1.3
- Rudder turn drag: 0.23
- Upgrades: Deck illumination, lightning conductor mountable
- Hammer hits: 3
- Fuel value: Large fuel

## boat_bumper_kelp_kit
- Type: Boat attachment kit (edge placement)
- HP: 20
- Repair Material: Kelp
- Loot: Kelp x up to 2 (proportional to HP)

## boat_bumper_shell_kit
- Type: Boat attachment kit (edge placement)
- HP: 40
- Repair Material: Shell
- Loot: Slurtle Slime x up to 2 (proportional to HP)

## boat_cannon_kit
- Type: Boat attachment kit
- Range: ~20
- Aiming angle: +/-45 degrees
- Hammer hits: 4
- Fuel value: Large fuel
- Usage:
  - Load cannonball and fire

## cannonball_rock_item
- Stack: 20
- Direct hit damage: 200
- AoE damage: 120 (60% of direct hit)
- AoE radius: 3
- Collision radius: 0.5
- Projectile speed: 20
- Gravity: -40

## ocean_trawler_kit
- Type: Water structure kit
- Placement spacing: Medium
- Spoilage rate reduction: 1/3 (reduced fish spoilage speed)
- Hammer hits: 3
- Fuel value: Large fuel
- Usage:
  - Deploy at sea; collects fish/seafood over time
  - Includes storage container

## mastupgrade_lamp_item
- Type: Mast upgrade item
- Fuel type: Fire
- Fuel amount: 360s
- Usage:
  - Mount on mast to provide nighttime illumination
  - Turns off when fuel is depleted

## mastupgrade_lightningrod_item
- Type: Mast upgrade item
- Usage:
  - Mount on mast for lightning protection
  - Lasts 1 cycle after charge, recharges after discharge

## fish_box
- Type: Structure (placed on boat or dock)
- Spoilage rate reduction: 1/3 (reduced fish spoilage speed)
- Hammer hits: 2
- Usage:
  - Fish storage
  - Living fish released when hammered

## winch
- Type: Structure
- Lowering speed: 2
- Raising speed (empty): 1.8
- Raising speed (with item): 1.1
- Boat drag duration: 1s
- Hammer hits: 3
- Usage:
  - Salvage sunken items from the sea floor
  - Raise heavy objects on the boat

## waterpump
- Type: Structure
- Range: 7.5
- Hammer hits: 3
- Usage:
  - Long-use action
  - Shoots water at nearby fires to extinguish them

## boat_magnet_kit
- Type: Boat attachment kit
- Pairing radius: 24
- Max distance: 48
- Thrust: 0.6
- Max speed contribution: 2.5
- Placement spacing: Medium
- Hammer hits: 3
- Fuel value: Large fuel
- Usage:
  - Pairs with auto-navigation beacon for automatic propulsion

## boat_magnet_beacon
- Type: Structure (land/shore placement)
- Hammer hits: 3
- Usage:
  - Pairs with auto-navigator so the boat moves toward the beacon automatically

## flotationcushion
- Equip Slot: None (inventory item)
- Usage:
  - Auto-flotation when falling into water

## dock_kit
- Stack: 20
- Placement condition: Shore tile + adjacent land
- Usage:
  - Creates a dock tile on the shore
  - Registers with dock connection system

## dock_woodposts_item
- Stack: 20
- Placement spacing: Narrow
- Hammer hits: 3
- Loot: Log x 1
- Usage:
  - Installs decorative/defensive posts on dock edges

## wagpunk_floor_kit
- Stack: 20
- Placement condition: Ocean tiles within Wagstaff arena
- Usage:
  - Creates special flooring on ocean tiles within the arena
  - Related to special event (Wagstaff boss) structure

## chesspiece_anchor_sketch
- Type: Blueprint
- Usage:
  - Can craft anchor sculpture with marble/stone/moon glass
  - Shares chess piece blueprint system

## beeswax_spray
- Type: Equippable tool
- usage:
  - Uses: 75
  - Applies beeswax coating to plants (prevents wilting)

## gelblob_storage_kit
- Type: Structure
- usage:
  - Hammer hits: 4
  - 1-slot food storage with spoilage pause

## saddle_shadow
- Type: Equipment
- usage:
  - Durability: 12
  - Movement speed x1.45
  - Absorption: 60%
  - Planar defense: 15
  - Planar attack: 18
  - Shadow resistance: 90%

## shadow_beef_bell
- Type: Item
- usage:
  - Beefalo bonding
  - Revive dead beefalo (HP -50% + Sanity -100, cooldown 15 days)

## voidcloth_kit
- Type: Repair kit
- usage:
  - Repair kit for Void Cloth material items

## bundlewrap
- Type: Consumable
- Stack: 20
- Usage: Creates 4-slot bundle
- Fuel: 45s

## candybag
- Type: Bag (body slot)
- Slots: 14
- Special: Halloween items only storage

## chestupgrade_stacksize
- Type: Chest upgrade
- Effect: Allows infinite stacking in installed chest

## dragonflychest
- Type: Structure
- Slots: 12
- Special: Fireproof
- Upgradeable: Yes
- Hammer: 2 hits

## fish_box
- Type: Structure
- Slots: 20
- Storage: Ocean creatures only
- Spoilage: Reverse (-1/3x speed)
- Hammer: 2 hits

## giftwrap
- Type: Consumable
- Stack: 20
- Usage: Creates 4-slot gift bundle
- Fuel: Negligible

## icebox
- Type: Structure
- Slots: 9
- Spoilage: 50% speed (2x perish time)
- Hammer: 2 hits

## saltbox
- Type: Structure
- Slots: 9
- Spoilage: 25% speed (4x perish time)
- Hammer: 2 hits

## treasurechest
- Type: Structure
- Slots: 9
- Upgradeable: Yes
- Hammer: 2 hits

## pighouse
- Type: Structure
- Hammer hits: 4
- usage:
  - Spawns 1 pig, respawn time 4 days
  - When pig is inside at night, emits light (radius 1, intensity 0.5)
- Flammable: Yes

## rabbithouse
- Type: Structure
- Hammer hits: 4
- usage:
  - Spawns 1 bunny man, respawn time 1 day
  - Bunny men come out at night (opposite of pigs)
- Flammable: Yes

## scarecrow
- Type: Structure
- Hammer hits: 6
- usage:
  - Repels nearby crows
  - Can change character skin
- Flammable: Yes

## punchingbag
- Type: Structure
- Hammer hits: 6
- HP: 10009 (instant recovery)
- usage:
  - Damage testing dummy (displays up to 9999)
  - Can equip head/body gear
- Flammable: Yes

## fence_electric_item
- Type: Wall (deployable)
- HP when placed: 1 (absorbs all damage)
- Hammer hits: 3
- usage:
  - Max connections: 2, connection range: 10
  - Forms electric fence when connected, shocks enemies on contact
- Hammer Loot: Wagpunk parts, Moon Glass

## portabletent_item
- Type: Inventory item (deployable)
- uses: 10
- usage:
  - While sleeping: HP +2/tick, Hunger -1/tick, target body temperature 40 degrees
  - Can be placed/picked up (remaining durability preserved)
- Flammable: Yes

## houndwhistle
- Type: Inventory item
- uses: 10
- usage:
  - Tames hounds/Varg within radius 25 (except during lunar alignment)
  - Loyalty duration: 40s
  - Max followers: 5

## meatrack_hermit_multi
- Type: Structure
- Hammer hits: 4
- Container: 9 slots
- usage:
  - Dries meat/fish/kelp (3x capacity of regular Drying Rack's 3 slots)
  - Salt collection function
- Flammable: Yes

## archive_resonator_item
- Type: Inventory item (deployable)
- uses: 10
- usage:
  - Searches for lunar altar markers/relics/Crab King
  - Discovers markers within radius 4, drill produces relics
  - Creates beam pointer for distant targets

## rope_bridge_kit
- Type: Inventory item
- Stack: 10
- usage:
  - Deploys bridge over water (up to 6 tiles)
  - Multiple kits needed depending on length
- Flammable: Yes

## support_pillar_scaffold
- Type: Structure
- Hammer hits: 5
- usage:
  - Earthquake prevention (range 40)
  - Reinforce by investing materials (level 0-3: 0/10/20/40 pieces)
  - Additional 10-level buffer when fully reinforced

## support_pillar_dreadstone_scaffold
- Type: Structure
- Hammer hits: 5
- usage:
  - Earthquake prevention (range 40)
  - Auto-regeneration (2-day cycle)
  - Sanity aura: moderate Sanity drain within radius 8 (exponential decay)

## moon_device_construction1
- Type: Structure (construction stage)
- usage:
  - Stage 1 of 3 for Celestial Altar construction
  - Celestial Champion spawns 9.5s after stage 3 completion
  - Shadow meteors appear during construction

## table_winters_feast
- Type: Structure
- Hammer hits: 4
- usage:
  - Feast food placement (1 slot)
  - Table range 3.5, feast range 8
  - Feast buff for nearby characters (HP/Hunger/Sanity recovery)

## nightcaphat
- Type: Hat (inventory item)
- usage:
  - 30% increased Sanity recovery while sleeping
  - Enhanced sleeping bag/tent/siesta sleep effects

## perdfan
- Type: Inventory item
- uses: 9
- usage:
  - Fan (normal): 1 use, extinguishes fire/smolder within radius 7, cools target body temperature down to min 2.5 degrees (max -50 degree reduction)
  - Tornado summon (channeling): additional 2 uses (3 total), requires 3+ remaining uses, lasts 2s
  - Total uses: fan only 9 times, or tornado 3 times + fan 0 times

## cattoy_mouse
- Type: Inventory item
- usage:
  - Cat toy

## mapscroll
- Type: Inventory item
- usage:
  - Records the crafter's explored map
  - Can share map data with other players
- Flammable: Yes

## miniboatlantern
- Type: Inventory item (water surface deployment)
- fuel: 2880s (6 days, magic fuel type, non-rechargeable)
- usage:
  - Self-propelled light on water surface (radius 1.2, intensity 0.8)
  - Movement speed 0.4
  - Balloon detaches when fuel is depleted

## floatinglantern
- Type: Inventory item
- fuel: 960s (2 days, magic fuel type, non-rechargeable)
- usage:
  - Ascends into the sky when deployed as lighting
  - 4 height levels based on fuel (12/9/6/2)
  - Accelerated fuel consumption during rain/moon hail
  - Global minimap icon displayed while in flight

## redlantern
- Type: Inventory item (hand equipment)
- fuel: 5760s (12 days, magic fuel type, non-rechargeable)
- usage:
  - Hand-held light (radius 1.2, intensity 0.8, red color)
  - 25% accelerated fuel consumption during rain
- Flammable: Yes

## firecrackers
- Type: Consumable
- Stack: 40
- usage:
  - When ignited, scares scareable entities within radius 10
  - Number of explosions: proportional to stack size

## ticoon_builder
- Type: Consumable (consumed on use)
- usage:
  - Summons Ticoon (guide cat) on use
  - Ticoon leads to undiscovered Kitcoon locations

## boards_bunch
- Type: Inventory item
- usage:
  - Bundle of 5 boards - for bulk material input during construction
  - Splits into 5 boards on use

## cutstone_bunch
- Type: Inventory item
- usage:
  - Bundle of 5 cut stone - for bulk material input during construction
  - Splits into 5 cut stone on use

## winona_battery_low_item
- Type: Inventory item (deployable)
- usage:
  - Deploys Winona's Generator when placed
  - Uses chemical fuel (nitre), max fuel 180s (consumption rate 0.375 -> effective 1 day)
  - Circuit range: 6.6

## winona_battery_high_item
- Type: Inventory item (deployable)
- usage:
  - Deploys Winona's G.E.M.erator when placed
  - Uses magic fuel (gems), max fuel 2880s (6 days)
  - Circuit range: 6.6

## winona_spotlight_item
- Type: Inventory item (deployable)
- usage:
  - Deploys Winona's Spotlight when placed
  - Light radius ~4.3, min range 5.4, max range 24
  - Power consumption: 0.5 active, 0.05 standby

## handpillow_petals
- Type: Hand equipment (0 damage)
- usage:
  - Knockback force: 1.0, stun: 0.75

## handpillow_kelp
- Type: Hand equipment (0 damage)
- usage:
  - Knockback force: 1.4, stun: 0.60

## handpillow_beefalowool
- Type: Hand equipment (0 damage)
- usage:
  - Knockback force: 1.8, stun: 0.40

## handpillow_steelwool
- Type: Hand equipment (0 damage)
- usage:
  - Knockback force: 2.2, stun: 0.20

## bodypillow_petals
- Type: Body equipment
- usage:
  - Damage reduction: 10%

## bodypillow_kelp
- Type: Body equipment
- usage:
  - Damage reduction: 30%

## bodypillow_beefalowool
- Type: Body equipment
- usage:
  - Damage reduction: 50%

## bodypillow_steelwool
- Type: Body equipment
- usage:
  - Damage reduction: 70%

## chesspiece_anchor_builder
- Physics weight: 3

## chesspiece_antlion_builder
- Physics weight: 4

## chesspiece_bearger_builder
- Physics weight: 4

## chesspiece_bearger_mutated_builder
- Physics weight: 4

## chesspiece_beefalo_builder
- Physics weight: 3

## chesspiece_beequeen_builder
- Physics weight: 4

## chesspiece_bishop_builder
- Physics weight: 3
- usage: Activates on full moon/new moon (can summon Shadow Bishop)

## chesspiece_butterfly_builder
- Physics weight: 3

## chesspiece_carrat_builder
- Physics weight: 3

## chesspiece_catcoon_builder
- Physics weight: 3

## chesspiece_clayhound_builder
- Physics weight: 3

## chesspiece_claywarg_builder
- Physics weight: 3

## chesspiece_crabking_builder
- Physics weight: 4

## chesspiece_daywalker_builder
- Physics weight: 4

## chesspiece_daywalker2_builder
- Physics weight: 4

## chesspiece_deerclops_builder
- Physics weight: 4

## chesspiece_deerclops_mutated_builder
- Physics weight: 4

## chesspiece_dragonfly_builder
- Physics weight: 4

## chesspiece_eyeofterror_builder
- Physics weight: 4

## chesspiece_formal_builder
- Physics weight: 3

## chesspiece_guardianphase3_builder
- Physics weight: 4

## chesspiece_kitcoon_builder
- Physics weight: 3

## chesspiece_klaus_builder
- Physics weight: 4

## chesspiece_knight_builder
- Physics weight: 3
- usage: Activates on full moon/new moon (can summon Shadow Knight)

## chesspiece_malbatross_builder
- Physics weight: 4

## chesspiece_manrabbit_builder
- Physics weight: 3

## chesspiece_minotaur_builder
- Physics weight: 4

## chesspiece_moon_builder
- Physics weight: 3

## chesspiece_moosegoose_builder
- Physics weight: 4

## chesspiece_muse_builder
- Physics weight: 3

## chesspiece_pawn_builder
- Physics weight: 3

## chesspiece_rook_builder
- Physics weight: 3
- usage: Activates on full moon/new moon (can summon Shadow Rook)

## chesspiece_sharkboi_builder
- Physics weight: 4

## chesspiece_stalker_builder
- Physics weight: 4

## chesspiece_toadstool_builder
- Physics weight: 4

## chesspiece_twinsofterror_builder
- Physics weight: 4

## chesspiece_wagboss_lunar_builder
- Physics weight: 4

## chesspiece_wagboss_robot_builder
- Physics weight: 4

## chesspiece_warg_mutated_builder
- Physics weight: 4

## chesspiece_wormboss_builder
- Physics weight: 4

## chesspiece_yotd_builder
- Physics weight: 3

## chesspiece_yoth_builder
- Physics weight: 3

## chesspiece_yots_builder
- Physics weight: 3

## carnival_gametoken
- Type: Inventory item (event currency)
- Stack: 1

## carnival_gametoken_multiple
- Type: Inventory item (event currency)

## carnival_plaza_kit
- Type: Structure (deployable)
- usage:
  - Crow Carnival event center tree

## carnival_popcorn
- Type: Consumable
- Stack: 40

## carnival_prizebooth_kit
- Type: Structure (deployable)
- Hammer hits: 1
- usage:
  - Crow Carnival prize exchange

## carnival_seedpacket
- Type: Consumable
- Stack: 40

## carnival_vest_a
- Type: Body equipment
- dapperness: +0.042/s
- Summer insulation: 120
- fuel: 2400s (5 days, usage fuel type)

## carnival_vest_b
- Type: Body equipment
- dapperness: +0.042/s
- Summer insulation: 240
- fuel: 2400s (5 days, usage fuel type)

## carnival_vest_c
- Type: Body equipment
- dapperness: +0.042/s
- Summer insulation: 240
- fuel: 2400s (5 days, usage fuel type)

## carnivalcannon_confetti_kit
- Type: Structure (deployable, event decoration)
- Hammer hits: 1

## carnivalcannon_sparkle_kit
- Type: Structure (deployable, event decoration)
- Hammer hits: 1

## carnivalcannon_streamer_kit
- Type: Structure (deployable, event decoration)
- Hammer hits: 1

## carnivaldecor_banner_kit
- Type: Structure (deployable, event decoration)
- Hammer hits: 1

## carnivaldecor_eggride1_kit
- Type: Structure (deployable, event ride)
- Hammer hits: 1
- usage:
  - Activation time: 30s, token time: 2400s

## carnivaldecor_eggride2_kit
- Type: Structure (deployable, event ride)
- Hammer hits: 1

## carnivaldecor_eggride3_kit
- Type: Structure (deployable, event ride)
- Hammer hits: 1

## carnivaldecor_eggride4_kit
- Type: Structure (deployable, event ride)
- Hammer hits: 1

## carnivaldecor_figure_kit
- Type: Structure (deployable, event decoration)
- Hammer hits: 1

## carnivaldecor_figure_kit_season2
- Type: Structure (deployable, event decoration)
- Hammer hits: 1

## carnivaldecor_lamp_kit
- Type: Structure (deployable, event lighting)
- Hammer hits: 1
- usage:
  - Activation time: 60s, token time: 480s

## carnivaldecor_plant_kit
- Type: Structure (deployable, event decoration)
- Hammer hits: 1

## carnivalfood_corntea
- Type: Consumable
- Stack: 40
- Hunger: 9.375
- HP: 0
- Sanity: +5
- Temperature: -40, 15s (cooling drink)
- Perish Time: 1440s (3 days)

## carnivalgame_feedchicks_kit
- Type: Structure (deployable, event game)
- Hammer hits: 1

## carnivalgame_herding_kit
- Type: Structure (deployable, event game)
- Hammer hits: 1

## carnivalgame_memory_kit
- Type: Structure (deployable, event game)
- Hammer hits: 1

## carnivalgame_puckdrop_kit
- Type: Structure (deployable, event game)
- Hammer hits: 1

## carnivalgame_shooting_kit
- Type: Structure (deployable, event game)
- Hammer hits: 1

## carnivalgame_wheelspin_kit
- Type: Structure (deployable, event game)
- Hammer hits: 1

## wintercooking_berrysauce
- Type: Winter's Feast food

## wintercooking_bibingka
- Type: Winter's Feast food

## wintercooking_cabbagerolls
- Type: Winter's Feast food

## wintercooking_festivefish
- Type: Winter's Feast food

## wintercooking_gravy
- Type: Winter's Feast food

## wintercooking_latkes
- Type: Winter's Feast food

## wintercooking_lutefisk
- Type: Winter's Feast food

## wintercooking_mulleddrink
- Type: Winter's Feast food

## wintercooking_panettone
- Type: Winter's Feast food

## wintercooking_pavlova
- Type: Winter's Feast food

## wintercooking_pickledherring
- Type: Winter's Feast food

## wintercooking_polishcookie
- Type: Winter's Feast food

## wintercooking_pumpkinpie
- Type: Winter's Feast food

## wintercooking_roastturkey
- Type: Winter's Feast food

## wintercooking_stuffing
- Type: Winter's Feast food

## wintercooking_sweetpotato
- Type: Winter's Feast food

## wintercooking_tamales
- Type: Winter's Feast food

## wintercooking_tourtiere
- Type: Winter's Feast food

## halloween_experiment_bravery
- Type: Consumable (event)

## halloween_experiment_health
- Type: Consumable (event)

## halloween_experiment_moon
- Type: Consumable (event)

## halloween_experiment_root
- Type: Consumable (event)

## halloween_experiment_sanity
- Type: Consumable (event)

## halloween_experiment_volatile
- Type: Consumable (event)

## yotb_pattern_fragment_1
- Type: Inventory item (crafting material)

## yotb_pattern_fragment_2
- Type: Inventory item (crafting material)

## yotb_pattern_fragment_3
- Type: Inventory item (crafting material)

## yotb_post_item
- Type: Structure (deployable, event)
- Hammer hits: 4

## yotb_sewingmachine_item
- Type: Structure (deployable, event)
- Hammer hits: 4
- usage:
  - Container for crafting beefalo costumes

## yotb_stage_item
- Type: Structure (deployable, event)
- Hammer hits: 4
- usage:
  - For beefalo beauty contest judging

## yotc_carrat_gym_direction_item
- Type: Structure (deployable, event)
- usage: Carrat direction sense training

## yotc_carrat_gym_reaction_item
- Type: Structure (deployable, event)
- usage: Carrat reaction speed training

## yotc_carrat_gym_speed_item
- Type: Structure (deployable, event)
- usage: Carrat speed training

## yotc_carrat_gym_stamina_item
- Type: Structure (deployable, event)
- usage: Carrat stamina training

## yotc_carrat_race_checkpoint_item
- Type: Structure (deployable, event)
- usage: Carrat race checkpoint

## yotc_carrat_race_finish_item
- Type: Structure (deployable, event)
- usage: Carrat race finish line

## yotc_carrat_race_start_item
- Type: Structure (deployable, event)
- usage: Carrat race starting point

## yotc_carrat_scale_item
- Type: Structure (deployable, event)
- usage: Carrat stats measurement

## yotc_seedpacket
- Type: Consumable (event)

## yotc_seedpacket_rare
- Type: Consumable (event)

## yotc_shrinecarrat
- Type: Structure (event)

## dragonboat_kit
- Type: Inventory item (deployable)
- usage:
  - Deploy Dragon Boat: HP 200, radius 3.0

## dragonboat_pack
- Type: Inventory item (deployable)
- usage:
  - Deploy fully equipped Dragon Boat as a bundle

## dragonheadhat
- Type: Hat (head equipment)
- fuel: 480s (1 day, usage fuel type, consumed only during dance action)
- usage:
  - Head piece of the 3-person dragon dance set
  - dapperness up to +0.069/s when full 3-person set is assembled

## dragonbodyhat
- Type: Hat (Head Equipment)
- fuel: 480s (1 day, usage fuel type, consumed only during dance animation)
- usage:
  - Body part of the Dragon Dance 3-person set

## dragontailhat
- Type: Hat (Head Equipment)
- fuel: 480s (1 day, usage fuel type, consumed only during dance animation)
- usage:
  - Tail part of the Dragon Dance 3-person set

## mast_yotd_item
- Type: Inventory Item (Deployable)
- usage: Year of the Dragon Fly boat exclusive mast deploy

## mastupgrade_lamp_item_yotd
- Type: Inventory Item (Deployable)
- usage: Year of the Dragon Fly boat mast lamp upgrade

## boat_bumper_yotd_kit
- Type: Inventory Item (Deployable)
- usage: Year of the Dragon Fly boat exclusive bumper

## boatrace_checkpoint_throwable_deploykit
- Type: Inventory Item (Throwable Deployable)
- usage: Dragon Boat race checkpoint deploy

## boatrace_seastack_throwable_deploykit
- Type: Inventory Item (Throwable Deployable)
- usage: Dragon Boat race buoy deploy

## boatrace_start_throwable_deploykit
- Type: Inventory Item (Throwable Deployable)
- usage: Dragon Boat race starting tower deploy

## yotd_anchor_item
- Type: Inventory Item (Deployable)
- usage: Year of the Dragon Fly boat exclusive anchor

## yotd_boatpatch_proxy
- Type: Inventory Item
- usage: Year of the Dragon Fly boat repair

## yotd_oar
- Type: Inventory Item (Hand Equipment)
- usage: Year of the Dragon Fly boat exclusive oar

## yotd_steeringwheel_item
- Type: Inventory Item (Deployable)
- usage: Year of the Dragon Fly boat exclusive steering wheel

## yoth_chair_rocking_item
- Type: Inventory Item (Deployable)
- usage: Rocking Horse structure deploy (sittable)

## yoth_knightstick
- Type: Hand Equipment
- damage: 17
- fuel: 2880s (6 days, usage fuel type, consumed while walking)
- speed_mult: 1.15~1.60 (acceleration during sprint)
- usage:
  - Sprint increases Hunger drain by 33%
  - Max sprint charges: 30

## yotp_food1
- Type: Consumable
- Stack: 40
- HP: +12
- Hunger: 150
- Sanity: +5
- Perish Time: 7200s (15 days)

## yotp_food2
- Type: Consumable
- Stack: 40
- HP: 0
- Hunger: 150
- Sanity: 0
- Perish Time: None

## yotp_food3
- Type: Consumable
- Stack: 40
- HP: +6
- Hunger: 75
- Sanity: +1
- Perish Time: 7200s (15 days)

## yotr_decor_1_item
- Type: Structure (Deployable)
- Hammer hits: 4
- usage: Event decorative lighting

## yotr_decor_2_item
- Type: Structure (Deployable)
- Hammer hits: 4
- usage: Event decorative lighting

## yotr_fightring_kit
- Type: Structure (Deployable)
- Hammer hits: 4
- usage:
  - Pillow Fight minigame activation
  - Max prizes: 10

## yotr_food1
- Type: Consumable
- Stack: 40
- HP: +15
- Hunger: 75
- Sanity: +8.25
- Perish Time: 7200s (15 days)

## yotr_food2
- Type: Consumable
- Stack: 40
- HP: +60
- Hunger: 18.75
- Sanity: +8.25
- Perish Time: 7200s (15 days)

## yotr_food3
- Type: Consumable
- Stack: 40
- HP: +15
- Hunger: 18.75
- Sanity: +33
- Perish Time: 7200s (15 days)

## yotr_food4
- Type: Consumable
- Stack: 40
- HP: +30
- Hunger: 37.5
- Sanity: +16.5
- Perish Time: 7200s (15 days)

## yotr_token
- Type: Inventory Item (Event Token)
- usage: Pillow Fight challenge token

## yots_lantern_post_item
- Type: Structure (Deployable)
- usage:
  - Event lamp post — max fuel 960s (2 days)

## hermitcrab_lightpost
- Type: Structure
- usage: Hermit Island lamp post

## hermitcrab_relocation_kit
- Type: Inventory Item
- usage: Hermit Crab house relocation

## hermitcrab_teashop
- Type: Structure
- usage: Pearl's Tea Shop construction

## hermithotspring_constr
- Type: Structure (Construction)
- usage: Hermit Island hot spring construction

## hermithouse_ornament
- Type: Inventory Item
- usage: Hermit house decoration

## hermitshop_chum
- Type: Shop Item

## hermitshop_chum_blueprint
- Type: Shop Item (Blueprint)

## hermitshop_hermit_bundle_shells
- Type: Shop Item

## hermitshop_oceanfishingbobber_canary
- Type: Shop Item (Fishing Bobber)

## hermitshop_oceanfishingbobber_crow
- Type: Shop Item (Fishing Bobber)

## hermitshop_oceanfishingbobber_goose
- Type: Shop Item (Fishing Bobber)

## hermitshop_oceanfishingbobber_malbatross
- Type: Shop Item (Fishing Bobber)

## hermitshop_oceanfishingbobber_robin
- Type: Shop Item (Fishing Bobber)

## hermitshop_oceanfishingbobber_robin_winter
- Type: Shop Item (Fishing Bobber)

## hermitshop_oceanfishinglure_hermit_drowsy
- Type: Shop Item (Fishing Lure)

## hermitshop_oceanfishinglure_hermit_heavy
- Type: Shop Item (Fishing Lure)

## hermitshop_oceanfishinglure_hermit_rain
- Type: Shop Item (Fishing Lure)

## hermitshop_oceanfishinglure_hermit_snow
- Type: Shop Item (Fishing Lure)

## hermitshop_supertacklecontainer
- Type: Shop Item (Fishing Tackle Box)

## hermitshop_tacklecontainer
- Type: Shop Item (Fishing Tackle Box)

## hermitshop_turf_shellbeach_blueprint
- Type: Shop Item (Blueprint)

## hermitshop_winch_blueprint
- Type: Shop Item (Blueprint)

## hermitshop_winter_ornament_boss_hermithouse
- Type: Shop Item (Winter Ornament)

## hermitshop_winter_ornament_boss_pearl
- Type: Shop Item (Winter Ornament)

## shellweaver
- Type: Structure (Prototyper)
- Hammer hits: 3
- usage:
  - Unlocks Shell Weaver tech level 1/2
  - Cooking function (6s)

## shellweaver_desiccant
- Type: Inventory Item

## shellweaver_desiccantboosted
- Type: Inventory Item

## shellweaver_hermitcrab_shell
- Type: Inventory Item

## shellweaver_icestaff2
- Type: Inventory Item (Weapon)

## shellweaver_icestaff3
- Type: Inventory Item (Weapon)

## shellweaver_messagebottleempty
- Type: Inventory Item

## shellweaver_nonslipgrit
- Type: Inventory Item

## shellweaver_nonslipgritboosted
- Type: Inventory Item

## shellweaver_salty_doghat
- Type: Hat (Head Equipment)

## wanderingtradershop_bluegem
- Type: Shop Item

## wanderingtradershop_cutgrass
- Type: Shop Item

## wanderingtradershop_cutreeds
- Type: Shop Item

## wanderingtradershop_flint
- Type: Shop Item

## wanderingtradershop_gears
- Type: Shop Item

## wanderingtradershop_livinglog
- Type: Shop Item

## wanderingtradershop_moonglass
- Type: Shop Item

## wanderingtradershop_pigskin
- Type: Shop Item

## wanderingtradershop_redgem
- Type: Shop Item

## wanderingtradershop_twigs
- Type: Shop Item

## rabbitkingshop_armor_carrotlure
- Type: Shop Item (Body Equipment)

## rabbitkingshop_hat_rabbit
- Type: Shop Item (Hat)

## rabbitkingshop_rabbitkinghorn
- Type: Shop Item

## wagboss_robot_constructionsite_kit
- Type: Inventory Item (Deployable)
- usage: W.A.R.B.O.T. construction site deploy

## wagboss_robot_creation_parts
- Type: Inventory Item (Construction Material)
- usage: Parts required for W.A.R.B.O.T. construction

## wagpunk_workstation_blueprint_moon_device_construction1
- Type: Shop Item (Blueprint)
- usage: Unlocks Incomplete Experiment recipe at Wagpunk Workstation

## wagpunk_workstation_blueprint_moonstorm_goggleshat
- Type: Shop Item (Blueprint)
- usage: Unlocks Astroggles recipe at Wagpunk Workstation

## wagpunk_workstation_moonstorm_static_catcher
- Type: Inventory Item
- usage: Moonstorm event related equipment

## wagpunk_workstation_security_pulse_cage
- Type: Inventory Item
- usage: Moonstorm event related equipment

## kitcoon_nametag
- Type: Inventory Item (Single Use)
- usage:
  - Assigns a name to a Kitcoon (consumed after use)

## kitcoondecor1_kit
- Type: Structure (Deployable)
- Hammer hits: 4
- usage:
  - Kitcoon toy — Kitcoons play with it
- Flammable: Yes

## kitcoondecor2_kit
- Type: Structure (Deployable)
- Hammer hits: 4
- usage:
  - Kitcoon toy — Kitcoons play with it
- Flammable: Yes

## kitcoonden_kit
- Type: Structure (Deployable)
- Hammer hits: 4
- usage:
  - Kitcoon nursery — Hide and Seek minigame (3+ Kitcoons required, 60s time limit, radius 30)
- Flammable: Yes

## coldfire
- Type: Structure
- usage:
  - Fuel 270s
  - Chemical fuel
  - Rain accelerates fuel consumption (up to 3.5x at max precipitation)
  - Endothermic flame

## coldfirepit
- Type: Structure
- usage:
  - Hammer 4 hits
  - Fuel 360s
  - Chemical fuel
  - Fuel bonus multiplier 2x

## firesuppressor
- Type: Structure
- usage:
  - Hammer 4 hits
  - Fuel 2400s (5 days)
  - Detection range 15
  - Auto extinguish
  - Cooling

## siestahut
- Type: Structure
- usage:
  - Hammer 4 hits
  - Uses 15
  - Daytime sleep only
  - Cooling mode
  - HP +2/s, Hunger -0.33/s

## plantregistryhat
- Type: Hat
- usage:
  - Plant information inspection
  - Summer insulation 60
  - Infinite durability
  - No waterproofing

## turf_dragonfly
- Type: Turf
- Stack: 20
- usage:
  - Prevents fire spread

## axe
- damage: 27.2
- uses: 100

## goldenaxe
- damage: 27.2
- uses: 100 (work cost 1/4 = effective 400 chops, attack cost also 1/4)

## pickaxe
- uses: 33

## goldenpickaxe
- uses: 33 (work cost 1/4 = effective 132 mines)

## shovel
- uses: 25

## goldenshovel
- uses: 25 (work cost 1/4 = effective 100 uses)

## hammer
- damage: 17
- uses: 75
- usage:
  - Structure demolition (50% material recovery)

## pitchfork
- damage: 17
- uses: 25 (work cost 0.125/use = effective 200 turf operations)

## goldenpitchfork
- damage: 17
- uses: 25 (work cost 0.03125/use = effective 800 turf operations)

## razor
- uses: Infinite
- usage:
  - Beefalo/beard shaving

## farm_hoe
- damage: 17
- uses: 25

## golden_farm_hoe
- damage: 17
- uses: 25 (work cost 1/4 = effective 100 uses)

## moonglassaxe
- damage: 34
- uses: 100 (chopping efficiency 2.5x, chop cost 1.25/use = effective 80 chops, attack cost 2/use = effective 50 attacks)
- usage:
  - 25% bonus damage to shadow creatures (42.5)
  - Half durability consumption when attacking shadow creatures

## multitool_axe_pickaxe
- damage: 42.5
- uses: 800 (work efficiency 4/3x)
- usage:
  - Axe + Pickaxe dual-purpose
  - Shadow level 1

## pickaxe_lunarplant
- damage: 32.5
- planar_damage: 10
- uses: 600 (mining efficiency 4/3x)
- usage:
  - 10% bonus damage to shadow creatures
  - `[set]` Brightshade set bonus: 10% damage increase + planar damage +5
  - `[repair]` Repairable with Lunar Plant repair kit (100% durability restore)

## shovel_lunarplant
- damage: 17.2
- planar_damage: 10
- uses: 250
- usage:
  - Shovel + Hoe dual-purpose
  - 10% bonus damage to shadow creatures
  - `[set]` Brightshade set bonus: 10% damage increase + planar damage +5
  - `[repair]` Repairable with Lunar Plant repair kit (100% durability restore)

## voidcloth_scythe
- damage: 38
- planar_damage: 18
- uses: 200
- dapperness: -0.0347/s (-2.08 per min)
- usage:
  - AoE harvest (radius 4, angle 165 degrees)
  - Sanity drain when equipped (-2.08 per min)
  - 10% bonus damage to lunar creatures
  - Shadow level 3
  - `[set]` Voidcloth set bonus: 10% damage increase (41.8) + planar damage +5
  - `[repair]` Repairable with Voidcloth repair kit (100% durability restore)
  - Talks (has dialogue)

## cane
- damage: 17
- speed_mult: 1.25 (25% movement speed increase)

## walking_stick
- speed_mult: 1.15 (15% movement speed increase)
- perish_time: 1920 (4 days)
- usage:
  - Perishes over time

## bugnet
- damage: 4.25
- uses: 10 (capture 1/use, attack 3/use)

## thulecitebugnet
- damage: 4.25
- uses: 100 (capture 1/use, attack 3/use)

## birdtrap
- uses: 8

## trap
- uses: 8

## fishingrod
- damage: 4.25
- uses: 9 (fishing 1/use, attack 4/use)

## oceanfishingrod
- usage:
  - Ocean fishing only (lure/tackle attachable)

## brush
- damage: 27.2
- uses: 75 (brushing 1/use, attack 3/use)
- usage:
  - Beefalo brushing (taming related)

## compass
- damage: 10
- fuel_time: 1920 (4 days)
- usage:
  - Direction indicator
  - 30% durability loss on attack

## pocket_scale
- usage:
  - Fish weight measurement

## featherpencil
- Stack: 20
- usage:
  - Map marking

## sentryward
- usage:
  - Reveals minimap area when placed

## sewing_kit
- uses: 5
- usage:
  - Clothing/Armor durability repair (repair amount 2400)

## sewing_tape
- Stack: 40
- usage:
  - Clothing/Armor durability repair (repair amount 2400)

## reskin_tool
- usage:
  - Item skin change

## wagpunkbits_kit
- Stack: 10
- usage:
  - `[repair]` W.A.G.S.T.A.F.F. equipment exclusive repair kit (100% durability restore)

## wateringcan
- uses: 40 (after filling with water)
- usage:
  - Crop watering (water amount 25)
  - Extinguish fire + temperature -5

## premiumwateringcan
- uses: 160 (after filling with water)
- usage:
  - Crop watering (water amount 25)
  - Upgraded watering can (4x durability)

## miniflare
- usage:
  - On use: 15s light source + minimap marker (radius 30)

## megaflare
- usage:
  - On use: light source + hostile mob lure (Deerclops 60%, Pirates 60%, MacTusk 60% chance)

## beef_bell
- usage:
  - Beefalo taming/summoning

## saddlehorn
- damage: 17
- uses: 10 (saddle removal 1/use, attack 3/use)
- usage:
  - Beefalo saddle removal

## balloons_empty
- usage:
  - `[character]` Wes exclusive
  - Balloon crafting material

## gestalt_cage
- damage: 17
- usage:
  - `[character]` Wendy exclusive
  - Gestalt capture

## pocketwatch_dismantler
- usage:
  - `[character]` Wanda exclusive
  - Pocket watch disassembly

## slingshotmodkit
- usage:
  - `[character]` Walter exclusive
  - Slingshot mod attach/swap

## spider_repellent
- uses: 10
- usage:
  - `[character]` Webber exclusive
  - Spider repelling (radius 8, Spider Queen ignored)

## spider_whistle
- uses: 40 (2.5%/use consumption)
- usage:
  - `[character]` Webber exclusive
  - Summons spiders from spider dens within radius 16 + wakes sleeping spiders

## spiderden_bedazzler
- uses: 20
- usage:
  - `[character]` Webber exclusive
  - Spider den bedazzling (bedazzled dens have reduced creep radius: 9 to 4)

## wortox_nabbag
- damage: 13.6~34
- uses: 200 (bug catching: 20 uses)
- usage:
  - `[character]` Wortox exclusive
  - Small creature capture + weapon dual-purpose
  - Also usable as bug net (20 use limit)

## winona_remote
- fuel_time: 480 (1 day)
- usage:
  - `[character]` Winona exclusive
  - Remote control of Winona machines (range 30)

## wx78_scanner_item
- uses: Infinite
- usage:
  - `[character]` WX-78 exclusive
  - Auto-detects scannable creatures within radius when held in inventory
  - Place on ground to scan creatures within radius 7 (10s, Epic 20s) to learn corresponding module recipe
  - WX-78 must remain within radius 7 to maintain scan

## wx78_moduleremover
- uses: Infinite
- usage:
  - `[character]` WX-78 exclusive
  - Removes 1 equipped module (from top)
  - Removing active module deducts charge

## antlionhat
- (see armor.md)

## fence_rotator
- (see weapons.md)

## spear
- damage: 34
- uses: 150

## spear_wathgrithr
- damage: 42.5
- uses: 200
- usage:
  - `[character]` Wigfrid exclusive

## spear_wathgrithr_lightning
- damage: 59.5
- uses: 150
- usage:
  - `[character]` Wigfrid exclusive
  - `[electric]` 1.5x to wet targets
  - Lunge attack (cooldown 3s, lunge damage 68)
  - Upgrade with Suppressed Static to convert to Charged Lightning Spear

## spear_wathgrithr_lightning_charged
- damage: 59.5
- planar_damage: 20
- uses: 200
- speed_mult: 1.2 (movement speed +20%)
- usage:
  - `[character]` Upgraded Wigfrid only can equip
  - `[electric]` 1.5x to wet targets
  - Lunge attack (cooldown 1.5s, lunge damage 68)
  - Lunge hit repairs durability by 4 (max 2 per lunge = max 8 repair)

## hambat
- damage: 59.5 (decreases to 50% based on freshness)
- uses: 100
- usage:
  - Damage decreases over time (minimum 50% = 29.75)

## batbat
- damage: 42.5
- uses: 75
- usage:
  - On hit: HP +6.8 recovery, Sanity -3.4
  - Shadow level 2

## nightsword
- damage: 68
- uses: 100
- dapperness: -0.2083/s (-12.5 per min, -100 per day)
- usage:
  - Sanity drain when equipped (-12.5 per min)
  - Shadow level 2

## glasscutter
- damage: 68
- uses: 75
- usage:
  - Shadow creature damage x1.25 (68 to 85)
  - Half durability consumption when hitting shadow creatures

## ruins_bat
- damage: 59.5
- uses: 200
- speed_mult: 1.1 (movement speed +10%)
- usage:
  - Shadow level 2

## sword_lunarplant
- damage: 38
- planar_damage: 30
- uses: 200
- usage:
  - `[repair]` Repairable with Lunar Plant repair kit (100% durability restore)

## shadow_battleaxe
- damage: 38
- uses: 200
- usage:
  - On kill: +50 Hunger gained
  - Can chop trees (axe dual-purpose)
  - Shadow level 3
  - 4-stage level up based on kill count (0/3/6/9 kills):
  - Hunger drain to maintain level (Lv2: 0.05/s, Lv3: 0.1/s, Lv4: 0.2/s)
  - Sanity loss on lifesteal (lifesteal amount x0.5)

## voidcloth_boomerang
- damage: 5~27.2 (scales with distance)
- planar_damage: 5~27.2 (same scaling)
- uses: 85
- speed_mult: 1.1
- usage:
  - `[ranged]` Attack range 10 (max hit 14), size and damage increase while in flight
  - 25% bonus damage to lunar creatures (34)
  - Shadow level 3

## staff_lunarplant
- planar_damage: 10
- uses: 50
- usage:
  - `[ranged]` Projectile bounces to 5 enemies
  - 2x bonus damage to shadow creatures
  - `[set]` Brightshade set bonus: 7 bounces
  - `[repair]` Repairable with Lunar Plant repair kit (100% durability restore)

## trident
- damage: 51
- uses: 200
- usage:
  - 50% damage increase if target is on water (76.5)
  - Special ability: AoE damage 85, radius 2.75, spawns 10 geysers (50 uses)

## whip
- damage: 27.2
- uses: 175
- usage:
  - Range +2 (longer than melee)
  - Supercrack: 25% stagger chance on normal mobs, 20% on monsters, 5% on bosses
  - Supercrack range 14

## fence_rotator
- damage: 34
- uses: 200
- usage:
  - Fence rotation/movement

## nightstick
- damage: 28.9
- usage:
  - `[electric]` Electric damage (1.5x to wet targets = effective 43.4)
  - Fuel-based durability (1440s)
  - Light source

## pocketwatch_weapon
- damage: 81.6 / 27.2 when depleted
- usage:
  - `[character]` Wanda exclusive
  - Time fuel-based durability
  - Damage greatly reduced when fuel depleted

## boomerang
- damage: 27.2
- uses: 10
- usage:
  - `[ranged]` Range 12
  - Self-damage on failed catch when returning

## slingshot
- usage:
  - `[character]` Walter exclusive
  - `[ranged]` Attack range 10 (max hit 14)
  - Damage varies by ammo type:
  - `[skill tree]` Charged shot: damage x2, speed x1.25, increased range, 30% chance to not consume ammo

## blowdart_pipe
- Stack: 20
- damage: 100
- uses: 1
- usage:
  - `[ranged]` `[consumable]` Single use

## blowdart_fire
- Stack: 20
- damage: 100
- uses: 1
- usage:
  - `[ranged]` `[consumable]` Single use
  - Ignites target

## blowdart_sleep
- Stack: 20
- uses: 1
- usage:
  - `[ranged]` `[consumable]` Single use
  - Puts target to sleep

## blowdart_yellow
- Stack: 20
- damage: 60
- uses: 1
- usage:
  - `[ranged]` `[consumable]` Single use
  - `[electric]` Electric damage (1.5x to wet targets)

## houndstooth_blowpipe
- damage: 34
- planar_damage: 34
- usage:
  - `[ranged]` Attack range 12 (max hit 16)
  - 1.1x bonus damage to shadow creatures

## firestaff
- uses: 20
- usage:
  - `[ranged]` Ignites target

## icestaff
- uses: 20
- usage:
  - `[ranged]` Freezes target

## staff_tornado
- uses: 15
- usage:
  - `[ranged]` Summons tornado (moves and deals AoE damage)

## panflute
- uses: 10
- usage:
  - Puts nearby creatures to sleep (radius 15, 20s duration)

## gunpowder
- Stack: 40
- damage: 200
- usage:
  - `[deployable]` `[consumable]` Deploy then ignite for AoE explosion (radius 3)

## bomb_lunarplant
- Stack: 20
- planar_damage: 200
- usage:
  - `[ranged]` `[consumable]` Thrown AoE planar explosion (radius 3)
  - Crafted in batches of 6

## beemine
- usage:
  - `[deployable]` `[consumable]` Deploys and summons 4 bees when enemy approaches (radius 3)

## sleepbomb
- Stack: 20
- usage:
  - `[ranged]` `[consumable]` Thrown, puts nearby creatures to sleep (20s)

## waterballoon
- Stack: 20
- usage:
  - `[ranged]` `[consumable]` Thrown, extinguishes fire + wetness +20
  - Temperature -5

## trap_teeth
- damage: 60
- uses: 10
- usage:
  - `[deployable]` Deployable trap (radius 1.5)

## trap_bramble
- damage: 40
- uses: 10
- usage:
  - `[deployable]` Deployable trap (radius 2.5)
  - `[character]` Wormwood exclusive

## boat_cannon_kit
- usage:
  - Ship-mounted cannon (uses cannonballs)

## cannonball_rock_item
- Stack: 20
- damage: 200
- usage:
  - `[ranged]` Cannon ammo
  - Splash damage 120, splash radius 3

## winona_catapult
- damage: 42.5
- usage:
  - `[character]` Winona exclusive structure
  - `[deployable]` Auto-attack (attack interval 2.5s)
  - AoE damage (radius 1.25)
  - Power consumption

## winona_catapult_item
- usage:
  - Winona's Catapult deploy kit

## wortox_nabbag
- damage: 13.6~34
- uses: 200 (bug catching: 20 uses)
- usage:
  - `[character]` Wortox exclusive
  - Small creature capture + weapon dual-purpose
  - Also usable as bug net (20 use limit)

## wathgrithr_shield
- armor_hp: 420 (150x4x0.7)
- absorption: 0.85
- damage: 51 (34x1.5)
- usage:
  - `[character]` Wigfrid exclusive
  - Parry capable (arc 178 degrees, duration 1s)
  - Successful parry reduces cooldown by 70%
  - Cooldown 10s (2s when equipped)
  - Parry costs 3 armor durability
  - `[skill tree]` Parry bonus damage enhancement (15~30, duration 5s, scale 0.5)
  - `[skill tree]` Parry duration x2.5

## campfire
- Type: Structure
- usage:
  - Fuel 270s (starting 135)
  - Rain accelerates fuel consumption (up to 3.5x at max precipitation)
  - 4 stages
  - Cooking capable
  - Leaves ash + disappears when exhausted

## firepit
- Type: Structure
- usage:
  - Hammer 4 hits
  - Fuel 360s
  - Rain accelerates fuel consumption (up to 3x at max precipitation)
  - Fuel bonus multiplier 2x
  - Cooking capable

## dragonflyfurnace
- Type: Structure
- usage:
  - Hammer 6 hits
  - Permanent flame
  - Heat emission 115
  - 4-slot container
  - Cooking + incineration capable

## tent
- Type: Structure
- usage:
  - Hammer 4 hits
  - Uses 15
  - Sleep HP +2/s, Hunger -1/s
  - Target body temperature 40

## heatrock
- Type: Item
- usage:
  - Durability 8 uses (consumed on temperature range transition)
  - 5-stage temperature
  - Heat retention 120s
  - Emits light at max temperature

## winterometer
- Type: Structure
- usage:
  - Hammer 4 hits
  - Temperature meter display

## cotl_tabernacle_level1
- Type: Structure
- usage:
  - Hammer 4 hits
  - 3-stage upgrade
  - Lv1 fuel 120 / Lv2 fuel 240 / Lv3 fuel 480
  - Cooking capable
  - Sanity aura (Lv1 +50 / Lv2 +80 / Lv3 +200 per day)
