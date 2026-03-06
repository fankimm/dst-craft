# CLAUDE.md

## Communication Rules
- 유저가 모호하게 요청하면 바로 작업하지 말고, 용어집(docs/terminology.md)의 용어로 확인 질문을 한 뒤 진행할 것
- 용어집에 없는 새 UI 요소나 개념이 등장하면 용어집에 추가 제안할 것
- 작업 중 발견한 프로젝트 구조, 배포 방식, 기술 스택 등 중요한 정보는 이 CLAUDE.md에 자동으로 추가/갱신할 것

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

## Architecture
- **프론트엔드**: `src/` — Next.js App Router, Vercel 자동 배포 (main 브랜치 push)
- **백엔드 Worker**: `worker/` — 같은 레포 내 Cloudflare Worker (analytics + 인증 + 즐겨찾기 API)
  - 배포: `cd worker && npx wrangler deploy`
  - 시크릿: `JWT_SECRET` (wrangler secret), `UPSTASH_REDIS_REST_URL/TOKEN` (wrangler secret)
  - 환경변수: `ALLOWED_ORIGIN`, `GOOGLE_CLIENT_ID` (wrangler.toml)
- **데이터 저장**: Upstash Redis (유저 정보, 즐겨찾기, 애널리틱스)
- **인증**: Google Identity Services (GIS) — 클라이언트 측 renderButton 방식

## Key Paths
- `src/data/` — 게임 데이터 (categories, characters, materials, items/)
- `src/components/crafting/` — 메인 앱 컴포넌트
- `src/components/cooking/` — 요리 탭 컴포넌트
- `src/components/settings/` — 설정 페이지
- `src/hooks/` — 커스텀 훅 (use-crafting-state, use-settings, use-search, use-auth, use-favorites)
- `src/lib/` — 유틸리티 (types, i18n, crafting-data, utils, favorites-api)
- `src/lib/version.ts` — 앱 버전 (`APP_VERSION`)
- `src/app/releases/page.tsx` — 릴리즈 노트 페이지
- `worker/index.ts` — Cloudflare Worker (API 엔드포인트)
- `worker/wrangler.toml` — Worker 설정
- `docs/terminology.md` — UI 용어집
- `docs/ui.md` — UI/UX 가이드 (컴포넌트 패턴, 레이아웃 규칙)

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
  workshop: ~/Library/Application Support/Steam/steamapps/workshop/content/322330/
  한글모드: ~/Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/
  ko.po:   ~/Library/Application Support/Steam/steamapps/workshop/content/322330/2391246365/scripts/languages/ko.po
```

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

## Mistakes & Lessons (오답노트)
- 작업 중 실수/교훈은 **`docs/mistakes.md`** 에 기록할 것. 같은 실수 반복 방지 목적.
- 새 작업 전 반드시 참조할 것.

## Release Notes Rules
- 배포 전 `src/app/releases/page.tsx`의 릴리즈 노트를 업데이트할 것
- 새 버전 번호는 릴리즈 노트 페이지의 기존 버전을 참고하여 결정
- `src/lib/version.ts`의 `APP_VERSION`도 함께 업데이트
- 버전 규칙: patch(0.0.x) = 버그픽스/소규모 변경, minor(0.x.0) = 기능 추가, major(x.0.0) = 대규모 변경
- 릴리즈 노트는 `dev`(개발용)와 `changes`(사용자용) 두 필드로 구분
  - `dev`: 기술적 변경 사항 (코드, 인프라, 내부 구조 등) — 노출되지 않음
  - `changes`: 사용자가 이해할 수 있는 변경 사항 — 화면에 표시됨
  - 먼저 `dev`를 작성하고, 그중 사용자에게 의미 있는 항목만 `changes`로 재작성
