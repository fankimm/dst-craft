"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MessageSquare, Copy, Check, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDetailPanel } from "@/hooks/use-detail-panel";
import { DetailPanel } from "@/components/ui/DetailPanel";
import {
  fetchFeedback,
  fetchPublicFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  toggleFeedbackHidden,
  type FeedbackItem,
  type FeedbackStatus,
  type PublicFeedbackItem,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type BoardItem = {
  id: string;
  message: string;
  time: string;
  status: FeedbackStatus;
  reply?: string | null;
  // Admin-only fields
  ip?: string;
  country?: string;
  hidden?: boolean;
};

const STATUS_LABEL_KO: Record<FeedbackStatus, string> = { new: "확인 중", done: "반영됨", hold: "보류", rejected: "미반영" };
const STATUS_LABEL_EN: Record<FeedbackStatus, string> = { new: "Pending", done: "Done", hold: "Hold", rejected: "Rejected" };
const STATUS_ADMIN: Record<FeedbackStatus, string> = { new: "신규", done: "반영", hold: "보류", rejected: "리젝트" };
const STATUS_DOT: Record<FeedbackStatus, string> = { new: "bg-blue-500", done: "bg-green-500", hold: "bg-yellow-500", rejected: "bg-red-500" };
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
  return String.fromCodePoint(0x1F1E6 + upper.charCodeAt(0) - 65, 0x1F1E6 + upper.charCodeAt(1) - 65);
}

const regionNames = new Intl.DisplayNames(["ko"], { type: "region" });
function countryName(code: string): string {
  const upper = code.toUpperCase();
  const ko = regionNames.of(upper);
  return ko && ko !== upper ? ko : upper;
}

function formatRelative(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = 60_000, hour = 60 * min, day = 24 * hour;
  if (diff < min) return "방금";
  if (diff < hour) return `${Math.floor(diff / min)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface Props {
  locale: Locale;
  onNewItem?: (item: PublicFeedbackItem) => void;
  newItem?: PublicFeedbackItem | null;
}

export function FeedbackBoard({ locale, newItem }: Props) {
  const { token, isAdmin } = useAuth();
  const [items, setItems] = useState<BoardItem[]>([]);
  const [filter, setFilter] = useState<"all" | FeedbackStatus>("all");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? items.find((x) => x.id === selectedId) ?? null : null;
  const { panelItem, panelOpen } = useDetailPanel(selected);
  const [copied, setCopied] = useState<"msg" | null>(null);
  const [replyText, setReplyText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isDev = process.env.NODE_ENV === "development";
  const showAdmin = isAdmin || isDev;

  useEffect(() => {
    setLoading(true);
    if (showAdmin && token) {
      fetchFeedback(token).then(setItems).finally(() => setLoading(false));
    } else {
      fetchPublicFeedback().then((pub) => setItems(pub as BoardItem[])).finally(() => setLoading(false));
    }
  }, [showAdmin, token]);

  // Add newly submitted item to the top
  useEffect(() => {
    if (!newItem) return;
    setItems((prev) => prev.some((x) => x.id === newItem.id) ? prev : [newItem as BoardItem, ...prev]);
  }, [newItem]);

  useEffect(() => {
    setConfirmDeleteId(null);
    const sel = selectedId ? items.find((x) => x.id === selectedId) : null;
    setReplyText(sel?.reply ?? "");
  }, [selectedId, items]);

  const myIds = useMemo(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("dst:my-feedback") ?? "[]") as string[]);
    } catch { return new Set<string>(); }
  }, []);

  const handleStatusChange = useCallback(async (id: string, next: FeedbackStatus) => {
    if (!token) return;
    const reply = replyText.trim() || undefined;
    const prev = items;
    setItems((cur) => cur.map((fb) => (fb.id === id ? { ...fb, status: next, reply: reply ?? fb.reply } : fb)));
    const ok = await updateFeedbackStatus(token, id, next, reply);
    if (!ok) setItems(prev);
  }, [token, items, replyText]);

  const handleDelete = useCallback(async (id: string) => {
    if (!token) return;
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    setDeleting(true);
    const ok = await deleteFeedback(token, id);
    setDeleting(false);
    if (ok) { setItems((cur) => cur.filter((fb) => fb.id !== id)); setSelectedId(null); setConfirmDeleteId(null); }
  }, [token, confirmDeleteId]);

  const handleToggleHidden = useCallback(async (id: string) => {
    if (!token) return;
    const item = items.find((fb) => fb.id === id);
    if (!item) return;
    const nextHidden = !item.hidden;
    setItems((cur) => cur.map((fb) => (fb.id === id ? { ...fb, hidden: nextHidden } : fb)));
    const ok = await toggleFeedbackHidden(token, id, nextHidden);
    if (!ok) setItems((cur) => cur.map((fb) => (fb.id === id ? { ...fb, hidden: !nextHidden } : fb)));
  }, [token, items]);

  const handleCopy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied("msg"); setTimeout(() => setCopied(null), 1200); } catch { /* ignore */ }
  }, []);

  const statusLabel = (s: FeedbackStatus) => locale === "ko" ? STATUS_LABEL_KO[s] : STATUS_LABEL_EN[s];
  const counts: Record<string, number> = {};
  for (const fb of items) counts[fb.status] = (counts[fb.status] ?? 0) + 1;
  const filtered = filter === "all" ? items : items.filter((fb) => fb.status === filter);

  if (items.length === 0 && !loading) return null;

  return (
    <div className="space-y-2">
      {/* Admin filters */}
      {showAdmin && (
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((s) => {
            const active = filter === s;
            const label = s === "all" ? (locale === "ko" ? "전체" : "All") : STATUS_ADMIN[s];
            const c = s === "all" ? items.length : counts[s] ?? 0;
            return (
              <button key={s} type="button" onClick={() => setFilter(s)} className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-hover",
              )}>
                {label}{c > 0 && <span className="ml-1 opacity-70">{c}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="py-4 text-center text-xs text-muted-foreground">{locale === "ko" ? "불러오는 중..." : "Loading..."}</p>
      ) : (
        <div className="space-y-2 max-h-[50dvh] overflow-y-auto">
          {filtered.map((fb) => (
            <div
              key={fb.id}
              className={cn(
                "rounded-lg border p-3 space-y-2 transition-colors",
                myIds.has(fb.id) ? "border-ring/40 bg-ring/5" : "border-border",
                fb.hidden && "opacity-50",
                showAdmin && "cursor-pointer hover:bg-surface-hover/50",
              )}
              {...(showAdmin ? { role: "button", onClick: () => setSelectedId(fb.id) } : {})}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {myIds.has(fb.id) && (
                    <span className="text-[10px] font-semibold text-ring block mb-0.5">
                      {locale === "ko" ? "내 피드백" : "Mine"}
                    </span>
                  )}
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">{fb.message}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {fb.hidden && <EyeOff className="size-3 text-muted-foreground" />}
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", STATUS_PILL[fb.status])}>
                    {statusLabel(fb.status)}
                  </span>
                </div>
              </div>
              {fb.reply && (
                <div className="rounded-md bg-surface border border-border/50 px-3 py-2 text-sm">
                  <span className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                    {locale === "ko" ? "개발자 답변" : "Developer Reply"}
                  </span>
                  <p className="text-foreground whitespace-pre-wrap">{fb.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin detail panel */}
      {showAdmin && (
        <DetailPanel open={panelOpen} onClose={() => setSelectedId(null)}>
          {panelItem && (
            <div className="p-4 pt-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", STATUS_PILL[panelItem.status ?? "new"])}>
                  {STATUS_ADMIN[panelItem.status ?? "new"]}
                </span>
                <span>{new Date(panelItem.time).toLocaleString("ko-KR")}</span>
                {panelItem.country && <span>{countryFlag(panelItem.country)} {countryName(panelItem.country)}</span>}
              </div>

              <div className="rounded-md border border-border/50 bg-surface/50 px-3 py-2.5 text-sm whitespace-pre-wrap break-words">
                {panelItem.message}
              </div>

              {panelItem.ip && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">IP</span>
                  <span className="font-mono text-foreground">{panelItem.ip}</span>
                </div>
              )}

              <div className="flex gap-1.5">
                <button type="button" onClick={() => handleCopy(panelItem.message)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-surface-hover transition-colors">
                  {copied === "msg" ? <><Check className="size-3.5 text-green-500" />복사됨</> : <><Copy className="size-3.5" />내용 복사</>}
                </button>
                <button type="button" onClick={() => panelItem.id && handleToggleHidden(panelItem.id)}
                  className={cn("flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs transition-colors",
                    panelItem.hidden ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : "border-border text-muted-foreground hover:bg-surface-hover")}>
                  {panelItem.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {panelItem.hidden ? "숨김" : "공개"}
                </button>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">답변 (사용자에게 표시)</p>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} maxLength={500} rows={2}
                  placeholder="답변을 입력하세요..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-base resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">상태 변경 (답변과 함께 저장)</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(STATUS_ADMIN) as FeedbackStatus[]).map((s) => (
                    <button key={s} type="button" disabled={!panelItem.id}
                      onClick={() => panelItem.id && handleStatusChange(panelItem.id, s)}
                      className={cn("px-2 py-1.5 text-xs rounded-md border transition-colors",
                        (panelItem.status ?? "new") === s ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-surface-hover")}>
                      {STATUS_ADMIN[s]}
                    </button>
                  ))}
                </div>
              </div>

              {panelItem.id && (
                <button type="button" disabled={deleting} onClick={() => handleDelete(panelItem.id)}
                  className={cn("w-full flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs transition-colors",
                    confirmDeleteId === panelItem.id ? "border-red-500 bg-red-500 text-white hover:bg-red-600" : "border-border text-muted-foreground hover:bg-surface-hover hover:text-red-500",
                    deleting && "opacity-50 cursor-wait")}>
                  <Trash2 className="size-3.5" />
                  {deleting ? "삭제 중..." : confirmDeleteId === panelItem.id ? "정말 삭제? (다시 클릭)" : "삭제"}
                </button>
              )}
            </div>
          )}
        </DetailPanel>
      )}
    </div>
  );
}
