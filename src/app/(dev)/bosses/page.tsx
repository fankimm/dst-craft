"use client";

import { BackToHome } from "@/components/ui/BackToHome";
import { bossImageSrc } from "@/lib/asset-path";
import { lootDisplayName } from "@/data/bosses";

interface BossLoot {
  item: string;
  chance: number; // 1.0 = 100%
  count?: number; // how many guaranteed
  blueprint?: boolean;
}

interface Boss {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  image: string | string[]; // path(s) relative to /images/bosses/
  loot: BossLoot[];
}

const bosses: Boss[] = [
  // === Seasonal Giants ===
  {
    id: "deerclops",
    name: "Deerclops",
    nameKo: "외눈사슴",
    category: "시즌 보스",
    image: "deerclops.png",
    loot: [
      { item: "meat", chance: 1, count: 8 },
      { item: "deerclops_eyeball", chance: 1, count: 1 },
      { item: "chesspiece_deerclops_sketch", chance: 1 },
    ],
  },
  {
    id: "moose",
    name: "Moose/Goose",
    nameKo: "큰거위사슴/큰사슴거위",
    category: "시즌 보스",
    image: "moose.png",
    loot: [
      { item: "meat", chance: 1, count: 6 },
      { item: "drumstick", chance: 1, count: 2 },
      { item: "goose_feather", chance: 1, count: 3 },
      { item: "goose_feather", chance: 0.33, count: 2 },
      { item: "chesspiece_moosegoose_sketch", chance: 1 },
    ],
  },
  {
    id: "bearger",
    name: "Bearger",
    nameKo: "곰소리",
    category: "시즌 보스",
    image: "bearger.png",
    loot: [
      { item: "meat", chance: 1, count: 8 },
      { item: "bearger_fur", chance: 1, count: 1 },
      { item: "chesspiece_bearger_sketch", chance: 1 },
    ],
  },
  {
    id: "dragonfly",
    name: "Dragonfly",
    nameKo: "용파리",
    category: "레이드 보스",
    image: "dragonfly.png",
    loot: [
      { item: "dragon_scales", chance: 1 },
      { item: "dragonflyfurnace_blueprint", chance: 1, blueprint: true },
      { item: "chesspiece_dragonfly_sketch", chance: 1 },
      { item: "lavae_egg", chance: 0.33 },
      { item: "meat", chance: 1, count: 6 },
      { item: "goldnugget", chance: 1, count: 4 },
      { item: "goldnugget", chance: 0.5, count: 4 },
    ],
  },
  // === Raid Bosses ===
  {
    id: "beequeen",
    name: "Bee Queen",
    nameKo: "여왕벌",
    category: "레이드 보스",
    image: "beequeen.png",
    loot: [
      { item: "royal_jelly", chance: 1, count: 6 },
      { item: "royal_jelly", chance: 0.5 },
      { item: "honeycomb", chance: 1 },
      { item: "honeycomb", chance: 0.5 },
      { item: "honey", chance: 1, count: 3 },
      { item: "honey", chance: 0.5 },
      { item: "stinger", chance: 1 },
      { item: "hivehat", chance: 1 },
      { item: "bundlewrap_blueprint", chance: 1, blueprint: true },
      { item: "chesspiece_beequeen_sketch", chance: 1 },
    ],
  },
  {
    id: "klaus",
    name: "Klaus",
    nameKo: "클라우스",
    category: "레이드 보스",
    image: "klaus.png",
    loot: [
      { item: "monstermeat", chance: 1 },
      { item: "charcoal", chance: 1 },
      { item: "chesspiece_klaus_sketch", chance: 1 },
      { item: "winter_food3", chance: 1, count: 2 },
    ],
  },
  {
    id: "toadstool",
    name: "Toadstool",
    nameKo: "독꺼비버섯",
    category: "레이드 보스",
    image: "toadstool.png",
    loot: [
      { item: "shroom_skin", chance: 1 },
      { item: "chesspiece_toadstool_sketch", chance: 1 },
      { item: "red_mushroomhat_blueprint", chance: 1, blueprint: true },
      { item: "green_mushroomhat_blueprint", chance: 1, blueprint: true },
      { item: "blue_mushroomhat_blueprint", chance: 1, blueprint: true },
      { item: "mushroom_light_blueprint", chance: 1, blueprint: true },
      { item: "mushroom_light2_blueprint", chance: 1, blueprint: true },
      { item: "sleepbomb_blueprint", chance: 1, blueprint: true },
    ],
  },
  {
    id: "stalker_atrium",
    name: "Ancient Fuelweaver",
    nameKo: "고대의 연료직공",
    category: "레이드 보스",
    image: "stalker_atrium.png",
    loot: [
      { item: "shadowheart", chance: 1 },
      { item: "thurible", chance: 1 },
      { item: "armorskeleton", chance: 1 },
      { item: "skeletonhat", chance: 1 },
      { item: "chesspiece_stalker_sketch", chance: 1 },
      { item: "nightmarefuel", chance: 1, count: 4 },
      { item: "nightmarefuel", chance: 0.5, count: 2 },
    ],
  },
  {
    id: "crabking",
    name: "Crab King",
    nameKo: "대게왕",
    category: "레이드 보스",
    image: "crabking.png",
    loot: [
      { item: "trident_blueprint", chance: 1, blueprint: true },
      { item: "chesspiece_crabking_sketch", chance: 1 },
    ],
  },
  {
    id: "malbatross",
    name: "Malbatross",
    nameKo: "꽉새치",
    category: "해양 보스",
    image: "malbatross.png",
    loot: [
      { item: "meat", chance: 1, count: 7 },
      { item: "malbatross_beak", chance: 1 },
      { item: "bluegem", chance: 1, count: 2 },
      { item: "bluegem", chance: 0.3 },
      { item: "yellowgem", chance: 0.05 },
      { item: "chesspiece_malbatross_sketch", chance: 1 },
    ],
  },
  {
    id: "eyeofterror",
    name: "Eye of Terror",
    nameKo: "공포의 눈",
    category: "이벤트 보스",
    image: "eyeofterror.png",
    loot: [
      { item: "chesspiece_eyeofterror_sketch", chance: 1 },
      { item: "eyemaskhat", chance: 1 },
      { item: "milkywhites", chance: 1, count: 3 },
      { item: "milkywhites", chance: 0.5, count: 2 },
      { item: "monstermeat", chance: 1, count: 2 },
      { item: "monstermeat", chance: 0.5, count: 2 },
    ],
  },
  {
    id: "twinsofterror",
    name: "Twins of Terror",
    nameKo: "레티나이저/스파즈마티즘",
    category: "이벤트 보스",
    image: ["retinazor.png", "spazmatism.png"],
    loot: [
      // 공통 (둘 다 처치 시)
      { item: "chesspiece_twinsofterror_sketch", chance: 1 },
      { item: "shieldofterror", chance: 1 },
      // Retinazor
      { item: "yellowgem", chance: 1 },
      { item: "gears", chance: 1, count: 3 },
      { item: "gears", chance: 0.5, count: 2 },
      { item: "transistor", chance: 1, count: 2 },
      { item: "transistor", chance: 0.75 },
      { item: "nightmarefuel", chance: 1, count: 2 },
      { item: "nightmarefuel", chance: 0.5, count: 2 },
      { item: "trinket_6", chance: 1 },
      { item: "trinket_6", chance: 0.5 },
      // Spazmatism
      { item: "greengem", chance: 1 },
      { item: "gears", chance: 1, count: 3 },
      { item: "gears", chance: 0.5, count: 2 },
      { item: "transistor", chance: 1, count: 2 },
      { item: "transistor", chance: 0.75 },
      { item: "nightmarefuel", chance: 1, count: 2 },
      { item: "nightmarefuel", chance: 0.5, count: 2 },
      { item: "trinket_6", chance: 1 },
      { item: "trinket_6", chance: 0.5 },
    ],
  },
  {
    id: "antlion",
    name: "Antlion",
    nameKo: "개미사자",
    category: "시즌 보스",
    image: "antlion.png",
    loot: [
      { item: "townportal_blueprint", chance: 1, blueprint: true },
      { item: "antlionhat_blueprint", chance: 1, blueprint: true },
      { item: "chesspiece_antlion_sketch", chance: 1 },
    ],
  },
  {
    id: "daywalker",
    name: "Nightmare Werepig",
    nameKo: "악몽화된 늑대돼지",
    category: "레이드 보스",
    image: "daywalker.png",
    loot: [
      { item: "armordreadstone_blueprint", chance: 1, blueprint: true },
      { item: "dreadstonehat_blueprint", chance: 1, blueprint: true },
      { item: "wall_dreadstone_item_blueprint", chance: 1, blueprint: true },
      { item: "support_pillar_dreadstone_scaffold_blueprint", chance: 1, blueprint: true },
      { item: "chesspiece_daywalker_sketch", chance: 1 },
    ],
  },
  {
    id: "minotaur",
    name: "Ancient Guardian",
    nameKo: "고대의 수호자",
    category: "던전 보스",
    image: "minotaur.png",
    loot: [
      { item: "armorruins", chance: 1 },
      { item: "ruinshat", chance: 1 },
      { item: "ruins_bat", chance: 1 },
      { item: "support_pillar_scaffold_blueprint", chance: 1, blueprint: true },
      { item: "chesspiece_minotaur_sketch", chance: 1 },
    ],
  },
  {
    id: "spiderqueen",
    name: "Spider Queen",
    nameKo: "여왕 거미",
    category: "미니 보스",
    image: "spiderqueen.png",
    loot: [
      { item: "monstermeat", chance: 1, count: 4 },
      { item: "silk", chance: 1, count: 4 },
      { item: "spidereggsack", chance: 1 },
      { item: "spiderhat", chance: 1 },
    ],
  },
];

/** Sketches that have unique icon files (the rest use generic sketch.png) */
const SKETCHES_WITH_ICONS = new Set([
  "chesspiece_crabking_sketch",
  "chesspiece_daywalker_sketch",
  "chesspiece_malbatross_sketch",
]);

/** Resolve image path for a loot item */
function lootImage(itemId: string): string {
  const base = itemId.replace(/_blueprint$/, "");
  if (base.endsWith("_sketch")) {
    return SKETCHES_WITH_ICONS.has(base)
      ? `/images/game-items/${base}.png`
      : "/images/game-items/sketch.png";
  }
  return `/images/game-items/${base}.png`;
}

// Group by category
const grouped: Record<string, Boss[]> = {};
for (const boss of bosses) {
  if (!grouped[boss.category]) grouped[boss.category] = [];
  grouped[boss.category].push(boss);
}

const categoryOrder = ["시즌 보스", "레이드 보스", "해양 보스", "던전 보스", "이벤트 보스", "미니 보스"];

export default function BossesPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Boss Loot Tables</h1>
        <p style={{ color: "#888", marginBottom: 24 }}>
          {bosses.length}개 보스 — 게임 소스(prefabs/*.lua)에서 추출
        </p>

        {categoryOrder.filter(c => grouped[c]).map((category) => (
          <div key={category} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid #333", paddingBottom: 4 }}>
              {category}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {grouped[category].map((boss) => (
                <div
                  key={boss.id}
                  style={{
                    border: "1px solid #333",
                    borderRadius: 12,
                    background: "#1a1a1a",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", gap: 12 }}>
                    {(Array.isArray(boss.image) ? boss.image : [boss.image]).map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={bossImageSrc(`/images/bosses/${img}`)}
                        alt={boss.name}
                        width={48}
                        height={48}
                        style={{ flexShrink: 0, objectFit: "contain", marginRight: Array.isArray(boss.image) ? -12 : 0 }}
                        loading="lazy"
                      />
                    ))}
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#e0e0e0" }}>{boss.nameKo}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{boss.name}</div>
                    </div>
                  </div>
                  <div style={{ padding: "8px 16px 12px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {boss.loot.map((loot, i) => {
                        const displayName = lootDisplayName(loot.item, "ko");
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: loot.blueprint ? "rgba(57,117,206,0.15)" : "rgba(255,255,255,0.05)",
                              border: loot.blueprint ? "1px solid rgba(57,117,206,0.4)" : "1px solid rgba(255,255,255,0.08)",
                              fontSize: 12,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={lootImage(loot.item)}
                              alt={loot.item}
                              width={24}
                              height={24}
                              style={{ flexShrink: 0 }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                              loading="lazy"
                            />
                            <span style={{ color: loot.blueprint ? "#6ba3e8" : "#ccc" }}>
                              {displayName}
                              {loot.blueprint && <span style={{ color: "#3975ce", marginLeft: 4, fontWeight: 600 }}>BP</span>}
                              {(loot.count ?? 0) > 1 && <span style={{ color: "#888" }}> ×{loot.count}</span>}
                              {loot.chance < 1 && <span style={{ color: "#f59e0b" }}> {Math.round(loot.chance * 100)}%</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
