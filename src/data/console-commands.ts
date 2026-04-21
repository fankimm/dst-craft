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
    },
    {
      id: "sethunger",
      nameKo: "허기 최대",
      nameEn: "Max Hunger",
      command: "c_sethunger(1)",
    },
    {
      id: "setsanity",
      nameKo: "정신력 최대",
      nameEn: "Max Sanity",
      command: "c_setsanity(1)",
    },
    {
      id: "setmoisture",
      nameKo: "젖음 제거",
      nameEn: "Remove Wetness",
      command: "c_setmoisture(0)",
    },
    {
      id: "supergodmode",
      nameKo: "슈퍼 갓모드",
      nameEn: "Super God Mode",
      command: "c_supergodmode()",
      descKo: "무적 + 스탯 무한",
      descEn: "Invincible + infinite stats",
    },
    {
      id: "godmode",
      nameKo: "갓모드",
      nameEn: "God Mode",
      command: "c_godmode()",
      descKo: "무적 (피해 0)",
      descEn: "Invincible (no damage)",
    },
    {
      id: "revive",
      nameKo: "부활",
      nameEn: "Revive",
      command: "c_revive()",
      descKo: "유령 → 부활",
      descEn: "Ghost → revive",
    },
    {
      id: "speedmult",
      nameKo: "이동속도",
      nameEn: "Speed",
      command: "c_speedmult({speed})",
      params: [{ key: "speed", label: "배율", defaultValue: "4" }],
    },
    {
      id: "reset",
      nameKo: "캐릭터 리셋",
      nameEn: "Reset Character",
      command: "c_reset()",
      descKo: "캐릭터 선택으로 돌아감",
      descEn: "Return to character select",
    },
  ],

  world: [
    {
      id: "nextcycle",
      nameKo: "다음 날",
      nameEn: "Next Day",
      command: 'TheWorld:PushEvent("ms_nextcycle")',
    },
    {
      id: "skip",
      nameKo: "N일 건너뛰기",
      nameEn: "Skip N Days",
      command: "c_skip({days})",
      params: [{ key: "days", label: "일수", defaultValue: "1" }],
    },
    {
      id: "setseason",
      nameKo: "시즌 변경",
      nameEn: "Change Season",
      command: 'TheWorld:PushEvent("ms_setseason", "{season}")',
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
    },
    {
      id: "stopprecipitation",
      nameKo: "비/눈 멈추기",
      nameEn: "Stop Rain/Snow",
      command: 'TheWorld:PushEvent("ms_forceprecipitation", false)',
    },
    {
      id: "lightning",
      nameKo: "번개 소환",
      nameEn: "Lightning Strike",
      command: 'TheWorld:PushEvent("ms_sendlightningstrike", ThePlayer:GetPosition())',
    },
    {
      id: "revealmap",
      nameKo: "지도 공개",
      nameEn: "Reveal Map",
      command: "minimap = TheSim:FindFirstEntityWithTag(\"minimap\") minimap.MiniMap:ShowArea(0,0,0,10000)",
    },
  ],

  server: [
    {
      id: "save",
      nameKo: "월드 저장",
      nameEn: "Save World",
      command: "c_save()",
    },
    {
      id: "rollback",
      nameKo: "롤백",
      nameEn: "Rollback",
      command: "c_rollback({count})",
      params: [{ key: "count", label: "횟수", defaultValue: "1" }],
    },
    {
      id: "shutdown",
      nameKo: "서버 종료",
      nameEn: "Shutdown",
      command: "c_shutdown(true)",
      descKo: "저장 후 종료",
      descEn: "Save & shutdown",
    },
    {
      id: "announce",
      nameKo: "서버 공지",
      nameEn: "Announce",
      command: 'c_announce("{msg}")',
      params: [{ key: "msg", label: "메시지", defaultValue: "Hello!" }],
    },
    {
      id: "listplayers",
      nameKo: "플레이어 목록",
      nameEn: "List Players",
      command: "c_listallplayers()",
    },
    {
      id: "regenerateworld",
      nameKo: "월드 재생성",
      nameEn: "Regenerate World",
      command: "c_regenerateworld()",
      descKo: "주의: 월드 초기화",
      descEn: "Warning: resets world",
    },
  ],

  debug: [
    {
      id: "gonext",
      nameKo: "엔티티로 텔포",
      nameEn: "Teleport to Entity",
      command: 'c_gonext("{prefab}")',
      params: [{ key: "prefab", label: "프리팹 ID", defaultValue: "pigking" }],
    },
    {
      id: "countprefabs",
      nameKo: "엔티티 수 세기",
      nameEn: "Count Entities",
      command: 'c_countprefabs("{prefab}")',
      params: [{ key: "prefab", label: "프리팹 ID", defaultValue: "beefalo" }],
    },
    {
      id: "removeall",
      nameKo: "엔티티 모두 제거",
      nameEn: "Remove All",
      command: 'c_removeall("{prefab}")',
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
    },
    {
      id: "maintainall",
      nameKo: "전체 내구도 복구",
      nameEn: "Repair All Items",
      command: "c_maintainall()",
      descKo: "인벤토리 전체 내구도 100%",
      descEn: "Repair all inventory items",
    },
  ],
};
