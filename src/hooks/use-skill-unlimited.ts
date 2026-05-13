"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dst:skills-unlimited";

export function useSkillUnlimited() {
  const [unlimited, setUnlimited] = useState(false);

  useEffect(() => {
    try {
      setUnlimited(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setUnlimited((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(STORAGE_KEY, "1");
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { unlimited, toggle };
}
