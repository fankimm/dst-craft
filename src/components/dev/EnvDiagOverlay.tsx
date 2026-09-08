"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * 환경 진단 오버레이 (#103).
 *
 * iOS 27 베타의 홈 화면 앱에서 상단 탭 바가 안개 낀 듯 흐려지는 문제를 시뮬레이터
 * (iOS 27 런타임 없음) 대신 실기기 스크린샷 한 장으로 재기 위한 개발 전용 도구.
 * 뷰포트 최상단(0px)부터 10px 간격 가로 눈금을 그려서
 *  1. 웹뷰가 상태바 밑까지 깔리는지 (시계·배터리 아이콘이 눈금 위에 겹치는지)
 *  2. OS 블러가 몇 px까지 내려오는지 (눈금이 뭉개지는 경계)
 *  3. `env(safe-area-inset-top)`이 얼마로 오는지 (파란 점선)
 * 를 읽을 수 있고, 아래 패널이 뷰포트·UA 수치를 텍스트로 보여준다 (복사 버튼).
 *
 * 켜는 법: DevMenu "환경 진단 오버레이" 또는 `?diag=1`. 일반 사용자에게는 노출되지 않는다.
 */

interface Metrics {
  ua: string;
  standalone: boolean;
  displayMode: string;
  screen: string;
  inner: string;
  outer: string;
  visual: string;
  screenMinusInner: number;
  safeTop: number;
  safeBottom: number;
  dpr: number;
  statusBarMeta: string;
  viewportMeta: string;
  /** #61 LegacyPwaNotice와 같은 시그니처 — 상태바 밑까지 깔린 옛 웹클립인지 */
  legacyPwa: boolean;
  /** 뷰포트 상단 100px에 걸친 position:fixed 요소들 — 탭 바를 덮는 게 광고 컨테이너인지 OS 블러인지 가른다 */
  topFixed: string[];
  /** Ezoic 앵커·상단 띠 상태 */
  ezoic: string;
}

/** 상단 100px과 겹치는 fixed 요소 (우리 진단 오버레이 자신은 제외) */
function scanTopFixed(): string[] {
  const out: string[] = [];
  const els = document.body.querySelectorAll<HTMLElement>("div, iframe, ins, section, aside, nav");
  for (const el of els) {
    if (el.closest("[data-env-diag]")) continue;
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.height <= 0 || r.width <= 0 || r.top >= 100) continue;
    const name = `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className && typeof el.className === "string" ? "." + el.className.split(/\s+/).slice(0, 2).join(".") : ""}`;
    out.push(`${name.slice(0, 48)} top=${Math.round(r.top)} h=${Math.round(r.height)} z=${cs.zIndex} bg=${cs.backgroundColor} filter=${cs.backdropFilter || "none"}`);
    if (out.length >= 8) break;
  }
  return out;
}

function scanEzoic(): string {
  const anchor = document.querySelector<HTMLElement>("#ezmobfooter, .ezmob-footer");
  const band = document.querySelector<HTMLElement>("#ezoic-pub-ad-placeholder-111");
  const a = anchor
    ? `anchor ${anchor.id || anchor.className} top=${Math.round(anchor.getBoundingClientRect().top)} h=${Math.round(anchor.getBoundingClientRect().height)} pos=${getComputedStyle(anchor).position}`
    : "anchor 없음";
  const b = band
    ? `111 h=${Math.round(band.getBoundingClientRect().height)} iframes=${band.querySelectorAll("iframe").length}`
    : "111 없음";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--ez-anchor-h").trim() || "(unset)";
  return `${a} / ${b} / --ez-anchor-h=${v}`;
}

/** `env()` 값은 JS로 직접 못 읽으므로 그 높이의 보이지 않는 fixed 요소를 재서 얻는다 */
function probe(cssHeight: string): number {
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;top:0;left:0;width:0;height:${cssHeight};visibility:hidden;pointer-events:none`;
  document.body.appendChild(el);
  const h = el.getBoundingClientRect().height;
  el.remove();
  return Math.round(h * 10) / 10;
}

function readMetrics(): Metrics {
  const nav = navigator as Navigator & { standalone?: boolean };
  const vv = window.visualViewport;
  const meta = (name: string) =>
    document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? "(none)";
  return {
    ua: navigator.userAgent,
    standalone: nav.standalone === true,
    displayMode: matchMedia("(display-mode: standalone)").matches
      ? "standalone"
      : matchMedia("(display-mode: fullscreen)").matches
        ? "fullscreen"
        : "browser",
    screen: `${screen.width}×${screen.height}`,
    inner: `${innerWidth}×${innerHeight}`,
    outer: `${outerWidth}×${outerHeight}`,
    visual: vv
      ? `${Math.round(vv.width)}×${Math.round(vv.height)} @y=${Math.round(vv.offsetTop)} scale=${vv.scale}`
      : "n/a",
    screenMinusInner: screen.height - innerHeight,
    safeTop: probe("env(safe-area-inset-top, 0px)"),
    safeBottom: probe("env(safe-area-inset-bottom, 0px)"),
    dpr: devicePixelRatio,
    statusBarMeta: meta("apple-mobile-web-app-status-bar-style"),
    viewportMeta: meta("viewport"),
    legacyPwa:
      nav.standalone === true &&
      screen.height - innerHeight > 20 &&
      probe("env(safe-area-inset-top, 0px)") > 0,
    topFixed: scanTopFixed(),
    ezoic: scanEzoic(),
  };
}

const RULER_HEIGHT = 240;
const TICKS = Array.from({ length: RULER_HEIGHT / 10 + 1 }, (_, i) => i * 10);

export function EnvDiagOverlay({ onClose }: { onClose: () => void }) {
  const [m, setM] = useState<Metrics | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => setM(readMetrics());
    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  if (!m) return null;

  const rows: [string, string | number | boolean][] = [
    ["standalone", `${m.standalone} / display-mode=${m.displayMode}`],
    ["screen", m.screen],
    ["inner", m.inner],
    ["outer", m.outer],
    ["visualViewport", m.visual],
    ["screen.h − inner.h", m.screenMinusInner],
    ["safe-area top / bottom", `${m.safeTop}px / ${m.safeBottom}px`],
    ["dpr", m.dpr],
    ["status-bar meta", m.statusBarMeta],
    ["viewport meta", m.viewportMeta],
    ["legacy 웹클립 판정(#61)", m.legacyPwa],
    ["ezoic", m.ezoic],
    ["fixed 요소(상단 100px)", m.topFixed.length ? m.topFixed.join(" ‖ ") : "(없음)"],
    ["UA", m.ua],
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(m, null, 1));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한 없음 — 패널 텍스트를 손으로 옮기면 된다 */
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] pointer-events-none" aria-hidden data-env-diag>
      {/* 최상단 경계 — 상태바가 이 위를 덮으면 웹뷰가 상태바 밑까지 깔린 것 */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-red-600" />
      {TICKS.map((y) => (
        <div
          key={y}
          className="absolute inset-x-0"
          style={{
            top: y,
            height: 1,
            background: y % 50 === 0 ? "rgba(220,38,38,0.9)" : "rgba(0,0,0,0.35)",
          }}
        />
      ))}
      {TICKS.filter((y) => y % 50 === 0).map((y) => (
        <span
          key={`l${y}`}
          className="absolute left-1 px-0.5 bg-white text-red-700 text-[10px] font-mono font-bold leading-none"
          style={{ top: y + 2 }}
        >
          {y}
        </span>
      ))}
      {/* safe-area-inset-top 위치 (파란 점선) */}
      <div
        className="absolute inset-x-0 border-t-2 border-dashed border-blue-600"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <span className="absolute right-1 top-0.5 px-0.5 bg-white text-blue-700 text-[10px] font-mono font-bold leading-none">
          safe-top {m.safeTop}px
        </span>
      </div>

      <div
        className="absolute left-2 right-2 pointer-events-auto rounded-lg border border-border bg-background/95 text-foreground p-3 text-[11px] font-mono leading-snug shadow-xl"
        style={{ top: RULER_HEIGHT + 20 }}
      >
        <div className="mb-1.5 font-sans text-xs font-semibold">환경 진단 (#103)</div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2 border-t border-border/50 py-0.5">
            <span className="shrink-0 w-[9.5rem] text-muted-foreground">{k}</span>
            <span className="break-all">{String(v)}</span>
          </div>
        ))}
        <div className="mt-2 flex gap-2 font-sans">
          <button
            onClick={copy}
            className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent"
          >
            {copied ? "복사됨" : "JSON 복사"}
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
