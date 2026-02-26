import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/hooks/use-settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-korean",
  subsets: ["latin"],
});

const SITE_URL = "https://fankimm.github.io/dst-craft";
const BASE = process.env.NODE_ENV === "production" ? "/dst-craft" : "";

export const metadata: Metadata = {
  title: "DST Crafting Guide | Don't Starve Together 크래프팅 레시피",
  description:
    "Don't Starve Together 크래프팅 레시피 가이드. 모든 아이템의 제작법, 재료, 제작소를 한눈에 검색하세요. Crafting recipes for all items, materials, and stations.",
  keywords: [
    "Don't Starve Together",
    "DST",
    "crafting",
    "recipe",
    "guide",
    "크래프팅",
    "레시피",
    "굶지마 투게더",
    "제작법",
    "가이드",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "DST Crafting Guide",
    description:
      "Don't Starve Together 크래프팅 레시피 가이드. 모든 아이템의 제작법, 재료, 제작소를 한눈에 검색하세요.",
    siteName: "DST Crafting Guide",
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP", "zh_CN"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DST Crafting Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DST Crafting Guide",
    description:
      "Don't Starve Together 크래프팅 레시피 가이드. 모든 아이템의 제작법, 재료, 제작소를 검색하세요.",
    images: ["/og-image.png"],
  },
  manifest: `${BASE}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DST Crafting",
  },
  icons: {
    icon: [
      { url: `${BASE}/favicon.ico`, sizes: "48x48" },
      { url: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: { url: `${BASE}/icons/icon-180.png`, sizes: "180x180", type: "image/png" },
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
})();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('${process.env.NODE_ENV === "production" ? "/dst-craft" : ""}/sw.js');
  });
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "DST Crafting Guide",
              url: SITE_URL,
              description:
                "Don't Starve Together crafting recipe guide with all items, materials, and stations.",
              applicationCategory: "GameApplication",
              operatingSystem: "All",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              inLanguage: ["ko", "en", "ja", "zh-CN", "zh-TW", "fr", "de", "it", "pl", "pt-BR", "ru", "es"],
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
