"use client";

import { useState, useEffect, useCallback } from "react";
import { itemStats } from "@/data/item-stats";
import { itemStatsV2 } from "@/data/item-stats-v2";
import { itemStatsV3 } from "@/data/item-stats-v3";
import type { ItemStats } from "@/data/item-stats";
import type { ItemStatsV3 } from "@/data/item-stats-v3";

const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";
const CONFIG_KEY = "item-stats-version";

type StatsVersion = "v1" | "v2" | "v3";

// Global cache so all components share the same version
let globalVersion: StatsVersion = "v3"; // default to v3
let listeners: Set<() => void> = new Set();
let fetched = false;

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

async function fetchVersion(): Promise<StatsVersion> {
  if (!WORKER_URL) return "v3";
  try {
    const res = await fetch(`${WORKER_URL}/config?key=${CONFIG_KEY}`);
    if (!res.ok) return "v3";
    const data = await res.json();
    if (data.value === "v1") return "v1";
    if (data.value === "v2") return "v2";
    return "v3";
  } catch {
    return "v3";
  }
}

// v3 is now the default — skip remote fetch (DevMenu toggle is local only)
// To revert to remote config, uncomment below:
// if (typeof window !== "undefined" && !fetched) {
//   fetched = true;
//   fetchVersion().then((v) => { globalVersion = v; notifyListeners(); });
// }

export function useItemStatsVersion() {
  const [version, setVersion] = useState<StatsVersion>(globalVersion);

  useEffect(() => {
    const listener = () => setVersion(globalVersion);
    listeners.add(listener);
    // Sync in case it changed before mount
    setVersion(globalVersion);
    return () => { listeners.delete(listener); };
  }, []);

  const setRemoteVersion = useCallback(async (v: StatsVersion, token: string) => {
    if (!WORKER_URL) return;
    await fetch(`${WORKER_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key: CONFIG_KEY, value: v }),
    });
    globalVersion = v;
    notifyListeners();
  }, []);

  const activeStats: Record<string, ItemStats> =
    version === "v3" ? itemStatsV2 : version === "v2" ? itemStatsV2 : itemStats;

  const activeStatsV3: Record<string, ItemStatsV3> | null =
    version === "v3" ? itemStatsV3 : null;

  return { version, activeStats, activeStatsV3, setRemoteVersion };
}
