"use client";

import { useEffect, useState } from "react";

export function BetaBadge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hostname.startsWith("beta.")) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[60] select-none rounded bg-amber-500/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md"
      style={{
        top: "max(0.5rem, env(safe-area-inset-top))",
        left: "max(0.5rem, env(safe-area-inset-left))",
      }}
    >
      Beta
    </div>
  );
}
