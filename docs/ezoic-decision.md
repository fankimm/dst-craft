# Ezoic 계속 여부 결정 (기한: 2026-10-15)

> **이 문서 하나만 읽으면 결정할 수 있게 쓴다.** 판단 재료가 `todo.md`·`docs/mistakes.md`·
> 릴리즈 노트·대화 맥락에 흩어져 있어 세션이 바뀌면 유실된다. 새 세션이 이 문서만 열어도
> 무엇을 보고 어떻게 정하는지 알 수 있어야 한다.
>
> 세션 시작 시 `scripts/check-deadlines.sh`가 D-30부터 자동으로 알린다 (SessionStart 훅).

## 왜 기한이 있나

Ezoic Publisher Agreement (Version: February 2025)는 **1년 약정 + 자동 갱신**이다.
초기 90일이 Ramp-up Period이고, **그 안에 30일 전 서면 해지 통보를 하지 않으면 남은 1년에 묶인다.**
기산일은 "수익화 시작일"과 "서명 후 14일" 중 빠른 쪽 → 8/13 광고를 켠 시점 기준.

| 날짜 | 내용 | 놓치면 |
|---|---|---|
| `2026-09-08` | PIN 재발송 요청 가능 최초일 | 우편 미도착인데 넘기면 10/2 전 2차 시도가 불가능 |
| `2026-10-02` | Ad Manager 주소확인 PIN 입력 마감 | **광고 게재 중단** → 데이터가 끊겨 아래 판단 자체가 불가능 |
| **`2026-10-15`** | **계속 여부 통보 기한** | **1년 자동 확정** |
| `2026-11-11` | Ramp-up 만료 | 계약이 1년으로 굳음 |

⚠️ **10/2가 10/15보다 먼저다.** PIN을 놓치면 광고가 멈추고, 그러면 판단 근거인 EPMV가
끊긴다. PIN 대응이 결정보다 상위 우선순위다.

## 선택지는 둘뿐이다

우리 트래픽(월 UV 약 1.5만)으로 갈 수 있는 곳이 사실상 이 둘이다. Mediavine 5만 세션,
Raptive 10만, Monumetric 1만+셋업비 — 전부 문턱이 있고 Ezoic만 무제한이다.

1. **Ezoic 유지** — 통보 없이 10/15를 넘기면 자동으로 이쪽
2. **AdSense 단독** — 10/15까지 서면 통보 필요

> **AdSense를 병행 테스트할 수 없다.** Publisher Agreement §2가 사이트의 모든 프로그래매틱
> 인벤토리를 Ezoic에 독점시키고 ads.txt도 Ezoic 것만 쓰게 한다. 즉 비교는 순차적으로만
> 가능하고, AdSense가 더 나쁘면 Ezoic 복귀는 **새 1년 계약**이다. 되돌리기 비용이 비대칭이다.

## 결정 기준 — 숫자로 정한다

핵심 질문은 "어느 쪽 ePMV가 높은가"가 **아니다.** Ezoic은 단가가 높고 AdSense는 노출률이
높다. 그래서 비교해야 하는 건 **실효 수익 = 단가 × 노출률**이다.

### 왜 노출률이 변수가 되나

Ezoic은 `window load` 이후에야 광고 파이프라인을 시작한다 (인과 확정, 아래 실측 참조).
그 결과 첫 광고가 **중앙값 5.1초**에 뜬다. 그 전에 떠난 방문자는 Ezoic이 visit로는 세지만
노출은 0이다 — **즉 ePMV $1.23에 그 손실이 이미 반영돼 있다.**

AdSense 단독 동종 사이트는 첫 광고가 **0.67~2.3초**다. 스크립트 1장이고 CMP가 임계경로
밖이라 구조적으로 빠르다. 그래서 짧은 세션에서도 노출이 난다.

### 계산

```
Ezoic 실효 RPM   = ePMV ÷ (1 − 광고를 못 본 비율)
AdSense 예상 ePMV = Ezoic 실효 RPM × (1 − 단가 하락률) × AdSense 노출률
```

- **단가 하락률**: 헤더비딩 → AdSense 단독 전환 시 통상 30~50%. **보수적으로 40%를 쓴다**
- **AdSense 노출률**: 첫 광고 0.67~2.3초이므로 95% 가정

| 광고 못 본 비율 | Ezoic 실효 RPM | AdSense 환산 | 판정 |
|---|---|---|---|
| ~22% | $1.58 | $0.90 | Ezoic 유지 |
| ~38% | $1.98 | $1.13 | 거의 동률 |
| 45% 이상 | $2.24+ | $1.28+ | **AdSense 단독** |

### 판정 규칙

> **`(early + noscript) ÷ 전체 판정 표본` 이 40%를 넘으면 AdSense 단독으로 전환한다.**
> 30~40%면 동률 구간이므로 **속도를 택해 AdSense**로 간다 (수익이 같다면 5초 지연을 살 이유가 없다).
> 30% 미만이면 Ezoic을 유지한다.

여기에 **거부권 하나**를 둔다:

> 서치 콘솔 Core Web Vitals가 "양호 → 개선 필요"로 내려가면, 위 계산과 무관하게 AdSense로
> 간다. 유입의 65%가 구글 검색이라 순위 하락 손실이 월 $13보다 크다.
> (현재까지는 안전 — 광고 ON/OFF 입력 지연이 3/45로 동일하고 CLS 0.0019~0.013로 임계 0.1 한참 아래)

## 어디서 숫자를 보나

### 1. 광고 도달률 — `www.dstcraft.com/stats` "광고 도달" 섹션 (관리자 로그인)

또는 API 직접:

```bash
curl -s "https://www.dstcraft.com/api/stats?days=30" | python3 -m json.tool | grep -A12 adVisibility
```

| 버킷 | 뜻 | 판정에서의 역할 |
|---|---|---|
| `filled` | 소재가 실제로 그려짐 | 수익 발생 |
| `nofill` | 요청은 나갔는데 재고 없음 | Ezoic이 못 채운 것 — 단가 문제가 아니라 수요 문제 |
| `early` | **광고 도착 전에 이탈** | ← **이게 핵심 변수** |
| `noscript` | Ezoic 본체 미도달 (차단·중국·네트워크) | AdSense로 바꿔도 안 잡힘 |
| `blocked` | 광고 필터 감지 | AdSense로 바꿔도 안 잡힘 |

`adFillMs`는 실사용자 첫 광고 도착 시각 분포(`0-2s`~`20s+`)다. 헤드리스 실측이
실사용자에게도 맞는지 확인하는 유일한 근거다.

⚠️ **2026-08-27 이전 데이터는 쓰지 말 것.** v0.33.7 이전에는 판정 체크포인트가 4초
고정이라 "아직 오는 중"인 광고가 통째로 `nofill`로 집계됐다 (#86, `docs/mistakes.md`).

### 2. ePMV — Ezoic 대시보드

`analytics.ezoic.com` → Revenue → Earnings. 일별 표에서 Visits / ePMV.

⚠️ **"지난 30일" 라벨을 데이터 기간으로 읽지 말 것.** 수익화가 최근에 시작돼 실제
데이터 기간이 더 짧다. 일 단위로 정규화해서 볼 것 (#85에서 이걸로 15배 오진).

### 3. Core Web Vitals — 구글 서치 콘솔

CrUX가 28일 롤링이라 반영이 느리다. **9월 중순에 한 번, 10/10 전에 한 번** 확인.

## 지금까지의 실측 (2026-08-27 기준)

### 수익

| 항목 | 값 |
|---|---|
| 기간 | 2026-08-19 ~ 08-25 (도메인 승인 후 첫 온전한 1주) |
| Earnings | **$3.10** |
| Visits | 2,515 (일 359) |
| **ePMV** | **$1.23** (일별 $0.96~$1.81) |
| 월 환산 | 약 **$13** |

일별 ePMV가 8/20 $1.81 → 8/25 $0.99로 하락 추세. 승인 직후 반짝인지 추세인지 9월 데이터 필요.

### 속도 — 첫 광고 페인트 (데스크탑, 실제 UA)

| 사이트 | 첫 광고 | 충전률 |
|---|---|---|
| howmany.wiki (AdSense 단독) | **0.67초** | 3/3 |
| alldistancebetween (AdSense 단독) | 1.04초 | 3/3 |
| 9minecraft (AdSense 단독) | 2.31초 | 3/4 |
| **dstcraft (Ezoic)** | **5.14초** | 7/7 |
| dexerto (대형 헤더비딩) | 5.10초 | 4/4 |

**"우리가 잘못 붙였나"는 아니다.** Ezoic 동종 4곳 중 우리가 가장 빠르고 가장 안정적이다
(manuals.plus 2/7 충전 9.1초, magneticmag 0/4, collegefactual 0/4, we-ha 0/3).
광고 페이로드도 우리 46개 1.8MB vs Ezoic 동종 51개 2.1MB로 동급이고, AdSense 단독은
19~23개 **0.4MB**다. **구현을 개선해서 좁힐 수 있는 격차가 아니다.**

### 왜 느린가 — 원인 확정

첫 광고까지 약 5초 중 **4초(80%)가 `window load` 이후 Ezoic·Google 파이프라인**이다.

**Ezoic은 `window load`를 기다린다 (인과 확정)**: `sacountry.go` 요청이 `loadEventEnd` ±3ms에
붙는 것을 독립 세션 3개에서 24/24, 26/26, 12/12 관측. 대역폭을 안 쓰는 1×1 gif를 3초 늦게
응답시켜 `load`만 +2379.5ms 밀자 `sacountry.go`도 +2379.4ms 밀렸다 (Δ≤0.3ms, 4/4).

**입찰 타임아웃이 페이지뷰마다 랜덤**: `gampad/ads` = `pbjs.requestBids + T + 24ms`.
T 분포 500ms 8회 / 750ms 12회 / 875ms 1회 / **2000ms 4회** (n=25).

전체 실측과 "손대면 안 되는 항목 7종"은 `todo.md`의 **3-2. 광고 렌더 지연** 섹션 참조.

### 모바일에서의 추가 손실

Fast3G에서 홈·characters는 `window load`가 30초 내에 발화하지 않아 **광고가 0회 뜬다.**
모바일이 트래픽의 32%다. 보스 PNG 축소(#88)로 일부 회복되지만, 근본 원인은 `window load` 게이트다.

## 분기별 실행 절차

### A. Ezoic 유지

아무것도 하지 않으면 자동으로 이쪽이다. 다만 **결정했다는 사실을 기록**할 것 —
`todo.md`와 이 문서에 판정 근거와 날짜를 남기고, `scripts/check-deadlines.sh`의
해당 줄에 `done:` 접두어를 붙인다.

다음 해지 기회는 **다음 Term 시작 90일 전 통보**다. 그 날짜를 즉시 마감일 표에 추가할 것.

### B. AdSense 단독으로 전환

**10/15까지 서면 통보가 도착해야 한다.** 통보가 늦으면 1년이 확정된다.

1. **해지 통보** — Ezoic 지원(`support@ezoic.com`) + 계약서에 명시된 통지 방법으로 서면 발송.
   30일 전 통보이므로 실제 종료는 11월 중순. **발송 증빙을 보관할 것** (관할이 캘리포니아 법 /
   샌디에이고, Ezoic 재량으로 AAA 중재 강제 가능)
2. **전환 준비** (해지 효력 발생 전까지는 §2 독점이 살아 있으므로 병행 금지)
   - AdSense 계정 `pub-4567930429443718` — 이미 활성, dstcraft.com 등록 완료
   - MCM 위임 해제: Ad Manager 네트워크 `23368262432`에서 상위 게시자 `Ezoic NA 8` 위임 철회
   - `ads.txt`: 현재 `srv.adstxtmanager.com/19390/dstcraft.com`으로 301 리다이렉트
     (`bun-api/infra/nginx-dstcraft-common.conf`) → AdSense 자체 ads.txt로 교체 + nginx reload
   - `src/app/layout.tsx`의 Ezoic·CMP 스크립트 4종 제거 → `adsbygoogle.js` 1장으로 교체
   - `src/components/ads/AdSlot.tsx` — placeholder 방식에서 AdSense 광고 단위로 교체.
     **예약 높이 구조(`reserve`)는 유지할 것** — CLS 방어는 광고망과 무관하다
   - `/privacy`의 Ezoic 조항 + `ezoic-privacy-policy-embed` 앵커 정리
   - CMP: AdSense는 Google Funding Choices를 쓸 수 있고, 임계경로 밖이라 속도 이점이 여기서 나온다
3. **전환 후 4주간 ePMV 비교** — 예상보다 나쁘면 기록해 둘 것. Ezoic 복귀는 새 1년 계약이므로
   가볍게 결정하지 말 것

## 관련 문서

- `todo.md` — 광고 섹션 (실측 원본, 3-2 지연 조사, 계약 조건 전문)
- `docs/mistakes.md` — 광고 / Ezoic 섹션 (이 판단에서 이미 밟은 함정들)
- `scripts/check-deadlines.sh` — 마감일 알림 (SessionStart 훅)
- 이슈: [#85](https://github.com/fankimm/dst-craft/issues/85) 도달 계측 · [#86](https://github.com/fankimm/dst-craft/issues/86) 판정 교정 · [#87](https://github.com/fankimm/dst-craft/issues/87) 이 문서
