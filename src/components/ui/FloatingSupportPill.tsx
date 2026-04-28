"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupporterTicker } from "@/hooks/use-supporter-ticker";

/**
 * Floating ko-fi pill that lives at the bottom-center of the viewport when
 * the page's anchor pill (in the Footer) is off-screen, then animates into
 * the anchor's position when the user scrolls the Footer into view.
 *
 * Requires a `[data-support-pill-anchor]` element somewhere in the DOM
 * (the Footer's SupportPill provides this).
 */
export function FloatingSupportPill() {
  const { slots, index, prevIndex } = useSupporterTicker();
  const [mounted, setMounted] = useState(false);
  const [docking, setDocking] = useState(false);
  const [hidden, setHidden] = useState(false);
  const floatRef = useRef<HTMLAnchorElement>(null);
  const dockTimeout = useRef<number | null>(null);
  const undockTimeout = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let observer: IntersectionObserver | null = null;
    // AppShell mounts every tab at once (display:none toggle), so multiple
    // [data-support-pill-anchor] elements exist. Track each one's intersection
    // state so we can dock when ANY anchor is visible.
    const intersectingMap = new WeakMap<Element, boolean>();

    const handleEntries = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((e) => intersectingMap.set(e.target, e.isIntersecting));

      // Find any currently-visible anchor (active tab's Footer pill in view)
      const anchors = document.querySelectorAll("[data-support-pill-anchor]");
      let visibleAnchor: HTMLElement | null = null;
      for (const a of anchors) {
        if (intersectingMap.get(a)) {
          visibleAnchor = a as HTMLElement;
          break;
        }
      }

      const float = floatRef.current;
      if (!float) return;

      if (visibleAnchor) {
        // Dock floating pill into the visible anchor
        const fr = float.getBoundingClientRect();
        const tr = visibleAnchor.getBoundingClientRect();
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
        // No anchor visible → undock and bring floating back
        if (dockTimeout.current) window.clearTimeout(dockTimeout.current);
        setHidden(false);
        requestAnimationFrame(() => {
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
    };

    // Anchors may mount slightly after this component. Poll briefly until at
    // least one shows up, then observe ALL of them.
    const tryAttach = () => {
      const anchors = document.querySelectorAll("[data-support-pill-anchor]");
      if (anchors.length === 0) {
        setTimeout(tryAttach, 100);
        return;
      }
      observer = new IntersectionObserver(handleEntries, { threshold: 0.6 });
      anchors.forEach((a) => observer!.observe(a));
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
          <span aria-hidden className="invisible whitespace-nowrap">
            {slots.reduce((a, b) => (b.length > a.length ? b : a), "")}
          </span>
          {slots.map((label, i) => {
            const isCurrent = i === index;
            const isLeaving = i === prevIndex;
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
