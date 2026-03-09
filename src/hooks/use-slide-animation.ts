"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Tracks a value change and returns a one-shot CSS animation class.
 * Used for category ↔ grid view slide transitions.
 *
 * @param current - current view state (e.g. selectedCategory or showCategoryGrid)
 * @param isHome  - function to determine if the value represents "home" state
 */
export function useSlideAnimation<T>(
  current: T,
  isHome: (value: T) => boolean,
) {
  const [slideDir, setSlideDir] = useState<"right" | "left" | null>(null);
  const prev = useRef(current);

  useEffect(() => {
    if (prev.current !== current) {
      setSlideDir(isHome(current) ? "left" : "right");
      prev.current = current;
    }
  }, [current, isHome]);

  useEffect(() => {
    if (!slideDir) return;
    const timer = setTimeout(() => setSlideDir(null), 260);
    return () => clearTimeout(timer);
  }, [slideDir]);

  const slideClass =
    slideDir === "right"
      ? "animate-slide-right"
      : slideDir === "left"
        ? "animate-slide-left"
        : "";

  return slideClass;
}
