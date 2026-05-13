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
function substepKey(questId: QuestId, stepId: string, substepId: string): string {
  return `${questId}:${stepId}:${substepId}`;
}

/**
 * 저장 키:
 *  - 서브스텝이 없는 단계: `<questId>:<stepId>` → true
 *  - 서브스텝이 있는 단계: 각 서브스텝별 `<questId>:<stepId>:<substepId>` → true.
 *    상위 단계는 모든 서브스텝이 체크되면 자동으로 완료 처리.
 *
 * questId / stepId / substepId는 데이터 정의에서 절대 변경하지 말 것.
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
      if (step.substeps && step.substeps.length > 0) {
        return step.substeps.every((s) => !!checks[substepKey(questId, step.id, s.id)]);
      }
      return false;
    },
    [checks],
  );

  const isSubstepDone = useCallback(
    (questId: QuestId, stepId: string, substepId: string): boolean => {
      // 레거시 step 키가 true면 산하 서브스텝도 모두 체크된 것으로 표시
      if (checks[stepKey(questId, stepId)]) return true;
      return !!checks[substepKey(questId, stepId, substepId)];
    },
    [checks],
  );

  /** 단계 자체 토글. 서브스텝이 있으면 일괄 set/clear, 없으면 step 키만 토글. */
  const toggleStep = useCallback((questId: QuestId, step: QuestStep) => {
    setChecks((prev) => {
      const next = { ...prev };
      const sKey = stepKey(questId, step.id);

      if (step.substeps && step.substeps.length > 0) {
        const allDone =
          !!prev[sKey] ||
          step.substeps.every((s) => !!prev[substepKey(questId, step.id, s.id)]);

        delete next[sKey];

        if (allDone) {
          step.substeps.forEach((s) => delete next[substepKey(questId, step.id, s.id)]);
        } else {
          step.substeps.forEach((s) => { next[substepKey(questId, step.id, s.id)] = true; });
        }
      } else {
        if (next[sKey]) delete next[sKey];
        else next[sKey] = true;
      }

      persistChecks(next);
      return next;
    });
  }, []);

  /** 개별 서브스텝 토글. */
  const toggleSubstep = useCallback((questId: QuestId, step: QuestStep, substepId: string) => {
    setChecks((prev) => {
      const next = { ...prev };
      const sKey = stepKey(questId, step.id);
      const mKey = substepKey(questId, step.id, substepId);

      if (prev[sKey] && step.substeps) {
        delete next[sKey];
        step.substeps.forEach((s) => {
          next[substepKey(questId, step.id, s.id)] = true;
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

  const countStepsDone = useCallback(
    (quest: Quest): number => quest.steps.filter((s) => isStepDone(quest.id, s)).length,
    [isStepDone],
  );

  /**
   * goal과 required 단계를 모두 고려한 "효과적 진행도".
   * 필수 단계가 모두 끝나지 않으면 percent가 100%에 도달하지 못함.
   *  - effective = (완료된 필수) + min(완료된 선택, goal - 총 필수)
   *  - denom = goal (또는 quest.goal 미정 시 전체 단계 수)
   */
  const getEffectiveProgress = useCallback(
    (quest: Quest) => {
      const total = quest.steps.length;
      const requiredSteps = quest.steps.filter((s) => s.required);
      const optionalSteps = quest.steps.filter((s) => !s.required);
      const requiredDone = requiredSteps.filter((s) => isStepDone(quest.id, s)).length;
      const optionalDone = optionalSteps.filter((s) => isStepDone(quest.id, s)).length;
      const checkedCount = requiredDone + optionalDone;

      const goal = quest.goal ?? total;
      const totalRequired = requiredSteps.length;
      const optionalNeededForGoal = Math.max(0, goal - totalRequired);
      const effective = requiredDone + Math.min(optionalDone, optionalNeededForGoal);
      const goalReached = effective >= goal;
      const allDone = checkedCount === total && total > 0;

      return {
        total,
        checkedCount,
        goal,
        effective,
        totalRequired,
        requiredDone,
        goalReached,
        allDone,
      };
    },
    [isStepDone],
  );

  const hasAnyChecked = Object.keys(checks).length > 0;

  return { isStepDone, isSubstepDone, toggleStep, toggleSubstep, resetQuest, resetAll, countStepsDone, getEffectiveProgress, hasAnyChecked };
}
