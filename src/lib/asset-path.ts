const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function assetPath(path: string): string {
  return BASE_PATH + path;
}

/**
 * 보스 이미지 경로를 UI용 축소본으로 바꾼다 (#88).
 *
 * 보스 원본 PNG는 최대 2108×2492 / 3.5MB인데 앱에서는 최대 80px(`size-20`)로 그린다.
 * 프로덕션 홈 실측에서 **이미지 10,249KB 중 보스 PNG 9장이 8,982KB(88%)** 를 차지했다.
 * Ezoic이 `window load` 이후에야 광고 파이프라인을 시작하므로 이 무게가 곧 광고 지연이고,
 * Fast3G 홈에서는 load가 30초 내에 발화하지 않아 **광고가 0회** 뜬다
 * (`docs/ezoic-decision.md`).
 *
 * **원본을 덮어쓰지 않고 경로만 갈아끼우는 이유**: 같은 파일이 OG/schema.org 이미지로도
 * 쓰인다(`src/components/seo/BossPageContent.tsx`). 소셜 카드·구글 리치 결과는 큰 이미지를
 * 원하므로 크롤러에게는 원본을 그대로 준다. 이 함수는 **화면에 그리는 자리에서만** 쓴다 —
 * 메타데이터·JSON-LD에는 절대 쓰지 말 것.
 *
 * 축소본은 `scripts/optimize-boss-images.sh`가 만든다. 없으면 그냥 원본 경로가 나가므로
 * 화면이 깨지지는 않는다 (무게 이득만 사라진다).
 */
export function bossThumbPath(path: string): string {
  return path.replace(/^(.*\/images\/bosses\/)([^/]+)\.png$/i, "$1thumb/$2.webp");
}

/** `assetPath` + `bossThumbPath` — 보스 이미지를 화면에 그릴 때 쓰는 조합 */
export function bossImageSrc(path: string): string {
  return assetPath(bossThumbPath(path));
}
