"use client";

import { useEffect, useState } from "react";
import { fetchAnalytics, type AnalyticsData } from "@/lib/analytics";
import { BarChart3, Globe, Users, Eye, RefreshCw } from "lucide-react";

const countryFlags: Record<string, string> = {
  KR: "🇰🇷", US: "🇺🇸", JP: "🇯🇵", CN: "🇨🇳", TW: "🇹🇼", GB: "🇬🇧",
  DE: "🇩🇪", FR: "🇫🇷", CA: "🇨🇦", AU: "🇦🇺", BR: "🇧🇷", RU: "🇷🇺",
  IN: "🇮🇳", MX: "🇲🇽", ES: "🇪🇸", IT: "🇮🇹", PL: "🇵🇱", NL: "🇳🇱",
  SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰", FI: "🇫🇮", SG: "🇸🇬", HK: "🇭🇰",
  TH: "🇹🇭", VN: "🇻🇳", PH: "🇵🇭", ID: "🇮🇩", MY: "🇲🇾",
};

function StatCard({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
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

  const maxPv = data ? Math.max(...data.last7Days.map((d) => d.pv), 1) : 1;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="size-5" />
            Analytics
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
            Loading...
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Failed to load analytics data
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Eye} label="Total Page Views" value={data.totalPageViews} />
              <StatCard icon={Users} label="Total Unique Visitors" value={data.totalUniqueVisitors} />
              <StatCard icon={Eye} label="Today Page Views" value={data.todayPageViews} />
              <StatCard icon={Users} label="Today Unique" value={data.todayUniqueVisitors} />
            </div>

            {/* 7-Day Chart */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold">Last 7 Days</h2>
              <div className="space-y-2">
                {[...data.last7Days].reverse().map((day) => (
                  <div key={day.date} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-muted-foreground shrink-0">
                      {day.date.slice(5)}
                    </span>
                    <div className="flex-1 h-5 bg-surface rounded overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded transition-all"
                        style={{ width: `${(day.pv / maxPv) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-muted-foreground shrink-0">
                      {day.pv} / {day.uv}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">PV / UV</p>
            </div>

            {/* Countries */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Globe className="size-4" />
                Countries
              </h2>
              {sortedCountries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-1.5">
                  {sortedCountries.map(([code, count]) => (
                    <div key={code} className="flex items-center justify-between text-sm">
                      <span>
                        {countryFlags[code] ?? "🏳️"} {code}
                      </span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Visitors */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold">Recent Visitors</h2>
              {data.recentVisitors.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {data.recentVisitors.map((v, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-xs border-b border-border/50 pb-2 last:border-0">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span>{countryFlags[v.country] ?? "🏳️"}</span>
                          <span className="text-foreground font-medium">
                            {v.city}{v.region ? `, ${v.region}` : ""}
                          </span>
                        </div>
                        <div className="text-muted-foreground truncate">{v.ip}</div>
                      </div>
                      <span className="text-muted-foreground shrink-0 text-right">
                        {new Date(v.time).toLocaleString("ko-KR", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
