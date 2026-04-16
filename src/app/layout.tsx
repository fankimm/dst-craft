import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import Script from "next/script";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/hooks/use-settings";
import { AuthProvider } from "@/hooks/use-auth";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { Analytics } from "@vercel/analytics/react";
import { APP_VERSION } from "@/lib/version";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-korean",
  subsets: ["latin"],
});

const SITE_URL = "https://www.dstcraft.com";

export const metadata: Metadata = {
  title: "Don't Craft Without Recipes — DST Crafting & Cooking Guide",
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
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "ko": "/",
      "ja": "/",
      "zh-Hans": "/",
      "zh-Hant": "/",
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
    title: "Don't Craft Without Recipes",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
    if (m) m.setAttribute('content', '#000000');
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
          keys.forEach(function(k) { caches.delete(k); });
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
${process.env.NODE_ENV === "production" ? `if ('serviceWorker' in navigator) {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is Don't Craft Without Recipes?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Don't Craft Without Recipes is a free web app that provides a complete database of all crafting and cooking recipes in Don't Starve Together, including materials, crafting stations, crock pot recipes, character skill trees, and character-specific items.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I search for crafting and cooking recipes in Don't Starve Together?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Use the search bar to find any item or food by name. You can filter by category, crafting station, or character-specific recipes. The crock pot simulator lets you test ingredient combinations, and the skill tree simulator lets you plan character builds. The guide supports 13 languages including English, Korean, Japanese, and Chinese.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased`}
      >
        <div
          id="app-loading"
          suppressHydrationWarning
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "none",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            background: "var(--loading-bg, #fafafa)",
            transition: "opacity 0.3s ease",
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .dark { --loading-bg: #09090b; --loading-fg: #fafafa; --loading-text: #a1a1aa; }
            :root { --loading-bg: #fafafa; --loading-fg: #09090b; --loading-text: #71717a; }
            #app-loading img { width: 96px; height: 96px; border-radius: 20px; animation: loading-pulse 2s ease-in-out infinite; }
            @keyframes loading-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }
          `}} />
          <img src="/icons/icon-512.png" alt="" width={96} height={96} />
          <p style={{ margin: 0, fontSize: "0.875rem", letterSpacing: "0.05em", color: "var(--loading-fg, #09090b)" }}>
            <span style={{ fontWeight: 700 }}>DON&apos;T CRAFT</span>{" "}
            <span style={{ color: "var(--loading-text)" }}>WITHOUT RECIPES</span>
          </p>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var el = document.getElementById('app-loading');
            if (!el) return;
            var isPwa = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
            if (!isPwa) return;
            el.style.display = 'flex';
            function hide() {
              if (el.dataset.hidden) return;
              el.dataset.hidden = '1';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
              setTimeout(function() { el.style.display = 'none'; }, 300);
            }
            if (document.readyState !== 'loading') { hide(); }
            else { document.addEventListener('DOMContentLoaded', hide); }
            setTimeout(hide, 2000);
          })();
        `}} />
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <SettingsProvider>
          <AuthProvider>
            <FavoritesProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Analytics />
            </FavoritesProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
