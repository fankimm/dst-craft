"use client";

import { useState, useEffect } from "react";

const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";

let cachedData: Map<string, number> | null = null;
let fetchPromise: Promise<void> | null = null;

function fetchPopularity(): Promise<void> {
  if (cachedData) return Promise.resolve();
  if (fetchPromise) return fetchPromise;
  if (!WORKER_URL) return Promise.resolve();

  fetchPromise = fetch(`${WORKER_URL}/popular`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.items) {
        cachedData = new Map(
          (data.items as { id: string; clicks: number }[]).map((i) => [i.id, i.clicks]),
        );
      }
    })
    .catch(() => {})
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function usePopularity() {
  const [ready, setReady] = useState(!!cachedData);

  useEffect(() => {
    if (cachedData) {
      setReady(true);
      return;
    }
    fetchPopularity().then(() => setReady(true));
  }, []);

  return {
    ready,
    getClicks: (id: string) => cachedData?.get(id) ?? 0,
    popularityMap: cachedData,
  };
}
