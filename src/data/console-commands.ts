import type { TranslationKey } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Console command category & command types
// ---------------------------------------------------------------------------

export type CommandCategoryId = "player" | "world" | "server" | "debug";

export interface CommandCategory {
  id: CommandCategoryId;
  labelKey: TranslationKey;
  icon: string; // image path relative to /images/
}

export interface ConsoleCommand {
  id: string;
  nameKo: string;
  nameEn: string;
  /** Command template. Use {param} for user-editable parameters. */
  command: string;
  descKo?: string;
  descEn?: string;
  /** Image path relative to /images/ (e.g. "game-items/reviver.png" or "ui/health.png") */
  icon?: string;
  /** Parameter definitions for editable commands */
  params?: CommandParam[];
}

export interface CommandParam {
  key: string;
  label: string;
  defaultValue: string;
  /** Options for select-type params */
  options?: { value: string; labelKo: string; labelEn: string }[];
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const commandCategories: CommandCategory[] = [
  { id: "player", labelKey: "console_player", icon: "game-items/reviver.png" },
  { id: "world", labelKey: "console_world", icon: "game-items/moon_altar_idol.png" },
  { id: "server", labelKey: "console_server", icon: "game-items/gears.png" },
  { id: "debug", labelKey: "console_debug", icon: "game-items/compass.png" },
];

// ---------------------------------------------------------------------------
// Commands per category
// ---------------------------------------------------------------------------

const seasonOptions: CommandParam["options"] = [
  { value: "autumn", labelKo: "가을", labelEn: "Autumn" },
  { value: "winter", labelKo: "겨울", labelEn: "Winter" },
  { value: "spring", labelKo: "봄", labelEn: "Spring" },
  { value: "summer", labelKo: "여름", labelEn: "Summer" },
];

const timeOptions: CommandParam["options"] = [
  { value: "0", labelKo: "밤 (0)", labelEn: "Night (0)" },
  { value: "0.25", labelKo: "새벽 (0.25)", labelEn: "Dawn (0.25)" },
  { value: "0.5", labelKo: "정오 (0.5)", labelEn: "Noon (0.5)" },
  { value: "0.75", labelKo: "황혼 (0.75)", labelEn: "Dusk (0.75)" },
];

export const consoleCommands: Record<CommandCategoryId, ConsoleCommand[]> = {
  player: [
    {
      id: "sethealth",
      nameKo: "체력 최대",
      nameEn: "Max Health",
      command: "c_sethealth(1)",
      icon: "ui/health.png",
    },
    {
      id: "sethunger",
      nameKo: "허기 최대",
      nameEn: "Max Hunger",
      command: "c_sethunger(1)",
      icon: "ui/hunger.png",
    },
    {
      id: "setsanity",
      nameKo: "정신력 최대",
      nameEn: "Max Sanity",
      command: "c_setsanity(1)",
      icon: "ui/sanity.png",
    },
    {
      id: "setmoisture",
      nameKo: "젖음 제거",
      nameEn: "Remove Wetness",
      command: "c_setmoisture(0)",
      icon: "game-items/umbrella.png",
    },
    {
      id: "supergodmode",
      nameKo: "슈퍼 갓모드",
      nameEn: "Super God Mode",
      command: "c_supergodmode()",
      descKo: "무적 + 스탯 무한",
      descEn: "Invincible + infinite stats",
      icon: "game-items/armor_ruins_arcane.png",
    },
    {
      id: "godmode",
      nameKo: "갓모드",
      nameEn: "God Mode",
      command: "c_godmode()",
      descKo: "무적 (피해 0)",
      descEn: "Invincible (no damage)",
      icon: "game-items/armorruins.png",
    },
    {
      id: "revive",
      nameKo: "부활",
      nameEn: "Revive",
      command: "c_revive()",
      descKo: "유령 → 부활",
      descEn: "Ghost → revive",
      icon: "game-items/reviver.png",
    },
    {
      id: "speedmult",
      nameKo: "이동속도",
      nameEn: "Speed",
      command: "c_speedmult({speed})",
      icon: "game-items/cane.png",
      params: [{ key: "speed", label: "배율", defaultValue: "4" }],
    },
    {
      id: "freecrafting",
      nameKo: "무료 제작",
      nameEn: "Free Crafting",
      command: "c_freecrafting()",
      descKo: "재료 없이 모든 아이템 제작",
      descEn: "Craft anything without materials",
      icon: "game-items/blueprint.png",
    },
    {
      id: "reset",
      nameKo: "캐릭터 리셋",
      nameEn: "Reset Character",
      command: "c_reset()",
      descKo: "캐릭터 선택으로 돌아감",
      descEn: "Return to character select",
      icon: "game-items/townportal.png",
    },
  ],

  world: [
    {
      id: "nextcycle",
      nameKo: "다음 날",
      nameEn: "Next Day",
      command: 'TheWorld:PushEvent("ms_nextcycle")',
      icon: "game-items/nightmare_timepiece.png",
    },
    {
      id: "skip",
      nameKo: "N일 건너뛰기",
      nameEn: "Skip N Days",
      command: "c_skip({days})",
      icon: "game-items/pocketwatch_portal.png",
      params: [{ key: "days", label: "일수", defaultValue: "1" }],
    },
    {
      id: "setseason",
      nameKo: "시즌 변경",
      nameEn: "Change Season",
      command: 'TheWorld:PushEvent("ms_setseason", "{season}")',
      icon: "game-items/winterometer.png",
      params: [
        {
          key: "season",
          label: "시즌",
          defaultValue: "winter",
          options: seasonOptions,
        },
      ],
    },
    {
      id: "settime",
      nameKo: "시간 변경",
      nameEn: "Set Time",
      command: "c_settime({time})",
      icon: "game-items/moondial.png",
      params: [
        {
          key: "time",
          label: "시간",
          defaultValue: "0.5",
          options: timeOptions,
        },
      ],
    },
    {
      id: "precipitation",
      nameKo: "비/눈 내리기",
      nameEn: "Force Rain/Snow",
      command: 'TheWorld:PushEvent("ms_forceprecipitation")',
      icon: "game-items/book_rain.png",
    },
    {
      id: "stopprecipitation",
      nameKo: "비/눈 멈추기",
      nameEn: "Stop Rain/Snow",
      command: 'TheWorld:PushEvent("ms_forceprecipitation", false)',
      icon: "game-items/raincoat.png",
    },
    {
      id: "lightning",
      nameKo: "번개 소환",
      nameEn: "Lightning Strike",
      command: 'TheWorld:PushEvent("ms_sendlightningstrike", ThePlayer:GetPosition())',
      icon: "game-items/lightning_rod.png",
    },
    {
      id: "revealmap",
      nameKo: "지도 공개",
      nameEn: "Reveal Map",
      command: "for x=-1600,1600,35 do for y=-1600,1600,35 do ThePlayer.player_classified.MapExplorer:RevealArea(x,0,y) end end",
      icon: "game-items/mapscroll.png",
    },
  ],

  server: [
    {
      id: "save",
      nameKo: "월드 저장",
      nameEn: "Save World",
      command: "c_save()",
      icon: "game-items/cookbook.png",
    },
    {
      id: "rollback",
      nameKo: "롤백",
      nameEn: "Rollback",
      command: "c_rollback({count})",
      icon: "game-items/nightmare_timepiece_warn.png",
      params: [{ key: "count", label: "횟수", defaultValue: "1" }],
    },
    {
      id: "shutdown",
      nameKo: "서버 종료",
      nameEn: "Shutdown",
      command: "c_shutdown(true)",
      descKo: "저장 후 종료",
      descEn: "Save & shutdown",
      icon: "game-items/gears.png",
    },
    {
      id: "announce",
      nameKo: "서버 공지",
      nameEn: "Announce",
      command: 'c_announce("{msg}")',
      icon: "game-items/horn.png",
      params: [{ key: "msg", label: "메시지", defaultValue: "Hello!" }],
    },
    {
      id: "listplayers",
      nameKo: "플레이어 목록",
      nameEn: "List Players",
      command: "c_listallplayers()",
      icon: "game-items/compass.png",
    },
    {
      id: "regenerateworld",
      nameKo: "월드 재생성",
      nameEn: "Regenerate World",
      command: "c_regenerateworld()",
      descKo: "주의: 월드 초기화",
      descEn: "Warning: resets world",
      icon: "game-items/moon_altar_idol.png",
    },
  ],

  debug: [
    {
      id: "gonext",
      nameKo: "엔티티로 텔포",
      nameEn: "Teleport to Entity",
      command: 'c_gonext("{prefab}")',
      icon: "game-items/telestaff.png",
      params: [{ key: "prefab", label: "프리팹 ID", defaultValue: "pigking" }],
    },
    {
      id: "countprefabs",
      nameKo: "엔티티 수 세기",
      nameEn: "Count Entities",
      command: 'c_countprefabs("{prefab}")',
      icon: "game-items/stash_map.png",
      params: [{ key: "prefab", label: "프리팹 ID", defaultValue: "beefalo" }],
    },
    {
      id: "removeall",
      nameKo: "엔티티 모두 제거",
      nameEn: "Remove All",
      command: 'c_removeall("{prefab}")',
      icon: "game-items/skull_wilson.png",
      params: [{ key: "prefab", label: "프리팹 ID", defaultValue: "hound" }],
      descKo: "주의: 되돌릴 수 없음",
      descEn: "Warning: irreversible",
    },
    {
      id: "select",
      nameKo: "커서 아래 선택",
      nameEn: "Select Under Cursor",
      command: "c_select()",
      descKo: "콘솔에서 TheInput:GetWorldEntityUnderMouse() 대체",
      descEn: "Selects entity under mouse",
      icon: "game-items/compass.png",
    },
    {
      id: "maintainall",
      nameKo: "전체 내구도 복구",
      nameEn: "Repair All Items",
      command: "c_maintainall()",
      descKo: "인벤토리 전체 내구도 100%",
      descEn: "Repair all inventory items",
      icon: "game-items/sewing_kit.png",
    },
  ],
};
