import { Heart } from "lucide-react";

export function SupportPill() {
  return (
    <div className="flex justify-center pt-1" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0.75rem))" }}>
      <a
        href="https://ko-fi.com/fankim"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-border/40 px-3 py-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground hover:border-border/60 transition-colors"
      >
        <Heart className="size-2.5 fill-rose-300/60 text-rose-300/60" />
        <span>Support this project</span>
      </a>
    </div>
  );
}
