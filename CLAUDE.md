# CLAUDE.md

## Communication Rules
- 유저가 모호하게 요청하면 바로 작업하지 말고, 용어집(docs/terminology.md)의 용어로 확인 질문을 한 뒤 진행할 것
- 용어집에 없는 새 UI 요소나 개념이 등장하면 용어집에 추가 제안할 것
- 작업 중 발견한 프로젝트 구조, 배포 방식, 기술 스택 등 중요한 정보는 이 CLAUDE.md에 자동으로 추가/갱신할 것

## Code Quality Rules
- **한 탭에 요청된 기능/변경은 나머지 탭(제작/요리/보스)에도 자동 적용할 것** — 요리솥 탭은 구조가 다르므로 예외이나, 적용 가능하다고 판단되면 함께 적용
- **중복 코드는 자동으로 공통화할 것** — 2곳 이상에서 동일/유사한 패턴이 발견되면 공유 컴포넌트, 훅, 유틸리티로 추출. 유저 요청을 기다리지 않고 선제적으로 수행
- 공통화 후 반드시 `docs/ui.md`의 공유 컴포넌트/훅 목록을 업데이트할 것
- 새 UI 작업 시 `docs/ui.md`의 화면 구조도와 공유 컴포넌트 목록을 먼저 확인하여 기존 것을 재사용
- 화면 구조가 변경되면(탭 추가, 새 패턴 도입 등) `docs/ui.md`의 화면 구조도를 자동 업데이트할 것

## UI Design Rules
- **새 화면/컴포넌트 작성 전 반드시 `docs/ui.md` 참고** — 기존 UI 패턴과 통일성 유지
- 게임 아이템 나열(재료, 전리품 등)은 반드시 `ItemSlot` 사용, 메타 정보(카테고리, 속성)는 `TagChip` 사용
- 기존 컴포넌트로 표현 가능한 경우 새 UI를 만들지 말 것 — 통일성 우선
- 아이콘/이미지 선택 시 **게임 내 이미지를 항상 우선** 사용할 것 (lucide/SVG 아이콘은 게임 이미지가 없을 때만 fallback)
- 개발/디버그 전용 페이지나 도구를 만들면 **DevMenu에 자동으로 항목 추가**할 것 (`src/components/AppShell.tsx`의 `DevMenu` → `items` 배열)

## Project
- Don't Starve Together 크래프팅 레시피 가이드 웹앱
- Next.js 16 (App Router, Static Export) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Vercel 배포, PWA 지원

## Branch & Deploy Strategy
- **`main` 브랜치**: Vercel Production 배포 (push 시 자동)
- **`커푸` (커밋+푸시) 요청 시**: `main` 브랜치에 push
- Vercel Preview(staging) 배포는 유료 플랜 필요 — 현재 미사용

## Architecture
- **프론트엔드**: `src/` — Next.js App Router, Vercel 자동 배포 (main 브랜치 push)
- **백엔드 Worker**: `worker/` — 같은 레포 내 Cloudflare Worker (analytics + 인증 + 즐겨찾기 API)
  - 배포: `cd worker && npx wrangler deploy`
  - 시크릿: `JWT_SECRET` (wrangler secret), `UPSTASH_REDIS_REST_URL/TOKEN` (wrangler secret)
  - 환경변수: `ALLOWED_ORIGIN`, `GOOGLE_CLIENT_ID` (wrangler.toml)
- **데이터 저장**: Upstash Redis (유저 정보, 즐겨찾기, 애널리틱스)
- **인증**: Google Identity Services (GIS) — 클라이언트 측 renderButton 방식

## TODO Management
- `todo.md` — 프로젝트 전체 TODO (진행중/대기/완료)
- `/todo` 스킬로 세션 시작 시 상태 확인 + 작업 재개
- 대규모 작업은 별도 `TODO-*.md` 파일 생성 후 `todo.md`에서 참조
- 작업 시작 → `[~]`, 완료 → `[x]` + 날짜

## Key Paths
- `src/data/` — 게임 데이터 (categories, characters, materials, items/, item-stats-v3)
- `src/data/item-stats-v3.ts` — v3 아이템 스펙 (구조화 필드: tags/character/resistance/set_bonus/repair/skill_tree/immunities/effects)
- `src/components/crafting/ItemStatsPanel.tsx` — v3 스펙 렌더링 컴포넌트 (4그룹: 전투/방어/유틸리티/특수)
- `src/components/crafting/` — 메인 앱 컴포넌트
- `src/components/cooking/` — 요리 탭 컴포넌트
- `src/components/skills/` — 스킬트리 시뮬레이터 탭 컴포넌트
- `src/components/settings/` — 설정 페이지
- `src/data/skill-trees/` — 스킬트리 데이터 (11캐릭터, 번역, 타입)
- `src/hooks/` — 커스텀 훅 (use-crafting-state, use-settings, use-search, use-auth, use-favorites, use-skill-tree)
- `src/lib/` — 유틸리티 (types, i18n, crafting-data, utils, favorites-api)
- `src/lib/version.ts` — 앱 버전 (`APP_VERSION`)
- `src/app/releases/page.tsx` — 릴리즈 노트 페이지
- `src/lib/seo-text.ts` — SEO 텍스트 자동 생성 (food/boss/item/character)
- `src/app/character/[slug]/page.tsx` — 캐릭터 개별 SEO 페이지
- `src/app/characters/page.tsx` — 캐릭터 목록 페이지
- `worker/index.ts` — Cloudflare Worker (API 엔드포인트)
- `worker/wrangler.toml` — Worker 설정
- `docs/terminology.md` — UI 용어집
- `docs/ui.md` — UI/UX 가이드 (컴포넌트 패턴, 레이아웃 규칙)
- `docs/stats/` — 인게임 소스 기반 아이템 스펙 md (파이프라인 산출물)
- `docs/item-stats-pipeline.md` — 아이템 스펙 추출 파이프라인 설계
- `docs/item-stats-todo.md` — 파이프라인 TODO

## Deploy Checklist
배포 전 반드시 확인:
1. **Vercel 환경변수**: `.env.local`에 새 `NEXT_PUBLIC_*` 변수가 추가됐으면 Vercel 대시보드에도 동일하게 설정할 것
   - 현재 필요: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_ANALYTICS_WORKER_URL`
2. **Worker 배포**: `worker/index.ts` 변경 시 `cd worker && npx wrangler deploy` 별도 실행
3. **Worker 시크릿**: 새 시크릿 추가 시 `npx wrangler secret put <KEY>` 실행 안내
4. **Google Cloud Console**: 새 도메인 추가 시 승인된 JavaScript 원본에 등록 확인
5. **릴리즈 노트 + 버전**: 아래 Release Notes Rules 참고

## Game & Mod Paths (per machine)
```
jihwan-kim3 (macOS):
  game:    ~/Library/Application Support/Steam/steamapps/common/Don't Starve Together/
  scripts: ~/Library/Application Support/Steam/steamapps/common/Don't Starve Together/dontstarve_steam.app/Contents/data/databundles/scripts.zip
  workshop: ~/Library/Application Support/Steam/steamapps/workshop/content/322330/
  한글모드: ~/Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/
  ko.po:   ~/Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/scripts/languages/ko.po
```

## Game Source Files (scripts.zip 내부)
인게임 데이터 원본. `unzip -o <scripts.zip 경로> "scripts/<파일>"` 로 추출하여 참조.

| 파일 | 역할 | 앱 관련성 |
|------|------|-----------|
| `scripts/recipes.lua` | 모든 제작법 (재료, 수량, 기술 티어, 제작대) | 제작탭 데이터 원본 |
| `scripts/tuning.lua` | 모든 수치 (내구도, 피해량, 흡수율, 체력/허기/정신력 등) | 아이템 스펙 원본 |
| `scripts/prefabs/*.lua` | 아이템별 동작 로직 (장착 효과, 세트보너스 등) | 특수 효과 설명용 |
| `scripts/preparedfoods.lua` | 요리솥 레시피 (재료 조건, 음식 스탯) | 요리탭 데이터 원본 |
| `scripts/preparedfoods_warly.lua` | 월리 전용 요리 레시피 | 요리탭 (월리) |
| `scripts/recipes_filter.lua` | 제작 카테고리 분류 정의 | 카테고리 구조 참조 |
| `scripts/techtree.lua` | 기술 트리 정의 (SCIENCE, MAGIC, ANCIENT 등) | 제작대/스테이션 매핑 |
| `scripts/strings.lua` | 영문 텍스트 (아이템 이름, 설명) | 영문명 원본 |
| `scripts/skilltreedata.lua` | 캐릭터 스킬트리 정의 | 캐릭터 전용 제작 조건 |
| `scripts/containers.lua` | 컨테이너 슬롯/크기 정의 | 저장소 아이템 정보 |
| `scripts/constants.lua` | 게임 상수 (FOODTYPE, EQUIPSLOTS 등) | 코드 해석용 |

## Korean Translation Rules
- 게임 내 아이템/재료/음식 이름의 한국어 번역 기준: **DST 커뮤니티 한글모드** ([Steam Workshop #2391246365](https://steamcommunity.com/sharedfiles/filedetails/?id=2391246365))
- 번역 원본 파일: 위 Game & Mod Paths의 `ko.po` 경로 참조
- 자체 번역 금지 — 반드시 `ko.po` 파일의 `msgstr` 값을 사용할 것
- ko.po 내 주요 문자열 패턴:
  - 아이템 이름: `STRINGS.NAMES.<ID>` → `msgstr`
  - 아이템 설명: `STRINGS.RECIPE_DESC.<ID>` → `msgstr`
  - 스킬트리 이름: `STRINGS.SKILLTREE.<CHARACTER>.<SKILL_ID>_TITLE` → `msgstr`
  - 스킬트리 설명: `STRINGS.SKILLTREE.<CHARACTER>.<SKILL_ID>_DESC` → `msgstr`
- 번역이 필요한 파일:
  - `src/components/cooking/CookingApp.tsx` — `reqTranslations` (요리 조건 번역)
  - `src/data/cookpot-ingredients.ts` — `nameKo` (재료 이름)
  - `src/data/locales/ko.ts` — 로캘 데이터 (아이템/스테이션 이름)

## Item Stats Pipeline Rules
- `docs/stats/*.md` 파일은 인게임 소스(tuning.lua, prefabs/*.lua)에서 추출한 아이템 스펙
- **양식 필수**: `## {id} — {영문명} ({한글명})` + `- {필드}: {값}` 형식. h3(###) 금지, 테이블 형식 금지
- **소스 참조**: 인게임 소스만 참조. `src/data/items.ts`, `item-stats.ts` 등 앱 소스 절대 참조 금지 (검증 대상이므로)
- **한글명**: 반드시 ko.po에서 `STRINGS.NAMES.<UPPER_ID>` → `msgstr` 확인. 추측 금지
- **함수명으로 동작 추측 금지**: 반드시 구현부(함수 본문)를 읽은 후 작성
- **프리팹 필수 확인**: tuning.lua만으로 스펙이 완전하다고 판단하지 말 것 (dapperness, SetConsumption, attackwear 등 프리팹에서만 설정하는 속성 있음)
- 상세 설계: `docs/item-stats-pipeline.md` 참조

## Skill Tree Verification
- `scripts/verify-skill-trees.py` — 인게임 `skilltree_<char>.lua` vs 우리 `src/data/skill-trees/*.ts` 정적 비교
  - 비교: 스킬 ID set, group, root, connects, locks(AND-deps), tags(set), lock_open 유무
  - 스킵: lock_open 함수 본문 의미론 (수동 검토)
  - 위그프리드는 정답지 (regression test)
- `scripts/fix-skill-tree-tags.py` — 그룹명-태그 누락 자동 수정 (lua 후처리 미러)
  - `--dry-run` 으로 미리보기
- 인게임 소스 추출: `unzip <scripts.zip> 'scripts/prefabs/skilltree_*.lua' -d /tmp/dst-extract/`
- 스킬트리 데이터 변경 후 항상 verify 실행

## Mistakes & Lessons (오답노트)
- 작업 중 실수/교훈은 **`docs/mistakes.md`** 에 기록할 것. 같은 실수 반복 방지 목적.
- 새 작업 전 반드시 참조할 것.
- **커밋 전 반드시 오답노트 작성 필요 여부를 체크**하고, 해당 작업에서 실수/교훈이 있었으면 오답노트를 먼저 작성한 뒤 커밋할 것.

## Release Notes Rules
- 배포(푸시) 또는 매 커밋 시 `src/app/releases/page.tsx`의 릴리즈 노트를 업데이트할 것
- 단, 적을만한 내용이 없으면 생략 가능 (예: 릴리즈 노트 자체 수정, 주석/타입/린트 정리, 문서만 수정 등 사용자에게 변화가 없는 경우)
- 새 버전 번호는 릴리즈 노트 페이지의 기존 버전을 참고하여 결정
- `src/lib/version.ts`의 `APP_VERSION`도 함께 업데이트
- 버전 규칙: patch(0.0.x) = 버그픽스/소규모 변경, minor(0.x.0) = 기능 추가, major(x.0.0) = 대규모 변경
- 릴리즈 노트는 `dev`(개발용)와 `changes`(사용자용) 두 필드로 구분
  - `dev`: 기술적 변경 사항 (코드, 인프라, 내부 구조 등) — 노출되지 않음
  - `changes`: 사용자가 이해할 수 있는 변경 사항 — 화면에 표시됨
  - 먼저 `dev`를 작성하고, 그중 사용자에게 의미 있는 항목만 `changes`로 재작성
