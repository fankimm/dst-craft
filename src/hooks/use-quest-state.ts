"use client";

import { useState, useEffect, useCallback } from "react";
import type { Quest, QuestId, QuestStep } from "@/data/quests";

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
function materialKey(questId: QuestId, stepId: string, materialId: string): string {
  return `${questId}:${stepId}:${materialId}`;
}

/**
 * 퀘스트 체크박스 상태 영속화 훅.
 *
 * 저장 키:
 *  - 재료가 없는 단계: `<questId>:<stepId>` → true
 *  - 재료가 있는 단계: 각 재료별 `<questId>:<stepId>:<materialId>` → true.
 *    상위 단계는 모든 재료가 체크되면 자동으로 완료 처리(파생 상태).
 *  - 호환성: 기존에 step 키가 true로 저장된 단계가 이번 업데이트로 재료를 갖게 되면,
 *    그 step 키를 신뢰해 "모든 재료 체크" 상태로 간주(추가 마이그레이션 없이 isStepDone에서 처리).
 *
 * questId / stepId / materialId는 데이터 정의에서 절대 변경하지 말 것 (영속 키).
 */
export function useQuestState() {
  const [checks, setChecks] = useState<QuestChecks>({});

  useEffect(() => {
    setChecks(loadChecks());
  }, []);

  const isStepDone = useCallback(
    (questId: QuestId, step: QuestStep): boolean => {
      const explicit = checks[stepKey(questId, step.id)];
      if (explicit) return true;
      if (step.materials && step.materials.length > 0) {
        return step.materials.every((m) => !!checks[materialKey(questId, step.id, m.id)]);
      }
      return false;
    },
    [checks],
  );

  const isMaterialDone = useCallback(
    (questId: QuestId, stepId: string, materialId: string): boolean => {
      // 레거시 step 키가 true면 산하 재료도 모두 체크된 것으로 표시
      if (checks[stepKey(questId, stepId)]) return true;
      return !!checks[materialKey(questId, stepId, materialId)];
    },
    [checks],
  );

  /** 단계 자체 토글. 재료가 있으면 전부 같이 set/clear, 없으면 step 키만 토글. */
  const toggleStep = useCallback((questId: QuestId, step: QuestStep) => {
    setChecks((prev) => {
      const next = { ...prev };
      const sKey = stepKey(questId, step.id);

      if (step.materials && step.materials.length > 0) {
        // 현재 완료 상태 계산 (레거시 step 키 포함)
        const allDone =
          !!prev[sKey] ||
          step.materials.every((m) => !!prev[materialKey(questId, step.id, m.id)]);

        // 레거시 키는 항상 제거 (이제부턴 재료 키가 진실의 원천)
        delete next[sKey];

        if (allDone) {
          // 클리어
          step.materials.forEach((m) => delete next[materialKey(questId, step.id, m.id)]);
        } else {
          // 모두 체크
          step.materials.forEach((m) => { next[materialKey(questId, step.id, m.id)] = true; });
        }
      } else {
        if (next[sKey]) delete next[sKey];
        else next[sKey] = true;
      }

      persistChecks(next);
      return next;
    });
  }, []);

  /** 개별 재료 토글. */
  const toggleMaterial = useCallback((questId: QuestId, step: QuestStep, materialId: string) => {
    setChecks((prev) => {
      const next = { ...prev };
      const sKey = stepKey(questId, step.id);
      const mKey = materialKey(questId, step.id, materialId);

      // 레거시 step 키를 재료 키로 마이그레이션 (이번이 첫 토글이라면)
      if (prev[sKey] && step.materials) {
        delete next[sKey];
        step.materials.forEach((m) => {
          next[materialKey(questId, step.id, m.id)] = true;
        });
      }

      if (next[mKey]) delete next[mKey];
      else next[mKey] = true;

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

  const resetAll = useCallback(() => {
    setChecks(() => {
      persistChecks({});
      return {};
    });
  }, []);

  /** 완료된 step 개수 (재료 단계는 모든 재료가 체크돼야 1로 카운트). */
  const countStepsDone = useCallback(
    (quest: Quest): number => quest.steps.filter((s) => isStepDone(quest.id, s)).length,
    [isStepDone],
  );

  /** 전체 체크가 하나라도 있는지 (전체 초기화 버튼 노출 결정) */
  const hasAnyChecked = Object.keys(checks).length > 0;

  return { isStepDone, isMaterialDone, toggleStep, toggleMaterial, resetQuest, resetAll, countStepsDone, hasAnyChecked };
}
