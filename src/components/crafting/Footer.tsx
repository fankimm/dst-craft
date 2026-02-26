import { Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-xs text-muted-foreground/60 border-t border-border/50">
      <a
        href="https://github.com/fankimm/dst-craft"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:text-muted-foreground transition-colors"
      >
        <Github className="size-3.5" />
        <span>GitHub</span>
      </a>
      <span className="text-border">|</span>
      <a
        href="https://github.com/fankimm/dst-craft/issues"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-muted-foreground transition-colors"
      >
        Bug Report
      </a>
      <span className="text-border">|</span>
      <a
        href="mailto:fankim@icloud.com"
        className="flex items-center gap-1 hover:text-muted-foreground transition-colors"
      >
        <Mail className="size-3.5" />
        <span>Contact</span>
      </a>
    </footer>
  );
}
