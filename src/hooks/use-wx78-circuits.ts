"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dst:wx78-circuits";

export type CircuitCounts = Record<string, number>;

function loadFromStorage(): CircuitCounts {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved) as CircuitCounts;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function useWx78Circuits() {
  const [counts, setCounts] = useState<CircuitCounts>(loadFromStorage);

  // Persist
  useEffect(() => {
    try {
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      if (total === 0) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    } catch {
      /* ignore */
    }
  }, [counts]);

  const equip = useCallback((id: string) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const unequip = useCallback((id: string) => {
    setCounts((prev) => {
      const cur = prev[id] ?? 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: cur - 1 };
    });
  }, []);

  const reset = useCallback(() => setCounts({}), []);

  return { counts, equip, unequip, reset };
}
