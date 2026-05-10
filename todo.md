# DST Craft — TODO

> 프로젝트 전체 작업 목록. `/todo`로 확인 후 작업 이어서 진행.
> 상태: `[ ]` 미착수 · `[~]` 진행중 · `[x]` 완료

---

## 진행중

### 요리탭 "생식 가능" 카테고리 [~] (#22, 2026-05-10)
- [x] DST prefabs에서 raw food stat 추출 스크립트 (`scripts/extract-raw-foods.py`) — VEGGIES 테이블 + mushrooms + per-prefab edible 패턴 3종 처리, TUNING 상수 자동 해석
- [x] `src/data/raw-foods.ts` 자동 생성 (35개) — id/name/nameKo/foodType/hunger/health/sanity/perishDays
- [x] 요리탭 카테고리 그리드 + `RawFoodGrid` + `RawFoodDetail` UI
- [ ] 검색 통합 — 현재 카테고리 그리드로만 접근. 차후 `useCookingSearch`에 raw food 인덱싱 추가 (별도 follow-up)
- [ ] 즐겨찾기/최근 통합 — raw food를 즐겨찾기 추가는 가능하나 "즐겨찾기" 카테고리는 cookingRecipes만 표시 (raw food 누락). `filteredRecipes` 로직 확장 필요 (별도 follow-up)
- [ ] 추가 raw food 항목 — eel/pondfish/pondeel/mole/trunk_summer/winter/mandrake/tallbirdegg/royal_jelly 등 누락 ~15-20개. 추출 스크립트의 SPECIAL_FILES 추가 또는 새 prefab 패턴 처리 (별도 follow-up)

### 요리탭 검색 개선 [~] (2026-04-14)
> 핵심 4개 sub-item은 #21로 완료(2026-05-09). description 추가만 보류 — 별도 이슈로 분리 후 이 섹션 [x]로.
- [x] useCookingSearch() 훅 생성 — 제작탭 useSearch()와 동일한 UX (다중 태그 AND, 300ms 디바운스, live preview, isSearching)
- [x] 다중 태그 필터 조합 지원 (예: "고기" + "요리솥") — `tags.every()` 기반 AND 체이닝으로 작동. OR 콤보(예: "고기 OR 생선")는 미지원, 별도 이슈로 분리 가능
- [x] 서제스천 개선 (#21, 2026-05-09) — `slice(0, 12)` 제한 제거 + 6단계 분류 정렬(foodType → ingredient tag → station → effect → individual ingredient → recipe name). foodType/station/effect 서제스천 신규 추가
- [x] 검색 중 상태 UI 명확화 (#21, 2026-05-09) — `useCookingSearch`에 `pending` 플래그 노출, `SearchWithSuggestions`가 디바운스 동안 Search 아이콘을 Loader2 스피너로 전환
- [ ] 설명 필드 검색 추가 — **보류**: DST `scripts/strings.lua`의 `STRINGS.RECIPE_DESC` 테이블은 제작 레시피용(BOOKSTATION, GUNPOWDER 등)이고 cookpot 음식에는 description이 없음. 자체 작성이 필요 → 별도 이슈로 분리하되 우선순위 낮음 (캐릭터별 음식 quote는 별개 기능)

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

## 트래픽·SEO 인사이트 액션 (2026-05-08)
> 근거: Vercel 30일 visitors 3,094 (+209%) / GSC 28일 클릭 1.02k·노출 8.26만·CTR 1.2%·평균 순위 7.6위 / CF는 5/7 cutover라 baseline 미정.
> 분석 세션 결과 정리. CF Web Analytics는 baseline 누적(1주)되면 재검토.

- [x] **WX-78 페이지 SEO 강화** ✅ (#14, 2026-05-09) — 평균 순위 7.6위 → 1~3위 노리기. 회로 시리즈가 검색 트래픽 견인 중인데 ROI 최고
  - sitemap.ts 우선 페이지 화이트리스트(`src/lib/seo-priority.ts`) — WX-78 스킬트리 + 회로 6종 + Celestial Scion 보스 priority 0.9/0.85, changeFrequency=weekly
  - SkillTreePageContent: VideoGame(DST) + SoftwareApplication(시뮬레이터) JSON-LD 추가, WebPage `about` 연결
  - ItemPageContent: WX-78 우선 아이템 title/description에 "WX-78 회로/Circuit" 키워드 보강 + HowTo `about: VideoGame` 추가
  - GSC 순위 영향은 배포 후 1~2주 모니터링 필요 (`/ko/skill-tree/wx-78` CTR 16.6% 기준선)
  - redignition→redigestion(`wx78module_digestion`) 오타 정정. `/item/celestial-scion`은 `/boss/celestial-scion`으로 보정
- [x] **referrer 풀 URL 저장** ✅ (#15, 2026-05-09) — DC인사이드(m.dcinside + gall.dcinside) 30일 ~300명(9%) 유입. 어떤 갤러리 글에서 들어오는지 모름
  - bun-api `analytics_referrer_urls(url PK, count, last_seen_at)` 테이블 + `/track`이 `referrerUrl` 수신/upsert (500자 클램프)
  - `/stats`는 admin에 한해 `referrerUrls: { url, count }[]` Top 50 반환 (URL에 PII 가능성)
  - 프론트 `src/lib/analytics.ts` + `layout.tsx` 인라인 스크립트가 외부 도메인일 때 `document.referrer` 풀 URL 전송
  - stats 페이지 admin 전용 "유입 URL" CollapsibleList 섹션 (Top 10 inline + DetailPanel 전체 50건)
- [~] **싱가포르 봇 트래픽 검증·차단** (#19, 2026-05-09) — Vercel/CF 30일 SG 28%, 실유저 비율로는 비정상
  - [x] analytics_uv DB로 SG IP 패턴 분석 — 335 IP 중 ~84%가 Tencent `43.128.0.0/10` + Alibaba `47.82/16` + Volcengine `43.119/16` + Alibaba HK `8.208/12`. UA는 outdated Chrome 로테이션 + Sogou spider
  - [x] nginx common.conf에 CIDR-regex IP 차단 룰 추가 — `$http_cf_connecting_ip` 매칭, `return 444`
  - [x] Mac mini nginx reload + origin 검증 (2026-05-09 17:32 KST 적용) — 포트 8080 직접 테스트로 4개 대역 모두 444, 경계 IP(43.127/43.192/8.207/8.224)는 200 통과 확인. 첫 80 포트 테스트는 macOS 기본 Apache가 응답하던 것 (`docs/mistakes.md` 추가)
  - [ ] 24h 후 SG 비중 재분석 — **2026-05-10 이후 실행**: `ssh mac-mini "sqlite3 ~/dstcraft/data/app.db \"SELECT substr(ip,1,instr(ip,'.'||substr(ip,instr(ip,'.')+1,99))-1) AS prefix2, COUNT(*) FROM analytics_uv WHERE date >= '2026-05-10' GROUP BY prefix2 ORDER BY 2 DESC LIMIT 20\""` 또는 기존 분석 스크립트 재사용. 차단 후 SG IP 트래픽이 0/매우 낮아야 정상
- [ ] **메인 추천 카드 — bounce rate 개선** — 현재 76% (DST 가이드 특성상 자연스러우나 75%↓ 시도)
  - 메인에서 인기 회로/스킬트리/요리로 유도하는 추천 카드 도입
  - "최근 본 항목" 또는 "이 캐릭터의 회로" 같은 cross-link
- [ ] **CF Web Analytics baseline 누적 후 재분석** (2026-05-14 이후) — 현재 5/7 cutover라 1주치 baseline 부족. 일주일 뒤 CF 단독으로 분석 가능

---

## 트래픽 분석 권장 액션 (2026-05-09)
> 근거: GoAccess + raw nginx access.log 3일 분석 (567명 / 99,646 요청 / 봇 ~10.2%)
> 우선순위: P0=실유저 영향, P1=품질, P2=보안/안정성. SEO 강화는 위 2026-05-08 섹션 참조.

### P0 — `/api/skills` 401 토큰 만료 처리 (실유저 영향) ✅ (#10, v0.23.5)
- [x] `src/lib/jwt.ts` + `src/lib/api-fetch.ts` 신설 (decodeJWTPayload + isJWTValid + apiFetch wrapper + AUTH_EXPIRED_EVENT)
- [x] favorites-api.ts 4함수, analytics.ts 5함수 wrapper 사용. fetchAnalytics는 token optional이라 inline 검증 + public fallback
- [x] useAuth가 auth:expired 이벤트로 자동 logout

### P1 — `_vercel/insights/*` 호출처 제거 (404 1,415건) ✅ (#11, v0.23.6)
- [x] 원인: layout.tsx의 `<Analytics />` (`@vercel/analytics`). Vercel 셀프호스팅 이주 후 잔존
- [x] import + 컴포넌트 제거, package.json/lock 정리

### P2 — nginx 보안/봇 차단 룰 ✅ (#12)
- [x] path 기반 차단: `/wp-*`, `/wordpress/*`, `/wp-admin/*`, `/wp-includes/*`, `/.env`, `/.git/*`, `xmlrpc.php`, `/test.php`, `/phpinfo*` → `return 444`
- [x] UA 기반 차단: `AhrefsBot|MJ12bot|TLM-Audit-Scanner` → `return 444`
- [x] AI 검색 + 검색 엔진 봇은 차단 안 함 명시 (주석)
- [x] **Mac mini reload 적용 완료** (2026-05-09) — 워커 프로세스 5/9 14:52:23 재시작 확인. 외부 검증: `/wp-admin`, `/.env`, `/xmlrpc.php`, `User-Agent: AhrefsBot` 모두 502 (origin 444 close), 정상 요청은 200

### P2 — 2026-05-07 17:33~18:31 bun-api 502 사고 RCA — 조사 완료, follow-up 분리
> 결론: 프로세스가 hang(deadlock 추정)이라 launchd KeepAlive(Crashed:true)는 트리거 안 됨. err.log 0바이트(stderr 안 씀), DiagnosticReports에 crash 없음, macOS unified log retention(2일) 만료로 직접 증거 소실. Watchdog은 정확히 감지했으나 **Telegram secrets 미설정으로 알림 안 갔음**.
- [x] err.log/crash report 확인 → 증거 없음
- [x] watchdog 동작 확인 → 08:34 UTC부터 3/3 fail 다수 기록, alert 미발송
- 후속 follow-up (#13):
  - [x] **`TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` repo secrets** — 사고 직후(2026-05-07) 사용자가 설정 완료. 향후 2/3·3/3 헬스 실패 시 자동 알림 발송됨
  - [x] **bun-api 액세스 로그에 ISO 타임스탬프 추가** — `bun-api/src/index.ts`의 `logger()`를 timestamp prefix wrapping으로 교체
  - [x] **watchdog 자동 복구 스텝 추가** — `vars.WATCHDOG_AUTORECOVER=1` flag 뒤에 Tailscale + SSH + launchctl kickstart. 활성화하려면 `.github/workflows/README-watchdog-secrets.md` 참고하여 `TS_AUTHKEY` / `SSH_PRIVATE_KEY` secrets + `WATCHDOG_AUTORECOVER` / `WATCHDOG_MACMINI_HOST` / `WATCHDOG_MACMINI_USER` vars 설정 필요
- 예상 작업량: 0.5d

---

## 대기 (다음 작업 후보)

- [x] **CF "static cache" rule 좁히기 — All requests → 정적 자산만** (2026-05-07 완료)
  - expression: `true` → 정적 자산만 (/_next/static/, /images/, /icons/, 확장자 매칭)
  - edge_ttl: `override_origin 1d` → `respect_origin`
  - CF API로 적용, HTML `cache-control: public, max-age=60` origin 헤더 살아있음 확인
- [ ] **Vercel → Mac mini 셀프호스팅 이주** (2026-05-07, 우선순위 높음) — Vercel Hobby edge req 한도 임박. Phase 1: `beta.dstcraft.com` 정적 셀프호스팅. 상세: `TODO-self-hosting.md`. **Mac mini SSH 세션에서 진행할 것**.
- [x] **Vercel 빌드를 사용자 영향 변경에만 한정** ✅ (#17, 2026-05-09) — `vercel.json`에 `ignoreCommand: bash scripts/vercel-ignore.sh` 추가. src/, public/, package*, next.config, tsconfig, postcss.config, vercel.json, scripts/generate-* 외 변경(docs, .claude, todo.md, memory, bun-api 등)은 Vercel 빌드 스킵. Hobby 한도 잠식 완화. drift 위험은 사용자 영향 변경 시 자연 해소 — failover 신뢰성 유지.
- [ ] **git 히스토리 이메일 재작성** (2026-04-27, 우선순위 높음) — 회사 계정(kolon.com) 314커밋이 GitHub에 노출됨. 다른 머신(macOS 권장)에서 진행. 상세 계획: `TODO-rewrite-email-history.md`
- [x] 누락된 보스 추가 (2026-04-14) — 8종
- [x] 건조대/구이 등 비요리솥 음식 정보 (2026-04-14) — 구이 31종 + 건조 6종
- [x] 요리솥 시뮬 — 최근 시도한 재료 / 선호 재료 기능 (2026-04-14)
- [ ] SEO — 스탯 데이터를 SSG 페이지(`/item/[slug]`)에도 반영

---

## 완료

### 스크랩북 데이터 마이그레이션 ✅ (2026-04-20 ~ 2026-05-09)
> 설계: `docs/scrapbook-migration.md`
> 수작업 item-stats-v3 → 인게임 scrapbookdata.lua 기반으로 교체. v2/v3 시대 파이프라인 잔재까지 정리 완료.
- [x] Phase 1: `scripts/convert-scrapbook.py` + `scrapbook-stats.ts` 생성 (1541개 엔트리, specialinfo ko/en 799개)
- [x] Phase 2: 타입 + 데이터 통합 — ItemDetail이 scrapbookStats 직접 조회
- [x] Phase 3: UI 재작성 — ItemStatsPanel을 ScrapbookStats 기반으로 (인게임 렌더 순서), Beta 뱃지 제거
- [x] Phase 4 (#18, 2026-05-09): v2/v3 잔재 정리 — `TODO-item-stats-v3.md`, `docs/item-stats-{pipeline,todo}.md`, `docs/stats/` 27개 md + i18n, `scripts/{md-to-v2,migrate-v2-to-v3,verify-v3-stats}.py` 삭제. CLAUDE.md Key Paths + Item Stats Pipeline Rules 섹션을 scrapbook 기반으로 갱신

### 캐릭터 선호 음식 표시 ✅ (2026-04-14)
- [x] 인게임 소스 기반 선호 음식 데이터 추출 (`food-affinity.ts`)
- [x] 요리 탭 RecipeDetail에 캐릭터 초상화+이름 배지 표시

### item-stats v3 리스트럭처링 ✅ (2026-04-09, v0.13.0에서 scrapbook 기반으로 대체됨)
- [x] ItemStatsV3 인터페이스 + 버전 훅
- [x] v2→v3 마이그레이션 (434개 아이템)
- [x] ItemStatsPanel 컴포넌트 (4그룹: 전투/방어/유틸리티/특수)
- [x] 전 카테고리 effects 리라이팅 (스펙시트→가이드 톤)
- [x] 번역 크로스체크 + 오답노트
