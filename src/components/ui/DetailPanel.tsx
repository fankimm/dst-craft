"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { findScrollContainerFor } from "@/lib/scroll-container";
import { SupportPill } from "./SupportPill";
import { AdSlot } from "@/components/ads/AdSlot";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  backLabel?: string;
  /** Hide the top-right close icon (overlay click and swipe still close) */
  hideClose?: boolean;
  children: ReactNode;
}

/**
 * Reusable bottom-sheet detail panel with overlay, close button, and SupportPill.
 * Pair with `useDetailPanel` hook for animation state management.
 */
export function DetailPanel({ open, onClose, onBack, backLabel, hideClose, children }: DetailPanelProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  // 시트가 열린 동안 뒤의 스크롤 컨테이너를 잠근다 (#105).
  // 대상은 **이 패널이 속한 탭의** 컨테이너다 — `document.querySelector` 로 문서 첫 번째를
  // 잡으면 안 된다. #91 이후 한 번 연 탭은 `display:none` 으로 계속 마운트되므로 첫 번째는
  // 언제나 제작 탭이었고, 보스·요리·스킨 시트가 숨은 탭에 열린 채 남으면 제작 탭의
  // 스크롤이 죽었다 (docs/mistakes.md "querySelector 다중 탭 마운트 함정").
  useEffect(() => {
    if (!open) return;
    const found = findScrollContainerFor(overlayRef.current);
    // 앱 셸 밖 단독 페이지(/stats 등)는 컨테이너가 없고 문서가 스크롤하므로 body 를 잠근다.
    // 셸 안에서 못 찾았으면 아무것도 잠그지 않는다 — body 는 AppShell 이 소유한다.
    const target = found.container ?? (found.insideShell ? null : document.body);
    if (!target) return;
    target.style.overflow = "hidden";
    return () => { target.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        ref={overlayRef}
        // 열린 시트 마커 — useScrollLockHeal 이 "시트 없는 잠금" 을 판정하는 데 쓴다 (#105)
        data-detail-open={open ? "true" : "false"}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-180",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-card max-h-[80dvh] overflow-y-auto overscroll-contain transition-transform duration-180 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {onBack && backLabel ? (
          <div className="flex items-center px-2 py-1.5">
            <button
              onClick={onBack}
              className="flex items-center gap-0.5 px-1 py-0.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="size-3.5" />
              <span className="max-w-[160px] truncate">{backLabel}</span>
            </button>
          </div>
        ) : !hideClose ? (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        ) : null}
        {children}
        {/* 상세 시트 광고 (#75). 시트는 탭마다 하나씩 상시 마운트돼 있으므로 열렸을 때만
            렌더한다 — 닫힌 시트에도 광고를 요청하면 보이지 않는 노출이 쌓인다. */}
        {open && <AdSlot variant="sheet" />}
        <SupportPill />
      </div>
    </>
  );
}
