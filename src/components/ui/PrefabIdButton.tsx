"use client";

import { useState, useCallback } from "react";

interface PrefabIdButtonProps {
  id: string;
  locale?: string;
}

export function PrefabIdButton({ id, locale = "ko" }: PrefabIdButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [id]);

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-mono border border-border rounded-full px-2 py-0.5"
    >
      <span className="opacity-60">$</span> {id}
      {copied && (
        <span className="text-green-500 font-sans text-[10px]">
          {locale === "ko" ? "복사됨" : "copied"}
        </span>
      )}
    </button>
  );
}
