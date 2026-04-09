"use client";

import { useState, useEffect, useCallback } from "react";
import { itemStats } from "@/data/item-stats";
import { itemStatsV2 } from "@/data/item-stats-v2";
import type { ItemStats } from "@/data/item-stats";

const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";
const CONFIG_KEY = "item-stats-version";

type StatsVersion = "v1" | "v2";

// Global cache so all components share the same version
let globalVersion: StatsVersion = "v2"; // default to v2
let listeners: Set<() => void> = new Set();
let fetched = false;

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

async function fetchVersion(): Promise<StatsVersion> {
  if (!WORKER_URL) return "v2";
  try {
    const res = await fetch(`${WORKER_URL}/config?key=${CONFIG_KEY}`);
    if (!res.ok) return "v2";
    const data = await res.json();
    return data.value === "v1" ? "v1" : "v2";
  } catch {
    return "v2";
  }
}

// Init fetch on module load (client only)
if (typeof window !== "undefined" && !fetched) {
  fetched = true;
  fetchVersion().then((v) => {
    globalVersion = v;
    notifyListeners();
  });
}

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

  const activeStats: Record<string, ItemStats> = version === "v2" ? itemStatsV2 : itemStats;

  return { version, activeStats, setRemoteVersion };
}
