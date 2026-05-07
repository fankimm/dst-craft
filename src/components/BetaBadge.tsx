"use client";

import { useEffect, useState } from "react";

/**
 * Beta corner ribbon — diagonal stripe at the top-left of the viewport.
 * Translucent so it's visible but not distracting; pointer-events:none
 * so it never intercepts touches/clicks.
 *
 * Mounted once at the app shell. Renders only on beta.* hostnames.
 */
export function BetaBadge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hostname.startsWith("beta.")) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 overflow-hidden"
      style={{ width: 110, height: 110 }}
    >
      <div
        className="absolute bg-amber-500/85 text-white text-[11px] font-bold uppercase tracking-[0.18em] shadow-md ring-1 ring-amber-700/30"
        style={{
          width: 170,
          padding: "3px 0",
          textAlign: "center",
          transform: "rotate(-45deg)",
          left: -50,
          top: 22,
        }}
      >
        Beta
      </div>
    </div>
  );
}
