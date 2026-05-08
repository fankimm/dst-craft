"use client";

import { BackToHome } from "@/components/ui/BackToHome";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

interface Release {
  version: string;
  date: string;
  /** Developer-facing changes (not displayed) */
  dev: string[];
  /** User-facing changes (displayed) */
  changes: { ko: string[]; en: string[] };
}

const releases: Release[] = [
  {
    version: "0.21.23",
    date: "2026-05-08",
    dev: [
      "fix(skills): 냉각/발열 회로 본문 수치를 count로 곱해 누적값 표시 — 2개 끼면 \"체온이 40도 낮아지고\", \"부패 속도가 50% 감소한다\", 발열 2개면 \"생물이 죽는 속도가 20% 증가\". 게임 소스 확인된 additive linear 케이스만 매칭 (wx78_moduledefs.lua MINTEMPCHANGE_PER_MODULE × count, wx78_common.lua preserver = 1 + lean × PERISH_RATE_MODULELEAN, heat_activate maxDryingRate += 0.1)",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.22",
    date: "2026-05-08",
    dev: [
      "fix(skills): 둔화 저항 stat box 아이콘 → 돼지 등가방(piggyback.png). 초가속 회로(wx78module_movespeed2)에서 교체",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.21",
    date: "2026-05-08",
    dev: [
      "fix(skills): 소켓 prefix regex 중복 박힌 텍스트(\"소켓 3개 필요. 소켓 3개 필요. ...\" — heat 모듈) 1번만 strip되던 문제. +로 1번 이상 매칭하도록 수정 (Wx78StatusPanel + Wx78CircuitBoard 동일 적용)",
      "fix(skills): 동일 텍스트 dedupe — light(발광 회로) + light2(초발광 회로)가 모두 \"빛을 발산한다.\" 같은 효과 문구를 가져 카드 2장 표시되던 문제. text+skillId 키로 dedupe해 1장만 표시",
      "fix(skills): heat 모듈 buff 텍스트 count 분기 — \"빙결 저항 효과를 얻으며, 2개를 장착하면 빙결에 면역이 된다\" → 1개 장착 시 \"빙결 저항 효과를 얻는다\", 2개+ 장착 시 \"빙결에 면역이 된다\". simplifyConditionalBody 함수 도입",
      "refactor(skills): Detail 패널 contributor li 블록을 BreakdownRow 공용 컴포넌트로 추출 — movespeed/armor/slow/neg_aura/dapper/hunger_drain/vital 6곳에서 동일 구조 반복되던 것 정리 (사용자 피드백 #938)",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.20",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 현황 — alpha 회로 buff 머지 카드 3종. 모듈마다 한 줄씩 보이던 중복 제거하고 합산값 1장씩으로 압축",
      "  · 정신력 감소 오라 영향 (T1 학습): 곱연산 product (예: maxsanity1+maxsanity+bee → 0.8×0.5×0.5=0.2 → '−80%')",
      "  · 의복에 의한 정신력 회복 (T2 학습): 합연산 sum (예: 10%+30%+30% → '+70%')",
      "  · 허기 소모 감소 (T1/T2 변동): 곱연산 product. T2 우선 (T1 supersede)",
      "feat(skills): bee compound 텍스트(\"의복 정신력 회복 25% 증가하고, 실드 ...\")에서 dapper 부분 자동 분리. 실드 메커닉만 별도 row로 유지",
      "feat(skills): 합산 카드 클릭 시 DetailPanel breakdown — 출처 스킬, 스택 방식(곱/합연산), 기여 모듈별 per-module % 표시",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.19",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 stat box 아이콘을 게임 PNG로 교체 — 방어력=대리석 갑옷(armormarble), 이속=워킹 케인(cane), 둔화 저항=초가속 회로(wx78module_movespeed2). lucide 아이콘(Shield/Zap/Snowflake) 제거, 일관된 인게임 비주얼",
      "feat(skills): vital 합산 카드(\"최대 체력이 240 증가한다.\" 류) 카드 리스트에서 제거 — 헤더의 stat box(체/허/정)에서 이미 표시되고 있어 중복. compound 패러그래프(허기 소모 -20%, bee 회복 효과 등)는 vital 부분만 잘라낸 본문으로 그대로 별도 row 표시",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.18",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 현황 패널 — 방어력/이동 속도/둔화 저항 stat row 추가 (vital row 아래). 카드 리스트에서 해당 행 제거 → 헤더 stat box로만 표시. 각 box 클릭 시 DetailPanel breakdown",
      "feat(skills): 둔화 저항 합산 — 게임 메커닉 (wx78_common.lua COMMON_ModifySpeedMultiplier): chip 1개당 25% 둔화 회복, 4개 이상 100% 무효. Beta Tinkering II 학습 시에만 활성. 차감(−) 표시",
      "fix(skills): VitalStat 컴포넌트 — iconSrc(이미지) 또는 iconNode(ReactNode) 둘 다 받도록 확장. display prop으로 포맷된 표시값(\"+12.5%\", \"−50%\") 직접 전달 가능",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.17",
    date: "2026-05-08",
    dev: [
      "fix(skills): WX-78 합산 카드(이동속도/방어력) 클릭 시 DetailPanel 안 열리던 버그. SelectedDetail kind에 movespeed/armor 추가, 각 분기 렌더링 — 기여 모듈 + chip 합/lookup table / pct 합 + 출처 스킬 표시",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.16",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 현황 패널 — 이동속도 합산 카드. movespeed/movespeed2 모듈 본문(\"1개=25%, 2개=40%, 3개=50%\" lookup table)을 현재 chip 합계에 해당하는 단일 값으로 압축 표시 (예: 1 chip → \"이동 속도가 25% 증가한다.\"). TUNING.MOVESPEED_CHIPBOOSTS=[0,0.25,0.4,0.5] 인덱스 lookup",
      "feat(skills): WX-78 현황 패널 — 방어력 buff 합산. maxhealth(2.5%) + maxhealth2(5%) + Tinkering II 학습 시 7.5% 합산 카드 1장으로. additive sourcemodifierlist 메커닉 기준",
      "note: 정신력 감소 오라 영향(maxsanity1 -20%, maxsanity -50%, bee -50%)은 multiplicative 스택 메커닉(SourceModifierList product)이라 단순 합산 못함 → 이번엔 per-module 표시 유지. 추후 product 합산 카드로 전환 검토",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.15",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 현황 패널 UI 회로판 상세와 통일 — RowSection(활성 효과/스킬 강화 효과/회로 시스템 강화 구분) 제거, 모든 효과 카드를 회로판 상세 ScrapbookEffects와 동일한 패러그래프 카드 스타일로",
      "feat(skills): EffectCard 공용 컴포넌트로 추출 — Wx78CircuitBoard.ScrapbookEffects + Wx78StatusPanel 양쪽에서 재사용. 스킬 학습 헤더(점 인디케이터 + 학습됨/미학습) 동일",
      "feat(skills): 현황 패널 vital(체/허/정) 카드 합산 — 같은 vital을 올리는 회로 여러 개면 '최대 N이 V 증가한다.' 1장으로 합쳐 표시 (예: maxsanity1 +40 + maxsanity +100 → '최대 정신력이 140 증가한다.'). compound 패러그래프(maxhunger의 '최대 허기 +100 + 허기 소모 -20%', bee의 '+100 정신력 + 회복' 등)는 vital 부분만 분리하여 합산하고 나머지는 그대로",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.14",
    date: "2026-05-08",
    dev: [
      "fix(data): 연산 회로(maxsanity1) 정신력 +100 → +40 재보정 — 한글 ko.po의 '+100' 표기는 인게임 번역 버그였음. 영문/실제 코드(tuning.lua, scrapbook 영문) 모두 +40. 0.21.13에서 한글 표기 따라간 것을 영문/코드 기준으로 되돌림. 스킬트리 회로판/현황의 maxSanity 기여도 + 제작탭(ItemStatsPanel)의 specialinfo_ko 표시 모두 +40으로 일치",
      "feat(scrapbook): convert-scrapbook.py에 KO_TRANSLATION_FIXES dict 추가 — ko.po의 알려진 번역 버그를 변환 단계에서 자동 보정 (현재 maxsanity1 한 항목)",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.13",
    date: "2026-05-08",
    dev: [
      "feat(DetailPanel): hideClose prop 추가 — WX-78 상세 패널에선 X 닫기 아이콘 숨김 (오버레이 클릭으로 닫음)",
      "fix(skills): vital DetailPanel 'WX' 텍스트 박스 → wx78 캐릭터 portrait 아이콘으로 변경",
      "fix(data): 연산 회로(maxsanity1) 정신력 +40 → +100으로 보정 — 한글 인게임 스크랩북·제작탭 표기와 일치 (영문은 +40으로 mod 번역 차이) [0.21.14에서 되돌림 — 한글이 버그]",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.12",
    date: "2026-05-08",
    dev: [
      "fix(skills): 회로 타입 라벨 일관성 — TYPE_COLORS/TYPE_LABEL/typeLabel을 wx78-circuits.ts로 이동, 두 컴포넌트 공유. 현황 DetailPanel에서 raw 'alpha'/'ALPHA'로 보이던 부분도 typeLabel(locale)로 통일 (한글: 알파, 영문: Alpha)",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.11",
    date: "2026-05-08",
    dev: [
      "fix(skills): 회로판/현황 푸터 위치 — 컨텐츠가 짧을 때 푸터가 화면 중간에 뜨던 문제. 컨테이너에 min-h-full + flex flex-col, 푸터에 mt-auto 적용해 항상 화면 하단",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.10",
    date: "2026-05-08",
    dev: [
      "fix(skills): 현황 패널 row 텍스트를 회로판 상세 ScrapbookEffects의 paragraph 그대로 사용 (인게임 한국어)",
      "fix(skills): 회로 시스템 강화 row(분리/충전/슬롯)는 스킬트리 desc 그대로 사용 (예: '모든 회로 바에 슬롯이 1개 추가됩니다')",
      "feat(skills): 최대 체력/허기/정신력에 WX-78 기본값 100/100/100 깔고 회로 합산 — Detail panel에 'WX-78 기본 100 + 회로별 +N' 구성 표시",
      "feat(skills): 현황 row 클릭 시 DetailPanel — 출처 회로(이미지+이름+×N+타입)와 스킬 buff 표시",
      "refactor(skills): 활성 효과 vs 스킬 강화 효과 두 섹션으로 분리",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.9",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 현황 패널 대대적 리팩터 — 회로별 카드 섹션 폐기, 모든 stat/cap을 row로 통일. 각 row 클릭 시 DetailPanel에 기여 회로·스킬 표시",
      "fix(BetaBadge): 좌상단 사선 띠 폐기, 탭바 첫 자리(제작 왼쪽)에 sticky-left BETA 인디케이터 추가",
      "fix(skills): 회로 상세의 '제작탭에서 자세히 보기' 버튼을 한 줄 → 헤더 우측 ExternalLink 아이콘만",
      "fix(skills): 회로판 카드 컨테이너에 px-3 추가 (제작탭 패턴)",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.21.8",
    date: "2026-05-08",
    dev: [
      "fix(skills): 회로 카드/상세의 타입 색상 배경 제거 (사용자 요청)",
      "feat(devmenu): '현황: 모든 문구 표시' 토글 추가 — 모든 회로 +1 + 모든 회로 스킬 학습 가정. 콘텐츠 검토용",
      "feat(skills): 현황판이 dev 모드 시 amber 배너 + 모든 항목·캡션 강제 표시",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.7",
    date: "2026-05-08",
    dev: [
      "feat(skills): 스킬 공유 URL에 회로 장착 상태 포함 — encodeCircuits/decodeCircuits, 'c' 파라미터로 base64url JSON",
      "refactor(skills): useWx78Circuits hook을 SkillSimulatorApp으로 lift up — share/import에서 회로 접근 가능",
      "feat(skills): 회로 상세 패널에 '제작탭에서 자세히 보기' 버튼 추가 — onViewItem prop으로 ItemDetail 점프",
      "feat(skills): 현황판 메인 능력치(체력/허기/정신력)를 요리 StatBox 스타일로 — '+' 기호 제거 (최대 스탯 인지 명확)",
      "feat(skills): 현황판에 '장착 회로 효과' 섹션 추가 — 각 회로별 ScrapbookEffects 카드, 학습 스킬 반영",
      "fix(skills): 회로판 상세의 +/− 버튼을 고정폭 stepper로 변경 — 슬롯 부족 텍스트로 위치가 흔들리던 문제 해결, 연속 탭 가능",
      "fix(BetaBadge): 사선 띠 박스/글자 더 크게 (140×140, 13px font-black, tracking-[0.22em])",
      "fix(skills): 회로판/현황 컨테이너 max-width를 max-w-2xl로 통일 (스킬트리와 일치)",
      "revert(SupportPill): 패딩/사이즈 원래대로 복원",
    ],
    changes: {
      ko: [
        "WX-78 빌드 공유 시 장착 회로도 함께 공유됨 (URL ?c= 파라미터)",
        "회로 상세에서 '제작탭에서 자세히 보기' 버튼으로 한 번에 이동",
        "현황판 체력/허기/정신력 표시를 요리 상세 스타일로 통일 — 회로로 늘어나는 최대치를 한눈에",
        "현황판에 장착 회로별 상세 효과(스크랩북) 표시 — 학습한 스킬에 따라 강화 효과 진하게",
        "회로 상세의 +/− 버튼이 슬롯 상태 따라 위치 흔들리던 문제 수정",
        "베타 사선 띠 더 크고 진하게",
      ],
      en: [
        "Sharing a WX-78 build now includes equipped circuits (?c= URL param)",
        "Circuit details now have a 'View in Crafting Tab' jump button",
        "Status panel HP/Hunger/Sanity display now matches cooking-detail StatBox style — clearer view of max stat increase",
        "Status panel now lists per-circuit scrapbook effects, dimming buffs whose skill isn't learned",
        "Fixed circuit +/− buttons shifting position when slots are full",
        "Beta corner ribbon enlarged and bolder",
      ],
    },
  },
  {
    version: "0.21.6",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 서브탭 아이콘 교체 — 스킬트리(skill_eye), 회로판(wx78_moduleremover, 회로 추출기), 현황(scandata)",
      "feat(skills): 스크랩북 텍스트 가공 표시 — 첫 단락(회로판 호환·스캔) 제거, 둘째 단락에서 '소켓 N개 필요' 제거. 스킬 강화 단락은 학습 여부에 따라 정상/딤 처리 + indicator",
      "fix(skills): 회로 카드 카운트 뱃지 잘림 수정 — 이미지 박스 overflow-hidden 제거 + z-index",
      "fix(BetaBadge): 사선 띠를 더 진하게 (amber-500/85, ring 추가)",
      "fix(Footer): 푸터 압축 — SupportPill 패딩 축소 (py-1.5 → py-0.5, pt-1 → pt-0.5)",
    ],
    changes: {
      ko: [
        "WX-78 서브탭 아이콘 정정 (스킬트리/회로 추출기/생체 데이터)",
        "회로 상세 효과 표시 정리 — 중복되는 회로판 호환·소켓 정보 제거. 스킬 강화 효과는 학습 여부에 따라 진하게/흐리게 표시",
        "회로 카드 우하단 카운트 뱃지가 잘리던 문제 수정",
        "베타 사선 띠를 더 잘 보이게 진하게 변경",
        "푸터 두께 축소",
      ],
      en: [
        "Corrected WX-78 sub-tab icons (skill, module remover, scandata)",
        "Cleaned up circuit effect display — removed redundant board/socket info. Skill-buffed effects now dim when the buff skill isn't learned",
        "Fixed clipped count badge on circuit cards",
        "Made beta corner ribbon more visible",
        "Tightened footer padding",
      ],
    },
  },
  {
    version: "0.21.5",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 회로 상세 패널을 인게임 스크랩북 텍스트(specialinfo_ko/en)로 대체 — 우리가 다듬던 caps/buffs.caps 자리에 인게임 원문 통째 표시",
      "feat(BetaBadge): 베타 뱃지를 화면 좌상단 사선 띠로 변경 — 반투명 + pointer-events:none (터치 방해 X). Footer의 작은 뱃지 제거",
      "refactor(BetaBadge): AppShell에 1회 마운트하도록 위치 이동",
    ],
    changes: {
      ko: [
        "WX-78 회로 상세 패널의 효과 설명을 인게임 스크랩북 한국어 텍스트로 교체 — 인게임과 100% 일치",
        "베타 사이트 표시를 좌상단 사선 띠로 변경 (반투명 — 터치 방해 없음)",
      ],
      en: [
        "Replaced WX-78 circuit detail descriptions with in-game scrapbook text — matches the game exactly",
        "Beta site indicator is now a translucent diagonal corner ribbon (no touch interference)",
      ],
    },
  },
  {
    version: "0.21.4",
    date: "2026-05-08",
    dev: [
      "fix(skills): WX-78 회로 능력 텍스트 자연스럽게 다듬음 — 음의 정신력 오라/시계태엽/회전기/광전자/음악상자 등 직역 톤 제거, 인게임 동작 기준으로 재작성",
      "feat(data): SCAN_PREFAB_KO/EN 매핑 추가 — 스캔 대상 prefab(spider, butterfly...)을 ko.po STRINGS.NAMES 기반 인게임 한글/영문명으로 표시",
      "feat(skills): WX-78 서브탭에 아이콘 — 스킬트리(Brain), 회로판(scanner_item), 현황(scandata)",
      "fix(skills): 회로판/현황 탭에 Footer 추가 — FloatingSupportPill이 다른 페이지처럼 푸터로 docking",
      "fix(skills): 회로 카드 카운트 뱃지 UI를 ItemSlot 표준에 맞춤 (bottom-right + surface-hover 배경)",
      "fix(skills): 회로 라벨 '스캔 출처' → '스캔으로 획득'",
    ],
    changes: {
      ko: [
        "WX-78 회로 효과 설명을 인게임 동작 기준으로 자연스럽게 재작성 — 시계태엽 친화/광전자 시야/회전기 도구/음악상자 인어 동료화 등 표현 정확도 개선",
        "회로의 스캔 대상 동물명을 인게임 한글명으로 표시 (spider → 거미 등)",
        "회로판/현황 탭에 캐릭터 페이지처럼 후원 필이 부드럽게 흡수되는 푸터 추가",
        "WX-78 서브탭에 아이콘 추가",
      ],
      en: [
        "Rewrote WX-78 circuit effect descriptions to match in-game behavior more naturally",
        "Scanned-from creature names now use in-game localized names",
        "Circuit Board and Status tabs now dock the floating support pill into the footer",
        "Added icons to WX-78 sub-tabs",
      ],
    },
  },
  {
    version: "0.21.3",
    date: "2026-05-08",
    dev: [
      "fix(skills): WX-78 회로판 바 색상을 인게임에 맞춤 — 알파=빨강, 베타=파랑, 감마=노랑 (기존: 노랑/파랑/보라)",
      "fix(skills): 회로판/현황 탭 하단 클리핑 추가 수정 — safe-area-inset-bottom + 5rem 패딩으로 SupportPill·홈 인디케이터에 가려지지 않도록",
    ],
    changes: {
      ko: [
        "WX-78 회로판 바 색상을 인게임과 일치시킴 — 알파(빨강) / 베타(파랑) / 감마(노랑)",
        "핸드폰에서 회로판 하단의 마지막 카드가 가려지던 문제 수정",
      ],
      en: [
        "Match in-game colors for WX-78 circuit bars — Alpha (red) / Beta (blue) / Gamma (yellow)",
        "Fixed last card being clipped at the bottom on mobile",
      ],
    },
  },
  {
    version: "0.21.2",
    date: "2026-05-08",
    dev: [
      "fix(skills): WX-78 슬롯 바 시각화 — 같은 모듈에 속한 슬롯을 한 묶음으로 표시 (1칸짜리 2개 vs 2칸짜리 1개 구분). 모듈 묶음은 한 둥근 사각형 + 내부 분할선으로 N칸을 구분",
    ],
    changes: {
      ko: [
        "WX-78 회로판 슬롯 바에서 1칸 회로 2개와 2칸 회로 1개가 구분되지 않던 문제 수정 — 같은 회로의 슬롯은 한 덩어리로 묶이고, 칸 수는 안쪽 분할선으로 표시",
      ],
      en: [
        "Fixed WX-78 slot bar visualization — slots belonging to the same module are now grouped as one block with internal dividers, distinguishing two 1-slot circuits from one 2-slot circuit",
      ],
    },
  },
  {
    version: "0.21.1",
    date: "2026-05-08",
    dev: [
      "fix(skills): WX-78 회로판 슬롯 시스템을 인게임에 맞게 수정 — 알파/베타/감마 각각 6슬롯(스킬 시 7) 별도 운용 (기존: 통합 6슬롯)",
      "feat(skills): 회로판 레이아웃 그리드 + DetailPanel(bottom sheet)로 재설계 — 카드 클릭 시 효과/스킬강화/스캔출처/장착컨트롤 표시. 한 줄 한 카드 → 4열 그리드",
      "feat(skills): 슬롯 바를 알파/베타/감마 3개로 분리 표시 — 각 바마다 색상 구분(노랑/파랑/보라), 사용/총 슬롯 별도",
      "fix(skills): 회로판/현황 탭 하단 클리핑 수정 — flex-1 min-h-0 적용",
    ],
    changes: {
      ko: [
        "WX-78 회로판 인게임 동작에 맞게 수정 — 알파/베타/감마 회로가 각각 별도 6슬롯(스킬 시 7)을 사용",
        "회로판을 그리드 레이아웃 + 상세 패널 방식으로 변경 — 카드 누르면 효과·스킬 강화·스캔 출처를 자세히 보고 그 자리에서 장착",
        "회로판/현황 탭 하단이 잘리던 문제 수정",
      ],
      en: [
        "WX-78 Circuit Board fixed to match in-game: Alpha/Beta/Gamma each have 6 slots (7 with slot upgrade) — separate, not shared",
        "Circuit Board redesigned as grid layout + detail bottom sheet — tap a card to see effects, skill buffs, scan source, and equip in place",
        "Fixed bottom clipping on Circuit Board / Status tabs",
      ],
    },
  },
  {
    version: "0.21.0",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 스킬트리에 서브탭 3개 추가 — 스킬트리 / 회로판 / 현황",
      "feat(data): src/data/wx78-circuits.ts — 23개 회로 모듈 정의 (인게임 wx78_moduledefs.lua + tuning.lua 기반, 알파/베타/감마 분류, slots/effects/buffs 구조화)",
      "feat(skills): Wx78CircuitBoard 컴포넌트 — 슬롯 바(6/7) + 모듈 카탈로그(타입별 그룹) + 장착/해제 (+/−) + slot_1 스킬 학습 시 슬롯 +1 자동 반영",
      "feat(skills): Wx78StatusPanel 컴포넌트 — 장착 회로와 학습 스킬을 합산해 체력/정신력/허기/이동/온도/유틸/전투 카테고리별 누적 효과 표시. 빈 카테고리는 숨김",
      "feat(hooks): useWx78Circuits — 회로 장착 상태 관리, localStorage 'dst:wx78-circuits' 영속화 (다중 장착 지원)",
    ],
    changes: {
      ko: [
        "WX-78 스킬트리에 회로판/현황 서브탭 추가 — 회로(모듈) 23종을 슬롯에 직접 장착·해제하고, 스킬과 합산된 능력치 변화를 한눈에 확인할 수 있습니다",
      ],
      en: [
        "Added Circuit Board and Status sub-tabs to WX-78 skill tree — equip 23 circuits in slots, see combined skill+circuit effects at a glance",
      ],
    },
  },
  {
    version: "0.20.4",
    date: "2026-05-08",
    dev: [
      "fix(skill-tree): WX-78 details 인게임 코드 대조 검증 후 7건 수정 — alphabuffs_2 빈부스터 dapperness +25→+30%, Hardy 'combat damage' → 'damage taken' 의미 명확화, betabuffs_1 Thermal +50% → ×2 (1개)/면역(2개+), Refrigerant 화염·과열 → 화염 피해만, Chorusbox 버니맨 → 인어(merm), Rangebooster 스캐너 수치 0.5/0.75 → 0.65/0.8, betabuffs_2 Electrification 16/14/12 → 약 15/12/10회",
      "docs(analyze): learnings.md 5개 패턴 추가 — BASE vs SKILL 효과 분리, 코드 태그 vs 위키 표기, skipskillcbsetup 패턴, 합산/곱연산/오버라이드 누적 방식 분류",
    ],
    changes: {
      ko: [
        "WX-78 회로 제조 스킬 details 정확도 개선 — 빈부스터 정신력 회복 장비 효율(+25%→+30%), 발열/냉각 회로 효과 표기, 음악상자 자동 동료화 대상(버니맨→인어) 등 인게임 코드와 다르던 7건 수정",
      ],
      en: [
        "Improved accuracy of WX-78 circuit tinkering skill details — fixed 7 mismatches with in-game code, including Beanbooster sanity-regen effectiveness (+25%→+30%), Thermal/Refrigerant effects, and Chorusbox auto-recruit target (bunnymen→merms)",
      ],
    },
  },
  {
    version: "0.20.3",
    date: "2026-05-07",
    dev: [
      "feat(settings): 게임 데이터 기준 버전 표시 — DST Release 번호 + 데이터 갱신일을 설정 페이지 하단에 표시",
      "feat(data): src/data/game-version.ts 추가 — Steam 바이너리에서 추출한 릴리즈 번호/빌드ID/갱신일 관리",
    ],
    changes: {
      ko: [
        "설정 페이지에 게임 데이터 기준 버전(Release 번호) 표시 추가",
      ],
      en: [
        "Added game data source version (Release number) display on settings page",
      ],
    },
  },
  {
    version: "0.20.2",
    date: "2026-05-07",
    dev: [
      "fix(deploy): deploy-frontend.sh — 새 릴리즈에 이전 릴리즈의 _next/static/ 을 cp -Rn 으로 병합하여 배포 후 구 chunk 404 방지",
      "fix(layout): ChunkLoadError / Failed to load 감지 시 세션당 1회 자동 새로고침 (sessionStorage 'dst:chunk-retry' 플래그) — error + unhandledrejection 이벤트 양쪽 처리",
    ],
    changes: {
      ko: [
        "배포 직후 간헐적으로 페이지가 깨지던 문제(ChunkLoadError) 수정 — 자동 새로고침으로 즉시 복구",
      ],
      en: [
        "Fixed intermittent page breakage (ChunkLoadError) after deployments — auto-recovers with a seamless reload",
      ],
    },
  },
  {
    version: "0.20.1",
    date: "2026-05-06",
    dev: [
      "fix(seo/ItemPageContent): /item/[slug] 페이지의 '제작 가이드 열기' CTA 링크 수정 — 기존 href=`/?item=${id}`가 cat 파라미터 누락으로 useCraftingState에서 showCategoryGrid=true로 떨어져 홈(카테고리 그리드) 위에 detail panel이 뜨던 형태였음. 이제 `?cat=${item.category[0]||'tools'}&item=${id}` (캐릭터 전용은 char까지 포함)로 보내 해당 카테고리 아이템 리스트 뷰 + 상세 패널이 함께 열리도록 수정. 한국어 라우트(/ko)에도 routePrefix 적용",
      "docs(README): dstcraft.com 라이브 링크 추가",
    ],
    changes: {
      ko: [
        "검색 결과로 들어온 아이템 SEO 페이지(예: /item/wx78module-nightvision)에서 '제작 가이드 열기' 버튼이 홈으로만 이동하던 문제 수정 — 이제 해당 아이템이 속한 카테고리 화면에서 상세 패널이 함께 열림",
      ],
      en: [
        "Fixed the 'Open Crafting Guide' button on item SEO pages (e.g. /item/wx78module-nightvision) landing on the home grid — it now opens the item's detail panel inside the matching category view",
      ],
    },
  },
  {
    version: "0.20.0",
    date: "2026-05-02",
    dev: [
      "feat(feedback): 관리자 답변 기능 — PATCH /feedback에 reply 필드 추가, GET에 reply 포함, dst:feedback:reply Redis 해시 사용",
      "feat(feedback): GET /feedback/mine 공개 엔드포인트 — localStorage에 저장된 피드백 ID로 자신의 피드백 상태/답변 조회",
      "feat(feedback): POST /feedback에서 ID 반환 → 클라이언트가 localStorage에 저장",
      "feat(settings): '내 피드백' 섹션 — 제출한 피드백의 상태(확인 중/반영됨/보류/미반영)와 개발자 답변 표시",
      "fix(feedback): 복사 버튼을 IP 복사에서 내용 복사로 변경, 위치 이동",
    ],
    changes: {
      ko: [
        "피드백 답변 기능 추가: 보내신 피드백에 개발자 답변이 달리면 설정 페이지에서 확인할 수 있습니다",
      ],
      en: [
        "Feedback reply feature: developer replies to your feedback are now visible in the settings page",
      ],
    },
  },
  {
    version: "0.19.5",
    date: "2026-05-01",
    dev: [
      "feat(skill-tree): '불러오기' 버튼 추가 — 클립보드에서 공유 링크를 읽어 빌드 적용. 다른 캐릭터 빌드면 자동 전환",
    ],
    changes: {
      ko: [
        "스킬트리 '불러오기' 버튼 추가: 복사한 공유 링크를 클립보드에서 바로 불러올 수 있습니다",
      ],
      en: [
        "Skill tree 'Import' button: paste a shared build link from clipboard to load it instantly",
      ],
    },
  },
  {
    version: "0.19.4",
    date: "2026-05-01",
    dev: [
      "fix(skill-tree): 공유 링크(?b=...)로 진입 시 localStorage 데이터가 우선 로드되어 공유된 빌드가 무시되는 버그 수정 — useSkillTree에 initialSkills 파라미터 추가, URL 빌드가 localStorage보다 우선 적용되도록 경쟁 상태 제거",
    ],
    changes: {
      ko: [
        "스킬트리 공유 링크 버그 수정: 공유 링크로 접속 시 상대방의 빌드 대신 내 로컬 데이터가 표시되던 문제 해결",
      ],
      en: [
        "Skill tree share link fix: shared builds now display correctly instead of showing the viewer's local data",
      ],
    },
  },
  {
    version: "0.19.3",
    date: "2026-05-01",
    dev: [
      "fix(cookpot): 모바일에서 마지막 재료 터치 시 결과 카드의 '상세보기'가 자동 클릭되는 ghost-click 버그 수정 — ResultCard 마운트 후 350ms 동안 pointer interaction 비활성화",
    ],
    changes: {
      ko: [
        "요리솥 시뮬레이터: 모바일에서 마지막 재료 선택 시 요리 상세보기가 자동으로 열리던 버그 수정",
      ],
      en: [
        "Cooking simulator: fixed a mobile bug where selecting the last ingredient would automatically open recipe details",
      ],
    },
  },
  {
    version: "0.19.2",
    date: "2026-05-01",
    dev: [
      "feat(skill-tree/wx78): 게임 업데이트 반영 — wx78_scoutdrone_2(현장 조사 II) 삭제, wx78_extradronerange(Signal Booster) 신규 스킬 추가. scoutdrone_1의 connects 제거. 아이콘은 임시(scoutdrone_2 재사용), ko.po 번역 미반영 상태(한글모드 업데이트 대기)",
      "refactor(skill-tree): boss_kill + excludes 복합 잠금을 boss_kill + no_opposing_faction 개별 노드로 분리 (willow, walter). LockCondition 타입에서 excludes 필드 제거",
      "feat(skill-tree/ui): 같은 스킬 노드에 걸린 잠금 조건을 그룹화하여 한 줄에 표시 (LockConditionPill 컴포넌트). 단일 잠금은 기존 SkillLockIndicator 유지",
      "fix(skill-tree): isLockSatisfied에서 boss_kill 타입의 excludes 체크 제거 — 별도 no_opposing_faction 노드가 담당",
    ],
    changes: {
      ko: [
        "WX-78 스킬트리 게임 업데이트 반영 — Signal Booster 신규 스킬 추가",
        "스킬트리 잠금 조건 UI 개선 — 여러 잠금이 한 줄에 깔끔하게 표시",
      ],
      en: [
        "WX-78 skill tree updated — new Signal Booster skill added",
        "Skill tree lock UI improved — multiple lock conditions grouped in one row",
      ],
    },
  },
  {
    version: "0.19.1",
    date: "2026-04-30",
    dev: [
      "feat(seo/ko): /ko 한국어 전용 홈페이지 생성 (src/app/ko/page.tsx) — 한국어 title/description/keywords + FAQPage 구조화 데이터 (한국어 Q&A 2개)",
      "feat(seo): layout.tsx keywords에 한국어 키워드 12개 추가 — '굶지마 제작', '굶지마 제작법', '굶지마 투게더', '굶지마 요리솥', 'DST 제작', '돈스타브 제작' 등",
      "fix(seo): hreflang ko가 '/' (영문 홈)을 가리키던 것을 '/ko'로 수정",
      "feat(sitemap): /ko 홈페이지를 sitemap에 priority 0.9로 추가",
    ],
    changes: {
      ko: [
        "한국어 검색 노출 강화: '굶지마 제작', '굶지마 제작법' 등 한국어 검색어로 구글 노출을 위한 전용 홈페이지(/ko) 추가",
      ],
      en: [
        "Korean SEO: added dedicated Korean homepage (/ko) with localized metadata and keywords for better Google visibility",
      ],
    },
  },
  {
    version: "0.19.0",
    date: "2026-04-29",
    dev: [
      "fix(seo/layout): src/app/layout.tsx의 글로벌 FAQPage JSON-LD 제거 — 모든 상세 페이지(character/item/boss/food/skill-tree)가 자체 FAQPage를 출력하는데 layout 쪽까지 포함돼 페이지당 FAQPage 2개로 검출. Google Search Console에서 'FAQPage 입력란이 중복' 에러로 32개 색인 페이지가 'URL이 Google에 등록되어 있지만 문제가 있음' 표시되며 리치 결과 노출 차단됐음. 글로벌 FAQ는 홈(src/app/page.tsx)으로 이동",
      "feat(slug): 새 SEO slug 체계 도입 (src/lib/slug.ts) — 아이템/음식/보스의 URL slug를 게임 내부 prefab ID에서 영문 name 기반으로 변환 (hambat→ham-bat, nightsword→dark-sword, beequeen→bee-queen, lighter→willows-lighter 등). nameToSlug 유틸 + 양방향 인덱스(idToSlug, slugToId, legacySlugToId) + 중복 시 ID 접미사 fallback",
      "refactor(seo): ItemPageContent / FoodPageContent / BossPageContent의 로컬 slugToId/idToSlug 제거하고 resolveItemSlug / canonicalForItem 등 신규 유틸 사용. canonical URL은 항상 새 slug 기준으로 생성 (legacy 페이지에서도 새 slug를 가리킴)",
      "feat(routes): item/food/boss [slug] dynamic route(en + ko = 6개)의 generateStaticParams가 itemSlugs.allSlugs로 새 slug + 레거시 slug 양쪽 다 정적 생성 — 외부 링크가 옛 URL로 들어와도 200 응답 유지",
      "refactor(sitemap): src/app/sitemap.ts가 itemSlugs/foodSlugs/bossSlugs.idToSlug.values()로 새 slug만 노출 — 레거시 slug는 sitemap에서 제외해 Google이 새 slug로 색인 우선",
      "refactor(internal-links): SeoFooterLinks / BrowseContent / CookpotContent / SkillTreePageContent / CharacterPageContent의 모든 /item/* /food/* /boss/* 링크를 canonicalForItem/Food/Boss로 새 slug 사용",
      "근거: GSC URL 검사로 캐릭터 페이지(wilson 등) 'FAQPage 중복' 에러 직접 확인 + 1,050개 미색인 페이지 진단 과정에서 검색어와 slug 토큰 분리 안 되는 SEO 약점 발견. Static export(GitHub Pages)라 next.config.ts redirects 사용 불가 → 양쪽 slug 정적 생성 + canonical로 점진 이전",
    ],
    changes: {
      ko: [
        "검색엔진 노출 개선: 모든 상세 페이지에 FAQ 구조화 데이터(FAQPage)가 중복 출력되던 버그 수정 — Google이 '리치 결과 표시 거부' 처리하던 32개 페이지가 정상화 진행 예정",
        "URL 가독성 개선: 아이템·보스·음식 페이지 주소가 게임 내부 ID(hambat, nightsword)에서 검색에 친숙한 영문 표기(ham-bat, dark-sword, bee-queen)로 변경. 옛 주소로 들어와도 그대로 작동하므로 기존 공유 링크는 깨지지 않음",
      ],
      en: [
        "Search engine fix: removed duplicate FAQPage structured data on all detail pages — 32 pages that Google flagged as 'rich result blocked' should recover",
        "Friendlier URLs: item/boss/food pages now use English-name slugs (ham-bat, dark-sword, bee-queen) instead of internal game IDs (hambat, nightsword, beequeen). Old links still work, so previously shared URLs don't break",
      ],
    },
  },
  {
    version: "0.18.3",
    date: "2026-04-29",
    dev: [
      "fix(use-crafting-state, use-cooking-state): SSR_DEFAULT 초기 state + mount-time useEffect URL 동기화 패턴을 useState lazy initializer로 교체 — 클라이언트 첫 렌더 시 즉시 window.location.search를 파싱하여 urlState 구성. 결과적으로 hydration 직후 한 번 더 리렌더가 일어나는 step이 사라져 deep-link(/?cat=structures, /?item=foo 등) 첫 진입 시 home(카테고리 그리드)이 잠깐 떴다가 detail로 바뀌는 플리커 제거. popstate/pageshow/dst-tab-switch 리스너는 그대로 유지.",
      "근거: 첫 붙여넣기에서 home 화면만 보이고 새로고침해야 detail이 뜨는 사용자 보고. JS 번들 캐시되지 않은 cold-load에서 useEffect 실행 지연 → home view가 길게 노출되어 사용자가 '동작 안 함'으로 인식. 정적 HTML의 첫 페인트 자체는 SSR/dynamic 렌더링 없이는 변경 불가하므로 hydration 이후 단계만 단축.",
      "chore(skill): /push 슬래시 스킬 추가 (.claude/skills/push/SKILL.md) — 커밋+main 푸시 워크플로우 자동화. 변경 분류 → 버전 bump → 릴리즈노트 갱신 → 오답노트 점검 → 명시적 git add → push 절차 명문화.",
    ],
    changes: {
      ko: [
        "공유 링크(예: 카테고리/아이템 딥링크)를 처음 붙여넣고 열 때 홈 화면이 잠깐 보였다가 상세 패널로 넘어가던 문제 수정 — 이제 첫 진입과 새로고침 동작이 동일",
      ],
      en: [
        "Fixed deep-link URLs (category/item shares) flashing the home view before opening the detail panel on first paste — first-paste and refresh now behave identically",
      ],
    },
  },
  {
    version: "0.18.2",
    date: "2026-04-28",
    dev: [
      "fix(cookpot-ingredients): batnose의 dryable 플래그 제거 — 인게임 prefabs/meats.lua의 BATNOSE_DRYABLE_DATA.product='smallmeat_dried'라 박쥐 콧구멍을 말리면 작은 육포가 나옴(별도 prefab 없음). 존재하지 않는 batnose_dried.png 참조로 이미지 깨졌던 문제 해결",
      "docs(mistakes): cooking.lua의 _dried/_cooked 가상 재료를 실제 prefab으로 착각한 패턴 오답노트 추가",
    ],
    changes: {
      ko: [
        "크록팟 시뮬레이터에서 '말린 벌거숭이 콧구멍' 이미지가 깨지던 문제 수정 — 원래 인게임에서도 박쥐 콧구멍을 말리면 '작은 육포'가 되므로 중복 항목 제거",
      ],
      en: [
        "Crock Pot simulator: removed the broken 'dried batnose' entry — drying a batnose actually produces small jerky in-game, so the duplicate ingredient is gone",
      ],
    },
  },
  {
    version: "0.18.1",
    date: "2026-04-28",
    dev: [
      "feat(admin/feedback): DELETE /feedback?id=<id> 엔드포인트 추가 — 어드민 권한 체크 후 dst:feedback 리스트에서 LREM + dst:feedback:status 해시에서 HDEL",
      "feat(AdminFeedbackSection): DetailPanel에 삭제 버튼 추가 — 2단계 확인(첫 클릭 시 '정말 삭제? (다시 클릭)' 표시 후 재클릭 시 실행), 삭제 성공 시 패널 닫고 목록에서 제거",
      "feat(analytics): deleteFeedback(token, id) 클라이언트 함수 추가",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.18.0",
    date: "2026-04-28",
    dev: [
      "feat(seo): /ko/... prefix 라우트로 한국어 SEO 페이지 추가 — food/boss/item/character/skill-tree dynamic 5종 + browse/cookpot/characters static 3종",
      "feat(seo-text): 한글 SEO 텍스트 생성기 5종 추가 (generateFoodSeoTextKo, generateBossSeoTextKo, generateItemSeoTextKo, generateCharacterSeoTextKo, generateSkillTreeSeoTextKo) — 한글 조사 자동 처리(받침 기반 은/는, 이/가, 을/를)",
      "refactor: 기존 영어 SEO 페이지 본문을 src/components/seo/*Content.tsx 공유 컴포넌트로 추출 후 lang prop으로 분기 — 영어/한국어 양쪽이 동일 구조 사용, 라벨/SEO 텍스트만 분기",
      "feat(metadata): 모든 SEO 페이지에 hreflang alternates(en/ko/x-default) + locale별 OG locale 자동 설정",
      "feat(sitemap): /ko/... 모든 라우트를 sitemap.xml에 자동 등록",
      "근거: 영어 SEO 페이지만 있어 한국어 검색 트래픽을 놓치고 있음. ko.po 기반 정식 한국어 번역 활용",
    ],
    changes: {
      ko: [
        "한국어 SEO 페이지 추가 — `/ko/food/...`, `/ko/item/...`, `/ko/boss/...`, `/ko/character/...`, `/ko/skill-tree/...`, `/ko/cookpot`, `/ko/browse`, `/ko/characters` 모든 한국어 게임 가이드 페이지 신설",
        "구글 검색에서 한국어 키워드(아이템명/요리명/보스명 등)로 검색 시 정확한 한국어 페이지가 노출됩니다",
      ],
      en: [
        "Korean SEO pages added under /ko/... — full Korean guides for all foods, items, bosses, characters, and skill trees",
      ],
    },
  },
  {
    version: "0.17.0",
    date: "2026-04-28",
    dev: [
      "feat(SupporterStrip): 검색바 직후 위치에 후원자 닉네임 회전 strip 신설 — 모든 메인 탭(Crafting/Cooking/Crock Pot/Bosses/Skills/Console)에 일관 적용",
      "refactor(SupportPill): 푸터/DetailPanel용으로 정적 라벨('개발자 후원하기')로 복원 — ticker는 SupporterStrip로 분리",
      "i18n: support_thanks 키 추가 ('후원해주신' / 'Thanks to')",
      "변경 이유: v0.16.3에서 푸터 ticker는 모바일 스크롤 끝에서만 보이고 컨텍스트가 모호하다는 피드백 — 첫 화면 상단에 컨텍스트(\"후원해주신 ○○○님\") 명확화",
    ],
    changes: {
      ko: [
        "후원자 닉네임이 모든 탭의 검색바 바로 아래 얇은 줄에 표시됩니다 — 첫 화면에서 바로 확인 가능",
        "푸터의 후원 버튼은 다시 '개발자 후원하기' 정적 라벨로",
      ],
      en: [
        "Supporter names now appear in a thin strip just below the search bar on every tab — visible from first view",
        "Footer support button reverted to a static 'Support the developer' label",
      ],
    },
  },
  {
    version: "0.16.3",
    date: "2026-04-28",
    dev: [
      "fix(Footer): 메인 푸터의 ko-fi 버튼이 SupportPill 컴포넌트를 사용하도록 교체 — v0.16.0의 ticker 적용 누락 수정",
      "원인: SupportPill 컴포넌트만 ticker화했으나 Footer.tsx에 동일 디자인 ko-fi 버튼이 별도 하드코딩되어 있어 적용 안 됨",
    ],
    changes: {
      ko: [
        "후원자 닉네임 ticker가 메인 화면 푸터에도 정상 표시됩니다",
      ],
      en: [
        "Supporter ticker now correctly displays on the main page footer",
      ],
    },
  },
  {
    version: "0.16.2",
    date: "2026-04-28",
    dev: [
      "perf(worker): Cache-Control 일괄 조정 — /supporters·/rating no-store(즉시 반영), /popular·/combos·/top-countries 60s, /stats(공개) 60s 유지",
      "근거: Upstash 월 commands 110k/500k(22%), Workers 일 2k/100k(2%) — 모든 한도 충분히 여유, 캐시로 절약할 비용 없음",
    ],
    changes: {
      ko: [
        "후원자 닉네임·평점 변경이 즉시 반영됩니다 (이전 5분 캐시 → 즉시)",
      ],
      en: [
        "Supporter names and ratings now reflect instantly (previously cached for 5 min)",
      ],
    },
  },
  {
    version: "0.16.1",
    date: "2026-04-28",
    dev: [
      "fix(SeoFooterLinks): 푸터를 sr-only 처리 — 시각적으로 숨기되 크롤러/스크린리더에는 노출되어 SEO 내부 링크는 유지",
    ],
    changes: {
      ko: [
        "첫 화면 하단에 노출되던 SEO용 링크 목록을 시각적으로 숨김 (검색 엔진용 링크는 유지)",
      ],
      en: [
        "Hid the SEO link list that was visible at the bottom of the home page (still exposed to crawlers)",
      ],
    },
  },
  {
    version: "0.16.0",
    date: "2026-04-28",
    dev: [
      "feat(worker): POST /kofi-webhook — ko-fi 후원 이벤트 수신 (verification_token 검증, kofi_transaction_id 기반 중복 제거, 텔레그램 알림)",
      "feat(worker): GET /supporters — 누적 금액순 TOP 5 닉네임 (금액 비공개)",
      "feat(worker): POST /supporters — admin 전용 수동 backfill",
      "feat(SupportPill): CountryTicker 패턴으로 회전 ticker 개조 — 기본 라벨 + 후원자 닉네임 회전 (3초)",
      "feat: 익명 후원자(__anon__ 토큰)는 i18n로 'Anonymous'/'익명 후원자' 표시",
    ],
    changes: {
      ko: [
        "후원자 닉네임 표시 — Footer 후원 버튼이 후원해주신 분들의 닉네임을 회전하며 보여줍니다 ☕💖",
      ],
      en: [
        "Supporter names display — the Footer support button now rotates through ko-fi supporter names ☕💖",
      ],
    },
  },
  {
    version: "0.15.6",
    date: "2026-04-28",
    dev: [
      "refactor: 어드민 사용자 피드백 관리 화면을 /stats → 설정 탭으로 이동",
      "feat: AdminFeedbackSection — 모바일 최적화 한 줄 리스트(상태점/메시지 truncate/상대시간) + DetailPanel(전체 메시지/메타/상태 변경/IP·메시지 복사)",
      "ui: 좌우 스크롤 제거, 상태 변경 select → 4-grid 버튼, 필터칩에 카운트 인라인",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.15.5",
    date: "2026-04-28",
    dev: [
      "fix(worker): returnRate 분모를 totalPV로 변경 — 기존 PFCOUNT(totalUV) 분모는 단위 불일치로 100% 초과 가능했음",
      "fix(worker): excludeCountry 필터의 UV 차감을 PFCOUNT 산술 빼기 → PFMERGE 방식으로 교체 (HyperLogLog 차집합 부정확 문제)",
      "fix(worker): isRateLimited race condition — INCR + EXPIRE NX 한 pipeline으로 묶어 TTL 누락 시 영구 차단되는 코너케이스 제거",
      "perf(worker): /track rate limit 5/min → 30/min — NAT/공유 IP 환경에서 방문자 누락 감소",
      "ui(stats): 재방문율 sub 텍스트 'N명 재방문' → 'N회 재방문' (방문 횟수 단위로 정정)",
    ],
    changes: {
      ko: [
        "통계 페이지 정확도 개선 — 재방문율 계산식 정정, 국가 제외 필터 정확도 향상",
        "공유 IP(사무실/학교/모바일 캐리어) 환경에서 방문자 누락 감소",
      ],
      en: [
        "Stats page accuracy improvements — fixed return rate formula and country exclusion filter",
        "Reduced visitor undercount on shared IP networks (offices, schools, mobile carriers)",
      ],
    },
  },
  {
    version: "0.15.4",
    date: "2026-04-27",
    dev: [
      "fix: 와그펑크 작업장 레시피 8종의 station을 'none' → 'wagpunk_workstation'으로 정정 (인게임 recipes.lua TECH.WAGPUNK_WORKSTATION_TWO 기준)",
      "feat: CraftingStation 타입에 'wagpunk_workstation' 추가 + i18n 라벨(ko: 관념 조립기 / en: Notional Fabricator)",
      "feat: CraftingItem.numtogive 필드 추가, wagpunk_floor_kit(기질 추론기)에 numtogive: 4 반영",
    ],
    changes: {
      ko: [
        "와그펑크 작업장 레시피(기질 추론기, 게슈탈트 포획기, W.A.R.B.O.T. 키트 등) 제작대 정보 정정 — 이제 '관념 조립기' 근처에서만 제작 가능으로 표시",
      ],
      en: [
        "Fixed crafting station info for Wagpunk Workstation recipes (Substrate Extrapolator, Gestalt Cage, W.A.R.B.O.T. kits, etc.) — now correctly shown as Notional Fabricator-only",
      ],
    },
  },
  {
    version: "0.15.3",
    date: "2026-04-22",
    dev: [
      "feat: 스킬트리 빌드 서버 동기화 — Worker GET/POST /skills 엔드포인트, Redis Hash 저장",
      "feat: 로그인 시 서버→localStorage 동기화, 비로그인 시 localStorage fallback 유지",
      "feat: 첫 로그인 시 localStorage→서버 자동 마이그레이션",
      "feat: 변경 시 1초 debounce 후 fire-and-forget 서버 저장",
      "refactor: use-skill-tree에 refreshKey 파라미터 추가 (서버 동기화 후 재로드용)",
    ],
    changes: {
      ko: [
        "로그인 시 스킬트리 빌드가 서버에 저장되어 기기 간 동기화 지원",
      ],
      en: [
        "Skill tree builds now sync to server when logged in, enabling cross-device sync",
      ],
    },
  },
  {
    version: "0.15.2",
    date: "2026-04-22",
    dev: [
      "feat: 콘솔 탭 일반 공개 — adminOnly 플래그 제거",
      "rename: 'N일 건너뛰기' → '날짜 건너뛰기'",
    ],
    changes: {
      ko: [
        "콘솔 탭 일반 공개 — 이제 모든 유저가 이용 가능",
        "'N일 건너뛰기' → '날짜 건너뛰기'로 명칭 변경",
      ],
      en: [
        "Console tab now available to all users",
        "Renamed 'Skip N Days' → 'Skip Days'",
      ],
    },
  },
  {
    version: "0.15.1",
    date: "2026-04-21",
    dev: [
      "refactor: 콘솔 탭 UI 리디자인 — 카테고리별 컬러 액센트, 카드 가시성 개선",
      "feat: 명령어 텍스트 기본 숨김 + '명령어 보기' 토글로 필요시 확인",
      "feat: '명령어 복사' 버튼 — 명령어를 보지 않고도 바로 복사 가능",
      "feat: 카테고리 접기/펼치기 (collapsible sections)",
      "style: 라이트/다크 테마 모두 대응하는 컬러 시스템",
      "i18n: console_copy_command, console_show_command 번역 키 추가",
    ],
    changes: {
      ko: [
        "콘솔 탭 UI 리디자인 — 카테고리별 컬러 구분으로 가시성 개선",
        "명령어 코드를 숨기고 '복사' 버튼으로 간편하게 사용, 필요시 펼쳐보기 가능",
        "카테고리 접기/펼치기 지원",
      ],
      en: [
        "Console tab UI redesign — color-coded categories for better visibility",
        "Command code hidden by default with copy button, expandable on demand",
        "Collapsible category sections",
      ],
    },
  },
  {
    version: "0.15.0",
    date: "2026-04-21",
    dev: [
      "feat: 콘솔 명령어 탭 신규 추가 (ConsoleApp)",
      "feat: 아이템 소환 빌더 — 아이템 검색+선택+갯수 → c_give/c_spawn 명령어 자동 생성",
      "feat: 카테고리별 명령어 카드 — 캐릭터 상태/월드 제어/서버 관리/디버그",
      "feat: 파라미터 있는 명령어 인라인 편집 (시즌, 시간, 속도 등)",
      "data: console-commands.ts 명령어 데이터 정의",
      "i18n: 콘솔 탭 번역 키 ko/en 추가",
    ],
    changes: {
      ko: [
        "콘솔 명령어 탭 추가 — 자주 쓰는 DST 콘솔 명령어를 한곳에서 확인하고 복사",
        "아이템 소환 빌더 — 아이템 검색 후 갯수 지정하면 c_give/c_spawn 명령어 자동 생성",
        "캐릭터 상태/월드 제어/서버 관리/디버그 카테고리별 명령어 카드",
        "시즌 변경, 시간 설정 등 파라미터가 있는 명령어는 드롭다운으로 간편 선택",
      ],
      en: [
        "New Console Commands tab — browse and copy frequently used DST console commands",
        "Item Spawn Builder — search items, set quantity, auto-generate c_give/c_spawn commands",
        "Commands organized by category: Player Status, World Control, Server Admin, Debug",
        "Parameterized commands (season, time, speed) with inline dropdowns",
      ],
    },
  },
  {
    version: "0.14.2",
    date: "2026-04-21",
    dev: [
      "feat: 요리/보스 탭 상세에 콘솔명(프리팹 ID) 표시 + 클릭 복사",
      "refactor: 콘솔명 버튼을 PrefabIdButton 공유 컴포넌트로 추출 (제작/요리/보스 3곳 공통화)",
    ],
    changes: {
      ko: [
        "요리/보스 탭에서도 콘솔명(프리팹 ID) 확인 및 복사 가능",
      ],
      en: [
        "Console name (prefab ID) now shown in cooking and boss tabs with copy support",
      ],
    },
  },
  {
    version: "0.14.1",
    date: "2026-04-21",
    dev: [
      "feat: 보스 2차 보상(stashLoot) 시스템 추가 — Boss 인터페이스에 stashLoot 필드",
      "data: 클라우스 보따리 보상 추가 (klaussackloot.lua 기반 정확한 확률)",
      "data: 클라우스 직접 드랍에 수사슴의 뿔(klaussackkey) 추가",
      "data: 고대의 수호자 직접 드랍 수정 — 수호자의 뿔/기둥비계도면 추가, 상자 아이템을 stashLoot로 분리",
      "data: 고대의 수호자 화려한 상자 보상 추가 (고대열쇠, 툴레장비, 지팡이, 목걸이, 보석 등)",
      "fix: 전리품 검색에 stashLoot 아이템 반영",
      "data: lootNameKo에 신규 아이템 번역 추가 (ko.po 기반)",
    ],
    changes: {
      ko: [
        "클라우스 보따리 보상 표시 — 크람푸스 보따리(10%), 보스 재료, 도면 등 상세 확률 확인 가능",
        "고대의 수호자 보상 정정 — 수호자의 뿔 추가, 화려한 상자 보상(고대 열쇠, 툴레 장비 등) 별도 표시",
        "보따리/상자 아이템도 전리품 검색에 반영",
      ],
      en: [
        "Klaus Loot Stash rewards displayed — Krampus Sack (10%), boss materials, blueprints with exact drop rates",
        "Ancient Guardian loot corrected — Guardian's Horn added, Ornate Chest rewards shown separately",
        "Stash/chest items now included in loot search",
      ],
    },
  },
  {
    version: "0.14.0",
    date: "2026-04-21",
    dev: [
      "feat: 보스탭 전투 스탯 표시 (체력/공격력/정신력) — scrapbook 데이터 활용",
      "feat: scrapbook 별칭 56개 추가 (항해/제작대/체스말 등 ID 불일치 해소)",
      "data: scrapbook에 health 필드 추가 — 보스 포함 giant/creature 체력 표시",
      "fix: 스킬트리 manualLocks localStorage 영속화 (보스처치/수동잠금 유지)",
      "style: 콘솔명을 조회수 위로 이동 + 둥근 보더 추가",
    ],
    changes: {
      ko: [
        "보스탭에 전투 스탯 추가 — 체력/공격력/정신력 표시",
        "스크랩북 커버리지 확대 — 항해·제작대·포탑 등 12종 추가",
        "스킬트리 보스처치/수동잠금 상태가 탭 이동 후에도 유지",
        "아이템 상세 콘솔명 위치 변경 + 둥근 보더",
      ],
      en: [
        "Boss tab now shows combat stats — Health, Damage, Sanity aura",
        "Expanded scrapbook coverage — 12 new items (boats, forges, turrets)",
        "Skill tree manual lock state now persists across tab switches",
        "Console name repositioned above view count with pill border",
      ],
    },
  },
  {
    version: "0.13.2",
    date: "2026-04-21",
    dev: [
      "fix: 용파리 보석 드롭 확률 수정 (dragonfly.lua 원본 기준)",
      "fix: WX-78 기존 모듈 3개 레시피 오류 수정 (발광/광전자/추출기)",
      "feat: WX-78 모듈 7개 + 스킬트리 아이템 5개 신규 추가 (총 12개)",
      "feat: WX-78 스킬트리 노드에 제작법 링크 연결 (builderSkill 5개)",
      "asset: 누락 아이템 이미지 12개 위키에서 다운로드",
      "data: 재료 2종 추가 (batnose, slurtlehat), game-items-db 12개 추가",
      "i18n: 신규 아이템 13개 + 재료 2개 한글 번역 (ko.po 원본)",
    ],
    changes: {
      ko: [
        "WX-78 제작템 대폭 추가 — 모듈 7개 + 스킬트리 아이템 5개",
        "WX-78 스킬트리에서 해금 제작법 확인 가능",
        "용파리 보석 드롭 확률 수정 (인게임과 일치)",
        "WX-78 기존 모듈 레시피 오류 수정 (발광·광전자·추출기)",
      ],
      en: [
        "Added 12 WX-78 crafting items — 7 modules + 5 skill tree items",
        "WX-78 skill tree now shows unlockable recipes",
        "Fixed Dragonfly gem drop rates to match in-game",
        "Fixed 3 existing WX-78 module recipe errors",
      ],
    },
  },
  {
    version: "0.13.1",
    date: "2026-04-21",
    dev: [
      "feat: WX-78 스킬트리 데이터 추가 (4그룹, 27노드)",
      "asset: WX-78 스킬 아이콘 24개 위키에서 다운로드",
      "i18n: WX-78 스킬 한글/영문 번역 추가 (ko.po 기반)",
      "tooling: verify-skill-trees.py에 lua GROUPS 변수 해석 + connects_diff suppression 추가",
    ],
    changes: {
      ko: [
        "WX-78 스킬트리 시뮬레이터 추가 — 회로·동체·드론·진화 4개 트리",
      ],
      en: [
        "Added WX-78 skill tree simulator — Circuitry, Chassis, Drones, Allegiance",
      ],
    },
  },
  {
    version: "0.13.0",
    date: "2026-04-20",
    dev: [
      "feat: 아이템 스탯 시스템을 수작업 item-stats-v3 → 인게임 scrapbookdata.lua 기반으로 전면 교체",
      "tooling: scripts/convert-scrapbook.py — scrapbookdata.lua + strings.lua + ko.po 파싱 → scrapbook-stats.ts 자동 생성 (1541개 엔트리)",
      "ui: ItemStatsPanel 재작성 — ScrapbookStats 기반, 인게임 렌더 순서, specialinfo 한/영 텍스트 인라인 표시",
      "refactor: item-stats-v3.ts 삭제 (528줄), ItemDetail/dev 페이지 모두 scrapbook 기반으로 전환",
    ],
    changes: {
      ko: [
        "아이템 상세 스탯을 인게임 스크랩북 데이터로 교체 — 수치가 게임과 100% 일치",
        "번역 품질 대폭 개선 — 인게임 공식 한국어 번역 적용 (커뮤니티 한글모드 기반)",
        "커버리지 확대 — 기존 433개 → 817개 아이템 스탯 표시",
        "특수 효과 설명이 인게임과 동일하게 표시 (799개 아이템)",
      ],
      en: [
        "Item stats now sourced from in-game scrapbook data — 100% accurate values",
        "Translation quality improved — using official in-game Korean translations",
        "Coverage expanded from 433 → 817 items with stats",
        "Special effect descriptions now match in-game text (799 items)",
      ],
    },
  },
  {
    version: "0.12.2",
    date: "2026-04-16",
    dev: [
      "feat: 스킬트리 빌드 공유 — 비트필드→base64url 인코딩으로 URL 공유",
      "feat: skill-build-codec 유틸 추가 (encodeBuild/decodeBuild)",
      "feat: useSkillTree에 loadBuild 메서드 추가",
      "feat: 스킬트리 SEO 페이지 추가 — /skill-tree/[slug] 캐릭터별 정적 페이지",
      "seo: layout.tsx 메타데이터에 skill tree 키워드 추가",
      "seo: 사이트맵에 스킬트리 페이지 11개 추가",
      "seo: 캐릭터 SEO 페이지에서 스킬트리 링크 섹션 추가",
    ],
    changes: {
      ko: [
        "스킬트리 빌드 공유 기능 — 찍은 스킬을 URL로 공유 가능",
        "스킬트리 SEO 페이지 추가 — 캐릭터별 스킬트리 검색 노출 개선",
      ],
      en: [
        "Skill tree build sharing — share your skill build via URL",
        "Skill tree SEO pages — individual pages for each character's skill tree",
      ],
    },
  },
  {
    version: "0.12.1",
    date: "2026-04-15",
    dev: [
      "feat: 설정에 개발자 메뉴 토글 추가 (admin 전용) — localStorage `dst-dev-menu`에 저장, AppShell의 DevMenu 표시를 설정값으로 제어",
      "i18n: dev_menu / dev_menu_desc 키 추가 (ko/en)",
    ],
    changes: {
      ko: [
        "(관리자) 설정에서 우측 하단 개발자 메뉴 버튼을 끄고 켤 수 있습니다",
      ],
      en: [
        "(Admin) Toggle the bottom-right developer menu button from Settings",
      ],
    },
  },
  {
    version: "0.12.0",
    date: "2026-04-16",
    dev: [
      "feat: Skill Simulator 정식 공개 — AppShell의 skills 탭 adminOnly 플래그 제거",
      "feat: SkillsTourPopover — 첫 접속 시 스킬 탭으로 유도하는 일회성 팝오버. localStorage 키 dst:tour-skills-v0.11.8 로 노출 여부 추적, 사용자가 직접 스킬 탭 클릭하면 자동 dismiss",
      "ui: 탭 위에 펄싱 글로우 + 아래쪽 화살표 팝오버, '체험하기' 버튼으로 바로 이동",
    ],
    changes: {
      ko: [
        "🎉 스킬 시뮬레이터 정식 공개 — 11명 캐릭터의 스킬트리를 미리 짜볼 수 있어요",
        "보스 처치 / 커스텀 과제 해금 토글, 진영 상호 배타까지 인게임과 동일하게 동작",
        "첫 접속 시 스킬 탭 안내 팝오버 표시",
      ],
      en: [
        "🎉 Skill Simulator now publicly available — plan skill trees for all 11 characters",
        "Boss-kill toggles, custom-task unlocks, and faction mutual-exclusion all match in-game behavior",
        "First-visit popover guides new users to the Skills tab",
      ],
    },
  },
  {
    version: "0.11.7",
    date: "2026-04-16",
    dev: [
      "ui: 자물쇠/해금 아이콘 좌우 반전(horizontal flip) 적용",
      "ui: 눈 아이콘 위아래 반전(vertical flip) 추가 적용",
      "fix: 스킬트리 reset 버튼이 manualLocks를 초기화하지 않던 버그 — onReset에서 setManualLocks(new Set()) 함께 호출",
    ],
    changes: {
      ko: [
        "스킬트리 — 초기화 버튼이 보스 처치/커스텀 과제 토글도 함께 초기화되도록 수정",
        "자물쇠/눈 아이콘 방향 보정",
      ],
      en: [
        "Skill tree — reset button now also clears manual lock toggles",
        "Adjusted lock/eye icon orientations",
      ],
    },
  },
  {
    version: "0.11.5",
    date: "2026-04-16",
    dev: [
      "ui: lock 충족 시 인게임 unlocked.tex(skill_unlock_large) 아이콘 사용 — 토글 상태 시각화가 인게임과 동일",
      "fix: 0.11.4의 잘못된 180° 회전 되돌림 — 원본이 이미 올바른 방향이었음 (눈꺼풀이 위, 광선이 아래)",
      "extract_skill_ui_icons.py에서 rotate(180) 제거",
    ],
    changes: {
      ko: [
        "스킬트리 — lock 충족 시 인게임 열린 자물쇠 아이콘 표시 (체크 표시 대체)",
        "눈/자물쇠 아이콘 방향 바로잡음",
      ],
      en: [
        "Skill tree — show in-game open-lock icon when condition is satisfied",
        "Fixed eye/lock icon orientation",
      ],
    },
  },
  {
    version: "0.11.4",
    date: "2026-04-16",
    dev: [
      "fix: skilltree.tex 추출 아이콘들이 상하 반전된 상태로 저장되던 문제 — extract_skill_ui_icons.py에서 rotate(180°) 적용",
      "ui: SkillLockIndicator의 LockConditionPill에서 잠금 상태일 때 인게임 자물쇠 아이콘(skill_lock_large) 표시",
    ],
    changes: {
      ko: [
        "스킬트리 — 잠금 표시 아이콘을 인게임 자물쇠로 변경",
        "눈 아이콘 상하 반전 수정",
      ],
      en: [
        "Skill tree — lock indicator now uses the in-game lock icon",
        "Fixed eye icon being upside-down",
      ],
    },
  },
  {
    version: "0.11.3",
    date: "2026-04-16",
    dev: [
      "tooling: scripts/extract_skill_ui_icons.py — skilltree.tex 아틀라스에서 UI 아이콘 추출 (skill_icon, skill_icon_bw, locked, locked_skill, frame)",
      "ui: 스킬 탭 아이콘을 인게임 눈 모양 아이콘(skill_icon.tex)으로 교체",
      "ui: 스킬트리 헤더의 '습득/남은 포인트' 텍스트를 인게임 스타일로 변경 — 눈 아이콘 + '15 통찰력 남음' (인게임과 동일 표현)",
    ],
    changes: {
      ko: [
        "스킬트리 — 인게임과 동일한 눈 아이콘 + '통찰력 남음' 표시로 변경",
        "스킬 탭 아이콘도 인게임 눈 모양으로 교체",
      ],
      en: [
        "Skill tree — switched to in-game eye icon + 'insight left' display",
        "Skills tab now uses the in-game eye icon",
      ],
    },
  },
  {
    version: "0.11.2",
    date: "2026-04-16",
    dev: [
      "data: 19개 캐릭터 모두에 title/titleKo 필드 추가 (인게임 CHARACTER_TITLES + ko.po 한글모드 기준)",
      "i18n: characterTitle() 헬퍼 추가",
      "ui: 스킬트리 헤더, 스킬 시뮬레이터 캐릭터 그리드, 캐릭터 개별 페이지에 별명 표시",
      "fix: ko.ts characters에서 'wilson'/'wickerbottom'을 풀네임/존칭에서 짧은 이름으로 되돌림 — 게임 캐릭터 선택 화면은 CHARACTER_NAMES(풀네임)이 아닌 CHARACTER_TITLES(별명)을 표시함을 lobbyscreen.lua에서 확인",
    ],
    changes: {
      ko: [
        "캐릭터 이름 옆에 별명 표시 — 윌슨 → 윌슨 · 신사 과학자, 위그프리드 → 위그프리드 · 공연 예술가 등",
        "윌슨 풀네임을 게임 캐릭터 선택 화면과 동일하게 짧은 이름으로 변경",
      ],
      en: [
        "Show character epithet next to name — e.g., Wilson · The Gentleman Scientist, Wigfrid · The Performance Artist",
      ],
    },
  },
  {
    version: "0.11.1",
    date: "2026-04-16",
    dev: [
      "tooling: scripts/check-skill-translations.py — 스킬/그룹/락 번역 누락 검사 (skillTranslations + groupTranslations 비교)",
      "tooling: scripts/fill-skill-translations.py — strings.lua + ko.po + 캐릭터 lua의 명시적 SKILLTREESTRINGS 참조를 파싱하여 누락된 스킬 번역을 자동 생성",
      "fix: 48개 스킬 번역 자동 추가 (willow/winona/wolfgang/wormwood) — DST 커뮤니티 한글모드 ko.po 기반",
      "fix: 17개 그룹 번역 수동 추가 (allegiance1/2, charlie, combat, crafting, gathering, ghost_command, ghostflower, gravestone, lowshelf, midshelf, potion_upgrades, sisturn_upgrades, smallghost, wagstaff, wendy_alliegience, avengingghost)",
      "체커 정확도 개선: 표준 lock 타입(boss_kill/skill_count/no_opposing_faction)은 i18n.ts의 skills_gate_* 키로 번역되므로 lockTranslations 검사에서 제외 (35 false-positive 제거)",
      "결과: 스킬 333개, 그룹 44개, manual lock 모두 한글 번역 완료",
    ],
    changes: {
      ko: [
        "스킬트리 — 윌로우/위노나/울프강/웜우드의 스킬 48개에 누락됐던 한글 번역 추가 (DST 커뮤니티 한글모드 기반)",
        "스킬트리 — 누락됐던 17개 그룹 헤더 한글 번역 추가",
      ],
      en: [
        "Skill tree — added 48 missing Korean translations for Willow/Winona/Wolfgang/Wormwood skills",
        "Skill tree — added 17 missing group header translations",
      ],
    },
  },
  {
    version: "0.11.0",
    date: "2026-04-15",
    dev: [
      "fix: walter/willow의 shadow-lunar 진영 상호 배타 미구현 — lua는 한 lock에서 boss_kill + 반대 진영 미보유를 동시에 검사하지만, 우리 데이터는 boss_kill만 검사하던 버그",
      "type: LockCondition.boss_kill에 optional `excludes: 'lunar' | 'shadow'` 필드 추가 — 한 lock 노드에서 보스 처치 AND 반대 진영 미보유를 함께 검사",
      "use-skill-tree.ts, SkillTreeView.tsx: isLockSatisfied가 boss_kill의 excludes 필드도 검사하도록 확장",
      "walter (4 locks): walter_ammo_shadow_lock + walter_woby_shadow_lock에 excludes:'lunar', _lunar_lock 변형들에 excludes:'shadow' 추가",
      "willow (2 locks): willow_allegiance_lock_1에 excludes:'lunar', _lock_4에 excludes:'shadow' 추가",
      "전수 조사: 9개 캐릭터 lua에 mutual exclusion 패턴 존재. wilson/wendy/woodie/wigfrid/wortox/wurt/wolfgang은 이미 구현됨, walter/willow만 누락이었음",
    ],
    changes: {
      ko: [
        "월터/윌로우 — shadow ↔ lunar 진영 상호 배타 구현. 한쪽 진영 스킬을 찍으면 반대 진영 lock이 영구 잠금되어 인게임과 동일하게 동작",
      ],
      en: [
        "Walter / Willow — implemented shadow ↔ lunar mutual exclusion. Picking one faction's skill permanently locks the opposite faction, matching in-game behavior",
      ],
    },
  },
  {
    version: "0.10.9",
    date: "2026-04-15",
    dev: [
      "verify: factory lock 함수의 extra_data.group/connects override 파싱 추가 (웜우드 false-positive 해결)",
      "verify: EXPECTED_DIVERGENCES 화이트리스트 도입 — walter 시각그룹/카운트태그 분리(2 skills) + wortox infographic 장식 노드(3 skills) 의도적 divergence 문서화",
      "검증 결과: 11/11 캐릭터 0 errors, 0 warnings 달성",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.10.8",
    date: "2026-04-15",
    dev: [
      "fix: 같은 보스를 요구하는 lock 노드들이 서로 독립적으로 토글되던 버그 — manualLocks의 키를 node.id에서 lockType별 derived key(boss:<boss>)로 변경. lua는 lock_open이 TheGenericKV의 글로벌 보스 처치 상태를 참조하므로 시뮬레이터도 이를 미러링해야 함",
      "src/lib/skill-tree-keys.ts: manualLockKey 헬퍼 추가 (boss_kill → boss:<boss>, manual → manual:<id>)",
      "use-skill-tree.ts, SkillTreeView.tsx, SkillSimulatorApp.tsx: isLockSatisfied/toggleManualLock/canUnlockManualLock 모두 derived key 사용",
      "위그프리드는 캐릭터당 boss_kill lock이 1개씩이라 회귀 영향 없음",
    ],
    changes: {
      ko: [
        "스킬트리 — 같은 보스(퓨얼위버/대변자) 처치 조건을 공유하는 lock 노드들이 한 번의 토글로 함께 풀리도록 수정 (월터의 슬링샷 탄약/워비 영역 등)",
      ],
      en: [
        "Skill tree — lock nodes sharing the same boss-kill condition (Fuelweaver / Celestial Champion) now toggle together (e.g. Walter's slingshot ammo and Woby sections)",
      ],
    },
  },
  {
    version: "0.10.7",
    date: "2026-04-15",
    dev: [
      "tooling: scripts/verify-skill-trees.py — 인게임 skilltree_<char>.lua 정적 파싱 후 우리 TS 데이터와 ID/group/root/connects/locks/tags/lock_open 비교 (위그프리드를 정답지 회귀테스트로 사용)",
      "tooling: scripts/fix-skill-tree-tags.py — lua 후처리(group → tags 자동 추가)를 미러링하는 자동 수정 스크립트",
      "fix: 10개 캐릭터 스킬트리 데이터에서 누락된 그룹-태그 70개 자동 보정 (willow/winona/wolfgang/woodie/wormwood/wortox/wurt/walter)",
      "검증 결과 67 errors → 11 errors (84% 감소). 남은 11개는 의도적 divergence 후보 (walter/wormwood/wortox)",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.10.6",
    date: "2026-04-15",
    dev: [
      "dev: NODE_ENV=development일 때도 admin-only 탭(Skills)을 표시 — 로컬 개발 편의성",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.10.5",
    date: "2026-04-15",
    dev: [
      "ui: 탭 바에 justify-between + gap-4 조합 — 평소에는 탭이 균등 분배되고, 폭을 넘으면 gap 간격으로 가로 스크롤",
    ],
    changes: {
      ko: [
        "탭 메뉴 간격이 화면 폭에 맞춰 균등 분배되도록 조정",
      ],
      en: [
        "Tab menu now distributes spacing evenly across the viewport width",
      ],
    },
  },
  {
    version: "0.10.4",
    date: "2026-04-15",
    dev: [
      "ui: 탭 바 레이아웃 조정 — flex-1 균등 분할 제거, 내용 폭 기반으로 변경",
      "ui: 탭 간 간격 gap-4로 확대, 아이콘-라벨 간격 gap-1로 축소",
      "ui: 탭 바 가로 스크롤 허용 + 스크롤바 시각적 숨김 (overflow-x-auto, scrollbar-width:none, ::-webkit-scrollbar:hidden)",
    ],
    changes: {
      ko: [
        "탭 메뉴 여백 조정 — 아이콘과 라벨은 더 붙이고, 탭 사이 간격은 넓힘",
        "탭 메뉴가 화면 폭을 넘으면 가로로 스크롤되도록 개선",
      ],
      en: [
        "Tab menu spacing — tighter icon-to-label, wider gap between tabs",
        "Tab bar scrolls horizontally when it exceeds the viewport width",
      ],
    },
  },
  {
    version: "0.10.3",
    date: "2026-04-15",
    dev: [
      "fix: 친화(allegiance) 스킬이 '총 12 스킬 + 보스 처치 토글' 조건 충족에도 잠금 상태로 남던 버그 — use-skill-tree.ts의 isLockSatisfied가 manualLocks를 받지 않아 boss_kill/manual lock의 AND 게이트 판정이 항상 실패",
      "feat: manual/boss_kill lock을 해제할 때, 해당 lock에 의존하는 습득된 스킬이 있으면 토글 차단 + shake 효과 — hook에 canUnlockManualLock 추가",
      "ui: 탭 메뉴 텍스트 줄바꿈 방지 — 'Crock Pot' 등 공백 포함 라벨이 두 줄로 깨지지 않도록 whitespace-nowrap 적용",
    ],
    changes: {
      ko: [
        "친화 스킬 잠금 버그 수정 — 12개 스킬 + 보스 처치 조건 충족 시 그림자/월광 스킬 정상 습득 가능",
        "커스텀 과제(예: 전투의 함성 10번 사용) 해제가 습득된 하위 스킬을 깨뜨릴 경우 차단하고 shake 효과로 알림",
        "탭 메뉴 텍스트가 두 줄로 깨지는 문제 수정",
      ],
      en: [
        "Fix Affinity skill lock bug — Shadow/Lunar skills now learnable when 12-skill + boss-kill conditions are met",
        "Prevent unlocking a custom task (e.g., 'Use Battle Cry 10 times') when it would break an already-learned downstream skill; shake on blocked action",
        "Fix tab menu text wrapping onto two lines",
      ],
    },
  },
  {
    version: "0.10.2",
    date: "2026-04-15",
    dev: [
      "ui: 스킬트리 필요 조건(prereq)을 노드 카드 내부 상단 pill로 이동",
      "ui: 헤드라이너/친화 등 lock 기반 게이트도 카드 내부로 이동 — 전용 lock만 흡수, 공유 lock(예: 친화 '총 12 스킬')은 그룹 상단에 게이트 라인으로 유지",
      "ui: 조건 pill들은 기본 한 줄, 넘치면 줄바꿈(flex-wrap)",
      "refactor: PrereqIndicator 제거, getPrereq/isLockSatisfied 헬퍼로 분리 — SkillNodeCard에 prereq/lockRequirements prop 전달",
      "refactor: SkillLockIndicator에서 LockConditionPill 분리 — 게이트 라인/카드 내부 모두에서 재사용",
    ],
    changes: {
      ko: [
        "스킬트리 — 각 스킬의 습득 조건(선행 스킬, 보스 처치, 커스텀 과제 등)이 노드 카드 안쪽으로 이동하여 레이아웃이 더 깔끔해짐",
        "여러 조건은 기본적으로 한 줄, 넘치면 줄바꿈으로 표시",
        "공유되는 조건(예: 친화의 '총 12개 스킬 습득')은 그룹 상단에 한 번만 표시",
      ],
      en: [
        "Skill tree — per-skill requirements (prerequisite skills, boss kills, custom tasks) are now displayed inside node cards for a cleaner layout",
        "Multiple requirements display on a single row by default, wrapping when they overflow",
        "Shared requirements (e.g., Affinity's 'Learn 12 skills') remain as a single group-level gate",
      ],
    },
  },
  {
    version: "0.10.0",
    date: "2026-04-15",
    dev: [
      "feat: 스킬트리 시뮬레이터 탭 추가 (Git Graph 스타일 UI)",
      "data: 11개 캐릭터 스킬트리 데이터 추출 — 게임 Lua → TypeScript 변환 (~403 노드)",
      "data: ko.po + strings.lua에서 스킬 번역 추출 (타이틀/설명/그룹명/잠금 조건)",
      "feat: 스킬 습득/해제 시뮬레이션 + 의존성 검증 + 상호 배제 (월광/그림자)",
      "feat: 스킬 상세 패널에서 해금 제작 아이템 크로스링크 (스킬→제작탭)",
      "feat: localStorage 기반 상태 저장 (캐릭터별)",
      "ui: SVG Rail + SkillNodeCard + SkillLockIndicator + SkillDetailSheet 컴포넌트",
      "ui: AppShell에 스킬 탭 추가 (6탭 구성)",
    ],
    changes: {
      ko: [
        "스킬트리 시뮬레이터 추가 — 11개 캐릭터의 스킬트리를 확인하고 습득 시뮬레이션",
        "스킬 상세 패널에서 해금 아이템 확인 및 제작탭 이동 지원",
      ],
      en: [
        "Skill tree simulator — browse and simulate skill allocation for 11 characters",
        "View unlocked crafting items from skill detail panel",
      ],
    },
  },
  {
    version: "0.9.2",
    date: "2026-04-15",
    dev: [
      "fix: 체류시간 중복 기록 — visibilitychange마다 샘플 전송 → sent 플래그로 세션당 1회만",
      "fix: 재방문율 공식 오류 — returnTotal/totalPV → returnTotal/totalUV",
      "fix: 관리자 IP 정제를 destructive 삭제에서 응답 시점 필터링(non-destructive)으로 변경",
      "feat: /track(5/분), /event(30/분) IP 기반 레이트 리밋 추가",
      "feat: 별점 IP 기반 중복 제출 방지 (변경은 허용)",
      "ui: KR 제외 시 필터 미적용 지표에 점선 테두리 + '필터 미적용' 표시",
      "fix: 'direct' referrer를 도메인 referrer와 분리 — 저장/표시에서 제외",
    ],
    changes: {
      ko: [
        "방문자 통계 정확도 개선 — 체류시간·재방문율 계산 수정",
        "봇 공격 방지를 위한 레이트 리밋 추가",
        "별점 중복 제출 방지",
      ],
      en: [
        "Analytics accuracy improvements — duration & return rate fixes",
        "Rate limiting for bot protection",
        "Prevent duplicate star rating submissions",
      ],
    },
  },
  {
    version: "0.9.1",
    date: "2026-04-15",
    dev: [
      "SEO: 정적 sitemap.xml 삭제 → 동적 sitemap.ts만 사용",
      "SEO: robots.txt에 dev/debug 경로 차단 추가",
      "SEO: 메인 페이지에 SSR 내부 링크 푸터 추가 (155개 링크 — item 60, food 40, boss 29, character 19)",
      "fix: CookingApp 빌드 에러 수정 (debouncedQuery, activeFilter 잔재 코드 제거)",
    ],
    changes: {
      ko: [
        "검색엔진 최적화 개선 — 구글 인덱싱 속도 향상",
      ],
      en: [
        "SEO improvements — faster Google indexing",
      ],
    },
  },
  {
    version: "0.9.0",
    date: "2026-04-14",
    dev: [
      "보스 8종 추가: 천상의 대변자, 고철덩이 늑대돼지, 그림자 체스 말, 서리턱상어, 트리가드, 바르그, 귀신들린 바르그, 초파리 대왕",
      "캐릭터 선호 음식 표시 (요리 탭 레시피 상세)",
      "v1/v2 아이템 스탯 시스템 폐기 → v3 전용",
      "버전 스위칭 훅(use-item-stats-version) 및 DevMenu 토글 제거",
      "PWA SW 캐시 자동 갱신 (빌드마다 커밋 SHA 해시 주입)",
    ],
    changes: {
      ko: [
        "보스 8종 추가 — 천상의 대변자, 서리턱상어, 트리가드 등",
        "요리 탭에서 캐릭터 선호 음식 표시",
        "PWA 캐시 갱신 문제 해결",
      ],
      en: [
        "Added 8 bosses — Celestial Champion, Frostjaw, Treeguard, and more",
        "Character favorite food indicator in cooking tab",
        "Fixed PWA cache refresh issues",
      ],
    },
  },
  {
    version: "0.8.3",
    date: "2026-04-06",
    dev: [
      "SEO 페이지 CTA 딥링크 적용 (food, item, boss, character → 해당 상세패널 직접 열기)",
      "Boss 탭 URL 파라미터 딥링크 지원 추가 (?tab=bosses&boss={id})",
      "SEO 페이지 영어 통일 — 아이템/보스/캐릭터 리스트에서 영어를 주요 이름으로 변경",
    ],
    changes: {
      ko: [
        "SEO 페이지에서 앱으로 이동 시 해당 아이템 상세를 바로 표시",
      ],
      en: [
        "SEO pages now deep-link to the specific item detail panel",
      ],
    },
  },
  {
    version: "0.8.0",
    date: "2026-03-26",
    dev: [
      "천상/대황간/그림자 공예/동물 친구 카테고리 4개 추가 + 아이템 54개 재분류",
      "카테고리 아이콘 인게임 제작탭 아이콘으로 교체 (위키 Station Icon)",
      "스테이션 태그 아이콘 통일 (celestial, lunar_forge, shadow_forge, critter_lab)",
      "상세 패널 스테이션-카테고리 태그 중복 표시 제거",
      "인게임 소스코드 기반 아이템 스탯 전수 검증 (tuning.lua + prefab 소스)",
      "usage 필드 141개 보강 — 특수 효과, 세트 보너스, on-hit/on-equip 효과 전부 추가",
      "삼지창/럭셔리팬/부적류 등 수치 오류 수정",
      "설정 페이지 익명 피드백 기능 + 텔레그램 알림 + 상태 관리",
      "피드백 textarea iOS 자동 확대 방지",
      "접속국가 티커 애니메이션 개선",
      "푸터에서 GitHub/이메일 → 설정 페이지로 이동",
      "SW 캐시 버전 bump (이미지 교체 반영)",
    ],
    changes: {
      ko: [
        "천상/대황간/그림자 공예/동물 친구 카테고리 추가",
        "인게임 소스코드 기반 아이템 특수 효과 전수 추가 (141개 아이템)",
        "설정 페이지에 익명 의견 보내기 기능 추가",
        "접속국가 티커 애니메이션 개선",
      ],
      en: [
        "Added Celestial/Lunar Forge/Shadow Forge/Critter Den categories",
        "Added item special effects based on game source code (141 items)",
        "Added anonymous feedback feature in settings",
        "Improved country ticker animation",
      ],
    },
  },
  {
    version: "0.7.2",
    date: "2026-03-24",
    dev: [
      "ItemDetail에 아이템 스탯 표시 추가 (공격력, 내구도, 방어력 등)",
      "item-stats.ts 데이터 보강 (slots, usage 다국어, shadow_bonus 실제 데미지 계산 표시)",
      "Beta 뱃지로 스탯 데이터 불완전 표시",
      "DevMenu 외부 클릭 감지 mousedown → pointerdown 수정 (모바일 대응)",
      "dev/stat-designs 페이지에 Beta 표시 디자인 비교 추가",
    ],
    changes: {
      ko: [
        "아이템 상세에 스탯 정보 표시 (공격력, 내구도, 방어력, 이동속도 등)",
        "스탯 데이터 보강 (107개 → 확장)",
      ],
      en: [
        "Item detail now shows stats (damage, durability, armor, speed, etc.)",
        "Expanded item stat data coverage",
      ],
    },
  },
  {
    version: "0.7.1",
    date: "2026-03-11",
    dev: [
      "설정 페이지 별점 섹션에 평가 분포 차트 추가 (별점 준 사용자 한정)",
      "설정 페이지에 국가별 접속 TOP 5 슬라이드 티커 추가",
      "Worker /rating 응답에 ratings 분포 데이터 추가",
      "Worker /top-countries 공개 엔드포인트 추가",
      "Worker 공개 엔드포인트 Redis pipeline 응답 파싱 버그 수정",
      "별점 평가 후 리뷰 프롬프트 반복 표시 버그 수정 (permanent dismiss 처리)",
      "별점 유도 패널에서 평가 시 즉시 닫고 상단 토스트로 변경",
      "통계 페이지 국가명에서 국가 코드 괄호 표기 제거",
    ],
    changes: {
      ko: [
        "설정 페이지에 별점 분포 차트 추가",
        "설정 페이지에 국가별 접속 순위 TOP 5 표시",
        "별점 평가 후 리뷰 요청이 반복되던 버그 수정",
        "별점 유도 패널 UX 개선 — 평가 시 즉시 닫힘",
      ],
      en: [
        "Added rating distribution chart in settings",
        "Added top 5 countries ticker in settings",
        "Fixed review prompt repeating after rating",
        "Improved rating prompt UX — closes immediately after rating",
      ],
    },
  },
  {
    version: "0.7.0",
    date: "2026-03-11",
    dev: [
      "캐릭터 데이터 보강: stats(HP/Hunger/Sanity), perks, motto, difficulty, 한국어 번역 추가",
      "캐릭터 목록 페이지 (/characters) — 전체 캐릭터 그리드, 난이도·스탯 표시",
      "캐릭터 개별 페이지 (/character/[slug]) — SEO 텍스트(Overview, Abilities, Playstyle), FAQ(FAQPage schema), 전용 아이템 링크, 관련 캐릭터 내부 링크",
      "캐릭터 SEO 텍스트 생성기 (generateCharacterSeoText) 추가",
      "sitemap.ts에 캐릭터 페이지 추가",
      "browse 페이지에 캐릭터 섹션 추가",
    ],
    changes: {
      ko: [
        "캐릭터 가이드 페이지 추가 — 19명 캐릭터별 스탯, 능력, 전용 아이템, FAQ",
        "캐릭터 목록 페이지 추가 (/characters)",
      ],
      en: [
        "Added character guide pages — stats, perks, exclusive items, and FAQ for all 19 characters",
        "Added characters listing page (/characters)",
      ],
    },
  },
  {
    version: "0.6.0",
    date: "2026-03-11",
    dev: [
      "SEO 텍스트 자동 생성 시스템 (src/lib/seo-text.ts) — food/boss/item 페이지 전체 적용",
      "Food 페이지: How to Cook, Stats Explanation, Best Ingredients 섹션 + FAQ(details/summary) + FAQPage schema + Related Recipes 내부 링크",
      "Boss 페이지: Overview, Loot Description, Strategy 섹션 + FAQ + FAQPage schema + Related Bosses 내부 링크",
      "Item 페이지: How to Craft, Uses and Tips 섹션 + FAQ + FAQPage schema",
      "모든 페이지 H1에 SEO 키워드 포함 (Recipe | DST, Boss Guide, Crafting Guide)",
      "meta description 강화 — 'Learn how to...' + 'See ingredients, stats, and tips' 형태로 변경",
      "통계 페이지에 일자별 누적 접속자 그래프 추가",
      "admin IP 누적 세트(dst:admin-ips) Worker 버그 수정",
    ],
    changes: {
      ko: [
        "음식/보스/아이템 개별 페이지에 설명 텍스트, FAQ, 관련 항목 링크 추가 (SEO 강화)",
        "통계 페이지에 일자별 누적 접속자 그래프 추가",
      ],
      en: [
        "Added SEO text sections (How to cook/craft, FAQ, tips) to all food/boss/item pages",
        "Added cumulative visitors chart to stats page",
      ],
    },
  },
  {
    version: "0.5.1",
    date: "2026-03-09",
    dev: [
      "보스 탭 즐겨찾기 기능 추가 (useFavorites 훅 연동, BossCard/BossDetail에 하트 토글)",
      "최근 조회 아이콘을 역행의 시계(pocketwatch_warp.png)로 변경 (제작/요리/보스 전체)",
      "공통 컴포넌트/훅 대규모 리팩토링: DetailPanel, SortDropdown, ViewCount, useDetailPanel, useSlideAnimation, stat-utils 추출",
      "BackToHome 컴포넌트에 iOS safe-area-inset-top 패딩 추가",
      "Footer/SupportPill 하단 여백 축소",
      "Admin 클릭 카운트 배지 스타일을 rounded-full 뱃지로 변경",
    ],
    changes: {
      ko: [
        "보스 탭 즐겨찾기 기능 추가",
        "최근 조회 아이콘 변경 (역행의 시계)",
        "릴리즈/통계 페이지 상단 상태바 겹침 수정",
        "푸터 하단 여백 조정",
      ],
      en: [
        "Added favorites to Bosses tab",
        "Changed recent icon to Backstep Watch",
        "Fixed status bar overlap on releases/stats pages",
        "Adjusted footer bottom padding",
      ],
    },
  },
  {
    version: "0.5.0",
    date: "2026-03-09",
    dev: [
      "iOS Safe Area: viewport-fit: cover + z-60 status bar cover div로 상세 패널 오픈 시 상태바 딤 방지",
      "하단 safe-area-inset-bottom 패딩 Footer/SupportPill에서 개별 처리",
      "Footer 리디자인: Ko-fi 도네이션 버튼 부각 + GitHub/Mail 아이콘 + sr-only SEO 링크",
      "SupportPill 컴포넌트 신규 — 모든 상세 패널 하단에 Ko-fi 도네이션 버튼 추가",
      "브레드크럼 개선: 탭 이름(Crafting Guide 등)을 중간 세그먼트로 추가",
      "탭 재탭 시 해당 탭 홈으로 이동 (dst-tab-go-home 커스텀 이벤트)",
      "클릭 수 표시: admin은 그리드 아이템에 카운트 표시, 전체 유저는 상세에서 조회수 표시",
      "요리솥 시뮬레이션 결과 추적 (trackItemClick sim: prefix) + 결과 카드에 cooked 횟수 표시",
      "최근 조회 카테고리: 모든 탭(제작/요리/보스)에 localStorage 기반 최근 본 항목 카테고리 추가",
      "use-recent.ts 훅 신규 (localStorage, MAX_RECENT=30)",
      "i18n: recent 키 추가",
    ],
    changes: {
      ko: [
        "iOS 상태바 딤 현상 수정",
        "푸터 디자인 개선 — 후원 버튼 부각",
        "모든 상세 패널 하단에 후원 버튼 추가",
        "브레드크럼에 탭 이름 표시",
        "탭 재탭 시 홈으로 이동",
        "아이템 조회수 표시 (상세 패널)",
        "요리솥 시뮬레이션 결과 횟수 표시",
        "최근 조회 카테고리 추가 (제작/요리/보스 전체 탭)",
      ],
      en: [
        "Fixed iOS status bar dimming when panels open",
        "Footer redesign — donation button prominence",
        "Added donation button to all detail panels",
        "Breadcrumb now shows tab name",
        "Re-tap active tab to go home",
        "Item view count display (detail panels)",
        "Cookpot simulation result tracking",
        "Recently viewed category added to all tabs",
      ],
    },
  },
  {
    version: "0.4.3",
    date: "2026-03-06",
    dev: [
      "요리 상세 스탯(체력/허기/정신력) UI를 카드형 → 가로 인라인으로 변경",
      "유통기한/조리시간/온도를 가로 인라인 한 줄로 통합, flex-1 균등 배치",
      "온도 라벨 'Temp' 번역 누락 수정 → i18n cooking_temp 키 추가",
      "단위 텍스트(일, 초) text-muted-foreground 적용",
      "재료 수량 표기 ×2 → 2 로 간소화 (비교 연산자 ≥ 등은 유지)",
      "데브 메뉴: 스탯 디자인 비교 페이지 추가",
    ],
    changes: {
      ko: [
        "요리 상세 스탯 UI 개선 — 가로 인라인 레이아웃으로 변경",
        "유통기한·조리시간·온도를 한 줄로 통합 표시",
        "온도 라벨 한국어 번역 추가",
        "재료 수량 표기 간소화 (×2 → 2)",
      ],
      en: [
        "Cooking detail stat UI redesign — horizontal inline layout",
        "Perish/cook time/temperature merged into a single row",
        "Added Korean translation for temperature label",
        "Simplified ingredient quantity display (×2 → 2)",
      ],
    },
  },
  {
    version: "0.4.2",
    date: "2026-03-06",
    dev: [
      "보스 전리품 검색: SearchWithSuggestions + TagChip 패턴 적용 (드롭다운 서제스천 + 태그)",
      "보스 블루프린트 pill 클릭 → 제작 탭 해당 아이템 상세로 이동 (cross-tab navigation)",
      "제작 탭 '블루프린트 필요' 칩 클릭 → 보스 전리품 검색으로 이동",
      "블루프린트 pill에 점선 밑줄(클릭 가능 힌트) 추가",
      "모든 상세 패널 하단 여백을 푸터와 동일하게 통일 (safe-area-inset-bottom)",
      "디바운스 전체 300ms 통일 (요리 200→300, 요리솥 신규 추가)",
      "i18n: boss_loot_search, boss_loot_search_result 키 추가",
    ],
    changes: {
      ko: [
        "보스 전리품 검색 기능 추가 — 드롭다운 + 태그 방식",
        "보스 블루프린트 클릭 시 제작법으로 이동",
        "제작 상세 '블루프린트 필요' 클릭 시 보스 전리품 검색으로 이동",
        "모든 상세 패널 하단 여백 통일 (아이폰 safe area)",
        "검색 디바운스 300ms 통일",
      ],
      en: [
        "Added boss loot search — dropdown suggestions + tag chips",
        "Blueprint loot click navigates to crafting recipe",
        "Crafting 'Blueprint Required' click navigates to boss loot search",
        "Unified bottom padding on all detail panels (iPhone safe area)",
        "Unified search debounce to 300ms",
      ],
    },
  },
  {
    version: "0.4.1",
    date: "2026-03-06",
    dev: [
      "보스/요리 탭 '전체' 카테고리에 2×2 합성 아이콘(bosses_all.png, cooking_all.png) 적용",
      "BossesApp: CSS 그리드 → 단일 합성 이미지로 교체",
      "CookingApp: meatballs.png → cooking_all.png로 교체",
      "허기 추천 임계값 75→62.5 (미트볼, 몬스터 타르타르 포함)",
      "Footer 하단 여백 0.75rem→1.5rem (아이폰 모서리 여유)",
      "보스 상세: 카테고리 뱃지 수동 span → TagChip 컴포넌트",
      "보스 상세: 전리품 표시를 TagChip 스타일 pill로 통일 (아이콘+라벨)",
      "블루프린트 전리품: BP 텍스트 → 블루프린트 아이콘 사용",
      "공포의 쌍둥이 nameKo를 ko.po 통칭('공포의 쌍둥이')으로 변경",
    ],
    changes: {
      ko: [
        "보스/요리 탭 '전체' 카테고리 아이콘 개선 (2×2 합성 이미지)",
        "허기 추천에 미트볼 포함",
        "보스 상세 전리품 UI 개선 — 칩 스타일로 통일",
        "블루프린트 전리품에 블루프린트 아이콘 표시",
        "공포의 쌍둥이 이름 수정",
        "푸터 하단 여백 추가 (아이폰 하단 여유)",
      ],
      en: [
        "Improved boss/cooking 'All' category icons (2×2 composite image)",
        "Meatballs now included in hunger recommendations",
        "Boss detail loot UI improved — unified chip style",
        "Blueprint loot now shows blueprint icon",
        "Fixed Twins of Terror Korean name",
        "Added footer bottom padding for iPhone",
      ],
    },
  },
  {
    version: "0.4.0",
    date: "2026-03-06",
    dev: [
      "CraftingItem 타입에 healthCost, nounlock, builderSkill 필드 추가",
      "워톡스 3개 아이템 버그 수정: characterOnly + station: character 추가",
      "맥스웰 리워크 반영: deprecated 그림자 인형 4개 제거 (Logger/Miner/Digger/Duelist)",
      "Codex Umbra에 healthCost: 50 추가",
      "111개 아이템에 builderSkill 메타데이터 추가 (10개 캐릭터)",
      "316개 아이템에 nounlock: true 추가",
      "14개 아이템에 healthCost 추가 (Telltale Heart, Meat Effigy, Wormwood 등)",
      "ItemDetail에 체력 소모/스킬트리/스테이션 필요 표시 UI 추가",
      "cookpot-ingredients: rawCookable 필드 추가, 꽃잎/나뭇잎 raw 버전 요리솥 제외",
      "Milkmade Hat(우유 짜는 모자) 요리 레시피 추가 + 시뮬레이터 매칭 함수",
      "FoodType에 nonfood 타입 추가",
      "i18n에 health_cost, skill_tree_required, station_required, prototypable, foodtype_nonfood 번역 키 추가",
    ],
    changes: {
      ko: [
        "워톡스 아이템 버그 수정 — 캐릭터 전용 + 스킬트리 표시",
        "맥스웰 리워크 반영 — deprecated 그림자 인형 제거",
        "아이템 상세에 체력 소모, 스킬트리, 스테이션 필요 정보 표시",
        "요리솥에 넣을 수 없는 raw 꽃잎/나뭇잎 제거 (말린 것만 유효)",
        "우유 짜는 모자 요리 레시피 추가 + 시뮬레이터 지원",
        "111개 스킬트리 레시피 + 316개 스테이션 전용 아이템 데이터 추가",
      ],
      en: [
        "Fixed Wortox items — added character-only + skill tree display",
        "Applied Maxwell rework — removed deprecated shadow puppets",
        "Added health cost, skill tree, and station-required info to item details",
        "Removed raw petals/foliage from crock pot (only dried versions valid)",
        "Added Milkmade Hat cooking recipe + simulator support",
        "Added 111 skill tree recipes + 316 station-only item data",
      ],
    },
  },
  {
    version: "0.3.1",
    date: "2026-03-05",
    dev: [
      "ReviewPrompt.tsx 신규 생성 — iOS 스타일 바텀시트 (별점 + GitHub Star + 공유)",
      "AppShell.tsx에 방문 횟수 카운트 + 리뷰 프롬프트 트리거 로직 추가",
      "Worker POST /rate 엔드포인트 추가 (HINCRBY dst:ratings)",
      "Worker /event에 share, github_star_click 이벤트 타입 추가",
      "Worker /stats에 ratings, avgRating, totalRatings 응답 필드 추가",
      "analytics.ts에 submitRating() 함수 + trackEvent 타입 확장",
      "i18n.ts에 review_* 번역 키 6개 추가 (ko/en)",
      "stats/page.tsx에 별점 분포 통계 카드 추가",
      "docs/terminology.md에 리뷰 프롬프트 용어 추가",
    ],
    changes: {
      ko: [
        "리뷰 프롬프트 추가 — 5회 이상 방문 시 별점 평가, GitHub Star, 공유 요청",
        "통계 페이지에 별점 분포 차트 추가",
      ],
      en: [
        "Added review prompt — star rating, GitHub Star, and share after 5+ visits",
        "Added rating distribution chart to stats page",
      ],
    },
  },
  {
    version: "0.3.0",
    date: "2026-03-04",
    dev: [
      "SettingsPage에 PWA 설치 가이드 섹션 추가 (beforeinstallprompt + iOS Safari 가이드)",
      "i18n.ts에 PWA 설치 관련 번역 키 6개 추가 (ko/en)",
      "로딩화면 MutationObserver + data-app-ready → DOMContentLoaded 기반으로 변경",
      "el.remove() → display:none으로 변경 (React hydration 불일치 방지)",
      "AppShell에서 data-app-ready 속성 제거",
    ],
    changes: {
      ko: [
        "설정에 앱 설치 가이드 추가 — 브라우저별 PWA 설치 안내",
        "통계/릴리즈 노트 페이지 진입 시 로딩화면이 오래 표시되던 문제 수정",
        "하위 페이지에서 뒤로가기 시 에러 발생하던 문제 수정",
      ],
      en: [
        "Added PWA install guide in settings — browser-specific installation instructions",
        "Fixed loading screen staying too long on stats/release notes pages",
        "Fixed back navigation error from sub-pages",
      ],
    },
  },
  {
    version: "0.2.1",
    date: "2026-03-01",
    dev: [
      "reqTranslations(CookingApp.tsx), cookpot-ingredients.ts nameKo, ko.ts foods를 DST 한글모드 ko.po 기준으로 전면 수정",
      "CLAUDE.md에 Korean Translation Rules 섹션 추가 — 번역 기준 문서화",
    ],
    changes: {
      ko: [
        "요리 재료/음식 이름을 한글모드 번역에 맞춰 수정",
      ],
      en: [
        "Fixed cooking ingredient/food names to match Korean community translation mod",
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-03-01",
    dev: [
      "src/app/favicon.ico 삭제 — Next.js App Router route convention 충돌 해소, public/favicon.ico만 사용",
      "Worker: ADMIN_EMAILS 환경변수 추가 (wrangler.toml), Env 인터페이스 확장",
      "Worker /auth/google: 이메일 화이트리스트 매칭 시 JWT에 role: admin 포함",
      "Worker /stats: Bearer JWT 인증 + role === admin 검증 필수, 미인증 시 401",
      "use-auth.tsx: JWT payload에서 role 추출, isAdmin: boolean 컨텍스트에 노출",
      "favorites-api.ts: AuthUser에 role?: string 추가",
      "i18n.ts: insight 번역 키 추가 (ko: 통계, en: Insight)",
      "SettingsPage: isAdmin일 때 Insight 버튼 (BarChart3 아이콘) 표시",
      "analytics.ts: isAdmin() localStorage 방식 제거, trackVisit/initDurationTracking/trackEvent에 skipTracking 파라미터 추가",
      "analytics.ts: fetchAnalytics(token) — JWT를 Authorization 헤더에 포함",
      "stats/page.tsx: 비관리자 접근 시 홈 리다이렉트, 7일 추이 SVG 영역(area) 차트로 변경",
    ],
    changes: {
      ko: [
        "파비콘이 시크릿모드에서 정상 표시되도록 수정",
        "관리자 전용 통계 페이지 — 로그인 기반 접근 제어",
        "설정에 통계(Insight) 바로가기 추가 (관리자만 표시)",
        "7일 접속 추이 차트를 영역(area) 차트로 개선",
      ],
      en: [
        "Fixed favicon not showing in incognito mode",
        "Admin-only stats page with login-based access control",
        "Insight shortcut in settings (visible to admins only)",
        "7-day trend chart upgraded to area chart",
      ],
    },
  },
  {
    version: "0.1.1",
    date: "2026-03-01",
    dev: [
      "릴리즈 노트 페이지 다국어 지원 (changes를 { ko, en } 구조로 변경)",
      "releases/page.tsx를 client component로 전환 (useSettings 사용)",
      "i18n.ts에 release_notes 번역 키 추가",
      "SettingsPage Release Notes 링크 텍스트 다국어 처리",
    ],
    changes: {
      ko: [
        "릴리즈 노트 다국어 지원 — 언어 설정에 따라 한국어/영어 표시",
      ],
      en: [
        "Release notes now displayed in your selected language",
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-03-01",
    dev: [
      "Google Identity Services (GIS) renderButton 방식 로그인 구현",
      "Worker에 JWT 발급/검증 (HMAC SHA-256) + /auth/google 엔드포인트 추가",
      "Worker에 GET/POST /favorites 엔드포인트 추가 (Redis Set)",
      "use-auth.tsx: AuthProvider + useAuth 훅 (GIS renderButton, JWT localStorage 저장)",
      "use-favorites.tsx: FavoritesProvider + useFavorites 훅 (비로그인=localStorage, 로그인=Redis)",
      "favorites-api.ts: Worker 즐겨찾기 API 클라이언트",
      "로그인/비로그인 즐겨찾기 완전 분리 (마이그레이션 없음)",
      "제작탭 즐겨찾기 카운트: 제작 아이템만 필터링 (요리 포함 안 됨)",
      "ItemIcon/ItemDetail/RecipeCard/RecipeDetail에 인게임 체력 아이콘 즐겨찾기 토글 추가",
      "CategoryGrid/CookingApp에 즐겨찾기 카테고리 타일 추가",
      "SettingsPage에 Google 로그인/프로필/로그아웃 UI (key prop으로 DOM 재사용 방지)",
      "비로그인 즐겨찾기 매번 경고 토스트 구현",
      "설정 브랜딩 텍스트 스타일 변경 + 버전정보 하단 이동",
      "wrangler.toml에 GOOGLE_CLIENT_ID 변수 추가",
      "CORS 헤더에 Authorization 허용 + localhost 지원",
    ],
    changes: {
      ko: [
        "즐겨찾기 기능 추가 — 아이템과 레시피를 즐겨찾기로 저장",
        "Google 로그인 — 기기 간 즐겨찾기 동기화",
        "모든 아이템 카드와 상세 패널에 즐겨찾기 토글",
        "제작/요리 홈 화면에 즐겨찾기 카테고리 타일",
        "설정에 계정 섹션 (로그인/로그아웃)",
        "비로그인 시 즐겨찾기 저장 경고 토스트",
      ],
      en: [
        "Added favorites — save items and recipes to your favorites",
        "Google sign-in — sync favorites across devices",
        "Favorite toggle on all item cards and detail panels",
        "Favorites category tile on crafting/cooking home screens",
        "Account section in settings (sign in/out)",
        "Warning toast when saving favorites without signing in",
      ],
    },
  },
  {
    version: "0.0.4",
    date: "2026-02-28",
    dev: [
      "Desktop grid max-width 4xl constraint + mx-auto center alignment",
      "AppShell title bar removed, branding moved to SettingsPage",
      "Release Notes page added at /releases route (server component)",
      "Analytics Worker ALLOWED_ORIGIN changed from github.io to vercel.app",
      "Worker parseOS() reordered: iOS check before macOS to fix UA matching",
      "Redis dst:os hash migrated via one-time /migrate-os endpoint",
      "public/favicon.ico replaced with icon-192.png derived ICO",
      "Removed Vercel template SVGs (vercel.svg, next.svg, file.svg, globe.svg, window.svg)",
      "CLAUDE.md updated with release notes workflow rules",
    ],
    changes: {
      ko: [
        "데스크톱 레이아웃 개선 (콘텐츠 중앙 정렬)",
        "깔끔한 UI: 타이틀 바 제거로 화면 공간 확보",
        "릴리즈 노트 페이지 추가 (설정 > 릴리즈 노트)",
        "새 도메인에서 통계가 로드되지 않던 문제 수정",
        "iOS 기기가 macOS로 잘못 표시되던 문제 수정",
        "앱 파비콘이 정상 표시되도록 수정",
      ],
      en: [
        "Improved desktop layout with centered content",
        "Cleaner UI: title bar removed for more screen space",
        "Release Notes page added (Settings > Release Notes)",
        "Fixed analytics not loading on new domain",
        "Fixed iOS devices incorrectly showing as macOS in stats",
        "App favicon now shows correctly",
      ],
    },
  },
  {
    version: "0.0.3",
    date: "2026-02-27",
    dev: [
      "Vercel migration: removed basePath, switched from static export to SSR",
      "SEO: added cooking keywords to metadata, updated OG tags",
      "Title rebranding + meta theme-color dark mode support",
      "Cooking tab category icons changed to meatballs",
      "SearchWithSuggestions extracted as shared component",
    ],
    changes: {
      ko: [
        "더 빠른 호스팅으로 이전 (Vercel)",
        "검색 엔진 노출 개선",
        "앱 브랜딩 업데이트",
        "요리 탭 아이콘 새로고침",
        "모든 탭에서 검색 추천 사용 가능",
      ],
      en: [
        "Migrated to faster hosting (Vercel)",
        "Improved search engine visibility",
        "Updated app branding",
        "Cooking tab icons refreshed",
        "Search suggestions now available across all tabs",
      ],
    },
  },
  {
    version: "0.0.2",
    date: "2026-02-26",
    dev: [
      "CookingApp component with full recipe browsing",
      "RecipeDetail bottom sheet with stats grid, requirements parser, effect badges",
      "CookingSearchInput with recipe suggestion dropdown",
      "TagChip + filter system for foodType/station/effect",
      "Recommend categories: health >= 40, sanity >= 15, hunger >= 75",
    ],
    changes: {
      ko: [
        "새 요리 탭: 모든 요리솥 레시피 탐색",
        "레시피 상세 정보 — 체력, 허기, 정신력 수치",
        "레시피 이름으로 검색",
        "음식 유형, 조리 기구, 특수 효과 필터",
        "체력, 정신력, 허기 추천 레시피",
      ],
      en: [
        "New Cooking tab: browse all crock pot recipes",
        "Recipe details with health, hunger, sanity stats",
        "Search recipes by name",
        "Filter by food type, cooking station, and special effects",
        "Recommended recipes for health, sanity, and hunger",
      ],
    },
  },
  {
    version: "0.0.1",
    date: "2026-02-25",
    dev: [
      "Initial release: Next.js 16 App Router + Tailwind v4 + shadcn/ui",
      "CraftingApp with category grid, item grid, item detail bottom sheet",
      "Tag-based search with SearchBar + useSearch hook",
      "CharacterSelector for character-specific items",
      "i18n system with 13 locales, client-side locale detection",
      "Dark/light/system theme via useSettings hook + localStorage",
      "PWA: manifest.json + service worker + installable",
      "Analytics: Cloudflare Worker + Upstash Redis",
    ],
    changes: {
      ko: [
        "첫 출시!",
        "카테고리별 모든 제작 레시피 탐색",
        "아이템 상세 정보: 재료, 제작대, 캐릭터 정보",
        "스마트 자동완성 검색",
        "캐릭터 전용 아이템 탐색",
        "13개 언어 지원",
        "다크/라이트 테마",
        "앱으로 설치 가능 (PWA)",
      ],
      en: [
        "First release!",
        "Browse all crafting recipes by category",
        "View item details: materials, crafting stations, character info",
        "Search items with smart autocomplete",
        "Browse character-specific items",
        "13 languages supported",
        "Dark and light theme",
        "Install as app (PWA)",
      ],
    },
  },
];

export default function ReleasesPage() {
  const { resolvedLocale } = useSettings();
  const changes = (release: Release) =>
    resolvedLocale === "ko" ? release.changes.ko : release.changes.en;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        <h1 className="text-lg font-bold">{t(resolvedLocale, "release_notes")}</h1>

        {releases.map((release) => (
          <section key={release.version} className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold">v{release.version}</h2>
              <span className="text-xs text-muted-foreground">{release.date}</span>
            </div>
            <ul className="space-y-1 text-sm text-foreground/80">
              {changes(release).map((change, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">-</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
