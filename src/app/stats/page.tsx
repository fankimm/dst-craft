"use client";

import { useEffect, useState } from "react";
import { fetchAnalytics, type AnalyticsData } from "@/lib/analytics";
import {
  BarChart3, Globe, Users, Eye, RefreshCw,
  Smartphone, Monitor, Clock, Search, Download,
  RotateCcw, TrendingUp,
} from "lucide-react";
import { BackToHome } from "@/components/ui/BackToHome";

/** Convert ISO 3166-1 alpha-2 country code to flag emoji */
function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "🏳️";
  const cp1 = 0x1F1E6 + upper.charCodeAt(0) - 65;
  const cp2 = 0x1F1E6 + upper.charCodeAt(1) - 65;
  return String.fromCodePoint(cp1, cp2);
}

const osIcons: Record<string, string> = {
  iOS: "🍎", macOS: "🍎", Windows: "🪟", Android: "🤖", Linux: "🐧", ChromeOS: "💻",
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
  if (seconds < 60) return `${seconds}초`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
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

export default function StatsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const result = await fetchAnalytics();
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const sortedCountries = data
    ? Object.entries(data.countries).sort((a, b) => b[1] - a[1])
    : [];
  const totalCountryVisits = sortedCountries.reduce((sum, [, c]) => sum + c, 0);

  const sortedOS = data
    ? Object.entries(data.os ?? {}).sort((a, b) => b[1] - a[1])
    : [];
  const totalOS = sortedOS.reduce((sum, [, c]) => sum + c, 0);

  const maxPv = data ? Math.max(...data.last7Days.map((d) => d.pv), 1) : 1;
  const maxUv = data ? Math.max(...data.last7Days.map((d) => d.uv), 1) : 1;

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

            {/* 7-Day Trend Chart */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4" />
                접속자 추이 (7일)
              </h2>
              {/* Line-style bar chart */}
              <div className="space-y-2">
                {[...data.last7Days].reverse().map((day) => (
                  <div key={day.date} className="flex items-center gap-3 text-xs">
                    <span className="w-14 text-muted-foreground shrink-0">
                      {day.date.slice(5)}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 text-right text-muted-foreground shrink-0">PV</span>
                        <div className="flex-1 h-3 bg-surface rounded overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded transition-all"
                            style={{ width: `${(day.pv / maxPv) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-muted-foreground shrink-0">{day.pv}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 text-right text-muted-foreground shrink-0">UV</span>
                        <div className="flex-1 h-3 bg-surface rounded overflow-hidden">
                          <div
                            className="h-full bg-green-500/60 rounded transition-all"
                            style={{ width: `${(day.uv / maxUv) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-muted-foreground shrink-0">{day.uv}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <PercentBar label="모바일" count={mobileCount} total={totalDevice} icon="📱" />
                  <PercentBar label="데스크탑" count={desktopCount} total={totalDevice} icon="🖥️" />
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
                      <PercentBar key={name} label={name} count={count} total={totalOS} icon={osIcons[name] ?? "💻"} />
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
                          <td className="py-2 pr-3 text-muted-foreground">{v.device === "mobile" ? "📱" : "🖥️"}</td>
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
