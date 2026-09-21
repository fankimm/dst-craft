# Ezoic 지원 티켓 초안 — 입찰 타임아웃 상한 하향 요청 (#124)

> **상태: 미제출.** 9/22 판독이 끝난 뒤에 보낸다 — Ezoic이 설정을 바꾸면 측정 구간이 오염된다
> (`docs/ezoic-decision.md` "7. 측정 동결"). 제출하면 `todo.md` 3-2의 해당 항목을 체크하고
> 여기에 제출일·티켓 번호·답변을 적을 것.
>
> 근거 수치의 출처: 실사용자 분포는 `docs/ezoic-decision.md` 2026-09-21 절, 타임아웃 분포·
> 파트너 수치는 `todo.md` 3-2 (2026-08-27 실측). 파트너 낙찰 0은 헤드리스·데이터센터 IP 편향
> 가능성이 있어 **타임아웃 하향을 주 요청으로, 파트너 검토는 부 요청으로** 둔다.

## 보낼 곳
Ezoic 대시보드 → Support → Submit a ticket (카테고리: Ad Performance / Monetization)

## 제목
Request to lower header bidding timeout cap — first ad arrives at a median of ~7s for real users (dstcraft.com, JS standalone)

## 본문

Hello,

I run dstcraft.com (JavaScript standalone integration, ~70% desktop; top countries are South
Korea and the United States). I am asking for help reducing the time to first ad, and I have
measurements that point to the auction timeout rather than our integration.

**What real users experience**

We record when the first ad creative becomes visible, measured from navigationStart, for
real (non-headless, non-admin) sessions. Across 3,957 filled sessions:

| Time to first creative | Share |
|---|---:|
| 2–4s | 2.6% |
| 4–6s | 28.6% |
| 6–8s | 38.5% |
| 8–12s | 22.6% |
| 12s+ | 7.7% |

The median is about 7.0 seconds. Over the last complete week (Sep 14–20, 5,087 sessions),
62% of sessions left or hid the tab before any creative arrived, and only 20% ever saw an ad.
Fill rate is not the issue — among sessions that stayed long enough to be judged it is 69%.
The loss is almost entirely sessions that end before the first ad shows up.

**What we have already ruled out on our side**

- Script order follows your docs: gatekeeperconsent CMP → sa.min.js → analytics.js, with the
  `ezstandalone.cmd` queue created inline before them. CMP scripts carry `data-cfasync="false"`;
  Cloudflare Rocket Loader is not active on the page.
- TTFB is 0.2–0.4s and the HTML completes in under 0.5s. The page's `window load` fires at
  roughly 1.1–1.8s on desktop.
- Our `showAds(...ids)` call is batched into a single call and is queued 680–777ms before
  your queue drains, so placeholders are never the thing being waited on.
- `?ez_js_debugger=1` shows our three placements mapped correctly (Content_1,
  SidebarFloating_1, SidebarFloating_2) plus the interstitial.

**What we measured in your pipeline**

- `sacountry.go` is requested within ±3ms of `loadEventEnd` (62/62 observations), so the ad
  pipeline starts only after `window load`.
- The delay between `pbjs.requestBids` and the `gampad/ads` request equals a timeout value T
  plus ~24ms, and T varies per page view: 500ms ×8, 750ms ×12, 875ms ×1, **2000ms ×4** (n=25).
  Time from pipeline start to first paint fits `≈ 2460ms + 1.2 × T`.
- In those auctions, `insticator` was called 57 times with 0 wins, timed out 24 times, and had
  a median response time of 1375ms. `yieldmo` returned no responses and timed out 7 times.
  (These runs were from a data-center IP, so win rates may not be representative — the
  timeouts and response times are what I would like you to look at.)

**Requests**

1. Could you cap the header bidding timeout for this site at 750ms (or lower), and remove the
   2000ms arm from whatever test is assigning it? With a median of 7s to first ad and 62% of
   sessions ending before that, a longer auction cannot pay for itself here.
2. Could you review whether `insticator` and `yieldmo` should stay in the auction for this
   site, given how often they run into the timeout without winning?
3. Is there a supported way for a standalone site to start the ad pipeline before
   `window load` (for example at DOMContentLoaded)? If a setting or flag exists, I would like
   to try it.

I can share HAR files and the raw per-day numbers if that helps.

Thank you,
Jihwan Kim
dstcraft.com
