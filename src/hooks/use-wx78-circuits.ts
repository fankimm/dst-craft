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

  const loadCounts = useCallback((next: CircuitCounts) => {
    setCounts(next);
  }, []);

  return { counts, equip, unequip, reset, loadCounts };
}

// ── Share codec — JSON → base64url ────────────────────────────
export function encodeCircuits(counts: CircuitCounts): string {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  if (entries.length === 0) return "";
  // Strip the wx78module_ prefix to keep URL short
  const compact: Record<string, number> = {};
  for (const [id, n] of entries) {
    compact[id.replace(/^wx78module_/, "")] = n;
  }
  const json = JSON.stringify(compact);
  if (typeof window === "undefined") return "";
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCircuits(encoded: string): CircuitCounts | null {
  if (!encoded || typeof window === "undefined") return null;
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    const compact = JSON.parse(json) as Record<string, number>;
    const out: CircuitCounts = {};
    for (const [name, n] of Object.entries(compact)) {
      if (typeof n === "number" && n > 0) out[`wx78module_${name}`] = n;
    }
    return out;
  } catch {
    return null;
  }
}
