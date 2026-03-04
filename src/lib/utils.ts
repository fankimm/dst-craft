import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Smoothly transition the theme-color meta tag over a given duration (ms). */
let _themeColorRaf = 0;
export function transitionThemeColor(to: string, duration: number) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;

  cancelAnimationFrame(_themeColorRaf);
  const from = meta.getAttribute("content") || to;
  if (from === to) return;

  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const toHex = (n: number) => n.toString(16).padStart(2, "0");

  const f = parse(from);
  const t = parse(to);
  const start = performance.now();

  function step(now: number) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - (1 - p) * (1 - p); // ease-out quad
    const r = Math.round(f[0] + (t[0] - f[0]) * ease);
    const g = Math.round(f[1] + (t[1] - f[1]) * ease);
    const b = Math.round(f[2] + (t[2] - f[2]) * ease);
    meta!.setAttribute("content", `#${toHex(r)}${toHex(g)}${toHex(b)}`);
    if (p < 1) _themeColorRaf = requestAnimationFrame(step);
  }

  _themeColorRaf = requestAnimationFrame(step);
}
