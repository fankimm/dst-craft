import { BackToHome } from "@/components/ui/BackToHome";

interface Release {
  version: string;
  date: string;
  /** Developer-facing changes (not displayed) */
  dev: string[];
  /** User-facing changes (displayed) */
  changes: string[];
}

const releases: Release[] = [
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
    changes: [
      "즐겨찾기 기능 추가 — 아이템과 레시피를 즐겨찾기로 저장",
      "Google 로그인 — 기기 간 즐겨찾기 동기화",
      "모든 아이템 카드와 상세 패널에 즐겨찾기 토글",
      "제작/요리 홈 화면에 즐겨찾기 카테고리 타일",
      "설정에 계정 섹션 (로그인/로그아웃)",
      "비로그인 시 즐겨찾기 저장 경고 토스트",
    ],
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
    changes: [
      "Improved desktop layout with centered content",
      "Cleaner UI: title bar removed for more screen space",
      "Release Notes page added (Settings > Release Notes)",
      "Fixed analytics not loading on new domain",
      "Fixed iOS devices incorrectly showing as macOS in stats",
      "App favicon now shows correctly",
    ],
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
    changes: [
      "Migrated to faster hosting (Vercel)",
      "Improved search engine visibility",
      "Updated app branding",
      "Cooking tab icons refreshed",
      "Search suggestions now available across all tabs",
    ],
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
    changes: [
      "New Cooking tab: browse all crock pot recipes",
      "Recipe details with health, hunger, sanity stats",
      "Search recipes by name",
      "Filter by food type, cooking station, and special effects",
      "Recommended recipes for health, sanity, and hunger",
    ],
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
    changes: [
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
];

export default function ReleasesPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        <h1 className="text-lg font-bold">Release Notes</h1>

        {releases.map((release) => (
          <section key={release.version} className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold">v{release.version}</h2>
              <span className="text-xs text-muted-foreground">{release.date}</span>
            </div>
            <ul className="space-y-1 text-sm text-foreground/80">
              {release.changes.map((change, i) => (
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
