import { bossSlugs, foodSlugs, itemSlugs, questSlugs } from "@/lib/slug";

// 예전 슬러그 → 정식 슬러그 301 표 (nginx server 블록에 include) (#125)
//
// 옛 주소는 정적 페이지로도 생성되어 canonical로 새 주소를 가리키지만, 구글은 canonical을
// "힌트"로만 받아 85건을 무시했다(서치콘솔 "Google에서 사용자와 다른 표준을 선택함").
// 301이어야 확실히 합쳐진다. 정적 페이지는 Vercel failover·nginx 미적용 환경 fallback으로 남겨 둔다.
//
// 빌드 산출물 out/nginx-legacy-redirects.conf → 배포 스크립트가 nginx -t 후 reload.
// 호스트는 $host로 둬서 beta/prod 같은 파일을 쓴다 (터널 뒤라 $scheme은 http — https 고정).
export const dynamic = "force-static";

const SECTIONS = [
  { path: "item", index: itemSlugs },
  { path: "food", index: foodSlugs },
  { path: "boss", index: bossSlugs },
  { path: "quest", index: questSlugs },
];

export function GET() {
  const lines: string[] = [
    "# 자동 생성 — src/app/nginx-legacy-redirects.conf/route.ts (수정 금지)",
  ];
  for (const { path, index } of SECTIONS) {
    for (const [old, id] of index.legacySlugToId) {
      const slug = index.idToSlug.get(id);
      if (!slug || slug === old) continue;
      for (const prefix of ["", "/ko"]) {
        lines.push(
          `location = ${prefix}/${path}/${old} { return 301 https://$host${prefix}/${path}/${slug}; }`,
        );
      }
    }
  }
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
