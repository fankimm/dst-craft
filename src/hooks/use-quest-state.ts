"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuestId } from "@/data/quests";

const STORAGE_KEY = "dst:quest-checks";

type QuestChecks = Record<string, boolean>;

function loadChecks(): QuestChecks {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as QuestChecks;
    return {};
  } catch {
    return {};
  }
}

function persistChecks(checks: QuestChecks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  } catch {
    /* quota / private mode — ignore */
  }
}

function stepKey(questId: QuestId, stepId: string): string {
  return `${questId}:${stepId}`;
}

/**
 * 퀘스트 체크박스 상태 영속화 훅.
 *
 * 저장 형태: `{ "hermit:fix_house_1": true, ... }`
 * 키는 `<questId>:<stepId>` — questId / stepId는 데이터 정의에서 절대 변경하지 말 것.
 */
export function useQuestState() {
  const [checks, setChecks] = useState<QuestChecks>({});

  useEffect(() => {
    setChecks(loadChecks());
  }, []);

  const isChecked = useCallback(
    (questId: QuestId, stepId: string): boolean => !!checks[stepKey(questId, stepId)],
    [checks],
  );

  const toggle = useCallback((questId: QuestId, stepId: string) => {
    setChecks((prev) => {
      const key = stepKey(questId, stepId);
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      persistChecks(next);
      return next;
    });
  }, []);

  const resetQuest = useCallback((questId: QuestId) => {
    setChecks((prev) => {
      const next: QuestChecks = {};
      const prefix = `${questId}:`;
      for (const k of Object.keys(prev)) {
        if (!k.startsWith(prefix)) next[k] = prev[k];
      }
      persistChecks(next);
      return next;
    });
  }, []);

  const countChecked = useCallback(
    (questId: QuestId): number => {
      const prefix = `${questId}:`;
      return Object.keys(checks).filter((k) => k.startsWith(prefix) && checks[k]).length;
    },
    [checks],
  );

  return { isChecked, toggle, resetQuest, countChecked };
}
