import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";

export function ViewCount({ clicks, className }: { clicks: number; className?: string }) {
  if (clicks <= 0) return null;

  return (
    <p className={cn("flex items-center gap-1 text-[11px] text-muted-foreground/50", className)}>
      <img src={assetPath("/images/game-items/deerclops_eyeball.png")} alt="" className="size-3 object-contain" />
      <span className="tabular-nums">{clicks.toLocaleString()}</span>
    </p>
  );
}
