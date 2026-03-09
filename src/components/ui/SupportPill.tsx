import { Heart } from "lucide-react";

export function SupportPill() {
  return (
    <div className="flex justify-center pt-2" style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0.25rem))" }}>
      <a
        href="https://ko-fi.com/fankim"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <Heart className="size-3 fill-rose-400/80 text-rose-400/80" />
        <span>Support this project</span>
      </a>
    </div>
  );
}
