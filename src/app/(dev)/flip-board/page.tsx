"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

const regionNames = new Intl.DisplayNames(["ko"], { type: "region" });
function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "\u{1F3F3}\uFE0F";
  return String.fromCodePoint(0x1F1E6 + upper.charCodeAt(0) - 65, 0x1F1E6 + upper.charCodeAt(1) - 65);
}
function countryName(code: string): string {
  const upper = code.toUpperCase();
  const ko = regionNames.of(upper);
  return ko && ko !== upper ? ko : upper;
}

const DUMMY_COUNTRIES = [
  { code: "KR", count: 563 },
  { code: "US", count: 401 },
  { code: "BR", count: 56 },
  { code: "DE", count: 44 },
  { code: "CA", count: 43 },
];

function CountryTicker({ items }: { items: { rank: number; flag: string; name: string; count: number }[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className="rounded-lg border border-border bg-card px-3 overflow-hidden h-9 relative">
      {items.map((item, i) => (
        <div
          key={item.rank}
          className={cn(
            "absolute inset-x-3 flex items-center gap-2 h-9 transition-all duration-500 ease-in-out",
            i === index && "translate-y-0 opacity-100",
            i !== index && "translate-y-full opacity-0",
          )}
        >
          <span className="text-xs font-bold text-muted-foreground w-4 text-right">{item.rank}</span>
          <span className="text-sm">{item.flag}</span>
          <span className="text-sm font-medium truncate">{item.name}</span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground tabular-nums">{item.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function FlipBoardDevPage() {
  const items = DUMMY_COUNTRIES.map((c, i) => ({
    rank: i + 1,
    flag: countryFlag(c.code),
    name: countryName(c.code),
    count: c.count,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-md mx-auto space-y-8">
      <h1 className="text-lg font-bold">국가 티커 미리보기</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="size-4" />
          접속 국가 TOP 5
        </h2>
        <CountryTicker items={items} />
      </section>
    </div>
  );
}
