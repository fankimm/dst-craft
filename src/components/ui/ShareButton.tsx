"use client";

import { useCallback } from "react";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  url: string;
  toastMessage?: string;
  className?: string;
}

/**
 * Copy a deep-link URL to clipboard and show a brief toast.
 * Falls back to navigator.share on supported devices.
 */
export function ShareButton({ url, toastMessage = "링크가 복사되었습니다", className }: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    const fullUrl = `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = fullUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    // Dispatch toast event for AppShell to pick up
    window.dispatchEvent(new CustomEvent("dst-toast", { detail: toastMessage }));
  }, [url, toastMessage]);

  return (
    <button
      onClick={handleShare}
      className={cn("p-0.5 rounded-full transition-colors shrink-0 text-muted-foreground hover:text-foreground", className)}
      aria-label="share"
    >
      <Link2 className="size-4" />
    </button>
  );
}
