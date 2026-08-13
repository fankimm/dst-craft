import { SupportPill } from "@/components/ui/SupportPill";
import { FooterLegalLinks } from "@/components/ui/FooterLegalLinks";
import { AdSlot } from "@/components/ads/AdSlot";

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col items-center px-4 text-xs text-muted-foreground/60 border-t border-border/50">
      {/* 컨텐츠 끝 광고 (#75). Footer는 모든 탭이 공유하므로 여기 한 번만 넣으면
          제작·요리·요리솥·보스·스킬·스킨·퀘스트·콘솔 전부에 하단 띠가 생긴다.
          숨은 탭의 Footer에도 이 컴포넌트가 있지만, AdSlot이 보이는 탭에서만
          placeholder를 그리므로 중복 요청은 발생하지 않는다. */}
      <AdSlot variant="bottom" className="w-full" />

      <SupportPill />

      <FooterLegalLinks />

      {/* SEO internal links — hidden from users, visible to crawlers */}
      <nav className="sr-only" aria-hidden="true">
        <a href="/browse">Browse All Items</a>
        <a href="/cookpot">Cookpot Simulator</a>
      </nav>
    </footer>
  );
}
