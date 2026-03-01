import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

interface TagChipProps {
  label: string;
  /** Image path relative to /images/ (e.g. "game-items/ice.png") */
  icon?: string;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function TagChip({ label, icon, onClick, onRemove, className }: TagChipProps) {
  const inner = (
    <>
      {icon && (
        <img
          src={assetPath(`/images/${icon}`)}
          alt=""
          className="size-4 object-contain shrink-0"
        />
      )}
      {label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="size-3" />
        </button>
      )}
    </>
  );

  const base =
    "inline-flex items-center gap-1 rounded-full border border-border bg-surface pl-1.5 pr-2.5 py-1 text-xs font-medium h-7 transition-colors";

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(base, "cursor-pointer hover:bg-surface-hover", className)}>
        {inner}
      </button>
    );
  }

  return <span className={cn(base, className)}>{inner}</span>;
}
