"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { fetchAnalytics, fetchVisitors, type AnalyticsData } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3, Globe, Users, Eye, RefreshCw,
  Smartphone, Monitor, Clock, Search, Download,
  RotateCcw, TrendingUp, ExternalLink, Star, Megaphone,
} from "lucide-react";
import { BackToHome } from "@/components/ui/BackToHome";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { cn } from "@/lib/utils";

/** Convert ISO 3166-1 alpha-2 country code to flag emoji */
function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "\u{1F3F3}\uFE0F";
  const cp1 = 0x1F1E6 + upper.charCodeAt(0) - 65;
  const cp2 = 0x1F1E6 + upper.charCodeAt(1) - 65;
  return String.fromCodePoint(cp1, cp2);
}

/** ISO 3166-1 alpha-2 → 한국어 국가명 (Intl API) */
const regionNames = new Intl.DisplayNames(["ko"], { type: "region" });

function countryName(code: string): string {
  const upper = code.toUpperCase();
  // Intl.DisplayNames throws RangeError on non-ISO codes (e.g. "T1" for Tor
  // traffic surfaces occasionally in analytics). Fall back to the raw code
  // instead of crashing the whole page.
  try {
    const ko = regionNames.of(upper);
    return ko && ko !== upper ? ko : upper;
  } catch {
    return upper;
  }
}

const osIcons: Record<string, string> = {
  iOS: "\u{1F34E}", macOS: "\u{1F34E}", Windows: "\u{1FA9F}", Android: "\u{1F916}", Linux: "\u{1F427}", ChromeOS: "\u{1F4BB}",
  // #63에서 `Other` 쓰레기통을 쪼갠 버킷들. 서버 `parseOS`의 반환값과 1:1.
  HarmonyOS: "\u{1F338}", Bot: "\u{1F577}\uFE0F", Unknown: "\u2753", Other: "\u{1F4E6}",
};

function StatCard({ icon: Icon, label, value, sub, unfiltered }: { icon: typeof Eye; label: string; value: number | string; sub?: string; unfiltered?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-1", unfiltered ? "border-dashed border-muted-foreground/30" : "border-border")}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
        {unfiltered && <span className="text-[10px] text-muted-foreground/60">필터 미적용</span>}
      </div>
      <p className={cn("text-2xl font-bold", unfiltered ? "text-muted-foreground" : "text-foreground")}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}\uCD08`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}\uBD84 ${s}\uCD08` : `${m}\uBD84`;
}

function PercentBar({ label, count, total, icon }: { label: string; count: number; total: number; icon?: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 truncate">{icon ? `${icon} ` : ""}{label}</span>
      <div className="flex-1 h-4 bg-surface rounded overflow-hidden">
        <div className="h-full bg-primary/60 rounded transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-20 text-right text-xs text-muted-foreground shrink-0">{count} ({pct}%)</span>
    </div>
  );
}

/**
 * 항목이 10개 초과하면 상위 10개만 보여주고 "더보기" 버튼으로 Sheet에 전체 노출.
 * sortedItems: [key, count] 배열 (정렬된 상태로 전달).
 * renderItem: 한 항목을 PercentBar 등으로 렌더링.
 */
/**
 * 광고 도달 상태 표시 순서와 라벨 (#85).
 *
 * 서버(`bun-api` analytics 라우트)의 `AD_STATES`와 키가 1:1로 대응한다.
 * 순서는 "수익이 나는 쪽 → 안 나는 쪽 → 판정 불가" 로 읽히게 둔다.
 */
const AD_STATE_ORDER = [
  { key: "filled", label: "노출됨" },
  { key: "nofill", label: "재고 없음" },
  { key: "blocked", label: "광고 차단" },
  { key: "noscript", label: "스크립트 미도달" },
  { key: "early", label: "이탈" },
] as const;

/**
 * 첫 소재 도착 시각 구간 (#86) — 서버 `fillMsBucket`의 라벨과 1:1.
 *
 * 실사용자 광고 지연 분포다. 헤드리스 실측(데스크탑 4.1~5.9초, Fast3G 15~17초)이
 * 실제 방문자에게도 맞는지 확인하는 유일한 근거이므로 순서를 임의로 바꾸지 말 것.
 */
const AD_FILL_MS_ORDER = ["0-2s", "2-4s", "4-6s", "6-8s", "8-12s", "12-20s", "20s+"] as const;

function CollapsibleList({
  title,
  icon,
  sortedItems,
  total,
  renderItem,
  emptyText = "아직 데이터 없음",
  topN,
}: {
  title: string;
  icon?: React.ReactNode;
  sortedItems: [string, number][];
  total: number;
  renderItem: (item: [string, number], total: number) => React.ReactNode;
  emptyText?: string;
  topN?: number;
}) {
  const [open, setOpen] = useState(false);
  const N = topN ?? 5;
  const visible = sortedItems.length > N ? sortedItems.slice(0, N) : sortedItems;
  const hidden = sortedItems.length - visible.length;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {sortedItems.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <>
          <div className="space-y-2">
            {visible.map((it) => renderItem(it, total))}
          </div>
          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full text-xs text-primary hover:underline pt-1 text-left"
            >
              + {hidden}개 더보기
            </button>
          )}
        </>
      )}
      <DetailPanel open={open} onClose={() => setOpen(false)}>
        <div className="px-4 pt-3 pb-6 space-y-3">
          <h3 className="text-sm font-semibold pr-8 flex items-center gap-2">
            {icon}
            {title} <span className="text-xs font-normal text-muted-foreground">· 전체 {sortedItems.length}개</span>
          </h3>
          <div className="space-y-2">
            {sortedItems.map((it) => renderItem(it, total))}
          </div>
        </div>
      </DetailPanel>
    </div>
  );
}

function VisitorTable({ rows }: { rows: AnalyticsData["recentVisitors"] }) {
  // 행을 눌러 원본 UA를 편다 (#63).
  // OS 버킷만으로는 왜 그렇게 분류됐는지 알 수 없다 — 특히 `Bot`/`Other`/`Unknown` 은
  // 원문을 봐야 규칙을 고칠지 판단할 수 있다.
  const [openId, setOpenId] = useState<number | string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-2 pr-3 font-medium">시간</th>
            <th className="pb-2 pr-3 font-medium">IP</th>
            <th className="pb-2 pr-3 font-medium">국가</th>
            <th className="pb-2 pr-3 font-medium">기기</th>
            <th className="pb-2 font-medium">OS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v, i) => {
            const key = v.id ?? `x-${i}`;
            const open = openId === key;
            return (
              <Fragment key={`${key}-${i}`}>
                <tr
                  className="border-b border-border/30 last:border-0 cursor-pointer hover:bg-surface-hover/50"
                  onClick={() => setOpenId(open ? null : key)}
                  title="클릭하면 원본 User-Agent 표시"
                >
                  <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap font-mono tabular-nums">
                    {new Date(v.time).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="font-mono text-foreground/80 inline-block w-[15ch] truncate align-middle"
                      title={v.ip}
                    >
                      {v.ip}
                    </span>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {countryFlag(v.country)} {countryName(v.country)}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{v.device === "mobile" ? "\u{1F4F1}" : "\u{1F5A5}️"}</td>
                  <td className="py-2 text-muted-foreground">{v.os ?? ""}</td>
                </tr>
                {open && (
                  <tr className="border-b border-border/30 last:border-0">
                    <td colSpan={5} className="py-2 pr-3">
                      <div className="rounded bg-surface px-2 py-1.5 font-mono text-[11px] leading-relaxed break-all text-muted-foreground">
                        {v.ua?.trim() ? v.ua : <span className="italic">(User-Agent 없음 — 봇이 body 없이 POST한 경우)</span>}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 접속자 상세 — 5건 inline + DetailPanel에서 무한 스크롤 (cursor 페이지네이션) */
function RecentVisitorsCard({ initial }: { initial: AnalyticsData["recentVisitors"] }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AnalyticsData["recentVisitors"]>(initial);
  const [cursor, setCursor] = useState<number | null>(initial[initial.length - 1]?.id ?? null);
  const [hasMore, setHasMore] = useState(initial.length >= 30);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // initial이 바뀌면 (e.g., refresh 이후) 상태 reset
  useEffect(() => {
    setItems(initial);
    setCursor(initial[initial.length - 1]?.id ?? null);
    setHasMore(initial.length >= 30);
  }, [initial]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !token) return;
    setLoading(true);
    const page = await fetchVisitors(token, cursor, 30);
    if (!page) {
      setHasMore(false);
    } else {
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor != null);
    }
    setLoading(false);
  }, [loading, hasMore, token, cursor]);

  // IntersectionObserver — sentinel 영역이 보이면 다음 페이지 fetch
  useEffect(() => {
    if (!open || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, loadMore]);

  const TOP = 5;
  const visible = items.length > TOP ? items.slice(0, TOP) : items;
  const totalAvailable = hasMore ? `${items.length}+` : `${items.length}`;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h2 className="text-sm font-semibold">접속자 상세</h2>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">아직 데이터 없음</p>
      ) : (
        <>
          <VisitorTable rows={visible} />
          {(items.length > TOP || hasMore) && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full text-xs text-primary hover:underline pt-1 text-left"
            >
              + 전체 보기
            </button>
          )}
        </>
      )}
      <DetailPanel open={open} onClose={() => setOpen(false)}>
        <div className="px-4 pt-3 pb-6 space-y-3">
          <h3 className="text-sm font-semibold pr-8">
            접속자 상세 <span className="text-xs font-normal text-muted-foreground">· {totalAvailable}건</span>
          </h3>
          <VisitorTable rows={items} />
          <div ref={sentinelRef} className="py-2 text-center text-xs text-muted-foreground">
            {loading
              ? "불러오는 중..."
              : hasMore
                ? "스크롤하면 더 불러옵니다"
                : "끝"}
          </div>
        </div>
      </DetailPanel>
    </div>
  );
}

/** SVG Area Chart for cumulative daily trend */
function CumulativeChart({ data }: { data: { date: string; pv: number; uv: number }[] }) {
  const days = [...data].reverse(); // oldest → newest
  if (days.length < 2) return null;

  // Build cumulative sums
  const cumDays = days.reduce<{ date: string; pv: number; uv: number }[]>((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : { pv: 0, uv: 0 };
    acc.push({ date: d.date, pv: prev.pv + d.pv, uv: prev.uv + d.uv });
    return acc;
  }, []);

  const maxVal = Math.max(cumDays[cumDays.length - 1].pv, cumDays[cumDays.length - 1].uv, 1);

  const W = 600;
  const H = 200;
  const padTop = 20;
  const padBottom = 30;
  const padLeft = 40;
  const padRight = 30;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

  const labelStep = cumDays.length <= 10 ? 1 : cumDays.length <= 20 ? 2 : Math.ceil(cumDays.length / 10);

  function x(i: number) {
    return padLeft + (i / (cumDays.length - 1)) * chartW;
  }
  function y(val: number) {
    return padTop + chartH - (val / maxVal) * chartH;
  }

  function areaPath(key: "pv" | "uv") {
    const pts = cumDays.map((d, i) => `${x(i)},${y(d[key])}`);
    return `M${pts.join(" L")} L${x(cumDays.length - 1)},${padTop + chartH} L${x(0)},${padTop + chartH} Z`;
  }

  function linePath(key: "pv" | "uv") {
    const pts = cumDays.map((d, i) => `${x(i)},${y(d[key])}`);
    return `M${pts.join(" L")}`;
  }

  const showValues = cumDays.length <= 14;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* PV area */}
      <path d={areaPath("pv")} className="fill-primary/20" />
      <path d={linePath("pv")} className="stroke-primary/60" fill="none" strokeWidth="2" />
      {/* UV area */}
      <path d={areaPath("uv")} className="fill-green-500/20" />
      <path d={linePath("uv")} className="stroke-green-500/60" fill="none" strokeWidth="2" />
      {/* Data points + labels */}
      {cumDays.map((d, i) => (
        <g key={d.date}>
          <circle cx={x(i)} cy={y(d.pv)} r={showValues ? 3 : 2} className="fill-primary/80" />
          {showValues && (
            <text x={x(i)} y={y(d.pv) - 8} textAnchor="middle" className="fill-foreground text-[10px] font-medium">{d.pv}</text>
          )}
          <circle cx={x(i)} cy={y(d.uv)} r={showValues ? 3 : 2} className="fill-green-500/80" />
          {showValues && (
            <text x={x(i)} y={y(d.uv) + 14} textAnchor="middle" className="fill-green-600 dark:fill-green-400 text-[10px] font-medium">{d.uv}</text>
          )}
          {i % labelStep === 0 && (
            <text x={x(i)} y={H - 5} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {d.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/** SVG Area Chart for daily trend */
function AreaChart({ data }: { data: { date: string; pv: number; uv: number }[] }) {
  const days = [...data].reverse(); // oldest → newest
  if (days.length < 2) return null;
  const maxVal = Math.max(...days.map((d) => Math.max(d.pv, d.uv)), 1);

  const W = 600;
  const H = 200;
  const padTop = 20;
  const padBottom = 30;
  const padLeft = 30;
  const padRight = 30;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

  // Show every Nth label to avoid overlap
  const labelStep = days.length <= 10 ? 1 : days.length <= 20 ? 2 : Math.ceil(days.length / 10);

  function x(i: number) {
    return padLeft + (i / (days.length - 1)) * chartW;
  }
  function y(val: number) {
    return padTop + chartH - (val / maxVal) * chartH;
  }

  function areaPath(key: "pv" | "uv") {
    const pts = days.map((d, i) => `${x(i)},${y(d[key])}`);
    return `M${pts.join(" L")} L${x(days.length - 1)},${padTop + chartH} L${x(0)},${padTop + chartH} Z`;
  }

  function linePath(key: "pv" | "uv") {
    const pts = days.map((d, i) => `${x(i)},${y(d[key])}`);
    return `M${pts.join(" L")}`;
  }

  const showValues = days.length <= 14;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* PV area */}
      <path d={areaPath("pv")} className="fill-primary/20" />
      <path d={linePath("pv")} className="stroke-primary/60" fill="none" strokeWidth="2" />
      {/* UV area */}
      <path d={areaPath("uv")} className="fill-green-500/20" />
      <path d={linePath("uv")} className="stroke-green-500/60" fill="none" strokeWidth="2" />
      {/* Data points + labels */}
      {days.map((d, i) => (
        <g key={d.date}>
          <circle cx={x(i)} cy={y(d.pv)} r={showValues ? 3 : 2} className="fill-primary/80" />
          {showValues && (
            <text x={x(i)} y={y(d.pv) - 8} textAnchor="middle" className="fill-foreground text-[10px] font-medium">{d.pv}</text>
          )}
          <circle cx={x(i)} cy={y(d.uv)} r={showValues ? 3 : 2} className="fill-green-500/80" />
          {showValues && (
            <text x={x(i)} y={y(d.uv) + 14} textAnchor="middle" className="fill-green-600 dark:fill-green-400 text-[10px] font-medium">{d.uv}</text>
          )}
          {i % labelStep === 0 && (
            <text x={x(i)} y={H - 5} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {d.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function StatsPage() {
  const { token, isAdmin } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [excludeKR, setExcludeKR] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function load(d = days, exclude = excludeKR) {
    setLoading(true);
    const result = await fetchAnalytics(token ?? null, d, exclude ? "KR" : undefined);
    setData(result);
    setLoading(false);
    if (result && isAdmin && token) {
      showToast("로드 완료");
    }
  }

  useEffect(() => {
    load();
  }, [token, isAdmin]);

  function handleDaysChange(d: number) {
    setDays(d);
    load(d);
  }

  function handleExcludeKR(checked: boolean) {
    setExcludeKR(checked);
    load(days, checked);
  }

  const sortedCountries = data
    ? Object.entries(data.countries).sort((a, b) => b[1] - a[1])
    : [];
  const totalCountryVisits = sortedCountries.reduce((sum, [, c]) => sum + c, 0);

  const sortedOS = data
    ? Object.entries(data.os ?? {}).sort((a, b) => b[1] - a[1])
    : [];
  const totalOS = sortedOS.reduce((sum, [, c]) => sum + c, 0);

  const mobileCount = data?.device?.mobile ?? 0;
  const desktopCount = data?.device?.desktop ?? 0;
  const totalDevice = mobileCount + desktopCount;
  const mobilePct = totalDevice > 0 ? Math.round((mobileCount / totalDevice) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackToHome />
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="size-5" />
            접속 통계
          </h1>
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            불러오는 중...
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            데이터를 불러올 수 없습니다
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Eye} label="총 페이지뷰" value={data.totalPageViews} />
              <StatCard icon={Users} label="총 방문자" value={data.totalUniqueVisitors} />
              <StatCard icon={Eye} label="오늘 페이지뷰" value={data.todayPageViews} />
              <StatCard icon={Users} label="오늘 방문자" value={data.todayUniqueVisitors} />
            </div>

            {/* New Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard icon={RotateCcw} label="재방문율" value={`${data.returnRate}%`} sub={`${data.returnVisitors}회 재방문`} />
              <StatCard icon={Clock} label="평균 체류시간" value={formatDuration(data.avgDuration)} unfiltered={excludeKR} />
              <StatCard icon={Search} label="검색 사용" value={data.searchCount} sub="세션" unfiltered={excludeKR} />
              <StatCard icon={Smartphone} label="모바일 비율" value={`${mobilePct}%`} sub={`${mobileCount} 모바일 / ${desktopCount} PC`} />
              <StatCard icon={Download} label="PWA 설치" value={data.pwaInstalls} unfiltered={excludeKR} />
              {isAdmin && (
                <button
                  onClick={() => handleExcludeKR(!excludeKR)}
                  className={cn(
                    "rounded-lg border p-4 space-y-1 text-left transition-colors",
                    excludeKR
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="size-4" />
                    <span className="text-xs font-medium">KR 제외</span>
                  </div>
                  <p className={cn("text-2xl font-bold", excludeKR ? "text-primary" : "text-muted-foreground")}>
                    {excludeKR ? "ON" : "OFF"}
                  </p>
                </button>
              )}
            </div>

            {/* 광고 도달 (#85) — Ezoic 대시보드는 "채워진 노출"만 보여준다.
                여기서는 요청이 나갔는데 소재가 안 온 세션(nofill)과 광고 필터에 막힌
                세션(blocked)까지 세므로, ePMV가 낮을 때 원인을 재고 부족과 단가 하락으로
                가를 수 있다. */}
            {(() => {
              const av = data.adVisibility ?? {};
              const totalAv = AD_STATE_ORDER.reduce((n, st) => n + (av[st.key] ?? 0), 0);
              if (totalAv === 0) return null;
              // 이탈 세션(early)은 판정이 이르므로 노출률 계산에서 뺀다 — 대신 따로 보여준다.
              const judged = totalAv - (av.early ?? 0);
              const filled = av.filled ?? 0;
              const fillPct = judged > 0 ? Math.round((filled / judged) * 100) : 0;
              const fm = data.adFillMs ?? {};
              const fillRows = AD_FILL_MS_ORDER.map((label) => ({ label, count: fm[label] ?? 0 })).filter(
                (r) => r.count > 0,
              );
              const fillTotal = fillRows.reduce((n, r) => n + r.count, 0);
              const byCountry = data.adVisibilityByCountry ?? {};
              const countryRows = Object.entries(byCountry)
                .map(([code, m]) => {
                  const sum = AD_STATE_ORDER.reduce((n, st) => n + (m[st.key] ?? 0), 0);
                  const judgedC = sum - (m.early ?? 0);
                  return { code, sum, judgedC, filled: m.filled ?? 0 };
                })
                .filter((r) => r.judgedC > 0)
                .sort((a, b) => b.sum - a.sum)
                .slice(0, 8);
              return (
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Megaphone className="size-4" />
                      광고 도달
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      노출률 {fillPct}% / 판정 {judged}건
                    </span>
                  </div>
                  <div className="space-y-2">
                    {AD_STATE_ORDER.map((st) => (
                      <PercentBar
                        key={st.key}
                        label={st.label}
                        count={av[st.key] ?? 0}
                        total={st.key === "early" ? totalAv : judged}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    노출·차단·미도달 비율은 <strong>판정 {judged}건</strong> 기준이다.
                    이탈만 전체 {totalAv}건 기준 — 소재가 오기 전에 떠나 판정이 이른 표본이라
                    비율 계산에서 뺐다.
                  </p>
                  {fillRows.length > 0 && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        첫 광고 도착까지 걸린 시간 (실사용자)
                      </p>
                      {fillRows.map((r) => (
                        <PercentBar key={r.label} label={r.label} count={r.count} total={fillTotal} />
                      ))}
                    </div>
                  )}
                  {isAdmin && countryRows.length > 0 && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-xs font-medium text-muted-foreground">국가별 노출률</p>
                      {countryRows.map((r) => (
                        <PercentBar
                          key={r.code}
                          label={countryName(r.code)}
                          icon={countryFlag(r.code)}
                          count={r.filled}
                          total={r.judgedC}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Ratings */}
            {(data.totalRatings ?? 0) > 0 && (() => {
              const totalR = data.totalRatings ?? 0;
              const avgR = data.avgRating ?? 0;
              const rMap = data.ratings ?? {};
              return (
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Star className="size-4" />
                      별점 평가
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      평균 {avgR} / 총 {totalR}건
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <PercentBar
                        key={star}
                        label={`${"★".repeat(star)}`}
                        count={rMap[String(star)] ?? 0}
                        total={totalR}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Daily Trend Area Chart */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  접속자 추이
                </h2>
                <div className="flex gap-1">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDaysChange(d)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        days === d
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-surface-hover"
                      }`}
                    >
                      {d}일
                    </button>
                  ))}
                </div>
              </div>
              <AreaChart data={data.dailyTrend} />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-primary/60 rounded" /> PV (페이지뷰)</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-green-500/60 rounded" /> UV (순 방문자)</span>
              </div>
            </div>

            {/* Cumulative Daily Chart */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4" />
                일자별 누적 접속자
              </h2>
              <CumulativeChart data={data.dailyTrend} />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-primary/60 rounded" /> 누적 PV</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-green-500/60 rounded" /> 누적 UV</span>
              </div>
            </div>

            {/* Device & OS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Device */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Monitor className="size-4" />
                  디바이스
                </h2>
                <div className="space-y-2">
                  <PercentBar label="모바일" count={mobileCount} total={totalDevice} icon={"\u{1F4F1}"} />
                  <PercentBar label="데스크탑" count={desktopCount} total={totalDevice} icon={"\u{1F5A5}\uFE0F"} />
                </div>
              </div>

              {/* OS */}
              <CollapsibleList
                title="운영체제"
                sortedItems={sortedOS}
                total={totalOS}
                renderItem={([name, count], total) => (
                  <PercentBar key={name} label={name} count={count} total={total} icon={osIcons[name] ?? "\u{1F4BB}"} />
                )}
              />
            </div>

            {/* Referrers */}
            {(() => {
              const sortedReferrers = Object.entries(data.referrers ?? {}).sort((a, b) => b[1] - a[1]);
              const totalReferrers = sortedReferrers.reduce((sum, [, c]) => sum + c, 0);
              return (
                <CollapsibleList
                  title="유입 출처"
                  icon={<ExternalLink className="size-4" />}
                  sortedItems={sortedReferrers}
                  total={totalReferrers}
                  renderItem={([source, count], total) => (
                    <PercentBar key={source} label={source} count={count} total={total} />
                  )}
                />
              );
            })()}

            {/* Referrer URLs (admin only) — DC인사이드 갤러리 글 등 외부 유입 경로 추적 */}
            {isAdmin && (data.referrerUrls?.length ?? 0) > 0 && (() => {
              const urls = data.referrerUrls ?? [];
              const sortedUrls: [string, number][] = urls.map((r) => [r.url, r.count]);
              const totalUrls = sortedUrls.reduce((sum, [, c]) => sum + c, 0);
              return (
                <CollapsibleList
                  title="유입 URL (admin)"
                  icon={<ExternalLink className="size-4" />}
                  sortedItems={sortedUrls}
                  total={totalUrls}
                  topN={10}
                  renderItem={([url, count], total) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={url} className="flex items-center gap-3 text-sm">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0 truncate text-primary hover:underline"
                          title={url}
                        >
                          {url}
                        </a>
                        <span className="w-20 text-right text-xs text-muted-foreground shrink-0 tabular-nums">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  }}
                />
              );
            })()}

            {/* Countries */}
            <CollapsibleList
              title="국가별 방문"
              icon={<Globe className="size-4" />}
              sortedItems={sortedCountries}
              total={totalCountryVisits}
              renderItem={([code, count], total) => (
                <PercentBar
                  key={code}
                  label={countryName(code)}
                  count={count}
                  total={total}
                  icon={countryFlag(code)}
                />
              )}
            />

            {/* Recent Visitors (admin only) — top 5 inline + 더보기 → DetailPanel 전체 */}
            {isAdmin && <RecentVisitorsCard initial={data.recentVisitors} />}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in duration-200">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
