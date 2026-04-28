"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import { fetchSupporters } from "@/lib/analytics";

const ANON_TOKEN = "__anon__";
const TICK_MS = 3000;

/**
 * Shared rotating-ticker state for ko-fi support pills.
 *
 * Slot composition rule:
 * - 0 supporters → [baseLabel]                 (no rotation)
 * - 1 supporter  → [baseLabel, supporterLabel] (rotate so user sees both)
 * - 2+ supporters → [supporterLabel, ...]      (drop baseLabel — supporter names are the message)
 *
 * Rotation index is time-derived (`Date.now() / TICK_MS`), so multiple
 * mounted pills stay in sync without a shared store.
 */
export function useSupporterTicker() {
  const { resolvedLocale } = useSettings();
  const [supporters, setSupporters] = useState<{ name: string }[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetchSupporters().then(setSupporters);
  }, []);

  const baseLabel = t(resolvedLocale, "support_kofi");
  const supporterLabels = supporters.map((s) =>
    s.name === ANON_TOKEN
      ? `${t(resolvedLocale, "support_thanks")} ${t(resolvedLocale, "support_anonymous")}`
      : `${t(resolvedLocale, "support_thanks")} ${s.name}${resolvedLocale === "ko" ? "님" : ""}`,
  );

  const slots: string[] =
    supporters.length === 0
      ? [baseLabel]
      : supporters.length === 1
        ? [baseLabel, supporterLabels[0]]
        : supporterLabels;

  const index = slots.length > 0 ? Math.floor(Date.now() / TICK_MS) % slots.length : 0;
  const prevIndex = slots.length > 1 ? (index - 1 + slots.length) % slots.length : -1;

  useEffect(() => {
    if (slots.length <= 1) return;
    const i = setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => clearInterval(i);
  }, [slots.length]);

  return { slots, index, prevIndex };
}
