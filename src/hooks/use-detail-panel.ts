"use client";

import { useState, useEffect, useCallback } from "react";

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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelOpen(true));
      });
    } else {
      setPanelOpen(false);
      const timer = setTimeout(() => setPanelItem(null), 180);
      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

  return { panelItem, panelOpen };
}
