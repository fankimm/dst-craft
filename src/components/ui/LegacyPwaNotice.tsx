"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

const DISMISS_KEY = "dst:legacy-pwa-notice-dismissed";

/**
 * legacy 웹클립 설치본 감지 (#61).
 * iOS 26 이후 black-translucent 메타 시절(#60 이전)에 홈 화면 추가한 설치본은
 * 뷰포트가 (화면-상태바) 높이로 잘려 하단에 죽은 흰 띠가 남는다. 시그니처:
 *  1. navigator.standalone — iOS 홈 화면 앱
 *  2. screen.height - innerHeight > 20 — 뷰포트가 화면보다 작음 (죽은 영역 존재)
 *  3. safe-area-inset-top > 0 — legacy 스타일로 상태바 밑에 깔림
 * 정상 설치본(구형 full-bleed: 2 미충족 / #60 이후 default: 3 미충족)과
 * 브라우저 모드(1 미충족)에서는 뜨지 않는다. iOS 26.5 시뮬레이터에서
 * WebClipStatusBarStyle 치환으로 legacy/default 양쪽 실측 검증.
 */
function isLegacyPwa(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone !== true) return false;
  if (window.screen.height - window.innerHeight <= 20) return false;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const safeTop = probe.getBoundingClientRect().height;
  probe.remove();
  return safeTop > 0;
}

/** legacy PWA 설치본에만 뜨는 재설치 안내 배너. 닫으면 영구 dismiss. */
export function LegacyPwaNotice() {
  const { resolvedLocale } = useSettings();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (isLegacyPwa()) setShow(true);
  }, []);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-x-0 z-50 flex justify-center pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 56px)" }}
    >
      <div className="pointer-events-auto mx-4 flex max-w-md items-start gap-2 rounded-xl border border-border/70 bg-surface/95 p-3 text-xs leading-relaxed text-foreground/90 shadow-lg shadow-black/20 backdrop-blur-sm">
        <span className="flex-1">{t(resolvedLocale, "legacy_pwa_notice")}</span>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
            setShow(false);
          }}
          aria-label={t(resolvedLocale, "notice_dismiss")}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
