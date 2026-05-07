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
    <span className="my-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
      Beta
    </span>
  );
}
