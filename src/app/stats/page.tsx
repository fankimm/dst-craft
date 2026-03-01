"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAnalytics, type AnalyticsData } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3, Globe, Users, Eye, RefreshCw,
  Smartphone, Monitor, Clock, Search, Download,
  RotateCcw, TrendingUp,
} from "lucide-react";
import { BackToHome } from "@/components/ui/BackToHome";

/** Convert ISO 3166-1 alpha-2 country code to flag emoji */
function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "\u{1F3F3}\uFE0F";
  const cp1 = 0x1F1E6 + upper.charCodeAt(0) - 65;
  const cp2 = 0x1F1E6 + upper.charCodeAt(1) - 65;
  return String.fromCodePoint(cp1, cp2);
}

const osIcons: Record<string, string> = {
  iOS: "\u{1F34E}", macOS: "\u{1F34E}", Windows: "\u{1FA9F}", Android: "\u{1F916}", Linux: "\u{1F427}", ChromeOS: "\u{1F4BB}",
};

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Eye; label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
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

/** SVG Area Chart for 7-day trend */
function AreaChart({ data }: { data: { date: string; pv: number; uv: number }[] }) {
  const days = [...data].reverse(); // oldest → newest
  const maxVal = Math.max(...days.map((d) => Math.max(d.pv, d.uv)), 1);

  const W = 600;
  const H = 200;
  const padTop = 20;
  const padBottom = 30;
  const padLeft = 10;
  const padRight = 10;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

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
          {/* PV dot */}
          <circle cx={x(i)} cy={y(d.pv)} r="3" className="fill-primary/80" />
          <text x={x(i)} y={y(d.pv) - 8} textAnchor="middle" className="fill-foreground text-[10px] font-medium">{d.pv}</text>
          {/* UV dot */}
          <circle cx={x(i)} cy={y(d.uv)} r="3" className="fill-green-500/80" />
          <text x={x(i)} y={y(d.uv) + 14} textAnchor="middle" className="fill-green-600 dark:fill-green-400 text-[10px] font-medium">{d.uv}</text>
          {/* Date label */}
          <text x={x(i)} y={H - 5} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {d.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function StatsPage() {
  const { token, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/");
    }
  }, [authLoading, isAdmin, router]);

  async function load() {
    if (!token) return;
    setLoading(true);
    const result = await fetchAnalytics(token);
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    if (token && isAdmin) {
      load();
    }
  }, [token, isAdmin]);

  // Don't render anything for non-admin
  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        {authLoading ? "\uBD88\uB7EC\uC624\uB294 \uC911..." : "\uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"}
      </div>
    );
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
            onClick={load}
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
              <StatCard icon={RotateCcw} label="재방문율" value={`${data.returnRate}%`} sub={`${data.returnVisitors}명 재방문`} />
              <StatCard icon={Clock} label="평균 체류시간" value={formatDuration(data.avgDuration)} />
              <StatCard icon={Search} label="검색 사용" value={data.searchCount} sub="세션" />
              <StatCard icon={Smartphone} label="모바일 비율" value={`${mobilePct}%`} sub={`${mobileCount} 모바일 / ${desktopCount} PC`} />
              <StatCard icon={Download} label="PWA 설치" value={data.pwaInstalls} />
            </div>

            {/* 7-Day Trend Area Chart */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4" />
                접속자 추이 (7일)
              </h2>
              <AreaChart data={data.last7Days} />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-primary/60 rounded" /> PV (페이지뷰)</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-green-500/60 rounded" /> UV (순 방문자)</span>
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
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-sm font-semibold">운영체제</h2>
                {sortedOS.length === 0 ? (
                  <p className="text-xs text-muted-foreground">아직 데이터 없음</p>
                ) : (
                  <div className="space-y-2">
                    {sortedOS.map(([name, count]) => (
                      <PercentBar key={name} label={name} count={count} total={totalOS} icon={osIcons[name] ?? "\u{1F4BB}"} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Countries */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Globe className="size-4" />
                국가별 방문
              </h2>
              {sortedCountries.length === 0 ? (
                <p className="text-xs text-muted-foreground">아직 데이터 없음</p>
              ) : (
                <div className="space-y-2">
                  {sortedCountries.map(([code, count]) => (
                    <PercentBar
                      key={code}
                      label={code}
                      count={count}
                      total={totalCountryVisits}
                      icon={countryFlag(code)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Visitors Table */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold">접속자 상세</h2>
              {data.recentVisitors.length === 0 ? (
                <p className="text-xs text-muted-foreground">아직 데이터 없음</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-2 pr-3 font-medium">시간</th>
                        <th className="pb-2 pr-3 font-medium">IP</th>
                        <th className="pb-2 pr-3 font-medium">국가</th>
                        <th className="pb-2 pr-3 font-medium">지역</th>
                        <th className="pb-2 pr-3 font-medium">도시</th>
                        <th className="pb-2 pr-3 font-medium">기기</th>
                        <th className="pb-2 font-medium">OS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentVisitors.map((v, i) => (
                        <tr key={i} className="border-b border-border/30 last:border-0">
                          <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                            {new Date(v.time).toLocaleString("ko-KR", {
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="py-2 pr-3 font-mono text-foreground/80">{v.ip}</td>
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {countryFlag(v.country)} {v.country}
                          </td>
                          <td className="py-2 pr-3 text-muted-foreground">{v.region}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{v.city}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{v.device === "mobile" ? "\u{1F4F1}" : "\u{1F5A5}\uFE0F"}</td>
                          <td className="py-2 text-muted-foreground">{v.os ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
