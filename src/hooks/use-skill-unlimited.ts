"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dst:skills-unlimited";

function persist(value: boolean) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function useSkillUnlimited() {
  const [unlimited, setUnlimitedState] = useState(false);

  useEffect(() => {
    try {
      setUnlimitedState(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setUnlimitedState((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, []);

  const setUnlimited = useCallback((value: boolean) => {
    setUnlimitedState(value);
    persist(value);
  }, []);

  return { unlimited, toggle, setUnlimited };
}
