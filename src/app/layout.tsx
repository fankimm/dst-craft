import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/hooks/use-settings";
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

// TODO: Vercel 배포 후 실제 도메인으로 교체
const SITE_URL = "https://dst-craft.vercel.app";

export const metadata: Metadata = {
  title: "Don't Craft Without Recipes | Don't Starve Together Guide & 크래프팅 레시피",
  description:
    "Complete Don't Starve Together crafting & cooking guide. Search all crafting recipes, crock pot recipes, materials, stations, and character-specific items. DST 크래프팅·요리 레시피 가이드 — 모든 아이템 제작법과 요리솥 레시피를 한눈에 검색하세요.",
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
    "크래프팅",
    "레시피",
    "굶지마 투게더",
    "굶지마 투게더 요리",
    "굶지마 투게더 요리솥",
    "제작법",
    "가이드",
    "돈스타브",
    "DST 요리 레시피",
    "DST 크래프팅 가이드",
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
      "Complete Don't Starve Together crafting & cooking guide. Search all crafting recipes, crock pot recipes, materials & character-specific items. 모든 제작법과 요리 레시피를 검색하세요.",
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
      "Complete Don't Starve Together crafting & cooking guide. Search all crafting recipes, crock pot recipes, and materials.",
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
  themeColor: "#fafafa",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('dst-theme') || 'light';
    var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', d ? '#09090b' : '#fafafa');
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
        window.location.reload();
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
              alternateName: "DST 크래프팅·쿠킹 가이드",
              url: SITE_URL,
              description:
                "Complete Don't Starve Together crafting & cooking guide. Search all crafting recipes, crock pot recipes, materials, stations, and character-specific items.",
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
                    text: "Don't Craft Without Recipes is a free web app that provides a complete database of all crafting and cooking recipes in Don't Starve Together, including materials, crafting stations, crock pot recipes, and character-specific items.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I search for crafting and cooking recipes in Don't Starve Together?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Use the search bar to find any item or food by name. You can filter by category, crafting station, or character-specific recipes. The crock pot simulator lets you test ingredient combinations. The guide supports 13 languages including English, Korean, Japanese, and Chinese.",
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
        <SettingsProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
