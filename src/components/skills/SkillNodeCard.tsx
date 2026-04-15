"use client";

import Image from "next/image";
import { Check, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  skillId: string;
  icon?: string;
  title: string;
  description?: string;
  isLearned: boolean;
  isLocked: boolean;
  canLearn: boolean;
  groupColor: string;
  onTap: () => void;
  onToggle: () => void;
}

export function SkillNodeCard({
  skillId,
  icon,
  title,
  description,
  isLearned,
  isLocked,
  canLearn,
  groupColor,
  onTap,
  onToggle,
}: Props) {
  const iconSrc = icon
    ? `/images/skill-icons/${icon}.png`
    : undefined;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors",
        isLearned
          ? "bg-green-500/5 border-green-500/40 dark:bg-green-500/10 dark:border-green-500/30"
          : isLocked
            ? "bg-surface/50 border-border/50 opacity-60"
            : "bg-surface border-border hover:bg-surface-hover hover:border-ring",
      )}
      onClick={onTap}
      role="button"
      tabIndex={0}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 size-10 rounded-md border flex items-center justify-center overflow-hidden",
          isLearned ? "border-green-500/50" : "border-border",
        )}
        style={!iconSrc ? { backgroundColor: `${groupColor}15`, borderColor: `${groupColor}40` } : undefined}
      >
        {iconSrc ? (
          <Image src={iconSrc} alt="" width={40} height={40} className="size-10" />
        ) : (
          <div
            className="size-5 rounded-full"
            style={{ backgroundColor: `${groupColor}60` }}
          />
        )}
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{title}</div>
        {description && (
          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
            {description}
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        disabled={isLocked && !isLearned}
        className={cn(
          "shrink-0 size-7 rounded-full flex items-center justify-center transition-all touch-manipulation",
          isLearned
            ? "text-white"
            : canLearn
              ? "border-2 text-muted-foreground hover:text-foreground"
              : "border border-border/50 text-muted-foreground/50",
        )}
        style={
          isLearned
            ? { backgroundColor: groupColor }
            : canLearn
              ? { borderColor: groupColor, color: groupColor }
              : undefined
        }
      >
        {isLearned ? (
          <Check className="size-4" strokeWidth={3} />
        ) : isLocked ? (
          <Lock className="size-3" />
        ) : (
          <Plus className="size-4" />
        )}
      </button>
    </div>
  );
}
