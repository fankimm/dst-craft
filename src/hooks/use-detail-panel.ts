"use client";

import { useState, useEffect } from "react";

/**
 * Manages bottom-sheet detail panel animation state.
 * Handles the double-rAF open trick and delayed cleanup on close.
 */
export function useDetailPanel<T>(selectedItem: T | null) {
  const [panelItem, setPanelItem] = useState<T | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setPanelItem(selectedItem);
      // 두 프레임 뒤에 연다 (translate 트랜지션이 붙게). 그 사이 selectedItem 이 null 로
      // 바뀌면 rAF 를 취소해야 한다 — 안 그러면 닫힌 뒤에 `panelOpen=true` 가 뒤늦게 들어와
      // 아이템 없는 빈 시트 + 어두운 오버레이가 남고 리로드 말고는 못 닫는다 (#105).
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setPanelOpen(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setPanelOpen(false);
    const timer = setTimeout(() => setPanelItem(null), 180);
    return () => clearTimeout(timer);
  }, [selectedItem]);

  return { panelItem, panelOpen };
}
