"use client";

import { cn } from "@/lib/utils";

interface RailNode {
  isLock: boolean;
  isLearned: boolean;
  canLearn: boolean;
}

interface Props {
  nodes: RailNode[];
  color: string;
}

/**
 * CSS-based vertical rail for a group of skill nodes.
 * Flexbox-aligned — each row matches the corresponding node card's height.
 */
export function SkillRail({ nodes, color }: Props) {
  if (nodes.length === 0) return null;

  return (
    <div className="flex flex-col items-center shrink-0 w-7">
      {nodes.map((node, i) => {
        const isFirst = i === 0;
        const isLast = i === nodes.length - 1;
        const nextLearned = i < nodes.length - 1 && nodes[i + 1].isLearned;
        const segmentActive = node.isLearned && nextLearned;

        return (
          <div key={i} className="flex flex-col items-center flex-1 min-h-[52px]">
            {/* Top segment line */}
            <div
              className="w-0.5 flex-1"
              style={{
                backgroundColor: isFirst ? "transparent" : `${color}${nodes[i - 1]?.isLearned && node.isLearned ? "e6" : "4d"}`,
              }}
            />

            {/* Junction */}
            {node.isLock ? (
              <div
                className="size-[10px] rotate-45 shrink-0"
                style={{
                  backgroundColor: node.isLearned ? color : "transparent",
                  border: `1.5px solid ${color}`,
                  opacity: node.isLearned ? 1 : 0.5,
                }}
              />
            ) : (
              <div
                className={cn("size-[10px] rounded-full shrink-0")}
                style={{
                  backgroundColor: node.isLearned ? color : "transparent",
                  border: node.isLearned ? "none" : `2px solid ${color}`,
                  opacity: node.canLearn || node.isLearned ? 1 : 0.3,
                }}
              />
            )}

            {/* Bottom segment line */}
            <div
              className="w-0.5 flex-1"
              style={{
                backgroundColor: isLast ? "transparent" : `${color}${segmentActive ? "e6" : "4d"}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
