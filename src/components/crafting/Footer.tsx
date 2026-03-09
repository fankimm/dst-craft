import { Github, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col items-center gap-1 px-4 pt-1.5 pb-1 text-xs text-muted-foreground/60 border-t border-border/50" style={{ paddingBottom: "env(safe-area-inset-bottom, 4px)" }}>
      {/* Ko-fi support button */}
      <a
        href="https://ko-fi.com/fankim"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <Heart className="size-3 fill-rose-400/80 text-rose-400/80" />
        <span>Support this project</span>
      </a>

      {/* Icons */}
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/fankimm/dst-craft"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
          aria-label="GitHub"
        >
          <Github className="size-3.5" />
        </a>
        <a
          href="mailto:fankim@icloud.com"
          className="hover:text-muted-foreground transition-colors"
          aria-label="Contact"
        >
          <Mail className="size-3.5" />
        </a>
      </div>

      {/* SEO internal links — hidden from users, visible to crawlers */}
      <nav className="sr-only" aria-hidden="true">
        <a href="/browse">Browse All Items</a>
        <a href="/cookpot">Cookpot Simulator</a>
      </nav>
    </footer>
  );
}
