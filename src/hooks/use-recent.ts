"use client";

import { useState, useCallback, useEffect } from "react";

const MAX_RECENT = 30;

function getKey(tab: string) {
  return `dst:recent:${tab}`;
}

function load(tab: string): string[] {
  try {
    const raw = localStorage.getItem(getKey(tab));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(tab: string, ids: string[]) {
  try {
    localStorage.setItem(getKey(tab), JSON.stringify(ids));
  } catch {}
}

export function useRecent(tab: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(load(tab));
  }, [tab]);

  const addRecent = useCallback((id: string) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT);
      save(tab, next);
      return next;
    });
  }, [tab]);

  return { recentIds: ids, addRecent };
}
