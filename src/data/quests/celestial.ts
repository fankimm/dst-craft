import type { Quest } from "./types";

/**
 * 대변자(Celestial Champion / Alterguardian) 진행 체인.
 *
 * 출처:
 * - 인게임 prefabs/moon_altar_idol/glass/seed.lua, moon_altar.lua, moon_altar_astral.lua,
 *   alterguardian_phase1/2/3.lua, wagstaff_npc.lua, moonstormmarker.lua + strings.lua
 * - 한국어 명칭: 한글모드 ko.po (STRINGS.NAMES.*)
 *
 * 진행 순서:
 *  1. 달 섬(Lunar Isle) 도달
 *  2. Inviting Formation 3종(우상/기단/구체)에서 부품 회수
 *  3. 부품으로 천상의 제단 조립 → 천상의 공물 충전
 *  4. 달 폭풍(Moon Storm) 발생 후 Wagstaff NPC를 찾아 기구 4대 활성화
 *  5. 천상의 성소 조립
 *  6. 천상의 대변자 페이즈 1·2·3 처치 → 계몽의 조각/계몽의 왕관 획득
 */
export const celestialQuest: Quest = {
  id: "celestial",
  titleKo: "대변자",
  titleEn: "Celestial Champion",
  icon: "alterguardianhat.png",
  summaryKo: "달의 진영 엔드게임. 천상의 제단·성소를 조립하고 3페이즈 보스를 처치.",
  summaryEn: "Lunar endgame. Assemble the altar/sanctum and defeat the 3-phase boss.",
  steps: [
    {
      id: "find_lunar_isle",
      titleKo: "달의 섬 발견",
      titleEn: "Reach the Lunar Isle",
      descKo: "보트로 바다를 건너 달의 섬(Moon Stone Island) 상륙.",
      descEn: "Cross the ocean and land on the Lunar Isle.",
      icon: "moonglass.png",
    },
    {
      id: "find_inviting_idol",
      titleKo: "유혹적 형성물 — 우상",
      titleEn: "Inviting Formation — Idol",
      descKo: "달의 섬에서 우상 형성물을 찾아 부품(천상의 제단 우상) 회수.",
      descEn: "Find the Idol-shaped formation and recover the Celestial Altar Idol.",
      icon: "moon_altar_idol.png",
    },
    {
      id: "find_inviting_glass",
      titleKo: "유혹적 형성물 — 기단",
      titleEn: "Inviting Formation — Base",
      descKo: "기단 형성물에서 천상의 제단 기단 회수.",
      descEn: "Find the Base-shaped formation and recover the Celestial Altar Base.",
      icon: "moon_altar_glass.png",
    },
    {
      id: "find_inviting_seed",
      titleKo: "유혹적 형성물 — 구체",
      titleEn: "Inviting Formation — Orb",
      descKo: "구체 형성물에서 천상의 제단 구체 회수.",
      descEn: "Find the Orb-shaped formation and recover the Celestial Altar Orb.",
      icon: "moon_altar_seed.png",
    },
    {
      id: "assemble_celestial_altar",
      titleKo: "천상의 제단 조립",
      titleEn: "Assemble the Celestial Altar",
      descKo: "우상·기단·구체 3종을 합쳐 천상의 제단 완성.",
      descEn: "Combine all three pieces into the Celestial Altar.",
      icon: "moon_altar_icon.png",
    },
    {
      id: "find_inactive_celestial_tribute",
      titleKo: "비활성 천상의 공물 획득",
      titleEn: "Obtain Inactive Celestial Tribute",
      descKo: "크랩 킹(Crab King) 처치 보상에서 비활성 공물 획득.",
      descEn: "Defeat Crab King to obtain the Inactive Celestial Tribute.",
      icon: "moon_altar_crown.png",
    },
    {
      id: "charge_celestial_tribute",
      titleKo: "천상의 공물 충전",
      titleEn: "Charge the Celestial Tribute",
      descKo: "비활성 공물을 천상의 제단에 올려 활성 공물로 변환.",
      descEn: "Place the inactive tribute on the altar to activate it.",
      icon: "moon_altar_crown.png",
    },
    {
      id: "wait_moonstorm",
      titleKo: "달 폭풍 발생 대기",
      titleEn: "Wait for Moon Storm",
      descKo: "공물 충전 후 달 폭풍이 콘스턴트(Constant)에 발생.",
      descEn: "After charging, a Moon Storm rolls across the Constant.",
      icon: "moonstorm_goggleshat.png",
    },
    {
      id: "find_wagstaff",
      titleKo: "와그스태프 만나기",
      titleEn: "Meet Wagstaff",
      descKo: "폭풍 안에서 'Grainy Transmission' 신호를 따라 와그스태프 NPC 조우.",
      descEn: "Follow the Grainy Transmission inside the storm to meet Wagstaff.",
      icon: "wagstaff_item_1.png",
    },
    {
      id: "wagstaff_machine_1",
      titleKo: "와그스태프 기구 활성화 1",
      titleEn: "Activate Wagstaff Device 1",
      descKo: "와그스태프가 지정한 첫 번째 도구를 가져다주고 기구 작동.",
      descEn: "Deliver the requested tool to power the first device.",
      icon: "wagstaff_tool_1.png",
    },
    {
      id: "wagstaff_machine_2",
      titleKo: "와그스태프 기구 활성화 2",
      titleEn: "Activate Wagstaff Device 2",
      descKo: "두 번째 기구 작동.",
      descEn: "Power the second device.",
      icon: "wagstaff_tool_2.png",
    },
    {
      id: "wagstaff_machine_3",
      titleKo: "와그스태프 기구 활성화 3",
      titleEn: "Activate Wagstaff Device 3",
      descKo: "세 번째 기구 작동.",
      descEn: "Power the third device.",
      icon: "wagstaff_tool_3.png",
    },
    {
      id: "wagstaff_machine_4",
      titleKo: "와그스태프 기구 활성화 4",
      titleEn: "Activate Wagstaff Device 4",
      descKo: "네 번째 기구까지 작동시키면 폭풍이 잠잠해지고 청사진 보상.",
      descEn: "Power the fourth device to quell the storm and unlock blueprints.",
      icon: "wagstaff_tool_4.png",
    },
    {
      id: "assemble_celestial_sanctum",
      titleKo: "천상의 성소 조립",
      titleEn: "Assemble the Celestial Sanctum",
      descKo: "Wagstaff 청사진으로 천상의 성소(Celestial Sanctum) 건설.",
      descEn: "Build the Celestial Sanctum using Wagstaff's blueprints.",
      icon: "moon_altar_ward.png",
    },
    {
      id: "summon_champion",
      titleKo: "대변자 소환",
      titleEn: "Summon the Champion",
      descKo: "천상의 성소에서 활성 공물을 사용해 천상의 대변자 소환.",
      descEn: "Use the active tribute at the sanctum to summon the Celestial Champion.",
      icon: "moon_altar_crown.png",
    },
    {
      id: "defeat_phase1",
      titleKo: "페이즈 1 처치",
      titleEn: "Defeat Phase 1",
      descKo: "ALTERGUARDIAN_PHASE1 처치 — 처치 시 페이즈 2로 전환.",
      descEn: "Defeat ALTERGUARDIAN_PHASE1 to transition to phase 2.",
      icon: "alterguardianhatshard.png",
    },
    {
      id: "defeat_phase2",
      titleKo: "페이즈 2 처치",
      titleEn: "Defeat Phase 2",
      descKo: "ALTERGUARDIAN_PHASE2 처치 — 처치 시 페이즈 3으로 전환.",
      descEn: "Defeat ALTERGUARDIAN_PHASE2 to transition to phase 3.",
      icon: "alterguardianhatshard_open.png",
    },
    {
      id: "defeat_phase3",
      titleKo: "페이즈 3 처치",
      titleEn: "Defeat Phase 3",
      descKo: "ALTERGUARDIAN_PHASE3 처치 — 계몽의 조각(Enlightened Shard) 등 보상.",
      descEn: "Defeat ALTERGUARDIAN_PHASE3 — drops the Enlightened Shard reward.",
      icon: "alterguardianhatshard_red_open.png",
    },
  ],
};
