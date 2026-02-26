import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";
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

const bigDonstarve = localFont({
  src: "../../public/fonts/BigDonstarve.ttf",
  variable: "--font-display-var",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StarveCraft - Don't Starve Together Crafting Guide",
  description: "Don't Starve Together Crafting Recipe Guide",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DST Crafting",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
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
      </head>
      <body
        className={`${inter.variable} ${notoSansKR.variable} ${bigDonstarve.variable} font-sans antialiased`}
      >
        <SettingsProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
