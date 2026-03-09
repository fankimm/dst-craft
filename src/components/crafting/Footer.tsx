import { Github, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col items-center gap-2 px-4 pt-3 text-xs text-muted-foreground/60 border-t border-border/50" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0.75rem))" }}>
      <div className="flex items-center gap-3">
        <a
          href="/browse"
          className="hover:text-muted-foreground transition-colors"
        >
          Browse All
        </a>
        <span className="text-border/40">·</span>
        <a
          href="/cookpot"
          className="hover:text-muted-foreground transition-colors"
        >
          Cookpot Sim
        </a>
        <span className="text-border/40">·</span>
        <a
          href="https://github.com/fankimm/dst-craft/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          Bug Report
        </a>
      </div>
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
        <a
          href="https://ko-fi.com/fankim"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
          aria-label="Support"
        >
          <Heart className="size-3.5" />
        </a>
      </div>
    </footer>
  );
}
