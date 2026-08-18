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
    version: "0.33.1",
    date: "2026-08-18",
    dev: [
      "fix(hydration): 딥링크 진입 시 React hydration mismatch 제거 (#76). `useState` lazy initializer 안에서 `window.location.search`를 읽어 화면 상태를 만들던 패턴을 공통 훅 `useUrlStateSync`(`src/hooks/use-url-state.ts`)로 교체. 첫 렌더는 서버 HTML과 동일한 기본값을 쓰고, 커밋 직후 layout effect에서 URL을 반영한다.",
      "정적 export된 서버 HTML은 항상 홈(카테고리 그리드)인데 lazy initializer는 첫 클라이언트 렌더에서 상세 뷰를 그려 구조적으로 어긋났다. crafting / cooking / bosses / skins 4개 탭에서 \"Hydration failed\" 발생 → 앱 트리 전체가 클라이언트에서 재생성되며 첫 페인트가 통째로 낭비.",
      "layout effect는 DOM 커밋 후 브라우저가 그리기 전에 동기 실행되므로 두 번째 렌더까지 같은 프레임에 끝난다 → v0.34.x대에 lazy initializer로 잡았던 딥링크 플리커는 재발하지 않는다. `useEffect`(페인트 후)와 lazy init(페인트 전이지만 서버와 불일치) 사이의 정확한 중간 칸.",
      "`AppShell`(activeTab), `SkillSimulatorApp`(selectedChar)은 원래 mount `useEffect` 방식이라 mismatch는 없었으나 플리커가 있었음 — 같은 훅으로 통일. `useCraftingState` / `useCookingState` / `useBossesState` / `SkinsApp`(view)까지 6곳 적용.",
      "state 자체는 호출부의 `useState`로 남긴다. 훅이 setter를 반환하면 React Compiler가 안정된 setter로 인식하지 못해 기존 `useCallback(..., [])` 메모이제이션이 전부 깨진다(inferred dependency 에러).",
      "검증: headless Playwright로 각 탭 딥링크 진입 시 콘솔 에러 0 (dev + 정적 프로덕션 빌드 양쪽). rAF 프레임별 DOM 시그니처를 찍어 main 브랜치 dev 서버와 전환 시각 분포를 비교 → 플리커 재발 없음. 뒤로가기 / 탭 전환 시퀀스도 main과 동일.",
      "docs: `docs/ui.md` 공유 훅 목록에 `useUrlStateSync` + lazy initializer 금지 규칙 추가, `docs/mistakes.md`에 오답노트 추가.",
    ],
    changes: {
      ko: [
        "공유받은 링크나 검색 결과로 특정 카테고리·아이템·레시피에 바로 들어올 때 화면을 처음부터 다시 그리던 문제를 고쳤습니다. 첫 화면이 더 빠르게 뜹니다.",
      ],
      en: [
        "Fixed an issue where opening a shared link or search result that points straight to a category, item, or recipe caused the page to be re-rendered from scratch. The first screen now appears faster.",
      ],
    },
  },
  {
    version: "0.33.0",
    date: "2026-08-14",
    dev: [
      "feat(ads): Ezoic 광고 자리 연동 (#75). `AdSlot`(`src/components/ads/AdSlot.tsx`) — 상단 띠 `top`(placeholder 111 mid_content), 상세 시트 `sheet`(103 bottom_of_page), 데스크탑 좌우 레일 `rail-left/right`(107/108 sidebar_floating). 번호는 Ezoic 대시보드의 위치 유형과 1:1이라 임의 선택 금지 — 101~104를 임의로 썼다가 왼쪽 레일에 970×105 가로 배너가 와서 옆 컨텐츠와 겹쳤다.",
      "번호는 탭이 아니라 **자리 역할** 단위로 공유. 탭 8개가 `display:none`으로 동시에 마운트돼 있으므로 IntersectionObserver로 보이는 탭의 자리에만 placeholder div를 그려 문서 내 중복 id를 막는다. 판정: 교차하면 활성 / 안 교차해도 레이아웃 박스가 있으면 활성 유지(스크롤 이탈) / 박스 0이면 비활성(탭 숨김).",
      "요청 배칭 — 자리마다 개별 `showAds(id)`를 부르면 Ezoic이 진행 중 사이클에 들어온 호출을 흘려 그 자리가 조용히 빈 채 남는다. 같은 전환의 요청을 `showAds(...ids)` 한 번으로 묶음(디바운스 250ms, 해제만 쌓이면 900ms, 최대 대기 1.5s).",
      "요청 큐를 참조 수가 아니라 **번호를 쥔 주인 토큰**(`desiredOwner`/`shownOwner`) 단위로 비교. 상단 띠는 모든 탭이 같은 번호를 쓰므로 탭 전환 때 div가 교체되는데, 번호만 세면 아무 요청도 안 나가 Ezoic이 사라진 div에 광고를 든 채 남고 새 자리는 영영 비었다(레일까지 동반 사망).",
      "주인만 바뀌면 `destroy` 없이 `showAds`만 — `destroyPlaceholders(A)`가 지목하지 않은 다른 자리의 광고까지 비우는 것을 실브라우저에서 확인. 자리가 아예 사라질 때만 destroy하고, 그때는 살아 있는 나머지를 같은 배치에서 함께 재요청.",
      "CLS: 카드 껍데기(AD 라벨 + 상하 패딩 ≈27px)를 `filled`·`active`와 무관하게 상시 렌더하고, 예약 높이(`min-h-[100px]`)를 광고 도착 후에도 유지. 채워질 때만 껍데기를 붙이거나 채워지면 예약을 푸는 구현은 도착·활성화 순간마다 20~30px씩 밀렸다 — 위로 당기는 것도 CLS다.",
      "feat(ads): SEO 정적 페이지 10종(`src/components/seo/*Content.tsx`)에도 상단 띠 추가. 광고가 SPA 셸에만 있어 구글 검색에서 착지하는 item/food/boss/character/quest/skill-tree/browse/cookpot/목록 페이지에는 노출이 아예 발생하지 않았다. 히어로/h1 블록 바로 아래 배치(h1 위는 랜딩 최상단이 광고가 된다).",
      "`ezstandalone.config()`를 `layout.tsx`의 cmd 큐 생성 인라인 스크립트로 이동. Ezoic 본체가 head에서 async로 먼저 떠 자동 유닛(anchor·vignette·video)과 초기 쿠키 싱크를 시작하므로 첫 배치 직전은 늦다. 현재 beta에서만 `limitCookies: true`로 ID 싱크 픽셀 감소폭 측정 중.",
      "도착 판정은 소재 기준(iframe / 뱃지보다 큰 이미지 / 텍스트) — no-fill이어도 Ezoic이 18×18 자사 뱃지를 넣어 '자식 있으면 채워짐'으로 보면 텅 빈 회색 AD 카드가 그려졌다. 판정 자체는 rAF로 코얼레싱(mutation마다 동기 `getComputedStyle`·`innerText`·`getBoundingClientRect`는 리플로우 폭탄).",
      "fix(sw): `src/sw.template.js` fetch 핸들러 맨 앞에 same-origin 가드. 없으면 광고·분석 교차 출처 요청이 맨 아래 stale-while-revalidate로 흘러 SW 홉이 붙고 광고 응답이 캐시될 수 있었다(DevTools initiator가 `sw.js`로 찍힘).",
      "회귀 하네스 3종: `scripts/check-ad-slots.mjs`(탭 순회·카테고리→목록·시트), `check-ad-slots-stress.mjs`(연타·모바일·뒤로가기·왕복 20회·검색·자리 없는 탭), `check-ad-cls.mjs`(규격별 iframe을 직접 꽂아 자리 높이 변화 측정 + IO 스텁으로 비활성 높이 측정). Ezoic을 차단하고 동일 인터페이스의 가짜를 심어 '우리가 무엇을 요청하는지'만 결정적으로 검사한다 — 실제 광고는 세션·스로틀·무광고 대조군(`isEzoicUser`)에 따라 흔들려 판정 기준으로 못 쓴다.",
      "docs: `docs/ui.md`에 AdSlot 규칙(번호 배정, 배칭, 주인 토큰, CLS 불변식, `config()` 위치) 정리. `docs/mistakes.md`에 CLS 오답노트 — 조건부 렌더 경계가 둘 이상이면 모든 경계에서 높이를 재야 하고, 로컬 하네스가 통과해도 실브라우저로 한 번은 볼 것.",
    ],
    changes: {
      ko: [
        "사이트 운영 비용을 충당하기 위해 광고를 도입했습니다. 목록 첫 줄, 상세 화면 아래, 넓은 화면의 좌우 여백에 표시됩니다.",
        "광고가 늦게 도착해도 화면이 밀리지 않도록 자리를 미리 비워 둡니다.",
      ],
      en: [
        "Ads have been introduced to cover hosting costs. They appear at the top of lists, below detail views, and in the side margins on wide screens.",
        "Ad slots reserve their space up front, so content no longer shifts when an ad arrives.",
      ],
    },
  },
  {
    version: "0.32.0",
    date: "2026-08-11",
    dev: [
      "feat(feedback): 답변 작성자 구분 추가 (#71). `feedback.reply_author` (TEXT NOT NULL DEFAULT 'human') — `schema.sql` + `ensureColumns()` 양쪽에 넣어 신규/기존 DB 모두 커버. 기존 행은 ALTER 시점에 'human'으로 채워져 표시가 그대로 유지됨.",
      "feat(api): `PATCH /feedback`이 `replyAuthor`를 받아 답변과 한 세트로 저장. 알 수 없는 값은 `normalizeReplyAuthor()`가 'human'으로 정규화. 공개/관리자 목록 응답에도 `replyAuthor` 포함.",
      "feat(ui): `FeedbackBoard`에 `ReplyAuthorLabel` 추가 — `claude`면 WX-78 얼굴 아이콘 + \"Claude 답변\", 그 외엔 기존 \"개발자 답변\". 작성자 선택 UI는 두지 않고 화면 저장은 항상 `replyAuthor: \"human\"` 명시.",
      "docs: CLAUDE.md에 \"Feedback Replies\" 섹션 추가 (Claude가 답변하는 절차 — 토큰 확보 → PATCH 호출). docs/ui.md의 `AdminFeedbackSection` 항목을 실제 파일명 `FeedbackBoard`로 현행화.",
      "docs(ui): 캐릭터 이미지 사용 규칙 명문화 — 앱 UI는 `category-icons/characters/`(배경 투명 얼굴), 액자 포함 `characters/`는 SEO·OG 전용. 작게 줄이면 액자만 남아 뭉개짐.",
      "검증: 기존 DB 모양을 SQLite로 재현해 ALTER 후 기존 행이 'human'으로 채워지는 것과 신규 스키마 생성을 확인. 헤드리스로 라이트/다크 렌더 확인.",
    ],
    changes: {
      ko: [
        "피드백 답변에 작성자를 표시합니다. AI가 작성한 답변은 WX-78 아이콘과 함께 'Claude 답변'으로 구분되어 보입니다.",
      ],
      en: [
        "Feedback replies now show who wrote them. Replies written by AI appear as \"Reply from Claude\" with a WX-78 icon.",
      ],
    },
  },
  {
    version: "0.31.3",
    date: "2026-08-11",
    dev: [
      "fix(cookpot): 요리솥 재료 목록에 `forgetmelots_dried`가 2건 존재 (#69). `forgetmelots`의 `dryable: true`로 자동 생성되는 variant와 \"Dried-only ingredients\" 블록의 수동 등록이 겹침. base 쪽 `dryable` 플래그 제거로 해소.",
      "fix(cookpot): 데이터 중복 2건이 화면에서는 무한 증식으로 증폭. `IngredientPicker` 그리드가 `key={ing.id}`를 쓰는데 형제 key가 겹쳐 검색 필터 갱신마다 노드가 정리되지 않고 누적 — 헤드리스 재현으로 검색 6회 반복 시 3→5→7→9→11→13 확인.",
      "chore(cookpot): `cookpotIngredients` export 시점에 `dedupeById()` 가드 추가 (첫 등장만 유지, 개발 모드에서 중복 id 콘솔 경고). 재료 132 → 131건.",
      "docs(mistakes): 자동 생성 variant와 수동 등록의 ID 충돌 + 화면 증폭 메커니즘 기록.",
    ],
    changes: {
      ko: [
        "요리솥 재료 고르기에서 '말린 건망초'가 여러 개로 늘어나던 문제 수정. 기존 즐겨찾기는 그대로 유지됩니다.",
      ],
      en: [
        "Fixed 'Dried Forget-Me-Lots' multiplying in the cookpot ingredient picker. Existing favorites are unaffected.",
      ],
    },
  },
  {
    version: "0.31.2",
    date: "2026-07-19",
    dev: [
      "fix(stats): `/stats` 페이지가 프로덕션에서 crash (#62). `countryName()`이 `Intl.DisplayNames.of(code)`를 호출하는데 analytics API가 반환한 countries에 표준 ISO 3166-1이 아닌 `T1`(Tor 트래픽 태그) 코드가 섞여 있어 스펙대로 RangeError → 렌더 전체 죽음. try-catch로 감싸 예외 시 원 코드 그대로 반환.",
    ],
    changes: {
      ko: [
        "통계 페이지가 열리지 않던 문제 수정.",
      ],
      en: [
        "Fixed the Stats page failing to load.",
      ],
    },
  },
  {
    version: "0.31.1",
    date: "2026-07-14",
    dev: [
      "feat(pwa): legacy 웹클립 설치본 감지 재설치 안내 배너 `LegacyPwaNotice` (#61). 감지 시그니처: `navigator.standalone` + `screen.height-innerHeight>20` + `safe-area-inset-top>0` — #60 이전 iOS 26 설치본(하단 흰 띠)만 타게팅, 닫기 시 localStorage 영구 dismiss. iOS 26.5 시뮬레이터에서 WebClipStatusBarStyle legacy/default 치환으로 표시/미표시 양방향 검증.",
      "i18n: legacy_pwa_notice / notice_dismiss (ko/en). docs/ui.md 공유 컴포넌트 등록.",
    ],
    changes: {
      ko: [
        "이전에 홈 화면에 추가한 앱에서 화면 하단이 잘려 보이는 경우, 앱 안에서 재설치 안내를 표시합니다. 앱을 삭제 후 다시 추가하면 해결됩니다.",
      ],
      en: [
        "If the app was added to your Home Screen earlier and the bottom of the screen appears cut off, an in-app notice now guides you to remove and re-add the app to fix it.",
      ],
    },
  },
  {
    version: "0.31.0",
    date: "2026-07-14",
    dev: [
      "feat(ads): #58에서 임시 비활성화했던 Ezoic/CMP 스크립트 재활성화 (#60). Ezoic 승인 완료(7/8) — placement는 아직 없어 광고 렌더는 없음.",
      "refactor(shell): AppShell 뷰포트 전략 재설계 — body height 하이잭 → 앱 루트 `fixed inset-x-0 top-0 h-dvh` 컨테이너. 서드파티(CMP 등)가 body에 flow 요소를 삽입해도 앱 레이아웃 불변 (#58 대형 흰 공간의 구조적 해결). 문서 높이 CSS 100dvh 잠금 + 스크롤 (0,0) 핀 + 키보드 열림 시(innerHeight-vv.height>150px)만 vv px 오버라이드.",
      "fix(pwa): iOS 26 홈 화면 앱 하단 흰 띠 — `appleWebApp.statusBarStyle`을 black-translucent → default로. iOS 26 웹앱 셸이 black-translucent를 legacy 취급해 뷰포트를 (화면-상태바) 높이로 자르고 하단 62pt를 캔버스색 죽은 영역으로 노출. 웹클립 Info.plist의 `WebClipStatusBarStyle` 치환 실험(iOS 26.5 시뮬레이터)으로 원인·해법 검증. 기존 설치본은 설치 시점 스타일 박제라 무영향, 신규/재설치부터 적용.",
      "docs: mistakes.md에 디버깅 프로세스 오답노트(증상 동일≠원인 동일, A/B 격리 우선, 시뮬레이터 재현 전환 기준) 추가.",
    ],
    changes: {
      ko: [
        "**iOS에서 화면 하단이 잘리고 흰 공간이 남던 버그를 수정했습니다.** 홈 화면에 추가한 앱에서 증상이 남아 있다면 앱을 삭제 후 다시 추가해 주세요.",
        "광고 파트너(Ezoic) 연동을 다시 활성화했습니다. 광고는 아직 표시되지 않습니다.",
      ],
      en: [
        "**Fixed a bug on iOS where the bottom of the screen was cut off with leftover blank space.** If you still see it in the Home Screen app, please remove and re-add the app.",
        "Re-enabled our advertising partner (Ezoic) integration. No ads are shown yet.",
      ],
    },
  },
  {
    version: "0.30.2",
    date: "2026-07-04",
    dev: [
      "chore(ads): Ezoic/CMP 스크립트 임시 비활성화 (#58). `src/app/layout.tsx` 헤드의 gatekeeperconsent CMP 2종 + `ezojs sa.min.js` + `ezstandalone` init + `ezoicanalytics.js` 다섯 개를 JSX 주석으로 묶음.",
      "원인: iOS Safari에서 CMP JS가 body 높이 계산에 영향을 주고 AppShell의 `visualViewport.height` 하이잭(iOS 키보드 대응)과 충돌 → 크래프팅 탭 카테고리 그리드 하단이 잘리고 큰 흰 공간이 남는 증상. 사용자 스크린샷 + 베타 검증으로 원인 확정.",
      "후속: 별도 이슈에서 CMP 로드 후 `visualViewport` 이벤트 재구독 훅을 붙여 안전하게 재통합 예정. 광고 심사(#55)는 그동안 일시 중단.",
    ],
    changes: {
      ko: [
        "제작 탭에서 카테고리 카드 하단이 잘리고 큰 빈 공간이 남는 문제 임시 조치.",
      ],
      en: [
        "Temporary fix for the Crafting tab where category cards were being clipped at the bottom with a large empty gap below.",
      ],
    },
  },
  {
    version: "0.30.1",
    date: "2026-07-02",
    dev: [
      "feat(privacy): Ezoic 고지문 주입 앵커 추가 (#57). `LegalDoc`에 선택적 `children` 슬롯(본문 섹션 뒤 렌더), privacy 페이지에 `<span id=\"ezoic-privacy-policy-embed\">` — Ezoic JS가 파트너·쿠키 목록 고지문을 이 위치에 자동 주입.",
      "Ezoic 대시보드 설정: Consent Geo(Country=South Korea), Privacy Policy URL(https://www.dstcraft.com/privacy) 등록. docs/ui.md에 LegalDoc children·FooterLegalLinks About 링크 반영.",
    ],
    changes: {
      ko: [
        "개인정보처리방침 하단에 광고 파트너(Ezoic)의 상세 고지문(파트너·쿠키 목록)이 자동으로 표시됩니다.",
      ],
      en: [
        "The Privacy Policy now automatically shows the advertising partner's (Ezoic) detailed disclosures, including partner and cookie lists, at the bottom of the page.",
      ],
    },
  },
  {
    version: "0.30.0",
    date: "2026-07-02",
    dev: [
      "feat(about): `/about` 소개 페이지 신설 (#56). `\"use client\"` + `useSettings().resolvedLocale`로 ko/en 분기. 사이트 목적·운영자 소개(실명 김지환·개발자 배경 스토리)·데이터 출처/정확성·저작권/출처·제작 동기 블록. 운영자 프로필 사진(원형 아바타) 포함.",
      "feat(privacy): 개인정보처리방침에 Ezoic 광고 조항 추가 (ko/en). 2번 쿠키 섹션에 Ezoic 광고 서빙·CMP 동의 배너 고지, 3번 제3자 서비스에 Ezoic 항목(IP·기기·쿠키 처리 + Ezoic privacy 링크). 기존 '향후 광고' 문구를 현재형으로 교체. Ezoic 반려(2026-07-01) 1차 대응.",
      "feat: `FooterLegalLinks`에 About 링크 추가, `i18n.ts`에 `about` 키(ko/en).",
      "fix(about): `OwnerPhoto` — next/image `onError`가 static export 하이드레이션 전 404를 못 잡아 fallback이 안 뜨던 문제를, 마운트 시 `img.complete && naturalWidth===0` 재확인으로 이니셜 fallback 보장.",
      "asset: `public/images/about-owner.jpg` (얼굴 중심 400x400 크롭).",
    ],
    changes: {
      ko: [
        "**소개(About) 페이지 추가** — 하단 푸터에서 열 수 있습니다. 이 사이트가 무엇인지, 누가 만들고 운영하는지, 데이터를 어디서 가져와 어떻게 정확성을 유지하는지 안내합니다.",
        "개인정보처리방침에 **광고 파트너(Ezoic) 관련 안내**를 추가했습니다 — 광고·쿠키 사용과 동의(CMP) 방식을 투명하게 밝힙니다.",
      ],
      en: [
        "**Added an About page** — accessible from the footer. It explains what this site is, who builds and runs it, and where the data comes from and how its accuracy is maintained.",
        "Added **advertising partner (Ezoic) disclosures** to the Privacy Policy — transparently covering ad/cookie use and how consent (CMP) works.",
      ],
    },
  },
  {
    version: "0.29.1",
    date: "2026-07-01",
    dev: [
      "feat(ads): Ezoic 심사용 JS 통합 (#55). `src/app/layout.tsx` `<head>` 최상단에 gatekeeper CMP 2종(privacy, data-cfasync=false) + ezojs sa.min.js(async) + ezstandalone 초기화 + ezoicanalytics 스크립트. Ezoic이 사이트를 인식·심사하도록 연동.",
      "nginx common conf에 `location = /ads.txt` → 301 `srv.adstxtmanager.com/19390/dstcraft.com` (managed ads.txt). nginx 수동 reload 필요.",
      "광고 placement(Step 3) 미포함 → 광고 렌더 안 됨. Klei 저작권 문의(#128018) OK + Ezoic 승인 후 placement 추가로 광고 ON 예정. 현재는 심사 파이프라인만 작동(방문자 노출 변화 없음).",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.29.0",
    date: "2026-07-01",
    dev: [
      "feat(legal): `/privacy`(개인정보처리방침)·`/terms`(이용약관) 페이지 신설 (#54). `\"use client\"` + `useSettings().resolvedLocale`로 ko/en 콘텐츠 분기.",
      "공통화: 두 페이지의 렌더 레이아웃을 `src/components/ui/LegalDoc.tsx`(BackToHome + max-w-2xl 본문 + 섹션 리스트, `LegalDocContent` 타입)로 추출. 페이지는 locale별 콘텐츠 객체만 보유.",
      "feat: `FooterLegalLinks`(client) 컴포넌트 → `crafting/Footer.tsx`에 개인정보처리방침·이용약관 링크 노출. `i18n.ts`에 `privacy_policy`/`terms_of_service` 키(ko/en) 추가.",
      "privacy 내용은 실제 수집 항목 기반: analytics(IP·국가·User-Agent·device·OS·referrer·페이지뷰), Google 로그인 email, favorites/skills_builds, feedback(IP·국가), 로컬스토리지. 제3자(Google Identity/Cloudflare/Ko-fi/향후 광고) + 쿠키 고지.",
      "terms: 비영리 팬사이트 성격, 게임 콘텐츠 Klei Entertainment 저작권 귀속, 위키 이미지 CC BY-SA 출처, 면책·이용자 의무.",
      "docs/ui.md에 LegalDoc·FooterLegalLinks 공유 컴포넌트 등록.",
    ],
    changes: {
      ko: [
        "**개인정보처리방침·이용약관 페이지 추가** — 하단 푸터에서 언제든 열 수 있습니다. 수집하는 정보(방문 통계·로그인 이메일 등)와 이용 목적, 문의처를 투명하게 안내합니다.",
        "이용약관에 이 사이트가 Klei Entertainment 비공식 팬 가이드이며 게임 콘텐츠 저작권이 Klei에 있음을 명시했습니다.",
      ],
      en: [
        "**Added Privacy Policy and Terms of Service pages** — accessible anytime from the footer. They transparently explain what data is collected (visit analytics, sign-in email, etc.), how it's used, and how to contact us.",
        "The Terms clarify that this is an unofficial fan guide not affiliated with Klei Entertainment, and that game content is copyright Klei.",
      ],
    },
  },
  {
    version: "0.28.0",
    date: "2026-06-30",
    dev: [
      "feat: 게임 빌드 23206828 → 23922378 동기화 (#53). From Beyond — Cursed Confrontation Part 1 + Midsummer Cawnival 반영. scrapbook-stats / raw-foods / skins converter 일괄 재실행, game-version.ts buildid 갱신.",
      "fix(scripts): extract-skin-icons.py 재인코딩 노이즈 제거. PNG optimize 인코딩이 비결정적이라 매 sync마다 957개 픽셀-동일 가짜 diff가 생기던 문제를, stem당 최종 crop만 메모리에 모아 픽셀 동일 시 미저장하도록 수정 (985 icons, 0 written). 같은 stem 다중 저장 시 비교 기준이 원본이 아니게 되는 함정도 회피.",
      "feat(crafting): 제작 카탈로그(items.ts)에 신규 19종 추가 — Fumarole 열 도구 7(열성 도끼/발열 곡괭이/고열 망치/작열 삽/가열 괭이/석탄/방열 연고), 성소(Vault) 3(이동의 보주 조각/수호탑 키트/고대의 수호탑 조각상), WX-78 그림자 드론 2(자동 회수기/약점 탐색기), 카니발 7(빨강 미스터리 박스/미니 놀이기구 2/미니골프 키트 4).",
      "feat(data): 신규 재료 5종(열샘·이동의 보주·수호탑 조각 3) + game-items 아이콘 24개를 게임 images.zip 인벤토리 아틀라스에서 KTEX 추출. ko.po 기반 한국어 번역(카니발은 게임 미번역 → 영문 fallback).",
      "feat(crafting): vault_refiner(성소 대장간) CraftingStation 신규 추가 (types/i18n/stationImages/locales). station 아이콘은 wiki.gg에서.",
      "feat(search): itemMatchesQuery에 item.id 부분일치 추가(코드 검색) + Vault 콘텐츠 별칭(성소/sanctum/볼트/vault).",
      "제작 카탈로그·WX-78 회로 데이터가 sync 밖 수작업이란 점 docs/mistakes.md 기록. WX-78 회로/현황·스킬트리는 verify 결과 최신 빌드와 일치 확인(업데이트 불필요).",
    ],
    changes: {
      ko: [
        "**From Beyond 신규 제작 아이템 추가** — 성소(Sanctum) 콘텐츠(이동의 보주 조각·수호탑 키트·고대의 수호탑 조각상), Fumarole 열 도구(열성 도끼·발열 곡괭이·고열 망치·작열 삽·가열 괭이 등), WX-78 그림자 드론(자동 회수기·약점 탐색기)을 제작 탭에서 볼 수 있습니다.",
        "여름 축제(Midsummer Cawnival) 제작품 추가 — 빨강 미스터리 박스, 미니 놀이기구, 미니골프 키트.",
        "검색 개선 — 아이템 코드(예: fumaroleaxe)로도 검색되고, \"성소\"·\"볼트\"로 성소(Vault) 아이템을 찾을 수 있습니다.",
        "최신 게임 빌드(23922378) 데이터 동기화 — 아이템 스펙·스킨 갱신.",
      ],
      en: [
        "**New craftables from the From Beyond update** — Sanctum content (Portation Orb Fragment, Guard Tower Kit, Ancient Guard Tower Figure), Fumarole heat tools (Ardent Axe, Pyretic Pickaxe, Hotheaded Hammer, Searing Shovel, Heated Garden Hoe, and more), and WX-78 shadow drones (Auto-Grabber, Exploiterator) now appear in the Crafting tab.",
        "Added Midsummer Cawnival craftables — Red Mystery Box, mini rides, and mini-golf kits.",
        "Search improvements — find items by their code (e.g. fumaroleaxe), and look up Sanctum/Vault items by typing \"vault\".",
        "Synced to the latest game build (23922378) — item stats and skins updated.",
      ],
    },
  },
  {
    version: "0.27.0",
    date: "2026-06-23",
    dev: [
      "feat(skins): 스킨 탭 신규 추가 (#50). 1단계(인벤토리 아이콘) + 2단계(캐릭터 본체 풀바디)까지 묶어서 릴리즈. 총 18 캐릭터 / 1300+ 스킨 entry / 961 인벤토리 아이콘 + 529 본체 이미지.",

      "Phase 1 — 인벤토리 아이콘 추출 파이프라인: 게임 `databundles/images.zip`의 KTEX(DXT5) 인벤토리 아틀라스를 Pillow만 의존하는 파이썬으로 디코드. `scripts/extract-skin-icons.py`가 `inventoryimages{1..4}.tex/.xml` 4장에서 `prefabskins.lua`의 skin_id 집합으로 필터링된 961 PNG를 `public/images/skins/`에 추출. 외부 ktools 의존 없음. level3 변형은 base 이름으로 저장.",
      "Phase 1 — 메타데이터: `scripts/extract-skins.py`가 `prefabs/skinprefabs.lua` (CreatePrefabSkin) + `skin_strings.lua` (영문 names/quotes) + ko.po (`STRINGS.SKIN_NAMES`/`SKIN_QUOTES` 약 3,900건) + `skin_set_info.lua` 조인 → `src/data/skins.ts` 자동 생성. SkinEntry 인터페이스에 character/body_image/body_panels 필드 포함.",
      "Phase 1 — 캐릭터 매핑 게임 소스 기반 (recipes.lua): 기존엔 위키+개발자 지식으로 EXCLUSIVE_ITEMS 룩업을 하드코딩했는데 부정확. `recipes.lua`의 `builder_tag` (22종, e.g. pyromaniac=Willow, bookbuilder=Wickerbottom) + `builder_skill` (walter_ammo_* 등)로 일원화. 구식 `Recipe(...)` 위치 인자 형식도 인식. 결과적으로 257 prefab → 캐릭터 매핑 자동 추출, 13 캐릭터 분류. nightsword/armor_sanity 등 부정확했던 매핑 정정 (Maxwell 전용 아님).",

      "Phase 2 — wiki.gg 풀바디 이미지: `scripts/download-body-skins.py`가 dontstarve.wiki.gg의 18 캐릭터 갤러리 페이지에서 in_game.png 썸네일을 받아 `public/images/skins-body/`에 저장. curl 기반, rate-limited(0.5s), idempotent (이미 받은 파일 스킵). 529 PNG / 16MB. User-Agent에 출처 명시.",
      "Phase 2 — 매칭: `extract-skins.py`가 SKIN_NAMES 영문값 → wiki 파일명 패턴 변환으로 자동 매칭. `_none`/`_d`/`_p` 변형은 parent skin 이미지로 fallback. 매칭률 18 캐릭터 모두 80~85%. 결과: body_image 363건 필드 부착, 499 캐릭터 스킨 분류.",
      "Phase 2 — `body_panels` 자동 측정: wiki in_game.png는 캐릭터마다 가로로 2~3 포즈가 나란히 들어있어서 PIL로 가로/세로 비율 측정 → round(w/h)로 패널 수 추정. 315 스킨 2-panel / 48 스킨 3-panel.",
      "sync-game-data.sh: extract-skin-icons + download-body-skins + extract-skins 3단계 통합. 게임 buildid 변경 시 자동 재생성.",

      "UI — 3-depth 네비게이션 (BossesApp 패턴 그대로):\n  1단계 홈 = 카테고리 그리드(전체/최근/캐릭터 타일/모자/방어구/무기/지팡이/도구/부적·장신구/가방/비팔로/기타/본체 의상)\n  2단계 캐릭터 목록 = 18 캐릭터 그리드 (스킬 탭과 동일한 portrait 이미지 사용: `/images/category-icons/characters/<key>.png`)\n  3단계 리스트 = 그 카테고리/캐릭터의 스킨들 + 우상단 정렬 드롭다운",
      "UI — view 상태 URL 동기화 (`?tab=skins&view=characters` / `&cat=<id>`)로 시스템 백버튼이 한 depth씩 거꾸로 가게. pushState/popstate/replaceState 처리.",
      "UI — TabScrollArea 공용 컴포넌트로 통합. 외곽 wrapper + 스크롤 영역 + Footer를 한 번만 마운트해서 view 전환 시 Footer 깜빡임 + SupportPill 리셋 해결 (`docs/ui.md` 규정 준수).",
      "UI — SkinBreadcrumb (3 depth: 스킨 > 캐릭터 > 위그프리드 또는 스킨 > 모자), SkinCard (BossCard 스타일), SkinDetail (DetailPanel 내부 풀바디 + 메타 + 인용구 + 세트 + 태그).",
      "UI — 정렬 드롭다운: 희귀도순(기본) / 이름순 / 최신순(release_group ↓) / 오래된순. 희귀도 기본 정렬은 (희귀도 → 종류 → 이름) 묶음으로 본체/모자 혼재 완화.",

      "i18n: 스킨 탭 라벨, 희귀도 17종 (Common~HeirloomElegant), rarity modifier (Woven/CharacterModifier/Inspired/Lustrous), 종류 카테고리 (모자/방어구/무기 등 10종 + 본체 의상), 정렬 옵션 한/영 추가.",
      "src/components/AppShell.tsx: `tab_skins` 탭 항목 추가 (`?tab=skins`).",
    ],
    changes: {
      ko: [
        "**스킨 탭 신설** — 18 캐릭터의 본체 의상(약 360종)과 모자·방어구·무기·지팡이·부적·장신구·가방 등 인벤토리 스킨(약 960종)을 함께 볼 수 있습니다.",
        "3단계 탐색: 홈에서 종류(모자/방어구/무기 등) 또는 \"캐릭터\" 누르기 → 캐릭터 누르면 18명 목록 → 캐릭터/종류 선택하면 그 스킨들이 쭉.",
        "정렬: 희귀도순 / 이름순 / 출시 최신순·오래된순. 클릭하면 풀바디 이미지 + 인게임 인용구 + 희귀도 + 세트·태그 상세.",
        "캐릭터 본체 이미지는 [dontstarve.wiki.gg](https://dontstarve.wiki.gg/) 갤러리에서 받아옵니다 (CC BY-SA). 모자·무기 같은 아이템 스킨은 게임 데이터에서 직접 추출.",
        "다른 탭(보스/제작 등)과 동일한 카테고리 그리드 → 리스트 → 상세 패턴. 시스템 뒤로가기로 한 단계씩 거슬러 갑니다.",
      ],
      en: [
        "**New Skins tab** — browse ~360 character body outfits across 18 survivors plus ~960 item skins (hats, armor, weapons, staves, amulets, canes, backpacks, etc.) in one place.",
        "Three-level navigation: pick a kind (hats / armor / weapons / …) or the Characters tile on the home grid → tap a character → see all skins for that character or kind.",
        "Sort by rarity / name / newest / oldest. Tap a skin for the full-body image, in-game quote, rarity, set membership, and tags.",
        "Character body images come from [dontstarve.wiki.gg](https://dontstarve.wiki.gg/) (CC BY-SA). Item icons are extracted directly from the game's KTEX atlases.",
        "Same category grid → list → detail pattern as the Bosses / Crafting tabs. System back button steps through the navigation depth.",
      ],
    },
  },
  {
    version: "0.26.11",
    date: "2026-06-13",
    dev: [
      "fix(data): 인게임 strings.lua + ko.po와 어긋난 보스/아이템 이름 13건 보정 (#49). FR 사용자 피드백(\"Don't translate from Chinese, get the real English names\") 계기로 NAMES 전수조사.",
      "bosses.ts: warg `Warg→Varg`, mutateddeerclops `Crystalline Deerclops→Crystal Deerclops` / `수정→수정체`, mutatedbearger `무장→무장한`, alterguardian_phase1_lunarrift `Celestial Retinue→Celestial Revenant`.",
      "game-items-db.ts: chesspiece_moon_builder/sketch 깨진 값(`\\`) → `\"Moon\" Figure`/`\"달\" 조각상` 등, wx78_drone_zap_remote `Zaptrocuter→Zaptrocuter Controller`/`찌릿콥터→찌릿콥터 컨트롤러`, wx78module_light `조명 회로→발광 회로`, mutated 조각상 ko 표기(`무장한`/`수정체`) 정정.",
      "out of scope: `eyeofterror`(Klei 내부 strings.lua가 `Eye Of Terror`/`Eye of Terror` 혼용 — 손대지 않음).",
    ],
    changes: {
      ko: [
        "여러 보스/아이템의 영문/한글 이름을 인게임 공식 표기로 보정. 예: Warg→Varg, Crystalline Deerclops→Crystal Deerclops, 수정→수정체 외눈사슴, 발광 회로, 찌릿콥터 컨트롤러 등.",
        "달 체스말 조각상 2종(Moon Figure / Moon Figure Sketch) 이름이 빈 값으로 표시되던 데이터 손상 수정.",
      ],
      en: [
        "Corrected several boss/item names to match the in-game official strings (e.g. Warg→Varg, Crystalline Deerclops→Crystal Deerclops, Zaptrocuter Controller, Illumination Circuit, Celestial Revenant).",
        "Fixed broken data where the two \"Moon\" Figure items had empty names.",
      ],
    },
  },
  {
    version: "0.26.10",
    date: "2026-06-10",
    dev: [
      "feat(bosses): `BossCombatStats`(`BossesApp.tsx:544`)에 진영(alignment) 뱃지 표시 — `shadow_aligned`/`lunar_aligned`가 `scrapbookStats`에 이미 있었지만 보스탭에선 누락돼 있었음 (#48). 제작탭 `ItemStatsPanel`과 동일 스타일·라벨 사용. early-return 가드는 `!health && !damage && !hasAlignment`로 확장해 alignment-only 항목도 통과.",
      "fix(i18n): 달 진영 한글 라벨을 인게임 ko.po 기준으로 보정 — `월광 진영` → `달 진영` (`STRINGS.SCRAPBOOK.NOTE_LUNAR_ALIGNED`). 제작탭/보스탭 모두.",
      "refactor(item-stats): 진영 뱃지 색상 변경 — Shadow 보라 → zinc(회색), Lunar 하늘 → emerald. 인게임 분위기 및 사용자 피드백 반영.",
      "fix(bosses): `BOSS_SCRAPBOOK_MAP`에 `twinsofterror → twinofterror1` 매핑 추가. 인게임 `eyeofterror.lua:595,665`에서 TWIN1/TWIN2 모두 `inst:AddTag(\"shadow_aligned\")` 명시(스크랩북엔 `twinofterror1/2`로 분리 등록)이라 매핑이 없어 진영 누락. 위그프리드 진영 보너스 실제 적용 대상.",
      "출처: FR 사용자 피드백 (\"Add alignment for mobs?\", 2026-06-10) + 한국 사용자 색/번역 + minotaur/twinsofterror 크로스체크 피드백. 31개 보스 prefab AddTag 전수조사 결과 모두 일치(twinsofterror 매핑 누락 제외).",
    ],
    changes: {
      ko: [
        "보스/몹 상세에서 그림자 진영 / 달 진영 뱃지가 표시됩니다 (제작탭과 동일한 표기).",
        "진영 뱃지 색상을 인게임 분위기에 맞게 회색(그림자) / 에메랄드(달)로 변경. 한글 라벨도 인게임 표기(`달 진영`)로 맞춤.",
        "공포의 쌍둥이(Twins of Terror) 그림자 진영 누락 수정.",
      ],
      en: [
        "Boss/mob detail panels now show Shadow Aligned / Lunar Aligned badges (same as the crafting tab).",
        "Badge colors updated to gray (Shadow) / emerald (Lunar) to better match the in-game tone.",
        "Fixed missing Shadow Aligned tag for Twins of Terror.",
      ],
    },
  },
  {
    version: "0.26.9",
    date: "2026-06-02",
    dev: [
      "fix(scrapbook): convert-scrapbook.py가 `weapondamage` 문자열 범위(예: \"59-89\")를 누락하던 버그 수정 (#47). `NUMERIC_FIELDS`에는 들어있었지만 `isinstance(_, (int, float))` 가드로 인해 string 값이 드롭됨.",
      "feat(scrapbook): 클레이가 `scrapbookdata.lua`에 \"min-max\" 문자열로 박아둔 `weapondamage`를 분해해 `weapondamage`(min, number) + `weapondamage_max`(number)로 구조화. 출처는 각 prefab의 `inst.scrapbook_weapondamage = {min, max}` 테이블 (예: `spear_wathgrithr.lua:465`). 6개 무기 적용: spear_wathgrithr_lightning(59~89), _charged(59~89), trident(51~76), slingshot(17~68), rabbitkingspear(51~71), voidcloth_boomerang(5~27).",
      "feat(item-stats): `ItemStatsPanel`에 조건부 최대 피해 행 추가. 기본 피해 메인 + 조건 라벨(`젖은 적에게`/`바다 생물에게`/`토끼인간에게`/`최강 탄약`/`최대 거리`)이 별도 행으로 보임. 조건 매핑은 `WEAPON_CONDITION_LABELS` 상수 (코드 측 closed set — game-data가 조건 자체를 들고 있지 않아 prefab/tuning 읽고 직접 매핑).",
      "chore(data): scrapbook-stats.ts 재생성 — 위 6건 외 wx78_module_* 22건 영문 specialinfo 문구 game build 갱신 반영 (\"Alpha Circuits Tinkering\" → \"Alpha Circuit Tinkering\" 단수형 환원).",
    ],
    changes: {
      ko: [
        "위그프리드 천둥창·삼지창·새총·토끼왕창·까매랑 등 6개 무기 상세에서 누락돼 있던 데미지가 표시됨.",
        "범위형 데미지를 기본값 + 조건부 최대치(예: \"공격력 59\" + \"젖은 적에게 89\")로 분해 표기. 인게임 스크랩북의 \"59-89\" 같은 모호한 표기를 조건별로 풀어 보여줍니다.",
      ],
      en: [
        "Damage values for six weapons (Battle Spear/Lightning Spear, Trident, Slingshot, Rabbit King Spear, Gloomerang, etc.) now show in the detail panel.",
        "Range damage is now split into base + conditional max (e.g. \"Damage 59\" + \"vs wet target 89\"), replacing the in-game scrapbook's opaque \"59-89\" style.",
      ],
    },
  },
  {
    version: "0.26.8",
    date: "2026-05-23",
    dev: [
      "feat(crafting): 제작 상세 패널에서 재료 슬롯을 누르면 그 재료가 검색 태그로 추가되고 현재 상세가 닫혀, 검색 결과 그리드에 그 재료를 쓰는 모든 제작품이 표시됨 (#44). 카테고리/스테이션 칩 클릭과 동일한 패턴 — `CraftingApp.handleMaterialClick`이 `useSearch.addSearchTag({type:'material'})` + `setItem(null)` 호출.",
      "feat(crafting): 채집/드롭 재료(부싯돌·잔가지·돌 등) 슬롯도 클릭 가능해짐 — 이전엔 craftable-as-item인 재료(작업대·만능 리모컨 등)만 클릭됐음. `MaterialSlot.onMaterialClick` 시그니처를 `(item: CraftingItem) => void` → `(materialId: string) => void`로 단순화.",
      "docs(terminology): `재료 슬롯` 항목을 새 동작 반영해 갱신.",
      "히스토리: 첫 시도(#44 1차 커밋)에서 ItemDetail에 별도 'Used in' 섹션 + raw material → 합성 CraftingItem fallback을 추가했으나, 피드백(\"상세페널 말고 검색함거처럼\") 반영해 검색 태그 추가 방식으로 전환. 합성 fallback / 미사용 헬퍼 등은 모두 제거.",
    ],
    changes: {
      ko: [
        "제작법 상세에서 재료 아이콘을 누르면 그 재료를 쓰는 모든 제작법이 검색 결과로 보임 — 역방향 레시피 탐색. 부싯돌·잔가지처럼 채집해서 얻는 재료도 클릭 가능.",
      ],
      en: [
        "In the crafting detail panel, tap a material icon to see every recipe that uses it as an ingredient — reverse recipe lookup. Gathered materials like Flint and Twigs are now clickable too.",
      ],
    },
  },
  {
    version: "0.26.7",
    date: "2026-05-21",
    dev: [
      "feat(seo): IndexNow 연동 (#41) — `public/<key>.txt` 키 파일 + `scripts/indexnow-ping.py` 추가. `sitemap.xml`의 전체 URL(약 2,200개)을 IndexNow API(`api.indexnow.org`)에 POST해 Bing·Yandex·Naver·Seznam의 즉시 색인을 유도. `deploy-frontend.sh`가 prod 배포 symlink swap 직후 호출하며 best-effort(ping 실패해도 배포는 성공 처리), beta 배포에서는 실행하지 않음.",
      "chore(seo): Bing Webmaster에 중복 등록돼 있던 `http://` 사이트맵 항목 제거 — `https://www.dstcraft.com/sitemap.xml` 단일 항목만 유지.",
    ],
    changes: {
      ko: [
        "콘텐츠 변경 시 Bing 등 검색엔진에 즉시 알리는 IndexNow를 연동. 게임 데이터 갱신이 검색 결과에 더 빠르게 반영됩니다.",
      ],
      en: [
        "Integrated IndexNow to instantly notify Bing and other search engines of content changes, so game-data updates show up in search results faster.",
      ],
    },
  },
  {
    version: "0.26.6",
    date: "2026-05-20",
    dev: [
      "fix(skill-tree): 위노나 스킬트리 잠금 6개를 인게임 `lock_open`과 일치시킴 (#40) — 찰리·와그스태프 트리(악몽 발전기·계몽 발G.E.M.기 등 4갈래) 진입 스킬이 클릭되지 않던 문제. `winona.ts`의 `winona_midshelf_lock` / `winona_portable_structures_lock` / `winona_shadow_3_lock` / `winona_lunar_3_lock` / `winona_charlie_2_lock` / `winona_wagstaff_2_lock`가 인게임 자동 평가(`CountTags` / `activatedskills[X] AND NOT activatedskills[Y]`)와 달리 `manual` 타입으로 들어가 있어 사용자가 잠금 아이콘을 직접 눌러야만 해제됐고, 일부 `charlie_2_lock`(\"급속충전 시 해금\") / `wagstaff_2_lock`(\"와그스태프 협력 시 해금\") 같은 desc는 ko.po 정문구와 다르게 임의 작성돼 있었음.",
      "feat(skill-tree types): `LockCondition`에 `compound` 타입 추가 — `required_skills` + `excluded_skills` + `tag_counts: { tags: string[]; count }` (다중 태그 합산 카운트). 인게임 `lock_open` 함수 본문에 흔한 `skill X 활성 AND skill Y 미활성 AND 태그 합계 ≥ N` 패턴을 무손실로 표현. `isLockSatisfied` 로직 두 군데(`use-skill-tree.ts`, `SkillTreeView.tsx`) 동일하게 처리.",
      "fix(verify-skill-trees): TS 파서 regex 버그 수정 — `lockType: { ..., tag_counts: { tags: [...] } }`처럼 nested한 `tags:` 키가 외부 노드 `tags:`보다 먼저 매칭돼 위노나 lock 노드에서 거짓 양성. `lockType` 본문을 잘라낸 뒤 top-level 필드 스캔하도록 수정.",
      "docs(mistakes): \"복합 lock_open을 manual fallback으로 우회 — 자동 해제 끊김\" 사례 기록 (#40).",
    ],
    changes: {
      ko: [
        "위노나 스킬트리에서 찰리·와그스태프 가지(악몽 발전기·계몽 발G.E.M.기 포함 4갈래)가 인게임처럼 자동으로 해금되도록 수정. 이전엔 잠금 아이콘을 직접 눌러야 했고 일부 잠금 설명도 인게임과 달랐음.",
      ],
      en: [
        "Fixed Winona's skill tree so the Charlie and Wagstaff branches (Nightmare Generator, Enlightened G.E.M.erator, etc. — all four entry skills) unlock automatically as in-game. Previously you had to click the lock icons manually, and a couple of lock descriptions didn't match the in-game text.",
      ],
    },
  },
  {
    version: "0.26.5",
    date: "2026-05-14",
    dev: [
      "chore(data): 게임 데이터 동기화 자동화 — `scripts/sync-game-data.sh` 추가, `~/dst-game-snapshot/` 로컬 git 레포로 buildid별 `scripts/` + `ko.po` 스냅샷 추적. buildid 비교로 변경 없으면 no-op, 다르면 unzip → 스냅샷 커밋 → convert-scrapbook / extract-raw-foods / verify-skill-trees 일괄 실행 → `src/data/game-version.ts` 자동 갱신 (#39).",
      "chore(data): 최신 빌드 23206828 (2026-05-13 KST hotfix) 반영 — `src/data/scrapbook-stats.ts`의 wx78_module_* specialinfo 22건 문구 정정 (\"Alpha/Beta/Gamma Circuit Tinkering\" → \"... Circuits Tinkering\" 복수형 통일, armor 항목 마침표 보정). 인게임 텍스트 갱신만 반영하므로 데이터 구조/스키마 변경 없음. raw-foods.ts·skill-tree 데이터에는 변동 없음.",
      "docs(claude): CLAUDE.md에 통합 sync 파이프라인 안내 추가, 기존 Item Stats/Raw Foods 개별 절차는 단축 표기로 정리.",
    ],
    changes: {
      ko: [
        "게임 데이터를 최신 hotfix(2026-05-13)로 동기화. WX-78 회로 모듈 22개의 영문 설명 문구가 인게임 최신 표기와 일치하도록 갱신됨.",
      ],
      en: [
        "Synced game data to the latest hotfix (2026-05-13). 22 WX-78 circuit module English descriptions now match the in-game wording from this build.",
      ],
    },
  },
  {
    version: "0.26.4",
    date: "2026-05-14",
    dev: [
      "fix(seo): FAQPage JSON-LD 중복 출력 제거 (#37) — server component가 `<script type=\"application/ld+json\" dangerouslySetInnerHTML={...}>` 패턴을 쓰면 React 18+ RSC stream에 props도 escape된 형태(`\\\"@type\\\":\\\"FAQPage\\\"`)로 한 번 더 직렬화돼 GSC가 같은 schema를 두 번으로 카운트. 정상 `<script type=\"application/ld+json\">` 태그는 1개지만 RSC payload 안의 escape 문자열까지 합쳐 \"FAQPage 입력란 중복\" critical 오류로 27 페이지의 리치 결과 차단. `src/components/seo/JsonLd.tsx` 헬퍼(`<script>` children 패턴 + `suppressHydrationWarning`) 신설 후 layout/homepage(en+ko)/각 detail page(Character/Boss/Quest/Item/SkillTree/Food/Cookpot) 8곳 통일.",
      "fix(seo): Recipe schema critical 오류 정정 — Food 페이지 Recipe JSON-LD에 `recipeYield`(필수, GSC \"recipeYield 입력란 누락\" 10페이지 critical 오류) + `prepTime`/`recipeCuisine`/`recipeInstructions`(GSC 권장 17페이지 풍부도 개선) 추가. `recipeInstructions`는 ko/en 각각 3단계 HowToStep(재료 투입 → 조리 → 효과 확인 + health/hunger/sanity 수치)으로 구조화.",
      "refactor(seo): 사이트 전체 JSON-LD 출력 경로를 `<JsonLd data={...}>` 단일 컴포넌트로 통일 — 향후 schema 추가 시 import 한 줄로 일관 패턴.",
      "근거: Google Search Console 전수 진단 — 색인 거부 855개 중 692개 실질 문제 분석, FAQ 54건/Recipe 10건 critical 오류 직접 확인. food/figatoni, ko/skill-tree/wigfrid, item/voidcloth-umbrella 등 빌드 결과 HTML에서 `<script type=\"application/ld+json\">` 태그 카운트로 fix 검증(@type별 정확히 1개씩).",
    ],
    changes: {
      ko: [
        "구글 검색 노출 개선 — 음식·아이템·캐릭터·스킬트리 등 ~30 페이지의 FAQ snippet과 레시피 카드가 차단되던 문제 해결. 빠르면 다음 크롤 사이클부터 검색 결과 리치 카드가 복구됨.",
      ],
      en: [
        "Google search visibility fix — FAQ snippets and recipe cards across ~30 pages (food / item / character / skill tree) were blocked from rich results due to duplicate JSON-LD; resolved. Rich results should recover after Google's next recrawl.",
      ],
    },
  },
  {
    version: "0.26.3",
    date: "2026-05-14",
    dev: [
      "feat(analytics): 통계 정확도 개선 — daily UV/PV 키를 KST(Asia/Seoul) 기준으로 통일 (#34). `bun-api/src/lib/util.ts`에 `dateKey(daysAgo)` / `monthKey(monthsAgo)` 헬퍼 추가, 기존 `today()`도 KST 기반으로 재작성. `analytics.ts`의 stats 응답 dates/months 생성 루프도 헬퍼로 교체. 이전엔 `toISOString()` UTC라 한국 사용자 자정~오전9시 활동이 다른 날짜 버킷으로 흘러가 daily 그래프가 새던 문제 해결.",
      "feat(analytics): `/api/_t` 신규 트래킹 엔드포인트 추가, 기존 `/api/track`과 동일 핸들러 공유. `EasyPrivacy`/`uBlock Origin`/`Brave shields` 등 광고차단 필터가 `/track` 키워드를 차단해 클라이언트 fetch 자체가 실패하던 케이스 회피. SW 캐시 호환을 위해 기존 `/api/track`도 유지.",
      "feat(frontend): `src/app/layout.tsx` 인라인 트래킹 스크립트 + `src/lib/analytics.ts`의 `trackVisit`이 `/api/_t` 호출.",
      "feat(infra): 봇/크롤러 트래픽 전용 GoAccess 대시보드 추가 — `bun-api/infra/goaccess-bots.sh`(`--crawlers-only` 플래그) + `com.dstcraft.goaccess-bots.plist`(launchd, `StartInterval=3600`). `~/dstcraft/bots.html` 1시간 주기 갱신, 같은 SimpleHTTPServer가 `:7891/bots.html`로 서빙. 사람/봇 트래픽 분리 가시화.",
      "docs(mistakes): UTC 기준 일별 키의 시간대 누락 + 트래킹 경로명 광고차단 차단 두 교훈 기록.",
    ],
    changes: {
      ko: [
        "통계 페이지 일별 그래프가 한국 시간(KST) 기준으로 정확히 분류됨 — 이전엔 자정~오전 9시 활동이 전날로 빠지던 작은 새는 구간이 있었음.",
      ],
      en: [
        "Stats page daily charts now bucket activity by Korea Standard Time (KST) — previously midnight–9AM activity was leaking into the previous day's bucket.",
      ],
    },
  },
  {
    version: "0.26.2",
    date: "2026-05-14",
    dev: [
      "fix(ui): 제작/요리/보스 탭의 카테고리 그리드 카드 높이 통일 (#33) — \"연구장비와 제작대\"처럼 2줄 라벨이 섞이면 같은 행의 카드 높이가 들쭉날쭉해지던 문제. App Store 스타일(아이콘 영역 고정 + 텍스트 2줄분 고정)로 정렬.",
      "refactor(ui): `src/components/ui/CategoryCard.tsx` 공통 컴포넌트 신설 — 제작(`CategoryGrid`)·요리(`CookingApp`)·보스(`BossesApp`) 카테고리 타일을 한 곳으로 통합. 텍스트 영역 `min-h-[2lh]`로 2줄분 높이 예약 → 라벨이 1줄이든 2줄이든 카드 높이·아이콘 수직 위치 동일. 인게임 라벨이 단일 진실 공급원이라 텍스트 수정 없이 레이아웃만으로 해결.",
      "docs(ui): `docs/ui.md` 공유 컴포넌트 목록에 `CategoryCard` 항목 추가.",
    ],
    changes: {
      ko: [
        "제작·요리·보스 탭의 카테고리 카드 정렬을 통일 — 라벨이 1줄이든 2줄이든 카드 크기와 아이콘 위치가 같아 줄이 흐트러지지 않음.",
      ],
      en: [
        "Category cards now align uniformly across Crafting / Cooking / Bosses tabs — whether the label is one line or two, every card stays the same height with a consistent icon position.",
      ],
    },
  },
  {
    version: "0.26.1",
    date: "2026-05-14",
    dev: [
      "feat(bosses): 보스탭 카테고리 선택과 보스 상세 패널을 브라우저 history에 푸시 (#32). 뒤로가기 시 패널 닫기 → 카테고리 목록 → 보스 홈 → 진입 직전 탭 순서로 단계별 복귀.",
      "feat(hooks): `src/hooks/use-bosses-state.ts` 신규 — `?cat=<id>` / `?boss=<id>` URL 파라미터 단일 진실 공급원. `selectCategory`(push, value=null이면 replace로 cat 제거), `selectBoss`(open=push, close=back if _appNav). `popstate` + `pageshow`(bfcache) 리스너로 양방향 동기화. `syncFromUrl()`은 AppShell이 외부에서 URL을 푸시한 직후 로컬 state 재동기화용.",
      "refactor(bosses): `BossesApp`의 `selectedCategory`/`selectedBoss` useState를 hook으로 이관. `selectedBoss`는 `selectedBossId`에서 `bosses.find()`로 hydrate. `pendingBossId`/`pendingLootItemId` effect는 직접 setter 호출 대신 `syncFromUrl()`로 통합.",
      "fix(bosses): `('favorites' as BossCategoryId)` 캐스팅 제거 — hook의 `BossesCategoryValue` 타입(`BossCategoryId | \"favorites\" | \"recent\"`)이 pseudo-category까지 포함.",
    ],
    changes: {
      ko: [
        "보스탭에서 카테고리(예: 시즌보스)를 선택하거나 보스 상세 패널을 연 뒤 브라우저 뒤로가기를 누르면 한 단계씩 복귀 — 패널 닫기 → 카테고리 목록 → 보스 홈 → 직전 탭. 기존엔 보스탭에서 뒤로가기를 누르면 패널/카테고리를 건너뛰고 곧장 이전 탭으로 빠지던 동작이 보정됨.",
        "보스 카테고리와 상세 패널이 URL에 반영 — 새로고침이나 URL 공유 시 같은 화면 복원.",
      ],
      en: [
        "Browser back now steps through Boss tab views — open panel → category list → boss home → previous tab. Previously, back would skip categories and panels and jump straight to the prior tab.",
        "Boss category and detail panel are reflected in the URL — refresh and link sharing restore the same view.",
      ],
    },
  },
  {
    version: "0.26.0",
    date: "2026-05-14",
    dev: [
      "feat(feedback): KR↔EN 양방향 번역 인프라 (#31) — `feedback` 테이블에 대칭 컬럼 8개 추가 (message용 4 + reply용 4): `message_translated`, `message_lang`, `message_translated_at`, `message_translated_model` + 동일 패턴의 reply용 4개. `translated_model`로 향후 모델별 품질 비교 가능 (`claude-opus-4-7` / `deepl-v2` / `gpt-5` 등).",
      "feat(db): `bun-api/src/lib/db.ts`에 멱등 `ensureColumns()` 헬퍼 — `PRAGMA table_info`로 컬럼 존재 체크 후 누락된 것만 `ALTER TABLE ADD COLUMN`. 부트 시 자동 실행, 기존 DB도 무손실 마이그레이션.",
      "feat(db): 미번역 row 부분 인덱스 `idx_feedback_untranslated ON feedback(created_at) WHERE message_translated_at IS NULL` — 후속 배치 워커 스캔용.",
      "feat(api): `/feedback/public` 응답에 `messageTranslated`/`messageLang`/`replyTranslated`/`replyLang` 포함. admin GET `/feedback`도 8개 번역 필드 모두 노출 + snake→camel 정규화(기존 `{...r}` spread 패턴 폐기, 응답 shape 일관성).",
      "feat(frontend): `FeedbackBoard`에 `pickDisplay()` 헬퍼 — 원문 `lang`을 사용자 locale과 비교해 자동 번역본 선택, 동일 lang이면 원문 그대로. 번역본 표시 시 🌐 \"자동 번역 / Auto-translated\" 배지 + \"원문 보기 / View original\" 토글. `showOriginal` Set으로 row+field 단위 상태 관리 (key: `${id}:msg|reply`).",
      "feat(frontend): admin·public 응답 둘 다 `messageTranslated`(camel) 사용 — `FeedbackItem` 타입을 snake→camel로 통일. reply 카드에도 동일한 배지/토글.",
      "chore(backfill): `bun-api/scripts/translate-existing-feedback.ts` — 기존 11개 피드백 message + 7개 reply를 Claude Opus 4.7이 직접 양방향 번역 후 DB에 백필. `WHERE *_translated_at IS NULL` 조건으로 멱등(재실행 안전). 모델은 `claude-opus-4-7`로 기록.",
      "ops(infra): 프로덕션 DB 백업(`~/dstcraft/data/app.db.bak-pre-translate-20260514-001535`) 후 스키마 마이그레이션 + 백필 적용 완료.",
    ],
    changes: {
      ko: [
        "피드백 보드의 영문 글이 한국어 모드에서 한국어로, 한국어 글이 영어 모드에서 영어로 자동 표시 — 기존 피드백/답변 전부 번역 적용됨.",
        "번역된 글에는 🌐 \"자동 번역\" 배지가 붙고, \"원문 보기\" 버튼으로 원문 전환 가능. 답변(개발자 답변)에도 동일하게 적용.",
        "사용자 언어와 같은 글은 원문 그대로 표시 (불필요한 번역 안 함).",
      ],
      en: [
        "Feedback board now auto-translates entries to your interface language — Korean items appear in English in English mode, and vice versa. All existing feedback and replies have been backfilled.",
        "Translated entries show a 🌐 \"Auto-translated\" badge with a \"View original\" toggle. Developer replies use the same UX.",
        "Items already in your language are shown as-is (no unnecessary re-translation).",
      ],
    },
  },
  {
    version: "0.25.0",
    date: "2026-05-13",
    dev: [
      "feat(seo): 퀘스트 전용 SEO 페이지 풀세트 (#30) — `/quest/[slug]` 4종(은둔자/연료직공/대변자/귀공자) + `/quests` 인덱스, en/ko 미러. 자동 생성기 `generateQuestSeoText[Ko]` 추가: overview / stepsSummary / tips / faq. HowTo JSON-LD(step + itemListElement) + FAQ JSON-LD 동시 주입.",
      "feat(seo): `src/components/seo/QuestPageContent.tsx` — boss 페이지 패턴 그대로. 메인 step + substep 트리 렌더, 단계 craftId/bossId → `/item/<slug>`·`/boss/<slug>` 링크, goal 마커, required ★ 배지, related quests, 인터랙티브 체크리스트 CTA. `QuestsListContent.tsx` 인덱스는 카드 그리드 + step/substep 수 + goal 메모.",
      "feat(slug): `questSlugs` 추가 (id↔slug 매핑) — `canonicalForQuest` / `resolveQuestSlug` 헬퍼. titleEn 기반 슬러그(`hermit-quests`, `ancient-fuelweaver`, `celestial-champion`, `celestial-scion`).",
      "feat(seo): sitemap.ts에 `/quests` + `/quest/<slug>` 4종 등록 (en/ko 각각). priority/changeFrequency 기존 dynamic 항목과 동일.",
      "feat(seo): SeoFooterLinks + BrowseContent에 quests 진입 링크 추가 — 크롤러 디스커버리 + 사용자 네비게이션 일관화.",
      "feat(i18n): labels.ts에 quest 전용 라벨 12종 추가 (questGuide/questsTitle/questsIntro/stepsLabel/substepsLabel/questStepsBreakdown/questTips/questOverview/goalLabel/totalStepsLabel/otherQuests/seeAllQuests/openQuestChecklist/questChecklistHelper/questsLink/questCardSummary/questCardSummaryNoSubs/goalNote).",
      "refactor(seo): 전역 SEO 페이지(quest/food/character/boss/item/skill-tree/browse/cookpot)에서 영문 페이지의 한국어 부제목 제거. 영문권 사용자에게 한국어 텍스트가 노출되면 mixed-language 페이지로 인식돼 검색 신뢰도 하락 + 영문 검색 노출 약화. 한국어 페이지의 영어 부제목은 유지(한국 유저가 영문 자료 검색 시 보조용). `secondary/subtitle = lang === \"ko\" ? <영문> : null` 단일 패턴으로 통일 — 27군데 일괄 적용.",
    ],
    changes: {
      ko: [
        "퀘스트 4종 전용 SEO 페이지 + 인덱스 페이지 추가 — 검색엔진에 노출되는 가이드 페이지(`/quests`, `/quest/<slug>`)에서 각 퀘스트의 단계, 필요 자재, 보스, FAQ를 자동 정리.",
        "퀘스트 페이지에서 자재 클릭 시 제작 가이드, 보스 클릭 시 보스 가이드로 바로 이동. 모든 단계는 인게임 출처 검증된 데이터.",
        "둘러보기(`/browse`) 페이지에도 퀘스트 섹션 추가.",
        "영문 SEO 페이지에서 한국어 부제목 제거 — 영문 사용자에게 깔끔한 영문 전용 페이지를 제공. 한국어 페이지의 영어 부제목은 유지(영문 자료 교차 검색에 유용).",
      ],
      en: [
        "Dedicated SEO pages for all 4 quest checklists + index — `/quests` and `/quest/<slug>` surface each quest's steps, materials, boss kills, and FAQ for search engines.",
        "Material substeps link straight to crafting guides; boss-kill steps link to boss guides. All entries are sourced from the in-game files.",
        "Browse (`/browse`) page now includes a Quest Checklists section.",
        "Korean subtitles removed from all English SEO pages — cleaner, English-only presentation. Korean pages retain English subtitles since they help Korean users cross-reference English wikis.",
      ],
    },
  },
  {
    version: "0.24.0",
    date: "2026-05-13",
    dev: [
      "feat(quests): 퀘스트 체크리스트 탭 신설 (#29) — 4대 엔드게임 진행을 체크리스트로 제공. 은둔자(Pearl) / 대변자(Celestial Champion) / 연료직공(Ancient Fuelweaver) / 귀공자(Celestial Scion). 데이터: `src/data/quests/{types,hermit,celestial,fuelweaver,scion,index}.ts` — Challenge Board 모드(workshop 3565356900) `challenge_defs.lua` + ko.po + 인게임 `prefabs/*.lua` / `recipes.lua` 검증. 훅: `src/hooks/use-quest-state.ts` — localStorage `dst:quest-checks`에 영속, toggle/resetQuest/getEffectiveProgress API. UI: `src/components/quests/QuestsApp.tsx` — sticky 헤더 + 섹션 collapse + 진행률 바.",
      "feat(quests): 단계 의존성(잠금) — 은둔자 집수리 1→2→3 같이 선행 단계 미완 시 후속 단계 잠금(스킬트리 잠금 UX 차용). 대변자 제작→업그레이드 1→2단계도 동일 패턴.",
      "feat(quests): 보스 탭 연동 — `QuestStep`/`QuestSubstep`에 `bossId?: string` 추가, AppShell `handleViewBoss(bossId, origin)` + `pendingBossId` 상태로 보스 상세 직접 진입. BossesApp가 `pendingBossId` effect로 외부 진입 수신, DetailPanel에 `externalBackLabel`/`onExternalBack`로 \"← 퀘스트\" 빠른 뒤로 노출. 제작 탭의 ↗ 패턴(`craftId`) 그대로 미러.",
      "feat(quests): 접기/펼치기 부드러운 애니메이션 — `grid-template-rows: 0fr ↔ 1fr` 200ms transition. 퀘스트 섹션 + 단계 서브스텝 양쪽. 섹션 접을 때 `data-scroll-container`만 명시적으로 `scrollBy({behavior:\"smooth\"})`로 헤더 정렬(외부 탭바 영향 0).",
      "refactor(quests): Challenge Board 출처 + ko.po 외 자체 작성 문구 전수 제거. \"목공 작업대\" → \"톱마탕\"(msgid \"Sawhorse\"), 게슈탈트 변형은 \"굴러지\"(WAGDRONE_ROLLING)/\"개개비 드론\"(WAGDRONE_FLYING) 공식 표기.",
      "refactor(quests): 대변자 재구성 — 제작/업그레이드 1단계/업그레이드 2단계 세 step으로 분리, 각 단계마다 자재 substep(icon+qty)으로 풀어 표시. recipes.lua 583(craft) / 1306·1307(stage fill) 출처.",
      "refactor(quests): 귀공자 — \"보스 처치\" 메타 step 일괄 제거(빙의된 보스 3종 / W.A.R.B.O.T. / 천상의 귀공자 / 순수한 게슈탈트 포획). 모든 prep 완료가 곧 처치 준비. 게팍한 은둔자 이사는 \"지도 만들기\" 단일 substep으로 단순화. 기질 추론기는 \"설치 및 제작\" 76 타일(recipes.lua 998 numtogive=4 → 19회) + 자재 풀어쓰기. 게슈탈트 포획은 포획기 제작 ↗ + 자재 + 합산 6 substep(작은/큰 각 최소 1개 — `wagpunk_arena_manager.lua` 886-975 ShouldWagstaffAcceptItem 검증).",
      "refactor(quests): 연료직공 — 고대의 열쇠/그림자 심장 substep 추가. atrium_key→minotaur, shadowheart→shadow_chess(그림자 기물, 100% 드롭) bossId 연결. 출처 주석 정정(이전 stalker 가설 폐기, bosses.ts 데이터 기준).",
      "fix(quests): 외부 진입 back 라벨 stale 버그 — X로 패널 닫고 같은 탭에서 다른 아이템 열면 외부 back 라벨이 stale로 남아 클릭 무반응이던 문제. CraftingApp/BossesApp에 `onPanelClose` prop 추가 → X 닫을 때 AppShell이 `craftingBack`/`bossesBack` 즉시 정리.",
      "fix(quests): 진행바 goal 마커(주황 1px 틱) 제거 — 헤더 텍스트 \"n/goal\"로 중복.",
      "fix(quests): 제작 가능 substep의 인라인 재료 노트 제거 — 제작 탭 ↗ 와 중복(7건: 의자 체인 3 / 시온 라인 3 / 달 공명추출기 1).",
    ],
    changes: {
      ko: [
        "새 \"퀘스트\" 탭 — 은둔자(펄)·대변자(천상의 대변자)·연료직공(고대의 연료직공)·귀공자(천상의 귀공자) 4대 엔드게임 진행을 체크리스트로 제공. Challenge Board 모드 구조 + 인게임 소스 검증 기반.",
        "각 단계의 재료/필요 아이템을 아이콘 + 수량 + 한국어명(ko.po 공식)으로 표시. 제작 가능 항목은 ↗ 버튼으로 제작 탭의 상세로 바로 이동, 보스는 ↗ 로 보스 탭으로 점프.",
        "선행 단계 의존성 잠금 — 집수리 1→2→3, 달 공명추출기 제작→업그레이드 1→2 단계처럼 순서대로 진행해야 다음이 열림.",
        "섹션 접기/펼치기 + 단계 서브스텝 토글에 부드러운 애니메이션 추가.",
        "체크 상태는 이 기기에만 저장되며, 섹션별 진행률 바와 완료 시 취소선으로 표시됨.",
      ],
      en: [
        "New \"Quests\" tab — checklist for four end-game progressions: Hermit Pearl, Celestial Champion, Ancient Fuelweaver, and Celestial Scion. Built from Challenge Board mod structure + in-game source verification.",
        "Each step shows materials/items with icons, quantities, and official Korean names from ko.po. Craftable items have a ↗ shortcut to the Crafting tab, and boss-kill steps have a ↗ shortcut to the Bosses tab.",
        "Sequential locks — repair house 1→2→3, craft device → upgrade stage 1 → stage 2, etc. must be completed in order before the next step unlocks.",
        "Smooth animations for section collapse/expand and substep toggles.",
        "Checks are stored only on this device. Each section shows a progress bar and completed steps strike through.",
      ],
    },
  },
  {
    version: "0.23.20",
    date: "2026-05-13",
    dev: [
      "feat(skills): 스킬트리 시뮬레이터 \"제한 해제\" 토글 (#28). 헤더에 Infinity 아이콘(앰버 강조), `useSkillUnlimited` 훅이 localStorage(`dst:skills-unlimited`)에 글로벌 영속화. `useSkillTree`에 `unlimited` 파라미터 추가해 `canLearn`의 통찰력 15 캡 분기만 무력화 — parent OR / locks AND / lock_open 게임 규칙은 모두 유지. `Wx78CircuitBoard`도 같은 토글 받아서 슬롯바·detail stepper의 maxSlots 분기 처리 + 켜진 동안 빈 슬롯 렌더 생략. 통찰력 카운터는 ∞ + \"제한 해제\" 텍스트로 전환.",
      "feat(skills): 공유 URL에 unlimited 상태 포함 (`u=1`). 16+ 스킬 빌드를 공유받은 쪽에서 \"통찰력 남음 0\"으로 보이고 추가 학습이 막혀 헷갈리던 문제 — handleShare가 `unlimited`일 때 `u=1` 부여, 링크 진입 또는 /import 시 자동 ON(localStorage에도 반영). `useSkillUnlimited`에 `setUnlimited(bool)` 셋터 추가.",
      "chore(workflow): /push 스킬 제거, /beta가 commit + origin push 기능 흡수. 워크플로우 단계 3→5로 축약. `/beta clear` 서브커맨드 신설 — origin/beta를 origin/main 기준으로 리셋(`--force-with-lease`). beta는 staging-only이라 일상 청소 작업으로 포지셔닝. CLAUDE.md + .claude/skills/{beta,task} 동기 갱신.",
      "fix(ci): beta 배포 워크플로우 robust화 (feat/5 cherry-pick). (1) `Sync source-beta + ~/works (beta)` 단계 추가 — ~/dstcraft/source-beta를 origin/beta에 `reset --hard`로 강제 정렬해서 force-push 후 ff 실패 케이스 복구. (2) `deploy-frontend.sh beta` 호출에 `--force` 추가 — sync 단계로 이미 정렬된 상태라 스크립트의 \"already up to date\" 체크가 빌드를 스킵하던 문제. 이번 /beta clear 직후 origin/beta 강제 리셋 → 첫 deploy 실패 → 두 번째 deploy가 \"already up to date\"로 빌드 스킵해 stale 서빙되던 문제 해결.",
      "docs(mistakes): SessionStart hook의 divergence 경고(`fatal: Not possible to fast-forward`)를 놓치고 진행한 사례 기록. 향후 `fatal`/`error`/`conflict`/`diverging` 키워드 발견 즉시 사용자에게 보고.",
    ],
    changes: {
      ko: [
        "스킬트리 시뮬레이터 헤더에 \"제한 해제\" 토글 추가 — 켜면 통찰력 15 캡과 칠팔이 회로 슬롯 캡을 무시. 모드 적용된 환경처럼 모든 통찰력·회로를 자유롭게 찍어볼 수 있음 (선행 스킬·잠금 조건은 게임 규칙대로 유지)",
        "제한 해제 상태에서 공유 버튼으로 만든 링크를 열면 받는 쪽도 자동으로 제한 해제로 전환 — 16+ 스킬 빌드도 정상적으로 표시됨",
      ],
      en: [
        "Skill tree simulator now has an \"Unlimited\" toggle in the header — when on, the 15-insight cap and the WX-78 circuit slot caps are ignored, letting you assemble any modded-style build. Game-rule prerequisites (parent skills, locks) are still enforced.",
        "Share links generated while Unlimited is on now carry the flag (`u=1`), so the receiver opens the link with Unlimited automatically enabled — 16+ skill builds display correctly on their side.",
      ],
    },
  },
  {
    version: "0.23.19",
    date: "2026-05-10",
    dev: [
      "fix(cooking): hermitcrabtea_* foods 섹션 한국어명 누락 (#27 follow-up). 차 카드와 상세 헤더가 영문명으로 노출됐던 문제 — 처음 커밋에서 ko.ts items 섹션에만 추가했고 foods 섹션 누락. foodName()이 locales[ko].foods[id]를 보므로 카드/상세에 영문이 그대로 떠서 베타 검증 단계에서 사용자가 발견. foods 섹션에 8종 추가로 정정.",
      "feat(cooking): 펄 할머니 진주네 찻집 차 8종 + 찻집 구조물 데이터 누락 보강 (#27). 게임 소스(`prefabs/hermitcrabtea_defs.lua`, `prefabs/hermitcrabtea.lua`, `recipes.lua` 1280-1292행) 기준으로 8종 차(petals/petals_evil/foliage/succulent_picked/firenettles/tillweed/moon_tree_blossom/forgetmelots) 추가: 즉시효과(sanity/health) — TUNING.SANITY_TINY/SMALL/MED/MEDLARGE + HEALING_TINY/MEDSMALL/MED 매핑, 온도효과 succulent ×−40°C·firenettles ×+40°C(120s = 4 seg), 지속버프 6종(petals: +1정신/sec×45s, petals_evil: −2정신/sec×60s, foliage: 광역 정신데미지 −10%×3분, tillweed: +1체력/0.5s×15s, moon_tree_blossom: 그림자 위협×3분, forgetmelots: +2정신/sec×45s). `CookingStation`에 `\"teashop\"` 추가, `CookingRecipe.teashopLevels?: [number, number, number]` 신설(펄집 장식점수 레벨별 마른재료 수량 — common 8/6/4, rare 6/4/2, ≥75점 lv3). `cookpot-ingredients.ts`에 `forgetmelots_dried`(말린 건망초) + `messagebottleempty`(빈 병) 추가 — 요구사항 칩 아이콘/한국어 매칭용. `CookingApp.tsx` `cookingCategories`에 `teashop` 카테고리(`hermitcrab_teashop.png` 아이콘) + RecipeDetail에 teashop 칩 + `TeashopLevelTable` 컴포넌트 신설 + cookTime 행은 station=teashop일 때 숨김. i18n `cooking_teashop`/`cooking_teashop_level`/`cooking_teashop_level_help` + `effect_tea_*_buff` 6종 추가(ko/en). `locales/ko.ts`에 `hermitcrabtea_*` 8종 name/desc 추가(ko.po 원문 기준). `items.ts` `hermitcrab_teashop`은 이미 structures 카테고리에 있어 \"제작탭에 추가\" 요청은 추가 작업 불필요 — name/description만 ko.po·strings.lua 원문(\"There's nothing a cup of Pearl's tea can't fix.\")으로 정정. 텔레그램 채널 메시지로 시작된 작업.",
    ],
    changes: {
      ko: [
        "요리탭에 \"진주네 찻집\" 카테고리 신설 — 펄 할머니가 만들어주는 차 8종(꽃차/어둠꽃차/고사리차/다육이차/불쐐기차/뒤엎시라차/달빛나무 꽃차/건망초차) 표시",
        "각 차의 즉시효과(체력/정신력)·온도효과·지속버프(예: 정신력 +1/초 × 45초)와 찻집 레벨 1/2/3에 따른 재료 수량 변화 표기",
        "찻집(진주네 찻집) 구조물의 한국어명·설명을 ko.po·인게임 원문 기준으로 정정",
      ],
      en: [
        "New \"Pearl's Tea Shop\" category in the cooking tab — Pearl's 8 brewable teas (Petal / Dark Petal / Foliage / Succulent / Fire Nettle / Tillweed / Lune Tree Blossom / Forget-Me-Lots).",
        "Each tea shows immediate effect (health/sanity), temperature effect (where applicable), the duration buff (e.g., +1 Sanity/sec for 45s), and the dried-ingredient cost at each Pearl decoration level (1 / 2 / 3).",
        "Tea Shop structure name and description corrected to match ko.po and the in-game string.",
      ],
    },
  },
  {
    version: "0.23.18",
    date: "2026-05-10",
    dev: [
      "chore(infra): nginx real_ip 3줄 레포-실서버 drift 해소 (#26). 실서버 `/usr/local/etc/nginx/snippets/dstcraft-common.conf`에는 `set_real_ip_from 127.0.0.1; real_ip_header CF-Connecting-IP; real_ip_recursive on;`이 사용자 직접 편집으로 적용돼 있어 access_log의 `$remote_addr`이 진짜 방문자 IP로 찍히는데, 레포 `bun-api/infra/nginx-dstcraft-common.conf`엔 빠져있어 다음 push 시 롤백될 위험. GoAccess(`http://100.85.118.4:7891/live.html`) 분석에서 127.0.0.1이 79.84% 트래픽(107k hits)을 차지해 발견 — fix 적용 이전 시점 누적분이 아직 남아 있어서. 같은 3줄을 레포에 server-include 상단(차단 룰 위)에 추가해 단일 진실 공급원 복원. CLAUDE.md Deploy Checklist 3번에 \"실서버 직접 편집 시 반드시 레포에 반영\" drift 경고 한 줄 추가.",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.23.17",
    date: "2026-05-10",
    dev: [
      "fix(cooking): 재료 ItemSlot 매핑 + text 검색 raw food 누락 (#25). 크롬으로 production 직접 검증해 두 이슈 발견. (1) `구운 생선 조각` 등 campfire 레시피 detail 재료 섹션에 `?` placeholder + 영문명 노출 — `recipes.ts` requirements 짧은 형(`Small Fish ×1`, `Small Meat ×1`)이 `cookpot-ingredients.ts` 정식명(`Small Fish Morsel`, `Morsel`)과 매칭 안 돼서. 전체 mismatch 스캔(Python) 결과 4개: `Small Fish`, `Small Meat`, `Seed`, `Seeds`. `ingredientByName`에 alias 2개 추가(`Small Fish` → fishmeat_small, `Small Meat` → smallmeat) + `tagIcons`/`reqTagTranslations`에 `Seeds` 항목 추가 (`Seed` 이미 존재). (2) 검색에서 `두리안` 입력 후 Enter → 0 결과. cookpot 레시피에 `Durian` 재료 사용 0개 + raw food는 `cookingRecipes` 인덱스 밖이라 매치 못함. `useCookingSearch`에 `searchRawFoodsForTags()` 추가하고 hook이 `rawFoodResults`를 별도로 노출. CookingApp이 검색 모드에서 raw food 결과를 cookpot grid 위에 별도 섹션(\"생식 가능\" 라벨 + RawFoodGrid)으로 렌더 — \"두리안\" 검색 시 raw 두리안 + 냄새 독한 두리안 노출. cookpot 결과가 0개일 때는 빈 RecipeGrid placeholder 숨김. tag 매칭 매트릭스: `rawFood`(prefab id), `foodType`(primary/secondary), `ingredient`(prefab id), `text`(name/foodType 부분 매치). station/effect/recipe는 raw food 못 만족 → `false` 반환.",
    ],
    changes: {
      ko: [
        "검색에서 음식 이름(예: \"두리안\") 입력 후 엔터 시 생식 가능 음식들도 결과에 노출 — 이전엔 두리안을 재료로 쓰는 요리솥 레시피가 없어 빈 결과만 떴음",
        "구운 음식 상세 패널의 재료 섹션에서 `?`로 표시되던 \"생선 조각\"·\"고깃조각\" 이미지/한국어명 정상 표시",
      ],
      en: [
        "Searching by food name (e.g., \"Durian\") and pressing Enter now surfaces raw foods alongside cookpot recipes. Previously the result was empty because no cookpot recipe takes Durian and raw foods weren't part of the search index.",
        "Cooked recipe detail panels now show proper icons + Korean names for \"Small Fish Morsel\" and \"Morsel\" ingredients (was showing as `?` placeholder).",
      ],
    },
  },
  {
    version: "0.23.16",
    date: "2026-05-10",
    dev: [
      "feat(cooking): 생식 가능 카테고리에 구운 두리안 추가 + 검색에서 raw food 노출 (#24). 두 가지 변경: (1) `scripts/extract-raw-foods.py`에 `INCLUDE_COOKED_VARIANTS_VEGGIE = {\"durian\"}` 화이트리스트 신설 — `parse_veggies()`가 raw 항목을 emit한 뒤 화이트리스트 매치 시 `MakeVegStats` 위치 인자 5..8(cooked_hunger/health/perish/sanity)을 읽어 `<id>_cooked` 항목도 함께 emit. 두리안만 raw vs cooked 스탯 차이가 player-relevant(health -3 → 0, perish 10d → 6d)라 예외, 다른 채소는 default policy(_cooked skip) 유지. `src/data/raw-foods.ts` 재생성으로 35→36개. secondaryFoodType(monster)는 cooked 변종에도 자동 전파. (2) `useCookingSearch`/`getCookingSuggestions`가 `rawFoods`를 새 `CookingTagType = \"rawFood\"`로 인덱싱 — 기존 search index는 cookpot 레시피만 봐서 \"두리안\" 검색 시 (cookpot 레시피에 두리안이 안 들어가 결과 0개) 사용자가 빈 화면을 보던 문제 해소. `CookingSearchBar`에 `onSelectRawFood` prop 추가 — rawFood suggestion 클릭 시 `addTag` 거치지 않고 `selectCategory(\"raw\") + selectRecipe(foodId)`로 detail panel 직행. `searchRecipes`의 `case \"rawFood\": return false`는 안전망 (UI가 가로채므로 도달하지 않아야 함). 5개 로케일 모두 typeLabels(\"생식\"/\"Raw Food\"/\"生食\"/\"生食\"/\"生食\") + tagStyles/dotStyles 청록 톤 추가.",
      "refactor(cooking): RawFoodDetail에 \"○○의 선호 음식\" 라벨 누락 보강. v0.23.15에서 두리안만 워트 선호로 마킹하는 로직(`getAffinityCharacters` 필터링)이 `RecipeDetail`(cookpot 레시피 상세)에만 있고 `RawFoodDetail`(raw 음식 상세)에는 없어서 사용자가 두리안 raw 카드를 열어도 라벨이 안 보이던 문제. 두 곳 동일 로직이라 CLAUDE.md 공통화 규칙(\"2곳 이상 패턴 → 공유 컴포넌트 추출\")에 따라 `AffinityBadges` 로컬 컴포넌트로 추출하고 양쪽에서 사용. `docs/ui.md` 공유 컴포넌트 목록에 항목 추가.",
    ],
    changes: {
      ko: [
        "생식 가능 카테고리에 \"구운 두리안\" 추가 — 두리안은 raw vs 익혀먹기 스탯 차이가 커서(체력 -3 → 0, 유통기한 10일 → 6일) 둘 다 노출",
        "검색창에 음식 이름(예: \"두리안\")을 넣으면 생식 음식도 \"생식\" 칩으로 제안됨 — 클릭 시 바로 그 음식의 상세 패널로 이동",
        "생식 음식 상세에서도 \"○○의 선호 음식\" 라벨 표시 (두리안 → 워트 선호) — 이전엔 요리솥 레시피 상세에만 있었음",
      ],
      en: [
        "Added \"Cooked Durian\" to the Raw Food category — durian's raw vs cooked stats diverge enough (health −3 → 0, perish 10d → 6d) to warrant showing both.",
        "Search now suggests raw foods (e.g. \"durian\") with a \"Raw Food\" chip — selecting one opens its detail panel directly.",
        "Raw food detail panels now show the \"X's favorite\" badge too (e.g., Durian → Wurt). Previously the badge only appeared on cookpot recipes.",
      ],
    },
  },
  {
    version: "0.23.15",
    date: "2026-05-10",
    dev: [
      "fix(cooking): 워트 선호 음식 표기 정확화 — 두리안만 \"워트의 선호 음식\" 라벨 노출 (#23). 인게임 wurt.lua에서 `AddFoodtypeAffinity(VEGGIE, 1.33)`와 `AddPrefabAffinity(\"durian\", 1.93) -- veggi bonus + 15`을 구분: 모든 채소가 ×1.33 카테고리 다이어트지만 두리안만 채소 기본을 *초과*하는 +15 추가 보너스를 받음. 켈프류(kelp/kelp_cooked/boatpatch_kelp)는 prefab override지만 배수가 채소 기본과 동일(1.33), 인게임 주석이 \"prevents the negative stats, otherwise foodtypeaffinity would have suffice\"라 명시 — 음수 스탯 방지용일 뿐 특별 보너스 아님. `getAffinityCharacters()`를 prefab 보너스 > foodtype baseline일 때만 반환하도록 수정 → 모든 채소 음식 카드에 \"워트의 선호 음식\" 라벨이 붙던 노이즈 제거, 두리안/구운 두리안만 라벨 유지. `FOODTYPE_AFFINITIES` 데이터는 보존(채소 다이어트 메커닉의 진실 공급원). 사용자 피드백 기반(이전 답변에서 \"모든 채소가 선호 음식이 맞다\"고 잘못 닫은 케이스). docs/mistakes.md에 \"카테고리 affinity\"를 \"특별 선호 음식\"과 동일시 항목 추가.",
    ],
    changes: {
      ko: [
        "요리탭 음식 카드의 \"워트의 선호 음식\" 라벨이 두리안에만 표시되도록 정정 — 다른 채소들은 모두 워트가 ×1.33 허기 보너스를 받지만, 카드별 라벨로 강조될 정도의 특별 선호는 두리안(+15 추가 보너스)뿐임",
      ],
      en: [
        "\"Wurt's favorite\" label on cooking cards is now shown only on Durian. All veggies still grant Wurt the standard ×1.33 hunger bonus, but Durian is the only one with the extra +15 specialty.",
      ],
    },
  },
  {
    version: "0.23.14",
    date: "2026-05-10",
    dev: [
      "feat(cooking): 요리탭에 \"생식 가능\" 카테고리 추가 + DST prefabs raw food stat 자동 추출 파이프라인 (#22). `scripts/extract-raw-foods.py` 신설 — `tuning.lua`의 TUNING.* 상수(CALORIES_*/HEALING_*/SANITY_*/PERISH_*) 해석 후 `prefabs/veggies.lua`의 VEGGIES 테이블(MakeVegStats positional args), `prefabs/mushrooms.lua`의 pickloot=red/green/blue_cap 블록, `prefabs/{meats,butter,honey,egg,acorn}.lua`의 per-prefab `inst.components.edible` 직접 설정 3가지 패턴을 처리. ko.po `STRINGS.NAMES.<ID>` 자동 매칭으로 한국어 이름 채움. OVERRIDES dict로 정확하지 않은 항목 수정(butter→dairy), EXCLUDE_IDS로 부적합 제외(acorn — FOODTYPE.SEEDS), IMAGE_OVERRIDES로 누락 아이콘 매핑(onion → quagmire_onion.png). 출력: `src/data/raw-foods.ts` (35개, 자동 생성, 수동 편집 금지).",
      "feat(cooking): 요리탭 카테고리 그리드에 \"생식 가능\" 항목 + RawFoodGrid + RawFoodCard + RawFoodDetail 컴포넌트. `cookingCategories`에 `{ id: 'raw', label: cooking_raw, image: berries.png }` 추가, `CookingCategoryId`에 `RawCategoryId` 합성. selectedCategory === 'raw' && !isSearching 분기에서 RawFoodGrid 렌더링(기존 RecipeGrid 우회). `useDetailPanel<RawFood>` 별도 훅으로 raw 패널 분리, RawFoodDetail이 RecipeDetail과 동일 레이아웃(이미지+이름+공유+즐찾+태그+stat boxes) — 생식 raw 영양(체력/허기/정신력/유통기한) 노출. 음식유형 칩 클릭 시 cookingRecipes 필터로 cross-link.",
      "feat: i18n `cooking_raw` 신설 (\"생식 가능\"/\"Raw Food\"). CLAUDE.md에 Raw Foods Pipeline Rules 섹션 추가 — Item Stats Pipeline Rules 패턴 미러, 게임 업데이트 시 갱신 절차/패턴/OVERRIDES 운영 규칙 명시.",
      "fix(cooking): 양파 이미지 깨짐 — base `onion.png`가 public/images/game-items/에 없고 `quagmire_onion.png`만 존재. `IMAGE_OVERRIDES` dict로 매핑.",
    ],
    changes: {
      ko: [
        "요리탭에 \"생식 가능\" 카테고리 신설 — 굽거나 요리하지 않고 바로 먹을 수 있는 35개 원재료(고기/채소/과일/버섯/달걀/꿀/버터/얼음 등)와 raw 영양 수치(체력/허기/정신력/유통기한) 표시",
        "양파 이미지 깨짐 수정",
      ],
      en: [
        "New \"Raw Food\" category in the cooking tab — 35 raw ingredients (meat / veggies / fruits / mushrooms / eggs / honey / butter / ice / ...) with raw eat stats (health, hunger, sanity, perish days).",
        "Fixed broken onion icon.",
      ],
    },
  },
  {
    version: "0.23.13",
    date: "2026-05-10",
    dev: [
      "feat(cooking): 요리탭 검색 개선 — 서제스천 제한 해제 + 분류 정렬 통일 + 디바운스 스피너 + 라벨 disambiguate (#21). `getCookingSuggestions`의 12-item slice 제거 (제작탭 useSearch와 동일하게 무제한). 분류 우선순위를 6단계로 정렬: foodType → ingredient tag → station → effect → individual ingredient → recipe (제작탭 character→category→material→item→station 패턴 미러). foodType/station/effect 서제스천을 신규 추가 — `cookingRecipes`의 distinct 값에서 컴파일타임 컴파일, i18n.ts의 `foodtype_*`/`cooking_*`/`effect_*` 키로 라벨. `useCookingSearch`에 `pending` 플래그 노출 (effectiveTags vs debouncedTags 비교) → `SearchWithSuggestions`가 디바운스 동안 Search 아이콘을 lucide Loader2(animate-spin)로 스왑. 한국어 음식유형 라벨 disambiguate: foodtype_meat \"고기\"→\"육류\", foodtype_veggie \"채소\"→\"채소류\" — 검색 dropdown에서 음식유형과 재료(Meat 태그)가 같은 라벨로 노출돼 결과가 비슷해 보이는 UX 혼선 해소. 새 CookingTagType `recipe` 추가 — 레시피 이름 매칭 서제스천이 free-text(\"텍스트\")와 같은 타입을 공유하던 것을 분리, `searchRecipes`에서 `recipe.id === tag.engName` 정확 매칭 (이전 substring 매칭). 5개 로케일 모두 `레시피`/`Recipe`/`レシピ`/`食谱`/`食譜` typeLabel + 보라색 톤 tagStyles 추가. todo.md 요리탭 검색 개선 4/5 sub-item [x] 갱신, description은 보류(DST RECIPE_DESC 테이블에 cookpot food 미포함).",
    ],
    changes: {
      ko: [
        "요리탭 검색 서제스천 개선 — 음식유형/요리솥/효과까지 제안 + 12개 제한 해제 + 디바운스 중 검색 아이콘이 스피너로 전환",
        "검색에서 음식유형과 재료가 같은 \"고기\"/\"채소\"로 보이던 혼선 해소 — 음식유형은 \"육류\"/\"채소류\"로, 재료는 그대로 \"고기\"/\"채소\"",
        "레시피 이름 서제스천이 \"레시피\" 타입으로 분리되어 정확히 그 레시피만 필터 (이전엔 \"텍스트\" 라벨에 substring 매칭)",
      ],
      en: [
        "Cooking search suggestions now include food type, station, effect; the 12-item cap is removed; the search icon spins during debounce.",
        "Korean labels for food type vs ingredient are disambiguated (육류/채소류 vs 고기/채소) so suggestions don't share the same label.",
        "Recipe-name suggestions are now their own \"Recipe\" tag type with exact recipe id matching, instead of the previous catch-all \"Text\" substring search.",
      ],
    },
  },
  {
    version: "0.23.12",
    date: "2026-05-09",
    dev: [
      "chore: 스크랩북 마이그레이션 Phase 4 마무리 (#18). v3 코드는 v0.13.0(2026-04-20)에 이미 삭제됐으나 v2/v3 시대 파이프라인의 잔존 파일/문서를 정리. 삭제: `TODO-item-stats-v3.md`, `docs/item-stats-pipeline.md`, `docs/item-stats-todo.md`, `docs/stats/` 27개 카테고리 md + `docs/stats/i18n/` 번역 디렉터리, `scripts/md-to-v2.py`, `scripts/migrate-v2-to-v3.py`, `scripts/verify-v3-stats.py`. CLAUDE.md의 'Item Stats Pipeline Rules' 섹션 + Key Paths를 scrapbook 기반으로 갱신 — 인게임 `scripts/scrapbookdata.lua` → `scripts/convert-scrapbook.py` → `src/data/scrapbook-stats.ts`(자동 생성, 수동 편집 금지) 흐름 명시. 게임 업데이트 시 갱신 절차 정리. todo.md '스크랩북 데이터 마이그레이션' 섹션을 진행중→완료로 이동. 사용자 영향 없음(코드 변경 없음).",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.23.11",
    date: "2026-05-09",
    dev: [
      "feat(ops): Vercel 빌드를 사용자 영향 변경에만 한정 (#17). `vercel.json`에 `ignoreCommand: bash scripts/vercel-ignore.sh` 추가. 스크립트는 변경 파일이 `src/`, `public/`, `package(-lock)?.json`, `next.config`, `tsconfig.json`, `postcss.config`, `vercel.json`, `scripts/generate-*` 패턴에 매칭되면 build(exit 1), 그 외(`docs/`, `.claude/`, `todo.md`, `memory/`, `bun-api/`, 루트 `*.md`, `eslint.config.*`, `components.json` 등)는 skip(exit 0). `VERCEL_GIT_PREVIOUS_SHA` env var 우선 사용, 없으면 `HEAD^` fallback. 동기: Vercel은 watchdog failover 용도(CLAUDE.md Phase 6)로만 유지 중인데 매 main push마다 빌드되어 Hobby edge req 한도 잠식. `bun-api/`는 패턴에서 제외 — Vercel은 정적 export만 호스팅하고 `/api/*`는 vercel.json rewrite로 beta.dstcraft.com origin에 프록시되므로 bun-api 코드 변경은 Vercel 빌드 출력에 영향 없음. 9개 시나리오 케이스로 로컬 검증 완료. drift 위험은 사용자 영향 변경이 들어올 때 자연 해소되므로 watchdog failover 신뢰성 영향 없음.",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.23.10",
    date: "2026-05-09",
    dev: [
      "fix(seo): Recipe JSON-LD에서 nutrition 객체 제거 (#16). `src/components/seo/FoodPageContent.tsx`의 요리솥 레시피 구조화 데이터에서 `nutrition.calories: '허기 N'` 매핑 삭제. GSC가 'calories' 입력란 누락 경고를 보낸 원인 — Google Rich Results 파서는 NutritionInformation.calories 값으로 Energy 형식(`'240 calories'` 등)을 요구하는데 우리는 게임 허기를 그대로 박아넣어 파싱 실패해 missing 처리됐음. DST 게임 허기는 실제 영양 정보가 아니라 nutrition 매핑 자체가 부적절하므로 객체 통째로 제거 — 파서한테 거짓 신호 주는 것보다 정직. author(Organization)/keywords(comma-string)는 schema.org 및 Google 문서 모두 유효한 형태로 명시되어 있어 그대로 유지(GSC 보고서는 4/28 이전 캐시로 추정 — 재스캔 후 자연 해소 예상).",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.23.9",
    date: "2026-05-09",
    dev: [
      "feat(analytics): referrer 풀 URL 저장 + admin 통계 표시 (#15). bun-api `analytics_referrer_urls(url PRIMARY KEY, count, last_seen_at)` 테이블 신설 + count/last_seen_at 인덱스. `/track` 라우트가 `referrerUrl`(외부 도메인일 때만, 500자 클램프) 받아 INSERT/UPDATE upsert. `/stats`는 admin 인증된 요청에 한해 `referrerUrls: { url, count }[]` Top 50 반환(URL에 PII 가능성 있어 비-admin엔 빈 배열). 프론트는 `src/lib/analytics.ts`와 `src/app/layout.tsx` 인라인 트래킹 스크립트 모두 `document.referrer` 풀 URL 추가 전송. stats 페이지에 admin 전용 '유입 URL' CollapsibleList 섹션 추가 — Top 10 inline + DetailPanel에서 전체 50건. 도메인 referrer(`analytics_counters scope='referrer'`)는 그대로 유지하고 풀 URL은 별도 테이블이라 후방 호환. 근거: GSC/Vercel 분석에서 DC인사이드(m.dcinside + gall.dcinside) 30일 ~300명(9%) 유입 발견했으나 어떤 갤러리 글에서 들어오는지 추적 불가했던 문제 해소.",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.23.8",
    date: "2026-05-09",
    dev: [
      "feat(seo): WX-78 회로/스킬트리 페이지 sitemap priority + structured data 강화 (#14). 우선 페이지 화이트리스트 `src/lib/seo-priority.ts` 신설 — 회로 6종(zaptrocuter/chessmaster/digestion/screech/stacksize/radar) + Celestial Scion 보스 + wx-78 스킬트리 ID 등록. `sitemap.ts`에서 해당 페이지 priority 0.9(en)/0.85(ko) + changeFrequency=weekly로 격상(기본은 0.8/0.7 monthly). `SkillTreePageContent`에 VideoGame(DST 본체) + SoftwareApplication(스킬트리 시뮬레이터) JSON-LD 추가, 기존 WebPage에 `about: VideoGame` 연결. `ItemPageContent.buildItemMetadata`가 `isWx78PriorityItem(id)` 분기로 우선 아이템에 한해 title을 `(WX-78 회로/Circuit)` 형태로 변경 + description에 `WX-78 스킬트리 해금 조건/unlock requirements in the WX-78 skill tree` 키워드 삽입. HowTo JSON-LD에 `about: VideoGame` 보편 추가. 근거: GSC 28일 평균 순위 7.6위, `/ko/skill-tree/wx-78` CTR 16.6% — 회로 시리즈가 검색 트래픽 견인 중.",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.23.7",
    date: "2026-05-09",
    dev: [
      "feat(ops): bun-api 액세스 로그에 ISO 타임스탬프 prefix 추가 — `bun-api/src/index.ts`의 `logger()` print 함수를 wrapping해 모든 요청 라인 앞에 `new Date().toISOString()` 출력. 5/7 사고 RCA에서 timestamp 부재로 시간대 매칭이 불가능했던 문제 해결.",
      "feat(ops): watchdog 자동 복구 스텝 추가 — `.github/workflows/watchdog.yml`에 3/3 헬스 실패 시 Tailscale + SSH로 Mac mini에 접속해 `launchctl kickstart -k com.dstcraft.api` 실행. 활성화 조건은 `vars.WATCHDOG_AUTORECOVER=1` + secrets `TS_AUTHKEY`/`SSH_PRIVATE_KEY` + vars `WATCHDOG_MACMINI_HOST`/`USER`. launchd `KeepAlive(Crashed:true)`는 hang 케이스를 잡지 못해 5/7처럼 1시간 무응답이 발생 — 워치독 측에서 강제 kick으로 5분 내 회복 가능. 복구 후 헬스 재확인 + Telegram으로 결과 알림. `.github/workflows/README-watchdog-secrets.md` 신규에 모든 secrets/vars 설정 가이드 정리.",
    ],
    changes: {
      ko: [],
      en: [],
    },
  },
  {
    version: "0.23.6",
    date: "2026-05-09",
    dev: [
      "chore(deps): @vercel/analytics 제거. Vercel → Mac mini 셀프호스팅 이주 완료 후에도 layout.tsx에 `<Analytics />` 컴포넌트가 남아 매 페이지뷰마다 `/_vercel/insights/script.js` + `/view`를 호출 → nginx 404. 분석 기간 1,415건(`script.js` 805 + `view` 610). 자체 analytics는 이미 bun-api `/api/track` + `/api/event`로 처리 중이라 불필요. layout.tsx 9·344라인, package.json dependency, package-lock.json 정리.",
    ],
    changes: {
      ko: [
        "내부 정리: 사용하지 않는 외부 분석 스크립트를 제거해 페이지 로딩 시 발생하던 백그라운드 404 요청을 없앴습니다.",
      ],
      en: [
        "Internal cleanup: removed an unused third-party analytics script, eliminating background 404 requests during page loads.",
      ],
    },
  },
  {
    version: "0.23.5",
    date: "2026-05-09",
    dev: [
      "fix(auth): API 401 토큰 만료 자동 처리. `src/lib/jwt.ts` 신설(decodeJWTPayload + isJWTValid 분리, 30초 clock-skew 버퍼). `src/lib/api-fetch.ts` 신설(apiFetch wrapper, TokenExpiredError, AUTH_EXPIRED_EVENT). useAuth가 auth:expired 이벤트로 자동 logout(state + localStorage 정리). favorites-api.ts 4개 함수(fetchFavorites/updateFavorite/fetchAllSkills/saveCharacterSkills), analytics.ts 5개 admin 함수(fetchFeedback/updateFeedbackStatus/toggleFeedbackHidden/deleteFeedback/fetchVisitors)가 wrapper 사용. fetchAnalytics는 token optional이라 inline isJWTValid 검증 + public 모드 fallback. 분석 기간 /api/skills 401 × 479건, /api/favorites 401 × 51건, /api/feedback 403 × 25건 — 전부 만료된 토큰을 들고 있는 실유저 브라우저(SamsungBrowser/iPhone Safari/Mac Safari)에서 발생. 기존엔 use-auth가 마운트 시점에만 exp 검증해서 1시간+ 열어둔 탭의 토큰은 무한히 유효 취급됨.",
    ],
    changes: {
      ko: [
        "로그인 세션이 만료되면 자동으로 로그아웃되도록 변경됐습니다. 이전에는 만료된 채로 즐겨찾기/스킬트리 동기화가 조용히 실패해 사용자가 인지하지 못했습니다.",
      ],
      en: [
        "Your session now signs you out automatically when it expires. Previously, favorites/skill-tree sync would silently fail without notice while the session was stale.",
      ],
    },
  },
  {
    version: "0.23.4",
    date: "2026-05-09",
    dev: [
      "fix(bosses): 보스 카테고리 분류 정정 5건 — daywalker2(고철덩이 늑대돼지) underground 제거(지상 폐허 보스), mutatedwarg(귀신들린 바르그) seasonal 제거 + story 추가, crabking(대게왕) ocean 추가, mutateddeerclops(수정 외눈사슴)/mutatedbearger(무장 곰소리) story 추가(시즌 의존성 유지 — 가을·겨울 일반 보스 사망 후 균열 빙의 부활 메커니즘).",
      "chore(workflow): 슬래시 명령어 책임 분리 — `/push`(commit + origin push 전용, 배포 X), `/beta` 신설(타겟 브랜치를 ../dst-craft-beta 워크트리에서 beta 머지·푸시). 두 명령 모두 타겟 인자 파싱(브랜치명/이슈번호/이슈URL/자연어).",
      "chore(workflow): 메인 워크트리 기본 브랜치를 beta → main으로 변경. beta 배포는 별도 영속 워크트리(../dst-craft-beta)에서만. CLAUDE.md Branch & Deploy Strategy 섹션 + /release·/task 스킬 본문 동기화.",
    ],
    changes: {
      ko: [
        "보스 카테고리 정정: 대게왕이 '해양 보스'에 추가됐고, 고철덩이 늑대돼지가 '지하 보스'에서 빠졌습니다.",
        "귀신들린 바르그·수정 외눈사슴·무장 곰소리가 '스토리 보스'에 표시됩니다 (천상의 귀공자로 가는 길에 만나는 보스).",
        "귀신들린 바르그는 '시즌 보스'에서 빠졌습니다 (다른 시즌 보스와 달리 시즌 자동 등장이 아닙니다).",
      ],
      en: [
        "Boss category fixes: Crab King now appears under 'Ocean', and Scrappy Werepig no longer appears under 'Underground'.",
        "Possessed Varg, Crystalline Deerclops, and Armored Bearger now appear under 'Story' (prerequisites on the path to Celestial Scion).",
        "Possessed Varg removed from 'Seasonal' (unlike other seasonal bosses, it doesn't auto-spawn with the season).",
      ],
    },
  },
  {
    version: "0.23.3",
    date: "2026-05-08",
    dev: [
      "feat(feedback): 관리자 피드백 패널의 답변 영역에 별도 \"답변 저장\" 버튼 추가. 기존에는 상태 변경 버튼을 눌러야만 답글이 함께 저장되어 답글만 수정하려면 같은 상태를 다시 클릭해야 했음. handleSaveReply 핸들러를 분리해 현재 status를 그대로 유지하고 reply만 PATCH. 답글이 변경되지 않았거나 빈 입력이면 버튼 비활성화.",
    ],
    changes: {
      ko: [
        "관리자 패널에서 피드백 답변을 상태 변경 없이도 저장할 수 있게 됐습니다.",
      ],
      en: [
        "Admin feedback panel: replies can now be saved without changing the status.",
      ],
    },
  },
  {
    version: "0.23.2",
    date: "2026-05-08",
    dev: [
      "fix(stats): 관리자 통계 페이지 `접속자 상세` 표(`VisitorTable`) 시간/IP 컬럼 정리. 시간은 `toLocaleString({month,day,hour,minute,second})` → `toLocaleTimeString(\"en-GB\", {hour,minute})` 로 변경해 24h `HH:MM` 표기. IP는 inline-block + `w-[15ch]` + `truncate`로 IPv4 최대(`111.111.111.111`) 기준 고정 폭, 초과 시 ellipsis. 잘린 값은 `title` 속성으로 hover 노출.",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.23.1",
    date: "2026-05-08",
    dev: [
      "fix(bosses): 그림자 기물(shadow_chess) 카테고리에서 underground 제거 — 지상 보스(체스 조각상 3개를 세트피스에 조립 → 삭일 밤 곡괭이로 소환)인데 underground로 잘못 분류돼 있던 것을 raid 단일 카테고리로 정정.",
      "chore(skills): 스킬 시뮬 첫 접속 투어 팝오버(v0.11.8용) 컴포넌트 + DevMenu 항목 제거. 팝오버는 첫 노출 후 localStorage에 마킹되어 사실상 더 이상 표시되지 않던 잔존물.",
    ],
    changes: {
      ko: [
        "그림자 기물이 '지하 보스' 필터에 잘못 포함돼 있던 문제 수정 (지상에서 체스 조각상 조립 → 삭일 밤 소환 보스).",
      ],
      en: [
        "Fixed Shadow Pieces incorrectly appearing under the 'Underground' boss filter (it's a surface boss summoned from chess statues on a new moon).",
      ],
    },
  },
  {
    version: "0.23.0",
    date: "2026-05-08",
    dev: [
      "feat(bosses): 보스 카테고리 다중 분류 마이그레이션 — `category: BossCategoryId` 단일 필드 → `categories: BossCategoryId[]` 배열로 스키마 변경. 한 보스가 여러 분류에 동시 속할 수 있게 됨 (예: Ancient Fuelweaver = ['underground', 'story', 'raid']).",
      "feat(bosses): 카테고리 셋 개편 — 기존 `dungeon`(코뿔소 1마리뿐) 제거, 새로 `story`(스토리 진행 보스), `underground`(지하 보스 = 동굴/폐허) 도입. 최종 7종: seasonal/story/underground/raid/ocean/event/mini. 30개 보스 전부 다중 태그 재분류.",
      "feat(items): Great Depths Worm(거대 동굴지렁이, prefab `worm_boss`) 누락 등록 — 인게임 소스(scripts/prefabs/worm_boss.lua, tuning.lua) 기준. HP 5000, damage 14, spine reflect 14. categories=['underground','raid']. 임시 portrait는 chesspiece_wormboss.png 복사 사용.",
      "feat(items): Wrathful Rabbit King(분노한 토끼왕, prefab `rabbitking_aggressive`) 누락 등록 — Year of the Rabbit 이벤트 보스. HP 2000, damage 75. loot: monstermeat + beardhair×2 + rabbitkingspear. categories=['event','mini']. 임시 portrait는 rabbitking_lucky.png 복사 사용.",
      "data(bosses): bossCategories 배열에 story/underground 추가, 기존 dungeon 제거. 대표 보스: story=stalker_atrium, underground=minotaur.",
      "data(loot): wormlight(발광 베리), beardhair(수염털), rabbitkingspear(토끼왕의 곤봉), chesspiece_wormboss_sketch(거대 동굴지렁이 조각상 도면) 한글명 추가.",
      "i18n: boss_dungeon → boss_underground 리네임 + boss_story 신규. labels.ts(SEO)도 bcDungeon → bcUnderground + bcStory 동일 적용.",
      "refactor(seo): BossPageContent의 categoryKey/categoryColors/relatedBosses, seo-text.ts의 categorySeasons/categoryTipsKo/strategy 분기 모두 `boss.categories[0]` primary 또는 `categories.includes()` 매칭으로 마이그레이션. relatedBosses는 카테고리 교집합 매칭으로 변경.",
      "refactor(ui): BossesApp.tsx의 필터(`b.category === selectedCategory` → `b.categories.includes(...)`) + Detail panel 태그 칩(단일 → 다중) 마이그레이션.",
      "검증: tsc --noEmit clean, npm run build 성공.",
      "참고: Challenge Board mod(Workshop #3565356900)와 비교해 누락 보스 식별. Shadow Rifts 보스(Ink Blight 4종, Mega Blight)는 epic 태그 없는 rift event 적이라 보스 탭에서 제외, Mini 후보(Ewecus, Koalefant, Varglet, Birchnut Tree 변종)는 일반 elite 몹이라 제외.",
    ],
    changes: {
      ko: [
        "보스 분류 체계 개편 — 한 보스가 여러 카테고리에 속할 수 있게 됐습니다 (예: 고대의 연료직공 = 지하/스토리/레이드).",
        "새 카테고리 '스토리 보스' 추가, '던전 보스' → '지하 보스'로 변경 (의미가 더 정확해졌습니다).",
        "신규 보스 '거대 동굴지렁이(Great Depths Worm)' 추가 — 동굴 폭포 지대에 등장하는 거대 지렁이 보스.",
        "신규 보스 '분노한 토끼왕(Wrathful Rabbit King)' 추가 — Year of the Rabbit 이벤트 보스.",
        "보스 상세에 분류 칩이 모두 표시되도록 변경 (이전: 1개 / 변경: 해당 보스의 모든 분류).",
      ],
      en: [
        "Reworked boss categorization — a single boss can now belong to multiple categories (e.g. Ancient Fuelweaver = Underground / Story / Raid).",
        "Added new 'Story' category; renamed 'Dungeon' → 'Underground' for clarity.",
        "Added missing boss 'Great Depths Worm' — giant worm boss in the cave grotto.",
        "Added missing boss 'Wrathful Rabbit King' — Year of the Rabbit event boss.",
        "Boss detail now shows all category chips (was: only the first).",
      ],
    },
  },
  {
    version: "0.22.8",
    date: "2026-05-08",
    dev: [
      "fix(pwa): apple-touch-startup-image href에 ?v=${APP_VERSION} query string 추가 — iOS가 같은 URL의 splash 이미지를 영구 캐시하는 문제 회피. 0.22.7에서 splash bg를 흰색으로 바꿨는데도 사용자 디바이스가 빨간색 splash를 계속 보던 원인. 매 APP_VERSION bump마다 query 변경 → iOS 새 URL로 인식 → 재다운로드.",
    ],
    changes: {
      ko: [
        "iOS PWA splash가 이전 버전 이미지로 계속 표시되던 문제 수정 — 이번 배포부터는 매 버전마다 자동 갱신됩니다. 홈 화면 아이콘 삭제 후 재추가하면 새 splash가 적용됩니다.",
      ],
      en: [
        "Fixed iOS PWA splash sticking to old cached image — now auto-refreshes per version. Remove and re-add the home screen icon to pick up the new splash.",
      ],
    },
  },
  {
    version: "0.22.7",
    date: "2026-05-08",
    dev: [
      "fix(pwa): beta splash 배경색 빨간색(#dc2626) → 흰색(#ffffff). generate-ios-splash.mjs의 ENVS 배열에서 -beta 환경의 bg를 #ffffff로 변경.",
      "chore(pwa): beta manifest theme_color도 흰색으로 통일 — generate-manifest.cjs의 isBeta 분기 제거.",
    ],
    changes: {
      ko: [
        "iOS 베타 PWA splash 배경이 빨간색으로 표시되던 문제 수정 — 흰색으로 통일했습니다.",
      ],
      en: [
        "Fixed iOS beta PWA splash background showing red — now unified to white.",
      ],
    },
  },
  {
    version: "0.22.6",
    date: "2026-05-08",
    dev: [
      "fix(materials): wagpunk_bits 영문명 Wagpunk Bits → Scrap — 인게임 strings.lua(STRINGS.NAMES.WAGPUNK_BITS = \"Scrap\") 기준으로 보정. 한글은 이미 \"고철더미\"로 정확. B.U.D.D.Y. 등 wagpunk_bits 사용 레시피의 영문 표기가 게임 인벤토리와 일치하도록.",
      "fix(pwa): beta manifest의 name/short_name도 \"dstcraft.com\"으로 통일 — generate-manifest.cjs가 isBeta일 때 \"dstcraft.com (BETA)\" / \"dstcraft BETA\"로 분기하던 부분 제거. iOS는 apple-mobile-web-app-title보다 manifest의 short_name을 우선시하는 케이스가 있어, appleWebApp.title만 바꿔서는 홈 화면 이름이 그대로였음. manifest 자체를 통일.",
    ],
    changes: {
      ko: [
        "iOS 베타 PWA 홈 화면 이름이 여전히 \"dstcraft BETA\"로 표시되던 문제 수정 — manifest까지 통일했습니다. 기존 아이콘은 한 번 더 삭제 후 재추가하세요.",
      ],
      en: [
        "Renamed material 'Wagpunk Bits' → 'Scrap' to match the in-game name (Klei renamed it; Korean was already correct as 고철더미).",
        "Fixed iOS beta PWA home screen still showing \"dstcraft BETA\" — manifest is now unified with prod. Please remove and re-add the home screen icon once more.",
      ],
    },
  },
  {
    version: "0.22.5",
    date: "2026-05-08",
    dev: [
      "fix(pwa): iOS 스플래시 여전히 미표시 → Next.js 16 Metadata API의 `appleWebApp.capable: true`가 신규 표준 `<meta name=\"mobile-web-app-capable\">`만 출력하고 레거시 `<meta name=\"apple-mobile-web-app-capable\">`는 누락. iOS Safari는 PWA standalone 모드 활성화에 apple-prefix 메타가 여전히 필요 → layout.tsx <head>에 수동 주입.",
      "chore(pwa): appleWebApp.title을 \"dstcraft.com\"으로 통일 (prod \"Don't Craft Without Recipes\" / beta \"DST Craft (BETA)\" → 둘 다 \"dstcraft.com\"). manifest.json의 name/short_name과 일치.",
    ],
    changes: {
      ko: [
        "iOS PWA 스플래시 미표시 문제 재수정 — 기존 홈 화면 아이콘은 한 번 삭제 후 다시 추가해야 적용됩니다.",
        "iOS 홈 화면에 표시되는 PWA 이름을 \"dstcraft.com\"으로 통일 (베타도 동일).",
      ],
      en: [
        "Re-fixed iOS PWA splash screen — if you previously installed to home screen, please remove and re-add the icon.",
        "Unified iOS home screen PWA name to \"dstcraft.com\" (beta included).",
      ],
    },
  },
  {
    version: "0.22.4",
    date: "2026-05-08",
    dev: [
      "feat(items): B.U.D.D.Y.(w_radio) 누락 등록 — 인게임 소스(scripts/recipes.lua, prefabs/w_radio.lua) 기준으로 재료 wagpunk_bits×5 + transistor×2, TECH.LOST(Klei 보상 해금)이라 station=\"none\", 카테고리는 DECOR 필터에 맞춰 [\"decorations\"]. 한글명/설명은 ko.po 기준(이름 'B.U.D.D.Y.', 설명 '어디서 오는 신호일까요?').",
      "asset: public/images/game-items/w_radio.png 추가 (위키 dropped 이미지 → sips 64x64 리사이즈).",
      "data(locales/ko): items에 w_radio 항목 추가.",
    ],
    changes: {
      ko: [
        "신규 아이템 'B.U.D.D.Y.' 추가 — 라디오 퍼즐(Exspectamus) 보상으로 해금되는 농장 자동 관리 기기. 잡동사니 5 + 전기 장치 2로 제작, 주변 작물을 자동으로 돌봅니다.",
      ],
      en: [
        "Added missing item 'B.U.D.D.Y.' — Klei reward unlock from the Exspectamus radio puzzle. Crafted from 5 Scrap + 2 Electrical Doodads; automatically tends nearby farm plants.",
      ],
    },
  },
  {
    version: "0.22.3",
    date: "2026-05-08",
    dev: [
      "fix(pwa): iOS 스플래시 미표시 문제 — apple-touch-startup-image media query에 'screen and' 접두사 누락으로 iOS Safari가 매칭 실패하던 문제 수정. 로고 크기 25% → 40%로 시인성 개선.",
      "chore: .claude/scheduled_tasks.lock gitignore 처리.",
      "docs(workflow): CLAUDE.md Branch & Deploy Strategy 갱신 — 단일/다중 세션 무관하게 'git worktree + feature 브랜치' 기본값으로 통일. 다른 세션 존재 여부를 안정적으로 판단 불가 → '항상 격리'로 결정.",
      "todo: 트래픽·SEO 인사이트 액션 5건 추가 (WX-78 페이지 SEO 강화, referrer 풀 URL 저장, 싱가포르 봇 검증, 메인 추천 카드 bounce 개선, CF baseline 1주 누적 후 재분석).",
    ],
    changes: {
      ko: [
        "iOS에서 PWA로 설치한 경우 앱 로딩 스플래시가 표시되지 않던 문제를 수정했습니다. 로고 크기도 키워 시인성을 개선했습니다.",
      ],
      en: [
        "Fixed missing splash screen on iOS PWA installs. Also bumped logo size for better visibility.",
      ],
    },
  },
  {
    version: "0.22.2",
    date: "2026-05-08",
    dev: [
      "refactor(skills): WX-78 스킬트리 details.en 영문을 Klei 공식 어휘로 정렬 — max HP→max Health, sanity-regen gear→Sanity from clothing, enemy sanity drain aura→negative sanity auras, hunger rate→Hunger drain, Scout/Zap/Scanner drone→Roto-Mapper/Zaptrocuter/Bio Scanalyzer, AoE blast→area electric blast, cone flashlight→directional cone of light, mole vision tint→inverted Mole Hat vision, vs Shadow/Lunar→damage to Shadow/Lunar 등 13건. SKILL.md 'Klei vocabulary is the bar' 룰 적용.",
    ],
    changes: {
      ko: [],
      en: [
        "WX-78 skill tree English descriptions now use Klei's official in-game vocabulary (e.g. Roto-Mapper / Zaptrocuter / Bio Scanalyzer, Sanity from clothing, negative sanity auras).",
      ],
    },
  },
  {
    version: "0.22.1",
    date: "2026-05-08",
    dev: [
      "feat(pwa): iOS 공식 apple-touch-startup-image 도입 — 18개 기기 사양(src/lib/ios-splash-devices.json)을 single source로, scripts/generate-ios-splash.mjs가 sharp로 prod(흰색)/beta(빨강) 환경별 PNG 72장 자동 생성. 기존 #app-loading JS 오버레이 제거 (iOS는 standalone 모드에서 첫 페인트까지 OS 스플래시 표시 → 커스텀 오버레이가 오히려 깜빡임 유발). viewport themeColor 라이트/다크 동적 분기 (#ffffff / #0a0a0c).",
      "feat(pwa): beta 빌드 전용 manifest + BETA 배지 아이콘 — scripts/generate-beta-icons.mjs가 sharp로 6종 변형에 빨간 BETA 띠 합성, generate-manifest.cjs가 NEXT_PUBLIC_DEPLOY_ENV=beta일 때 name/theme_color/icons 분기. layout.tsx의 SITE_URL/title/icons 메타도 동일 env로 분기. .github/workflows/deploy-beta.yml에서 beta 스텝에 env 직접 주입.",
      "fix(skills): WX-78 영문 stat row 표시 정확도 — 영문 vital(허기 소모/정신력 오라/의복 회복) 추출 누락/중복 수정, 소켓 prefix 콤마/마침표 매칭 보강. Circuit Board detail에도 동일 vital 추출 헬퍼 적용 (refactor: 헬퍼 분리).",
      "docs(write): /write 스킬에 영문 작성 출처 우선순위 명시 — 인게임 텍스트 > 스크랩북 > 창작.",
    ],
    changes: {
      ko: [
        "iOS에서 PWA로 설치한 경우, 첫 로딩 화면(스플래시)을 OS 공식 방식으로 개선 — 화면 깜빡임 제거.",
        "WX-78 스킬트리 영문 표시 정확도 개선 — 일부 모듈 효과(허기 소모, 정신력 오라, 의복 회복)가 중복되거나 누락되던 현상 수정.",
      ],
      en: [
        "iOS installed PWA now uses Apple's official splash screens — eliminates the brief flash on launch.",
        "Improved WX-78 skill tree English text accuracy — fixed duplicate/missing module effects (Hunger Drain, Sanity Aura, Dapperness).",
      ],
    },
  },
  {
    version: "0.22.0",
    date: "2026-05-08",
    dev: [
      "release: beta 0.21.15 → 0.21.30 누적 변경분 main 승격. 핵심 주제 두 갈래 — (1) WX-78 스킬트리 디테일 패널 대규모 정비, (2) 배포 청크 캐시 UX.",
      "feat(skills): WX-78 현황 패널을 stat row 중심 구조로 재편. 이동속도/방어력/둔화 저항/체온/부패 속도/건조 속도/정신력 감소 오라/의복 정신력 회복/허기 소모 감소/화염 피해 저항 — 모듈 카운트 기반 자동 합산값을 stat row로 노출, 카드 list에서 중복 텍스트 strip. 클릭 시 DetailPanel에 메커닉 + 기여 모듈 breakdown.",
      "feat(skills): DetailHeader / TypeChip / TagChip 등 공용 컴포넌트로 효과/스킬/통계 디테일 분기를 통일. 인게임 ItemDetail 스타일(아이콘 카드 + 제목 + 서브타이틀 + 알파/베타/감마 배지 + 카운트 칩) 일관 적용.",
      "refactor(ui): StatBox 공용 컴포넌트 추출 — 요리 RecipeDetail의 stats box + WX-78 stat row 단일 컴포넌트화. 색상은 +값=초록 / 부패 +값=빨강 시멘틱.",
      "feat(skills): 냉각/발열 회로 본문 수치를 count로 곱한 누적값 표시 (게임 소스 추출 additive linear 케이스: MINTEMPCHANGE_PER_MODULE × count, preserver lean × PERISH_RATE_MODULELEAN, heat_activate maxDryingRate += 0.1).",
      "fix(skills): WX-78 details 인게임 코드 대조 검증 후 7건 수정 — alphabuffs_2 빈부스터 dapperness +30%, Hardy 'damage taken' 의미 명확화, betabuffs_1 Thermal ×2/면역 정정, Refrigerant 화염 피해만, Chorusbox 인어, Rangebooster 0.65/0.8, Electrification 약 15/12/10회. 이외 합산 카드 클릭 버그 / 둔화 저항 아이콘 / 빈부스터 비문 등 잔손질.",
      "fix(deploy): chunk-load 에러 UX — layout.tsx에 매처 6종 + retry 2회 + 2회차 ?_v=APP_VERSION cache-bust + 감지 즉시 visibility hidden으로 React 에러 boundary 렌더 가림. sw.template.js의 _next/ fetch가 .js/.css 404 받으면 활성 윈도우에 CHUNK_MISSING postMessage → 동일 silent reload 경로로 위임 (script 태그 우회 fetch 안전망).",
      "fix(settings): 개발자 메뉴 토글 useState lazy 초기화로 변경 — 마운트 즉시 localStorage 값 반영, isAdmin 비동기 로드와의 타이밍 불일치로 잠깐 보이던 flicker 제거.",
    ],
    changes: {
      ko: [
        "WX-78 스킬트리 상세 패널 대대적인 정비 — 이동속도, 방어력, 체온, 부패 속도, 정신력 오라 등을 한눈에 보는 수치 행으로 정리하고, 클릭하면 어떤 모듈이 얼마씩 기여하는지 분해해서 보여줍니다.",
        "WX-78 모듈 효과 수치 검증 — 인게임 코드와 대조해 빈부스터/하디/단열/냉매/합창 모듈 등 7개 항목의 잘못된 수치를 수정했습니다.",
        "냉각/발열 회로를 여러 개 끼웠을 때 누적 수치(예: 2개 → 체온 -40°)를 본문에서 바로 볼 수 있게 수정.",
        "배포 직후 잠깐 에러 메시지가 깜빡이고 자동 새로고침되던 현상을 제거 — 새 빌드로의 전환이 보이지 않게 처리됩니다.",
      ],
      en: [
        "Major overhaul of the WX-78 skill tree detail panel — movespeed, armor, temperature, perish rate, sanity aura and more are now consolidated into stat rows, and clicking each shows a breakdown of contributing modules.",
        "Verified WX-78 module values against in-game code — corrected 7 entries (Bean Booster, Hardy, Thermal, Refrigerant, Chorusbox, etc.).",
        "Cold/heat circuits now show cumulative values inline when stacked (e.g. 2× cold → temperature −40°).",
        "Eliminated the brief error flash + auto-refresh that could appear right after a deploy — recovery is now invisible.",
      ],
    },
  },
  {
    version: "0.21.30",
    date: "2026-05-08",
    dev: [
      "fix(deploy): chunk-load 에러 UX — 새 빌드 직후 옛 HTML이 가리키는 _next/ chunk가 사라졌을 때 Next.js 클라이언트 에러 UI가 잠깐 보이고 reload되는 증상 제거. (1) layout.tsx의 chunk-retry IIFE를 SW 등록 블록 위로 이동시켜 window.__dstChunkReload 노출. 매처 6종(ChunkLoadError/Loading chunk/Loading CSS chunk/Failed to load/error loading dynamically imported module/Importing a module script failed)으로 확대, retry 1→2회 + 2회차에 ?_v=APP_VERSION cache-bust, 감지 즉시 e.preventDefault() + documentElement.style.visibility='hidden'으로 React 에러 boundary 렌더 가림, error 리스너는 capture phase 등록. (2) sw.template.js의 _next/ fetch가 .js/.css 404 받으면 모든 활성 윈도우에 postMessage({type:'CHUNK_MISSING'}) 브로드캐스트, layout.tsx의 SW message 핸들러가 받아 동일 silent reload 경로로 위임 — script 태그 우회 fetch에도 안전망 동작.",
    ],
    changes: {
      ko: ["배포 직후 에러 메시지가 잠깐 깜빡이고 새로고침되던 현상 제거 — 자동 재시도가 보이지 않게 처리됨"],
      en: ["Eliminated the brief error flash + auto-refresh that could appear right after a deploy — recovery is now invisible"],
    },
  },
  {
    version: "0.21.29",
    date: "2026-05-08",
    dev: [
      "fix(settings): 개발자 메뉴 토글 — useState lazy 초기화로 변경하여 마운트 즉시 localStorage 값 반영. 기존엔 기본값(true)로 마운트 후 useEffect에서 비로소 localStorage 읽어 false로 갱신했는데, isAdmin 비동기 로드와 타이밍이 어긋나 OFF 상태인데도 메뉴가 잠깐 보이는 flicker 발생. PWA/배포 후 fresh mount마다 재현되어 사용자 입장에선 \"꺼놨는데 자꾸 켜짐\"으로 인식됨. devMenuEnabled는 isAdmin 게이트 안에서만 사용되므로 SSR HTML에 노출되지 않아 lazy 초기화로 hydration 불일치 우려 없음",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.28",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 의복 정신력 회복 / 허기 소모 감소도 stat row로 이동, 머지 카드 list 렌더링 제거",
      "  · 의복 정신력 회복: 태머센터(walrushat.png) 아이콘",
      "  · 허기 소모 감소: 허기의 허리띠(armorslurper.png) 아이콘",
      "  · Row 4 (alpha-buff aggregated): 정신력 감소 오라 + 의복 정신력 회복 + 허기 소모 감소 (3 columns)",
      "  · Row 5 (beta-buff): 화염 피해 저항 (단일)",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.27",
    date: "2026-05-08",
    dev: [
      "refactor(ui): StatBox 공용 컴포넌트 추출 (src/components/ui/StatBox.tsx) — 요리 RecipeDetail의 stats box + WX-78 현황 stat row가 동일 컴포넌트 사용. 한 곳 수정하면 양쪽 반영 (사용자 피드백 #965 \"이거 컴포넌트화 하면 일일히 양쪽 수정 안해도 되자나?\")",
      "feat(skills): WX-78 stat row에 색상 적용 (statColor) — 요리 RecipeDetail과 동일한 +값=초록 / 부패 +값=빨강 시멘틱. 사용자 입장 좋은 효과는 초록, 나쁜 효과는 빨강",
      "feat(skills): 정신력 감소 오라 + 화염 피해 저항 stat row 추가 (Row 4) — 사용자 피드백 #963 #964",
      "  · 정신력 감소 오라: 비퀸 모자(hivehat.png) 아이콘",
      "  · 화염 피해 저항: 비늘(dragon_scales.png) 아이콘",
      "  · 화염 저항 메커닉: 각 cold + Beta T1 모듈마다 -50% (cap 100% at 2+)",
      "  · 카드 list에서 sanity-aura 머지 카드 제거, fire-resist 행 제거 → stat row가 유일 표시",
      "  · 클릭 시 DetailPanel breakdown",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.26",
    date: "2026-05-08",
    dev: [
      "fix(skills): 효과 detail 패널 — 효과를 메인으로, 모듈은 출처(secondary)로 되돌림 (사용자 피드백 #960). 효과 텍스트가 큰 텍스트로 위, 모듈 카드는 작게 아래. 통계 detail(movespeed/armor/...)은 stat이 메인이므로 DetailHeader 스타일 유지",
      "refactor(skills): 인라인 칩(베타/×2/스킬 강화)을 기존 TagChip 컴포넌트로 통일 — 사용자 피드백 #959 \"x2같은건 이미 사용하는 디자인이 있고 태그필도 이미 쓰고 있는게있는데\". TypeChip 커스텀 컴포넌트 제거, 크래프팅 ItemDetail이 쓰는 TagChip 패턴 그대로 사용",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.25",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 stat row 추가 — 체온/부패 속도/건조 속도. cold/heat 모듈 카운트 기준 자동 계산 (사용자 피드백 #955)",
      "  · 체온: (heat − cold) × 20° (signed)",
      "  · 부패 속도: (heat − cold) × 25% (signed, + = 빠른 부패)",
      "  · 건조 속도: heat × 10% (heat-only)",
      "  · 아이콘: heatrock.png / ui/perish.png / meatrack.png",
      "  · 클릭 시 DetailPanel — 메커닉 설명 + 기여 모듈(발열 회로 ×N → +N° / 냉각 회로 ×N → −N° 등)",
      "feat(skills): cold/heat 모듈 본문에서 체온/부패/건조 부분 strip — stat row와 중복 방지. 남는 텍스트는 \"주변 생존자의 체온도 낮춰/높여준다.\"만 카드 표시. applyCountToBody는 stripCountedStatsFromBody로 대체",
    ],
    changes: { ko: [], en: [] },
  },
  {
    version: "0.21.24",
    date: "2026-05-08",
    dev: [
      "feat(skills): WX-78 Detail 패널 디자인 통일 — 크래프팅 ItemDetail 스타일(아이콘 카드 + 제목 + 서브타이틀 + 배지 + 우측 값)로 effect/skill/movespeed/armor/slow/neg_aura/dapper/hunger_drain/vital 모든 분기 통합 (사용자 피드백 #953 '대리석 씨앗쪽이 보기 좋아 보임')",
      "feat(skills): DetailHeader 공용 컴포넌트 + TypeChip 추출. 효과 헤더에 모듈 아이콘 56px + 한글/영문 이름 + 알파/베타/감마 칩 + 카운트 칩 + 스킬 강화 칩 일관 표시",
      "feat(skills): 합산 stat 헤더 아이콘 — 정신력 감소 오라=초연산 회로, 의복 정신력 회복=고급 모자, 허기 소모 감소=고급 위장 회로, 체/허/정 vital=health/hunger/sanity UI 아이콘",
    ],
    changes: { ko: [], en: [] },
  },
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
