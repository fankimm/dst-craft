# DST Craft — TODO

> 프로젝트 전체 작업 목록. `/todo`로 확인 후 작업 이어서 진행.
> 상태: `[ ]` 미착수 · `[~]` 진행중 · `[x]` 완료

---

## 진행중

### 요리탭 검색 개선 [~] (2026-04-14)
- [~] useCookingSearch() 훅 생성 — 제작탭 useSearch()와 동일한 UX, 요리 전용 로직
- [ ] 다중 태그 필터 조합 지원 (예: "고기" + "요리솥")
- [ ] 서제스천 개선 — 제한 해제, 분류 체계 통일
- [ ] 검색 중 상태 UI 명확화
- [ ] 설명 필드 검색 추가

---

## 스킬트리 시뮬레이터 개선 [~] (2026-04-15)
> MVP 완료 (admin 전용). 아래 항목 완료 후 일반 공개.

### 그래프 레이아웃 (공개 차단)
- [ ] connects 관계 기반 DAG 레이아웃 구현 — 현재 리스트 뷰를 실제 분기/병렬 구조 그래프로 교체
  - 한 노드에서 여러 자식 분기 (OR gate)
  - 여러 부모 합류 (AND gate / lock gate)
  - 건너뛰기 가능한 선택적 경로
  - 인게임 스킬트리와 동일한 구조 표현
- [ ] SVG/CSS 기반 연결선 (분기/합류 시각화)

### UI/UX
- [x] 스킬 노드 카드 가로폭 고정
- [x] 브레드크럼 제작탭 스타일로 통일
- [x] 스킬 상세 패널에 해금 조건 표시
- [x] 습득 포인트 "남은 포인트" 형식
- [x] 스킬 아이콘 292개 추출 (TEX 아틀라스)

### 데이터/번역
- [x] ko.po 번역 크로스체크 (288개 100% 일치)
- [x] 최대 스킬 포인트: 15

### 잠금 로직
- [x] lockType: "manual" 15개 노드 + 체크박스 토글

### 크로스탭 연동
- [x] 제작탭 스킬 TagChip → 스킬트리 이동

### 공개 조건
- [ ] 그래프 레이아웃 완료 후 AppShell의 `adminOnly: true` 제거

---

## 스크랩북 데이터 마이그레이션 [~] (2026-04-20)
> 설계: `docs/scrapbook-migration.md`
> 수작업 item-stats-v3 → 인게임 scrapbookdata.lua 기반으로 교체

- [x] Phase 1: 파이프라인 — `scripts/convert-scrapbook.py` 작성 + `scrapbook-stats.ts` 생성 (1541개 엔트리, specialinfo ko/en 799개)
- [x] Phase 2: 타입 + 데이터 통합 — ItemDetail에서 scrapbookStats 직접 조회, 스킬트리 역참조는 v3에 3개뿐이라 보류
- [x] Phase 3: UI 재작성 — ItemStatsPanel을 ScrapbookStats 기반으로 재작성 (인게임 렌더 순서), Beta 뱃지 제거
- [~] Phase 4: 정리 + 배포 — v3 삭제 (현재 dead code), 브라우저 확인 후 삭제, 테스트, 릴리즈

---

## 대기 (다음 작업 후보)

- [ ] **CF "static cache" rule 좁히기 — All requests → 정적 자산만** (2026-05-07, 우선순위 높음)
  - 현재 룰이 모든 요청을 잡고 Edge TTL을 "Ignore cache-control header, 1 day"로 강제함 → HTML도 1일 캐시 → 신규 배포 후 옛 chunk hash 가리키며 origin 404 → PWA 클라 예외 (방금 인시던트)
  - 임시 방어: deploy-frontend.sh가 자동 CF purge (commit bab9a02). 5분 내 재배포 시는 여전히 stale 가능.
  - **수동 작업 (CF 대시보드 → Caching → Cache Rules → "static cache" → Edit)**:
    1. "If incoming requests match…" → "Custom filter expression" 으로 변경
    2. expression:
       ```
       (starts_with(http.request.uri.path, "/_next/static/")) or (starts_with(http.request.uri.path, "/images/")) or (starts_with(http.request.uri.path, "/icons/")) or (ends_with(http.request.uri.path, ".png")) or (ends_with(http.request.uri.path, ".jpg")) or (ends_with(http.request.uri.path, ".jpeg")) or (ends_with(http.request.uri.path, ".webp")) or (ends_with(http.request.uri.path, ".svg")) or (ends_with(http.request.uri.path, ".woff")) or (ends_with(http.request.uri.path, ".woff2")) or (ends_with(http.request.uri.path, ".ico"))
       ```
    3. Edge TTL → "Use cache-control header if present, cache request with Cloudflare's default TTL for the response status if not"
    4. Save
  - 검증:
    ```
    curl -sI https://www.dstcraft.com/ | grep -iE 'cache-control|cf-cache'
    # cache-control: public, max-age=60, must-revalidate (origin 그대로 살아있어야 함)
    curl -sI https://www.dstcraft.com/_next/static/chunks/<hash>.js
    # cache-control: public, max-age=31536000, immutable, cf-cache-status: HIT
    ```
- [ ] **Vercel → Mac mini 셀프호스팅 이주** (2026-05-07, 우선순위 높음) — Vercel Hobby edge req 한도 임박. Phase 1: `beta.dstcraft.com` 정적 셀프호스팅. 상세: `TODO-self-hosting.md`. **Mac mini SSH 세션에서 진행할 것**.
- [ ] **git 히스토리 이메일 재작성** (2026-04-27, 우선순위 높음) — 회사 계정(kolon.com) 314커밋이 GitHub에 노출됨. 다른 머신(macOS 권장)에서 진행. 상세 계획: `TODO-rewrite-email-history.md`
- [x] 누락된 보스 추가 (2026-04-14) — 8종
- [x] 건조대/구이 등 비요리솥 음식 정보 (2026-04-14) — 구이 31종 + 건조 6종
- [x] 요리솥 시뮬 — 최근 시도한 재료 / 선호 재료 기능 (2026-04-14)
- [ ] SEO — 스탯 데이터를 SSG 페이지(`/item/[slug]`)에도 반영

---

## 완료

### 캐릭터 선호 음식 표시 ✅ (2026-04-14)
- [x] 인게임 소스 기반 선호 음식 데이터 추출 (`food-affinity.ts`)
- [x] 요리 탭 RecipeDetail에 캐릭터 초상화+이름 배지 표시

### item-stats v3 리스트럭처링 ✅ (2026-04-09)
> 상세: `TODO-item-stats-v3.md`
- [x] ItemStatsV3 인터페이스 + 버전 훅
- [x] v2→v3 마이그레이션 (434개 아이템)
- [x] ItemStatsPanel 컴포넌트 (4그룹: 전투/방어/유틸리티/특수)
- [x] 전 카테고리 effects 리라이팅 (스펙시트→가이드 톤)
- [x] 번역 크로스체크 + 오답노트
