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
- Mac Mini 셀프호스팅 (Nginx + Cloudflare Tunnel), PWA 지원

## Session Start
- 세션 시작 시 글로벌 SessionStart hook이 `git fetch --all --prune` + `git pull --ff-only`를 자동 실행. Claude는 hook 출력을 확인하여 충돌/divergence가 있으면 사용자에게 알릴 것.
- ff-only 실패(브랜치 발산) 시 임의로 merge/rebase하지 말고 사용자에게 상태 보고.

## Branch & Deploy Strategy

**핵심 원칙**: feat 단위로 격리해서 작업하고, beta는 staging-only(검증용 여러 feat 합집합), main은 통과한 feat만 골라 머지. `/release`가 "beta 전체 → main"이 아니라 **"특정 feat 브랜치 → main"** 으로 동작.

### 배포 매핑
- `beta` push → `beta.dstcraft.com` (Mac mini 셀프호스팅, Cloudflare Tunnel, GitHub Actions self-hosted runner)
- `main` push → `www.dstcraft.com` (Production, 동일 runner)

### 작업 진입점: `/task`
**모든 코드 변경 작업은 `/task <한 줄 설명>`으로 시작**한다. 이 스킬이 다음을 자동 처리:
- GitHub 이슈 오픈 (제목/AC 초안 → 사용자 확인)
- main에서 분기한 `feat/<issue-num>-<slug>` 브랜치 생성
- `../dst-craft-<issue-num>` 워크트리 생성
- 현재 세션이 그 워크트리로 `cd` 이동 → 같은 세션에서 그대로 작업 진행

**왜**: feat 단위 격리로 main 머지 시 의도치 않은 변경 혼입 방지. 멀티 세션 충돌이 우려되면 다른 세션을 정리한 뒤 진행.

코드 변경이 없는 질문/탐색/설명만 `/task` 없이 메인 세션에서 답변. **메타/문서 변경(CLAUDE.md, `.claude/skills/`, `docs/`, `memory/`)도 같은 워크트리 패턴**을 따른다 — 일관성을 위해 예외 없음.

### feat 워크트리 워크플로우 (`/task` 이후)
1. **feat 분기 base는 항상 `main`** — `/task`가 자동으로 `git worktree add ../dst-craft-<num> -b feat/<num>-<slug> origin/main` 수행
   - `beta`에서 분기하지 말 것 — beta의 in-flight 커밋이 딸려 들어와 main 머지 시 의도치 않은 변경 포함 가능
   - feat끼리 독립 → 한 feat이 다른 feat의 미완성 변경을 끌어들이지 않음
2. **워크트리 안에서 작업 + 커밋** — `feat/<num>-<slug>` 브랜치에 누적 (`/task`가 현재 세션을 워크트리로 cd 이동시킨 뒤 그대로 진행)
3. **beta 배포 (staging)** — `/beta` 호출. 미커밋 변경이 있으면 자동으로 commit + origin push 한 뒤, 타겟 브랜치를 `beta`에 머지·푸시 → `beta.dstcraft.com` 자동 배포
   - 인자 없으면 현재 워크트리 브랜치. 다른 feat을 빠르게 beta로 올리려면 `/beta <브랜치명|이슈번호|이슈URL|자연어>`
   - 릴리즈노트/버전은 **건드리지 않음** — deploy-only
   - `/beta clear` 서브커맨드로 누적된 staging 머지를 청산 (origin/beta를 origin/main 기준으로 리셋, 파괴적 — 사용자 확인 필수)
4. **테스트 통과** — beta.dstcraft.com에서 의도대로 동작 확인
5. **main 머지 (production 배포)** — `/release` 호출. 인자 없으면 현재 워크트리 브랜치를 자동 인식.
   - `/release`가 그 feat 브랜치 하나만 main에 `--no-ff` merge
   - 머지 커밋에 `Closes #<num>` 자동 포함 → GitHub가 이슈 자동 close
   - main 머지 직전에 릴리즈노트/버전 bump를 한 번에 작성 (그 feat 분량만)
6. **워크트리 정리** — `/release`가 자동으로 `git worktree remove ../dst-craft-<num>` + `git branch -d` 처리

### 메인 워킹 디렉터리 규칙
- 메인 워킹 디렉터리(`/Users/jihwan-kim3/private-works/dst-craft`)는 항상 `main` 브랜치 유지
- 새 작업 시작 시 워크트리 생성 제안 (다른 feat과의 충돌 방지)
- SessionStart hook은 워크트리 디렉터리에서는 그 브랜치를 그대로 유지함 (main 강제 X)

### Beta 워크트리 (영속)
- 별도 워크트리 `../dst-craft-beta`에 `beta` 브랜치를 영속 유지 (없으면 `/beta` 스킬이 자동 생성: `git worktree add ../dst-craft-beta beta`)
- `/beta` 스킬은 이 워크트리에서 fetch/pull/머지/push 수행 — 메인 워크트리(=main)를 건드리지 않음
- 이 워크트리에서 직접 작업 금지 — 오직 `/beta`가 배포 용도로만 사용

### 직접 작업 / 머지 방향 규칙
- **`main` 직접 작업 금지** — 사용자가 *명시적으로* main 작업/푸시를 요청한 경우에만 허용
- **`beta` 직접 작업 금지** — 메타든 docs든 모두 워크트리 패턴(`/task` → `/beta` → `/release`)을 따른다
- **`main ← beta` 방향 머지 절대 금지** — beta는 in-flight feat의 합집합 검증용일 뿐 main의 입구가 아니다. `git merge --ff-only beta`(main에서) / `git merge beta` 등 beta를 main으로 흘리는 모든 명령 금지. 어기면 검증 안 끝난 다른 feat의 in-flight 커밋이 production에 따라 들어간다 (2026-05-08 사고, `docs/mistakes.md` 참조)
- **올바른 머지 방향**: `feat → beta` (=`/beta`), `feat → main` (=`/release`) 두 가지뿐. 두 쪽으로 각각 직접 머지하는 구조

### beta 브랜치 정리
- beta는 main + 검증중 feat들의 합집합. 머지된 feat가 main에 들어가도 beta에 남아있음 (no-op)
- **언제든 청소 가능** — beta는 staging 배포 전용이라 오염됐다 싶으면 `/beta clear`로 origin/main 기준으로 다시 만들면 됨. 파괴적 작업이 아닌 일상 청소.

### 슬래시 명령어 의미 정리
- **`/beta [타겟]`**: 미커밋 변경이 있으면 자동 commit + origin push, 그다음 타겟 브랜치를 `beta`에 머지·푸시 → `beta.dstcraft.com` 자동 배포. 인자 없으면 현재 워크트리 브랜치. 인자는 브랜치명 / 이슈번호 / 이슈URL / 자연어
- **`/beta clear`**: origin/beta를 origin/main 기준으로 리셋 (staging 청소). 일상 작업 — 오염됐다 싶으면 호출
- **`/release [타겟]`**: 타겟 브랜치를 `main`에 머지·푸시 → `www.dstcraft.com` Production 배포. 릴리즈노트/버전 bump 작성. 워크트리 정리

Vercel은 watchdog failover 용도로만 유지 (Phase 6 자동 DNS 전환).

## Architecture
- **프론트엔드**: `src/` — Next.js Static Export → Nginx serving (Cloudflare Tunnel 뒤)
  - 빌드: `npm run build` → `out/` (정적 파일)
  - 배포: `scripts/deploy-frontend.sh main|beta` (timestamped release + atomic symlink swap)
  - 캐시: prod HTML 1분, beta HTML no-store, 정적 자산 1년 immutable
- **백엔드 API**: `bun-api/` — Bun + Hono (localhost:3001, Nginx reverse proxy → `/api/*`)
  - DB: SQLite (`~/dstcraft/data/app.db`, WAL mode)
  - 관리: macOS launchd (`com.dstcraft.api.plist`) — 크래시 시 자동 재시작
  - 라우트: analytics, auth, skills, favorites, feedback, kofi-supporters, config
  - 헬스체크: `/_debug/health`
- **레거시 Worker**: `worker/` — Cloudflare Worker (코드 잔존, 트래픽은 bun-api로 전환 완료)
- **데이터 저장**: SQLite (Upstash Redis → SQLite 마이그레이션 완료, `bun-api/scripts/migrate-upstash.ts`)
- **백업**: 매일 04:00 UTC, `~/Backups/dstcraft/app-$TS.db.gz` (14일 보관)
- **인증**: Google Identity Services (GIS) — 클라이언트 측 renderButton 방식
- **모니터링**: Cloudflare Worker `watchdog/` (Cron Trigger 1분 주기)가 prod `/api` 헬스 감지 + Telegram 알림. 3/3 실패 시 GitHub Actions watchdog을 `workflow_dispatch`로 호출 → Vercel 자동 failover 등 복구 수행 (Worker는 SSH 불가). GitHub schedule은 Worker 장애 대비 백업 감지로만 유지

## TODO Management
- `todo.md` — 프로젝트 전체 TODO (진행중/대기/완료)
- `/todo` 스킬로 세션 시작 시 상태 확인 + 작업 재개
- 대규모 작업은 별도 `TODO-*.md` 파일 생성 후 `todo.md`에서 참조
- 작업 시작 → `[~]`, 완료 → `[x]` + 날짜

## Key Paths
- `src/data/` — 게임 데이터 (categories, characters, materials, items/, scrapbook-stats)
- `src/components/crafting/ItemStatsPanel.tsx` — 스크랩북 기반 아이템 스펙 렌더링 (인게임 scrapbookscreen.lua 순서)
- `src/components/crafting/` — 메인 앱 컴포넌트
- `src/components/cooking/` — 요리 탭 컴포넌트
- `src/components/console/` — 콘솔 명령어 탭 컴포넌트
- `src/components/skills/` — 스킬트리 시뮬레이터 탭 컴포넌트
- `src/components/settings/` — 설정 페이지
- `src/data/skill-trees/` — 스킬트리 데이터 (11캐릭터, 번역, 타입)
- `src/hooks/` — 커스텀 훅 (use-crafting-state, use-settings, use-search, use-auth, use-favorites, use-skill-tree)
- `src/lib/` — 유틸리티 (types, i18n, crafting-data, utils, favorites-api)
- `src/lib/version.ts` — 앱 버전 (`APP_VERSION`)
- `src/data/game-version.ts` — DST 게임 데이터 기준 버전 (릴리즈 번호, Steam buildid, 갱신일)
- `src/app/releases/page.tsx` — 릴리즈 노트 페이지
- `src/lib/seo-text.ts` — SEO 텍스트 자동 생성 (food/boss/item/character)
- `src/app/character/[slug]/page.tsx` — 캐릭터 개별 SEO 페이지
- `src/app/characters/page.tsx` — 캐릭터 목록 페이지
- `bun-api/src/index.ts` — Bun API 서버 엔트리포인트
- `bun-api/infra/nginx-dstcraft.conf` — Nginx 설정 (prod/beta 서버 블록)
- `bun-api/infra/nginx-dstcraft-common.conf` — Nginx 공통 룰 (캐시, 프록시, 정규화)
- `bun-api/infra/com.dstcraft.api.plist` — API 서버 launchd 에이전트
- `bun-api/infra/com.dstcraft.backup.plist` — DB 백업 launchd 에이전트
- `bun-api/infra/com.dstcraft.goaccess-bots.plist` + `goaccess-bots.sh` — 봇 전용 GoAccess 대시보드 (1시간마다 `~/dstcraft/bots.html` 생성, `:7891/bots.html`로 접근)
- `scripts/deploy-frontend.sh` — 프론트엔드 배포 스크립트 (main/beta). prod 배포 시 IndexNow ping 호출
- `scripts/indexnow-ping.py` — sitemap.xml의 전체 URL을 IndexNow API에 제출 (Bing 등 즉시 색인 유도). prod 배포에서만, best-effort
- `public/<key>.txt` — IndexNow 키 파일 (`BingSiteAuth.xml`과 함께 SEO 검증 자산, 삭제 금지). 키 변경 시 `indexnow-ping.py`의 `KEY` 상수도 함께 갱신
- `.github/workflows/deploy-beta.yml` — GitHub Actions 배포 워크플로우 (self-hosted runner, main+beta)
- `.github/workflows/deploy.yml` — GitHub Pages 배포 (레거시, 미사용)
- `watchdog/` — 헬스 감지 Cloudflare Worker (Cron 1분, Telegram 알림, KV로 중복 알림 억제). 배포/시크릿 절차는 `watchdog/README.md`
- `.github/workflows/watchdog.yml` — 헬스 복구 담당 (3/3 실패 시 Telegram 긴급 + DNS failover). schedule은 백업 감지. Mac mini 복구 후 DNS 복귀는 수동: `gh workflow run watchdog.yml -f failback=true`
- `worker/index.ts` — Cloudflare Worker (레거시, 일부 analytics)
- `worker/wrangler.toml` — Worker 설정 (레거시)
- `docs/terminology.md` — UI 용어집
- `docs/ui.md` — UI/UX 가이드 (컴포넌트 패턴, 레이아웃 규칙)
- `docs/scrapbook-migration.md` — 스크랩북 데이터 마이그레이션 설계 (히스토리)
- `src/data/scrapbook-stats.ts` — 인게임 scrapbookdata.lua 기반 아이템 스펙 (1541개, specialinfo ko/en 799개) — 자동 생성, 수정 금지
- `scripts/convert-scrapbook.py` — scrapbookdata.lua + strings.lua + ko.po → scrapbook-stats.ts 생성 파이프라인

## Deploy Checklist
배포 전 반드시 확인:
1. **프론트엔드**: `main`/`beta` push → GitHub Actions가 자동 빌드+배포 (수동: `scripts/deploy-frontend.sh main|beta`)
2. **bun-api**: `bun-api/` 변경 시 push하면 GitHub Actions가 자동 재시작 (main만, beta는 무시)
3. **Nginx 설정**: `bun-api/infra/nginx-*.conf` 변경 시 Mac Mini에서 수동 `nginx -s reload` 필요
   - **Drift 주의**: 실서버 `/usr/local/etc/nginx/snippets/dstcraft-common.conf` ↔ 레포 `bun-api/infra/nginx-dstcraft-common.conf`. 실서버를 직접 편집했으면 반드시 레포에도 동일하게 반영해 단일 진실 공급원 유지 (안 그러면 다음 push 때 롤백됨)
4. **watchdog Worker**: `watchdog/` 변경 시 자동 배포 없음 — `cd watchdog && npx wrangler deploy` 수동 실행 필요
5. **환경변수**: `.env.local`에 새 `NEXT_PUBLIC_*` 변수 추가 시 Mac Mini의 빌드 환경에도 반영 확인
6. **Cloudflare 캐시**: 배포 스크립트가 자동 purge (`~/.cf-env` 필요). 수동 purge 필요 시 CF 대시보드
7. **Google Cloud Console**: 새 도메인 추가 시 승인된 JavaScript 원본에 등록 확인
8. **릴리즈 노트 + 버전**: 아래 Release Notes Rules 참고

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

## Game Data Sync Pipeline
- **단일 진입점**: `bash scripts/sync-game-data.sh` — 게임 데이터 갱신은 이 1커맨드로 끝낸다. 개별 converter (`convert-scrapbook.py`, `extract-raw-foods.py`, `verify-skill-trees.py`)는 sync 스크립트가 호출하므로 평소엔 직접 돌릴 일 없음.
- 동작: Steam manifest의 buildid를 읽어 `~/dst-game-snapshot/buildid.txt`와 비교 → 같으면 no-op으로 빠르게 종료, 다르면 `scripts.zip`을 스냅샷 레포에 재추출하고 ko.po 복사 → 스냅샷에 `buildid <X> @ <date>` 커밋 → 모든 converter 일괄 실행 → `src/data/game-version.ts`의 `steamBuildId`/`dataUpdatedAt` 자동 갱신 (release 번호는 manifest에 없어 수동).
- `--force` 플래그로 buildid 같아도 재실행 가능 (스크립트 수정 등 디버깅용).
- 스냅샷 레포 `~/dst-game-snapshot/`: 로컬 전용 git 레포로 빌드별 `scripts/` + `ko.po` 추적. **원격 푸시 금지** (Klei 자산). `git -C ~/dst-game-snapshot log` 로 빌드 히스토리, `git -C ~/dst-game-snapshot diff HEAD~1 -- scripts/recipes.lua` 같은 식으로 핫픽스별 변경점 직접 검사 가능. 첫 실행 시 자동 생성.
- 내부 호환: 기존 converter들이 `/tmp/dst-{extract,scrapbook}/scripts/...` 경로를 기대하므로 sync 스크립트가 그 경로를 `~/dst-game-snapshot` 으로 심볼릭 링크. 따라서 converter 스크립트 자체는 무수정으로 동작.

## Item Stats Pipeline Rules
- 아이템 스펙은 인게임 `scripts/scrapbookdata.lua` 자동 생성 데이터를 단일 진실 공급원으로 사용 (v0.13.0부터)
- `src/data/scrapbook-stats.ts`는 `scripts/convert-scrapbook.py`가 자동 생성 — **수동 편집 금지**
- 갱신 절차: 통합 `bash scripts/sync-game-data.sh` 한 번이면 끝. (개별 실행 fallback: Steam 업데이트 후 `python3 scripts/convert-scrapbook.py`)
- 변환 스크립트는 `scrapbookdata.lua`(수치) + `strings.lua`(영문) + ko.po(한국어 specialinfo + DATA_* 라벨)를 합쳐 `ScrapbookStats` 구조 출력
- 렌더링 컴포넌트: `src/components/crafting/ItemStatsPanel.tsx` — 인게임 `scrapbookscreen.lua` 렌더 순서 그대로 (피해→내구→방어→수리→방수→보온→정신력→지속→유통기한→진영→specialinfo)
- 누락된 보조 매핑(set_bonus 상세, skill_tree 효과 등)은 specialinfo 텍스트가 대부분 커버 — 구조화가 필요하면 별도 매핑 테이블로 추가 (코드 외 데이터)
- 설계 히스토리: `docs/scrapbook-migration.md`

## Raw Foods Pipeline Rules
- "생식 가능" 카테고리(요리탭)에 표시되는 원재료의 hunger/health/sanity/perish 값은 인게임 `prefabs/{veggies,mushrooms,meats,...}.lua`의 `inst.components.edible` 자동 추출 데이터 사용 (v0.23.14부터, #22)
- `src/data/raw-foods.ts`는 `scripts/extract-raw-foods.py`가 자동 생성 — **수동 편집 금지**
- 갱신 절차: 통합 `bash scripts/sync-game-data.sh` 한 번이면 끝. (개별 실행 fallback: `python3 scripts/extract-raw-foods.py` — `/tmp/dst-extract/scripts/` 가 스냅샷 심볼릭 링크여야 함)
- 추출 패턴 3종:
  1. `prefabs/veggies.lua`의 `VEGGIES = { ... }` 테이블 (MakeVegStats 위치 인자 1=seedweight, 2=hunger, 3=health, 4=perish, 5=sanity)
  2. `prefabs/mushrooms.lua`의 pickloot=red/green/blue_cap 블록
  3. `prefabs/{meats,butter,honey,egg,acorn,...}.lua`의 per-prefab `inst.components.edible.{foodtype,hungervalue,healthvalue,sanityvalue}` 직접 설정
- 한국어 이름은 ko.po(`STRINGS.NAMES.<ID>`)에서 자동 매칭. 누락 시 영문 fallback
- 정확하지 않은 항목은 스크립트 상단의 `OVERRIDES` dict에 명시적으로 수정 (예: butter → foodtype dairy)
- 제외할 항목은 `EXCLUDE_IDS`에 ID 추가 (예: acorn — FOODTYPE.SEEDS, raw 식용 의미 없음)
- 렌더링: `src/components/cooking/CookingApp.tsx`의 `RawFoodGrid` + `RawFoodDetail` (요리탭 "raw" 카테고리에서만)

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
