import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import Script from "next/script";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/hooks/use-settings";
import { AuthProvider } from "@/hooks/use-auth";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { APP_VERSION } from "@/lib/version";
import iosSplashDevices from "@/lib/ios-splash-devices.json";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-korean",
  subsets: ["latin"],
});

const IS_BETA = process.env.NEXT_PUBLIC_DEPLOY_ENV === "beta";
const SITE_URL = IS_BETA ? "https://beta.dstcraft.com" : "https://www.dstcraft.com";
const ICON_SUFFIX = IS_BETA ? "-beta" : "";

export const metadata: Metadata = {
  title: IS_BETA
    ? "[BETA] Don't Craft Without Recipes — DST Crafting & Cooking Guide"
    : "Don't Craft Without Recipes — DST Crafting & Cooking Guide",
  description:
    "Don't Starve Together crafting & cooking guide — DST craft calculator, crock pot simulator, skill tree simulator, and recipe finder. Search all crafting recipes, crock pot recipes, materials & character-specific items.",
  keywords: [
    "Don't Starve Together",
    "DST",
    "Don't Craft Without Recipes",
    "crafting guide",
    "crafting recipes",
    "cooking guide",
    "cooking recipes",
    "crock pot",
    "crock pot recipes",
    "recipe",
    "guide",
    "DST crafting",
    "DST cooking",
    "DST recipes",
    "DST crock pot",
    "DST food",
    "crafting station",
    "DST items",
    "dont starve together recipes",
    "dst crafting guide",
    "dst recipes",
    "dont starve crafting guide",
    "dst crock pot recipes",
    "dont starve crock pot calculator",
    "dont starve together crafting calculator",
    "dst recipe simulator",
    "dst crock pot simulator",
    "dont starve recipe finder",
    "dst crafting list mobile",
    "dont starve together item list",
    "skill tree",
    "skill tree simulator",
    "DST skill tree",
    "dst skill tree simulator",
    "dont starve together skill tree",
    "dst character skills",
    "dst skill tree planner",
    "dst skill tree guide",
    "굶지마 제작",
    "굶지마 제작법",
    "굶지마 투게더",
    "굶지마 투게더 제작",
    "굶지마 투게더 제작법",
    "굶지마 레시피",
    "굶지마 요리",
    "굶지마 요리솥",
    "굶지마 가이드",
    "DST 제작",
    "DST 제작법",
    "돈스타브 제작",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ko: "/ko",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Don't Craft Without Recipes — Don't Starve Together Guide",
    description:
      "Complete Don't Starve Together crafting & cooking guide with skill tree simulator. Search all crafting recipes, crock pot recipes, materials & character-specific items.",
    siteName: "Don't Craft Without Recipes",
    locale: "en_US",
    alternateLocale: ["ko_KR", "ja_JP", "zh_CN", "zh_TW", "fr_FR", "de_DE", "es_ES", "ru_RU", "pt_BR", "pl_PL", "it_IT"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Don't Craft Without Recipes — Don't Starve Together Crafting & Cooking Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Don't Craft Without Recipes — Don't Starve Together Guide",
    description:
      "Complete Don't Starve Together crafting & cooking guide with skill tree simulator. Search all crafting recipes, crock pot recipes, and materials.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "dstcraft.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: `/icons/icon-192${ICON_SUFFIX}.png`, sizes: "192x192", type: "image/png" },
      { url: `/icons/icon-512${ICON_SUFFIX}.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: { url: `/icons/icon-180${ICON_SUFFIX}.png`, sizes: "180x180", type: "image/png" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
  viewportFit: "cover",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('dst-theme') || 'light';
    var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', d ? '#0a0a0c' : '#ffffff');
  } catch(e) {}
  try {
    var s = localStorage.getItem('dst-locale');
    var l = s || navigator.language || 'en';
    var lang = l.toLowerCase().startsWith('ko') ? 'ko'
      : l.toLowerCase().startsWith('ja') ? 'ja'
      : l.toLowerCase().startsWith('zh') ? 'zh'
      : l.toLowerCase().startsWith('fr') ? 'fr'
      : l.toLowerCase().startsWith('de') ? 'de'
      : l.toLowerCase().startsWith('es') ? 'es'
      : l.toLowerCase().startsWith('ru') ? 'ru'
      : l.toLowerCase().startsWith('pt') ? 'pt'
      : l.toLowerCase().startsWith('pl') ? 'pl'
      : l.toLowerCase().startsWith('it') ? 'it'
      : 'en';
    document.documentElement.lang = lang;
  } catch(e) {}
  try {
    var CV = '${APP_VERSION}';
    var PV = localStorage.getItem('dst-version');
    if (PV !== CV) {
      localStorage.setItem('dst-version', CV);
      if (PV && 'caches' in window) {
        caches.keys().then(function(keys) {
          keys.forEach(function(k) { if (k.indexOf('dst-images') === -1) caches.delete(k); });
        });
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(function(regs) {
            regs.forEach(function(r) { r.unregister(); });
          });
        }
      }
    }
  } catch(e) {}
})();
(function(){
  var KEY = 'dst:chunk-retry';
  var V = '${APP_VERSION}';
  var MAX = 2;
  function isChunkErr(m) {
    return !!m && (m.indexOf('ChunkLoadError') !== -1
      || m.indexOf('Loading chunk') !== -1
      || m.indexOf('Loading CSS chunk') !== -1
      || m.indexOf('Failed to load') !== -1
      || m.indexOf('error loading dynamically imported module') !== -1
      || m.indexOf('Importing a module script failed') !== -1);
  }
  function reload() {
    var n = parseInt(sessionStorage.getItem(KEY) || '0', 10);
    if (n >= MAX) return;
    sessionStorage.setItem(KEY, String(n + 1));
    var url = location.href;
    if (n >= 1) url += (url.indexOf('?') === -1 ? '?' : '&') + '_v=' + encodeURIComponent(V);
    try { document.documentElement.style.visibility = 'hidden'; } catch(e) {}
    location.replace(url);
  }
  window.__dstChunkReload = reload;
  window.addEventListener('error', function(e) {
    var m = e.message || (e.error && e.error.message) || '';
    if (isChunkErr(m)) { try { e.preventDefault(); } catch(_){} reload(); }
  }, true);
  window.addEventListener('unhandledrejection', function(e) {
    var r = e.reason;
    var m = r && (r.message || String(r)) || '';
    if (isChunkErr(m)) { try { e.preventDefault(); } catch(_){} reload(); }
  });
  window.addEventListener('load', function() { sessionStorage.removeItem(KEY); });
})();
${process.env.NODE_ENV === "production" ? `if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', function(ev) {
    if (!ev.data) return;
    if (ev.data.type === 'SW_UPDATED') {
      window.location.reload();
    } else if (ev.data.type === 'CHUNK_MISSING') {
      (window.__dstChunkReload || function(){ window.location.reload(); })();
    }
  });
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}` : `if (navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    regs.forEach(function(r) { r.unregister(); });
  });
  if ('caches' in window) {
    caches.keys().then(function(keys) {
      keys.forEach(function(k) { caches.delete(k); });
    });
  }
}`}
`;

const ANALYTICS_WORKER = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";
const trackingScript = `
(function(){
  try {
    var h = location.hostname;
    var url = h.indexOf('dstcraft.com') !== -1 ? '/api/_t' : ${JSON.stringify(ANALYTICS_WORKER ? ANALYTICS_WORKER + "/_t" : "")};
    var eUrl = h.indexOf('dstcraft.com') !== -1 ? '/api/event' : ${JSON.stringify(ANALYTICS_WORKER ? ANALYTICS_WORKER + "/event" : "")};
    if (!url) return;
    if (sessionStorage.getItem('dst:tracked')) return;
    sessionStorage.setItem('dst:tracked', '1');
    var isReturn = !!localStorage.getItem('dst:visitor');
    localStorage.setItem('dst:visitor', '1');
    var ref = '';
    var refUrl = '';
    if (document.referrer) {
      try {
        var r = new URL(document.referrer);
        if (r.hostname.indexOf('dstcraft.com') === -1) {
          ref = r.hostname.replace(/^www\\./, '');
          refUrl = document.referrer.slice(0, 500);
        }
      } catch(e) {}
    }
    var body = { ua: navigator.userAgent.slice(0, 120), isReturn: isReturn };
    if (ref) body.referrer = ref;
    if (refUrl) body.referrerUrl = refUrl;
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(function(){});
    var start = Date.now();
    var sent = false;
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden' && !sent) {
        var sec = Math.round((Date.now() - start) / 1000);
        if (sec < 2) return;
        sent = true;
        navigator.sendBeacon(eUrl, JSON.stringify({ type: 'duration', value: sec }));
      }
    });
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Ezoic — privacy/consent (CMP) + ad system scripts.
            #58: temporarily disabled to verify whether CMP JS is what shifts the
            layout on iOS Safari (large white gap below content on the crafting
            grid). Re-enable with a proper viewport-recalc handler once confirmed.

        <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" />
        <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" />
        <script async src="https://www.ezojs.com/ezoic/sa.min.js" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];",
          }}
        />
        <script src="https://ezoicanalytics.com/analytics.js" />
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: trackingScript }} />
        {iosSplashDevices.flatMap((d) => [
          <link
            key={`splash-${d.name}-portrait`}
            rel="apple-touch-startup-image"
            media={`screen and (device-width: ${d.cssW}px) and (device-height: ${d.cssH}px) and (-webkit-device-pixel-ratio: ${d.dpr}) and (orientation: portrait)`}
            href={`/icons/splash/splash-${d.w}x${d.h}${ICON_SUFFIX}.png?v=${APP_VERSION}`}
          />,
          <link
            key={`splash-${d.name}-landscape`}
            rel="apple-touch-startup-image"
            media={`screen and (device-width: ${d.cssW}px) and (device-height: ${d.cssH}px) and (-webkit-device-pixel-ratio: ${d.dpr}) and (orientation: landscape)`}
            href={`/icons/splash/splash-${d.h}x${d.w}${ICON_SUFFIX}.png?v=${APP_VERSION}`}
          />,
        ])}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Don't Craft Without Recipes",
            alternateName: "DST Crafting & Cooking Guide",
            url: SITE_URL,
            description:
              "Complete Don't Starve Together crafting & cooking guide with skill tree simulator. Search all crafting recipes, crock pot recipes, skill trees, materials, stations, and character-specific items.",
            applicationCategory: "GameApplication",
            operatingSystem: "All",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            inLanguage: ["en", "ko", "ja", "zh-CN", "zh-TW", "fr", "de", "it", "pl", "pt-BR", "ru", "es"],
            availableLanguage: [
              { "@type": "Language", name: "English", alternateName: "en" },
              { "@type": "Language", name: "Korean", alternateName: "ko" },
              { "@type": "Language", name: "Japanese", alternateName: "ja" },
              { "@type": "Language", name: "Chinese (Simplified)", alternateName: "zh-CN" },
              { "@type": "Language", name: "Chinese (Traditional)", alternateName: "zh-TW" },
              { "@type": "Language", name: "French", alternateName: "fr" },
              { "@type": "Language", name: "German", alternateName: "de" },
              { "@type": "Language", name: "Spanish", alternateName: "es" },
              { "@type": "Language", name: "Russian", alternateName: "ru" },
            ],
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased`}
      >
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <SettingsProvider>
          <AuthProvider>
            <FavoritesProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </FavoritesProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
