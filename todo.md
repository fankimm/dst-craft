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
- [ ] WX-78 회로 한글모드↔영문 스크랩북 수치 불일치 검토 (2026-05-08)
  - 발견: 연산 회로(maxsanity1) — 영문 +40 / 한글 +100 (한글모드 오역, 실제 인게임 동작 +40)
  - 자동 검증 결과: maxhealth2(영문 ×, 한글 5%), maxhunger1(한글 5%), movespeed2(영문 15%/10%, 한글 40%/3) 등 한글이 추가 정보 또는 다른 표기를 가진 모듈 다수
  - 결정: 어떤 기준(영문 공식 vs 한글모드 vs 실제 코드)을 표시 기준으로 할지 + 불일치 모듈별 처리
  - 임시 조치: maxsanity1.stats.maxSanity = 100 (한글 표기 기준). 실제 동작은 +40이라 vital 합산이 인게임과 다를 수 있음

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

## 트래픽·SEO 인사이트 액션 (2026-05-08)
> 근거: Vercel 30일 visitors 3,094 (+209%) / GSC 28일 클릭 1.02k·노출 8.26만·CTR 1.2%·평균 순위 7.6위 / CF는 5/7 cutover라 baseline 미정.
> 분석 세션 결과 정리. CF Web Analytics는 baseline 누적(1주)되면 재검토.

- [ ] **WX-78 페이지 SEO 강화** — 평균 순위 7.6위 → 1~3위 노리기. 회로 시리즈가 검색 트래픽 견인 중인데 ROI 최고
  - 대상 페이지: `/ko/skill-tree/wx-78`(CTR 16.6%), `/item/{zaptrocuter, chessmaster-circuit, redignition-circuit, sonic-invoker-circuit, spatializer-circuit, rangebooster-circuit}`, `/item/celestial-scion`
  - description 메타·structured data(`Game`/`SoftwareApplication` 등) 점검
  - sitemap priority/lastmod 조정
- [ ] **referrer 풀 URL 저장** — DC인사이드(m.dcinside + gall.dcinside) 30일 ~300명(9%) 유입. 어떤 갤러리 글에서 들어오는지 모름
  - bun-api `/api/stats` 스키마에 `referrer_url` 컬럼 추가 (현재 도메인만 저장)
  - 프론트 analytics 호출 시 `document.referrer` 풀 URL 전달
  - admin /stats 페이지에 referrer URL Top N 표시
- [ ] **싱가포르 봇 트래픽 검증·차단** — Vercel 30일 SG 28%, CF 동일. 실유저 비율로는 비정상
  - bun-api 로그에서 SG IP 패턴 분석 (CIDR 후보 추출)
  - CF Firewall rule로 의심 IP 차단 또는 challenge
  - Web Analytics에서 SG 필터링 시 실제 한국 비중 확인
- [ ] **메인 추천 카드 — bounce rate 개선** — 현재 76% (DST 가이드 특성상 자연스러우나 75%↓ 시도)
  - 메인에서 인기 회로/스킬트리/요리로 유도하는 추천 카드 도입
  - "최근 본 항목" 또는 "이 캐릭터의 회로" 같은 cross-link
- [ ] **CF Web Analytics baseline 누적 후 재분석** (2026-05-14 이후) — 현재 5/7 cutover라 1주치 baseline 부족. 일주일 뒤 CF 단독으로 분석 가능

---

## 대기 (다음 작업 후보)

- [x] **CF "static cache" rule 좁히기 — All requests → 정적 자산만** (2026-05-07 완료)
  - expression: `true` → 정적 자산만 (/_next/static/, /images/, /icons/, 확장자 매칭)
  - edge_ttl: `override_origin 1d` → `respect_origin`
  - CF API로 적용, HTML `cache-control: public, max-age=60` origin 헤더 살아있음 확인
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
