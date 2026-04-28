import { SupportPill } from "@/components/ui/SupportPill";

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col items-center px-4 text-xs text-muted-foreground/60 border-t border-border/50">
      <SupportPill />

      {/* SEO internal links — hidden from users, visible to crawlers */}
      <nav className="sr-only" aria-hidden="true">
        <a href="/browse">Browse All Items</a>
        <a href="/cookpot">Cookpot Simulator</a>
      </nav>
    </footer>
  );
}
