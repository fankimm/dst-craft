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
      style={{ width: 140, height: 140 }}
    >
      <div
        className="absolute bg-amber-500 text-white text-[13px] font-black uppercase tracking-[0.22em] shadow-xl ring-1 ring-amber-700/50"
        style={{
          width: 200,
          padding: "6px 0",
          textAlign: "center",
          transform: "rotate(-45deg)",
          left: -55,
          top: 32,
          textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        }}
      >
        BETA
      </div>
    </div>
  );
}
