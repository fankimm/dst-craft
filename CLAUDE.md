# CLAUDE.md

## Communication Rules
- 유저가 모호하게 요청하면 바로 작업하지 말고, 용어집(docs/terminology.md)의 용어로 확인 질문을 한 뒤 진행할 것
- 용어집에 없는 새 UI 요소나 개념이 등장하면 용어집에 추가 제안할 것
- 작업 중 발견한 프로젝트 구조, 배포 방식, 기술 스택 등 중요한 정보는 이 CLAUDE.md에 자동으로 추가/갱신할 것

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

## Release Notes Rules
- 배포 전 `src/app/releases/page.tsx`의 릴리즈 노트를 업데이트할 것
- 새 버전 번호는 릴리즈 노트 페이지의 기존 버전을 참고하여 결정
- `src/lib/version.ts`의 `APP_VERSION`도 함께 업데이트
- 버전 규칙: patch(0.0.x) = 버그픽스/소규모 변경, minor(0.x.0) = 기능 추가, major(x.0.0) = 대규모 변경
- 릴리즈 노트는 `dev`(개발용)와 `changes`(사용자용) 두 필드로 구분
  - `dev`: 기술적 변경 사항 (코드, 인프라, 내부 구조 등) — 노출되지 않음
  - `changes`: 사용자가 이해할 수 있는 변경 사항 — 화면에 표시됨
  - 먼저 `dev`를 작성하고, 그중 사용자에게 의미 있는 항목만 `changes`로 재작성
