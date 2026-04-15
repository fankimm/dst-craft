"use client";

interface RailNode {
  isLock: boolean;
  isLearned: boolean;
  canLearn: boolean;
}

interface Props {
  nodes: RailNode[];
  color: string;
  nodeHeight: number;
}

/**
 * SVG vertical rail for a group of skill nodes.
 * Draws a colored vertical line with junction dots at each node position.
 */
export function SkillRail({ nodes, color, nodeHeight }: Props) {
  if (nodes.length === 0) return null;

  const width = 28;
  const cx = width / 2;
  const totalHeight = nodes.length * nodeHeight;

  return (
    <svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
      className="shrink-0"
    >
      {/* Main vertical line */}
      <line
        x1={cx}
        y1={nodeHeight / 2}
        x2={cx}
        y2={totalHeight - nodeHeight / 2}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.3}
      />

      {/* Active path segments */}
      {nodes.map((node, i) => {
        if (!node.isLearned || i === nodes.length - 1) return null;
        const nextNode = nodes[i + 1];
        if (!nextNode?.isLearned) return null;
        const y1 = i * nodeHeight + nodeHeight / 2;
        const y2 = (i + 1) * nodeHeight + nodeHeight / 2;
        return (
          <line
            key={`active-${i}`}
            x1={cx}
            y1={y1}
            x2={cx}
            y2={y2}
            stroke={color}
            strokeWidth={2.5}
            strokeOpacity={0.9}
          />
        );
      })}

      {/* Junction dots */}
      {nodes.map((node, i) => {
        const cy = i * nodeHeight + nodeHeight / 2;

        if (node.isLock) {
          // Diamond for lock nodes
          const size = 4;
          return (
            <rect
              key={i}
              x={cx - size}
              y={cy - size}
              width={size * 2}
              height={size * 2}
              transform={`rotate(45 ${cx} ${cy})`}
              fill={node.isLearned ? color : "transparent"}
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={node.isLearned ? 1 : 0.5}
            />
          );
        }

        // Circle for regular nodes
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={5}
            fill={node.isLearned ? color : "transparent"}
            stroke={color}
            strokeWidth={node.isLearned ? 0 : 2}
            strokeOpacity={node.canLearn || node.isLearned ? 1 : 0.3}
          />
        );
      })}
    </svg>
  );
}
