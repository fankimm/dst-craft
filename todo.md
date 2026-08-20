# DST Craft — TODO

> 프로젝트 전체 작업 목록. `/todo`로 확인 후 작업 이어서 진행.
> 상태: `[ ]` 미착수 · `[~]` 진행중 · `[x]` 완료

---

## 진행중

### 광고(Ezoic) 도입 후속 [~] (#75 릴리즈 완료, 2026-08-14)
> #75는 v0.33.0으로 **production 배포 완료** (커밋 `1b193ac`, 워크트리·브랜치 정리됨).
> 아래는 배포 후 남은 것들. ~~1번이 최우선~~ → **1번(세금·지급·계약·MCM)은 2026-08-17 전부 처리 완료.**
> **다음 최우선: 🔴 주소확인 PIN 대응(수취인 주소 점검 → 우편 도착 시 즉시 입력, 마감 10/2).** 그다음 3-1 수익 개선 레버(anchor / 측정 격차) → 10/15 Ramp-up 판단.
>
> **기억할 날짜 3개: 🔴 `10/2` 주소확인 PIN 마감(넘기면 광고 게재 중단) · `10/15` 계속 여부 판단(통보 기한) · `11/11` Ramp-up 만료(넘기면 1년 자동 확정)**
> ⚠️ **PIN 마감이 Ramp-up 판단일보다 먼저다.** PIN을 놓치면 광고가 멈추고 → EPMV 데이터가 끊겨 → 10/15 판단 자체가 불가능해진다.

#### 1. 돈이 실제로 들어오게 하는 것 — 2026-08-17 대부분 처리, **주소 확인 PIN만 진행중(마감 10/2)**
- [x] **W-8BEN 제출** (2026-08-14) — Ezoic → Billing & Payments → TAX INFORMATION. Individual / Form W-8 / South Korea. 기본값이 `United States` + `Form W-9`라 그대로 두면 미국인 신고가 되는 함정이 있었음. Country를 먼저 바꿔야 폼이 W-8 계열로 전환됨. 조세조약 조항 입력란은 없고 서명란 위 declaration 4번이 그 역할
- [x] 지급 수단 등록 (2026-08-14) — Wise → PayGate(개인), **KRW 직접 수취**, 국민은행 계좌 끝 2829. Net 30 / 최소 지급액 $20
  - 예금주명(`Full name of the account holder`)은 **로마자만** 받음 (한글 입력 시 `Input is an invalid format`)
  - 지급 설정 변경은 **매월 15일까지** 해야 그 달 지급에 반영
- [x] **Publisher agreement 서명** (2026-08-17) — todo에 없던 미완료 항목이었음. 아래 "계약 조건" 참고
- [x] **AdSense 계정 재활성화** (2026-08-17) — `pub-4567930429443718`이 활동 없음으로 비활성화돼 있었음. 재활성화 + dstcraft.com 등록 완료
- [x] **MCM(Google Ad Manager) 신청** (2026-08-17) — 네트워크 코드 `23368262432`, 상위 게시자 `Ezoic NA 8`, 위임 유형 인벤토리 관리, 통화 USD / 시간대 Asia/Seoul (첫 주문 후 변경 불가라 확정값)
- [x] **MCM 구글 승인** ✅ (2026-08-17 15:16 KST) — `admanager-noreply@google.com` / 제목 `Ad Manager 계정이 승인됨`. 네트워크 코드 `23368262432`. 메일 왈: *"인벤토리 관리를 시작하기 전에 몇 가지 단계를 더 완료해야 합니다. Ezoic NA 8에서 연락을 드릴 것"*
  - Ezoic 대시보드 `Ad Manager Account Status`는 승인 직후에도 한동안 `Pending`으로 표시됨 (동기화 지연). Ezoic 표시를 승인 여부의 근거로 쓰지 말 것 — 구글 메일/Ad Manager가 기준

- [x] **Ad Manager 도메인 심사 ✅ 통과 (2026-08-20 확인)** — 8/17 제출 → `Approved`
  > 2026-08-20 Ezoic setup: **`Ad Manager Domain Status: Approved`** / *"Your domain has been approved by Google."* (8/18까지 `In Progress`였음)
  - 이것이 구글 수요(AdX) 진입을 막던 병목이었다. 통과했으므로 **이제부터 붙는 수요가 정상 상태**
  - 🔴 **EPMV 데이터 기산일 = 2026-08-20.** 10/15 판단까지 약 8주 → 표본은 충분하다
  - **8/20 이전 수익 숫자는 전부 "수요가 빠진 상태"의 값**이다. 아래 baseline과 비교용으로만 쓰고, 낮다고 해서 판단 근거로 삼지 말 것
  - 며칠 내로 RPM이 오르는지가 첫 확인 지점. 안 오르면 그때 원인을 따로 볼 것
  - ⚠️ setup 화면의 *"Ad demand and revenue are limited until Ad Manager is fully set up"* 경고는 아직 남아 있다 — 이제는 **주소 확인(Pending) 하나 때문**

- [~] **🔴 [진행중] 주소 확인 PIN — 2026-08-18 발송됨. 시계 돌기 시작. 마감 2026-10-02**
  > 근거: `admanager-noreply@google.com` / 2026-08-18 17:40 KST / 제목 `조치 필요: Ad Manager에서 수취인 주소를 확인해 주세요`
  > *"2026. 8. 18.에 PIN 번호가 담긴 우편물을 Ad Manager에 등록하신 수취인 주소로 발송했습니다"*
  > *"이 PIN을 사용하여 주소를 인증하지 않으면 광고 게재에 영향이 있습니다. 단, 예약 캠페인에서는 계속 광고가 게재됩니다"*
  - 신원 확인은 **완료** — 2026-08-17 `payments-noreply@google.com` "AdSense 본인 인증이 완료되었습니다" → Ezoic setup에 `Identity: Verified`로 반영
  - 2026-08-20 Ezoic setup이 드디어 `Address Verification: **Pending**`으로 전환 (8/18 PIN 발송을 이틀 늦게 반영). **Ezoic 표시는 항상 늦는다**는 것이 또 한 번 확인됨
  - **일정**
    | 날짜 | 내용 |
    |---|---|
    | 2026-08-18 | PIN 우편물 발송 (시계 시작) |
    | ~2026-09-08 | 도착 예상 (구글 안내 "통상 3주"). 안 오면 **이 시점부터 재발송 요청 가능** — 새 PIN은 이전 발송 3주 후부터만 요청됨 |
    | **2026-10-02** | **45일 마감. 미인증 시 광고 게재 중단** |
  - [x] **수취인 주소 점검 ✅ 이상 없음** (2026-08-20 확인 검사 화면 직접 확인)
    - 한글로 통일돼 있고(`South Korea`만 영문 — 국제우편 라우팅용이라 정상), 우편번호 5자리·동/호수까지 정확. 구글이 경고한 "입력란 언어 혼용"에 해당하지 않음
    - `용인시, 경기도` 순서가 뒤집혀 보이는 건 구글 폼이 city→state 순이기 때문. `South Korea`까지 온 뒤 국내 우체국이 우편번호로 읽으므로 무관
    - → **10/2 마감에서 우리가 통제할 수 있었던 유일한 변수가 해소됐다.** 이제 우편을 기다리는 것 외에 할 일이 없다
  - **[ ] PIN 도착하면 즉시 입력** — 우편 도착 → Ad Manager `#payments/verification`에서 입력
    - ⚠️ **입력 시도는 3회뿐이다** (화면: *"시도가 3번 남았습니다"*). 오입력하면 잠긴다 — 숫자를 두 번 확인하고 넣을 것
    - ⚠️ **`PIN 다시 보내기` 버튼이 이미 노출돼 있지만 ~9/8 전에는 누르지 말 것.** 메일 안내상 새 PIN은 이전 발송 3주 후부터만 유효하고, 잘못 누르면 배송 중인 기존 우편이 무효화될 위험이 있다
  - 💸 **지급은 이미 보류 중** — 화면 상단 경고: *"인증 절차가 완료되지 않아 지급이 보류 중입니다. 지급을 받으려면 인증 절차를 완료하세요."*
    - 즉 광고 게재 중단(10/2)보다 **먼저, 지금도** 출금이 막혀 있다. 최소 지급액 $20에 아직 못 미쳐 체감은 없지만, PIN 인증이 지급의 전제 조건이다
  - 입력 지연 → 광고 중단 → EPMV 데이터 공백 → 10/15 Ramp-up 판단 불가로 이어짐. 이 연쇄를 기억할 것
  - 근거 문서: https://support.google.com/admanager/answer/13985965

- [ ] **[감시 항목] 비공개 입찰 보호 조치 변경 — 2026-08-18 공지, 30일 후(~2026-09-17) 적용. 조치 불요로 판단**
  > `admanager-noreply@google.com` / 2026-08-18 22:28 KST / 제목 `조치 필요: 비공개 입찰 보호 조치의 예정된 변경사항`
  > *"2026년 8월 18일을 기점으로 30일 후부터 Google Ad Manager는 기본적으로 모든 비공개 입찰에 대해 광고주/브랜드 및 구매자 차단을 적용합니다"*
  - 대상은 **Private Auction / Programmatic Deal을 직접 운영하는 퍼블리셔**. 조치 방법은 해당 거래에 '차단 무시'를 켜는 것
  - 우리 네트워크(`23368262432`)는 **Ezoic NA 8에 MCM 인벤토리 관리 위임** 상태라 직접 만든 비공개 입찰 거래가 없음 → **켤 대상 자체가 없음**
  - → **조치 불요.** 다만 확정하려면 Ad Manager → 비공개 입찰 목록이 비어 있는지 한 번 확인하면 됨 (미확인)
- [ ] ~~광고 소재 카테고리 차단~~ — 사용자 판단으로 보류 (2026-08-17)
##### ⚠️ Publisher Agreement 계약 조건 (Version: February 2025) — 놓치면 1년 묶임
- **독점(§2)**: 사이트의 모든 프로그래매틱 인벤토리를 Ezoic이 독점. 다른 네트워크/AdSense 직접 연동 불가, **ads.txt도 Ezoic 것만**
  - → **AdSense 홈의 `애드센스에 사이트를 연결하세요 → 시작하기` 누르지 말 것.** MCM엔 불필요하고 §2와 충돌
- **1년 약정 + 자동 갱신(§4)**: 초기 90일이 Ramp-up Period. **이 안에 30일 전 서면 해지 통보를 안 하면 남은 1년에 묶임.** 이후 1년씩 자동 갱신(해지는 다음 Term 시작 90일 전 통보). 반면 Ezoic은 사유 없이 30일 통보로 해지 가능(비대칭)
- **기산일**: "수익화 시작일" 과 "서명 후 14일" 중 빠른 쪽 → 8/13 광고 켠 시점 기준이면 **Ramp-up 마감 ≈ 2026-11-11**
- [ ] **🔴 2026-10-15까지 계속 여부 판단** — Ramp-up 마감(11/11) 30일 전. EPMV 2~4주 데이터 보고 결정. 놓치면 1년 자동 확정
- 관할: 캘리포니아 법 / 샌디에이고, Ezoic 재량으로 AAA 중재 강제 가능
- 사이트 자동 편입: 나중에 계정에 추가하는 사이트는 90일 ramp-up 후 자동 포함. 원치 않으면 90일 끝나기 30일 전 제거

#### 2. 오늘 발견했지만 못 끝낸 것 (코드/조사)
- [~] **광고 자리 15px — 원인 위치 특정 완료, CLS 무해 판정. 더 파지 않기로 함** (2026-08-17 실측)
  - **"beta 143 vs prod 158"은 오진이었음.** 환경 차이가 아니라 **Ezoic 로드 여부** 차이. 같은 prod URL을 Ezoic 스크립트만 차단하고 재측정:

    | | slot | card | label | placeholder |
    |---|---|---|---|---|
    | 정상 | **158** | **142** | 19 | 100 |
    | Ezoic 차단 | **143** | **127** | 19 | 100 |

    `label(19) + placeholder(100) + card padding(8) = 127` → 차단 시 값과 정확히 일치. 143이 우리 CSS가 의도한 높이가 맞음
  - **15px의 정확한 위치**: 라벨 하단(`labelBottom`)과 placeholder 상단(`phTop`) 사이. 문서 좌표로 `-190.25 → -175.25`
  - 그 자리에 **노드 없음**(`childNodes`가 DIV 2개뿐, 텍스트 노드 없음), **의사요소 없음**(`::before/::after` 모두 `content:none`), 양쪽 **margin 0**, placeholder는 `static`/`float:none`. 인플로우 형제 사이 공백이라 익명 라인박스 외엔 설명이 안 되는데 흔적 못 찾음 → **미해결로 남김**
  - ✅ **하지만 CLS 무해**: 같은 페이지 CLS **0.0032**(데스크탑) / **0**(모바일 390). 기준선 0.1의 1/30 수준. `min-h-[100px]` 예약이 제대로 먹고 있어 **로드 후 밀림이 아니라 처음부터 그 높이로 그려짐** → 순수 미관 문제
  - **결론: 우선순위 낮춤.** 15px 미관을 위해 Ezoic 주입 CSS와 씨름할 가치 없음. 자리를 다시 손볼 때 같이 보면 됨
  - ~~주의: 사용자 브라우저가 계속 `ezstandalone.enabled === false`(무광고 대조군)여서 실제 광고가 붙은 상태를 한 번도 못 봄~~ → **취소.** `enabled=false`는 클린 헤드리스에서도 동일하고 광고는 정상 서빙됨 (3-1 참조)

- [x] **SEO 페이지 640px 자리에 어떤 규격이 배달되는지 → 해결 (2026-08-20, #83에서 728로 확장)**
  - `/item/abigail-flower` 데스크탑 1600px: 우리 `top` 자리 폭 **640px**, placeholder `#111` **640×100**, 그 안에 Ezoic이 잡은 크리에이티브 슬롯 **높이 90px**
  - ⚠️ 당시 이걸 "728×90 계열 띠를 기대하고 있음"으로 읽었는데 **오독이었다.** 폭 640에는 728×90이 애초에 못 들어온다 — 높이 90은 468×60/320×100 같은 좁은 띠의 자리였을 뿐. 아래 97줄 항목이 같은 파일에서 정확히 진단해 놓았는데도 이쪽을 `[x]`로 닫아버려 조치가 두 달 밀릴 뻔했다 (`docs/mistakes.md` 참조)
  - **해결**: `AdBleed`(`md:-mx-11`)로 640 → 728 확장, SEO 상세 6종에 적용 (#83)
  - ⚠️ 단, 헤드리스/데이터센터 IP라 **실제 크리에이티브 iframe은 no-fill**(`creatives: []`). 규격 후보는 Ezoic이 예약한 90px로 추정한 것이고, 실사용자 환경에서 재확인 필요
  - → 걱정했던 "+180px 시프트" 리스크는 현재 근거 없음. 자리를 728로 넓히는 작업은 보류

- [x] **Ezoic 자동 삽입 placeholder 116·117 정체 확인** — 우리 레이아웃 침범 아님
  - `#116` → `div#ez-sidebar-wall-left` 직속, `#117` → `div#ez-sidebar-wall-right` 직속. 둘 다 **`<body>` 바로 아래**에 붙는 Ezoic 자체 **사이드월(sidebar wall)** 유닛, 160×606
  - 본문 흐름 밖(좌우 여백)이라 컨텐츠를 밀지 않음 → CLS 원인 아님. 모바일(390px)에서는 아예 삽입 안 됨
- [x] **SEO 페이지 640px 자리 → 728로 확장 완료 (2026-08-20, #83)** — 진단은 8/17에 이미 정확했다: *"`<main>`이 `max-w-2xl`+`px-4`라 자리 폭이 640px이고 728×90이 후보에서 빠진다. 하필 구글 랜딩 페이지들"*
  - `AdBleed`(`src/components/ads/AdBleed.tsx`)로 `md:-mx-11` 브레이크아웃 → 640 + 88 = 728. md(768px) 미만 미적용(가로 스크롤 방지), 목록형(`max-w-4xl` 864px)은 이미 충분해 제외
  - 걱정했던 336×280 시프트는 근거 없음이 확인됐고(`BAND_BOX` max-w 728이 상한), 예약 100px 안에 728×90(90px)이 들어가 CLS도 그대로
  - **효과 측정**: 도메인 승인(8/20)과 같은 시점에 들어가므로 두 변화가 섞인다. RPM 상승분을 둘로 나눠 귀속시키지 말 것
  - 확인: `node scripts/check-ad-slots-live.mjs https://www.dstcraft.com/item/<slug>`
  - 사각형이면 → 자리를 728까지 넓히는 작업 필요(`-mx` 브레이크아웃 등)
- [x] **`limitCookies` — prod 미적용으로 확정 (2026-08-20, #83)** — 위치: `src/app/layout.tsx` cmd 큐 인라인 스크립트, `IS_BETA`일 때만 주입
  - 이 옵션은 ID 싱크 픽셀을 줄인다 = **타게팅 데이터가 줄어 단가가 떨어지는 쪽**이다. 요청 수는 줄지만 수익과 맞바꾸는 거래
  - 도메인 승인(8/20) 직후는 구글 수요가 처음 붙는 구간이라 **단가를 깎는 옵션을 넣을 시점이 아니다.** 10/15 판단을 위해서도 수익 상한을 먼저 봐야 한다
  - beta는 트래픽이 없어 감소폭 측정이 불가하므로 beta 설정은 그대로 둔다(해가 없음). 나중에 요청 수·페이지 무게가 문제로 드러나면 그때 prod 적용을 재검토
  - → **"켤지 말지"의 답은 지금은 '아니오'.** 항목을 열어두면 매번 다시 판단하게 되므로 닫는다

#### 3. 결정 항목 — **2026-08-20 전부 "현행 유지"로 확정** (#83)
> 사용자 방침: **최대 수익 우선.** 아래는 전부 "수익을 깎아 다른 것(요청 수·용량·UX)을 얻는" 거래라, 도메인 승인(8/20) 직후 수익 상한을 아직 보지 못한 지금은 손댈 이유가 없다.
> 항목을 열어 두면 볼 때마다 다시 판단하게 되므로 닫는다. **10/15 판단 때 EPMV를 손에 쥐고 한꺼번에 재검토**한다.
- [x] **Vignette(전면 광고) → 유지** — 요청·용량의 가장 큰 덩어리지만 동시에 RPM 기여도 크다(8/17 기준 interstitial `$0.86`으로 포맷 중 최고). 끄면 그 수익이 그대로 사라진다. `disableInterstitial` / `vignetteDesktop·Mobile·Tablet`은 언제든 되돌릴 수 있는 스위치이므로, 페이지 무게가 실제 문제로 드러날 때 다시 본다
- [x] **Ad Refresh 주기(~40초) / 수요처 수 → 현행 유지** — 줄이면 요청은 급감하지만 단가도 같이 떨어진다. 수익 최대화와 정면으로 반대되는 조작
- [x] **레일 2개 → 유지** — 원래도 "손으로 지우지 말 것"이 결론이었다. Ezoic Ad Tester가 placeholder 조합을 자동 테스트 중이라 사람이 지우면 그 학습을 망친다

#### 3-1. 수익 개선 레버 (2026-08-17 조사 완료)

- [x] **anchor 포맷 RPM $0.00 — 조사 완료, 고장 아님** — `AdSlot.tsx`의 `AD_PLACEHOLDER_ID`에 등록된 자리는 `top:111` / `sheet:103` / `rail-left:107` / `rail-right:108` 4개뿐. **anchor(=Adhesion, 100번)를 쓰는 코드가 아예 없음.** "안 팔린 것"이 아니라 "자리를 안 만든 것"
  - [~] **정정 (2026-08-20, #83): 이건 코드로 만들 자리가 아니다** — Adhesion(100)은 **Ezoic이 대시보드 설정에 따라 자동 삽입하고 `position:fixed`로 직접 배치**하는 유닛이다(`docs/mistakes.md` "Ezoic 자동 배치가 전면·하단 고정 광고를 제멋대로 삽입" 참조). RPM $0.00의 실제 원인은 "자리를 안 만든 것"이 아니라 **#75에서 UX 이유로 대시보드에서 껐기 때문**
    - 코드로 placeholder 100 div를 넣으면 본문에 유령 자리(예약 높이 + AD 라벨)가 남고 광고는 따로 하단에 고정되는, 둘 다 생기는 꼴이 될 수 있다 → **시도하지 않는다**
    - [ ] **남은 결정: Ezoic 대시보드에서 Adhesion을 다시 켤 것인가** — 켜면 RPM은 오르지만 화면 하단 91px을 상시 점유한다. 브라우저에서 Ezoic 대시보드 접근이 필요한 작업이고, UX 트레이드오프라 사용자 판단 사항

- [~] **Identity Coverage First-Party 0% — 켜는 게 아니라 "할지 말지"의 문제였음** — Identity 탭 실물 확인 결과 설정 토글이 아님
  > *"Ezoic Identity (ezID) enables you to provide **privacy-safe hashed emails or phone numbers**"* / Get Started → **"CONNECT OR UPLOAD YOUR LIST"** (계정 연동 또는 **csv 업로드**)
  - 즉 **우리 사이트 이용자들의 이메일을 광고 네트워크에 업로드**해야 올라가는 수치. dstcraft.com은 구글 로그인(GIS)을 써서 DB에 실제 이메일이 있음
  - **해시를 하더라도 개인정보를 광고 목적으로 제3자에게 제공하는 행위** → 국내법상 별도 동의 필요, 현재 개인정보처리방침에 해당 고지 없음
  - **결론: 하지 않는 쪽을 기본값으로 둔다.** First-Party 0%는 결함이 아니라 선택. 나머지(Third-Party 5.7% / Identity Graph 0.4%)는 Ezoic이 알아서 올리는 영역이라 우리가 손댈 게 없음

- [x] **`ezstandalone.enabled === false` — 오해였음 (중요)** — 헤드리스 클린 브라우저(이력·쿠키 없음)에서도 **동일하게 `false`**. 즉 "사용자 브라우저만 무광고 대조군에 걸린 것"이 아니라 **모든 방문에서 false**
  - **그런데 광고는 정상적으로 나가고 있음**: `[data-ad-slot="top"]` 높이 158px, placeholder inner HTML 823자, iframe 4개, `securepubads.g.doubleclick.net/tag/js/gpt.js` + `pubads_impl.js` + `direct.adsrvr.org/bid/bidder/ezoic` 전부 로드됨
  - **→ `ezstandalone.enabled`는 광고 on/off 플래그가 아니다.** 이 값으로 "광고가 안 붙는다"고 판단하면 안 됨. 2번 섹션에 적어둔 "실제 광고가 붙은 상태를 한 번도 못 봄"은 사실이 아니었음

- [x] **Ezoic이 우리 코드에 없는 placeholder를 자동 삽입 중** — 실측 DOM의 placeholder는 `111`(우리 `top`) + **`116`, `117`**. 116·117은 `AdSlot.tsx`에 없는 번호 → Ezoic 자동 삽입(auto-insert) 유닛
  - [ ] 116·117이 화면 어디에 들어가는지 확인 필요. 우리가 CLS 대비로 예약해 둔 자리가 아니라서 **레이아웃 시프트의 미확인 원인일 수 있음**

- [ ] **Ezoic visits(949) vs 자체 UV 격차 — 스크립트 미실행은 아님** — 위 실측에서 `g.ezoic.net/saa.go?...&npv=true` 정상 발화 확인. 측정 자체는 되고 있음. 남은 설명 후보:
  - 자체 analytics에 **봇 포함** (전체 CN 9,116 ≈ 10%, SG 1,982, `docs`상 봇 ~10.2%) — Ezoic은 이런 트래픽을 visit로 안 셈
  - **중국 트래픽은 `ezojs.com`·doubleclick 도달 불가** → Ezoic 집계에 애초에 안 잡힘
  - 정의 차이: Ezoic=세션, 자체=일별 UV 합산
  - → **격차 자체는 이상 징후가 아닐 가능성이 높음.** EPMV 계산은 Ezoic visits 기준으로 하는 게 맞음

##### 실측 재현 방법 — `scripts/check-ad-audit.mjs` (2026-08-17 추가)
```bash
npm i -D playwright-core                                              # 레포 devDep 아님
node scripts/check-ad-audit.mjs https://www.dstcraft.com/item/abigail-flower 1600 1000
node scripts/check-ad-audit.mjs https://www.dstcraft.com/item/abigail-flower 390 844   # 모바일
```
한 번에 덤프하는 것: **CLS 총합 + 가장 크게 밀린 노드 5개**, 문서 내 **모든** ezoic placeholder(우리 것/자동 삽입 구분 + 부모 체인 + 좌표), 배달된 크리에이티브 iframe 규격, 우리 `[data-ad-slot]` 실측 크기.
기존 하네스 3종은 자리 회귀 검증용이고, 이건 **"지금 실제로 무엇이 어디에 그려졌나"** 를 보는 용도.

#### 4. 지켜볼 것
- [ ] EPMV — 첫 2~3일 숫자는 표본이 작아 무의미. 판단은 최소 1~2주 데이터로. **MCM 승인 전 데이터는 아예 쓰지 말 것**(수요처가 빠진 상태)
- 트래픽 baseline (2026-08-17, `curl https://www.dstcraft.com/api/stats`): 전체 PV 88,233 / UV 45,442 · 7월 PV 27,678 / UV 15,301 · 8월(17일) PV 14,361 / UV 7,982 · 광고 켠 이후 일 PV 800~1,000 · 데스크탑 68% · 유입 google.com 28,434 압도적
- **📌 수익 baseline (2026-08-17, MCM 승인 전 / 도메인 심사 전 / 광고 가동 5일차)** — 개선폭을 재는 기준선. **도메인 승인(8/20) 전 값이므로 구글 수요가 통째로 빠져 있다.** 비교 대상으로만 쓸 것
  - Estimated Earnings **$0.68** (30일, 전액이 최근 7일 = 8/13 배포 이후 발생)
  - Ezoic Website Visits **949** (30일) → **EPMV ≈ $0.72 / 1000 visits**
  - 포맷별 RPM: display `$0.50` · interstitial `$0.86` · side rails `$0.64` · anchor `$0.00`
  - Rewarded Revenue $0.00 (미설정)
  - 대시보드 경고: *"Ads can begin serving before setup is finished. Complete remaining steps to unlock full demand and revenue."*
  - **해석**: RPM 정상 범위는 통상 $2~15. 현재 $0.5~0.9는 MCM 미승인으로 구글 수요(AdX)가 통째로 빠진 상태의 값. 낮다고 판단 근거로 쓰지 말 것
- [ ] **Core Web Vitals (서치 콘솔)** — 유입 65%가 구글인데 광고를 넣었다. CLS/LCP/INP 추이 확인. CrUX는 28일 롤링이라 반영이 느림. **순위가 내려가면 광고 수익보다 손실이 큼**

#### 참고 (이번에 만든 것)
- 회귀 하네스 3종 — 자리 건드리면 반드시 돌릴 것 (`npm i -D playwright-core` 필요, 레포에는 devDep 미포함)
  ```bash
  node scripts/check-ad-slots.mjs https://beta.dstcraft.com          # 탭 순회·전환
  node scripts/check-ad-slots-stress.mjs https://beta.dstcraft.com   # 연타·모바일·왕복 20회·검색
  node scripts/check-ad-cls.mjs https://beta.dstcraft.com            # 규격별 자리 높이 변화 (띠 계열 전부 0이어야)
  ```
- 규칙은 `docs/ui.md`의 AdSlot 섹션, 오답노트는 `docs/mistakes.md`("광고 자리를 예약해 놓고 CLS를 못 막고 있었음")

### 요리탭 검색·재료 표시 정확도 [~] (#25, 2026-05-10)
> 크롬으로 production 직접 검증해 발견한 이슈들. #25에서 핵심 두 항목 처리, 나머지는 후속 점검.
- [x] 재료 ItemSlot 매핑 — `Small Fish` / `Small Meat` / `Seeds` ingredient name mismatch alias 추가 (#25)
- [x] text 검색 결과에 raw food 노출 — `useCookingSearch`에 `searchRawFoodsForTags()` + 별도 grid 섹션 (#25)
- [ ] 검색 결과에 즐겨찾기/최근에 raw food 통합 — `filteredRecipes` 로직 확장
- [ ] cookpot 레시피의 ingredient 이름 정규화 점검 — `recipes.ts` requirements가 cookpot 정식명으로 통일되어 있는지 (현재는 alias로 우회)
- [ ] cooked 변종 다른 채소 추가 검토 (eggplant_cooked, pumpkin_cooked 등) — 현재는 durian만 화이트리스트. 사용자 요청 시 확장
- [ ] raw food 검색 한국어 ingredient label 매칭 — \"채소\" 입력 시 raw 채소들도 매치 (현재는 영문 foodType만 매치)

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
  - [x] ~~24h 후 SG 비중 재분석~~ — 기한 지나 종료 (2026-08-18 정리). 차단 룰 적용·경계 IP 검증은 위에서 완료. 재점검 필요 시 아래 쿼리 재사용: `ssh mac-mini "sqlite3 ~/dstcraft/data/app.db \"SELECT substr(ip,1,instr(ip,'.'||substr(ip,instr(ip,'.')+1,99))-1) AS prefix2, COUNT(*) FROM analytics_uv WHERE date >= '2026-05-10' GROUP BY prefix2 ORDER BY 2 DESC LIMIT 20\""` 또는 기존 분석 스크립트 재사용. 차단 후 SG IP 트래픽이 0/매우 낮아야 정상
- [ ] **메인 추천 카드 — bounce rate 개선** — 현재 76% (DST 가이드 특성상 자연스러우나 75%↓ 시도)
  - 메인에서 인기 회로/스킬트리/요리로 유도하는 추천 카드 도입
  - "최근 본 항목" 또는 "이 캐릭터의 회로" 같은 cross-link
- [x] ~~**CF Web Analytics baseline 누적 후 재분석**~~ — 기한 지나 종료 (2026-08-18 정리). 현재 트래픽 분석은 GoAccess + 자체 analytics(`/stats`)로 대체됨

---

## 대기 (다음 작업 후보)

- [x] **CF "static cache" rule 좁히기 — All requests → 정적 자산만** (2026-05-07 완료)
  - expression: `true` → 정적 자산만 (/_next/static/, /images/, /icons/, 확장자 매칭)
  - edge_ttl: `override_origin 1d` → `respect_origin`
  - CF API로 적용, HTML `cache-control: public, max-age=60` origin 헤더 살아있음 확인
- [x] **Vercel → Mac mini 셀프호스팅 이주** ✅ (2026-05-07 시작 → 이주 완료) — prod/beta 모두 Mac mini(nginx + Cloudflare Tunnel) 서빙. Vercel은 watchdog failover 용도로만 잔존. 상세: `TODO-self-hosting.md`
- [x] **Vercel 빌드를 사용자 영향 변경에만 한정** ✅ (#17, 2026-05-09) — `vercel.json`에 `ignoreCommand: bash scripts/vercel-ignore.sh` 추가. src/, public/, package*, next.config, tsconfig, postcss.config, vercel.json, scripts/generate-* 외 변경(docs, .claude, todo.md, memory, bun-api 등)은 Vercel 빌드 스킵. Hobby 한도 잠식 완화. drift 위험은 사용자 영향 변경 시 자연 해소 — failover 신뢰성 유지.
- [ ] **git 히스토리 이메일 재작성** (2026-04-27, 우선순위 높음) — 회사 계정(kolon.com) 314커밋이 GitHub에 노출됨. 다른 머신(macOS 권장)에서 진행. 상세 계획: `TODO-rewrite-email-history.md`
- [x] 누락된 보스 추가 (2026-04-14) — 8종
- [x] 건조대/구이 등 비요리솥 음식 정보 (2026-04-14) — 구이 31종 + 건조 6종
- [x] 요리솥 시뮬 — 최근 시도한 재료 / 선호 재료 기능 (2026-04-14)
- [ ] SEO — 스탯 데이터를 SSG 페이지(`/item/[slug]`)에도 반영
- [ ] 퀘스트 탭 — 검증 못 한 단계 묘사 재확인 (와그스태프 기구 4대 mechanism, 천상의 공물 충전 메커니즘 등). #29 배포분에 남은 유일한 후속

---

## 완료

### 퀘스트 탭 ✅ (#29, v0.24.0 · 2026-05-13 배포)
> Challenge Board 모드 구조로 4개 퀘스트(은둔자/연료직공/대변자/귀공자) 구현.
- [x] 퀘스트 4종 + 단계/서브스텝 데이터, 진행률 goal 10 + 마커, 필수 단계 의존성 잠금
- [x] 펄 portrait·집수리 단계별 위키 이미지, 윈치/베리덤불 등 아이콘 정비
- [x] 서브스텝 접기/펼치기, 재료 옆 수량 인접 표시
- [x] 제작 가능 아이템 → 제작 탭 점프(↗), DetailPanel "← 퀘스트" 빠른 뒤로
- [x] 보스탭 연동 — `step.bossId` → `onViewBoss` (stalker_atrium / minotaur)
- 남은 후속 1건은 "대기" 섹션 참조 (단계 묘사 재확인)

### 트래픽 분석 권장 액션 ✅ (2026-05-09, P0~P2 전부 완료)
> 근거: GoAccess + raw nginx access.log 3일 분석 (567명 / 99,646 요청 / 봇 ~10.2%)
> 우선순위: P0=실유저 영향, P1=품질, P2=보안/안정성. SEO 강화는 위 2026-05-08 섹션 참조.

#### P0 — `/api/skills` 401 토큰 만료 처리 (실유저 영향) ✅ (#10, v0.23.5)
- [x] `src/lib/jwt.ts` + `src/lib/api-fetch.ts` 신설 (decodeJWTPayload + isJWTValid + apiFetch wrapper + AUTH_EXPIRED_EVENT)
- [x] favorites-api.ts 4함수, analytics.ts 5함수 wrapper 사용. fetchAnalytics는 token optional이라 inline 검증 + public fallback
- [x] useAuth가 auth:expired 이벤트로 자동 logout

#### P1 — `_vercel/insights/*` 호출처 제거 (404 1,415건) ✅ (#11, v0.23.6)
- [x] 원인: layout.tsx의 `<Analytics />` (`@vercel/analytics`). Vercel 셀프호스팅 이주 후 잔존
- [x] import + 컴포넌트 제거, package.json/lock 정리

#### P2 — nginx 보안/봇 차단 룰 ✅ (#12)
- [x] path 기반 차단: `/wp-*`, `/wordpress/*`, `/wp-admin/*`, `/wp-includes/*`, `/.env`, `/.git/*`, `xmlrpc.php`, `/test.php`, `/phpinfo*` → `return 444`
- [x] UA 기반 차단: `AhrefsBot|MJ12bot|TLM-Audit-Scanner` → `return 444`
- [x] AI 검색 + 검색 엔진 봇은 차단 안 함 명시 (주석)
- [x] **Mac mini reload 적용 완료** (2026-05-09) — 워커 프로세스 5/9 14:52:23 재시작 확인. 외부 검증: `/wp-admin`, `/.env`, `/xmlrpc.php`, `User-Agent: AhrefsBot` 모두 502 (origin 444 close), 정상 요청은 200

#### P2 — 2026-05-07 17:33~18:31 bun-api 502 사고 RCA — 조사 완료, follow-up 분리
> 결론: 프로세스가 hang(deadlock 추정)이라 launchd KeepAlive(Crashed:true)는 트리거 안 됨. err.log 0바이트(stderr 안 씀), DiagnosticReports에 crash 없음, macOS unified log retention(2일) 만료로 직접 증거 소실. Watchdog은 정확히 감지했으나 **Telegram secrets 미설정으로 알림 안 갔음**.
- [x] err.log/crash report 확인 → 증거 없음
- [x] watchdog 동작 확인 → 08:34 UTC부터 3/3 fail 다수 기록, alert 미발송
- 후속 follow-up (#13):
  - [x] **`TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` repo secrets** — 사고 직후(2026-05-07) 사용자가 설정 완료. 향후 2/3·3/3 헬스 실패 시 자동 알림 발송됨
  - [x] **bun-api 액세스 로그에 ISO 타임스탬프 추가** — `bun-api/src/index.ts`의 `logger()`를 timestamp prefix wrapping으로 교체
  - [x] **watchdog 자동 복구 스텝 추가** — `vars.WATCHDOG_AUTORECOVER=1` flag 뒤에 Tailscale + SSH + launchctl kickstart. 활성화하려면 `.github/workflows/README-watchdog-secrets.md` 참고하여 `TS_AUTHKEY` / `SSH_PRIVATE_KEY` secrets + `WATCHDOG_AUTORECOVER` / `WATCHDOG_MACMINI_HOST` / `WATCHDOG_MACMINI_USER` vars 설정 필요
- 예상 작업량: 0.5d

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
