"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

interface SortDropdownProps {
  value: "default" | "popular";
  onChange: (v: "default" | "popular") => void;
  locale: Locale;
}

export function SortDropdown({ value, onChange, locale }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const options = [
    { key: "default" as const, label: t(locale, "sort_default") },
    { key: "popular" as const, label: t(locale, "sort_popular") },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
          value === "popular"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <ArrowUpDown className="size-3.5" />
        {options.find((o) => o.key === value)!.label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[100px] rounded-md border border-border bg-popover shadow-md py-1">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                value === opt.key
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-popover-foreground hover:bg-accent/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
