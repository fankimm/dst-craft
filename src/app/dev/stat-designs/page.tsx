"use client";

import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const stats = [
  { icon: "ui/health.png", label: "체력", value: 40, formatted: "+40" },
  { icon: "ui/hunger.png", label: "배고픔", value: 150, formatted: "+150" },
  { icon: "ui/sanity.png", label: "정신력", value: -5, formatted: "-5" },
];

const stats2 = [
  { icon: "ui/health.png", label: "체력", value: 60, formatted: "+60" },
  { icon: "ui/hunger.png", label: "배고픔", value: 75, formatted: "+75" },
  { icon: "ui/sanity.png", label: "정신력", value: 33, formatted: "+33" },
];

const stats3 = [
  { icon: "ui/health.png", label: "체력", value: -3, formatted: "-3" },
  { icon: "ui/hunger.png", label: "배고픔", value: 25, formatted: "+25" },
  { icon: "ui/sanity.png", label: "정신력", value: 0, formatted: "0" },
];

function statColor(value: number): string {
  if (value > 0) return "text-green-600 dark:text-green-400";
  if (value < 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

// ---------------------------------------------------------------------------
// Design A: 현재 — 카드형 (세로 배치)
// ---------------------------------------------------------------------------

function DesignA({ data }: { data: typeof stats }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {data.map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-surface p-2.5 text-center">
          <img src={assetPath(`/images/${s.icon}`)} alt={s.label} className="size-6 mx-auto object-contain" />
          <div className={cn("text-sm font-semibold tabular-nums mt-1", statColor(s.value))}>{s.formatted}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Design B: 가로 인라인 — 아이콘+수치가 한 줄
// ---------------------------------------------------------------------------

function DesignB({ data }: { data: typeof stats }) {
  return (
    <div className="flex items-center justify-around rounded-lg border border-border bg-surface px-3 py-2.5">
      {data.map((s, i) => (
        <div key={s.label} className={cn("flex items-center gap-1.5", i > 0 && "border-l border-border pl-4")}>
          <img src={assetPath(`/images/${s.icon}`)} alt={s.label} className="size-5 object-contain" />
          <div>
            <div className={cn("text-sm font-semibold tabular-nums leading-tight", statColor(s.value))}>{s.formatted}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Design C: 바 형태 — 수치 + 프로그레스 바
// ---------------------------------------------------------------------------

const BAR_MAX = 150;

function DesignC({ data }: { data: typeof stats }) {
  return (
    <div className="space-y-2">
      {data.map((s) => {
        const pct = Math.min(100, (Math.abs(s.value) / BAR_MAX) * 100);
        const isNeg = s.value < 0;
        const isZero = s.value === 0;
        return (
          <div key={s.label} className="flex items-center gap-2">
            <img src={assetPath(`/images/${s.icon}`)} alt={s.label} className="size-5 object-contain shrink-0" />
            <span className="text-[11px] text-muted-foreground w-12 shrink-0">{s.label}</span>
            <div className="flex-1 h-4 rounded-full bg-muted/50 overflow-hidden relative">
              {!isZero && (
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isNeg ? "bg-red-500/70" : "bg-green-500/70"
                  )}
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>
            <span className={cn("text-sm font-semibold tabular-nums w-10 text-right shrink-0", statColor(s.value))}>
              {s.formatted}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const datasets = [
  { label: "미트볼 (양수+음수)", data: stats },
  { label: "피에로기 (전부 양수)", data: stats2 },
  { label: "꽃잎 샐러드 (음수+0)", data: stats3 },
];

export default function StatDesignsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 max-w-md mx-auto space-y-8">
      <h1 className="text-lg font-bold">스탯 디자인 비교</h1>

      {datasets.map((ds) => (
        <section key={ds.label} className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">{ds.label}</h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">A. 카드형 (현재)</p>
              <DesignA data={ds.data} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">B. 가로 인라인</p>
              <DesignB data={ds.data} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">C. 바 형태</p>
              <DesignC data={ds.data} />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
