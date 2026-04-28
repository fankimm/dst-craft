"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { DetailPanel } from "@/components/ui/DetailPanel";
import {
  fetchFeedback,
  updateFeedbackStatus,
  type FeedbackItem,
  type FeedbackStatus,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "신규",
  done: "반영",
  hold: "보류",
  rejected: "리젝트",
};

const STATUS_DOT: Record<FeedbackStatus, string> = {
  new: "bg-blue-500",
  done: "bg-green-500",
  hold: "bg-yellow-500",
  rejected: "bg-red-500",
};

const STATUS_PILL: Record<FeedbackStatus, string> = {
  new: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  done: "bg-green-500/15 text-green-600 dark:text-green-400",
  hold: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const FILTERS: ("all" | FeedbackStatus)[] = ["all", "new", "done", "hold", "rejected"];

function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "\u{1F3F3}️";
  return String.fromCodePoint(
    0x1F1E6 + upper.charCodeAt(0) - 65,
    0x1F1E6 + upper.charCodeAt(1) - 65,
  );
}

const regionNames = new Intl.DisplayNames(["ko"], { type: "region" });
function countryName(code: string): string {
  const upper = code.toUpperCase();
  const ko = regionNames.of(upper);
  return ko && ko !== upper ? ko : upper;
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return "방금";
  if (diff < hour) return `${Math.floor(diff / min)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR");
}

export function AdminFeedbackSection() {
  const { token, isAdmin } = useAuth();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<"all" | FeedbackStatus>("all");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? items.find((x) => x.id === selectedId) ?? null : null;
  const { panelItem, panelOpen } = useDetailPanel(selected);
  const [copied, setCopied] = useState<"msg" | "ip" | null>(null);

  useEffect(() => {
    if (!isAdmin || !token) return;
    setLoading(true);
    fetchFeedback(token)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [isAdmin, token]);

  const handleStatusChange = useCallback(
    async (id: string, next: FeedbackStatus) => {
      if (!token) return;
      const prev = items;
      setItems((cur) => cur.map((fb) => (fb.id === id ? { ...fb, status: next } : fb)));
      const ok = await updateFeedbackStatus(token, id, next);
      if (!ok) setItems(prev);
    },
    [token, items],
  );

  const handleCopy = useCallback(async (text: string, kind: "msg" | "ip") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* ignore */
    }
  }, []);

  const isDev = process.env.NODE_ENV === "development";
  if (!isAdmin && !isDev) return null;

  const counts: Record<string, number> = {};
  for (const fb of items) counts[fb.status] = (counts[fb.status] ?? 0) + 1;
  const filtered = filter === "all" ? items : items.filter((fb) => fb.status === filter);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <MessageSquare className="size-4" />
        사용자 피드백
        <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
      </h2>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-border">
          {FILTERS.map((s) => {
            const active = filter === s;
            const label = s === "all" ? "전체" : STATUS_LABEL[s];
            const c = s === "all" ? items.length : counts[s] ?? 0;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface-hover",
                )}
              >
                {label}
                {c > 0 && <span className="ml-1 opacity-70">{c}</span>}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading && items.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            {items.length === 0 ? "피드백이 없습니다" : "해당 상태의 피드백이 없습니다"}
          </p>
        ) : (
          <ul className="divide-y divide-border max-h-[60dvh] overflow-y-auto">
            {filtered.map((fb) => {
              const status = fb.status ?? "new";
              return (
                <li key={fb.id ?? fb.time}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(fb.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-hover/50 transition-colors"
                  >
                    <span
                      className={cn("size-2 rounded-full shrink-0", STATUS_DOT[status])}
                      aria-label={STATUS_LABEL[status]}
                    />
                    <span className="flex-1 min-w-0 text-sm truncate">{fb.message}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                      {formatRelative(fb.time)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Detail panel */}
      <DetailPanel open={panelOpen} onClose={() => setSelectedId(null)}>
        {panelItem && (
          <div className="p-4 pt-8 space-y-4">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-medium",
                  STATUS_PILL[panelItem.status ?? "new"],
                )}
              >
                {STATUS_LABEL[panelItem.status ?? "new"]}
              </span>
              <span>{formatFull(panelItem.time)}</span>
              {panelItem.country && (
                <span>
                  {countryFlag(panelItem.country)} {countryName(panelItem.country)}
                </span>
              )}
            </div>

            {/* Message */}
            <div className="rounded-md border border-border/50 bg-surface/50 px-3 py-2.5 text-sm whitespace-pre-wrap break-words">
              {panelItem.message}
            </div>

            {/* IP */}
            {panelItem.ip && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">IP</span>
                <button
                  type="button"
                  onClick={() => handleCopy(panelItem.ip, "ip")}
                  className="flex items-center gap-1.5 font-mono text-foreground hover:text-muted-foreground transition-colors"
                >
                  {panelItem.ip}
                  {copied === "ip" ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}

            {/* Status change */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">상태 변경</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(STATUS_LABEL) as FeedbackStatus[]).map((s) => {
                  const active = (panelItem.status ?? "new") === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!panelItem.id}
                      onClick={() => panelItem.id && handleStatusChange(panelItem.id, s)}
                      className={cn(
                        "px-2 py-1.5 text-xs rounded-md border transition-colors",
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:bg-surface-hover",
                      )}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Copy message */}
            <button
              type="button"
              onClick={() => handleCopy(panelItem.message, "msg")}
              className="w-full flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-surface-hover transition-colors"
            >
              {copied === "msg" ? (
                <>
                  <Check className="size-3.5 text-green-500" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  메시지 복사
                </>
              )}
            </button>
          </div>
        )}
      </DetailPanel>
    </div>
  );
}
