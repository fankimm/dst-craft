"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import { fetchSupporters } from "@/lib/analytics";

const ANON_TOKEN = "__anon__";
const TICK_MS = 3000;

/**
 * Floating ko-fi pill that lives at the bottom-center of the viewport when
 * the page's anchor pill (in the Footer) is off-screen, then animates into
 * the anchor's position when the user scrolls the Footer into view.
 *
 * Requires a `[data-support-pill-anchor]` element somewhere in the DOM
 * (the Footer's SupportPill provides this).
 */
export function FloatingSupportPill() {
  const { resolvedLocale } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [docking, setDocking] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [supporters, setSupporters] = useState<{ name: string }[]>([]);
  const [, setTick] = useState(0);
  const floatRef = useRef<HTMLAnchorElement>(null);
  const dockTimeout = useRef<number | null>(null);
  const undockTimeout = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSupporters().then(setSupporters);
  }, []);

  // Build rotating slots: base label + supporter names
  const baseLabel = t(resolvedLocale, "support_kofi");
  const slots: string[] = [
    baseLabel,
    ...supporters.map((s) =>
      s.name === ANON_TOKEN
        ? `${t(resolvedLocale, "support_thanks")} ${t(resolvedLocale, "support_anonymous")}`
        : `${t(resolvedLocale, "support_thanks")} ${s.name}${resolvedLocale === "ko" ? "님" : ""}`,
    ),
  ];

  // Time-derived index — advances every TICK_MS regardless of mount timing
  const index = slots.length > 0 ? Math.floor(Date.now() / TICK_MS) % slots.length : 0;
  const prevIndex = slots.length > 0 ? (index - 1 + slots.length) % slots.length : -1;

  useEffect(() => {
    if (slots.length <= 1) return;
    const i = setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => clearInterval(i);
  }, [slots.length]);

  useEffect(() => {
    if (!mounted) return;

    let observer: IntersectionObserver | null = null;
    let anchor: Element | null = null;

    // Anchor may mount slightly after this component (Footer is below).
    // Poll briefly until found, then attach observer.
    const tryAttach = () => {
      anchor = document.querySelector("[data-support-pill-anchor]");
      if (!anchor) {
        setTimeout(tryAttach, 100);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Footer pill is on screen → dock the floating pill into it
            const float = floatRef.current;
            const target = entry.target as HTMLElement;
            if (!float) return;
            const fr = float.getBoundingClientRect();
            const tr = target.getBoundingClientRect();
            const dx = (tr.left + tr.width / 2) - (fr.left + fr.width / 2);
            const dy = (tr.top + tr.height / 2) - (fr.top + fr.height / 2);
            const sx = Math.max(0.4, tr.width / fr.width);
            float.style.transition = "transform 480ms cubic-bezier(.55,.05,.25,1.2), opacity 360ms ease-out";
            float.style.transform = `translate(${dx}px, ${dy}px) scale(${sx * 0.85}) rotate(-6deg)`;
            float.style.opacity = "0";
            setDocking(true);
            if (dockTimeout.current) window.clearTimeout(dockTimeout.current);
            dockTimeout.current = window.setTimeout(() => setHidden(true), 500);
          } else {
            // Footer pill scrolled away → bring floating back
            if (dockTimeout.current) window.clearTimeout(dockTimeout.current);
            setHidden(false);
            // wait one frame, then animate back to resting position
            requestAnimationFrame(() => {
              const float = floatRef.current;
              if (!float) return;
              float.style.transition = "none";
              float.style.transform = "translateY(20px) scale(0.92)";
              float.style.opacity = "0";
              requestAnimationFrame(() => {
                float.style.transition = "transform 360ms cubic-bezier(.2,.8,.3,1.1), opacity 280ms ease-out";
                float.style.transform = "";
                float.style.opacity = "";
                setDocking(false);
              });
            });
          }
        },
        { threshold: 0.6 },
      );
      observer.observe(anchor);
    };

    tryAttach();

    return () => {
      observer?.disconnect();
      if (dockTimeout.current) window.clearTimeout(dockTimeout.current);
      if (undockTimeout.current) window.clearTimeout(undockTimeout.current);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-x-0 z-30 flex justify-center pointer-events-none"
      style={{
        bottom: "max(12px, calc(env(safe-area-inset-bottom, 0px) + 8px))",
        // Hide entirely once dock animation completes (frees pointer events fully)
        visibility: hidden ? "hidden" : "visible",
      }}
      aria-hidden={docking ? "true" : undefined}
    >
      <a
        ref={floatRef}
        href="https://ko-fi.com/fankim"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/95 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-lg shadow-black/20 backdrop-blur-sm hover:text-foreground hover:border-border hover:shadow-xl transition-[color,border-color,box-shadow]"
        style={{ willChange: "transform, opacity" }}
      >
        <Heart className="size-3 fill-rose-400/90 text-rose-400/90 shrink-0" />
        <span className="relative inline-block h-4 overflow-hidden align-middle leading-4">
          {/* width-setter (longest slot, invisible) */}
          <span aria-hidden className="invisible whitespace-nowrap">
            {slots.reduce((a, b) => (b.length > a.length ? b : a), "")}
          </span>
          {slots.map((label, i) => {
            const isCurrent = i === index;
            const isLeaving = i === prevIndex && slots.length > 1;
            return (
              <span
                key={`${i}-${label}`}
                className={cn(
                  "absolute inset-0 flex items-center justify-center whitespace-nowrap transition-all duration-500 ease-in-out",
                  isCurrent && "translate-y-0 opacity-100",
                  isLeaving && "-translate-y-full opacity-0",
                  !isCurrent && !isLeaving && "translate-y-full opacity-0",
                )}
              >
                {label}
              </span>
            );
          })}
        </span>
      </a>
    </div>,
    document.body,
  );
}
