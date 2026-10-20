const APP_CACHE = "dst-app-__BUILD_HASH__";
const IMG_CACHE = "dst-images-v1";
const BASE = new URL(self.location.href).pathname.replace(/\/sw\.js$/, "");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) =>
      cache.addAll([BASE + "/", BASE + "/manifest.json"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // 옛 dst-app-* 캐시가 있으면 update, 없으면 fresh install
      const oldAppCaches = keys.filter(
        (k) => k !== APP_CACHE && k !== IMG_CACHE && k.startsWith("dst-app-")
      );
      const isUpdate = oldAppCaches.length > 0;

      await Promise.all(
        keys
          .filter((k) => k !== APP_CACHE && k !== IMG_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();

      if (isUpdate) {
        // 활성 탭에 새 빌드 도착 알림. 페이지(layout)가 자기 빌드 해시(`window.__dstBuild`)와 비교해
        // 다를 때만 reload한다 — navigation은 SW가 가로채지 않아 첫 접속 HTML은 대개 이미 새 빌드이고,
        // 그런데도 무조건 reload하면 배포 뒤 첫 접속마다 화면이 깜빡였다 (#128).
        // 예전의 `client.navigate()` 강제 reload(listener 없는 옛 PWA용 안전망)는 뺐다 — 옛 셸이 사라진
        // chunk를 부르면 fetch 핸들러의 CHUNK_MISSING 경로가 어차피 reload시킨다
        const build = APP_CACHE.replace("dst-app-", "");
        const clients = await self.clients.matchAll({ type: "window" });
        for (const c of clients) c.postMessage({ type: "SW_UPDATED", build });
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 교차 출처는 손대지 않는다 (#75).
  // 이 가드가 없으면 광고·분석 요청까지 아래 stale-while-revalidate로 흘러가
  // ① SW를 한 번 더 거치는 지연이 붙고(DevTools에서 initiator가 `sw.js`로 찍힌다)
  // ② 입찰/광고 응답이 캐시에 들어가 다음 로드에 stale 응답이 서빙될 수 있다.
  // SW가 다뤄야 할 건 우리 자산뿐이다.
  if (url.origin !== self.location.origin) return;

  // Images + icons: persistent cache-first (survives app updates)
  if (url.pathname.startsWith(BASE + "/images/") || url.pathname.startsWith(BASE + "/icons/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(IMG_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // JS/CSS/_next assets: cache-first (hashed filenames = immutable)
  if (url.pathname.startsWith(BASE + "/_next/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(APP_CACHE).then((cache) => cache.put(event.request, clone));
          } else if (response.status === 404 && /\.(js|css)$/.test(url.pathname)) {
            // 옛 HTML이 사라진 chunk 참조 → 활성 클라이언트에 silent reload 요청
            self.clients.matchAll({ type: "window" }).then((clients) => {
              for (const c of clients) c.postMessage({ type: "CHUNK_MISSING", url: url.pathname });
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // API: SW 가로채기 금지 — HTTP-level Cache-Control + 클라이언트 dedupe로 처리.
  // SWR로 가로채면 매 호출마다 백그라운드 revalidate 추가 fetch 발생 + 응답이 stale로 남음.
  if (url.pathname.startsWith(BASE + "/api/")) return;

  // Navigation: 가로채지 않음 — Safari bfcache + browser HTTP cache 그대로.
  // 새 빌드 propagation은 (a) clients.navigate()를 activate에서 호출 + (b) nginx에 max-age=60 짧은 HTML cache로 처리.
  // (이전 시도: network-first { cache: 'no-store' } 실패 — Safari에서 페이지 클릭 안 됨 회귀 발생)
  if (event.request.mode === "navigate") return;

  // Other (fonts, etc.): stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(APP_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
